import React from "react";
import { Input } from "../ui/input";

const InputField = ({ id, label, type = "text", value, onChange, placeholder, required, autoFocus }) => {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
      />
    </label>
  );
};

export default InputField;
