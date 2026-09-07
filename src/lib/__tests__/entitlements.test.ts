import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  FREE_LIMITS,
  can,
  fetchEntitlements,
  cacheEntitlements,
  getCachedEntitlements,
  isCacheFresh,
  type Entitlements
} from '../entitlements';

function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k)
  });
}

const NOW = new Date('2026-08-26T12:00:00Z').getTime();

const proEntitlements = (): Entitlements => ({
  plan: 'pro',
  source: 'server',
  checkedAt: NOW,
  features: {
    batchUnlimited: true,
    marketplace: true,
    pos: true,
    service: true,
    warehouse: true,
    customBranding: true
  }
});

const featureKeys = [
  'batchUnlimited',
  'marketplace',
  'pos',
  'service',
  'warehouse',
  'customBranding'
] as const;

describe('entitlements — free defaults', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('FREE_LIMITS exposes the SPEC-05 free tier numbers', () => {
    expect(FREE_LIMITS).toEqual({ batchRows: 3, historyItems: 5, drafts: 5 });
  });

  it('fetch failure with empty storage yields free defaults from cache source', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    );
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('free');
    expect(e.source).toBe('cache');
    expect(typeof e.checkedAt).toBe('number');
    for (const k of featureKeys) {
      expect(can(k, e)).toBe(false);
      expect(e.features[k]).toBe(false);
    }
  });

  it('can() matrix: free plan denies every gated feature', () => {
    const e: Entitlements = {
      plan: 'free',
      source: 'server',
      checkedAt: NOW,
      features: Object.fromEntries(featureKeys.map(k => [k, false])) as Entitlements['features']
    };
    expect(featureKeys.map(k => can(k, e))).toEqual([
      false,
      false,
      false,
      false,
      false,
      false
    ]);
  });

  it('can() matrix: pro plan grants every gated feature regardless of flags', () => {
    const e = proEntitlements();
    for (const k of featureKeys) expect(can(k, e)).toBe(true);
  });

  it('can() matrix: pro plan still true even if a flag is explicitly false', () => {
    const e = proEntitlements();
    e.features.pos = false;
    expect(can('pos', e)).toBe(true);
  });

  it('can() matrix: free plan honors per-feature server overrides', () => {
    const e: Entitlements = {
      plan: 'free',
      source: 'server',
      checkedAt: NOW,
      features: {
        batchUnlimited: false,
        marketplace: true,
        pos: false,
        service: false,
        warehouse: false,
        customBranding: false
      }
    };
    expect(can('marketplace', e)).toBe(true);
    expect(can('pos', e)).toBe(false);
  });
});

describe('entitlements — cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.unstubAllGlobals();
    installLocalStorage();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('cache roundtrip preserves plan and features', () => {
    const e = proEntitlements();
    cacheEntitlements(e);
    const got = getCachedEntitlements();
    expect(got).not.toBeNull();
    expect(got!.plan).toBe('pro');
    expect(got!.source).toBe('server');
    expect(got!.features).toEqual(e.features);
  });

  it('empty and corrupt storage return null instead of throwing', () => {
    expect(getCachedEntitlements()).toBeNull();
    localStorage.setItem('iprint_entitlements_v1', '{not-json');
    expect(getCachedEntitlements()).toBeNull();
  });

  it('isCacheFresh boundary: exactly 7 days is fresh, 7d+1ms is stale', () => {
    const e = proEntitlements();
    expect(isCacheFresh(e)).toBe(true);
    vi.setSystemTime(NOW + 7 * 24 * 60 * 60 * 1000);
    expect(isCacheFresh(e)).toBe(true);
    vi.setSystemTime(NOW + 7 * 24 * 60 * 60 * 1000 + 1);
    expect(isCacheFresh(e)).toBe(false);
  });

  it('getCachedEntitlements returns null past the 7-day window', () => {
    cacheEntitlements(proEntitlements());
    vi.setSystemTime(NOW + 7 * 24 * 60 * 60 * 1000);
    expect(getCachedEntitlements()).not.toBeNull();
    vi.setSystemTime(NOW + 7 * 24 * 60 * 60 * 1000 + 1);
    expect(getCachedEntitlements()).toBeNull();
  });

  it('fetch rejection falls back to fresh cache with source cache', async () => {
    cacheEntitlements({ ...proEntitlements(), checkedAt: NOW - 1000 });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('network down'))
    );
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('pro');
    expect(e.source).toBe('cache');
    expect(e.features.batchUnlimited).toBe(true);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/billing/entitlements'), {
      method: 'GET',
      headers: { Authorization: 'Bearer tok' }
    });
  });

  it('fetch rejection with stale (>7d) cache degrades to free defaults', async () => {
    cacheEntitlements({
      ...proEntitlements(),
      checkedAt: NOW - 8 * 24 * 60 * 60 * 1000
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('offline day 8'))
    );
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('free');
    expect(e.source).toBe('cache');
    expect(e.features.marketplace).toBe(false);
  });

  it('successful fetch normalizes server payload, marks source server and caches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ plan: 'pro' })
      })
    );
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('pro');
    expect(e.source).toBe('server');
    expect(getCachedEntitlements()?.plan).toBe('pro');
  });

  it('malformed server JSON (unparseable body) is treated as free', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => Promise.reject(new SyntaxError('Unexpected token < in JSON'))
      })
    );
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('free');
    expect(e.features.warehouse).toBe(false);
  });

  it('malformed server JSON (garbage object shape) is treated as free and not cached', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ foo: '<html>gateway error</html>' })
      })
    );
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('free');
    expect(getCachedEntitlements()).toBeNull();
  });

  it('HTTP error status follows the offline fallback path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) })
    );
    cacheEntitlements(proEntitlements());
    const e = await fetchEntitlements('tok');
    expect(e.plan).toBe('pro');
    expect(e.source).toBe('cache');
  });
});
