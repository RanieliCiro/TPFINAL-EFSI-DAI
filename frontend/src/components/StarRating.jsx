import "./StarRating.css";

export default function StarRating({ value, onChange, disabled }) {
  return (
    <div className="star-rating" aria-label="Puntuación">
      {[1, 2, 3, 4, 5].map((estrella) => (
        <button
          key={estrella}
          type="button"
          className={estrella <= value ? "star-rating-estrella activa" : "star-rating-estrella"}
          onClick={() => onChange(estrella)}
          disabled={disabled}
          aria-label={`${estrella} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
