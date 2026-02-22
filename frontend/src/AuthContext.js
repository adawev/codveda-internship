import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedEmail = localStorage.getItem("userEmail");
    const storedRole = localStorage.getItem("userRole");
    if (storedAccessToken && storedEmail && storedRole) {
      setAccessToken(storedAccessToken);
      setUser({ email: storedEmail, role: storedRole });
    }
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      setAccessToken(null);
      setUser(null);
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { accessToken: newAccessToken, refreshToken, role } = response.data;

    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);

    setAccessToken(newAccessToken);
    setUser({ email, role });
  };

  const register = async (name, email, password) => {
    await api.post("/api/auth/register", { name, email, password });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setAccessToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: !!accessToken,
      user,
      login,
      register,
      logout,
    }),
    [accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
