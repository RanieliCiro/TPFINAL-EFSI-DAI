import pool from "../db.js";
import { registrarActividad } from "../utils/actividad.js";
import { parsearId } from "../utils/parsearId.js";

const LARGO_MAXIMO_RESENA = 2000;

function validarTexto(texto) {
  if (typeof texto !== "string" || !texto.trim()) {
    return "La reseña no puede estar vacía";
  }

  if (texto.trim().length > LARGO_MAXIMO_RESENA) {
    return `La reseña puede tener hasta ${LARGO_MAXIMO_RESENA} caracteres`;
  }

  return null;
}

export async function getReviews(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT r.id, r.biblioteca_id, r.texto, r.created_at, r.updated_at,
              b.track_id, b.titulo, b.artista, b.portada_url
       FROM resenas r
       JOIN biblioteca b ON b.id = r.biblioteca_id
       WHERE r.usuario_id = $1
       ORDER BY r.updated_at DESC`,
      [req.usuario.id]
    );

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las reseñas" });
  }
}

export async function createReview(req, res) {
  const bibliotecaId = parsearId(req.body?.biblioteca_id);
  const error = validarTexto(req.body?.texto);

  if (!bibliotecaId) {
    return res.status(400).json({ error: "La canción no es válida" });
  }

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const cancion = await pool.query("SELECT titulo FROM biblioteca WHERE id = $1 AND usuario_id = $2", [
      bibliotecaId,
      req.usuario.id,
    ]);

    if (cancion.rows.length === 0) {
      return res.status(404).json({ error: "La canción no está en tu biblioteca" });
    }

    const resultado = await pool.query(
      `INSERT INTO resenas (usuario_id, biblioteca_id, texto)
       VALUES ($1, $2, $3)
       ON CONFLICT (biblioteca_id) DO NOTHING
       RETURNING id, biblioteca_id, texto, created_at, updated_at`,
      [req.usuario.id, bibliotecaId, req.body.texto.trim()]
    );

    if (resultado.rows.length === 0) {
      return res.status(409).json({ error: "Ya escribiste una reseña de esta canción" });
    }

    await registrarActividad(req.usuario.id, "crear_resena", cancion.rows[0].titulo);
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al guardar la reseña" });
  }
}

export async function updateReview(req, res) {
  const id = parsearId(req.params.id);
  const error = validarTexto(req.body?.texto);

  if (!id) {
    return res.status(400).json({ error: "La reseña no es válida" });
  }

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const resultado = await pool.query(
      `UPDATE resenas r SET texto = $1, updated_at = NOW()
       FROM biblioteca b
       WHERE r.id = $2 AND r.usuario_id = $3 AND b.id = r.biblioteca_id
       RETURNING r.id, r.biblioteca_id, r.texto, r.created_at, r.updated_at, b.titulo`,
      [req.body.texto.trim(), id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "No encontramos esa reseña" });
    }

    const { titulo, ...resena } = resultado.rows[0];
    await registrarActividad(req.usuario.id, "editar_resena", titulo);
    res.json(resena);
  } catch (err) {
    res.status(500).json({ error: "Error al editar la reseña" });
  }
}

export async function deleteReview(req, res) {
  const id = parsearId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "La reseña no es válida" });
  }

  try {
    const resultado = await pool.query(
      `DELETE FROM resenas r
       USING biblioteca b
       WHERE r.id = $1 AND r.usuario_id = $2 AND b.id = r.biblioteca_id
       RETURNING b.titulo`,
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "No encontramos esa reseña" });
    }

    await registrarActividad(req.usuario.id, "borrar_resena", resultado.rows[0].titulo);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Error al borrar la reseña" });
  }
}
