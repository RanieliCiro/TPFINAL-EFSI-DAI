import api from "./api.js";

export async function getCollections() {
  const response = await api.get("/collections");
  return response.data;
}

export async function getCollection(id) {
  const response = await api.get(`/collections/${id}`);
  return response.data;
}

export async function createCollection(datos) {
  const response = await api.post("/collections", datos);
  return response.data;
}

export async function updateCollection(id, datos) {
  const response = await api.patch(`/collections/${id}`, datos);
  return response.data;
}

export async function deleteCollection(id) {
  await api.delete(`/collections/${id}`);
}

export async function addItem(id, bibliotecaId) {
  const response = await api.post(`/collections/${id}/items`, { biblioteca_id: bibliotecaId });
  return response.data;
}

export async function removeItem(id, bibliotecaId) {
  await api.delete(`/collections/${id}/items/${bibliotecaId}`);
}
