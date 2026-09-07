import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  parseCsv, detectDelimiter, guessMapping, buildBatchRows,
  normalizeHeader, makeLiteralValue,
  saveCsvMapping, loadCsvMappings, loadCsvMapping, deleteCsvMapping,
  saveBatchProgress, loadBatchProgress, clearBatchProgress,
  MAX_CSV_MAPPINGS
} from '../csv-batch';

function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k)
  });
}

describe('parseCsv delimiter detection', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('auto-detects semicolon delimiter', () => {
    const csv = 'Urun;Fiyat\nKalem;12,50\nDefter;20';
    expect(detectDelimiter(csv)).toBe(';');
    const parsed = parseCsv(csv);
    expect(parsed.headers).toEqual(['Urun', 'Fiyat']);
    expect(parsed.rows[0]).toEqual(['Kalem', '12,50']);
    expect(parsed.rows.length).toBe(2);
  });

  it('auto-detects comma delimiter', () => {
    const csv = 'Urun,Fiyat\nKalem,"3,5",x\nDefter,20';
    expect(detectDelimiter(csv)).toBe(',');
    const parsed = parseCsv(csv);
    expect(parsed.headers).toEqual(['Urun', 'Fiyat']);
    expect(parsed.rows[0]).toEqual(['Kalem', '3,5', 'x']);
  });

  it('keeps delimiters inside quoted cells as literal text', () => {
    const parsed = parseCsv('"Adet;Birim";Fiyat\n"2;adet";10');
    expect(parsed.headers).toEqual(['Adet;Birim', 'Fiyat']);
    expect(parsed.rows[0]).toEqual(['2;adet', '10']);
  });

  it('handles escaped quotes and newlines inside quotes', () => {
    const parsed = parseCsv('Not;Urun\n"satır1\nsatır2";"5"" parça"');
    expect(parsed.rows[0]).toEqual(['satır1\nsatır2', '5" parça']);
  });

  it('drops empty rows and handles CRLF + trailing newline', () => {
    const parsed = parseCsv('A,B\r\n1,2\r\n\r\n3,4\r\n');
    expect(parsed.rows.length).toBe(2);
    expect(parsed.rows[1]).toEqual(['3', '4']);
  });

  it('returns empty structure for blank input', () => {
    expect(parseCsv('')).toEqual({ headers: [], rows: [] });
    expect(parseCsv('\n\n').headers).toEqual([]);
  });
});

describe('guessMapping', () => {
  it('maps barkod ↔ Barkod case-insensitively', () => {
    const m = guessMapping(['Barkod'], ['barkod']);
    expect(m['barkod']).toBe('Barkod');
  });

  it('maps fiyat ↔ Fiyat(TL) by stripping parenthetical suffix', () => {
    const m = guessMapping(['Fiyat(TL)', 'Stok'], ['fiyat']);
    expect(m['fiyat']).toBe('Fiyat(TL)');
  });

  it('maps Urun_Adi ↔ Ürün Adı via diacritic/underscore normalization', () => {
    expect(normalizeHeader('Ürün Adı')).toBe(normalizeHeader('Urun_Adi'));
    const m = guessMapping(['Ürün Adı', 'Kod'], ['Urun_Adi']);
    expect(m['Urun_Adi']).toBe('Ürün Adı');
  });

  it('returns null for unmatched variables and never reuses a header twice', () => {
    const m = guessMapping(['Barkod'], ['barkod', 'aciklama']);
    expect(m['barkod']).toBe('Barkod');
    expect(m['aciklama']).toBeNull();
  });
});

describe('buildBatchRows', () => {
  it('resolves column values per row and fills missing cells with empty string', () => {
    const mapping = { ad: 'Urun', kod: 'Yok' };
    const rows = buildBatchRows(mapping, ['Urun'], [['Kalem']]);
    expect(rows).toEqual([{ ad: 'Kalem', kod: '' }]);
  });

  it('supports @literal values identical on every row', () => {
    const mapping = { kampanya: makeLiteralValue('İndirim'), ad: 'Urun' };
    const rows = buildBatchRows(mapping, ['Urun'], [['A'], ['B']]);
    expect(rows[0]['kampanya']).toBe('İndirim');
    expect(rows[1]['kampanya']).toBe('İndirim');
    expect(rows[1]['ad']).toBe('B');
  });
});

describe('csv mapping persistence', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('roundtrips save → load and upserts per templateId', () => {
    saveCsvMapping('t1', { barkod: 'Barkod' });
    saveCsvMapping('t1', { barkod: 'Kod' });
    saveCsvMapping('t2', { ad: 'Urun' });
    expect(loadCsvMappings().length).toBe(2);
    expect(loadCsvMapping('t1')?.columnMap['barkod']).toBe('Kod');
  });

  it('caps stored mappings at MAX_CSV_MAPPINGS (30)', () => {
    for (let i = 0; i < MAX_CSV_MAPPINGS + 2; i++) {
      saveCsvMapping(`tpl_${i}`, {});
    }
    expect(loadCsvMappings().length).toBe(MAX_CSV_MAPPINGS);
  });

  it('deleteCsvMapping removes the entry', () => {
    saveCsvMapping('t9', { a: 'b' });
    deleteCsvMapping(`csvmap_t9`);
    expect(loadCsvMapping('t9')).toBeNull();
  });
});

describe('batch progress persistence', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('roundtrips job progress by jobId', () => {
    expect(loadBatchProgress('job1')).toBeNull();
    saveBatchProgress('job1', 7, 100);
    const p = loadBatchProgress('job1');
    expect(p?.completedIndex).toBe(7);
    expect(p?.total).toBe(100);
  });

  it('without jobId returns the most recently updated entry', () => {
    saveBatchProgress('job1', 3, 10);
    saveBatchProgress('job2', 5, 10);
    expect(loadBatchProgress()?.jobId).toBe('job2');
  });

  it('clearBatchProgress removes one or all jobs', () => {
    saveBatchProgress('job1', 1);
    saveBatchProgress('job2', 2);
    clearBatchProgress('job1');
    expect(loadBatchProgress('job1')).toBeNull();
    clearBatchProgress();
    expect(loadBatchProgress()).toBeNull();
  });
});
