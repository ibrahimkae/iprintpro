import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export interface BarcodeRendererProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'CODE39' | 'UPC' | 'ITF';
  width?: number;
  height?: number;
  widthMm?: number;
  displayValue?: boolean;
  fontSize?: number;
  font?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'bottom' | 'top';
  lineColor?: string;
  background?: string;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width,
  height,
  widthMm,
  displayValue = true,
  fontSize,
  font = 'JetBrains Mono, monospace, system-ui',
  textAlign = 'center',
  textPosition = 'bottom',
  lineColor = '#000000',
  background = 'transparent',
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Determine smart adaptive dimensions if not explicitly set
  // 57mm mini rolls: bar width 1.3 - 1.5, height 36 - 50px
  // 80mm POS & tags: bar width 1.6 - 1.8, height 48 - 62px
  // 100mm / 10x15 cm: bar width 2.0 - 2.4, height 64 - 86px
  const isCompact = widthMm ? widthMm <= 57 : false;
  const isLarge = widthMm ? widthMm >= 100 : false;

  const effectiveWidth = width !== undefined
    ? width
    : isCompact
    ? 1.4
    : isLarge
    ? 2.1
    : 1.65;

  const effectiveHeight = height !== undefined
    ? Math.max(isCompact ? 28 : isLarge ? 48 : 36, height)
    : isCompact
    ? 40
    : isLarge
    ? 68
    : 50;

  const effectiveFontSize = fontSize !== undefined
    ? fontSize
    : isCompact
    ? 11
    : isLarge
    ? 14
    : 12;

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      // Clean value according to format if needed
      let safeValue = value || '00000000';
      if (format === 'EAN13') {
        safeValue = safeValue.replace(/\D/g, '').slice(0, 13).padEnd(12, '0');
      }

      JsBarcode(svgRef.current, safeValue, {
        format: format,
        width: Math.max(1, effectiveWidth),
        height: Math.max(18, effectiveHeight),
        displayValue: displayValue,
        text: value,
        font: font,
        textAlign: textAlign,
        textPosition: textPosition,
        fontSize: effectiveFontSize,
        background: background,
        lineColor: lineColor,
        marginTop: isLarge ? 8 : 5,
        marginBottom: isLarge ? 6 : 4,
        marginLeft: 4,
        marginRight: 4,
        valid: () => true
      });
    } catch (err) {
      console.warn('JsBarcode render error with format', format, 'fallback to CODE128', err);
      try {
        if (svgRef.current) {
          JsBarcode(svgRef.current, value || 'CODE-128', {
            format: 'CODE128',
            width: Math.max(1, effectiveWidth),
            height: Math.max(18, effectiveHeight),
            displayValue: displayValue,
            fontSize: effectiveFontSize,
            background: background,
            lineColor: lineColor,
            marginTop: isLarge ? 8 : 5,
            marginBottom: isLarge ? 6 : 4,
            marginLeft: 4,
            marginRight: 4
          });
        }
      } catch (fallbackErr) {
        console.error('Barcode complete fallback failure:', fallbackErr);
      }
    }
  }, [value, format, effectiveWidth, effectiveHeight, displayValue, effectiveFontSize, font, textAlign, textPosition, lineColor, background, isLarge]);

  return (
    <div className={`flex flex-col items-center justify-center max-w-full overflow-visible py-0.5 ${className}`}>
      <svg ref={svgRef} className="max-w-full h-auto block overflow-visible" style={{ shapeRendering: 'crispEdges' }} />
    </div>
  );
};
