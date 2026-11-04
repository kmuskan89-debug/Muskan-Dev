import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  timeout: 10000, // 10-second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach admin JWT from sessionStorage to all outgoing requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 unauthorized, clear stored token and notify components
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      if (sessionStorage.getItem("admin_token")) {
        sessionStorage.removeItem("admin_token");
        window.dispatchEvent(new Event("admin-auth-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export { useProjects } from "../hooks/useProjects";

export default api;
