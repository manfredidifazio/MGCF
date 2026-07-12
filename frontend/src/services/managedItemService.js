import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function flattenItem(item) {
  return { ...item, ...(item.details ?? {}) };
}

function notify(type) {
  window.dispatchEvent(new CustomEvent("mgcf:managed-items-updated", { detail: { type } }));
}

export async function getManagedItems(type) {
  const { data } = await api.get(`/managed-items/${type}`);
  return data.items.map(flattenItem);
}

export async function createManagedItem(type, fields) {
  const { data } = await api.post(`/managed-items/${type}`, fields);
  notify(type);
  return flattenItem(data.item);
}

export async function updateManagedItem(type, id, fields) {
  const { data } = await api.put(`/managed-items/${type}/${id}`, fields);
  notify(type);
  return flattenItem(data.item);
}

export async function updateManagedItemStatus(type, id, active) {
  const { data } = await api.patch(`/managed-items/${type}/${id}/status`, { active });
  notify(type);
  return flattenItem(data.item);
}

export async function reorderManagedItems(type, items) {
  const { data } = await api.patch(`/managed-items/${type}/reorder`, { items });
  notify(type);
  return data.items.map(flattenItem);
}

export async function deleteManagedItem(type, id) {
  await api.delete(`/managed-items/${type}/${id}`);
  notify(type);
}
