"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    const result = await register(email, password, name);
    if (result.ok) {
      window.location.href = "/";
    } else {
      setError(result.message || "Email is already registered, or an error occurred.");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="font-display text-heading-card font-bold">Create Account</h1>
        {error && <p className="mt-3 text-sm text-danger-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name (optional)" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 characters)" required />
          <Button type="submit" fullWidth>Sign up</Button>
        </form>
        <p className="mt-3 text-xs text-muted">Already have an account? <a href="/login" className="text-brand-600 hover:underline">Log in</a></p>
      </div>
    </div>
  );
}
