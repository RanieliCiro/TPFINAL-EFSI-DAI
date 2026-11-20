import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import "./NotFound.css";

export default function NotFound() {
  return (
    <AuthLayout discos={["violeta", "terracota", "azul"]}>
      <div className="not-found">
        <p className="not-found-codigo">Error 404</p>
        <div>
          <h2 className="auth-form-titulo">Esta canción no está en la estantería</h2>
          <p className="auth-form-subtitulo">La página que buscás no existe o cambió de lugar.</p>
        </div>
        <Link to="/" className="auth-boton not-found-boton">
          Volver al inicio
        </Link>
      </div>
    </AuthLayout>
  );
}
