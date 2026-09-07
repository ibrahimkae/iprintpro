import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEV_EMAIL,
  DEV_PASSWORD,
  authedFetch,
  performDeveloperLogin,
  performGuest,
  performLogin,
  performLogout,
  performRegister,
  resolveInitialState
} from '../../context/AuthContext';

const AUTH_KEY = 'iprint_auth_v1';
const GUEST_KEY = 'iprint_guest_v1';

function installLocalStorage(seed: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(seed));
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k)
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  } as unknown as Response;
}

function mockFetch(handler: (url: string, init?: RequestInit) => Response) {
  const fn = vi.fn(async (url: string | URL | Request, init?: RequestInit) =>
    handler(String(url), init)
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  installLocalStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuthContext', () => {
  it('login success persists token+email and returns authenticated state', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ token: 'tok-123' }));
    const state = await performLogin('ali@firma.com', 'parola123');

    expect(state).toEqual({ status: 'authenticated', token: 'tok-123', email: 'ali@firma.com' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/login$/);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'ali@firma.com', password: 'parola123' });

    const stored = JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null');
    expect(stored).toEqual({ token: 'tok-123', email: 'ali@firma.com' });
  });

  it('wrong password surfaces the server Turkish error and stores nothing', async () => {
    mockFetch(() => jsonResponse({ error: 'E-posta veya şifre hatalı.' }, 401));

    await expect(performLogin('ali@firma.com', 'yanlis')).rejects.toThrow('E-posta veya şifre hatalı.');
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });

  it('register success stores token+email with authenticated status', async () => {
    const fetchMock = mockFetch((url) => {
      expect(String(url)).toMatch(/\/auth\/register$/);
      return jsonResponse({ token: 'reg-777' });
    });
    const state = await performRegister('yeni@firma.com', 'sifre456');

    expect(state).toEqual({ status: 'authenticated', token: 'reg-777', email: 'yeni@firma.com' });
    expect(JSON.parse(localStorage.getItem(AUTH_KEY)!)).toEqual({
      token: 'reg-777',
      email: 'yeni@firma.com'
    });
    expect(localStorage.getItem(GUEST_KEY)).toBeNull();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('guest mode sets flag, clears token and returns guest state', () => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: 'old', email: 'x@y.z' }));

    const state = performGuest();

    expect(state).toEqual({ status: 'guest', token: null, email: null });
    expect(localStorage.getItem(GUEST_KEY)).toBe('true');
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });

  it('logout resets to none and wipes both storage keys', () => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: 't', email: 'e@e.e' }));
    localStorage.setItem(GUEST_KEY, 'true');

    const state = performLogout();

    expect(state).toEqual({ status: 'none', token: null, email: null });
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
    expect(localStorage.getItem(GUEST_KEY)).toBeNull();
  });

  it('rehydrates authenticated state from a pre-seeded session', () => {
    installLocalStorage({
      [AUTH_KEY]: JSON.stringify({ token: 'persisted-tok', email: 'kalici@firma.com' })
    });
    expect(resolveInitialState()).toEqual({
      status: 'authenticated',
      token: 'persisted-tok',
      email: 'kalici@firma.com'
    });
  });

  it('rehydrates guest state when only the guest flag exists', () => {
    installLocalStorage({ [GUEST_KEY]: 'true' });
    expect(resolveInitialState()).toEqual({ status: 'guest', token: null, email: null });
  });

  it('starts as none when no auth data is persisted', () => {
    expect(resolveInitialState()).toEqual({ status: 'none', token: null, email: null });
  });

  it('authedFetch attaches Bearer Authorization header and JSON content-type', async () => {
    installLocalStorage({
      [AUTH_KEY]: JSON.stringify({ token: 'bearer-tok', email: 'a@b.c' })
    });
    const fetchMock = mockFetch(() => jsonResponse({ plan: 'pro' }));

    await authedFetch('/billing/entitlements');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/billing/entitlements');
    const headers = init?.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer bearer-tok');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('authedFetch throws the Turkish session-expired message on 401', async () => {
    installLocalStorage({
      [AUTH_KEY]: JSON.stringify({ token: 'expired', email: 'a@b.c' })
    });
    mockFetch(() => new Response(null, { status: 401 }));

    await expect(authedFetch('/auth/me')).rejects.toThrow('Oturum süresi doldu');
  });

  it('developer login uses the contract credentials against /auth/login', async () => {
    const fetchMock = mockFetch(() => jsonResponse({ token: 'dev-token' }));
    const state = await performDeveloperLogin();

    expect(state.status).toBe('authenticated');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/auth\/login$/);
    expect(JSON.parse(String(init?.body))).toEqual({
      email: 'dev@iprint.local',
      password: 'iprint-dev-2026'
    });
  });

  it('exposes exact developer constants required by the server seed', () => {
    expect(DEV_EMAIL).toBe('dev@iprint.local');
    expect(DEV_PASSWORD).toBe('iprint-dev-2026');
  });

  it('register without a token in response fails closed', async () => {
    mockFetch(() => jsonResponse({ user: { id: 1 } }));
    await expect(performRegister('n@o.p', 'pw')).rejects.toThrow();
    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });
});
