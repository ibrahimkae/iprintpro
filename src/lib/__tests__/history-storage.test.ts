import { describe, it, expect, beforeEach, vi } from 'vitest';
import { historyStorage } from '../history-storage';

/** Simple localStorage mock with an optional byte-size ceiling (simulates quota). */
function installLocalStorage(maxBytes: number = Infinity) {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (v.length > maxBytes) throw new DOMException('quota exceeded', 'QuotaExceededError');
      store.set(k, v);
    },
    removeItem: (k: string) => void store.delete(k)
  };
  vi.stubGlobal('localStorage', mock);
  return store;
}

const bigItem = () => ({
  title: 'Test',
  type: 'editor' as const,
  previewDataUrl: 'x'.repeat(50_000), // would be a real dataURL in production
  width: 384,
  height: 800
});

describe('historyStorage', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('stores and reads back items with generated id/timestamp', async () => {
    const saved = await historyStorage.addHistory(bigItem());
    expect(saved).not.toBeNull();
    expect(saved!.id.length).toBeGreaterThan(0);
    expect(historyStorage.getHistory()[0].title).toBe('Test');
  });

  it('caps history at MAX_HISTORY_ITEMS (30)', async () => {
    for (let i = 0; i < 35; i++) {
      await historyStorage.addHistory({ ...bigItem(), title: `item-${i}` });
    }
    const history = historyStorage.getHistory();
    expect(history.length).toBe(30);
    expect(history[0].title).toBe('item-34'); // newest first
  });

  it('survives quota overflow by evicting entries instead of throwing', async () => {
    // Ceiling chosen so ~3 large entries fit but not 30
    installLocalStorage(160_000);
    for (let i = 0; i < 10; i++) {
      await historyStorage.addHistory({ ...bigItem(), title: `q-${i}` });
    }
    const history = historyStorage.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].title).toBe('q-9'); // newest always survives
  });

  it('clearHistory removes everything', async () => {
    await historyStorage.addHistory(bigItem());
    historyStorage.clearHistory();
    expect(historyStorage.getHistory()).toEqual([]);
  });
});
