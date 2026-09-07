/**
 * Depo Etiketleri (SPEC-09) — Raf / Koli / Parti-IMEI.
 *
 * BARKOD SÖZLEŞMESİ (BARCODE contract):
 * Bu görünüm barkod ÇİZMEZ. onPrintBatchTexts'e gönderilen her iç dizi bir
 * etiketin çözümlenmiş metin satırlarıdır; `BARCODE:<değer>` biçimindeki
 * satırlar özel işarettir — entegratör (caller) bu satırı CODE128 barkod
 * bloğuna çevirmekle yükümlüdür. Diğer tüm satırlar düz metindir.
 */
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import { isValidImei } from '../lib/template-variables';
import {
  ArrowLeft, CheckCircle2, Printer, XCircle
} from 'lucide-react';

export interface WarehouseViewProps {
  onPrintBatchTexts: (labels: string[][]) => Promise<void>; // each inner array = resolved lines; caller renders
  pageWidth: number;
  onBack: () => void;
}

const MAX_EXPANSION = 5000;
const DATE_FORMATS = ['GG.AA.YYYY', 'AA.YYYY'] as const;
type DateFormat = (typeof DATE_FORMATS)[number];

type SubTab = 'raf' | 'koli' | 'parti';

/** '{01..20}' benzeri segmentleri genişletir; sayılarda en geniş genişliğe sıfır doldurur. */
function expandSegment(seg: string): string[] {
  if (!seg.startsWith('{') || !seg.endsWith('}')) return [seg];
  const inner = seg.slice(1, -1);
  const parts = inner.split('..');
  if (parts.length === 2) {
    const [aRaw, bRaw] = parts;
    if (/^\d+$/.test(aRaw) && /^\d+$/.test(bRaw)) {
      const a = Number(aRaw);
      const b = Number(bRaw);
      const width = Math.max(aRaw.length, bRaw.length);
      const step = a <= b ? 1 : -1;
      const out: string[] = [];
      for (let v = a; step > 0 ? v <= b : v >= b; v += step) {
        out.push(String(v).padStart(width, '0'));
        if (out.length > MAX_EXPANSION) break;
      }
      return out;
    }
    if (aRaw.length === 1 && bRaw.length === 1 && /[A-Za-z]/.test(aRaw) && /[A-Za-z]/.test(bRaw)) {
      const sameCase =
        (aRaw === aRaw.toUpperCase() && bRaw === bRaw.toUpperCase()) ||
        (aRaw === aRaw.toLowerCase() && bRaw === bRaw.toLowerCase());
      if (sameCase) {
        const a = aRaw.charCodeAt(0);
        const b = bRaw.charCodeAt(0);
        const step = a <= b ? 1 : -1;
        const out: string[] = [];
        for (let c = a; step > 0 ? c <= b : c >= b; c += step) {
          out.push(String.fromCharCode(c));
          if (out.length > MAX_EXPANSION) break;
        }
        return out;
      }
    }
    return [inner];
  }
  return inner.includes('|')
    ? inner.split('|').map(s => s.trim()).filter(Boolean)
    : [inner];
}

export function expandPattern(pattern: string): string[] {
  const segments = pattern.trim().match(/\{[^{}]*\}|[^{}]+/g);
  if (!segments || segments.length === 0) return [];
  let results: string[] = [''];
  for (const seg of segments) {
    const opts = expandSegment(seg);
    if (opts.length === 0) return [];
    const next: string[] = [];
    for (const r of results) {
      for (const o of opts) {
        next.push(r + o);
        if (next.length >= MAX_EXPANSION) return next.slice(0, MAX_EXPANSION);
      }
    }
    results = next;
  }
  return results;
}

function formatDateInput(iso: string, fmt: DateFormat): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return fmt === 'GG.AA.YYYY' ? `${d}.${mo}.${y}` : `${mo}.${y}`;
}

interface KoliItem {
  name: string;
  qty: number;
}

function parseKoliRows(raw: string): KoliItem[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(';');
      const name = (parts[0] ?? '').trim();
      const qtyRaw = (parts[1] ?? '').trim();
      const qtyNum = Number(qtyRaw.replace(',', '.'));
      return {
        name,
        qty: qtyRaw !== '' && Number.isFinite(qtyNum) && qtyNum > 0 ? Math.floor(qtyNum) : 1
      };
    })
    .filter(i => i.name !== '');
}

