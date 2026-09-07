import React from 'react';
import { LabelDimension, ThermalPaperStyle } from '../types';
import { STANDARD_DIMENSIONS } from '../data/dimensions';
import {
  Printer,
  Search,
  Plus,
  Heart,
  Archive,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
  Menu,
  FileDown
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDimension: LabelDimension;
  onDimensionChange: (dim: LabelDimension) => void;
  paperStyle: ThermalPaperStyle;
  onPaperStyleChange: (style: ThermalPaperStyle) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  onOpenCreateModal: () => void;
  onOpenBackupModal: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedDimension,
  onDimensionChange,
  paperStyle,
  onPaperStyleChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  onOpenCreateModal,
  onOpenBackupModal,
  onToggleMobileMenu
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#181818] border-b border-[#2A2A2A] text-white no-print">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left: Mobile Menu Toggle & Title or Search */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl bg-[#252525] border border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#333] lg:hidden transition-colors"
              title="Menüyü Aç"
            >
              <Menu size={18} />
            </button>
          )}

          {/* Search Bar in Bento Style */}
          <div className="relative w-full max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Şablon, barkod, kahve, kargo ara..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#252525] border border-[#2A2A2A] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Center: Width Mode Switcher (Bento Pill Bar) */}
        <div className="hidden sm:flex items-center gap-2 bg-[#252525] border border-[#2A2A2A] px-3 py-1.5 rounded-full">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
            <Layers size={13} className="text-blue-400" />
            Genişlik:
          </span>
          <div className="flex gap-1.5">
            {STANDARD_DIMENSIONS.slice(0, 4).map((dim) => {
              const isSelected = selectedDimension.id === dim.id;
              return (
                <button
                  key={dim.id}
                  onClick={() => onDimensionChange(dim)}
                  className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-[#181818] hover:bg-[#333] text-gray-300'
                  }`}
                >
                  {dim.badge || dim.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Paper Look Switcher & Print / Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Thermal Paper Appearance Switcher */}
          <div className="flex items-center gap-1 bg-[#252525] border border-[#2A2A2A] p-1 rounded-xl">
            {(['standard', 'vintage', 'dither', 'invert'] as ThermalPaperStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => onPaperStyleChange(style)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                  paperStyle === style
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {style === 'standard' && 'Beyaz'}
                {style === 'vintage' && 'Kraft'}
                {style === 'dither' && 'Matris'}
                {style === 'invert' && 'Siyah'}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-[#252525] hover:bg-[#333] border border-[#2A2A2A] rounded-xl text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition-colors"
            title="Tüm Sayfayı / Aktif Şablonu Yazdır"
          >
            <Printer size={14} className="text-blue-400" />
            <span className="hidden md:inline">Yazdır</span>
          </button>
        </div>

      </div>

      {/* Sub-bar for Mobile Width selector if on small screens */}
      <div className="sm:hidden px-4 pb-2.5 pt-1 flex items-center justify-between border-t border-[#2A2A2A]/50 overflow-x-auto gap-2">
        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">Genişlik:</span>
        <div className="flex gap-1">
          {STANDARD_DIMENSIONS.slice(0, 4).map((dim) => {
            const isSelected = selectedDimension.id === dim.id;
            return (
              <button
                key={dim.id}
                onClick={() => onDimensionChange(dim)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-[#252525] text-gray-300'
                }`}
              >
                {dim.badge || dim.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
