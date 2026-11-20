import Disco from "./Disco.jsx";
import "./EmptyState.css";

export default function EmptyState({ mensaje, children }) {
  return (
    <div className="empty-state">
      <div className="empty-state-disco">
        <Disco color="marron" />
      </div>
      <p className="empty-state-mensaje">{mensaje}</p>
      {children}
    </div>
  );
}
