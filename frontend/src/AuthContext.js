import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { setAccessToken as setApiAccessToken } from "./services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const refreshResponse = await api.post("/api/auth/refresh", {}, { suppressErrorToast: true });
        const nextAccessToken = refreshResponse.data?.accessToken;
        if (!nextAccessToken) {
          return;
        }
        setAccessTokenState(nextAccessToken);
        const meResponse = await api.get("/api/users/me", { suppressErrorToast: true });
        setUser({
          email: meResponse.data?.email,
          role: meResponse.data?.role,
          id: meResponse.data?.id,
        });
      } catch (error) {
        setAccessTokenState(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    setApiAccessToken(accessToken);
  }, [accessToken]);

  useEffect(() => {
      const handleForcedLogout = () => {
      setAccessTokenState(null);
      setUser(null);
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password }, { suppressErrorToast: true });
    const { accessToken: newAccessToken, role, userId } = response.data;

    setAccessTokenState(newAccessToken);
    setUser({ email, role, id: userId });

    return { role, userId, email };
  };

  const register = async (name, email, password) => {
    await api.post("/api/auth/register", { name, email, password });
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { suppressErrorToast: true });
    } catch (error) {
      // Ignore logout API failures and clear local auth state anyway.
    }
    setAccessTokenState(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated: !!accessToken,
      isLoading,
      user,
      login,
      register,
      logout,
    }),
    [accessToken, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
