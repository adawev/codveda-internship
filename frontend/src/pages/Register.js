import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      await register(name, email, password);
      setMessage("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      setMessage("Registration failed.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Get started</p>
          <h2>Create your account</h2>
          <p className="note">Join to build your cart and track orders.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="Choose a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit">Create account</button>
        {message && <p className="note">{message}</p>}
      </form>
    </div>
  );
};

export default Register;
