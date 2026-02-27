import React from "react";

const Modal = ({ open, title, onClose, children }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
