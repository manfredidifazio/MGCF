import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
});

function notifyAccountsUpdated() {
  window.dispatchEvent(new CustomEvent("mgcf:accounts-updated"));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getAccounts() {
  const { data } = await api.get("/accounts");
  return data.accounts;
}

export async function createAccount(account) {
  const { data } = await api.post("/accounts", account);
  notifyAccountsUpdated();
  return data.account;
}

export async function updateAccount(id, account) {
  const { data } = await api.put(`/accounts/${id}`, account);
  notifyAccountsUpdated();
  return data.account;
}

export async function updateAccountStatus(id, active) {
  const { data } = await api.patch(`/accounts/${id}/status`, { active });
  notifyAccountsUpdated();
  return data.account;
}

export async function deleteAccount(id) {
  await api.delete(`/accounts/${id}`);
  notifyAccountsUpdated();
}
