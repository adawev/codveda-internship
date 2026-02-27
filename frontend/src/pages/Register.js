import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import InputField from "../components/form/InputField";
import PasswordField from "../components/form/PasswordField";
import SubmitButton from "../components/form/SubmitButton";
import { useToast } from "../components/ui/use-toast";

const Register = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await register(name, email, password);
      toast({ title: "Account created", description: "Redirecting to login.", variant: "success" });
      setTimeout(() => navigate("/login"), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Create account</p>
      <h1 className="mt-2 text-2xl font-black">Register</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <InputField id="register-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <InputField id="register-email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PasswordField id="register-password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <SubmitButton isLoading={isLoading} loadingLabel="Creating...">Create account</SubmitButton>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already registered? <Link to="/login" className="font-semibold text-cyan-700">Login</Link>
      </p>
    </div>
  );
};

export default Register;
