import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getCollection,
  updateCollection,
  deleteCollection,
  addItem,
  removeItem,
} from "../services/collections.js";
import { getLibrary } from "../services/library.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import Disco from "../components/Disco.jsx";
import "./Playlists.css";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [biblioteca, setBiblioteca] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cancionElegida, setCancionElegida] = useState("");

  async function cargarPlaylist() {
    try {
      const [datos, canciones] = await Promise.all([getCollection(id), getLibrary()]);
      setPlaylist(datos);
      setBiblioteca(canciones);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    setCargando(true);
    cargarPlaylist();
  }, [id]);

  async function ejecutar(accion) {
    setProcesando(true);
    setErrorAccion("");
    try {
      await accion();
      await cargarPlaylist();
      return true;
    } catch (err) {
      setErrorAccion(err.response?.data?.error || "No se pudo completar la acción");
      return false;
    } finally {
      setProcesando(false);
    }
  }

  function empezarAEditar() {
    setNombre(playlist.nombre);
    setDescripcion(playlist.descripcion ?? "");
    setErrorAccion("");
    setEditando(true);
  }

  async function handleGuardarCambios(event) {
    event.preventDefault();
    const salioBien = await ejecutar(() => updateCollection(id, { nombre, descripcion }));
    if (salioBien) {
      setEditando(false);
    }
  }

  async function handleBorrar() {
    if (!window.confirm(`¿Seguro que querés borrar la playlist "${playlist.nombre}"? Las canciones siguen en tu biblioteca.`)) {
      return;
    }
    setProcesando(true);
    try {
      await deleteCollection(id);
      navigate("/playlists");
    } catch (err) {
      setErrorAccion(err.response?.data?.error || "No se pudo borrar la playlist");
      setProcesando(false);
    }
  }

  async function handleAgregarCancion(event) {
    event.preventDefault();
    const salioBien = await ejecutar(() => addItem(id, Number(cancionElegida)));
    if (salioBien) {
      setCancionElegida("");
    }
  }

  if (cargando) {
    return (
      <main className="pagina">
        <Loader />
      </main>
    );
  }

  if (error) {
    return (
      <main className="pagina">
        <ErrorMessage mensaje={error} />
        <Link to="/playlists">← Volver a mis playlists</Link>
      </main>
    );
  }

  const idsEnPlaylist = playlist.canciones.map((cancion) => cancion.id);
  const cancionesParaAgregar = biblioteca.filter((cancion) => !idsEnPlaylist.includes(cancion.id));
  const cantidad = playlist.canciones.length;

  return (
    <main className="pagina">
      <Link to="/playlists" className="texto-chico">
        ← Volver a mis playlists
      </Link>

      {editando ? (
        <form className="tarjeta formulario" onSubmit={handleGuardarCambios}>
          <h2 className="pagina-subtitulo">Editar playlist</h2>
          <label>
            Nombre
            <input value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength="100" autoFocus />
          </label>
          <label>
            Descripción (opcional)
            <textarea
              rows="2"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              maxLength="300"
            />
          </label>
          <div className="formulario-botones">
            <button className="boton" type="submit" disabled={procesando || !nombre.trim()}>
              Guardar
            </button>
            <button className="boton boton-secundario" type="button" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <section className="playlist-detalle-cabecera">
          <div className="playlist-detalle-disco">
            <Disco color="naranja" />
          </div>
          <div className="playlist-detalle-info">
            <span className="texto-chico">PLAYLIST</span>
            <h1 className="pagina-titulo">{playlist.nombre}</h1>
            {playlist.descripcion && <p className="texto-secundario">{playlist.descripcion}</p>}
            <p className="texto-chico">{cantidad === 1 ? "1 canción" : `${cantidad} canciones`}</p>
            <div className="formulario-botones">
              <button className="boton boton-secundario boton-chico" onClick={empezarAEditar} disabled={procesando}>
                Editar
              </button>
              <button className="boton boton-peligro boton-chico" onClick={handleBorrar} disabled={procesando}>
                Borrar playlist
              </button>
            </div>
          </div>
        </section>
      )}

      {errorAccion && <ErrorMessage mensaje={errorAccion} />}

      <section className="tarjeta">
        <h2 className="pagina-subtitulo">Agregar canciones</h2>
        {biblioteca.length === 0 ? (
          <p className="texto-secundario">
            Solo podés agregar canciones de tu biblioteca. <Link to="/explore">Buscá canciones</Link> y guardalas
            primero.
          </p>
        ) : cancionesParaAgregar.length === 0 ? (
          <p className="texto-secundario">Ya agregaste todas las canciones de tu biblioteca.</p>
        ) : (
          <form className="playlist-detalle-agregar" onSubmit={handleAgregarCancion}>
            <select
              value={cancionElegida}
              onChange={(event) => setCancionElegida(event.target.value)}
              aria-label="Canción para agregar"
            >
              <option value="">Elegí una canción de tu biblioteca</option>
              {cancionesParaAgregar.map((cancion) => (
                <option key={cancion.id} value={cancion.id}>
                  {cancion.titulo} - {cancion.artista}
                </option>
              ))}
            </select>
            <button className="boton" type="submit" disabled={procesando || !cancionElegida}>
              Agregar
            </button>
          </form>
        )}
      </section>

      <section>
        {cantidad === 0 ? (
          <EmptyState mensaje="Esta playlist todavía no tiene canciones." />
        ) : (
          <ol className="playlist-canciones">
            {playlist.canciones.map((cancion, indice) => (
              <li key={cancion.id} className="playlist-cancion">
                <span className="playlist-cancion-numero">{indice + 1}</span>
                <span className="playlist-cancion-portada">
                  {cancion.portada_url ? (
                    <img src={cancion.portada_url} alt="" />
                  ) : (
                    <Disco color="marron" />
                  )}
                </span>
                <Link to={`/song/${cancion.track_id}`} className="playlist-cancion-datos">
                  <strong>{cancion.titulo}</strong>
                  <span className="texto-chico">{cancion.artista}</span>
                </Link>
                <button
                  className="boton boton-secundario boton-chico"
                  onClick={() => ejecutar(() => removeItem(id, cancion.id))}
                  disabled={procesando}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
