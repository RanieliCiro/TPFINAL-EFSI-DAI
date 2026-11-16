import api from "./api.js";

export async function getActivity() {
  const response = await api.get("/activity");
  return response.data;
}
