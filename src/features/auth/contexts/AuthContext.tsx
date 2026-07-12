import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User } from "@/features/auth/types";
import {
  fetchMe,
  loginWithEmail,
  loginWithGoogle,
  register as registerApi,
  updateProfile,
  changePassword as changePasswordApi,
} from "@/features/auth/api/authApi";
import { ApiError } from "@/lib/api";

const TOKEN_STORAGE_KEY = "pawpath-token-v1";
const AUTH_STORAGE_KEY = "pawpath-auth-v1";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (idToken: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (user: User) => void;
  updateAvatar: (avatarUrl: string) => Promise<User>;
  changePassword: (newPassword: string, currentPassword?: string) => Promise<User>;
  logout: () => void;
  lastError: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function loadCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => loadToken());
  const [user, setUser] = useState<User | null>(() => (loadToken() ? loadCachedUser() : null));
  const [loading, setLoading] = useState(Boolean(loadToken()));
  const [lastError, setLastError] = useState<string | null>(null);

  const persist = useCallback((nextToken: string | null, nextUser: User | null) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken && nextUser) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("pawpath-avatar-v1");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const existing = loadToken();
      if (!existing) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe(existing);
        if (!cancelled) persist(existing, me);
      } catch {
        if (!cancelled) persist(null, null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [persist]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setLastError(null);
      try {
        const { token: nextToken, user: nextUser } = await loginWithEmail(email, password);
        persist(nextToken, nextUser);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Login failed";
        setLastError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const loginGoogle = useCallback(
    async (idToken: string) => {
      setLoading(true);
      setLastError(null);
      try {
        const { token: nextToken, user: nextUser } = await loginWithGoogle(idToken);
        persist(nextToken, nextUser);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Google sign-in failed";
        setLastError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);
      setLastError(null);
      try {
        const { token: nextToken, user: nextUser } = await registerApi(name, email, password);
        persist(nextToken, nextUser);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : "Registration failed";
        setLastError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const updateUser = useCallback(
    (next: User) => {
      if (!token) return;
      persist(token, next);
    },
    [persist, token],
  );

  const updateAvatar = useCallback(
    async (avatarUrl: string) => {
      if (!token) throw new Error("Not authenticated");
      const next = await updateProfile(token, { avatar: avatarUrl });
      persist(token, next);
      return next;
    },
    [persist, token],
  );

  const changePassword = useCallback(
    async (newPassword: string, currentPassword?: string) => {
      if (!token) throw new Error("Not authenticated");
      const next = await changePasswordApi(token, newPassword, currentPassword);
      persist(token, next);
      return next;
    },
    [persist, token],
  );

  const logout = useCallback(() => persist(null, null), [persist]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginGoogle,
        register,
        updateUser,
        updateAvatar,
        changePassword,
        logout,
        lastError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
