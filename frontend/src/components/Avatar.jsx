import "./Avatar.css";

export default function Avatar({ src, nombre, tamanio = "grande" }) {
  return (
    <div className={`avatar avatar-${tamanio}`}>
      {src ? <img className="avatar-imagen" src={src} alt={`Foto de ${nombre}`} /> : <span aria-hidden="true">♪</span>}
    </div>
  );
}
