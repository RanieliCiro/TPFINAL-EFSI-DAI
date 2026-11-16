import api from "./api.js";

export async function register(datos) {
  const response = await api.post("/auth/register", datos);
  return response.data;
}

export async function login(datos) {
  const response = await api.post("/auth/login", datos);
  return response.data;
}

export async function me() {
  const response = await api.get("/auth/me");
  return response.data;
}
