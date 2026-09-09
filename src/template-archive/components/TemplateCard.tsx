import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { ThermalTemplate, LabelDimension, ThermalPaperStyle } from '../types';
import { ThermalTemplateRenderer } from './ThermalTemplateRenderer';
import { Heart, Printer, Edit3 } from 'lucide-react';

interface TemplateCardProps {
  template: ThermalTemplate;
  dimension: LabelDimension;
  paperStyle: ThermalPaperStyle;
  isFavorite: boolean;
  isSelected?: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (template: ThermalTemplate) => void;
  onQuickPrint: (template: ThermalTemplate) => void;
  onToggleSelect?: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  dimension,
  paperStyle,
  isFavorite,
  isSelected,
  onToggleFavorite,
  onSelect,
  onQuickPrint,
  onToggleSelect
}) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [cardWidthPx, setCardWidthPx] = useState<number>(180);
  const [internalSelected, setInternalSelected] = useState<boolean>(false);

  const activeSelected = isSelected !== undefined ? isSelected : internalSelected;

  useLayoutEffect(() => {
    if (!cardContainerRef.current) return;
    const updateWidth = () => {
      if (cardContainerRef.current) {
        const w = cardContainerRef.current.clientWidth;
        if (w > 50) {
          setCardWidthPx(w);
        }
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(cardContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // Kart seçildiğinde yumuşak animasyonla ekranın üst kısmına kaydır ve odakla
  useEffect(() => {
    if (activeSelected && cardContainerRef.current) {
      const el = cardContainerRef.current;
      const timer = setTimeout(() => {
        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [activeSelected]);

  const handleCardClick = () => {
    if (onToggleSelect) {
      onToggleSelect(template.id);
    } else {
      setInternalSelected(prev => !prev);
    }
  };

  // Use natural template dimension or selected dimension
  const targetWidthMm = template.recommendedWidthMm || dimension.widthMm || 57;
  const targetHeightMm = template.heightMm;

  // Canonical base width (dots)
  const canonicalWidth =
    targetWidthMm === 57
      ? 384
      : targetWidthMm === 80
      ? 576
      : targetWidthMm >= 100
      ? 800
      : Math.round((targetWidthMm / 57) * 384);

  // Exact scale so the rendered thermal template fills 100% of card width with zero horizontal side gaps
  const calculatedScale = cardWidthPx / canonicalWidth;

  return (
    <div
      ref={cardContainerRef}
      onClick={handleCardClick}
      className={`group relative transition-all duration-300 ease-out cursor-pointer w-full flex flex-col justify-between overflow-hidden scroll-mt-16 sm:scroll-mt-20 ${
        activeSelected
          ? 'col-span-full border-2 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-[1.005] z-20 bg-white dark:bg-slate-900 rounded-2xl'
          : 'col-span-1 shadow-2xs hover:shadow-md active:scale-[0.99] rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
      }`}
    >
      {/* Label Canvas Stage - Pure Direct Visual Preview */}
      <div className="w-full flex items-center justify-center relative overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 min-h-[70px] transition-all duration-300">
        <ThermalTemplateRenderer
          template={template}
          data={template.defaultData}
          widthMm={targetWidthMm}
          heightMm={targetHeightMm}
          paperStyle={paperStyle}
          scale={calculatedScale}
        />

        {/* Favorite indicator badge (Top Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(template.id);
          }}
          className={`absolute top-1.5 right-1.5 z-30 w-6 h-6 rounded-md flex items-center justify-center backdrop-blur-md transition-all active:scale-125 shadow-md cursor-pointer ${
            isFavorite
              ? 'bg-rose-500 text-white border border-rose-300/60 dark:border-rose-400/40 shadow-rose-500/50 scale-105'
              : 'bg-black/40 dark:bg-slate-900/80 hover:bg-rose-500 text-white border border-white/20 dark:border-slate-700/60'
          }`}
          title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
          <Heart size={12} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'text-white' : ''} />
        </button>
      </div>

      {/* Selected Minimalist Action Footer - Only shown when tapped/selected */}
      {activeSelected && (
        <div className="w-full p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2.5 shrink-0 animate-in fade-in slide-in-from-top-2 duration-250">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-1">
              {template.title}
            </h3>
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60 shrink-0">
              {template.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5 w-full">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(template);
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <Edit3 size={14} />
              <span>Düzenle</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickPrint(template);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title="Hızlı Yazdır"
            >
              <Printer size={14} />
              <span>Yazdır</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
