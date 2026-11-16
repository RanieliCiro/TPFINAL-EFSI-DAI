import Logo from "./Logo.jsx";
import Disco from "./Disco.jsx";
import "./AuthLayout.css";

export default function AuthLayout({ discos, children }) {
  return (
    <div className="auth">
      <aside className="auth-panel">
        <div className="auth-logo">
          <Logo />
        </div>

        <h1 className="auth-titulo">
          <span>Tu música.</span>
          <span className="auth-acento">Tu colección.</span>
          <span>Tu historia.</span>
        </h1>

        <p className="auth-bajada">Un espacio para guardar los discos y las canciones que te acompañan.</p>

        <div className="auth-discos">
          {discos.map((color) => (
            <Disco key={color} color={color} />
          ))}
        </div>
      </aside>

      <main className="auth-contenido">{children}</main>
    </div>
  );
}
