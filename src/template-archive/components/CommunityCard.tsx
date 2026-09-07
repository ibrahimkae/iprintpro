import React from 'react';
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
  const tpl = item.template;
  const currentPaperStyle = item.paperStyle || paperStyle;
  const targetWidth = tpl.recommendedWidthMm || dimension.widthMm || 57;

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative break-inside-avoid mb-3 sm:mb-4 bg-transparent overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col rounded-none"
    >
      {/* Pure Direct Minimalist Thermal Preview */}
      <div className="w-full relative flex items-center justify-center p-0 overflow-hidden">
        <div className="transform transition-transform duration-300 group-hover:scale-[1.01] w-full flex justify-center">
          <ThermalTemplateRenderer
            template={tpl}
            data={tpl.defaultData}
            widthMm={targetWidth}
            heightMm={tpl.heightMm || dimension.heightMm}
            paperStyle={currentPaperStyle}
            scale={0.9}
          />
        </div>

        {/* Minimal Subtle Like Heart in Top-Right Corner */}
        {onToggleLike && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(item.id, e);
            }}
            className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-md flex items-center justify-center backdrop-blur-md transition-all z-10 ${
              isLiked
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-black/40 text-white hover:bg-rose-500 opacity-80 group-hover:opacity-100'
            }`}
            title="Beğen"
          >
            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
};
