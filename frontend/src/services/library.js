import api from "./api.js";

export async function getLibrary() {
  const response = await api.get("/library");
  return response.data;
}

export async function addToLibrary(cancion) {
  const { track_id, titulo, artista, album, portada_url, genero, anio } = cancion;
  const response = await api.post("/library", { track_id, titulo, artista, album, portada_url, genero, anio });
  return response.data;
}

export async function updateLibraryItem(id, cambios) {
  const response = await api.patch(`/library/${id}`, cambios);
  return response.data;
}

export async function removeFromLibrary(id) {
  await api.delete(`/library/${id}`);
}
