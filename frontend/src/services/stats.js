import api from "./api.js";

export async function getStats() {
  const response = await api.get("/stats");
  return response.data;
}
