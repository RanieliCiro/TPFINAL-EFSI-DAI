import { Link } from "react-router-dom";
import Disco from "./Disco.jsx";
import "./SongCard.css";

export default function SongCard({ cancion, mostrarGenero, to }) {
  const contenido = (
    <>
      <div className="song-card-portada">
        {cancion.portada_url ? (
          <img className="song-card-imagen" src={cancion.portada_url} alt={`Portada de ${cancion.titulo}`} />
        ) : (
          <Disco color="marron" />
        )}
        {mostrarGenero && cancion.genero && <span className="song-card-genero">{cancion.genero}</span>}
      </div>
      <h3 className="song-card-titulo">{cancion.titulo}</h3>
      <p className="song-card-artista">{cancion.artista}</p>
    </>
  );

  return (
    <article className="song-card">
      {to ? (
        <Link to={to} className="song-card-link">
          {contenido}
        </Link>
      ) : (
        contenido
      )}
    </article>
  );
}
