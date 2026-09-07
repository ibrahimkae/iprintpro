export type Plan = 'free' | 'pro';

export interface Entitlements {
  plan: Plan;
  source: 'server' | 'cache';
  checkedAt: number;
  features: {
    batchUnlimited: boolean;
    marketplace: boolean;
    pos: boolean;
    service: boolean;
    warehouse: boolean;
    customBranding: boolean;
  };
}

export const FREE_LIMITS = {
  batchRows: 3,
  historyItems: 5,
  drafts: 5
};

const STORAGE_KEY = 'iprint_entitlements_v1';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

import { API_BASE } from './api-base';

function apiBase(): string {
  return API_BASE;
}

function proFeatures(): Entitlements['features'] {
  return {
    batchUnlimited: true,
    marketplace: true,
    pos: true,
    service: true,
    warehouse: true,
    customBranding: true
  };
}

function freeFeatures(): Entitlements['features'] {
  const f = proFeatures();
  for (const k of Object.keys(f) as (keyof Entitlements['features'])[]) {
    f[k] = false;
  }
  return f;
}

function freeEntitlements(source: 'server' | 'cache'): Entitlements {
  return { plan: 'free', source, checkedAt: Date.now(), features: freeFeatures() };
}

function isValidPlan(v: unknown): v is Plan {
  return v === 'free' || v === 'pro';
}

function normalize(raw: unknown): Entitlements | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (!isValidPlan(obj.plan)) return null;
  const plan = obj.plan;
  const rawFeatures = (obj.features ?? {}) as Record<string, unknown>;
  const features: Entitlements['features'] = plan === 'pro' ? proFeatures() : freeFeatures();
  for (const k of Object.keys(features) as (keyof Entitlements['features'])[]) {
    if (typeof rawFeatures[k] === 'boolean') features[k] = rawFeatures[k] as boolean;
  }
  const checkedAt =
    typeof obj.checkedAt === 'number' && Number.isFinite(obj.checkedAt)
      ? obj.checkedAt
      : Date.now();
  return { plan, source: 'server', checkedAt, features };
}

/** Persist an entitlement snapshot. Never throws. */
export function cacheEntitlements(e: Entitlements): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
  } catch {
    // storage unavailable — offline tolerance degrades gracefully
  }
}

/**
 * Returns the cached snapshot only if it is fresh (< 7 days old,
 * inclusive boundary). Returns null when absent, corrupt or stale.
 */
export function getCachedEntitlements(): Entitlements | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = normalize(JSON.parse(raw));
    if (!parsed) return null;
    const age = Date.now() - parsed.checkedAt;
    if (!Number.isFinite(age) || age < 0 || age > SEVEN_DAYS_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isCacheFresh(e: Entitlements): boolean {
  const age = Date.now() - e.checkedAt;
  return Number.isFinite(age) && age >= 0 && age <= SEVEN_DAYS_MS;
}

/**
 * Single gate for Pro features. Server-derived `features` are authoritative
 * for free plans; a pro plan unlocks everything (SPEC-05 §1).
 */
export function can(feature: keyof Entitlements['features'], e: Entitlements): boolean {
  if (e.plan === 'pro') return true;
  return Boolean(e.features?.[feature]);
}

/**
 * Fetch entitlements from the billing API. On any network/HTTP failure fall
 * back to a cached snapshot within 7 days (SPEC-05 §6); beyond that window
 * degrade to free limits rather than hard-locking.
 * Malformed payloads are treated as free and never cached.
 */
export async function fetchEntitlements(token: string): Promise<Entitlements> {
  let result: Entitlements;
  try {
    const res = await fetch(`${apiBase()}/billing/entitlements`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`entitlements HTTP ${res.status}`);
    const parsed = normalize(await res.json());
    if (parsed) {
      cacheEntitlements(parsed);
      return parsed;
    }
    result = freeEntitlements('server');
    return result;
  } catch {
    const cached = getCachedEntitlements();
    if (cached) return { ...cached, source: 'cache', checkedAt: Date.now() };
    return freeEntitlements('cache');
  }
}
