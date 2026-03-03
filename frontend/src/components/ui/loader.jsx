import React from "react";

const Loader = ({ label = "Loading..." }) => (
  <div className="flex min-h-screen items-center justify-center p-6">
    <div
      className="inline-flex items-center gap-4 px-2 py-2 text-2xl font-semibold text-slate-700"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span
        className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  </div>
);

export default Loader;
