/* ──────────────────────────────────────────────
 *  Auth context & provider
 *
 *  • Calls GET /api/auth/me/ on mount to restore session
 *  • Exposes user, login, logout to the whole tree
 *  • Registers a 401 callback so any API call that
 *    returns 401 automatically clears auth state
 * ────────────────────────────────────────────── */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { setOnUnauthorized } from "../lib/api-client";
import * as authApi from "../lib/auth-api";
import type { LoginCredentials, User } from "../lib/types";

/* ── Context shape ── */

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/* ── Provider ── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear state on 401 from any request
  const clearAuth = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(clearAuth);
    return () => setOnUnauthorized(null);
  }, [clearAuth]);

  // Restore session on mount
  useEffect(() => {
    const controller = new AbortController();

    authApi
      .getMe(controller.signal)
      .then(setUser)
      .catch((err: unknown) => {
        // 401 is expected when not logged in
        if (err instanceof DOMException && err.name === "AbortError") return;
        setUser(null);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const loggedIn = await authApi.login(credentials);
    setUser(loggedIn);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort logout
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── Hook ── */

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
