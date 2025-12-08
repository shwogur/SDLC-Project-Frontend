import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8070/api/complaints",
});

export default api;