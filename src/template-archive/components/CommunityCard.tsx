import React, { useRef, useState, useLayoutEffect } from 'react';
import { CommunityTemplate, LabelDimension, ThermalPaperStyle } from '../types';
import { ThermalTemplateRenderer } from './ThermalTemplateRenderer';
import { Heart } from 'lucide-react';

interface CommunityCardProps {
  item: CommunityTemplate;
  dimension: LabelDimension;
  paperStyle?: ThermalPaperStyle;
  isLiked?: boolean;
  onToggleLike?: (id: string, e: React.MouseEvent) => void;
  onSelect: (item: CommunityTemplate) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  item,
  dimension,
  paperStyle = 'standard',
  isLiked = false,
  onToggleLike,
  onSelect
}) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [cardWidthPx, setCardWidthPx] = useState<number>(180);

  const tpl = item.template;
  const currentPaperStyle = item.paperStyle || paperStyle;
  const targetWidthMm = tpl.recommendedWidthMm || dimension.widthMm || 57;
  const targetHeightMm = tpl.heightMm || dimension.heightMm;

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
      onClick={() => onSelect(item)}
      className="group relative break-inside-avoid mb-3 sm:mb-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs hover:shadow-md active:scale-[0.99] transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Pure Direct Minimalist Thermal Preview */}
      <div className="w-full relative flex items-center justify-center p-0 overflow-hidden min-h-[70px]">
        <ThermalTemplateRenderer
          template={tpl}
          data={tpl.defaultData}
          widthMm={targetWidthMm}
          heightMm={targetHeightMm}
          paperStyle={currentPaperStyle}
          scale={calculatedScale}
        />

        {/* Minimal Subtle Like Heart in Top-Right Corner */}
        {onToggleLike && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(item.id, e);
            }}
            className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-md flex items-center justify-center backdrop-blur-md transition-all active:scale-125 z-20 shadow-md ${
              isLiked
                ? 'bg-rose-500 text-white border border-white/60 shadow-rose-500/50 scale-105'
                : 'bg-black/40 hover:bg-rose-500 text-white border border-white/20'
            }`}
            title="Beğen"
          >
            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-white' : ''} />
          </button>
        )}
      </div>
    </div>
  );
};
