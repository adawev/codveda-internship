import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "USER") {
      setCartCount(0);
      return;
    }

    try {
      const response = await api.get("/api/cart", { suppressErrorToast: true });
      const totalItems = (response.data?.items ?? []).reduce(
        (sum, item) => sum + (item.quantity ?? 0),
        0
      );
      setCartCount(totalItems);
    } catch (error) {
      setCartCount(0);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = useMemo(
    () => ({
      cartCount,
      refreshCart,
      setCartCount,
    }),
    [cartCount, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};
