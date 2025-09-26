// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", // backend base URL
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // token stored after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
