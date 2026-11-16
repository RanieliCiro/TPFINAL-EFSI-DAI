const ITUNES_URL = "https://itunes.apple.com/search";
const LIMITE_RESULTADOS = 25;

function formatearCancion(resultado) {
  return {
    track_id: resultado.trackId,
    titulo: resultado.trackName,
    artista: resultado.artistName,
    album: resultado.collectionName,
    portada_url: resultado.artworkUrl100,
    genero: resultado.primaryGenreName,
    anio: resultado.releaseDate ? new Date(resultado.releaseDate).getFullYear() : null,
  };
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
    const respuesta = await fetch(`${ITUNES_URL}?${parametros}`);

    if (!respuesta.ok) {
      return res.status(502).json({ error: "iTunes no respondió correctamente" });
    }

    const datos = await respuesta.json();
    res.json(datos.results.map(formatearCancion));
  } catch (error) {
    res.status(502).json({ error: "No se pudo conectar con iTunes" });
  }
}
