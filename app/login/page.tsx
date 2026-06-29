"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.ok) {
      window.location.href = "/";
    } else {
      setError(result.message || "Incorrect email or password.");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="font-display text-heading-card font-bold">Log in</h1>
        {error && <p className="mt-3 text-sm text-danger-600">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <Button type="submit" fullWidth>Log in</Button>
        </form>
        <p className="mt-3 text-xs text-muted">Don't have an account? <a href="/register" className="text-brand-600 hover:underline">Sign up</a></p>
      </div>
    </div>
  );
}
