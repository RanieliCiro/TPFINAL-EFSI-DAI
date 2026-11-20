import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../services/profile.js";
import { useAuth } from "../context/AuthContext.jsx";
import Avatar from "../components/Avatar.jsx";
import Disco, { COLORES_DISCO } from "../components/Disco.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { tiempoRelativo } from "../utils/tiempo.js";
import { separarGeneros } from "../utils/generos.js";
import "./Profile.css";

export default function Profile() {
  const { actualizarUsuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(false);

  async function cargarPerfil() {
    try {
      setDatos(await getProfile());
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  function alGuardar(usuarioActualizado) {
    actualizarUsuario(usuarioActualizado);
    setEditando(false);
    cargarPerfil();
  }

  const usuario = datos?.usuario;
  const generos = separarGeneros(usuario?.preferencias);

  return (
    <main className="profile">
      <header className="profile-encabezado">
        <div>
          <h1 className="profile-titulo">Mi perfil</h1>
          <p className="profile-subtitulo">Tus gustos musicales y tu actividad.</p>
        </div>
        {usuario && (
          <button type="button" className="profile-boton" onClick={() => setEditando(true)}>
            Editar perfil
          </button>
        )}
      </header>

      {cargando && <Loader />}
      {error && <ErrorMessage mensaje={error} />}

      {usuario && (
        <>
          <section className="profile-tarjeta">
            <Avatar src={usuario.avatar} nombre={usuario.username} tamanio="grande" />
            <div className="profile-datos">
              <h2 className="profile-nombre">{usuario.username}</h2>
              <p className="profile-bio">{usuario.bio || "Todavía no escribiste tu bio."}</p>
              {generos.length > 0 && <p className="profile-generos">{generos.join(" · ")}</p>}
            </div>
          </section>

          <section className="profile-seccion">
            <h2 className="profile-seccion-titulo">Mis favoritos</h2>
            {datos.favoritos.length === 0 ? (
              <EmptyState mensaje="Todavía no marcaste canciones como favoritas.">
                <Link to="/library">Ir a mi biblioteca</Link>
              </EmptyState>
            ) : (
              <div className="profile-favoritos">
                {datos.favoritos.map((cancion, indice) => (
                  <article key={cancion.id} className="profile-favorito">
                    {cancion.portada_url ? (
                      <img
                        className="profile-favorito-imagen"
                        src={cancion.portada_url}
                        alt={`Portada de ${cancion.titulo}`}
                      />
                    ) : (
                      <Disco color={COLORES_DISCO[indice % COLORES_DISCO.length]} />
                    )}
                    <h3 className="profile-favorito-titulo">{cancion.titulo}</h3>
                    <p className="profile-favorito-artista">{cancion.artista}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="profile-seccion">
            <h2 className="profile-seccion-titulo">Actividad reciente</h2>
            {datos.actividad.length === 0 ? (
              <EmptyState mensaje="Acá vas a ver lo que vayas haciendo en SoundShelf." />
            ) : (
              <ul className="profile-actividad">
                {datos.actividad.map((item) => (
                  <li key={item.id} className="profile-actividad-item">
                    <span>{item.referencia}</span>
                    <time className="profile-actividad-fecha" dateTime={item.created_at}>
                      {tiempoRelativo(item.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {editando && (
        <EditProfileModal usuario={usuario} onCerrar={() => setEditando(false)} onGuardado={alGuardar} />
      )}
    </main>
  );
}
