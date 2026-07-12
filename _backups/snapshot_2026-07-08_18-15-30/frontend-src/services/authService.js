import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function register(fields) {
  const { data } = await api.post("/auth/register", fields);
  return data;
}

export async function verifyEmail(token) {
  const { data } = await api.post("/auth/verify-email", { token });
  return data;
}

export async function me() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function forgotPassword(email) {
  const { data } = await api.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(token, password, confirmPassword) {
  const { data } = await api.post("/auth/reset-password", { token, password, confirmPassword });
  return data;
}

export async function updateProfile(username) {
  const { data } = await api.put("/auth/profile", { username });
  return data;
}

export async function updateEmail(email) {
  const { data } = await api.put("/auth/email", { email });
  return data;
}

export async function updatePassword(currentPassword, newPassword) {
  const { data } = await api.put("/auth/password", { currentPassword, newPassword });
  return data;
}

export async function deleteOwnAccount() {
  const { data } = await api.delete("/auth/me");
  return data;
}
