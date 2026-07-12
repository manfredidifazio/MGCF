import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function getSecurity() {
  const { data } = await api.get("/security");
  return data;
}

export async function updateSecurityAnswers(
  middleSchoolAnswer,
  dogNameAnswer
) {
  const { data } = await api.put("/security", {
    middleSchoolAnswer,
    dogNameAnswer,
  });

  return data;
}

export async function updatePassword(currentPassword, newPassword) {
  const { data } = await api.put("/security/password", {
    currentPassword,
    newPassword,
  });

  return data;
}
