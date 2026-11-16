import "./ErrorMessage.css";

export default function ErrorMessage({ mensaje }) {
  return (
    <p className="error-message" role="alert">
      {mensaje}
    </p>
  );
}
