import axios from "axios";
import { emitToast } from "../components/toast/toastBus";
import { getErrorMessage } from "./errorMapper";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${baseURL}/api/auth/refresh`, {
          refreshToken,
        });
        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }

        emitToast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "warning",
        });

        return Promise.reject(refreshError);
      }
    }

    const status = error.response?.status;
    if (!original.suppressErrorToast && status >= 400) {
      emitToast({
        title: status >= 500 ? "Server error" : "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
