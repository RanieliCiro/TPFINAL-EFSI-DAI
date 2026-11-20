import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";
import "./Navbar.css";

function Icono({ children }) {
  return (
    <svg
      className="navbar-icono"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const LINKS = [
  {
    ruta: "/",
    texto: "Inicio",
    icono: <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  },
  {
    ruta: "/explore",
    texto: "Explorar",
    icono: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </>
    ),
  },
  {
    ruta: "/library",
    texto: "Mi biblioteca",
    icono: <path d="M4 6h16M4 12h16M4 18h16" />,
  },
  {
    ruta: "/playlists",
    texto: "Playlists",
    icono: (
      <>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </>
    ),
  },
  {
    ruta: "/stats",
    texto: "Estadísticas",
    icono: <path d="M4 20V10M10 20V4M16 20v-8M2 20h20" />,
  },
  {
    ruta: "/profile",
    texto: "Mi perfil",
    icono: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
];

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <aside className="navbar">
      <div className="navbar-logo">
        <Logo />
      </div>

      <nav className="navbar-links">
        {LINKS.map((link) => (
          <NavLink
            key={link.ruta}
            to={link.ruta}
            end={link.ruta === "/"}
            className={({ isActive }) => (isActive ? "navbar-link navbar-link-activo" : "navbar-link")}
          >
            <Icono>{link.icono}</Icono>
            {link.texto}
          </NavLink>
        ))}
      </nav>

      <div className="navbar-pie">
        <button className="navbar-salir" onClick={logout}>
          Cerrar sesión
        </button>
        <span className="navbar-copyright">SoundShelf · 2026</span>
      </div>
    </aside>
  );
}
