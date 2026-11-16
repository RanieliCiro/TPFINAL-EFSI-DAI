import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { usuario, cargando, register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (cargando) {
    return <Loader />;
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  function validar() {
    const nuevosErrores = {};

    if (username.trim().length < 3 || username.trim().length > 30) {
      nuevosErrores.username = "El usuario debe tener entre 3 y 30 caracteres";
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      nuevosErrores.email = "Ingresá un correo electrónico válido";
    }

    if (password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    return nuevosErrores;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorGeneral("");

    const nuevosErrores = validar();
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setEnviando(true);
    try {
      await register(username, email, password, confirmPassword);
      navigate("/");
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || "No se pudo conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout discos={["naranja", "verde", "violeta"]}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div>
          <h2 className="auth-form-titulo">Creá tu cuenta</h2>
          <p className="auth-form-subtitulo">Empezá a organizar tu música.</p>
        </div>

        <label className="auth-campo">
          <span className="auth-label">Nombre de usuario</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
          {errores.username && <span className="auth-error">{errores.username}</span>}
        </label>

        <label className="auth-campo">
          <span className="auth-label">Correo electrónico</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errores.email && <span className="auth-error">{errores.email}</span>}
        </label>

        <label className="auth-campo">
          <span className="auth-label">Contraseña</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errores.password && <span className="auth-error">{errores.password}</span>}
        </label>

        <label className="auth-campo">
          <span className="auth-label">Confirmar contraseña</span>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errores.confirmPassword && <span className="auth-error">{errores.confirmPassword}</span>}
        </label>

        {errorGeneral && <p className="auth-error">{errorGeneral}</p>}

        <button type="submit" className="auth-boton" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="auth-link">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
