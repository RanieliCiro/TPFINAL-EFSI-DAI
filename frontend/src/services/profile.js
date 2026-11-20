import api from "./api.js";

export async function getProfile() {
  const response = await api.get("/profile");
  return response.data;
}

export async function updateProfile(datos) {
  const response = await api.put("/profile", datos);
  return response.data;
}
