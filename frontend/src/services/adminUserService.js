import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getAdminUsers(search = "") {
  const { data } = await api.get("/admin/users", { params: { search } });
  return data.users;
}

export async function updateAdminUser(id, user) {
  const { data } = await api.put(`/admin/users/${id}`, user);
  return data.user;
}

export async function deleteAdminUser(id) {
  await api.delete(`/admin/users/${id}`);
}
