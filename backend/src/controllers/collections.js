import pool from "../db.js";
import { registrarActividad } from "../utils/actividad.js";
import { parsearId } from "../utils/parsearId.js";

const LARGO_MAXIMO_NOMBRE = 100;
const LARGO_MAXIMO_DESCRIPCION = 300;

function validarPlaylist(nombre, descripcion) {
  if (typeof nombre !== "string" || !nombre) {
    return "La playlist tiene que tener un nombre";
  }

  if (nombre.length > LARGO_MAXIMO_NOMBRE) {
    return `El nombre puede tener hasta ${LARGO_MAXIMO_NOMBRE} caracteres`;
  }

  if (descripcion !== null && typeof descripcion !== "string") {
    return "La descripción no es válida";
  }

  if (descripcion && descripcion.length > LARGO_MAXIMO_DESCRIPCION) {
    return `La descripción puede tener hasta ${LARGO_MAXIMO_DESCRIPCION} caracteres`;
  }

  return null;
}

function limpiarDescripcion(descripcion) {
  return typeof descripcion === "string" ? descripcion.trim() || null : descripcion ?? null;
}

async function buscarPlaylist(id, usuarioId) {
  const resultado = await pool.query(
    "SELECT id, nombre, descripcion, created_at FROM colecciones WHERE id = $1 AND usuario_id = $2",
    [id, usuarioId]
  );
  return resultado.rows[0] ?? null;
}

export async function getCollections(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT c.id, c.nombre, c.descripcion, c.created_at,
              COUNT(cc.biblioteca_id)::int AS cantidad
       FROM colecciones c
       LEFT JOIN coleccion_canciones cc ON cc.coleccion_id = c.id
       WHERE c.usuario_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.usuario.id]
    );

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las playlists" });
  }
}

export async function getCollection(req, res) {
  const id = parsearId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "La playlist no es válida" });
  }

  try {
    const playlist = await buscarPlaylist(id, req.usuario.id);

    if (!playlist) {
      return res.status(404).json({ error: "No encontramos esa playlist" });
    }

    const canciones = await pool.query(
      `SELECT b.id, b.track_id, b.titulo, b.artista, b.album, b.portada_url, b.genero, b.anio,
              b.estado, b.favorito, b.puntuacion
       FROM coleccion_canciones cc
       JOIN biblioteca b ON b.id = cc.biblioteca_id
       WHERE cc.coleccion_id = $1
       ORDER BY b.titulo`,
      [id]
    );

    res.json({ ...playlist, canciones: canciones.rows });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la playlist" });
  }
}

export async function createCollection(req, res) {
  const nombre = typeof req.body?.nombre === "string" ? req.body.nombre.trim() : req.body?.nombre;
  const descripcion = limpiarDescripcion(req.body?.descripcion);
  const error = validarPlaylist(nombre, descripcion);

  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO colecciones (usuario_id, nombre, descripcion)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, descripcion, created_at`,
      [req.usuario.id, nombre, descripcion]
    );

    await registrarActividad(req.usuario.id, "crear_playlist", nombre);
    res.status(201).json({ ...resultado.rows[0], cantidad: 0 });
  } catch (err) {
    res.status(500).json({ error: "Error al crear la playlist" });
  }
}

export async function updateCollection(req, res) {
  const id = parsearId(req.params.id);
  const cambios = req.body ?? {};

  if (!id) {
    return res.status(400).json({ error: "La playlist no es válida" });
  }

  try {
    const actual = await buscarPlaylist(id, req.usuario.id);

    if (!actual) {
      return res.status(404).json({ error: "No encontramos esa playlist" });
    }

    let nombre = actual.nombre;
    if (cambios.nombre !== undefined) {
      nombre = typeof cambios.nombre === "string" ? cambios.nombre.trim() : cambios.nombre;
    }
    const descripcion = cambios.descripcion !== undefined ? limpiarDescripcion(cambios.descripcion) : actual.descripcion;
    const error = validarPlaylist(nombre, descripcion);

    if (error) {
      return res.status(400).json({ error });
    }

    const resultado = await pool.query(
      `UPDATE colecciones SET nombre = $1, descripcion = $2
       WHERE id = $3 AND usuario_id = $4
       RETURNING id, nombre, descripcion, created_at`,
      [nombre, descripcion, id, req.usuario.id]
    );

    await registrarActividad(req.usuario.id, "editar_playlist", nombre);
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al editar la playlist" });
  }
}

export async function deleteCollection(req, res) {
  const id = parsearId(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "La playlist no es válida" });
  }

  try {
    const resultado = await pool.query(
      "DELETE FROM colecciones WHERE id = $1 AND usuario_id = $2 RETURNING nombre",
      [id, req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "No encontramos esa playlist" });
    }

    await registrarActividad(req.usuario.id, "borrar_playlist", resultado.rows[0].nombre);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Error al borrar la playlist" });
  }
}

export async function addItem(req, res) {
  const id = parsearId(req.params.id);
  const bibliotecaId = parsearId(req.body?.biblioteca_id);

  if (!id || !bibliotecaId) {
    return res.status(400).json({ error: "La playlist o la canción no son válidas" });
  }

  try {
    const playlist = await buscarPlaylist(id, req.usuario.id);

    if (!playlist) {
      return res.status(404).json({ error: "No encontramos esa playlist" });
    }

    const cancion = await pool.query("SELECT titulo FROM biblioteca WHERE id = $1 AND usuario_id = $2", [
      bibliotecaId,
      req.usuario.id,
    ]);

    if (cancion.rows.length === 0) {
      return res.status(404).json({ error: "La canción no está en tu biblioteca" });
    }

    const resultado = await pool.query(
      `INSERT INTO coleccion_canciones (coleccion_id, biblioteca_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, bibliotecaId]
    );

    if (resultado.rowCount === 0) {
      return res.status(409).json({ error: "La canción ya está en esta playlist" });
    }

    await registrarActividad(
      req.usuario.id,
      "agregar_a_playlist",
      `${cancion.rows[0].titulo} → ${playlist.nombre}`
    );
    res.status(201).json({ coleccion_id: id, biblioteca_id: bibliotecaId });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar la canción a la playlist" });
  }
}

export async function removeItem(req, res) {
  const id = parsearId(req.params.id);
  const bibliotecaId = parsearId(req.params.itemId);

  if (!id || !bibliotecaId) {
    return res.status(400).json({ error: "La playlist o la canción no son válidas" });
  }

  try {
    const playlist = await buscarPlaylist(id, req.usuario.id);

    if (!playlist) {
      return res.status(404).json({ error: "No encontramos esa playlist" });
    }

    const resultado = await pool.query(
      `DELETE FROM coleccion_canciones cc
       USING biblioteca b
       WHERE cc.coleccion_id = $1 AND cc.biblioteca_id = $2 AND b.id = cc.biblioteca_id
       RETURNING b.titulo`,
      [id, bibliotecaId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "La canción no está en esta playlist" });
    }

    await registrarActividad(
      req.usuario.id,
      "quitar_de_playlist",
      `${resultado.rows[0].titulo} → ${playlist.nombre}`
    );
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Error al quitar la canción de la playlist" });
  }
}
