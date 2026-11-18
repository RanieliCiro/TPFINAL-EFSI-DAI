import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSong } from "../services/music.js";
import { addToLibrary, updateLibraryItem, removeFromLibrary } from "../services/library.js";
import { createReview, updateReview, deleteReview } from "../services/reviews.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import StarRating from "../components/StarRating.jsx";
import Disco from "../components/Disco.jsx";
import "./SongDetail.css";

const ESTADOS = [
  { valor: "quiero_escuchar", texto: "Quiero escucharla" },
  { valor: "escuchando", texto: "La estoy escuchando" },
  { valor: "escuchado", texto: "Ya la escuché" },
];
const MS_POR_SEGUNDO = 1000;
const SEGUNDOS_POR_MINUTO = 60;

function formatearDuracion(ms) {
  const segundosTotales = Math.round(ms / MS_POR_SEGUNDO);
  const minutos = Math.floor(segundosTotales / SEGUNDOS_POR_MINUTO);
  const segundos = String(segundosTotales % SEGUNDOS_POR_MINUTO).padStart(2, "0");
  return `${minutos}:${segundos}`;
}

export default function SongDetail() {
  const { trackId } = useParams();
  const navigate = useNavigate();

  const [detalle, setDetalle] = useState(null);
  const [textoResena, setTextoResena] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  async function cargarDetalle() {
    try {
      const datos = await getSong(trackId);
      setDetalle(datos);
      setTextoResena(datos.resena?.texto ?? "");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    setCargando(true);
    setDetalle(null);
    cargarDetalle();
  }, [trackId]);

  async function ejecutar(accion) {
    setProcesando(true);
    setErrorAccion("");
    try {
      await accion();
      await cargarDetalle();
    } catch (err) {
      setErrorAccion(err.response?.data?.error || "No se pudo completar la acción");
    } finally {
      setProcesando(false);
    }
  }

  function handleQuitar() {
    if (window.confirm("¿Seguro que querés quitar esta canción de tu biblioteca? Se borra también su reseña.")) {
      ejecutar(() => removeFromLibrary(detalle.guardada.id));
    }
  }

  function handleGuardarResena(event) {
    event.preventDefault();
    if (detalle.resena) {
      ejecutar(() => updateReview(detalle.resena.id, textoResena));
    } else {
      ejecutar(() => createReview(detalle.guardada.id, textoResena));
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
        <button className="boton boton-secundario" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </main>
    );
  }

  const { cancion, guardada, resena } = detalle;
  const datosExtra = [cancion.album, cancion.anio, cancion.genero, cancion.duracion_ms && formatearDuracion(cancion.duracion_ms)];

  return (
    <main className="pagina">
      <button className="song-detail-volver" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <section className="song-detail-cabecera">
        <div className="song-detail-portada">
          {cancion.portada_url ? (
            <img src={cancion.portada_url} alt={`Portada de ${cancion.titulo}`} />
          ) : (
            <Disco color="marron" />
          )}
        </div>

        <div className="song-detail-info">
          <span className="song-detail-etiqueta">Canción</span>
          <h1 className="pagina-titulo">{cancion.titulo}</h1>
          <p className="song-detail-artista">{cancion.artista}</p>
          <p className="texto-secundario">{datosExtra.filter(Boolean).join(" · ")}</p>

          {!guardada && (
            <button
              className="boton song-detail-guardar"
              onClick={() => ejecutar(() => addToLibrary(cancion))}
              disabled={procesando}
            >
              + Guardar en mi biblioteca
            </button>
          )}
        </div>
      </section>

      {errorAccion && <ErrorMessage mensaje={errorAccion} />}

      {guardada && (
        <>
          <section className="tarjeta">
            <div className="song-detail-fila">
              <h2 className="pagina-subtitulo">En tu biblioteca</h2>
              <button className="boton boton-peligro boton-chico" onClick={handleQuitar} disabled={procesando}>
                Quitar de mi biblioteca
              </button>
            </div>

            <div className="song-detail-controles">
              <label className="song-detail-control">
                <span className="texto-chico">Estado</span>
                <select
                  value={guardada.estado}
                  onChange={(event) => ejecutar(() => updateLibraryItem(guardada.id, { estado: event.target.value }))}
                  disabled={procesando}
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado.valor} value={estado.valor}>
                      {estado.texto}
                    </option>
                  ))}
                </select>
              </label>

              <div className="song-detail-control">
                <span className="texto-chico">Tu puntuación</span>
                <StarRating
                  valor={guardada.puntuacion}
                  onCambiar={(puntuacion) => ejecutar(() => updateLibraryItem(guardada.id, { puntuacion }))}
                  deshabilitado={procesando}
                />
              </div>

              <div className="song-detail-control">
                <span className="texto-chico">Favorita</span>
                <button
                  className={guardada.favorito ? "song-detail-favorito song-detail-favorito-activo" : "song-detail-favorito"}
                  onClick={() => ejecutar(() => updateLibraryItem(guardada.id, { favorito: !guardada.favorito }))}
                  disabled={procesando}
                  aria-pressed={guardada.favorito}
                >
                  {guardada.favorito ? "♥ Es favorita" : "♡ Marcar favorita"}
                </button>
              </div>
            </div>
          </section>

          <section className="tarjeta">
            <h2 className="pagina-subtitulo">Tu reseña</h2>
            <form className="formulario" onSubmit={handleGuardarResena}>
              <textarea
                rows="4"
                placeholder="¿Qué te pareció esta canción?"
                value={textoResena}
                onChange={(event) => setTextoResena(event.target.value)}
                maxLength="2000"
              />
              <div className="formulario-botones">
                <button
                  className="boton"
                  type="submit"
                  disabled={procesando || !textoResena.trim() || textoResena.trim() === resena?.texto}
                >
                  {resena ? "Guardar cambios" : "Publicar reseña"}
                </button>
                {resena && (
                  <button
                    className="boton boton-secundario"
                    type="button"
                    onClick={() => ejecutar(() => deleteReview(resena.id))}
                    disabled={procesando}
                  >
                    Borrar reseña
                  </button>
                )}
              </div>
            </form>
          </section>
        </>
      )}
    </main>
  );
}
