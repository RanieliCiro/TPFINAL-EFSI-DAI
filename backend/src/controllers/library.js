import pool from "../db.js";

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
