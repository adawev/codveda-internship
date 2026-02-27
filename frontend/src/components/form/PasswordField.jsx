import React, { useState } from "react";
import { Input } from "../ui/input";

const PasswordField = ({ id, label, value, onChange, placeholder, required, autoFocus }) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 text-sm text-slate-700"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
};

export default PasswordField;
