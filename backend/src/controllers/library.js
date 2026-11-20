import pool from "../db.js";
import { registrarActividad } from "../utils/actividad.js";
import { parsearId } from "../utils/parsearId.js";

const ESTADOS = ["quiero_escuchar", "escuchando", "escuchado"];
const PUNTUACION_MINIMA = 1;
const PUNTUACION_MAXIMA = 5;
const LARGO_MAXIMO_TEXTO = 255;
const LARGO_MAXIMO_GENERO = 100;

function validarCancion({ titulo, artista, album, portada_url, genero, anio }) {
  if (typeof titulo !== "string" || !titulo.trim() || typeof artista !== "string" || !artista.trim()) {
    return "La canción tiene que tener título y artista";
  }

  const opcionales = [album, portada_url, genero];
  if (opcionales.some((valor) => valor !== undefined && valor !== null && typeof valor !== "string")) {
    return "Los datos de la canción no son válidos";
  }

  const textosLargos = [titulo, artista, album].some((valor) => valor && valor.length > LARGO_MAXIMO_TEXTO);
  if (textosLargos || (genero && genero.length > LARGO_MAXIMO_GENERO)) {
    return "Los datos de la canción son demasiado largos";
  }

  if (anio !== undefined && anio !== null && !Number.isInteger(anio)) {
    return "El año no es válido";
  }

  return null;
}

function puntuacionValida(puntuacion) {
  return Number.isInteger(puntuacion) && puntuacion >= PUNTUACION_MINIMA && puntuacion <= PUNTUACION_MAXIMA;
}

export async function getLibrary(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT b.id, b.track_id, b.titulo, b.artista, b.album, b.portada_url, b.genero, b.anio,
              b.estado, b.favorito, b.puntuacion, b.created_at, r.texto AS resena
       FROM biblioteca b
       LEFT JOIN resenas r ON r.biblioteca_id = b.id
       WHERE b.usuario_id = $1
       ORDER BY b.created_at DESC`,
      [req.usuario.id]
    );

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la biblioteca" });
  }
}

export async function addToLibrary(req, res) {
  const datos = req.body ?? {};
  const trackId = parsearId(datos.track_id);

  if (!trackId) {
    return res.status(400).json({ error: "La canción no es válida" });
  }

  const error = validarCancion(datos);

  if (error) {
    return res.status(400).json({ error });
  }

  const titulo = datos.titulo.trim();

  try {
    const resultado = await pool.query(
      `INSERT INTO biblioteca (usuario_id, track_id, titulo, artista, album, portada_url, genero, anio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (usuario_id, track_id) DO NOTHING
       RETURNING id, track_id, titulo, artista, album, portada_url, genero, anio,
                 estado, favorito, puntuacion, created_at`,
      [
        req.usuario.id,
        trackId,
        titulo,
        datos.artista.trim(),
        datos.album || null,
        datos.portada_url || null,
        datos.genero || null,
        datos.anio ?? null,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(409).json({ error: "La canción ya está en tu biblioteca" });
    }

    await registrarActividad(req.usuario.id, "agregar_cancion", titulo);
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar la canción" });
  }
}

export async function updateLibraryItem(req, res) {
  const id = parsearId(req.params.id);
  const cambios = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: "La canción no es válida" });
  }

  if (cambios.estado !== undefined && !ESTADOS.includes(cambios.estado)) {
    return res.status(400).json({ error: "El estado no es válido" });
  }

  if (cambios.favorito !== undefined && typeof cambios.favorito !== "boolean") {
    return res.status(400).json({ error: "El favorito tiene que ser verdadero o falso" });
  }

  if (cambios.puntuacion !== undefined && cambios.puntuacion !== null && !puntuacionValida(cambios.puntuacion)) {
    return res.status(400).json({ error: "La puntuación tiene que ser de 1 a 5" });
  }

  try {
    const actual = await pool.query("SELECT * FROM biblioteca WHERE id = $1 AND usuario_id = $2", [
      id,
      req.usuario.id,
    ]);

    if (actual.rows.length === 0) {
      return res.status(404).json({ error: "La canción no está en tu biblioteca" });
    }

    const anterior = actual.rows[0];
    const estado = cambios.estado ?? anterior.estado;
    const favorito = cambios.favorito ?? anterior.favorito;
    const puntuacion = cambios.puntuacion !== undefined ? cambios.puntuacion : anterior.puntuacion;

    const resultado = await pool.query(
      `UPDATE biblioteca SET estado = $1, favorito = $2, puntuacion = $3
       WHERE id = $4 AND usuario_id = $5
       RETURNING id, track_id, titulo, artista, album, portada_url, genero, anio,
                 estado, favorito, puntuacion, created_at`,
      [estado, favorito, puntuacion, id, req.usuario.id]
    );

    if (estado !== anterior.estado) {
      await registrarActividad(req.usuario.id, "cambiar_estado", anterior.titulo);
    }

    if (favorito && !anterior.favorito) {
      await registrarActividad(req.usuario.id, "favorito", anterior.titulo);
    }

    if (puntuacion && puntuacion !== anterior.puntuacion) {
      await registrarActividad(req.usuario.id, "puntuar", anterior.titulo);
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la canción" });
  }
}

export async function removeFromLibrary(req, res) {
  const id = parsearId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "La canción no es válida" });
  }

  try {
    const resultado = await pool.query(
      "DELETE FROM biblioteca WHERE id = $1 AND usuario_id = $2 RETURNING titulo",
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "La canción no está en tu biblioteca" });
    }

    await registrarActividad(req.usuario.id, "quitar_cancion", resultado.rows[0].titulo);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Error al quitar la canción" });
  }
}
