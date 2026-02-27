import React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "../ui/toast";

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          <div className="grid gap-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
          <ToastClose onClick={() => onDismiss(toast.id)} />
        </Toast>
      ))}
    </ToastViewport>
  );
};

export default ToastContainer;
