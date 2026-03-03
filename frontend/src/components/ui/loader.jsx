import React from "react";

const Loader = ({ label = "Loading..." }) => (
  <div className="p-6">
    <div
      className="inline-flex items-center gap-2 text-sm text-slate-500"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  </div>
);

export default Loader;
