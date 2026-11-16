import pool from "../db.js";

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
