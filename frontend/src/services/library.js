import api from "./api.js";

export async function getLibrary() {
  const response = await api.get("/library");
  return response.data;
}
