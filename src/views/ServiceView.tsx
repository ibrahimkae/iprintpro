import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  ArrowLeft, CheckCircle2, ClipboardCopy, Plus, Wrench
} from 'lucide-react';

export type ServiceStatus =
  | 'received'
  | 'inspecting'
  | 'awaiting_approval'
  | 'repairing'
  | 'ready'
  | 'delivered';

export interface ServiceTicket {
  id: string;
  customerName: string;
  phone: string;
  deviceType: string;
  brand?: string;
  model?: string;
  issue: string;
  accessories?: string;
  status: 'received'|'inspecting'|'awaiting_approval'|'repairing'|'ready'|'delivered';
  createdAt: number;
  updatedAt: number;
}

export interface ServiceViewProps {
  onPrintTicket: (ticket: ServiceTicket, compact: boolean) => Promise<void>; // caller renders+basks
  onOpenTrack: (ticketId: string) => void; // future backend page
  tickets: ServiceTicket[];
  onUpdateStatus: (id: string, status: ServiceTicket['status']) => void;
  onCreateTicket: (t: Omit<ServiceTicket,'id'|'createdAt'|'updatedAt'>) => ServiceTicket; // returns with generated id SRV-XXXX counter stored localStorage 'iprint_srv_counter_v1'
  onBack: () => void;
}

type Tab = 'yeni' | 'liste';

const STATUS_LABELS: Record<ServiceTicket['status'], string> = {
  received: 'Kabul',
  inspecting: 'İnceleme',
  awaiting_approval: 'Onay',
  repairing: 'Tamir',
  ready: 'Hazır',
  delivered: 'Teslim'
};

const STATUS_ORDER: ServiceTicket['status'][] = [
  'received', 'inspecting', 'awaiting_approval', 'repairing', 'ready', 'delivered'
];

interface FormState {
  customerName: string;
  phone: string;
  deviceType: string;
  brand: string;
  model: string;
  issue: string;
  accessories: string;
}

const EMPTY_FORM: FormState = {
  customerName: '',
  phone: '',
  deviceType: '',
  brand: '',
  model: '',
  issue: '',
  accessories: ''
};

