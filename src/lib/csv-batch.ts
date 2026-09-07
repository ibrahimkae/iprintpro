import { logger } from './logger';

export const CSV_MAPPINGS_KEY = 'iprint_csv_mappings_v1';
export const BATCH_PROGRESS_KEY = 'iprint_batch_progress_v1';
export const MAX_CSV_MAPPINGS = 30;

export const LITERAL_PREFIX = '@';
export const XLSX_FALLBACK_MESSAGE =
  'Excel (.xlsx) modülü yüklü değil. Dosyayı UTF-8 CSV olarak kaydedip tekrar deneyin.';

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

export function detectDelimiter(text: string): string {
  let semi = 0;
  let comma = 0;
  let tab = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (!inQuotes) {
      if (ch === ';') semi++;
      else if (ch === ',') comma++;
      else if (ch === '\t') tab++;
    }
  }
  const best = Math.max(semi, comma, tab);
  if (best === 0) return ',';
  if (semi === best) return ';';
  if (comma === best) return ',';
  return '\t';
}

function splitDelimited(text: string, delim: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const endRow = () => {
    row.push(cell);
    cell = '';
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"' && cell === '') {
      inQuotes = true;
    } else if (ch === delim) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length > 0) endRow();

  return rows.filter(r => !(r.length === 1 && r[0].trim() === ''));
}

export function decodeUtf8(buffer: ArrayBuffer): string {
  const text = new TextDecoder('utf-8').decode(new Uint8Array(buffer));
  return text.replace(/^\uFEFF/, '');
}

export function parseCsv(text: string): ParsedCsv {
  const clean = text.replace(/^\uFEFF/, '');
  if (!clean.trim()) return { headers: [], rows: [] };
  const delim = detectDelimiter(clean);
  const table = splitDelimited(clean, delim);
  if (table.length === 0) return { headers: [], rows: [] };
  const [headers, ...rows] = table;
  return { headers, rows };
}

interface XlsxWorkbook {
  SheetNames: string[];
  Sheets: Record<string, unknown>;
}
interface XlsxModule {
  read(data: Uint8Array, opts?: Record<string, unknown>): XlsxWorkbook;
  utils: {
    sheet_to_json<T = unknown[]>(ws: unknown, opts?: Record<string, unknown>): T[];
  };
}

export async function parseXlsx(buffer: ArrayBuffer): Promise<ParsedCsv> {
  let XLSX: XlsxModule;
  try {
    const spec = 'xlsx';
    XLSX = (await import(/* @vite-ignore */ spec)) as XlsxModule;
  } catch {
    throw new Error(XLSX_FALLBACK_MESSAGE);
  }

  try {
    const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return { headers: [], rows: [] };
    const matrix = XLSX.utils
      .sheet_to_json<unknown[]>(ws, { header: 1, raw: false, defval: '' })
      .map(r => r.map(c => String(c ?? '')))
      .filter(r => r.some(c => c.trim() !== ''));

    if (matrix.length === 0) return { headers: [], rows: [] };
    const [headers, ...rows] = matrix as string[][];
    return { headers, rows };
  } catch (e) {
    logger.warn('xlsx parse failed', e);
    throw new Error(XLSX_FALLBACK_MESSAGE);
  }
}

export async function parseDataFile(name: string, buffer: ArrayBuffer): Promise<ParsedCsv> {
  if (/\.xlsx$/i.test(name)) return parseXlsx(buffer);
  return parseCsv(decodeUtf8(buffer));
}

const TR_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
};

export function normalizeHeader(s: string): string {
  return s
    .replace(/\([^)]*\)/g, '')
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, c => TR_MAP[c] ?? c)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\-.]+/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.startsWith(b) || b.startsWith(a)) return 0.85;
  if (a.includes(b) || b.includes(a)) return 0.65;
  return 0;
}

