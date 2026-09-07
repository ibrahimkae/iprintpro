/**
 * Etiket Ölçü & Boyut Yardımcısı (DPI & MM Dönüştürücü)
 * 203 DPI Standart Termal Yazıcı Çözünürlüğü (8 piksel = 1 mm)
 */

export interface LabelDimensionInfo {
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  paperRollMm: number;
  rollLabel: string;
  widthCm: string;
  heightCm: string;
  formattedMm: string;  // Örn: "57 mm Rulo (48 mm Baskı) × 43 mm"
  formattedCm: string;  // Örn: "10 × 15 cm"
  formattedPx: string;  // Örn: "384 × 345 px"
  fullBadge: string;    // Örn: "📐 57mm Rulo (48×43mm) — 384×345px"
  dimensionText: string;
}

export function calculateLabelDimensions(widthPx: number, heightPx: number): LabelDimensionInfo {
  const wPx = Math.max(1, Math.round(widthPx || 800));
  const hPx = Math.max(1, Math.round(heightPx || 1200));

  // 8 px/mm scaling (203 dpi)
  const widthMm = Math.round(wPx / 8);
  const heightMm = Math.round(hPx / 8);

  const paperRollMm = wPx <= 400 ? 57 : wPx <= 600 ? 80 : wPx <= 900 ? 100 : 150;
  const rollLabel = wPx <= 400 ? '57 mm Mini Termal' : wPx <= 600 ? '80 mm POS Termal' : wPx <= 900 ? '10x15 cm Zebra' : '15x10 cm Zebra';

  const wCmVal = (widthMm / 10);
  const hCmVal = (heightMm / 10);

  const widthCm = wCmVal % 1 === 0 ? wCmVal.toString() : wCmVal.toFixed(1).replace('.', ',');
  const heightCm = hCmVal % 1 === 0 ? hCmVal.toString() : hCmVal.toFixed(1).replace('.', ',');

  const formattedMm = wPx <= 400 
    ? `57mm Rulo (48mm Baskı) × ${heightMm}mm` 
    : wPx <= 600 
    ? `80mm Rulo (72mm Baskı) × ${heightMm}mm`
    : `${widthMm} × ${heightMm} mm`;

  const formattedCm = `${widthCm} × ${heightCm} cm`;
  const formattedPx = `${wPx} × ${hPx} px`;

  return {
    widthPx: wPx,
    heightPx: hPx,
    widthMm,
    heightMm,
    paperRollMm,
    rollLabel,
    widthCm,
    heightCm,
    formattedMm,
    formattedCm,
    formattedPx,
    fullBadge: `📐 ${rollLabel}: ${widthMm}×${heightMm}mm (${widthCm}×${heightCm}cm) — ${wPx}×${hPx}px`,
    dimensionText: wPx <= 400 
      ? `📐 57mm Rulo (48mm Baskı) × ${heightMm}mm (${heightCm}cm)` 
      : wPx <= 600 
      ? `📐 80mm Rulo (72mm Baskı) × ${heightMm}mm (${heightCm}cm)`
      : `📐 G: ${widthMm}mm (${widthCm}cm) × Y: ${heightMm}mm (${heightCm}cm)`
  };
}
