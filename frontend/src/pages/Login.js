import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import InputField from "../components/form/InputField";
import PasswordField from "../components/form/PasswordField";
import SubmitButton from "../components/form/SubmitButton";
import { useToast } from "../components/ui/use-toast";
import { getErrorMessage } from "../services/errorMapper";

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      toast({ title: "Logged in", description: "Welcome back.", variant: "success" });
      navigate(result?.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyan-700">Welcome back</p>
      <h1 className="mt-2 text-2xl font-black">Login</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <InputField id="login-email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        <PasswordField id="login-password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <SubmitButton isLoading={isLoading} loadingLabel="Signing in...">Sign in</SubmitButton>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Don&apos;t have an account? <Link to="/register" className="font-semibold text-cyan-700">Register</Link>
      </p>
    </div>
  );
};

export default Login;
