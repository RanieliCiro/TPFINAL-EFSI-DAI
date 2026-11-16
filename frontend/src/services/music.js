import api from "./api.js";

export async function searchMusic(term) {
  const response = await api.get("/music/search", { params: { term } });
  return response.data;
}
