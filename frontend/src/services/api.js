import axios from "axios";
import { emitToast } from "../components/toast/toastBus";
import { getErrorMessage } from "./errorMapper";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
let accessToken = null;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const API_BASE_URL = baseURL;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

const unwrapApiResponse = (payload) => {
  if (payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "data")) {
    return payload.data;
  }
  return payload;
};

const clearSessionAndLogout = () => {
  accessToken = null;

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:logout"));
  }
};

const shouldForceLogoutOn403 = (error) => {
  const path = error.config?.url || "";
  if (path.includes("/api/auth/login") || path.includes("/api/auth/register") || path.includes("/api/auth/refresh")) {
    return false;
  }

  if (!accessToken) {
    return false;
  }

  const message = String(error.response?.data?.message || "").toLowerCase();
  return (
    message.includes("user not found") ||
    message.includes("authentication required") ||
    message.includes("invalid jwt") ||
    message.includes("unauthorized")
  );
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data = unwrapApiResponse(response.data);
    return response;
  },
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const path = original.url || "";

    if (status === 401 && !original._retry && !path.includes("/api/auth/refresh")) {
      original._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/api/auth/refresh`,
          {},
          { withCredentials: true, suppressErrorToast: true }
        );
        const newAccessToken = refreshResponse.data?.data?.accessToken ?? refreshResponse.data?.accessToken;
        setAccessToken(newAccessToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshError) {
        clearSessionAndLogout();

        emitToast({
          title: "Session expired",
          description: "Please sign in again.",
          variant: "warning",
        });

        return Promise.reject(refreshError);
      }
    }

    if (status === 403 && shouldForceLogoutOn403(error)) {
      clearSessionAndLogout();
      emitToast({
        title: "Session invalid",
        description: "Your account session is no longer valid. Please sign in again.",
        variant: "warning",
      });
      return Promise.reject(error);
    }

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
