import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMusic } from "../services/music.js";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import SongCard from "../components/SongCard.jsx";
import "./Explore.css";

const ORDENES = [
  { valor: "relevancia", texto: "Relevancia" },
  { valor: "titulo", texto: "Título (A-Z)" },
  { valor: "artista", texto: "Artista (A-Z)" },
  { valor: "recientes", texto: "Más nuevas" },
];

function ordenarCanciones(canciones, orden) {
  const copia = [...canciones];

  if (orden === "titulo") {
    copia.sort((a, b) => a.titulo.localeCompare(b.titulo));
  }

  if (orden === "artista") {
    copia.sort((a, b) => a.artista.localeCompare(b.artista));
  }

  if (orden === "recientes") {
    copia.sort((a, b) => (b.anio ?? 0) - (a.anio ?? 0));
  }

  return copia;
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const termino = searchParams.get("q") ?? "";

  const [texto, setTexto] = useState(termino);
  const [resultados, setResultados] = useState(null);
  const [genero, setGenero] = useState("");
  const [orden, setOrden] = useState("relevancia");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTexto(termino);
    setGenero("");

    if (!termino) {
      setResultados(null);
      setCargando(false);
      return;
    }

    let cancelado = false;

    async function buscar() {
      setCargando(true);
      setError("");
      try {
        const datos = await searchMusic(termino);
        if (!cancelado) {
          setResultados(datos);
        }
      } catch (err) {
        if (!cancelado) {
          setResultados(null);
          setError(err.response?.data?.error || "No se pudo conectar con el servidor");
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }
    buscar();

    return () => {
      cancelado = true;
    };
  }, [termino]);

  function handleSubmit(event) {
    event.preventDefault();
    const limpio = texto.trim();
    if (limpio) {
      setSearchParams({ q: limpio });
    }
  }

  const generos = resultados ? [...new Set(resultados.map((cancion) => cancion.genero).filter(Boolean))].sort() : [];
  const visibles = resultados
    ? ordenarCanciones(
        resultados.filter((cancion) => !genero || cancion.genero === genero),
        orden
      )
    : [];

  return (
    <main className="pagina">
      <header>
        <h1 className="pagina-titulo">Explorar música</h1>
        <p className="texto-secundario">Buscá canciones por nombre, artista o álbum.</p>
      </header>

      <form className="explore-buscador" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          placeholder="¿Qué querés escuchar?"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          aria-label="Buscar canciones"
        />
        <button className="boton" type="submit" disabled={!texto.trim() || cargando}>
          Buscar
        </button>
      </form>

      {cargando && <Loader />}

      {error && <ErrorMessage mensaje={error} />}

      {!cargando && resultados && (
        <section className="explore-resultados">
          <div className="explore-resultados-encabezado">
            <h2 className="pagina-subtitulo">Resultados para "{termino}"</h2>
            {resultados.length > 0 && (
              <div className="explore-filtros">
                <select value={genero} onChange={(event) => setGenero(event.target.value)} aria-label="Filtrar por género">
                  <option value="">Todos los géneros</option>
                  {generos.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
                <select value={orden} onChange={(event) => setOrden(event.target.value)} aria-label="Ordenar">
                  {ORDENES.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {resultados.length === 0 && (
            <EmptyState mensaje="No encontramos canciones con esa búsqueda. Probá con otras palabras." />
          )}

          {resultados.length > 0 && visibles.length === 0 && (
            <EmptyState mensaje="Ninguna canción coincide con el filtro." />
          )}

          {visibles.length > 0 && (
            <div className="grilla-canciones">
              {visibles.map((cancion) => (
                <SongCard
                  key={cancion.track_id}
                  cancion={cancion}
                  mostrarGenero
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
