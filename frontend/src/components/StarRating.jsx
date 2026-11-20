import "./StarRating.css";

const ESTRELLAS = [1, 2, 3, 4, 5];

export default function StarRating({ valor, onCambiar, deshabilitado }) {
  const puntuacion = valor ?? 0;

  return (
    <div className="star-rating">
      {ESTRELLAS.map((numero) => (
        <button
          key={numero}
          type="button"
          className={numero <= puntuacion ? "star-rating-estrella star-rating-llena" : "star-rating-estrella"}
          onClick={() => onCambiar(numero === valor ? null : numero)}
          disabled={!onCambiar || deshabilitado}
          aria-label={numero === 1 ? "1 estrella" : `${numero} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
