import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLibrary } from "../services/library.js";
import { getActivity } from "../services/activity.js";
import { getStats } from "../services/stats.js";
import { getCollections } from "../services/collections.js";
import { searchMusic } from "../services/music.js";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SongCard from "../components/SongCard.jsx";
import Disco, { COLORES_DISCO } from "../components/Disco.jsx";
import { tiempoRelativo } from "../utils/tiempo.js";
import { textoActividad } from "../utils/actividad.js";
import { separarGeneros } from "../utils/generos.js";
import "./Home.css";

const CANCIONES_RECIENTES = 5;
const CANCIONES_DESTACADAS = 5;
const PLAYLISTS_VISIBLES = 3;
const ACTIVIDAD_VISIBLE = 4;

async function buscarDestacadas(genero) {
  if (!genero) {
    return [];
  }

  try {
    return await searchMusic(genero);
  } catch (err) {
    return [];
  }
}

export default function Home() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [biblioteca, actividad, stats, playlists] = await Promise.all([
          getLibrary(),
          getActivity(),
          getStats(),
          getCollections(),
        ]);

        const destacadas = await buscarDestacadas(
          separarGeneros(usuario.preferencias)[0] ?? stats.generos[0]?.genero
        );

        setDatos({
          recientes: biblioteca.slice(0, CANCIONES_RECIENTES),
          destacadas: destacadas.slice(0, CANCIONES_DESTACADAS),
          playlists: playlists.slice(0, PLAYLISTS_VISIBLES),
          actividad: actividad.slice(0, ACTIVIDAD_VISIBLE),
          stats,
        });
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
          <h1 className="home-titulo">Bienvenido a SoundShelf</h1>
          <p className="home-texto-secundario">Tu música, organizada a tu manera.</p>
        </div>
        <Link to="/explore" className="home-boton">
          + Explorar música
        </Link>
      </header>

      <section className="home-portada">
        <p className="home-portada-etiqueta">Tu estantería musical</p>
        <h2 className="home-portada-titulo">Cada canción tiene su lugar.</h2>
        <p className="home-texto-secundario">Escuchá, guardá, organizá y descubrí tus favoritas.</p>
      </section>

      {cargando && <Loader />}

      {error && <ErrorMessage mensaje={error} />}

      {datos && (
        <>
          <section className="home-stats">
            <div className="home-stat">
              <span className="home-stat-numero">{datos.stats.total_guardadas}</span>
              <span className="home-stat-texto">Canciones guardadas</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-numero">{datos.stats.favoritas}</span>
              <span className="home-stat-texto">Favoritos</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-numero">{datos.stats.playlists}</span>
              <span className="home-stat-texto">Playlists</span>
            </div>
            <div className="home-stat">
              <span className="home-stat-numero">{datos.stats.promedio_puntuacion ?? "-"}</span>
              <span className="home-stat-texto">Promedio</span>
            </div>
          </section>

          <section className="home-seccion">
            <h2 className="home-seccion-titulo">Agregadas recientemente</h2>
            {datos.recientes.length === 0 ? (
              <EmptyState mensaje="Todavía no guardaste canciones.">
                <Link to="/explore">Explorá música para empezar</Link>
              </EmptyState>
            ) : (
              <div className="home-canciones">
                {datos.recientes.map((cancion) => (
                  <SongCard key={cancion.id} cancion={cancion} to={`/song/${cancion.track_id}`} />
                ))}
              </div>
            )}
          </section>

          <section className="home-seccion">
            <div className="home-seccion-encabezado">
              <div>
                <h2 className="home-seccion-titulo">Destacados para vos</h2>
                <p className="home-texto-chico">Canciones de la API según tus géneros favoritos.</p>
              </div>
              <Link to="/explore" className="home-link">
                Ver más en Explorar →
              </Link>
            </div>
            {datos.destacadas.length === 0 ? (
              <EmptyState mensaje="Elegí tus géneros en el perfil o guardá canciones para recibir recomendaciones." />
            ) : (
              <div className="home-canciones">
                {datos.destacadas.map((cancion) => (
                  <SongCard
                    key={cancion.track_id}
                    cancion={cancion}
                    mostrarGenero
                    to={`/song/${cancion.track_id}`}
                  />
                ))}
              </div>
            )}
          </section>

          <div className="home-columnas">
            <section className="home-seccion">
              <div className="home-seccion-encabezado">
                <h2 className="home-seccion-titulo">Mis playlists</h2>
                <Link to="/playlists" className="home-link">
                  Ver todas →
                </Link>
              </div>
              {datos.playlists.length === 0 ? (
                <EmptyState mensaje="Todavía no creaste playlists." />
              ) : (
                <ul className="home-lista home-playlists">
                  {datos.playlists.map((playlist, indice) => (
                    <li key={playlist.id}>
                      <Link to={`/playlists/${playlist.id}`} className="home-playlist">
                        <span className="home-playlist-disco">
                          <Disco color={COLORES_DISCO[indice % COLORES_DISCO.length]} />
                        </span>
                        <span className="home-playlist-datos">
                          <strong>{playlist.nombre}</strong>
                          <span className="home-texto-chico">
                            {playlist.cantidad === 1 ? "1 canción" : `${playlist.cantidad} canciones`}
                          </span>
                        </span>
                        <span className="home-playlist-flecha">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="home-seccion">
              <h2 className="home-seccion-titulo">Actividad reciente</h2>
              {datos.actividad.length === 0 ? (
                <EmptyState mensaje="Acá vas a ver lo que vayas haciendo en SoundShelf." />
              ) : (
                <ul className="home-lista">
                  {datos.actividad.map((item) => (
                    <li key={item.id} className="home-actividad-item">
                      <span>
                        {textoActividad(item.tipo)} <strong>{item.referencia}</strong>
                      </span>
                      <time className="home-texto-chico" dateTime={item.created_at}>
                        {tiempoRelativo(item.created_at)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
