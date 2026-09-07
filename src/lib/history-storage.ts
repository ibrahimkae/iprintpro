import { PrintHistoryItem, SavedDraftItem } from '../types';
import { logger } from './logger';

const HISTORY_KEY = 'iprint_pro_history_v1';
const DRAFTS_KEY = 'iprint_pro_drafts_v1';
const MAX_HISTORY_ITEMS = 30;

/**
 * Compresses a canvas dataURL for storage.
 * Keeps native print width so "Reprint" stays pixel-perfect,
 * but converts PNG -> JPEG to cut size by ~10x.
 */
function compressForStorage(dataUrl: string, maxWidth: number): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) { resolve(dataUrl); return; }
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        const ctx = c.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.fillStyle = '#ffffff'; // JPEG has no alpha -> avoid black background
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.55));
      } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const historyStorage = {
  getHistory(): PrintHistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      logger.error('Failed to read print history', e);
      return [];
    }
  },

  async addHistory(item: Omit<PrintHistoryItem, 'id' | 'timestamp'>): Promise<PrintHistoryItem | null> {
    try {
      const history = this.getHistory();
      const newItem: PrintHistoryItem = {
        ...item,
        previewDataUrl: await compressForStorage(item.previewDataUrl, 420),
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        timestamp: Date.now(),
      };

      const updated = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Quota exceeded: evict oldest entries one by one instead of losing everything
        const trimmed = [...updated];
        while (trimmed.length > 1) {
          trimmed.splice(Math.floor(trimmed.length / 2)); // drop older half
          try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
            logger.warn('History quota exceeded, trimmed to ' + trimmed.length + ' items');
            break;
          } catch { /* keep trimming */ }
        }
      }
      return newItem;
    } catch (e) {
      logger.error('Failed to save print history', e);
      return null;
    }
  },

  deleteHistoryItem(id: string): void {
    try {
      const history = this.getHistory();
      const updated = history.filter(item => item.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      logger.error('Failed to delete history item', e);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      logger.error('Failed to clear print history', e);
    }
  },

  getDrafts(): SavedDraftItem[] {
    try {
      const data = localStorage.getItem(DRAFTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      logger.error('Failed to read drafts', e);
      return [];
    }
  },

  async saveDraft(draft: Omit<SavedDraftItem, 'id' | 'timestamp'>): Promise<SavedDraftItem | null> {
    try {
      const drafts = this.getDrafts();
      const compressed = draft.previewDataUrl ? await compressForStorage(draft.previewDataUrl, 420) : '';
      const newDraft: SavedDraftItem = {
        ...draft,
        previewDataUrl: compressed || draft.previewDataUrl,
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        timestamp: Date.now(),
      };
      const updated = [newDraft, ...drafts.filter(d => d.id !== newDraft.id)].slice(0, 50);
      try {
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
      } catch {
        const trimmed = [...updated];
        while (trimmed.length > 1) {
          trimmed.splice(Math.floor(trimmed.length / 2));
          try {
            localStorage.setItem(DRAFTS_KEY, JSON.stringify(trimmed));
            break;
          } catch { /* keep trimming */ }
        }
      }
      return newDraft;
    } catch (e) {
      logger.error('Failed to save draft', e);
      return null;
    }
  },

  async updateDraft(id: string, updatedFields: Partial<Omit<SavedDraftItem, 'id'>>): Promise<SavedDraftItem | null> {
    try {
      const drafts = this.getDrafts();
      const existing = drafts.find(d => d.id === id);
      if (!existing) return null;

      let compressedPreview = existing.previewDataUrl;
      if (updatedFields.previewDataUrl && updatedFields.previewDataUrl !== existing.previewDataUrl) {
        compressedPreview = await compressForStorage(updatedFields.previewDataUrl, 420);
      }

      const updatedDraft: SavedDraftItem = {
        ...existing,
        ...updatedFields,
        previewDataUrl: compressedPreview ?? existing.previewDataUrl,
        timestamp: Date.now(),
      };

      const updatedList = drafts.map(d => d.id === id ? updatedDraft : d);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedList));
      return updatedDraft;
    } catch (e) {
      logger.error('Failed to update draft', e);
      return null;
    }
  },

  deleteDraft(id: string): void {
    try {
      const drafts = this.getDrafts();
      const updated = drafts.filter(d => d.id !== id);
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    } catch (e) {
      logger.error('Failed to delete draft', e);
    }
  }
};
