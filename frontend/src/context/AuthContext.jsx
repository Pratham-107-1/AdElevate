import { createContext, useContext, useState, useCallback } from "react";
import { coreApi } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "adelevate_auth"; // { token, userId, role, email }
const TOKEN_KEY = "adelevate_token";  // kept in sync so api/client.js can read it directly

function loadStoredAuth() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistAuth(auth) {
  if (auth) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    sessionStorage.setItem(TOKEN_KEY, auth.token);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth);

  const login = useCallback(async (email, password) => {
    const res = await coreApi.post("/api/auth/login", { email, password });
    // { token, userId, role, email }
    const nextAuth = res.data;
    setAuth(nextAuth);
    persistAuth(nextAuth);
    return nextAuth;
  }, []);

  // /api/auth/register doesn't return a token, so we log in right after
  // with the same credentials — avoids making the vendor/customer type
  // their password twice in a row.
  const register = useCallback(async (payload) => {
    await coreApi.post("/api/auth/register", payload);
    return login(payload.email, payload.password);
  }, [login]);

  const logout = useCallback(() => {
    setAuth(null);
    persistAuth(null);
  }, []);

  const value = {
    isAuthenticated: !!auth,
    token: auth?.token ?? null,
    userId: auth?.userId ?? null,
    role: auth?.role ?? null, // "ADMIN" | "CUSTOMER" | "VENDOR"
    email: auth?.email ?? null,
    name: auth?.name ?? null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
