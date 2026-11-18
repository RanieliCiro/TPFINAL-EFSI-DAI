import { useEffect, useState } from "react";
import { getStats } from "../services/stats.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import "./Stats.css";

export default function Stats() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarStats() {
      try {
        setDatos(await getStats());
      } catch (err) {
        setError(err.response?.data?.error || "No se pudieron cargar las estadísticas");
      } finally {
        setCargando(false);
      }
    }

    cargarStats();
  }, []);

  if (cargando) {
    return <main className="stats"><Loader /></main>;
  }

  if (error) {
    return <main className="stats"><ErrorMessage mensaje={error} /></main>;
  }

  const generos = datos.generos ?? [];
  const cantidadMaxima = Math.max(...generos.map((genero) => genero.cantidad), 1);
  const promedio = datos.promedio_puntuacion == null
    ? "-"
    : `${Number(datos.promedio_puntuacion).toFixed(1).replace(".", ",")} / 5`;

  return (
    <main className="stats">
      <header className="stats-encabezado">
        <h1 className="stats-titulo">Tus estadísticas</h1>
        <p className="stats-subtitulo">Tu colección contada en números.</p>
      </header>

      <section className="stats-resumen" aria-label="Resumen de la colección">
        <article className="stats-tarjeta">
          <strong className="stats-tarjeta-numero">{datos.total_guardadas}</strong>
          <span className="stats-tarjeta-etiqueta">Canciones</span>
        </article>
        <article className="stats-tarjeta">
          <strong className="stats-tarjeta-numero">{datos.favoritas}</strong>
          <span className="stats-tarjeta-etiqueta">Favoritos</span>
        </article>
        <article className="stats-tarjeta">
          <strong className="stats-tarjeta-numero">{datos.playlists}</strong>
          <span className="stats-tarjeta-etiqueta">Playlists</span>
        </article>
        <article className="stats-tarjeta">
          <strong className="stats-tarjeta-numero">{datos.escuchadas}</strong>
          <span className="stats-tarjeta-etiqueta">Escuchadas</span>
        </article>
      </section>

      <section className="stats-contenido">
        <article className="stats-panel">
          <h2 className="stats-panel-titulo">Géneros favoritos</h2>
          {generos.length === 0 ? (
            <p className="stats-vacio">Todavía no hay géneros en tu colección.</p>
          ) : (
            <div className="stats-generos">
              {generos.slice(0, 5).map((genero) => (
                <div className="stats-genero" key={genero.genero}>
                  <span className="stats-genero-nombre">{genero.genero}</span>
                  <div className="stats-barra-fondo">
                    <div
                      className="stats-barra"
                      style={{ width: `${(genero.cantidad / cantidadMaxima) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="stats-panel">
          <h2 className="stats-panel-titulo">Tu resumen</h2>
          <div className="stats-resumen-datos">
            <div className="stats-promedio">
              <strong className="stats-promedio-numero">{promedio}</strong>
              <span className="stats-promedio-etiqueta">Puntuación promedio</span>
            </div>
            <div className="stats-diferentes">
              <strong className="stats-diferentes-numero">
                {generos.length} {generos.length === 1 ? "género diferente" : "géneros diferentes"}
              </strong>
              <span className="stats-diferentes-texto">Tu colección sigue creciendo.</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
