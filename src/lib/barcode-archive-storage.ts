import { logger } from './logger';

export interface ArchiveItem {
  id: string;
  name: string;
  quantity?: string;
  checked?: boolean;
}

export interface BarcodeArchiveRecord {
  id: string;
  code: string;
  codeType: 'qr' | 'barcode';
  barcodeFormat?: string; // 'code128' | 'ean13' | 'qrcode'
  title: string;
  category: string;
  location?: string;
  note?: string;
  items: ArchiveItem[];
  hideItemsOnLabel?: boolean; // Etikette maddeleri gizle, sadece kod bas (kompakt gizli etiket)
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'iprint_barcode_archives_v1';

// Varsayılan örnek arşivler (Kullanıcı ilk kez açtığında dolu ve anlaşılır bir deneyim sunar)
const DEFAULT_ARCHIVES: BarcodeArchiveRecord[] = [
  {
    id: 'ARC-1001',
    code: 'ARC-1001',
    codeType: 'qr',
    title: 'Koli #101 - Ofis & Kırtasiye',
    category: 'Ofis',
    location: 'Depo Raf B-2',
    note: 'Yedek sarf malzemeleri, nemsiz ortamda saklanmalı.',
    items: [
      { id: '1', name: 'Koli Bandı (Şeffaf)', quantity: '5 Adet', checked: true },
      { id: '2', name: 'Termal Rulo Kağıt 57mm', quantity: '10 Rulo', checked: true },
      { id: '3', name: 'Büyük Boy Makas', quantity: '2 Adet', checked: true },
      { id: '4', name: 'Çift Taraflı Köpük Bant', quantity: '3 Rulo', checked: false }
    ],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    id: 'ARC-1002',
    code: '8690123456789',
    codeType: 'barcode',
    barcodeFormat: 'code128',
    title: 'Koli #102 - Hırdavat & Vida Seti',
    category: 'Atölye',
    location: 'Atölye Dolap C-1',
    note: 'Ağır kutu - alt rafa yerleştiriniz.',
    items: [
      { id: '1', name: 'Akülü Vidalama Uç Seti', quantity: '1 Takım', checked: true },
      { id: '2', name: 'Çelik Dübel 8mm', quantity: '50 Adet', checked: true },
      { id: '3', name: 'Alyan Takımı (Metrik)', quantity: '1 Set', checked: true }
    ],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000
  }
];

class BarcodeArchiveStorage {
  private getRecords(): BarcodeArchiveRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // İlk kullanımda varsayılanları kaydet
        this.saveRecords(DEFAULT_ARCHIVES);
        return DEFAULT_ARCHIVES;
      }
      return JSON.parse(data);
    } catch (e) {
      logger.error('Failed to parse barcode archives', e);
      return DEFAULT_ARCHIVES;
    }
  }

  private saveRecords(records: BarcodeArchiveRecord[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      logger.error('Failed to save barcode archives', e);
      return false;
    }
  }

  getAll(): BarcodeArchiveRecord[] {
    return this.getRecords().sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getById(id: string): BarcodeArchiveRecord | null {
    const list = this.getRecords();
    return list.find(r => r.id === id) || null;
  }

  findByCode(code: string): BarcodeArchiveRecord | null {
    if (!code) return null;
    const clean = code.trim();
    const list = this.getRecords();
    return list.find(r => r.code === clean || r.id === clean) || null;
  }

  /**
   * QR veya Barkod metninden arşiv verisini parse eder:
   * 1. Doğrudan yerel DB kodu ile eşleşiyor mu?
   * 2. QR içerisine gömülmüş özel JSON formatında mı? (iprint:arc:... veya {"_iprint_arc":...})
   */
  parseScannedText(text: string): { record: BarcodeArchiveRecord | null; isEmbedded: boolean } {
    if (!text) return { record: null, isEmbedded: false };
    const trimmed = text.trim();

    // 1. Önce yerel veritabanında ara
    const localMatch = this.findByCode(trimmed);
    if (localMatch) {
      return { record: localMatch, isEmbedded: false };
    }

    // 2. Gömülü QR formatını kontrol et
    if (trimmed.startsWith('IPRINT:ARC:') || trimmed.startsWith('iprint:arc:')) {
      try {
        const payloadStr = trimmed.slice(11);
        const parsed = JSON.parse(payloadStr);
        if (parsed && parsed.title) {
          const embeddedRecord: BarcodeArchiveRecord = {
            id: parsed.id || `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
            code: parsed.code || trimmed,
            codeType: 'qr',
            title: parsed.title,
            category: parsed.category || 'Arşiv',
            location: parsed.location || '',
            note: parsed.note || '',
            items: Array.isArray(parsed.items)
              ? parsed.items.map((it: any, idx: number) => ({
                  id: String(idx + 1),
                  name: typeof it === 'string' ? it : it.name || 'Öğe',
                  quantity: typeof it === 'object' ? it.quantity || '' : '',
                  checked: false
                }))
              : [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          return { record: embeddedRecord, isEmbedded: true };
        }
      } catch (e) {
        logger.error('Failed to parse embedded QR archive', e);
      }
    }

    // Standart JSON kontrolü
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed._iprint_arc || parsed.iprint_arc || (parsed.title && Array.isArray(parsed.items))) {
          const embeddedRecord: BarcodeArchiveRecord = {
            id: parsed.id || `ARC-${Math.floor(1000 + Math.random() * 9000)}`,
            code: parsed.code || trimmed,
            codeType: 'qr',
            title: parsed.title,
            category: parsed.category || 'Arşiv',
            location: parsed.location || '',
            note: parsed.note || '',
            items: Array.isArray(parsed.items)
              ? parsed.items.map((it: any, idx: number) => ({
                  id: String(idx + 1),
                  name: typeof it === 'string' ? it : it.name || 'Öğe',
                  quantity: typeof it === 'object' ? it.quantity || '' : '',
                  checked: false
                }))
              : [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          return { record: embeddedRecord, isEmbedded: true };
        }
      } catch {
        // Not a valid json
      }
    }

    return { record: null, isEmbedded: false };
  }

  /**
   * QR Kodu için doğrudan taranabilir gömülü format üretir
   */
  generateEmbeddedQrString(record: Omit<BarcodeArchiveRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): string {
    const compactPayload = {
      id: record.id,
      code: record.code,
      title: record.title,
      category: record.category,
      location: record.location || undefined,
      note: record.note || undefined,
      items: record.items.map(it => (it.quantity ? `${it.name} (${it.quantity})` : it.name))
    };
    return `IPRINT:ARC:${JSON.stringify(compactPayload)}`;
  }

  save(record: Omit<BarcodeArchiveRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): BarcodeArchiveRecord {
    const records = this.getRecords();
    const now = Date.now();
    const id = record.id || `ARC-${Math.floor(10000 + Math.random() * 90000)}`;

    const existingIndex = records.findIndex(r => r.id === id);
    let updatedRecord: BarcodeArchiveRecord;

    if (existingIndex >= 0) {
      updatedRecord = {
        ...records[existingIndex],
        ...record,
        id,
        updatedAt: now
      };
      records[existingIndex] = updatedRecord;
    } else {
      updatedRecord = {
        ...record,
        id,
        createdAt: now,
        updatedAt: now
      };
      records.unshift(updatedRecord);
    }

    this.saveRecords(records);
    return updatedRecord;
  }

  delete(id: string): boolean {
    const records = this.getRecords();
    const filtered = records.filter(r => r.id !== id);
    if (filtered.length !== records.length) {
      this.saveRecords(filtered);
      return true;
    }
    return false;
  }

  toggleItemChecked(archiveId: string, itemId: string): boolean {
    const records = this.getRecords();
    const target = records.find(r => r.id === archiveId);
    if (!target) return false;

    const item = target.items.find(i => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      target.updatedAt = Date.now();
      this.saveRecords(records);
      return true;
    }
    return false;
  }
}

export const barcodeArchiveStorage = new BarcodeArchiveStorage();
