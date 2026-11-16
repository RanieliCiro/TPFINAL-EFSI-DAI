import api from "./api.js";

export async function getCollections() {
  const response = await api.get("/collections");
  return response.data;
}
