import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { API_BASE } from '../lib/api-base';

export const DEV_EMAIL = 'dev@iprint.local';
export const DEV_PASSWORD = 'iprint-dev-2026';

const AUTH_STORAGE_KEY = 'iprint_auth_v1';
const GUEST_FLAG_KEY = 'iprint_guest_v1';
const SESSION_EXPIRED_MESSAGE = 'Oturum süresi doldu';

export interface AuthState {
  status: 'guest' | 'authenticated' | 'none';
  token: string | null;
  email: string | null;
}

export interface AuthContextValue extends AuthState {
  apiBase: string;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  loginDeveloper(): Promise<void>;
  continueAsGuest(): void;
  logout(): void;
}

interface StoredSession {
  token: string;
  email: string;
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (typeof parsed?.token === 'string' && typeof parsed?.email === 'string') {
      return { token: parsed.token, email: parsed.email };
    }
    return null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null): void {
  try {
    if (session) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}

function writeGuestFlag(active: boolean): void {
  try {
    if (active) localStorage.setItem(GUEST_FLAG_KEY, 'true');
    else localStorage.removeItem(GUEST_FLAG_KEY);
  } catch {}
}

/** Snapshot of the currently persisted session (null when none). */
export function getSessionSnapshot(): StoredSession | null {
  return readSession();
}

/** Derives the boot-time auth state from persisted storage. */
export function resolveInitialState(): AuthState {
  const session = readSession();
  if (session) return { status: 'authenticated', token: session.token, email: session.email };
  try {
    if (localStorage.getItem(GUEST_FLAG_KEY) === 'true') {
      return { status: 'guest', token: null, email: null };
    }
  } catch {}
  return { status: 'none', token: null, email: null };
}

async function authenticate(
  endpoint: 'login' | 'register',
  email: string,
  password: string
): Promise<StoredSession> {
  let res: Response;
  let payload: unknown = null;
  try {
    res = await fetch(`${API_BASE}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  } catch {
    throw new Error('Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.');
  }
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  const data = (payload ?? {}) as { error?: unknown; token?: unknown };
  if (!res.ok) {
    const message =
      typeof data.error === 'string' && data.error.length > 0
        ? data.error
        : endpoint === 'login'
          ? 'Giriş başarısız oldu.'
          : 'Kayıt başarısız oldu.';
    throw new Error(message);
  }
  if (typeof data.token !== 'string' || data.token.length === 0) {
    throw new Error('Sunucudan geçersiz yanıt alındı.');
  }
  return { token: data.token, email };
}

function adoptSession(session: StoredSession): AuthState {
  writeSession(session);
  writeGuestFlag(false);
  return { status: 'authenticated', token: session.token, email: session.email };
}

export async function performLogin(email: string, password: string): Promise<AuthState> {
  return adoptSession(await authenticate('login', email, password));
}

export async function performRegister(email: string, password: string): Promise<AuthState> {
  return adoptSession(await authenticate('register', email, password));
}

export async function performDeveloperLogin(): Promise<AuthState> {
  return performLogin(DEV_EMAIL, DEV_PASSWORD);
}

export function performGuest(): AuthState {
  writeSession(null);
  writeGuestFlag(true);
  return { status: 'guest', token: null, email: null };
}

export function performLogout(): AuthState {
  writeSession(null);
  writeGuestFlag(false);
  return { status: 'none', token: null, email: null };
}

/**
 * Fetch wrapper for authenticated API calls. Attaches the Bearer token of the
 * persisted session plus a JSON content-type; throws a Turkish session-expired
 * message on HTTP 401.
 */
export async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const session = readSession();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(init?.headers ?? {})
    }
  });
  if (res.status === 401) throw new Error(SESSION_EXPIRED_MESSAGE);
  return res;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(resolveInitialState);

  const login = useCallback(async (email: string, password: string) => {
    setState(await performLogin(email, password));
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setState(await performRegister(email, password));
  }, []);

  const loginDeveloper = useCallback(() => login(DEV_EMAIL, DEV_PASSWORD), [login]);

  const continueAsGuest = useCallback(() => {
    setState(performGuest());
  }, []);

  const logout = useCallback(() => {
    setState(performLogout());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      apiBase: API_BASE,
      login,
      register,
      loginDeveloper,
      continueAsGuest,
      logout
    }),
    [state, login, register, loginDeveloper, continueAsGuest, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
