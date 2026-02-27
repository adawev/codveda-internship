import React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";

const toastVariants = {
  default: "border-slate-200 bg-white",
  success: "border-emerald-200 bg-emerald-50",
  destructive: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-sky-200 bg-sky-50",
};

export const ToastViewport = ({ children }) => (
  <div className="fixed right-4 top-4 z-[100] grid w-[calc(100vw-2rem)] max-w-sm gap-2 sm:w-full" aria-live="polite" aria-atomic="true">
    {children}
  </div>
);

export const Toast = ({ className, variant = "default", children, ...props }) => (
  <div
    role={variant === "destructive" ? "alert" : "status"}
    className={cn(
      "pointer-events-auto flex items-start justify-between gap-3 rounded-md border p-4 shadow-lg",
      toastVariants[variant] || toastVariants.default,
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const ToastTitle = ({ className, ...props }) => (
  <p className={cn("text-sm font-semibold text-slate-900", className)} {...props} />
);

export const ToastDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-slate-600", className)} {...props} />
);

export const ToastClose = ({ onClick }) => (
  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onClick} aria-label="Dismiss notification">
    x
  </Button>
);
