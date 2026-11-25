import { useEffect, useRef, useState } from "react";
import { updateProfile } from "../services/profile.js";
import { GENEROS_DISPONIBLES, separarGeneros } from "../utils/generos.js";
import Avatar from "./Avatar.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import "./EditProfileModal.css";

const TIPOS_FOTO = ["image/jpeg", "image/png"];
const BYTES_MAXIMOS_FOTO = 2 * 1024 * 1024;
const LARGO_MAXIMO_BIO = 300;

function leerComoDataUrl(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(lector.error);
    lector.readAsDataURL(archivo);
  });
}

export default function EditProfileModal({ usuario, onCerrar, onGuardado }) {
  const [username, setUsername] = useState(usuario.username);
  const [bio, setBio] = useState(usuario.bio ?? "");
  const [generos, setGeneros] = useState(separarGeneros(usuario.preferencias));
  const [avatar, setAvatar] = useState(usuario.avatar);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const inputFoto = useRef(null);

  useEffect(() => {
    function alApretarTecla(event) {
      if (event.key === "Escape" && !guardando) {
        onCerrar();
      }
    }

    document.addEventListener("keydown", alApretarTecla);
    return () => document.removeEventListener("keydown", alApretarTecla);
  }, [guardando, onCerrar]);

  async function elegirFoto(event) {
    const archivo = event.target.files[0];
    event.target.value = "";

    if (!archivo) {
      return;
    }

    if (!TIPOS_FOTO.includes(archivo.type)) {
      setError("La foto tiene que ser JPG o PNG");
      return;
    }

    if (archivo.size > BYTES_MAXIMOS_FOTO) {
      setError("La foto puede pesar hasta 2 MB");
      return;
    }

    try {
      setError("");
      setAvatar(await leerComoDataUrl(archivo));
    } catch (err) {
      setError("No se pudo leer la foto");
    }
  }

  function alternarGenero(genero) {
    setGeneros((actuales) =>
      actuales.includes(genero) ? actuales.filter((item) => item !== genero) : [...actuales, genero]
    );
  }

  async function guardar(event) {
    event.preventDefault();

    const usernameLimpio = username.trim();
    if (usernameLimpio.length < 3 || usernameLimpio.length > 30) {
      setError("El nombre debe tener entre 3 y 30 caracteres");
      return;
    }

    const datos = { username: usernameLimpio, bio, preferencias: generos };
    if (avatar !== usuario.avatar) {
      datos.avatar = avatar;
    }

    try {
      setGuardando(true);
      setError("");
      onGuardado(await updateProfile(datos));
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el perfil");
      setGuardando(false);
    }
  }

  return (
    <div className="modal-fondo" onMouseDown={(event) => event.target === event.currentTarget && !guardando && onCerrar()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" onSubmit={guardar}>
        <header className="modal-encabezado">
          <h2 id="modal-titulo" className="modal-titulo">
            Editar perfil
          </h2>
          <button type="button" className="modal-cerrar" onClick={onCerrar} disabled={guardando} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="modal-foto">
          <Avatar src={avatar} nombre={username} tamanio="chico" />
          <div>
            <button type="button" className="modal-link" onClick={() => inputFoto.current.click()}>
              Cambiar foto
            </button>
            {avatar && (
              <button type="button" className="modal-link modal-link-secundario" onClick={() => setAvatar(null)}>
                Quitar
              </button>
            )}
            <p className="modal-ayuda">JPG o PNG, máximo 2 MB.</p>
          </div>
          <input
            ref={inputFoto}
            type="file"
            accept="image/jpeg,image/png"
            onChange={elegirFoto}
            hidden
          />
        </div>

        <label className="modal-campo">
          <span className="modal-etiqueta">Nombre</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={30}
            autoFocus
          />
        </label>

        <label className="modal-campo">
          <span className="modal-etiqueta">Bio</span>
          <textarea
            className="modal-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={LARGO_MAXIMO_BIO}
            rows={3}
            placeholder="Contá algo sobre vos y tu música"
          />
        </label>

        <fieldset className="modal-campo modal-generos">
          <legend className="modal-etiqueta">Géneros favoritos</legend>
          <div className="modal-chips">
            {GENEROS_DISPONIBLES.map((genero) => {
              const elegido = generos.includes(genero);
              return (
                <button
                  key={genero}
                  type="button"
                  className={elegido ? "modal-chip activo" : "modal-chip"}
                  onClick={() => alternarGenero(genero)}
                  aria-pressed={elegido}
                >
                  {genero}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && <ErrorMessage mensaje={error} sinReintentar />}

        <footer className="modal-acciones">
          <button type="button" className="modal-cancelar" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="modal-guardar" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </footer>
      </form>
    </div>
  );
}
