import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarUsuario() {
      if (localStorage.getItem("token")) {
        try {
          const datos = await authService.me();
          setUsuario(datos);
        } catch (error) {
          localStorage.removeItem("token");
        }
      }
      setCargando(false);
    }
    cargarUsuario();
  }, []);

  function iniciarSesion(datos) {
    localStorage.setItem("token", datos.token);
    setUsuario(datos.usuario);
  }

  async function login(email, password) {
    const datos = await authService.login({ email, password });
    iniciarSesion(datos);
  }

  async function register(username, email, password, confirmPassword) {
    const datos = await authService.register({ username, email, password, confirmPassword });
    iniciarSesion(datos);
  }

  function logout() {
    localStorage.removeItem("token");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, register, logout, actualizarUsuario: setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
