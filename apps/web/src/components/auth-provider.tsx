'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearAuth, getStoredUser, getToken, setAuth, type StoredUser } from '@/lib/auth';
import { apiGet } from '@/lib/api';

interface AuthState {
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setToken(null);
      return;
    }
    try {
      const me = await apiGet<{
        user: { id: string; email: string; username?: string; name?: string };
      }>('/auth/me', t);
      const u: StoredUser = {
        id: me.user.id,
        username: me.user.username ?? me.user.name ?? me.user.email,
        email: me.user.email,
      };
      setAuth(t, u);
      setUser(u);
      setToken(t);
    } catch {
      clearAuth();
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const u = getStoredUser();
    const t = getToken();
    setUser(u);
    setToken(t);
    if (t) refreshMe().finally(() => setLoading(false));
    else setLoading(false);
  }, [refreshMe]);

  const loginWithGoogle = () => {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
    window.location.href = `${api}/auth/google`;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
