import React from "react";
import { cn } from "../../lib/utils";

export const Badge = ({ className, children }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white",
        className
      )}
    >
      {children}
    </span>
  );
};
