import pool from "../db.js";

const LIMITE_RANKING = 5;

export async function getStats(req, res) {
  const usuarioId = req.usuario.id;

  try {
    const [resumen, playlists, generos, topArtistas, mejorPuntuadas, actividadPorMes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS total_guardadas,
                COUNT(*) FILTER (WHERE favorito)::int AS favoritas,
                COUNT(*) FILTER (WHERE estado = 'escuchado')::int AS escuchadas,
                ROUND(AVG(puntuacion), 1)::float AS promedio_puntuacion
         FROM biblioteca
         WHERE usuario_id = $1`,
        [usuarioId]
      ),
      pool.query("SELECT COUNT(*)::int AS cantidad FROM colecciones WHERE usuario_id = $1", [usuarioId]),
      pool.query(
        `SELECT genero, COUNT(*)::int AS cantidad
         FROM biblioteca
         WHERE usuario_id = $1 AND genero IS NOT NULL
         GROUP BY genero
         ORDER BY cantidad DESC`,
        [usuarioId]
      ),
      pool.query(
        `SELECT artista, COUNT(*)::int AS cantidad
         FROM biblioteca
         WHERE usuario_id = $1
         GROUP BY artista
         ORDER BY cantidad DESC
         LIMIT $2`,
        [usuarioId, LIMITE_RANKING]
      ),
      pool.query(
        `SELECT id, titulo, artista, portada_url, puntuacion
         FROM biblioteca
         WHERE usuario_id = $1 AND puntuacion IS NOT NULL
         ORDER BY puntuacion DESC, created_at DESC
         LIMIT $2`,
        [usuarioId, LIMITE_RANKING]
      ),
      pool.query(
        `SELECT TO_CHAR(created_at, 'YYYY-MM') AS mes, COUNT(*)::int AS cantidad
         FROM actividad
         WHERE usuario_id = $1
         GROUP BY mes
         ORDER BY mes`,
        [usuarioId]
      ),
    ]);

    res.json({
      ...resumen.rows[0],
      playlists: playlists.rows[0].cantidad,
      generos: generos.rows,
      top_artistas: topArtistas.rows,
      mejor_puntuadas: mejorPuntuadas.rows,
      actividad_por_mes: actividadPorMes.rows,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las estadísticas" });
  }
}
