/**
 * Değişken Veri Motoru — SPEC-01
 * Sözdizimi: {Ad}, {Ad:tip}, {Ad:tip=format}
 * Kaçış: "{{" → literal "{"
 */

export type VariableType =
  | 'metin'
  | 'sayi'
  | 'para'
  | 'tarih'
  | 'coksatir'
  | 'barkod'
  | 'qr'
  | 'secim';

export interface VariableDef {
  name: string;
  type: VariableType;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  /** secim tipi için seçenekler */
  options?: string[];
  /** tarih formatı (DD.MM.YYYY) veya barkod sembolü (EAN13/CODE128) */
  format?: string;
}

export interface VariableValues {
  [name: string]: string;
}

const TYPE_NAMES: VariableType[] = [
  'metin', 'sayi', 'para', 'tarih', 'coksatir', 'barkod', 'qr', 'secim'
];

const VAR_TOKEN = /\{([A-Za-zÇĞİÖŞÜçğıöşü0-9_ ]+)(?::([a-z]+)(?:=([^{}]*))?)?\}/g;

/** Şablondaki tüm değişken tanımlarını sıra korunarak çıkarır (tekrarlar tekilleşir). */
export function extractVariables(templateText: string): VariableDef[] {
  const seen = new Map<string, VariableDef>();
  let match: RegExpExecArray | null;
  const re = new RegExp(VAR_TOKEN.source, 'g');
  while ((match = re.exec(templateText)) !== null) {
    const [, rawName, rawType, param] = match;
    const name = rawName.trim();
    if (!name) continue;
    if (seen.has(name)) continue;

    const type = (TYPE_NAMES as string[]).includes(rawType ?? '')
      ? (rawType as VariableType)
      : 'metin';

    const def: VariableDef = { name, type };
    if (type === 'tarih') def.format = param || 'DD.MM.YYYY';
    if (type === 'barkod') {
      const sym = (param || 'CODE128').toUpperCase();
      def.format = ['EAN13', 'CODE128'].includes(sym) ? sym : 'CODE128';
    }
    if (type === 'secim' && param) {
      def.options = param.split(',').map(s => s.trim()).filter(Boolean);
    }
    seen.set(name, def);
  }
  return Array.from(seen.values());
}

/** Para biçimi: 1290.5 → "1.290,50 ₺" (tr-TR). */
export function formatMoney(input: string | number): string {
  const n = typeof input === 'number' ? input : parseFloat(String(input).replace(',', '.'));
  if (Number.isNaN(n)) return String(input);
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n) + ' ₺';
}

/** DD.MM.YYYY gibi maskeyi Date'e çevirir (sadece bilinen tokenlar). */
function parseMaskedDate(value: string, mask: string): Date | null {
  const order: string[] = [];
  const parts = value.split(/[^\d]+/).filter(Boolean);
  const maskParts = mask.split(/[^\w]+/).filter(Boolean);
  maskParts.forEach(m => {
    const key = m.toUpperCase().startsWith('Y') || m.startsWith('YY') ? 'Y'
      : m.toUpperCase().startsWith('M') ? 'M' : 'D';
    order.push(key);
  });
  if (parts.length < 3 || order.length < 3) return null;
  const get = (k: string) => parts[order.indexOf(k)];
  let year = Number(get('Y'));
  if (year < 100) year += 2000;
  const month = Number(get('M'));
  const day = Number(get('D'));
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
}

function formatDate(value: string, mask: string): string {
  // Önce yerel Date parse denenir (ISO vb.), sonra maskeli parse
  let d: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) d = new Date(value);
  if (!d || Number.isNaN(d.getTime())) d = parseMaskedDate(value, mask);
  if (!d || Number.isNaN(d.getTime())) return value; // çözülemedi → olduğu gibi

  const pad = (n: number) => String(n).padStart(2, '0');
  return mask
    .replace(/DD/g, pad(d.getDate()))
    .replace(/MM/g, pad(d.getMonth() + 1))
    .replace(/YYYY/g, String(d.getFullYear()))
    .replace(/YY/g, String(d.getFullYear()).slice(-2));
}

/** IMEI Luhn doğrulaması (15 hane). */
export function isValidImei(imei: string): boolean {
  const digits = imei.replace(/\D/g, '');
  if (digits.length !== 15) return false;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let d = Number(digits[i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[14]);
}

export interface ResolvedBlock {
  kind: 'text' | 'barcode' | 'qr';
  /** text için çözümlenmiş içerik; barcode/qr için değer */
  value: string;
  symbology?: string;
}

/**
 * Şablonu + girilen değerleri çıktı bloklarına çevirir.
 * Barkod/QR değişkenleri ayrı bloklara ayrılır; metinler \n ile bölünür.
 */
export function resolveTemplate(
  templateText: string,
  values: VariableValues,
  defs: VariableDef[] = extractVariables(templateText)
): ResolvedBlock[] {
  const blocks: ResolvedBlock[] = [];
  const ESC_OPEN = '\u0000'; // '{{' -> '{'
  const ESC_CLOSE = '\u0001'; // '}}' -> '}'
  const src = templateText.replace(/\{\{/g, ESC_OPEN).replace(/\}\}/g, ESC_CLOSE);

  let textOut = '';
  const re = new RegExp(VAR_TOKEN.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const unescapeAll = (s: string) => s.split(ESC_OPEN).join('{').split(ESC_CLOSE).join('}');

  const flushText = () => {
    if (!textOut) return;
    textOut.split('\n').forEach((line, idx) => {
      if (idx > 0 || blocks.length === 0 || blocks[blocks.length - 1].kind !== 'text') {
        blocks.push({ kind: 'text', value: unescapeAll(line) });
      } else {
        blocks[blocks.length - 1].value += '\n' + unescapeAll(line);
      }
    });
    textOut = '';
  };

  while ((match = re.exec(src)) !== null) {
    textOut += src.slice(lastIndex, match.index);

    const name = match[1].trim();
    const def = defs.find(d => d.name === name) ?? { name, type: 'metin' as VariableType };
    const raw = values[name] ?? def.defaultValue ?? '';

    if (def.type === 'barkod') {
      flushText();
      blocks.push({ kind: 'barcode', value: raw, symbology: def.format ?? 'CODE128' });
    } else if (def.type === 'qr') {
      flushText();
      blocks.push({ kind: 'qr', value: raw });
    } else if (def.type === 'para') {
      textOut += formatMoney(raw);
    } else if (def.type === 'tarih') {
      textOut += formatDate(raw, def.format ?? 'DD.MM.YYYY');
    } else {
      textOut += raw;
    }
    lastIndex = match.index + match[0].length;
  }
  textOut += src.slice(lastIndex);
  flushText();

  return blocks.filter(b => b.value !== '' || b.kind !== 'text');
}

/** Zorunlu ama boş bırakılan değişken adlarını döndürür. */
export function missingRequired(defs: VariableDef[], values: VariableValues): string[] {
  return defs
    .filter(d => d.required && !(values[d.name] ?? '').trim())
    .map(d => d.name);
}
