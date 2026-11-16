import "./AuthLayout.css";

export default function AuthLayout({ discos, children }) {
  return (
    <div className="auth">
      <aside className="auth-panel">
        <div className="auth-logo">
          <span className="auth-logo-icono">
            <span className="auth-logo-disco" />
          </span>
          <span>
            Sound<span className="auth-acento">Shelf</span>
          </span>
        </div>

        <h1 className="auth-titulo">
          <span>Tu música.</span>
          <span className="auth-acento">Tu colección.</span>
          <span>Tu historia.</span>
        </h1>

        <p className="auth-bajada">Un espacio para guardar los discos y las canciones que te acompañan.</p>

        <div className="auth-discos">
          {discos.map((color) => (
            <div key={color} className={`auth-disco auth-disco-${color}`}>
              <span className="auth-disco-vinilo" />
            </div>
          ))}
        </div>
      </aside>

      <main className="auth-contenido">{children}</main>
    </div>
  );
}
