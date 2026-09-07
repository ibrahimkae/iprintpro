import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Store,
  Coffee,
  Wrench,
  Scissors,
  Warehouse,
  Home,
  X,
} from 'lucide-react';
import type { BusinessMode } from '../lib/business-modes';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShoppingBag,
  Store,
  Coffee,
  Wrench,
  Scissors,
  Warehouse,
  Home,
};

interface ModeOption {
  id: BusinessMode;
  label: string;
  icon: string;
  description: string;
}

const OPTIONS: ModeOption[] = [
  { id: 'boutique', label: 'Butik Satıcı', icon: 'ShoppingBag', description: 'Ürün etiketleri, teşekkür kartları ve kuponlar' },
  { id: 'marketplace', label: 'Pazaryeri Satıcısı', icon: 'Store', description: 'Siparişler, toplu kargo etiketi ve faturalar' },
  { id: 'cafe', label: 'Kafe / Restoran', icon: 'Coffee', description: 'Adisyon, mutfak fişi ve menü etiketleri' },
  { id: 'service', label: 'Teknik Servis', icon: 'Wrench', description: 'Cihaz kabul formu, tamir takibi ve garanti' },
  { id: 'appointment', label: 'Randevulu Hizmet', icon: 'Scissors', description: 'Randevu kartları, hatırlatma ve fiyat listesi' },
  { id: 'warehouse', label: 'Depo / Toptancı', icon: 'Warehouse', description: 'Raf etiketleri, palet ve envanter baskısı' },
  { id: 'personal', label: 'Kişisel', icon: 'Home', description: 'Yapılacak listesi, notlar ve fotoğraf kolajları' },
];

interface ModeWizardProps {
  open: boolean;
  onSelect(mode: BusinessMode): void;
  onSkip(): void;
}

export function ModeWizard({ open, onSelect, onSkip }: ModeWizardProps) {
  const [selected, setSelected] = useState<BusinessMode | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-slate-950/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                  İş Modunuzu Seçin
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ana ekranınız sektörünüze göre düzenlenir. Tüm araçlar erişilebilir kalır.
                </p>
              </div>
              <button
                onClick={onSkip}
                aria-label="Kapat"
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4">
              {OPTIONS.map((opt) => {
                const Icon = ICONS[opt.icon];
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelected(opt.id)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-150 group ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:border-teal-600 ring-2 ring-teal-600/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`inline-flex p-2.5 rounded-lg mb-2 transition-colors ${
                        isSelected
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <p className={`font-bold text-sm tracking-tight ${isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400 mt-0.5">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onSkip}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 underline underline-offset-4 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Şimdilik atla — Kişisel modda başla
              </button>
              <button
                disabled={!selected}
                onClick={() => selected && onSelect(selected)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  selected
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                }`}
              >
                Başlat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
