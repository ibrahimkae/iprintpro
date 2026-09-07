import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePageRanges(rangeStr: string, maxPages: number): number[] {
  if (
    !rangeStr ||
    !rangeStr.trim() ||
    rangeStr.trim().toLowerCase() === 'hepsi' ||
    rangeStr.trim().toLowerCase() === 'all' ||
    rangeStr.trim() === '*'
  ) {
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }
  const pages: number[] = [];
  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const subParts = trimmed.split('-');
      const start = parseInt(subParts[0]?.trim() || '1');
      const end = parseInt(subParts[1]?.trim() || String(maxPages));
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let i = min; i <= max; i++) {
          if (i >= 1 && i <= maxPages && !pages.includes(i)) {
            pages.push(i);
          }
        }
      }
    } else {
      const num = parseInt(trimmed);
      if (!isNaN(num) && num >= 1 && num <= maxPages && !pages.includes(num)) {
        pages.push(num);
      }
    }
  }
  return pages.length > 0 ? pages : [1];
}
