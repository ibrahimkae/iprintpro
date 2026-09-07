import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CalendarClock, MapPin, Printer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  resolveTemplate, type ResolvedBlock
} from '../lib/template-variables';

export interface AppointmentViewProps {
  onPrintBlocks: (blocks: ResolvedBlock[], widthPx: number, label: string) => Promise<void>; // caller does bitmap+BLE
  businessAddress?: string;
  onBack: () => void;
}

const LAST_KEY = 'iprint_appt_last_v1';

interface ApptForm {
  name: string;
  islem: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  phone: string;
}

const EMPTY_FORM: ApptForm = { name: '', islem: '', date: '', time: '', phone: '' };

const pad2 = (n: number) => String(n).padStart(2, '0');
/** Kullanıcı metnini şablon motorundan geçirirken süslü parantezleri temizle. */
const escTpl = (s: string) => s.replace(/[{}]/g, '');

/** Yerel girilen tarih/saati cihaz saat dilimi varsayımıyla UTC "YYYYMMDDTHHMMSSZ"e çevirir. */
function localToUtcStamp(date: string, time: string): string | null {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function addMinutesUtc(stamp: string, minutes: number): string {
  const y = Number(stamp.slice(0, 4));
  const mo = Number(stamp.slice(4, 6)) - 1;
  const d = Number(stamp.slice(6, 8));
  const h = Number(stamp.slice(9, 11));
  const mi = Number(stamp.slice(11, 13));
  const dt = new Date(Date.UTC(y, mo, d, h, mi) + minutes * 60000);
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function buildIcs(form: ApptForm): string {
  const start = localToUtcStamp(form.date, form.time) ?? '';
  const end = addMinutesUtc(start, 60); // varsayılan süre 60 dk
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const escIcs = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//iPrint Pro//Randevu//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2, 8)}@iprint`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escIcs(`${form.name.trim()} - ${form.islem.trim()}`)}`,
    form.phone.trim() ? `DESCRIPTION:${escIcs(`Tel: ${form.phone.trim()}`)}` : null,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter((l): l is string => l !== null);
  return lines.join('\r\n');
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AppointmentView(props: AppointmentViewProps) {
  const [form, setForm] = useState<ApptForm>(() =>
    loadJson<ApptForm>(LAST_KEY, EMPTY_FORM)
  );
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify(form));
    } catch {
      /* kota dolu olabilir */
    }
  }, [form]);

  const set = (k: keyof ApptForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const canPrint =
    form.name.trim() !== '' &&
    form.islem.trim() !== '' &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.date) &&
    /^\d{2}:\d{2}$/.test(form.time) &&
    !!localToUtcStamp(form.date, form.time);

  async function handlePrint() {
    if (!canPrint) return;
    setPrinting(true);
    setError(null);

    const template =
      `* RANDEVU *\n` +
      `Müşteri: {Musteri_Adi}\n` +
      `İşlem: {Islem}\n` +
      `Tarih/Saat: {Randevu_Tarihi:tarih} {Randevu_Saati}\n` +
      (form.phone.trim() ? `Telefon: {Telefon}\n` : '') +
      `\nRandevunuza 15 dk önce lütfen.\n`;

    const values: Record<string, string> = {
      Musteri_Adi: escTpl(form.name),
      Islem: escTpl(form.islem),
      Randevu_Tarihi: form.date,
      Randevu_Saati: form.time,
      Telefon: escTpl(form.phone)
    };
    const blocks: ResolvedBlock[] = resolveTemplate(template, values);

    // Takvim QR — .ics data URI (Google/Apple takvim uyumlu)
    const ics = buildIcs(form);
    blocks.push({ kind: 'qr', value: 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics) });

    // Konum QR — işletme adresi doluysa maps linki
    const address = props.businessAddress?.trim();
    if (address) {
      blocks.push({ kind: 'qr', value: 'https://maps.google.com/?q=' + encodeURIComponent(address) });
      blocks.push({ kind: 'text', value: 'Konum QR: ' + address });
    }

    try {
      await props.onPrintBlocks(blocks, 384, 'RANDEVU');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Baskı hatası');
    } finally {
      setPrinting(false);
    }
  }

  const inputCls =
    'h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold';
  const labelCls = 'text-[11px] font-bold text-slate-500 uppercase tracking-wider';

  return (
    <motion.div
      key="appointments"
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
          Randevu Fişi
        </span>
      </div>

      <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
        <div className="space-y-1.5">
          <Label className={labelCls}>Müşteri Adı *</Label>
          <Input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="Ad Soyad" className={`w-full ${inputCls}`} />
        </div>

        <div className="space-y-1.5">
          <Label className={labelCls}>İşlem *</Label>
          <Input value={form.islem} onChange={e => set('islem')(e.target.value)} placeholder="Saç boyama, kontrol…" className={`w-full ${inputCls}`} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className={labelCls}>Tarih *</Label>
            <Input type="date" value={form.date} onChange={e => set('date')(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Saat *</Label>
            <Input type="time" value={form.time} onChange={e => set('time')(e.target.value)} className={`w-full ${inputCls}`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className={labelCls}>Telefon (opsiyonel)</Label>
          <Input value={form.phone} onChange={e => set('phone')(e.target.value)} inputMode="tel" placeholder="05xx…" className={`w-full ${inputCls}`} />
        </div>

        {!props.businessAddress && (
          <p className="text-[10px] font-bold text-slate-400">
            Konum QR için ayarlarda işletme adresi tanımlayın.
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5 text-xs font-bold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Button
          disabled={!canPrint || printing}
          onClick={() => void handlePrint()}
          className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm"
        >
          <Printer size={15} className="mr-1.5" /> Fiş Bas
        </Button>

        <div className="flex items-start gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2.5">
          <CalendarClock size={14} className="mt-0.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            Fişe takvim QR (.ics) otomatik eklenir{props.businessAddress ? ', konum QR ile birlikte' : ''}.
            Son kullanılan bilgiler bir sonraki açılışta hatırlanır.
          </span>
        </div>

        {props.businessAddress && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <MapPin size={12} /> {props.businessAddress}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