function deviceLabel(t: ServiceTicket): string {
  const named = [t.brand, t.model].filter(Boolean).join(' ').trim();
  return named || t.deviceType;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function ServiceView(props: ServiceViewProps) {
  const [tab, setTab] = useState<Tab>('yeni');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceTicket['status']>('all');
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const setField = (k: keyof FormState, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? [...props.tickets].sort((a, b) => b.updatedAt - a.updatedAt)
        : props.tickets
            .filter(t => t.status === statusFilter)
            .sort((a, b) => b.updatedAt - a.updatedAt),
    [props.tickets, statusFilter]
  );

  const canSubmit =
    form.customerName.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.deviceType.trim() !== '' &&
    form.issue.trim() !== '';

  async function handleSubmit() {
    if (!canSubmit) {
      setFormError('Müşteri adı, telefon, cihaz tipi ve arıza özeti zorunludur.');
      return;
    }
    setFormError(null);
    const created = props.onCreateTicket({
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      deviceType: form.deviceType.trim(),
      ...(form.brand.trim() ? { brand: form.brand.trim() } : {}),
      ...(form.model.trim() ? { model: form.model.trim() } : {}),
      issue: form.issue.trim(),
      ...(form.accessories.trim() ? { accessories: form.accessories.trim() } : {}),
      status: 'received'
    });
    setForm(EMPTY_FORM);
    setTab('liste');
    try {
      await props.onPrintTicket(created, false);
    } catch {
      // yazıcı hatası kaydı engellemez
    }
  }

  async function handleCopyWhatsApp(t: ServiceTicket) {
    const msg = `Merhaba ${t.customerName}, ${deviceLabel(t)} cihazınız hazır! Takip: ${t.id}`;
    const ok = await copyToClipboard(msg);
    if (ok) {
      setCopiedId(t.id);
      window.setTimeout(() => setCopiedId(prev => (prev === t.id ? null : prev)), 2000);
    }
  }

  return (
    <motion.div
      key="service"
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
          Teknik Servis · {props.tickets.length} kayıt
        </span>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
        {([
          { id: 'yeni' as Tab, label: 'Yeni Kabul' },
          { id: 'liste' as Tab, label: 'Liste' }
        ]).map(tb => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              tab === tb.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'yeni' && (
        <Card className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Müşteri Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.customerName}
              onChange={e => setField('customerName', e.target.value)}
              placeholder="Ad Soyad"
              className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Telefon <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="05xx…"
                inputMode="tel"
                className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Cihaz Tipi <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.deviceType}
                onChange={e => setField('deviceType', e.target.value)}
                placeholder="Telefon, Laptop…"
                className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Marka
              </Label>
              <Input
                value={form.brand}
                onChange={e => setField('brand', e.target.value)}
                placeholder="Samsung…"
                className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Model
              </Label>
              <Input
                value={form.model}
                onChange={e => setField('model', e.target.value)}
                placeholder="Galaxy S24…"
                className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Arıza Özeti <span className="text-red-500">*</span>
            </Label>
            <textarea
              value={form.issue}
              onChange={e => setField('issue', e.target.value)}
              placeholder="Ekranda çizik var, şarj almıyor…"
              className="w-full min-h-[70px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs font-bold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y placeholder:font-normal"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Yanında Gelenler
            </Label>
            <Input
              value={form.accessories}
              onChange={e => setField('accessories', e.target.value)}
              placeholder="Şarj aleti yok, kılıf var…"
              className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
            />
          </div>

          {formError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5 text-xs font-bold text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <Button
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
            className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
          >
            <Plus size={14} className="mr-1.5" /> Kabul Et ve Etiketi Bas
          </Button>
        </Card>
      )}

      {tab === 'liste' && (
        <div className="space-y-3">
          <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
            <div className="flex flex-wrap gap-1.5">
              {(['all', ...STATUS_ORDER] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`py-1 px-2.5 rounded-full text-[11px] font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st === 'all'
                    ? `Tümü (${props.tickets.length})`
                    : `${STATUS_LABELS[st]} (${props.tickets.filter(t => t.status === st).length})`}
                </button>
              ))}
            </div>
          </Card>

          {filtered.length === 0 && (
            <Card className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center">
              <Wrench size={18} className="mx-auto mb-1 text-slate-300" />
              <div className="text-xs font-bold text-slate-400">Kayıt yok.</div>
            </Card>
          )}

          {filtered.map(t => (
            <Card
              key={t.id}
              className={`rounded-xl border shadow-xs bg-white dark:bg-slate-900 transition-colors ${
                openRowId === t.id
                  ? 'border-teal-400 dark:border-teal-700'
                  : 'border-slate-200 dark:border-slate-800 cursor-pointer hover:border-teal-300 dark:hover:border-teal-800'
              }`}
              onClick={() => setOpenRowId(prev => (prev === t.id ? null : t.id))}
            >
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {t.customerName}
                      <span className="ml-1.5 font-mono text-[10px] text-teal-600 dark:text-teal-400">{t.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {deviceLabel(t)} · {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {t.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 rounded-lg text-[11px] font-bold px-2 dark:border-slate-700"
                        onClick={() => void handleCopyWhatsApp(t)}
                      >
                        {copiedId === t.id ? (
                          <>
                            <CheckCircle2 size={13} className="mr-1 text-emerald-500" /> Kopyalandı
                          </>
                        ) : (
                          <>
                            <ClipboardCopy size={13} className="mr-1" /> WhatsApp
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {openRowId === t.id && (
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                      <div>Telefon: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{t.phone}</span></div>
                      <div>Arıza: <span className="font-bold text-slate-700 dark:text-slate-200">{t.issue}</span></div>
                      {t.accessories && (
                        <div>Gelenler: <span className="font-bold text-slate-700 dark:text-slate-200">{t.accessories}</span></div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Durum Değiştir
                      </Label>
                      <Select
                        value={t.status}
                        onValueChange={(v: string | null) => {
                          const next = (v ?? t.status) as ServiceTicket['status'];
                          if (next !== t.status) props.onUpdateStatus(t.id, next);
                        }}
                      >
                        <SelectTrigger className="w-full h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_ORDER.map(s => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-lg text-[11px] font-bold text-teal-600 dark:text-teal-400"
                      onClick={() => props.onOpenTrack(t.id)}
                    >
                      Takip Sayfasını Aç
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
