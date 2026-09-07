import React from 'react';
import { LabelCategory, LabelDimension } from '../types';
import { CATEGORY_METADATA, STANDARD_DIMENSIONS } from '../data/dimensions';
import {
  LayoutGrid,
  ShoppingBag,
  Tag,
  Receipt,
  Barcode,
  Truck,
  AlertTriangle,
  Sparkles,
  CheckSquare,
  Bookmark,
  Printer,
  Heart,
  Archive,
  Plus,
  Layers,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';

interface SidebarProps {
  activeCategory: LabelCategory;
  onSelectCategory: (cat: LabelCategory) => void;
  categoryCounts: Record<string, number>;
  selectedDimension: LabelDimension;
  onDimensionChange: (dim: LabelDimension) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  onOpenCreateModal: () => void;
  onOpenBackupModal: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeCategory,
  onSelectCategory,
  categoryCounts,
  selectedDimension,
  onDimensionChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  onOpenCreateModal,
  onOpenBackupModal,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'ecommerce_shipping':
        return <ShoppingBag size={15} />;
      case 'product':
        return <Tag size={15} />;
      case 'receipt':
        return <Receipt size={15} />;
      case 'inventory':
        return <Barcode size={15} />;
      case 'shipping':
        return <Truck size={15} />;
      case 'warning':
        return <AlertTriangle size={15} />;
      case 'organization':
        return <Layers size={15} />;
      case 'stickers':
        return <Sparkles size={15} />;
      case 'notes':
        return <CheckSquare size={15} />;
      case 'custom':
        return <Bookmark size={15} />;
      case 'all':
      default:
        return <LayoutGrid size={15} />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#181818] border-r border-[#2A2A2A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 no-print ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top App Brand / Header */}
        <div>
          <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20">
                T
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold tracking-tight text-white leading-none">
                    ThermalLab
                  </h1>
                  <span className="text-[10px] font-mono font-bold bg-[#2A2A2A] text-blue-400 px-1.5 py-0.5 rounded">
                    v1.2
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">57mm Termal & Bento Stüdyosu</p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2A2A] lg:hidden"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Quick Action Button */}
          <div className="p-4 border-b border-[#2A2A2A]/60 space-y-2">
            <button
              onClick={() => {
                onOpenCreateModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all transform active:scale-98"
            >
              <Plus size={16} />
              <span>Yeni Şablon Oluştur</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onToggleFavoritesOnly();
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  showFavoritesOnly
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-[#222] hover:bg-[#2A2A2A] text-gray-300 border border-[#2A2A2A]'
                }`}
              >
                <Heart size={13} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                <span>Favori ({favoritesCount})</span>
              </button>

              <button
                onClick={() => {
                  onOpenBackupModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="py-1.5 px-2 bg-[#222] hover:bg-[#2A2A2A] text-gray-300 border border-[#2A2A2A] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Archive size={13} />
                <span>Yedek & ZIP</span>
              </button>
            </div>
          </div>

          {/* Categories Navigation */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-370px)] scrollbar-thin">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">
              Şablon Kategorileri
            </div>

            {CATEGORY_METADATA.map((cat) => {
              const isSelected = !showFavoritesOnly && activeCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (showFavoritesOnly) onToggleFavoritesOnly();
                    onSelectCategory(cat.id as LabelCategory);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                      {getCategoryIcon(cat.id)}
                    </span>
                    <span>{cat.label}</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-blue-500/80 text-white' : 'bg-[#2A2A2A] text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Bento Section: Active Printer Widget & Quick Info */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#1A1A1A] space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Aktif Termal Yazıcı</span>
              <span className="text-[10px] text-blue-400 font-mono">USB / ESC-POS</span>
            </div>

            <div className="bg-[#222] border border-[#2A2A2A] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 absolute inset-0 animate-ping" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white leading-tight">
                    Mini_Thermal_{selectedDimension.widthMm}mm
                  </div>
                  <div className="text-[10px] text-gray-400">203 DPI • Doğrudan Vektör</div>
                </div>
              </div>

              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-bold px-1.5 py-0.5 rounded">
                HAZIR
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#2A2A2A]/50">
            <span>Rulo Genişliği:</span>
            <span className="font-mono font-bold text-gray-300">{selectedDimension.name}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
