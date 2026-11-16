import "./Disco.css";

export const COLORES_DISCO = ["marron", "naranja", "verde", "violeta", "terracota", "azul"];

export default function Disco({ color }) {
  return (
    <div className={`disco disco-${color}`}>
      <span className="disco-vinilo" />
    </div>
  );
}
