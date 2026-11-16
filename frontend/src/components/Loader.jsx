import "./Loader.css";

export default function Loader() {
  return (
    <div className="loader" role="status">
      <span className="loader-disco" />
      <span>Cargando...</span>
    </div>
  );
}
