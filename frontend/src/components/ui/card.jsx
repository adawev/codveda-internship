import React from "react";
import { cn } from "../../lib/utils";

export const Card = ({ className, ...props }) => (
  <div className={cn("rounded-lg border border-slate-200 bg-white", className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn("px-4 pt-4", className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <div className={cn("text-sm font-medium text-slate-500", className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("px-4 pb-4", className)} {...props} />
);
