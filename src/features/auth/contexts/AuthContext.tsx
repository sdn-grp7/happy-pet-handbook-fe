import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { User } from "@/features/auth/types";
import {
  loginWithEmail,
  loginWithGoogle,
  register as registerApi,
} from "@/features/auth/api/authApi";

const AUTH_STORAGE_KEY = "pawpath-auth-v1";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUser());
  const [loading, setLoading] = useState(false);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const u = await loginWithEmail(email, password);
        if (u) {
          persist(u);
          return true;
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const loginGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      persist(u);
    } finally {
      setLoading(false);
    }
  }, [persist]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      try {
        const u = await registerApi(name, email, password);
        persist(u);
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
