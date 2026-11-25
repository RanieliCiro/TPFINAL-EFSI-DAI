import pool from "../db.js";

const LARGO_MAXIMO_REFERENCIA = 255;

export async function registrarActividad(usuarioId, tipo, referencia) {
  try {
    await pool.query("INSERT INTO actividad (usuario_id, tipo, referencia) VALUES ($1, $2, $3)", [
      usuarioId,
      tipo,
      referencia.slice(0, LARGO_MAXIMO_REFERENCIA),
    ]);
  } catch (error) {
    console.error("No se pudo registrar la actividad:", error.message);
  }
}
