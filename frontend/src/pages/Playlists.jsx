import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollections, createCollection } from "../services/collections.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Disco, { COLORES_DISCO } from "../components/Disco.jsx";
import "./Playlists.css";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [creando, setCreando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");

  useEffect(() => {
    async function cargarPlaylists() {
      try {
        setPlaylists(await getCollections());
      } catch (err) {
        setError(err.response?.data?.error || "No se pudo conectar con el servidor");
      } finally {
        setCargando(false);
      }
    }
    cargarPlaylists();
  }, []);

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setNombre("");
    setDescripcion("");
    setErrorFormulario("");
  }

  async function handleCrear(event) {
    event.preventDefault();
    setCreando(true);
    setErrorFormulario("");
    try {
      const nueva = await createCollection({ nombre, descripcion });
      setPlaylists([nueva, ...playlists]);
      cerrarFormulario();
    } catch (err) {
      setErrorFormulario(err.response?.data?.error || "No se pudo crear la playlist");
    } finally {
      setCreando(false);
    }
  }

  return (
    <main className="pagina">
      <header className="playlists-encabezado">
        <div>
          <h1 className="pagina-titulo">Mis playlists</h1>
          <p className="texto-secundario">Agrupá tus canciones guardadas como quieras.</p>
        </div>
        {!mostrarFormulario && (
          <button className="boton" onClick={() => setMostrarFormulario(true)}>
            + Nueva playlist
          </button>
        )}
      </header>

      {mostrarFormulario && (
        <form className="tarjeta formulario" onSubmit={handleCrear}>
          <h2 className="pagina-subtitulo">Nueva playlist</h2>
          <label>
            Nombre
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Para estudiar"
              maxLength="100"
              autoFocus
            />
          </label>
          <label>
            Descripción (opcional)
            <textarea
              rows="2"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="¿De qué se trata esta playlist?"
              maxLength="300"
            />
          </label>
          {errorFormulario && <ErrorMessage mensaje={errorFormulario} sinReintentar />}
          <div className="formulario-botones">
            <button className="boton" type="submit" disabled={creando || !nombre.trim()}>
              {creando ? "Creando..." : "Crear playlist"}
            </button>
            <button className="boton boton-secundario" type="button" onClick={cerrarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando && <Loader />}

      {error && <ErrorMessage mensaje={error} />}

      {!cargando && !error && playlists.length === 0 && (
        <EmptyState mensaje="Todavía no creaste playlists. ¡Armá la primera!" />
      )}

      {playlists.length > 0 && (
        <ul className="playlists-grilla">
          {playlists.map((playlist, indice) => (
            <li key={playlist.id}>
              <Link to={`/playlists/${playlist.id}`} className="playlists-tarjeta">
                <span className="playlists-disco">
                  <Disco color={COLORES_DISCO[indice % COLORES_DISCO.length]} />
                </span>
                <strong className="playlists-nombre">{playlist.nombre}</strong>
                <span className="texto-chico">
                  {playlist.cantidad === 1 ? "1 canción" : `${playlist.cantidad} canciones`}
                </span>
                {playlist.descripcion && <span className="playlists-descripcion">{playlist.descripcion}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
