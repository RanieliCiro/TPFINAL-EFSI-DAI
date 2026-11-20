import "./ErrorMessage.css";

export default function ErrorMessage({ mensaje, sinReintentar }) {
  return (
    <div className="error-message" role="alert">
      <span className="error-message-icono">!</span>
      <p className="error-message-titulo">{mensaje}</p>
      {!sinReintentar && (
        <>
          <p className="error-message-texto">Revisá tu conexión e intentá de nuevo.</p>
          <button type="button" className="error-message-boton" onClick={() => window.location.reload()}>
            ↻ Reintentar
          </button>
        </>
      )}
    </div>
  );
}
