import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import ToastContainer from "./ToastContainer";
import { TOAST_EVENT_NAME } from "./toastBus";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timerId = timers.current.get(id);
    if (timerId) {
      clearTimeout(timerId);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    ({ title, description, variant = "info", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast = { id, title, description, variant };
      setToasts((current) => [...current, toast]);

      const timerId = window.setTimeout(() => {
        dismiss(id);
      }, duration);

      timers.current.set(id, timerId);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const timerStore = timers.current;

    const handleGlobalToast = (event) => {
      push(event.detail ?? {});
    };

    window.addEventListener(TOAST_EVENT_NAME, handleGlobalToast);

    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, handleGlobalToast);
      timerStore.forEach((timerId) => clearTimeout(timerId));
      timerStore.clear();
    };
  }, [push]);

  const value = useMemo(
    () => ({
      toast: push,
      dismiss,
    }),
    [dismiss, push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};
