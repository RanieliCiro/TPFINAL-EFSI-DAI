import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getLibrary } from "../services/library.js";
import { getActivity } from "../services/activity.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SongCard from "../components/SongCard.jsx";
import "./Home.css";

const CANCIONES_RECIENTES = 6;

const TEXTOS_ACTIVIDAD = {
  agregar_cancion: "Agregaste a tu biblioteca",
  quitar_cancion: "Quitaste de tu biblioteca",
  cambiar_estado: "Cambiaste el estado de",
  favorito: "Actualizaste tus favoritas",
  puntuar: "Puntuaste",
  crear_playlist: "Creaste la playlist",
  borrar_playlist: "Borraste la playlist",
  agregar_a_playlist: "Agregaste a una playlist",
  quitar_de_playlist: "Quitaste de una playlist",
  crear_resena: "Escribiste una reseña de",
  editar_resena: "Editaste la reseña de",
};

export default function Home() {
  const { usuario, logout } = useAuth();
  const [canciones, setCanciones] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [biblioteca, ultimaActividad] = await Promise.all([getLibrary(), getActivity()]);
        setCanciones(biblioteca.slice(0, CANCIONES_RECIENTES));
        setActividad(ultimaActividad);
      } catch (err) {
        setError(err.response?.data?.error || "No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  return (
    <main className="home">
      <header className="home-encabezado">
        <div>
          <h1 className="home-titulo">Hola, {usuario.username}</h1>
          <p className="home-subtitulo">Esto es lo último de tu colección.</p>
        </div>
        <button className="home-salir" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      {cargando && <Loader />}

      {error && <ErrorMessage mensaje={error} />}

      {!cargando && !error && (
        <>
          <section className="home-seccion">
            <h2 className="home-seccion-titulo">Agregadas recientemente</h2>
            {canciones.length === 0 ? (
              <EmptyState mensaje="Todavía no guardaste canciones.">
                <Link to="/explore">Explorá música para empezar</Link>
              </EmptyState>
            ) : (
              <div className="home-canciones">
                {canciones.map((cancion) => (
                  <SongCard key={cancion.id} cancion={cancion} />
                ))}
              </div>
            )}
          </section>

          <section className="home-seccion">
            <h2 className="home-seccion-titulo">Actividad reciente</h2>
            {actividad.length === 0 ? (
              <EmptyState mensaje="Acá vas a ver lo que vayas haciendo en SoundShelf." />
            ) : (
              <ul className="home-actividad">
                {actividad.map((item) => (
                  <li key={item.id} className="home-actividad-item">
                    <span>
                      {TEXTOS_ACTIVIDAD[item.tipo]} <strong>{item.referencia}</strong>
                    </span>
                    <time className="home-actividad-fecha" dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleDateString("es-AR")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
