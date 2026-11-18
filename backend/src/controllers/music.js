import pool from "../db.js";
import { parsearId } from "../utils/parsearId.js";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const ITUNES_LOOKUP_URL = "https://itunes.apple.com/lookup";
const LIMITE_RESULTADOS = 25;

function formatearCancion(resultado) {
  return {
    track_id: resultado.trackId,
    titulo: resultado.trackName,
    artista: resultado.artistName,
    album: resultado.collectionName,
    portada_url: resultado.artworkUrl100?.replace("100x100bb", "300x300bb"),
    genero: resultado.primaryGenreName,
    anio: resultado.releaseDate ? new Date(resultado.releaseDate).getFullYear() : null,
    duracion_ms: resultado.trackTimeMillis ?? null,
  };
}

async function buscarCancionEnItunes(trackId) {
  const respuesta = await fetch(`${ITUNES_LOOKUP_URL}?id=${trackId}`);

  if (!respuesta.ok) {
    throw new Error("iTunes no respondió correctamente");
  }

  const datos = await respuesta.json();
  const resultado = datos.results.find((item) => item.kind === "song" && item.trackId === trackId);
  return resultado ? formatearCancion(resultado) : null;
}

export async function searchMusic(req, res) {
  const term = req.query.term?.trim();

  if (!term) {
    return res.status(400).json({ error: "Ingresá algo para buscar" });
  }

  const parametros = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: LIMITE_RESULTADOS,
  });

  try {
    const respuesta = await fetch(`${ITUNES_SEARCH_URL}?${parametros}`);

    if (!respuesta.ok) {
      return res.status(502).json({ error: "iTunes no respondió correctamente" });
    }

    const datos = await respuesta.json();
    res.json(datos.results.map(formatearCancion));
  } catch (error) {
    res.status(502).json({ error: "No se pudo conectar con iTunes" });
  }
}

export async function getSong(req, res) {
  const trackId = parsearId(req.params.id);

  if (!trackId) {
    return res.status(400).json({ error: "La canción no es válida" });
  }

  try {
    const resultadoBiblioteca = await pool.query(
      `SELECT id, track_id, titulo, artista, album, portada_url, genero, anio,
              estado, favorito, puntuacion, created_at
       FROM biblioteca
       WHERE usuario_id = $1 AND track_id = $2`,
      [req.usuario.id, trackId]
    );
    const guardada = resultadoBiblioteca.rows[0] ?? null;

    let cancion = null;
    try {
      cancion = await buscarCancionEnItunes(trackId);
    } catch (error) {
      cancion = null;
    }

    if (!cancion && !guardada) {
      return res.status(404).json({ error: "No encontramos esa canción" });
    }

    let resena = null;
    let playlists = [];

    if (guardada) {
      const [resultadoResena, resultadoPlaylists] = await Promise.all([
        pool.query("SELECT id, texto, created_at, updated_at FROM resenas WHERE biblioteca_id = $1", [guardada.id]),
        pool.query("SELECT coleccion_id FROM coleccion_canciones WHERE biblioteca_id = $1", [guardada.id]),
      ]);
      resena = resultadoResena.rows[0] ?? null;
      playlists = resultadoPlaylists.rows.map((fila) => fila.coleccion_id);
    }

    res.json({
      cancion: cancion ?? { ...guardada, track_id: trackId, duracion_ms: null },
      guardada,
      resena,
      playlists,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la canción" });
  }
}
