/**
 * ResolvedBlock[] → canvas çizici (SPEC-01 §5).
 * Metin satırlarını sarar, barkod/QR bloklarını bwip-js ile akış içinde basar.
 */
import bwipjs from 'bwip-js';
import type { ResolvedBlock } from './template-variables';

export interface BlockRenderOptions {
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  padding?: number;
  /** barkod/qr bloklarının yükseklik çarpanı */
  codeHeightPx?: number;
  barcodeLayout?: 'horizontal' | 'vertical' | 'vertical-side' | 'auto';
}

interface Line {
  kind: 'line';
  text: string;
}
interface Code {
  kind: 'code';
  symbology: string; // CODE128 | EAN13 | qrcode
  value: string;
}
type Item = Line | Code;

function flatten(blocks: ResolvedBlock[], maxWidth: number, ctx: CanvasRenderingContext2D): Item[] {
  const items: Item[] = [];
  for (const b of blocks) {
    if (b.kind === 'text') {
      // kelime sarma
      const words = b.value.split(' ');
      let current = '';
      for (const w of words) {
        const test = current ? current + ' ' + w : w;
        if (ctx.measureText(test).width > maxWidth && current) {
          items.push({ kind: 'line', text: current });
          current = w;
        } else {
          current = test;
        }
      }
      if (current || words.length === 0) items.push({ kind: 'line', text: current });
    } else {
      items.push({
        kind: 'code',
        symbology: b.kind === 'qr' ? 'qrcode' : (b.symbology ?? 'CODE128').toUpperCase(),
        value: b.value
      });
    }
  }
  return items;
}

/**
 * Blokları (0,0)'dan itibaren çizer; toplam yüksekliği döndürür.
 * ctx.font/fillStyle çağıran tarafından ayarlanmış olmalı.
 */
