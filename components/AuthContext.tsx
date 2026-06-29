"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, login as loginRequest, register as registerRequest, logout as logoutRequest, type AuthUser } from "@/lib/api/authService";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((result) => {
        if (result.success && result.data) setUser(result.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    if (result.success) {
      setUser(result.data);
      return { ok: true };
    }
    return { ok: false, message: result.message };
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await registerRequest(email, password, name);
    if (result.success) {
      setUser(result.data);
      return { ok: true };
    }
    return { ok: false, message: result.message };
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
