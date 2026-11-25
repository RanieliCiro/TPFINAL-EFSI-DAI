import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <Loader />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
