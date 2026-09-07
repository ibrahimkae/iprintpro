import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Store,
  Coffee,
  Wrench,
  Scissors,
  Warehouse,
  Home,
  FileText,
  Type,
  Image as ImageIcon,
  Library,
  QrCode,
  Tag,
  Layers,
  Settings2,
  ShoppingCart,
  Receipt,
  Package,
  CalendarDays,
  ChevronDown,
} from 'lucide-react';
import {
  MODES,
  TOOL_CATALOG,
  type ModeConfig,
  type ToolId,
} from '../lib/business-modes';

const MODE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  ShoppingBag,
  Store,
  Coffee,
  Wrench,
  Scissors,
  Warehouse,
  Home,
};

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

/** toolId → mevcut App görünüm adları ('menu'|'editor'|'image'|'document'|'banner'|'collage'|'tools'|'templates') */
const VIEW_MAP: Partial<Record<ToolId, string>> = {
  archive: 'archive',
  templates: 'templates',
  editor: 'editor',
  image: 'image',
  tools: 'tools',
  document: 'document',
  banner: 'banner',
  collage: 'collage',
  batch: 'batch',
  pos: 'pos',
  service: 'service',
  appointments: 'appointments',
  orders: 'orders',
};

const TOOL_ICONS: Record<ToolId, LucideIcon> = {
  archive: Store,
  templates: Library,
  editor: Type,
  image: ImageIcon,
  tools: QrCode,
  document: FileText,
  banner: Tag,
  collage: Layers,
  orders: ShoppingCart,
  pos: Receipt,
  batch: Package,
  service: Wrench,
  appointments: CalendarDays,
};

const TOOL_COLORS: Record<ToolId, string> = {
  archive: 'bg-indigo-50',
  templates: 'bg-blue-50',
  editor: 'bg-teal-50',
  image: 'bg-orange-50',
  tools: 'bg-red-50',
  document: 'bg-blue-50',
  banner: 'bg-green-50',
  collage: 'bg-purple-50',
  orders: 'bg-orange-50',
  pos: 'bg-amber-50',
  batch: 'bg-indigo-50',
  service: 'bg-yellow-50',
  appointments: 'bg-pink-50',
};

interface SmartHomeGridProps {
  mode: ModeConfig | null;
  onNavigate(view: string): void;
  onOpenHistory?(): void;
  onOpenSettings?(): void;
  onOpenWizard?(): void;
}

export function SmartHomeGrid({ mode, onNavigate, onOpenHistory, onOpenSettings, onOpenWizard }: SmartHomeGridProps) {
  const [showAllTools, setShowAllTools] = useState(false);

  const primaryTools: ToolId[] = mode?.primaryTools ?? ['templates', 'editor', 'image', 'tools', 'document', 'banner', 'collage', 'orders'];
  const remainingTools = (Object.keys(TOOL_CATALOG) as ToolId[]).filter((t) => !primaryTools.includes(t));

  const ModeIcon = mode ? MODE_ICONS[mode.icon] : Home;

  return (
    <div className="p-3 sm:p-4 space-y-4 max-w-sm md:max-w-none mx-auto w-full">
      {/* Karşılama satırı */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {ModeIcon && (
            <div className="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 p-2 rounded-xl shrink-0">
              <ModeIcon size={18} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight truncate">
              {mode ? mode.label : 'Kişisel'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">İş Modu</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onOpenWizard && (
            <button
              onClick={onOpenWizard}
              className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline underline-offset-4 px-2 py-1 transition-colors rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              Değiştir
            </button>
          )}
        </div>
      </div>

      {/* Birincil araçlar grid'i */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 menu-grid">
        {primaryTools.map((toolId) => {
          const meta = TOOL_CATALOG[toolId];
          const Icon = TOOL_ICONS[toolId];
          const view = VIEW_MAP[toolId];
          const soon = !view || meta.comingSoon;

          const card = (
            <>
              <div className={`relative ${TOOL_COLORS[toolId]} dark:bg-slate-900 p-2.5 rounded-lg mb-2 shadow-xs`}>
                <Icon size={22} className="text-slate-700 dark:text-slate-200" />
                {soon && (
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-800 dark:bg-slate-700 text-white text-[8px] font-bold uppercase tracking-wide">
                    Yakında
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-center text-xs tracking-tight">{meta.title}</span>
            </>
          );

          return soon ? (
            <motion.div
              key={toolId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`menu-grid-item ${TOOL_COLORS[toolId]} opacity-70 cursor-not-allowed group shadow-sm border border-slate-200/60 dark:border-slate-800 rounded-lg`}
            >
              {card}
            </motion.div>
          ) : (
            <motion.div
              key={toolId}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(view as string)}
              className={`menu-grid-item ${TOOL_COLORS[toolId]} cursor-pointer group shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/60 dark:border-slate-800 rounded-lg`}
            >
              {card}
            </motion.div>
          );
        })}
      </div>

      {/* Tüm Araçlar — açılır bölüm */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 overflow-hidden">
        <button
          onClick={() => setShowAllTools((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tüm Araçlar ({remainingTools.length})
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showAllTools ? 'rotate-180' : ''}`} />
        </button>
        {showAllTools && (
          <div className="px-3 pb-3 space-y-1.5">
            {remainingTools.map((toolId) => {
              const meta = TOOL_CATALOG[toolId];
              const Icon = TOOL_ICONS[toolId];
              const view = VIEW_MAP[toolId];
              const soon = !view || meta.comingSoon;
              return (
                <button
                  key={toolId}
                  disabled={soon}
                  onClick={() => onNavigate(view as string)}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    soon
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  <div className={`${TOOL_COLORS[toolId]} dark:bg-slate-800 p-1.5 rounded-md shrink-0`}>
                    <Icon size={15} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <span className="flex-1 text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{meta.title}</span>
                  {soon && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase">
                      Yakında
                    </span>
                  )}
                </button>
              );
            })}
            {/* Mod değiştirme kısayolu */}
            {onOpenWizard && (
              <button
                onClick={onOpenWizard}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors cursor-pointer text-left"
              >
                <div className="bg-teal-100 dark:bg-teal-900/40 p-1.5 rounded-md shrink-0">
                  <Store size={15} className="text-teal-600 dark:text-teal-400" />
                </div>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">İş Modunu Değiştir</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mod önerisi (mod seçilmemişse) */}
      {!mode && (
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 pb-2">
          Sektörünüze özel düzen için yukarıdaki "Değiştir" bağlantısından bir iş modu seçin.
        </p>
      )}
    </div>
  );
}

/** Mevcut MODES listesini dışa aktaran yardımcı (Ayarlar ekranı için) */
export const AVAILABLE_MODES = MODES;
