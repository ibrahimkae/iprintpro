import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MODES as ALL_MODES,
  TOOL_CATALOG,
  getMode,
  setMode,
  clearMode,
  markOnboardingSeen,
  validateModeMatrix,
} from '../business-modes';
import type { BusinessMode } from '../business-modes';

/** history-storage.test.ts ile aynı desen */
function installLocalStorage() {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => void store.clear(),
  };
  vi.stubGlobal('window', { localStorage: mock });
  vi.stubGlobal('localStorage', mock);
  return store;
}

describe('business-modes', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('7 iş modu tanımlı ve benzersiz', () => {
    expect(ALL_MODES).toHaveLength(8); // 7 sektor + karma
    expect(new Set(ALL_MODES.map((m) => m.id)).size).toBe(8);
  });

  it('mod matrisi tutarlı — validateModeMatrix hata döndürmez', () => {
    const errors = validateModeMatrix();
    if (errors.length > 0) throw new Error(errors.join('; '));
    expect(errors).toEqual([]);
  });

  it('her primaryTool TOOL_CATALOG içinde mevcut', () => {
    for (const m of ALL_MODES) {
      for (const t of m.primaryTools) {
        expect(TOOL_CATALOG[t]).toBeDefined();
      }
    }
  });

  it('her modda en az 3 birincil araç var', () => {
    for (const m of ALL_MODES) {
      expect(m.primaryTools.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('get/set roundtrip — tercihi doğru saklar', () => {
    expect(getMode()).toBeNull();
    setMode('cafe');
    const stored = getMode();
    expect(stored?.mode).toBe('cafe');
    expect(stored?.seenOnboarding).toBe(false);
    expect(typeof stored?.configuredAt).toBe('number');
  });

  it('bozuk JSON → güvenli null fallback', () => {
    window.localStorage.setItem('iprint_business_mode_v1', '{not-valid-json!!');
    expect(getMode()).toBeNull();
  });

  it('geçersiz mod değeri → null fallback', () => {
    window.localStorage.setItem(
      'iprint_business_mode_v1',
      JSON.stringify({ mode: 'hackerville', configuredAt: 1, seenOnboarding: true }),
    );
    expect(getMode()).toBeNull();
  });

  it('clearMode tercihi tamamen siler', () => {
    setMode('boutique');
    expect(getMode()).not.toBeNull();
    clearMode();
    expect(getMode()).toBeNull();
  });

  it('setMode önceki seenOnboarding bayrağını korur', () => {
    setMode('personal');
    markOnboardingSeen();
    expect(getMode()?.seenOnboarding).toBe(true);
    setMode('warehouse');
    expect(getMode()?.seenOnboarding).toBe(true);
    expect(getMode()?.mode).toBe('warehouse');
  });

  it('her katalog aracının başlığı TR ve anahtar kelimeleri boş değil', () => {
    for (const t of Object.keys(TOOL_CATALOG) as (keyof typeof TOOL_CATALOG)[]) {
      const meta = TOOL_CATALOG[t];
      expect(meta.title.trim().length).toBeGreaterThan(0);
      expect(meta.keywords.length).toBeGreaterThan(0);
      for (const kw of meta.keywords) {
        expect(kw.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('SPEC-02 örnekleri: cafe→pos büyük kart, marketplace dışı modda orders erişilebilir', () => {
    const cafe = ALL_MODES.find((m) => m.id === 'cafe')!;
    expect(cafe.primaryTools).toContain('pos');
    expect(cafe.primaryTools).not.toContain('orders');

    // "kargo" araması her modda orders aracını bulabilmeli
    const ordersHits = Object.values(TOOL_CATALOG).filter((t) =>
      t.keywords.includes('kargo'),
    );
    expect(ordersHits.some((t) => t.title.includes('Sipariş'))).toBe(true);

    // tüm modlar BusinessMode birliğiyle uyumlu
    const validIds: BusinessMode[] = ['all', 'boutique', 'marketplace', 'cafe', 'service', 'appointment', 'warehouse', 'personal'];
    for (const m of ALL_MODES) expect(validIds).toContain(m.id);
  });
});
