import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import AuthLayout from "../components/AuthLayout.jsx";

export default function Login() {
  const { usuario, cargando, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    if (!email.trim()) {
      nuevosErrores.email = "Ingresá tu correo electrónico";
    }

    if (!password) {
      nuevosErrores.password = "Ingresá tu contraseña";
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
      await login(email, password);
      navigate("/");
    } catch (err) {
      setErrorGeneral(err.response?.data?.error || "No se pudo conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout discos={["marron", "naranja", "verde"]}>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div>
          <h2 className="auth-form-titulo">Bienvenido de nuevo</h2>
          <p className="auth-form-subtitulo">Ingresá a tu biblioteca musical.</p>
        </div>

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

        {errorGeneral && <p className="auth-error">{errorGeneral}</p>}

        <button type="submit" className="auth-boton" disabled={enviando}>
          {enviando ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <p className="auth-link">
          ¿No tenés una cuenta? <Link to="/register">Registrate</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
