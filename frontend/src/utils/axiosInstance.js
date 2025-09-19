import axios from "axios";
import { BASE_URL } from "./apiPath";

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    // Không set Content-Type mặc định để axios tự xác định (đặc biệt với FormData)
    Accept: "application/json",
  },
});

// Request Interceptor
instance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // Nếu gửi FormData, loại bỏ Content-Type để axios tự thêm boundary
    if (config.data instanceof FormData) {
      if (config.headers && config.headers["Content-Type"]) {
        delete config.headers["Content-Type"]; 
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        window.location.href = "/login";
      } else if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export const axiosInstance = instance;
export default instance;
