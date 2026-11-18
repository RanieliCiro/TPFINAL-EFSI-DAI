import pool from "../db.js";

export async function registrarActividad(usuarioId, tipo, referencia) {
  await pool.query(
    `INSERT INTO actividad (usuario_id, tipo, referencia)
     VALUES ($1, $2, $3)`,
    [usuarioId, tipo, referencia]
  );
}
