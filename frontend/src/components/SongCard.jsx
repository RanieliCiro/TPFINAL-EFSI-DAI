import "./SongCard.css";

export default function SongCard({ cancion }) {
  return (
    <article className="song-card">
      {cancion.portada_url ? (
        <img className="song-card-portada" src={cancion.portada_url} alt={`Portada de ${cancion.titulo}`} />
      ) : (
        <div className="song-card-portada song-card-sin-portada" />
      )}
      <h3 className="song-card-titulo">{cancion.titulo}</h3>
      <p className="song-card-artista">{cancion.artista}</p>
    </article>
  );
}
