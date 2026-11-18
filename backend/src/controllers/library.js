import pool from "../db.js";
import { registrarActividad } from "../utils/actividad.js";

const ESTADOS_VALIDOS = ["quiero_escuchar", "escuchando", "escuchado"];

export async function getLibrary(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT id, track_id, titulo, artista, album, portada_url, genero, anio,
              estado, favorito, puntuacion, created_at
       FROM biblioteca
       WHERE usuario_id = $1
       ORDER BY created_at DESC`,
      [req.usuario.id]
    );

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la biblioteca" });
  }
}

export async function addToLibrary(req, res) {
  const {
    track_id,
    titulo,
    artista,
    album,
    portada_url,
    genero,
    anio,
  } = req.body ?? {};

  if (!Number.isSafeInteger(track_id) || track_id <= 0) {
    return res.status(400).json({ error: "El track_id no es válido" });
  }

  if (!titulo || !artista) {
    return res.status(400).json({ error: "Título y artista son obligatorios" });
  }

  if (anio !== undefined && anio !== null && (!Number.isInteger(anio) || anio < 0)) {
    return res.status(400).json({ error: "El año no es válido" });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO biblioteca
       (usuario_id, track_id, titulo, artista, album, portada_url, genero, anio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, track_id, titulo, artista, album, portada_url, genero, anio,
                 estado, favorito, puntuacion, created_at`,
      [
        req.usuario.id,
        track_id,
        titulo.trim(),
        artista.trim(),
        album?.trim() || null,
        portada_url?.trim() || null,
        genero?.trim() || null,
        anio ?? null,
      ]
    );

    await registrarActividad(req.usuario.id, "agregar_cancion", titulo.trim());
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "La canción ya está en la biblioteca" });
    }

    res.status(500).json({ error: "Error al agregar la canción" });
  }
}

export async function updateLibraryItem(req, res) {
  const { id } = req.params;
  const { estado, favorito, puntuacion } = req.body ?? {};

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: "El id no es válido" });
  }

  if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: "El estado no es válido" });
  }

  if (favorito !== undefined && typeof favorito !== "boolean") {
    return res.status(400).json({ error: "El favorito no es válido" });
  }

  if (puntuacion !== undefined && puntuacion !== null && (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5)) {
    return res.status(400).json({ error: "La puntuación debe estar entre 1 y 5" });
  }

  if (estado === undefined && favorito === undefined && puntuacion === undefined) {
    return res.status(400).json({ error: "No se indicó ningún cambio" });
  }

  try {
    const existente = await pool.query(
      "SELECT id, titulo, estado, favorito, puntuacion FROM biblioteca WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );

    if (existente.rows.length === 0) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }

    const resultado = await pool.query(
      `UPDATE biblioteca
       SET estado = COALESCE($1, estado),
           favorito = COALESCE($2, favorito),
           puntuacion = CASE WHEN $3 THEN NULL ELSE COALESCE($4, puntuacion) END
       WHERE id = $5 AND usuario_id = $6
       RETURNING id, track_id, titulo, artista, album, portada_url, genero, anio,
                 estado, favorito, puntuacion, created_at`,
      [
        estado ?? null,
        favorito ?? null,
        puntuacion === null,
        puntuacion ?? null,
        id,
        req.usuario.id,
      ]
    );

    const actual = resultado.rows[0];

    if (estado !== undefined && estado !== existente.rows[0].estado) {
      await registrarActividad(req.usuario.id, "cambiar_estado", `${actual.titulo}: ${estado}`);
    }

    if (favorito !== undefined && favorito !== existente.rows[0].favorito) {
      await registrarActividad(req.usuario.id, "favorito", actual.titulo);
    }

    if (puntuacion !== undefined && puntuacion !== existente.rows[0].puntuacion) {
      const referencia = puntuacion === null ? actual.titulo : `${actual.titulo}: ${puntuacion}/5`;
      await registrarActividad(req.usuario.id, "puntuar", referencia);
    }

    res.json(actual);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la canción" });
  }
}

export async function deleteLibraryItem(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ error: "El id no es válido" });
  }

  try {
    const resultado = await pool.query(
      `DELETE FROM biblioteca
       WHERE id = $1 AND usuario_id = $2
       RETURNING titulo`,
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Canción no encontrada" });
    }

    await registrarActividad(req.usuario.id, "quitar_cancion", resultado.rows[0].titulo);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error al quitar la canción" });
  }
}
