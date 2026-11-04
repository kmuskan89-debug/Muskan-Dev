import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  timeout: 10000, // 10-second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export { useProjects } from "../hooks/useProjects";

export default api;
