import React from 'react';
import { calculateLabelDimensions } from '../lib/dimension-utils';

interface RulerDimensionBadgeProps {
  widthPx: number;
  heightPx: number;
  label?: string;
  className?: string;
  compact?: boolean;
  hideRollLabel?: boolean;
}

export const RulerDimensionBadge: React.FC<RulerDimensionBadgeProps> = ({
  widthPx,
  heightPx,
  label = 'Ölçü',
  className = '',
  compact = false,
  hideRollLabel = false
}) => {
  const dim = calculateLabelDimensions(widthPx, heightPx);
  const widthCmVal = (widthPx / 80).toFixed(1).replace(/\.0$/, '');
  const heightCmVal = (heightPx / 80).toFixed(1).replace(/\.0$/, '');

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}>
        <span className="font-bold text-teal-700 dark:text-teal-400">{label}: {widthCmVal} cm × {heightCmVal} cm</span>
      </div>
    );
  }

  return (
    <div className={`w-full bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center justify-between font-mono border border-slate-200 dark:border-slate-700/80 shadow-2xs select-none ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">{label}:</span>
        <span className="font-bold text-teal-700 dark:text-teal-300 text-[11px]">
          {widthCmVal} cm × {heightCmVal} cm
        </span>
      </div>
      {!hideRollLabel && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans">
          <span>{dim.rollLabel}</span>
        </div>
      )}
    </div>
  );
};

export default RulerDimensionBadge;
