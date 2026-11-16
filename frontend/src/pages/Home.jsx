import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { usuario, logout } = useAuth();

  return (
    <main>
      <h1>Hola, {usuario.username}</h1>
      <button onClick={logout}>Cerrar sesión</button>
    </main>
  );
}
