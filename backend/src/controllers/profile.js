import pool from "../db.js";
import { registrarActividad } from "../utils/actividad.js";

const GENEROS_DISPONIBLES = ["Pop", "Indie", "Rock alternativo", "Electrónica", "Hip hop", "Jazz"];

const LIMITE_FAVORITOS = 8;
const LIMITE_ACTIVIDAD = 5;
const LARGO_MAXIMO_BIO = 300;
const BYTES_MAXIMOS_AVATAR = 2 * 1024 * 1024;
const AVATAR_REGEX = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/;
const COLUMNAS_USUARIO = "id, username, email, avatar, bio, preferencias, created_at";

function tamanioBase64(base64) {
  const relleno = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return (base64.length * 3) / 4 - relleno;
}

export async function getProfile(req, res) {
  try {
    const [usuario, favoritos, actividad] = await Promise.all([
      pool.query(`SELECT ${COLUMNAS_USUARIO} FROM usuarios WHERE id = $1`, [req.usuario.id]),
      pool.query(
        `SELECT id, track_id, titulo, artista, album, portada_url
         FROM biblioteca
         WHERE usuario_id = $1 AND favorito = TRUE
         ORDER BY created_at DESC
         LIMIT $2`,
        [req.usuario.id, LIMITE_FAVORITOS]
      ),
      pool.query(
        `SELECT id, tipo, referencia, created_at
         FROM actividad
         WHERE usuario_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [req.usuario.id, LIMITE_ACTIVIDAD]
      ),
    ]);

    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      usuario: usuario.rows[0],
      favoritos: favoritos.rows,
      actividad: actividad.rows,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
}

export async function updateProfile(req, res) {
  const { username, bio, preferencias, avatar } = req.body ?? {};

  if (typeof username !== "string") {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  const usernameLimpio = username.trim();
  if (usernameLimpio.length < 3 || usernameLimpio.length > 30) {
    return res.status(400).json({ error: "El nombre debe tener entre 3 y 30 caracteres" });
  }

  if (bio !== undefined && bio !== null && typeof bio !== "string") {
    return res.status(400).json({ error: "La bio no es válida" });
  }

  const bioLimpia = bio?.trim() || null;
  if (bioLimpia && bioLimpia.length > LARGO_MAXIMO_BIO) {
    return res.status(400).json({ error: `La bio puede tener hasta ${LARGO_MAXIMO_BIO} caracteres` });
  }

  const generos = preferencias ?? [];
  if (!Array.isArray(generos) || generos.some((genero) => !GENEROS_DISPONIBLES.includes(genero))) {
    return res.status(400).json({ error: "Los géneros elegidos no son válidos" });
  }
  const generosUnicos = GENEROS_DISPONIBLES.filter((genero) => generos.includes(genero));

  if (avatar !== undefined && avatar !== null) {
    const coincidencia = typeof avatar === "string" ? avatar.match(AVATAR_REGEX) : null;

    if (!coincidencia) {
      return res.status(400).json({ error: "La foto tiene que ser JPG o PNG" });
    }

    if (tamanioBase64(coincidencia[2]) > BYTES_MAXIMOS_AVATAR) {
      return res.status(400).json({ error: "La foto puede pesar hasta 2 MB" });
    }
  }

  try {
    const repetido = await pool.query(
      "SELECT id FROM usuarios WHERE username = $1 AND id <> $2",
      [usernameLimpio, req.usuario.id]
    );

    if (repetido.rows.length > 0) {
      return res.status(409).json({ error: "El nombre ya está en uso" });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
       SET username = $1,
           bio = $2,
           preferencias = $3,
           avatar = CASE WHEN $4::boolean THEN $5 ELSE avatar END
       WHERE id = $6
       RETURNING ${COLUMNAS_USUARIO}`,
      [
        usernameLimpio,
        bioLimpia,
        generosUnicos.length > 0 ? generosUnicos.join(",") : null,
        avatar !== undefined,
        avatar ?? null,
        req.usuario.id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await registrarActividad(req.usuario.id, "editar_perfil", "");
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
}
