import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RONDAS_HASH = 10;

function crearToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function esTextoConValor(valor) {
  return typeof valor === "string" && valor.length > 0;
}

export async function register(req, res) {
  const { username, email, password, confirmPassword } = req.body ?? {};

  if (
    !esTextoConValor(username) ||
    !esTextoConValor(email) ||
    !esTextoConValor(password) ||
    !esTextoConValor(confirmPassword)
  ) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const usernameLimpio = username.trim();
  const emailLimpio = email.trim().toLowerCase();

  if (usernameLimpio.length < 3 || usernameLimpio.length > 30) {
    return res.status(400).json({ error: "El usuario debe tener entre 3 y 30 caracteres" });
  }

  if (!EMAIL_REGEX.test(emailLimpio)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Las contraseñas no coinciden" });
  }

  try {
    const existentes = await pool.query(
      "SELECT username, email FROM usuarios WHERE username = $1 OR email = $2",
      [usernameLimpio, emailLimpio]
    );

    if (existentes.rows.length > 0) {
      const emailEnUso = existentes.rows.some((fila) => fila.email === emailLimpio);
      const mensaje = emailEnUso ? "El email ya está registrado" : "El usuario ya está en uso";
      return res.status(409).json({ error: mensaje });
    }

    const passwordHash = await bcrypt.hash(password, RONDAS_HASH);

    const resultado = await pool.query(
      `INSERT INTO usuarios (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, avatar, bio, preferencias, created_at`,
      [usernameLimpio, emailLimpio, passwordHash]
    );

    const usuario = resultado.rows[0];
    res.status(201).json({ token: crearToken(usuario.id), usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el usuario" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};

  if (!esTextoConValor(email) || !esTextoConValor(password)) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, username, email, avatar, bio, preferencias, created_at, password_hash
       FROM usuarios WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    const encontrado = resultado.rows[0];
    const passwordOk = encontrado && (await bcrypt.compare(password, encontrado.password_hash));

    if (!passwordOk) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const { password_hash, ...usuario } = encontrado;
    res.json({ token: crearToken(usuario.id), usuario });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

export async function me(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT id, username, email, avatar, bio, preferencias, created_at
       FROM usuarios WHERE id = $1`,
      [req.usuario.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
}