export function WarehouseView(props: WarehouseViewProps) {
  const [subTab, setSubTab] = useState<SubTab>('raf');
  const [printing, setPrinting] = useState(false);

  const [rafPattern, setRafPattern] = useState('');
  const codes = useMemo(() => expandPattern(rafPattern), [rafPattern]);

  const [koliNo, setKoliNo] = useState('');
  const [koliRows, setKoliRows] = useState('');
  const koliItems = useMemo(() => parseKoliRows(koliRows), [koliRows]);

  const [serialMode, setSerialMode] = useState<'imei' | 'lot'>('imei');
  const [imei, setImei] = useState('');
  const [imeiQty, setImeiQty] = useState('1');
  const imeiOk = imei.trim() !== '' && isValidImei(imei);

  const [partiNo, setPartiNo] = useState('');
  const [uretimTarihi, setUretimTarihi] = useState('');
  const [skt, setSkt] = useState('');
  const [dateFormat, setDateFormat] = useState<DateFormat>('GG.AA.YYYY');

  async function runPrint(labels: string[][]) {
    if (labels.length === 0) return;
    setPrinting(true);
    try {
      await props.onPrintBatchTexts(labels);
    } finally {
      setPrinting(false);
    }
  }

  const imeiSeries = useMemo(() => {
    const start = imei.trim();
    const q = Math.max(1, Math.min(9999, Number(imeiQty) || 1));
    if (!/^\d+$/.test(start)) return q === 1 && start !== '' ? [start] : [];
    const out: string[] = [];
    for (let i = 0; i < q; i++) out.push(String(BigInt(start) + BigInt(i)));
    return out;
  }, [imei, imeiQty]);

  const koliLines = useMemo(() => {
    if (!koliNo.trim() || koliItems.length === 0) return null;
    return [`KOLI ${koliNo.trim()}`, ...koliItems.map(i => `${i.name} × ${i.qty}`)];
  }, [koliNo, koliItems]);

  const lotReady = partiNo.trim() !== '';

  return (
    <motion.div
      key="warehouse"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={props.onBack}
          className="rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 dark:text-slate-200 text-xs h-8"
        >
          <ArrowLeft size={14} className="mr-1.5" /> Geri
        </Button>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Depo Etiketleri · ~{props.pageWidth} mm
        </span>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
        {([
          { id: 'raf' as SubTab, label: 'Raf Etiketi' },
          { id: 'koli' as SubTab, label: 'Koli İçerik' },
          { id: 'parti' as SubTab, label: 'Parti/IMEI' }
        ]).map(tb => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setSubTab(tb.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              subTab === tb.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {subTab === 'raf' && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Raf Kodu Deseni
            </Label>
            <Input
              value={rafPattern}
              onChange={e => setRafPattern(e.target.value)}
              placeholder="A-{01..20}-01"
              className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
            />
            <span className="block text-[10px] text-slate-400">
              {'{'}başlangıç..bitiş{'}'} aralıkları çarpılır: {'A-{01..20}-{01..04}'}
            </span>
          </div>

          {codes.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Önizleme (ilk 5)
                </Label>
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {codes.length} etiket
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {codes.slice(0, 5).map(c => (
                  <span
                    key={c}
                    className="py-1 px-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </>
          )}

          {codes.length >= MAX_EXPANSION && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-2.5 text-xs font-bold text-amber-700 dark:text-amber-400">
              Desen çok büyük — ilk {MAX_EXPANSION} kod ile sınırlı.
            </div>
          )}

          <Button
            disabled={codes.length === 0 || printing}
            onClick={() => void runPrint(codes.map(c => ['RAF', c, `BARCODE:${c}`]))}
            className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            <Printer size={14} className="mr-1.5" /> {codes.length} Raf Etiketi Bas
          </Button>
        </Card>
      )}

      {subTab === 'koli' && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Koli No
            </Label>
            <Input
              value={koliNo}
              onChange={e => setKoliNo(e.target.value)}
              placeholder="K-2026-001"
              className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              İçerik Satırları (ürün ; adet)
            </Label>
            <textarea
              value={koliRows}
              onChange={e => setKoliRows(e.target.value)}
              placeholder={'Kalem ; 12\nDefter A4 ; 30'}
              className="w-full min-h-[110px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs font-mono font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y placeholder:font-normal"
            />
          </div>

          {koliLines && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 space-y-0.5">
              {koliLines.map((l, i) => (
                <div
                  key={i}
                  className={`text-xs font-mono ${i === 0 ? 'font-bold text-teal-700 dark:text-teal-300' : 'font-bold text-slate-700 dark:text-slate-200'}`}
                >
                  {l}
                </div>
              ))}
            </div>
          )}

          <Button
            disabled={!koliLines || printing}
            onClick={() => void runPrint([koliLines as string[]])}
            className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            <Printer size={14} className="mr-1.5" /> Koli Etiketi Bas
          </Button>
        </Card>
      )}

      {subTab === 'parti' && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
            {([
              { id: 'imei' as const, label: 'IMEI/Seri' },
              { id: 'lot' as const, label: 'Parti/Lot' }
            ]).map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSerialMode(m.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  serialMode === m.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {serialMode === 'imei' ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  IMEI / Seri Başlangıcı
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={imei}
                    onChange={e => setImei(e.target.value)}
                    placeholder="15 haneli IMEI…"
                    inputMode="numeric"
                    className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
                  />
                  {imei.trim() !== '' &&
                    (imeiOk ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-amber-500 shrink-0" />
                    ))}
                </div>
                {imei.trim() !== '' && !imeiOk && (
                  <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Luhn doğrulaması geçemedi — uyarı, baskı engellenmez.
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Adet (seri üretim)
                </Label>
                <Input
                  value={imeiQty}
                  onChange={e => setImeiQty(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  placeholder="1"
                  className="h-8 w-24 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                {Number(imeiQty) > 1 && !/^\d+$/.test(imei.trim()) && (
                  <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    Seri artışı yalnız sayısal başlangıçta çalışır.
                  </span>
                )}
              </div>

              {imeiSeries.length > 0 && (
                <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {imeiSeries.length} etiket · ilk: {imeiSeries[0]}
                  {imeiSeries.length > 1 ? ` → son: ${imeiSeries[imeiSeries.length - 1]}` : ''}
                </div>
              )}

              <Button
                disabled={imeiSeries.length === 0 || printing}
                onClick={() =>
                  void runPrint(imeiSeries.map(v => ['IMEI', v, `BARCODE:${v}`]))
                }
                className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                <Printer size={14} className="mr-1.5" /> {imeiSeries.length} Etiketi Bas
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Parti No
                </Label>
                <Input
                  value={partiNo}
                  onChange={e => setPartiNo(e.target.value)}
                  placeholder="LOT-2026-A12"
                  className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Üretim Tarihi
                  </Label>
                  <Input
                    type="date"
                    value={uretimTarihi}
                    onChange={e => setUretimTarihi(e.target.value)}
                    className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    SKT
                  </Label>
                  <Input
                    type="date"
                    value={skt}
                    onChange={e => setSkt(e.target.value)}
                    className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tarih Formatı
                </Label>
                <Select
                  value={dateFormat}
                  onValueChange={(v: string | null) => {
                    const next = (v ?? 'GG.AA.YYYY') as DateFormat;
                    if ((DATE_FORMATS as readonly string[]).includes(next)) setDateFormat(next);
                  }}
                >
                  <SelectTrigger className="w-full h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map(f => (
                      <SelectItem key={f} value={f} className="text-xs">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {lotReady && (
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 space-y-0.5">
                  {[`PARTİ: ${partiNo.trim()}${uretimTarihi ? ` · ÜRETİM: ${formatDateInput(uretimTarihi, dateFormat)}` : ''}${skt ? ` · SKT: ${formatDateInput(skt, dateFormat)}` : ''}`].map(
                    l => (
                      <div key={l} className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                        {l}
                      </div>
                    )
                  )}
                </div>
              )}

              <Button
                disabled={!lotReady || printing}
                onClick={() => {
                  const lines = [
                    `PARTİ: ${partiNo.trim()}`,
                    ...(uretimTarihi
                      ? [`ÜRETİM: ${formatDateInput(uretimTarihi, dateFormat)}`]
                      : []),
                    ...(skt ? [`SKT: ${formatDateInput(skt, dateFormat)}`] : []),
                    `BARCODE:${partiNo.trim()}`
                  ];
                  void runPrint([lines]);
                }}
                className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                <Printer size={14} className="mr-1.5" /> Parti Etiketi Bas
              </Button>
            </>
          )}
        </Card>
      )}
    </motion.div>
  );
}
