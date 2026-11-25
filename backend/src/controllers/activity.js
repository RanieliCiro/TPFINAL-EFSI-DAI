import pool from "../db.js";

const LIMITE_ACTIVIDAD = 20;

export async function getActivity(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT id, tipo, referencia, created_at
       FROM actividad
       WHERE usuario_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.usuario.id, LIMITE_ACTIVIDAD]
    );

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la actividad" });
  }
}
