import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, Ban, Minus, Plus, Printer, RotateCcw, Settings2,
  ShoppingBasket, Store, Upload
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  resolveTemplate, formatMoney, type ResolvedBlock
} from '../lib/template-variables';

export interface PosViewProps {
  onPrintBlocks: (blocks: ResolvedBlock[], widthPx: number, label: string) => Promise<void>; // caller does bitmap+BLE
  pageWidth: number;
  onBack: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  active: boolean;
}
interface CartLine { qty: number; note: string }
interface DayStats { count: number; totalCents: number }
interface PosSettings { iban?: string; merchant?: string }

const MENU_KEY = 'iprint_pos_menu_v1';
const DAY_KEY = 'iprint_pos_day_v1';
/** Opsiyonel: uygulama ayarlarından IBAN/alıcı adı. Yoksa ödeme QR bloğu basılmaz. */
const SETTINGS_KEY = 'iprint_pos_settings_v1';

const DEFAULT_MENU: MenuItem[] = [
  { id: 'm1', name: 'Türk Kahvesi', price: 45, category: 'Kahve', active: true },
  { id: 'm2', name: 'Latte', price: 65, category: 'Kahve', active: true },
  { id: 'm3', name: 'Çay', price: 20, category: 'Sıcak İçecek', active: true },
  { id: 'm4', name: 'Su', price: 10, category: 'Soğuk İçecek', active: true },
  { id: 'm5', name: 'Simit', price: 25, category: 'Fırın', active: true }
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kota dolu olabilir */
  }
}
const newId = () => `mi_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
/** Şablon motoruna girmeden önce kullanıcı metnindeki süslü parantezleri temizle. */
const escTpl = (s: string) => s.replace(/[{}]/g, '');
const toCents = (n: number) => Math.round(n * 100);
const fmtSum = (cents: number) => (cents / 100).toFixed(2);

/**
 * EMVCo-tutarlı statik ödeme yükü (yaklaşım): TLV etiketleri IBAN + tutar + alıcıyı taşır.
 * TAM TR-Karekod ödemesi PSP entegrasyonu gerektirir; bu QR destekleyen banka
 * uygulamasında tutarı gösterir, göstermezse IBAN transferini açar.
 */
function buildEmvCoPayload(iban: string, amountCents: number, merchant: string): string {
  const enc = new TextEncoder();
  const tlv = (tag: string, value: string): string => {
    const bytes = enc.encode(value);
    const lenHex = bytes.length.toString(16).toUpperCase().padStart(2, '0');
    return tag + lenHex + value;
  };
  const amt = (amountCents / 100).toFixed(2);
  const mch = escTpl(merchant || '').slice(0, 25);
  return (
    tlv('00', '01') +
    tlv('01', '11') +
    tlv('26', tlv('00', 'TRQR') + tlv('01', iban.replace(/\s/g, ''))) +
    tlv('52', '5611') +
    tlv('53', '949') +
    tlv('54', amt) +
    tlv('59', mch || 'ISYERI') +
    tlv('63', '04') // CRC hariç — yaklaşık yük (tam TR-Karekod için PSP gerekir)
  );
}

export function PosView(props: PosViewProps) {
  const [screen, setScreen] = useState<'sales' | 'menu'>('sales');

  const [menu, setMenu] = useState<MenuItem[]>(() => loadJson<MenuItem[]>(MENU_KEY, DEFAULT_MENU));
  const [dayStats, setDayStats] = useState<DayStats>(() => loadJson<DayStats>(DAY_KEY, { count: 0, totalCents: 0 }));

  const [tableLabel, setTableLabel] = useState('');
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [salesCat, setSalesCat] = useState('*');
  const [menuCatFilter, setMenuCatFilter] = useState('*');

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCat, setEditCat] = useState('');

  const [csvText, setCsvText] = useState('');
  const [csvReport, setCsvReport] = useState<string | null>(null);

  const [dayPanelOpen, setDayPanelOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  useEffect(() => saveJson(MENU_KEY, menu), [menu]);
  useEffect(() => saveJson(DAY_KEY, dayStats), [dayStats]);

  const categories = useMemo(
    () => Array.from(new Set(menu.map(m => m.category.trim()).filter(Boolean))),
    [menu]
  );

  const cartEntries = useMemo(
    () =>
      Object.entries(cart)
        .map(([itemId, line]) => {
          const item = menu.find(m => m.id === itemId);
          return item ? { item, line } : null;
        })
        .filter((e): e is { item: MenuItem; line: CartLine } => e !== null),
    [cart, menu]
  );

  const sumCents = useMemo(
    () => cartEntries.reduce((acc, e) => acc + toCents(e.item.price) * e.line.qty, 0),
    [cartEntries]
  );

  function addToCart(item: MenuItem) {
    setCart(c => ({ ...c, [item.id]: { qty: (c[item.id]?.qty ?? 0) + 1, note: c[item.id]?.note ?? '' } }));
  }
  function changeQty(itemId: string, delta: number) {
    setCart(c => {
      const cur = c[itemId];
      if (!cur) return c;
      const qty = cur.qty + delta;
      if (qty <= 0) {
        const next = { ...c };
        delete next[itemId];
        return next;
      }
      return { ...c, [itemId]: { ...cur, qty } };
    });
  }
  function setNote(itemId: string, note: string) {
    setCart(c => (c[itemId] ? { ...c, [itemId]: { ...c[itemId], note } } : c));
  }

  function importCsv() {
    let added = 0;
    let errors = 0;
    const rows: MenuItem[] = [];
    csvText.split(/\r?\n/).forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line) return;
      const parts = line.split(';').map(p => p.trim());
      if (parts.length < 3) { errors++; return; }
      if (idx === 0 && parts[0].toLowerCase() === 'ad') return; // başlık satırı
      const price = parseFloat(parts[2].replace(',', '.'));
      if (!parts[0] || Number.isNaN(price) || !Number.isFinite(price)) { errors++; return; }
      rows.push({ id: newId(), name: parts[0], price, category: parts[1] || 'Diğer', active: true });
      added++;
    });
    if (added > 0) setMenu(m => [...m, ...rows]);
    setCsvReport(`${added} ürün eklendi · ${errors} hatalı satır`);
    if (added > 0) setCsvText('');
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCat(item.category);
  }

  function saveEdit() {
    if (!editingId) return;
    const price = parseFloat(editPrice.replace(',', '.'));
    if (!editName.trim() || Number.isNaN(price)) return;
    setMenu(m =>
      m.map(it =>
        it.id === editingId
          ? { ...it, name: editName.trim(), price, category: editCat.trim() || it.category }
          : it
      )
    );
    setEditingId(null);
  }

  const salesItems = useMemo(
    () => menu.filter(m => m.active && (salesCat === '*' || m.category === salesCat)),
    [menu, salesCat]
  );
  const menuRows = useMemo(
    () => menu.filter(m => menuCatFilter === '*' || m.category === menuCatFilter),
    [menu, menuCatFilter]
  );

  const print = useCallback(
    async (blocks: ResolvedBlock[], label: string) => {
      setPrinting(true);
      setPrintError(null);
      try {
        await props.onPrintBlocks(blocks, props.pageWidth, label);
      } catch (e) {
        setPrintError(e instanceof Error ? e.message : 'Baskı hatası');
      } finally {
        setPrinting(false);
      }
    },
    [props.onPrintBlocks, props.pageWidth]
  );

  async function printKitchenTicket() {
    const items = cartEntries;
    if (items.length === 0) return;
    const itemsText = items
      .map(e => `${e.line.qty}x ${e.item.name}${e.line.note ? ` (${escTpl(e.line.note)})` : ''}`)
      .join('\n');
    const template = `MASA/PAKET: {Masa}\n----MUTFAK----\n${escTpl(itemsText)}\n`;
    const blocks = resolveTemplate(template, { Masa: tableLabel.trim() || 'PAKET' });
    await print(blocks, 'POS MUTFAK');
  }

  async function printCustomerReceipt() {
    const items = cartEntries;
    if (items.length === 0) return;
    const itemsText = items
      .map(e => {
        const lineCents = toCents(e.item.price) * e.line.qty;
        return `${e.line.qty}x ${escTpl(e.item.name)} .. ${formatMoney(lineCents / 100)}`;
      })
      .join('\n');

    const settings = loadJson<PosSettings>(SETTINGS_KEY, {});
    const hasPayQr = !!settings.iban?.trim();

    const template =
      `* iPRINT POS *\nMASA/PAKET: {Masa}\n----------------------\n${escTpl(itemsText)}\n` +
      `----------------------\nTOPLAM: {Tutar:para}\nTESEKKUR EDERIZ\n`;
    const values = {
      Masa: tableLabel.trim() || 'PAKET',
      Tutar: fmtSum(sumCents)
    };
    const blocks = resolveTemplate(template, values);

    if (hasPayQr && settings.iban) {
      // Yaklaşık EMVCo statik ödeme QR'ı — tam TR-Karekod PSP gerektirir (bkz. buildEmvCoPayload).
      blocks.push({ kind: 'qr', value: buildEmvCoPayload(settings.iban, sumCents, settings.merchant ?? '') });
    }

    await print(blocks, 'POS FİŞ');
    setDayStats(d => ({ count: d.count + 1, totalCents: d.totalCents + sumCents }));
    setCart({});
  }

  async function printDayClose() {
    const summary =
      `* GÜN SONU ÖZETİ *\nKapalı Adisyon: ${dayStats.count}\nCiro Toplamı: ${formatMoney(dayStats.totalCents / 100)}\n` +
      `MALİ DEĞİLDİR\n(Yönetimsel bilgilendirme fişi)\n`;
    await print(resolveTemplate(summary, {}), 'GÜN SONU · MALİ DEĞİLDİR');
    setDayStats({ count: 0, totalCents: 0 });
    setDayPanelOpen(false);
  }

  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
      active
        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }`;

  return (
    <motion.div
      key="pos"
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
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button type="button" onClick={() => setScreen('sales')} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${screen === 'sales' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'}`}>
            <ShoppingBasket size={13} /> Satış
          </button>
          <button type="button" onClick={() => setScreen('menu')} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${screen === 'menu' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-300'}`}>
            <Settings2 size={13} /> Menü
          </button>
        </div>
      </div>

      {printError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5 text-xs font-bold text-red-600 dark:text-red-400">
          {printError}
        </div>
      )}

      {screen === 'sales' && (
        <>
          <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 flex items-center gap-2">
            <Store size={15} className="text-slate-400 shrink-0" />
            <Input
              value={tableLabel}
              onChange={e => setTableLabel(e.target.value)}
              placeholder="Masa no veya PAKET…"
              className="h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={printing || dayStats.count === 0}
              onClick={() => setDayPanelOpen(o => !o)}
              className="h-8 shrink-0 rounded-lg text-xs font-bold dark:border-slate-700"
            >
              Gün Sonu ({dayStats.count})
            </Button>
          </Card>

          {dayPanelOpen && (
            <Card className="p-4 rounded-xl border border-teal-200 dark:border-teal-800 shadow-xs bg-teal-50/50 dark:bg-teal-950/30 space-y-3">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gün Sonu Özeti</Label>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{dayStats.count}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Kapalı Adisyon</div>
                </div>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5">
                  <div className="text-sm font-bold text-teal-600 dark:text-teal-400">{fmtSum(dayStats.totalCents)} ₺</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Ciro Toplamı</div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Bu özet yönetimseldir — MALİ DEĞİLDİR.</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDayPanelOpen(false)}
                  className="flex-1 h-9 rounded-xl text-xs font-bold dark:border-slate-700"
                >
                  Kapat
                </Button>
                <Button
                  disabled={printing || dayStats.count === 0}
                  onClick={() => void printDayClose()}
                  className="flex-1 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  <Printer size={14} className="mr-1.5" /> Özeti Bas
                </Button>
              </div>
            </Card>
          )}

          <div className="grid md:grid-cols-[1fr_18rem] gap-3 items-start">
            <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => setSalesCat('*')} className={chipCls(salesCat === '*')}>Tümü</button>
                {categories.map(cat => (
                  <button key={cat} type="button" onClick={() => setSalesCat(cat)} className={chipCls(salesCat === cat)}>
                    {cat}
                  </button>
                ))}
              </div>
              {salesItems.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-slate-400">Menü boş — Menü sekmesinden ürün ekleyin.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {salesItems.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addToCart(item)}
                      className="h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors px-2 flex flex-col items-center justify-center text-center"
                    >
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight truncate w-full">{item.name}</span>
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">{formatMoney(item.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sepet</Label>
                {cartEntries.length > 0 && (
                  <button type="button" onClick={() => setCart({})} className="text-[10px] font-bold text-red-500 hover:underline">
                    Temizle
                  </button>
                )}
              </div>

              {cartEntries.length === 0 ? (
                <div className="py-6 text-center text-xs font-bold text-slate-400">Ürün seçin…</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {cartEntries.map(({ item, line }) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{item.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button type="button" onClick={() => changeQty(item.id, -1)} className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold">{line.qty}</span>
                          <button type="button" onClick={() => changeQty(item.id, 1)} className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <Input
                        value={line.note}
                        onChange={e => setNote(item.id, e.target.value)}
                        placeholder="Not (az şeker, sade…)"
                        className="h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Toplam</span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{fmtSum(sumCents)} ₺</span>
              </div>

              <Button
                disabled={printing || cartEntries.length === 0}
                onClick={() => void printKitchenTicket()}
                variant="outline"
                className="w-full h-9 rounded-xl text-xs font-bold dark:border-slate-700"
              >
                <Printer size={14} className="mr-1.5" /> Mutfak Fişi
              </Button>
              <Button
                disabled={printing || cartEntries.length === 0}
                onClick={() => void printCustomerReceipt()}
                className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                <ShoppingBasket size={14} className="mr-1.5" /> Müşteri Fişi
              </Button>
            </Card>
          </div>
        </>
      )}

      {screen === 'menu' && (
        <>
          <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-3">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ürün Ekle</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ad" className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <Input value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Fiyat" inputMode="decimal" className="w-full sm:w-24 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Kategori" className="flex-1 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold" />
              <Button
                size="sm"
                disabled={!newName.trim() || Number.isNaN(parseFloat(newPrice.replace(',', '.')))}
                onClick={() => {
                  const price = parseFloat(newPrice.replace(',', '.'));
                  if (Number.isNaN(price) || !newName.trim()) return;
                  setMenu(m => [...m, { id: newId(), name: newName.trim(), price, category: newCat.trim() || 'Diğer', active: true }]);
                  setNewName('');
                  setNewPrice('');
                  setNewCat('');
                }}
                className="h-8 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 shrink-0"
              >
                <Plus size={13} className="mr-1" /> Ekle
              </Button>
            </div>
          </Card>

          <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">CSV İçe Aktar</Label>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={'ad;kategori;fiyat\nLatte;Kahve;65'}
              rows={4}
              className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 resize-y"
            />
            {csvReport && (
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 p-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                {csvReport}
              </div>
            )}
            <Button
              disabled={!csvText.trim()}
              onClick={importCsv}
              className="w-full h-8 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs"
            >
              <Upload size={13} className="mr-1.5" /> Satırları İçe Aktar
            </Button>
          </Card>

          <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setMenuCatFilter('*')} className={chipCls(menuCatFilter === '*')}>Tümü</button>
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setMenuCatFilter(cat)} className={chipCls(menuCatFilter === cat)}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              {menuRows.map(item => (
                <div key={item.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-2">
                  {editingId === item.id ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <Input value={editPrice} onChange={e => setEditPrice(e.target.value)} inputMode="decimal" className="sm:w-20 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <Input value={editCat} onChange={e => setEditCat(e.target.value)} className="sm:w-28 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold" />
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" onClick={saveEdit} className="h-7 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3">Kaydet</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7 rounded-lg text-xs font-bold px-3 dark:border-slate-700">İptal</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`text-xs font-bold truncate block ${item.active ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{item.category} · {formatMoney(item.price)}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)} className="h-7 rounded-lg text-xs font-bold px-2.5 dark:border-slate-700">Düzenle</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMenu(m => m.map(it => (it.id === item.id ? { ...it, active: !it.active } : it)))}
                          className="h-7 rounded-lg text-xs font-bold px-2.5 dark:border-slate-700"
                        >
                          {item.active ? (<><Ban size={12} className="mr-1" /> Pasifleştir</>) : (<><RotateCcw size={12} className="mr-1" /> Aktif Et</>)}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
