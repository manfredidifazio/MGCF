import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000" });

function notifyAccountStatementsUpdated() {
  window.dispatchEvent(new CustomEvent("mgcf:account-statements-updated"));
}
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getAccountStatements() {
  const { data } = await api.get("/account-statements");
  return data.statements;
}

export async function createAccountStatement(fields) {
  const { data } = await api.post("/account-statements", fields);
  notifyAccountStatementsUpdated();
  return data.statement;
}

export async function updateAccountStatement(id, fields) {
  const { data } = await api.put(`/account-statements/${id}`, fields);
  notifyAccountStatementsUpdated();
  return data.statement;
}

export async function deleteAccountStatement(id) {
  await api.delete(`/account-statements/${id}`);
  notifyAccountStatementsUpdated();
}
