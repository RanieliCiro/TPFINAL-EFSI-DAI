import "./Loader.css";

const TARJETAS_ESQUELETO = [1, 2, 3, 4];

export default function Loader() {
  return (
    <div className="loader" role="status">
      <div className="loader-grilla">
        {TARJETAS_ESQUELETO.map((numero) => (
          <div key={numero} className="loader-tarjeta">
            <span className="loader-portada" />
            <span className="loader-linea" />
            <span className="loader-linea loader-linea-corta" />
          </div>
        ))}
      </div>
      <p className="loader-texto">Cargando...</p>
    </div>
  );
}
