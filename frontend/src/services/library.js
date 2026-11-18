import api from "./api.js";

export async function getLibrary() {
  const response = await api.get("/library");
  return response.data;
}

export async function addToLibrary(cancion) {
  const response = await api.post("/library", cancion);
  return response.data;
}

export async function updateLibraryItem(id, cambios) {
  const response = await api.patch(`/library/${id}`, cambios);
  return response.data;
}

export async function deleteLibraryItem(id) {
  await api.delete(`/library/${id}`);
}
