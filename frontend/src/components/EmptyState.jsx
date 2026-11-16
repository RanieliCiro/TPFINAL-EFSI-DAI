import "./EmptyState.css";

export default function EmptyState({ mensaje, children }) {
  return (
    <div className="empty-state">
      <p>{mensaje}</p>
      {children}
    </div>
  );
}
