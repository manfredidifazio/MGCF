import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000" });

function notifyAccreditsUpdated() {
  window.dispatchEvent(new CustomEvent("mgcf:accredits-updated"));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getAccredits() {
  const { data } = await api.get("/accredits");
  return data.accredits;
}

export async function createAccredit(fields) {
  const { data } = await api.post("/accredits", fields);
  notifyAccreditsUpdated();
  return data.accredit;
}

export async function updateAccredit(id, fields) {
  const { data } = await api.put(`/accredits/${id}`, fields);
  notifyAccreditsUpdated();
  return data.accredit;
}

export async function deleteAccredit(id) {
  await api.delete(`/accredits/${id}`);
  notifyAccreditsUpdated();
}
