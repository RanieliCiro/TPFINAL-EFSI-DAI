import api from "./api.js";

export async function createReview(bibliotecaId, texto) {
  const response = await api.post("/reviews", { biblioteca_id: bibliotecaId, texto });
  return response.data;
}

export async function updateReview(id, texto) {
  const response = await api.patch(`/reviews/${id}`, { texto });
  return response.data;
}

export async function deleteReview(id) {
  await api.delete(`/reviews/${id}`);
}