export function guessMapping(
  headers: string[],
  variableNames: string[]
): Record<string, string | null> {
  const candidates: { v: string; h: string; s: number }[] = [];
  for (const v of variableNames) {
    const nv = normalizeHeader(v);
    for (const h of headers) {
      const s = similarity(nv, normalizeHeader(h));
      if (s >= 0.65) candidates.push({ v, h, s });
    }
  }
  candidates.sort((a, b) => b.s - a.s || a.v.localeCompare(b.v));

  const usedVars = new Set<string>();
  const usedHeaders = new Set<string>();
  const result: Record<string, string | null> = {};
  for (const name of variableNames) result[name] = null;

  for (const c of candidates) {
    if (usedVars.has(c.v) || usedHeaders.has(c.h)) continue;
    result[c.v] = c.h;
    usedVars.add(c.v);
    usedHeaders.add(c.h);
  }
  return result;
}

export function makeLiteralValue(value: string): string {
  return LITERAL_PREFIX + value;
}

export function isLiteralValue(mapValue: string): boolean {
  return mapValue.startsWith(LITERAL_PREFIX);
}

export function literalText(mapValue: string): string {
  return isLiteralValue(mapValue) ? mapValue.slice(LITERAL_PREFIX.length) : '';
}

export function buildBatchRows(
  mapping: Record<string, string | null>,
  headers: string[],
  rows: string[][]
): Record<string, string>[] {
  const index = new Map(headers.map((h, i) => [h, i]));
  return rows.map(row => {
    const out: Record<string, string> = {};
    for (const [varName, mapValue] of Object.entries(mapping)) {
      if (!mapValue) {
        out[varName] = '';
      } else if (isLiteralValue(mapValue)) {
        out[varName] = literalText(mapValue);
      } else {
        const i = index.get(mapValue);
        out[varName] = i === undefined ? '' : (row[i] ?? '').trim();
      }
    }
    return out;
  });
}

export interface CsvMapping {
  id: string;
  templateId: string;
  columnMap: Record<string, string>;
  createdAt: number;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.warn(`Storage yazımı başarısız (${key})`, e);
  }
}

export function loadCsvMappings(): CsvMapping[] {
  return readJson<CsvMapping[]>(CSV_MAPPINGS_KEY, []).filter(
    m => !!m && typeof m.templateId === 'string'
  );
}

export function saveCsvMapping(
  templateId: string,
  columnMap: Record<string, string>
): CsvMapping {
  const mappings = loadCsvMappings().filter(m => m.templateId !== templateId);
  const next: CsvMapping = {
    id: `csvmap_${templateId}`,
    templateId,
    columnMap,
    createdAt: Date.now()
  };
  mappings.unshift(next);
  writeJson(CSV_MAPPINGS_KEY, mappings.slice(0, MAX_CSV_MAPPINGS));
  return next;
}

export function loadCsvMapping(templateId: string): CsvMapping | null {
  return loadCsvMappings().find(m => m.templateId === templateId) ?? null;
}

export function deleteCsvMapping(id: string): void {
  writeJson(
    CSV_MAPPINGS_KEY,
    loadCsvMappings().filter(m => m.id !== id)
  );
}

export interface BatchProgress {
  jobId: string;
  completedIndex: number;
  total: number;
  updatedAt: number;
}

type ProgressStore = Record<string, BatchProgress>;

function readProgress(): ProgressStore {
  return readJson<ProgressStore>(BATCH_PROGRESS_KEY, {});
}

export function saveBatchProgress(
  jobId: string,
  completedIndex: number,
  total = 0
): void {
  const store = readProgress();
  store[jobId] = { jobId, completedIndex, total, updatedAt: Date.now() };
  writeJson(BATCH_PROGRESS_KEY, store);
}

export function loadBatchProgress(): BatchProgress | null;
export function loadBatchProgress(jobId: string): BatchProgress | null;
export function loadBatchProgress(jobId?: string): BatchProgress | null {
  const store = readProgress();
  if (jobId !== undefined) return store[jobId] ?? null;
  const entries = Object.values(store);
  if (entries.length === 0) return null;
  return entries.reduce((a, b) => (b.updatedAt >= a.updatedAt ? b : a));
}

export function clearBatchProgress(jobId?: string): void {
  if (jobId === undefined) {
    writeJson(BATCH_PROGRESS_KEY, {});
    return;
  }
  const store = readProgress();
  delete store[jobId];
  writeJson(BATCH_PROGRESS_KEY, store);
}
