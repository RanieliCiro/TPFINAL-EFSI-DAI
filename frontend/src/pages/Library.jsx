import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  removeFromLibrary,
  getLibrary,
  updateLibraryItem,
} from "../services/library.js";
import Disco, { COLORES_DISCO } from "../components/Disco.jsx";
import StarRating from "../components/StarRating.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import "./Library.css";

const FILTROS = [
  { valor: "todas", texto: "Todas las canciones" },
  { valor: "quiero_escuchar", texto: "Quiero escuchar" },
  { valor: "escuchando", texto: "Escuchando" },
  { valor: "escuchado", texto: "Escuchado" },
  { valor: "favoritos", texto: "Favoritos" },
];

export default function Library() {
  const [canciones, setCanciones] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    async function cargarBiblioteca() {
      try {
        setCanciones(await getLibrary());
      } catch (err) {
        setError(err.response?.data?.error || "No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    }

    cargarBiblioteca();
  }, []);

  async function actualizarCancion(id, cambios) {
    try {
      setActualizando(id);
      setError("");
      const actualizada = await updateLibraryItem(id, cambios);
      setCanciones((actuales) =>
        actuales.map((cancion) => (cancion.id === id ? { ...actualizada, resena: cancion.resena } : cancion))
      );
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo actualizar la canción");
    } finally {
      setActualizando(null);
    }
  }

  async function quitarCancion(id) {
    if (!window.confirm("¿Seguro que querés quitar esta canción de tu biblioteca? Se borra también su reseña.")) {
      return;
    }

    try {
      setActualizando(id);
      setError("");
      await removeFromLibrary(id);
      setCanciones((actuales) => actuales.filter((cancion) => cancion.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo quitar la canción");
    } finally {
      setActualizando(null);
    }
  }

  const textoBuscado = busqueda.trim().toLowerCase();
  const cancionesFiltradas = canciones.filter((cancion) => {
    const coincideFiltro =
      filtro === "todas" ||
      (filtro === "favoritos" ? cancion.favorito : cancion.estado === filtro);
    const coincideBusqueda =
      !textoBuscado ||
      cancion.titulo.toLowerCase().includes(textoBuscado) ||
      cancion.artista.toLowerCase().includes(textoBuscado);

    return coincideFiltro && coincideBusqueda;
  });

  return (
    <main className="library">
      <header className="library-encabezado">
        <div>
          <h1 className="library-titulo">Mi biblioteca</h1>
          <p className="library-subtitulo">Todas tus canciones guardadas.</p>
        </div>
        <Link to="/explore" className="library-boton">
          Explorar música
        </Link>
      </header>

      <section className="library-controles">
        <nav className="library-filtros" aria-label="Filtrar biblioteca">
          {FILTROS.map((item) => (
            <button
              key={item.valor}
              type="button"
              className={filtro === item.valor ? "library-filtro activo" : "library-filtro"}
              onClick={() => setFiltro(item.valor)}
            >
              {item.texto}
            </button>
          ))}
        </nav>
        <input
          className="library-busqueda"
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar en tu biblioteca"
        />
      </section>

      {cargando && <Loader />}
      {error && <ErrorMessage mensaje={error} sinReintentar={canciones.length > 0} />}

      {!cargando && !error && cancionesFiltradas.length === 0 && (
        <EmptyState
          mensaje={
            canciones.length === 0
              ? "Todavía no guardaste canciones en tu biblioteca."
              : "No hay canciones que coincidan con el filtro."
          }
        >
          {canciones.length === 0 && <Link to="/explore">Explorá música para empezar</Link>}
        </EmptyState>
      )}

      {!cargando && cancionesFiltradas.length > 0 && (
        <section className="library-grid">
          {cancionesFiltradas.map((cancion, indice) => (
            <article className="library-cancion" key={cancion.id}>
              <div className="library-portada">
                {cancion.portada_url ? (
                  <img
                    className="library-imagen"
                    src={cancion.portada_url}
                    alt={`Portada de ${cancion.titulo}`}
                  />
                ) : (
                  <Disco color={COLORES_DISCO[indice % COLORES_DISCO.length]} />
                )}
                <button
                  type="button"
                  className={cancion.favorito ? "library-favorito activo" : "library-favorito"}
                  onClick={() => actualizarCancion(cancion.id, { favorito: !cancion.favorito })}
                  disabled={actualizando === cancion.id}
                  aria-label={cancion.favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  ♥
                </button>
              </div>

              <div className="library-datos">
                <h2 className="library-cancion-titulo">
                  <Link to={`/song/${cancion.track_id}`} className="library-cancion-link">
                    {cancion.titulo}
                  </Link>
                </h2>
                <p className="library-cancion-artista">{cancion.artista}</p>
                {cancion.resena ? (
                  <p className="library-resena">“{cancion.resena}”</p>
                ) : (
                  <Link to={`/song/${cancion.track_id}`} className="library-resena-link">
                    Escribir reseña
                  </Link>
                )}
              </div>

              <select
                className="library-estado"
                value={cancion.estado}
                onChange={(event) => actualizarCancion(cancion.id, { estado: event.target.value })}
                disabled={actualizando === cancion.id}
                aria-label={`Estado de ${cancion.titulo}`}
              >
                <option value="quiero_escuchar">Quiero escuchar</option>
                <option value="escuchando">Escuchando</option>
                <option value="escuchado">Escuchado</option>
              </select>

              <div className="library-pie">
                <StarRating
                  valor={cancion.puntuacion}
                  onCambiar={(puntuacion) => actualizarCancion(cancion.id, { puntuacion })}
                  deshabilitado={actualizando === cancion.id}
                />
                <button
                  type="button"
                  className="library-quitar"
                  onClick={() => quitarCancion(cancion.id)}
                  disabled={actualizando === cancion.id}
                >
                  Quitar
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