export function renderBlocks(
  ctx: CanvasRenderingContext2D,
  width: number,
  blocks: ResolvedBlock[],
  opts: BlockRenderOptions = {}
): number {
  // 384px (57mm) tabanlı ölçekleme: 800px (10x10/10x15) veya 1200px (15x10) için orantılı büyütme
  const scale = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.9)) : 1;
  const baseFontSize = opts.fontSize ?? 18;
  const fontSize = Math.round(baseFontSize * scale);
  const pad = Math.max(16, Math.round((opts.padding ?? 16) * scale));
  const lineHeight = Math.round(fontSize * 1.35);
  const codeH = Math.round((opts.codeHeightPx ?? Math.round(baseFontSize * 2.8)) * scale);
  const maxWidth = width - pad * 2;

  ctx.font = `${opts.bold ? 'bold ' : ''}${fontSize}px ${opts.fontFamily ?? 'sans-serif'}`;
  ctx.textBaseline = 'top';

  let y = pad;
  ctx.fillStyle = '#000000';

  for (const b of blocks) {
    if (b.kind === 'text') {
      const rawText = b.value;

      // Check for Section Header e.g., === KARGO === or ---
      if (rawText.startsWith('===') && rawText.endsWith('===')) {
        const titleText = rawText.replace(/=/g, '').trim();
        ctx.fillStyle = '#000000';
        ctx.fillRect(pad, y, maxWidth, lineHeight + 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(fontSize * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(titleText, width / 2, y + 3);
        ctx.fillStyle = '#000000';
        ctx.font = `${opts.bold ? 'bold ' : ''}${fontSize}px ${opts.fontFamily ?? 'sans-serif'}`;
        y += lineHeight + 8;
        continue;
      }

      // Check for Dotted Divider e.g. ---
      if (rawText.trim() === '---' || rawText.trim() === '----------------') {
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad, y + Math.round(lineHeight / 2));
        ctx.lineTo(width - pad, y + Math.round(lineHeight / 2));
        ctx.stroke();
        ctx.setLineDash([]);
        y += Math.round(lineHeight * 0.8);
        continue;
      }

      // Check for Key: Value format
      const colonIdx = rawText.indexOf(':');
      if (colonIdx > 0 && colonIdx < 20 && !rawText.startsWith('http')) {
        const key = rawText.slice(0, colonIdx).trim();
        const val = rawText.slice(colonIdx + 1).trim();

        ctx.font = `bold ${fontSize}px ${opts.fontFamily ?? 'sans-serif'}`;
        ctx.textAlign = 'left';
        const keyW = ctx.measureText(`${key}: `).width;

        // If key and value together fit on one line or if width is small, stack cleanly
        if (keyW > maxWidth * 0.45 || width <= 420) {
          ctx.fillText(`${key}:`, pad, y);
          y += lineHeight;
          ctx.font = `${fontSize}px ${opts.fontFamily ?? 'sans-serif'}`;
          
          const words = val.split(' ');
          let current = '';
          for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const test = current ? current + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && current) {
              ctx.fillText(current, pad + 8, y);
              y += lineHeight;
              current = w;
            } else {
              current = test;
            }
          }
          if (current) {
            ctx.fillText(current, pad + 8, y);
            y += lineHeight;
          }
          continue;
        }

        ctx.fillText(`${key}:`, pad, y);
        ctx.font = `${fontSize}px ${opts.fontFamily ?? 'sans-serif'}`;
        
        // Wrap value if too long
        const words = val.split(' ');
        let current = '';
        let startX = pad + keyW;

        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          const test = current ? current + ' ' + w : w;
          if (startX + ctx.measureText(test).width > width - pad && current) {
            ctx.fillText(current, startX, y);
            y += lineHeight;
            startX = pad + 12; // Indent subsequent wrapped lines
            current = w;
          } else {
            current = test;
          }
        }
        if (current) {
          ctx.fillText(current, startX, y);
          y += lineHeight;
        }
        continue;
      }

      // Standard multi-line text wrapping
      const words = rawText.split(' ');
      let current = '';
      for (const w of words) {
        const test = current ? current + ' ' + w : w;
        if (ctx.measureText(test).width > maxWidth && current) {
          ctx.textAlign = opts.align || 'left';
          const alignX = opts.align === 'center' ? width / 2 : opts.align === 'right' ? width - pad : pad;
          ctx.fillText(current, alignX, y);
          y += lineHeight;
          current = w;
        } else {
          current = test;
        }
      }
      if (current) {
        ctx.textAlign = opts.align || 'left';
        const alignX = opts.align === 'center' ? width / 2 : opts.align === 'right' ? width - pad : pad;
        ctx.fillText(current, alignX, y);
        y += lineHeight;
      }
    } else {
      // Barcode or QR
      try {
        const tmp = document.createElement('canvas');
        let symbology = b.kind === 'qr' ? 'qrcode' : (b.symbology ?? 'CODE128').toLowerCase();
        let safeValue = (b.value || '000000').trim();

        if (symbology === 'ean13') {
          const cleanDigits = safeValue.replace(/\D/g, '');
          if (cleanDigits.length >= 12) {
            safeValue = cleanDigits.slice(0, 13);
          } else {
            symbology = 'code128';
          }
        }

        const hMm = Math.max(8, Math.round(codeH / 4));

        try {
          bwipjs.toCanvas(tmp, {
            bcid: symbology,
            text: safeValue,
            scale: 3,
            height: hMm,
            includetext: symbology !== 'qrcode',
            textsize: 13,
            textxalign: 'center',
            textgaps: 1
          });
        } catch {
          bwipjs.toCanvas(tmp, {
            bcid: 'code128',
            text: safeValue,
            scale: 3,
            height: hMm,
            includetext: symbology !== 'qrcode',
            textsize: 13,
            textxalign: 'center',
            textgaps: 1
          });
        }

        const isRotated = (opts.barcodeLayout === 'vertical' || opts.barcodeLayout === 'vertical-side') && symbology !== 'qrcode';

        if (isRotated) {
          const maxH = Math.round(180 * scale);
          const scaleW = (maxWidth - 10) / tmp.height;
          const scaleH = maxH / tmp.width;
          const scaleFactor = Math.min(1.2, scaleW, scaleH);
          const dw = Math.round(tmp.width * scaleFactor);
          const dh = Math.round(tmp.height * scaleFactor);

          ctx.save();
          ctx.translate(width / 2, y + dw / 2);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(tmp, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
          y += dw + 12;
        } else {
          const scaleFactor = Math.min(1.1, (maxWidth - 10) / tmp.width);
          const dw = Math.round(tmp.width * scaleFactor);
          const dh = Math.round(tmp.height * scaleFactor);
          const dx = (width - dw) / 2;
          
          ctx.drawImage(tmp, dx, y, dw, dh);
          y += dh + 8;
        }
      } catch {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(b.value, width / 2, y);
        y += lineHeight;
      }
    }
  }

  return y + pad;
}

/**
 * TASARIMLI profesyonel düzen: üstte koyu başlık bandı (beyaz kalın yazı),
 * dış çerçeve, iç düzenli bloklar ve alt kapanış çizgisi.
 */
export function renderProDesigned(
  ctx: CanvasRenderingContext2D,
  width: number,
  title: string,
  blocks: import('./template-variables').ResolvedBlock[],
  opts: BlockRenderOptions = {}
): number {
  const scale = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.9)) : 1;
  const pad = Math.max(14, Math.round(14 * scale));
  const bandH = Math.round(34 * scale);
  const headerFontSize = Math.round(13 * scale);

  ctx.save();
  // Header Band
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, bandH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${headerFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title.toUpperCase().slice(0, 48), width / 2, pad + bandH / 2);
  ctx.restore();

  ctx.save();
  ctx.translate(0, pad + bandH);
  const bodyH = renderBlocks(ctx, width, blocks, { ...opts, fontSize: opts.fontSize ?? 17, padding: Math.max(14, Math.round(14 * scale)) });
  ctx.restore();

  const totalH = pad + bandH + bodyH + Math.round(12 * scale);

  // Outer Framed Box for Professional Thermal Sticker Appearance
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(2, Math.round(2 * scale));
  ctx.strokeRect(pad, pad, width - pad * 2, totalH - pad * 2);

  return totalH;
}
