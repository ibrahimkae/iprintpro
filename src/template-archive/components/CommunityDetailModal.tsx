import React, { useRef } from 'react';
import { CommunityTemplate, LabelDimension, ThermalPaperStyle } from '../types';
import { ThermalTemplateRenderer } from './ThermalTemplateRenderer';
import { Button } from '../../components/ui/button';
import { captureElementToDataUrl } from '../../utils/dom-capture';
import { 
  X, 
  Printer, 
  Edit3, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  Tag, 
  Calendar,
  Layers
} from 'lucide-react';

interface CommunityDetailModalProps {
  item: CommunityTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  dimension: LabelDimension;
  paperStyle?: ThermalPaperStyle;
  isLiked?: boolean;
  onToggleLike?: (id: string) => void;
  onOpenEditor?: (template: any) => void;
  onPreviewAndPrint: (dataUrl: string, title: string, widthMm?: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  dimension,
  paperStyle = 'standard',
  isLiked = false,
  onToggleLike,
  onOpenEditor,
  onPreviewAndPrint,
  isFavorite = false,
  onToggleFavorite
}) => {
  const printCaptureRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !item) return null;

  const tpl = item.template;
  const currentPaperStyle = item.paperStyle || paperStyle;
  const targetWidth = tpl.recommendedWidthMm || dimension.widthMm || 57;

  const handlePrintClick = async () => {
    if (printCaptureRef.current) {
      try {
        const dataUrl = await captureElementToDataUrl(printCaptureRef.current, {
          scale: 1,
          backgroundColor: currentPaperStyle === 'invert' ? '#050505' : '#ffffff'
        });
        onPreviewAndPrint(dataUrl, tpl.title, targetWidth);
        onClose();
      } catch (e) {
        console.error('Community print capture failed:', e);
      }
    }
  };

  const handleEditClick = () => {
    if (onOpenEditor) {
      onOpenEditor(tpl);
      onClose();
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/40">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
              {item.author.avatar || '👤'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {item.author.displayName}
                </span>
                {item.author.verified && (
                  <CheckCircle2 size={14} className="text-teal-500 fill-teal-500/20" />
                )}
                {item.author.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {item.author.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                @{item.author.username}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Thermal Preview Canvas Frame */}
          <div className="bg-slate-100/70 dark:bg-slate-950/80 rounded-2xl p-4 sm:p-6 flex items-center justify-center border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
            <div ref={printCaptureRef} className="shadow-md rounded-lg overflow-hidden bg-white">
              <ThermalTemplateRenderer
                template={tpl}
                data={tpl.defaultData}
                widthMm={targetWidth}
                heightMm={tpl.heightMm || dimension.heightMm}
                paperStyle={currentPaperStyle}
                scale={1}
              />
            </div>
          </div>

          {/* Title & Creator Caption */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                  {tpl.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <Calendar size={12} /> {formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Layers size={11} /> {targetWidth}mm Rulo
                  </span>
                </div>
              </div>

              {/* Like / Favorite Buttons */}
              <div className="flex items-center gap-2">
                {onToggleLike && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleLike(item.id)}
                    className={`rounded-xl h-8 px-2.5 gap-1.5 text-xs font-bold ${
                      isLiked
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-200 dark:border-rose-800'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{item.likesCount + (isLiked ? 1 : 0)}</span>
                  </Button>
                )}

                {onToggleFavorite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleFavorite(tpl.id)}
                    className={`rounded-xl h-8 px-2.5 text-xs font-bold ${
                      isFavorite
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-200 dark:border-amber-800'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Favorilerime Ekle"
                  >
                    <Sparkles size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                  </Button>
                )}
              </div>
            </div>

            {/* Creator Caption */}
            {item.caption && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed font-medium">
                "{item.caption}"
              </p>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <Tag size={10} /> #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleEditClick}
            className="flex-1 rounded-xl h-10 font-bold text-xs gap-1.5 border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Edit3 size={14} />
            <span>Özelleştir & Düzenle</span>
          </Button>

          <Button
            type="button"
            onClick={handlePrintClick}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 font-bold text-xs gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <Printer size={15} />
            <span>Yazdır & Önizle</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
