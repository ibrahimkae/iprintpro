export function v(values: Record<string, string> | undefined, key: string, fallback: string): string {
  if (values && key in values && values[key] !== undefined) {
    return values[key];
  }
  return fallback;
}

import bwipjs from 'bwip-js';
import { logger } from './logger';

export interface ProRenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  canvas: HTMLCanvasElement;
  values: Record<string, string>;
  orientation?: 'portrait' | 'landscape';
  barcodeLayout?: 'horizontal' | 'vertical' | 'vertical-side' | 'auto';
  paperPreset?: string;
  targetHeight?: number;
}

// ==========================================
// YARDIMCI ÇİZİM FONKSİYONLARI (TERMAL OPTİMİZE)
// ==========================================

export function drawFrame(ctx: CanvasRenderingContext2D, pad: number, totalH: number, w: number, lineWidth = 2) {
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(pad, pad, w - pad * 2, totalH - pad * 2);
}

export function drawDashedLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, dash = [4, 4]) {
  ctx.lineWidth = 1;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawBarcodeToCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  symbology: string,
  centerX: number,
  y: number,
  maxW: number,
  hMm = 10,
  includeText = true,
  rotation: 0 | 90 | 270 = 0,
  maxH?: number,
  barcodeLayout?: string
): number {
  try {
    const tmp = document.createElement('canvas');
    let safeText = (text || '000000').trim();
    let sym = symbology ? symbology.toLowerCase() : 'code128';
    if (sym === 'qrcode') {
      sym = 'qrcode';
    } else if (sym === 'ean13') {
      const cleanDigits = safeText.replace(/\D/g, '');
      if (cleanDigits.length >= 12) {
        safeText = cleanDigits.slice(0, 13);
      } else {
        sym = 'code128';
      }
    }

    try {
      bwipjs.toCanvas(tmp, {
        bcid: sym,
        text: safeText,
        scale: 3,
        height: hMm,
        includetext: includeText && sym !== 'qrcode',
        textsize: 13,
        textxalign: 'center',
        textgaps: 1
      });
    } catch {
      // Fallback to Code 128 if specific symbology/format failed
      bwipjs.toCanvas(tmp, {
        bcid: 'code128',
        text: safeText,
        scale: 3,
        height: hMm,
        includetext: includeText,
        textsize: 13,
        textxalign: 'center',
        textgaps: 1
      });
    }

    const effectiveRotation = (rotation === 0 && (barcodeLayout === 'vertical' || barcodeLayout === 'vertical-side')) ? 90 : rotation;

    if (effectiveRotation === 90 || effectiveRotation === 270) {
      // Dikey Barkod (90° veya 270°)
      const scaleW = maxW / tmp.height;
      const scaleH = maxH ? maxH / tmp.width : 1;
      const scale = Math.min(1.2, scaleW, scaleH);

      const dw = Math.round(tmp.width * scale);
      const dh = Math.round(tmp.height * scale);

      ctx.save();
      ctx.translate(centerX, y + dw / 2);
      ctx.rotate(effectiveRotation === 90 ? Math.PI / 2 : -Math.PI / 2);
      ctx.drawImage(tmp, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
      return dw;
    } else {
      // Standart Yatay Barkod (0°)
      const scaleW = maxW / tmp.width;
      const scaleH = maxH ? maxH / tmp.height : 1;
      const scale = Math.min(1.1, scaleW, scaleH);

      const dw = Math.round(tmp.width * scale);
      const dh = Math.round(tmp.height * scale);
      const dx = Math.round(centerX - dw / 2);
      ctx.drawImage(tmp, dx, y, dw, dh);
      return dh;
    }
  } catch (e) {
    logger.warn('Barcode render fallback', e);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, centerX, y + 14);
    return 20;
  }
}

export function drawQRCodeToCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  size: number
): number {
  try {
    const tmp = document.createElement('canvas');
    bwipjs.toCanvas(tmp, {
      bcid: 'qrcode',
      text: text || 'https://iprint.pro',
      scale: 4,
      paddingwidth: 1,
      paddingheight: 1
    });
    const dx = Math.round(centerX - size / 2);
    ctx.drawImage(tmp, dx, y, size, size);
    return size;
  } catch (e) {
    logger.warn('QR render error', e);
    return size;
  }
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: 'left' | 'center' | 'right' = 'left'
): number {
  if (!text) return y;
  const paragraphs = String(text).split('\n');
  let curY = y;
  ctx.textAlign = align;

  for (const para of paragraphs) {
    const words = para.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      let word = words[n];
      if (!word) continue;

      if (ctx.measureText(word).width > maxWidth) {
        if (line.trim()) {
          ctx.fillText(line.trim(), x, curY);
          curY += lineHeight;
          line = '';
        }
        let chunk = '';
        for (const char of word) {
          if (ctx.measureText(chunk + char).width > maxWidth) {
            ctx.fillText(chunk, x, curY);
            curY += lineHeight;
            chunk = char;
          } else {
            chunk += char;
          }
        }
        word = chunk;
      }

      const testLine = line + word + ' ';
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && line.trim().length > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = word + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), x, curY);
      curY += lineHeight;
    }
  }
  return curY;
}

/** Küçük tatlı pati sembolü çizer */
function drawPawIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size = 16) {
  ctx.fillStyle = '#000000';
  // Ana ped
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.2, size * 0.45, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // 4 parmak
  const toes = [
    { dx: -size * 0.35, dy: -size * 0.25, r: size * 0.15 },
    { dx: -size * 0.12, dy: -size * 0.4, r: size * 0.16 },
    { dx: size * 0.12, dy: -size * 0.4, r: size * 0.16 },
    { dx: size * 0.35, dy: -size * 0.25, r: size * 0.15 }
  ];
  toes.forEach(t => {
    ctx.beginPath();
    ctx.arc(cx + t.dx, cy + t.dy, t.r, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Su damlası ikonu çizer */
function drawWaterDrop(ctx: CanvasRenderingContext2D, cx: number, cy: number, size = 14) {
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.6);
  ctx.bezierCurveTo(cx - size * 0.5, cy, cx - size * 0.5, cy + size * 0.5, cx, cy + size * 0.5);
  ctx.bezierCurveTo(cx + size * 0.5, cy + size * 0.5, cx + size * 0.5, cy, cx, cy - size * 0.6);
  ctx.fill();
}

/** Bardak piktogramı çizer */
function drawCupBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, num: number) {
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  // Bardak şekli (üstü hafif geniş, altı dar)
  ctx.beginPath();
  ctx.moveTo(x + 4, y);
  ctx.lineTo(x + w - 4, y);
  ctx.lineTo(x + w - 8, y + h);
  ctx.lineTo(x + 8, y + h);
  ctx.closePath();
  ctx.stroke();

  // Bardak içi boşluk / su çizgisi ve numara
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${num}`, x + w / 2, y + h * 0.65);
}

/** Tırtıklı / kupon bilet kenar çentikleri çizer */
function drawTicketNotches(ctx: CanvasRenderingContext2D, y: number, w: number, radius = 10) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;

  // Sol çentik
  ctx.beginPath();
  ctx.arc(0, y, radius, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.stroke();

  // Sağ çentik
  ctx.beginPath();
  ctx.arc(w, y, radius, Math.PI / 2, -Math.PI / 2);
  ctx.fill();
  ctx.stroke();

  // Kesikli çizgi
  drawDashedLine(ctx, radius + 4, y, w - radius - 4, y, [4, 4]);
}

// ==========================================
// 1. LOJİSTİK & KARGO ŞABLONLARI
// ==========================================

export function renderProKargoGonderi({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.max(10, Math.round(12 * s));
  const alici = v(values, 'Alici', 'Ayşe Yılmaz');
  const tel = v(values, 'Telefon', '0532 111 22 33');
  const adres = v(values, 'Adres', 'Bağdat Cad. No:112 D:5 Kadıköy / İstanbul');
  const takip = v(values, 'Takip_No', 'TRK-9908123');
  const barkod = v(values, 'Barkod', '8690123456789');

  const drawContent = (targetH: number): number => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, targetH);

    drawFrame(ctx, pad, targetH, width, Math.max(2, Math.round(2 * s)));

    // Başlık banner (Ters Kontrast Siyah Zemin)
    const headerH = Math.round(36 * s);
    ctx.fillStyle = '#000000';
    ctx.fillRect(pad + Math.round(2 * s), pad + Math.round(2 * s), width - pad * 2 - Math.round(4 * s), headerH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🚚 HIZLI KARGO & TESLİMAT', width / 2, pad + Math.round(24 * s));

    // Alıcı Bilgi Alanı
    let y = pad + headerH + Math.round(18 * s);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('ALICI BİLGİLERİ:', pad + Math.round(8 * s), y);

    y += Math.round(20 * s);
    ctx.font = `bold ${Math.round(16 * s)}px sans-serif`;
    ctx.fillText(alici, pad + Math.round(8 * s), y);

    y += Math.round(18 * s);
    ctx.font = `${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(`Tel: ${tel}`, pad + Math.round(8 * s), y);

    y += Math.round(18 * s);
    ctx.font = `${Math.round(11.5 * s)}px sans-serif`;
    y = wrapText(ctx, adres, pad + Math.round(8 * s), y, width - pad * 2 - Math.round(16 * s), Math.round(16 * s));

    y += Math.round(10 * s);
    drawDashedLine(ctx, pad + Math.round(4 * s), y, width - pad - Math.round(4 * s), y);

    // Takip & Barkod
    y += Math.round(18 * s);
    ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`TAKİP NO: ${takip}`, width / 2, y);

    y += Math.round(10 * s);
    const bH = drawBarcodeToCanvas(ctx, barkod, 'code128', width / 2, y, width - pad * 2 - Math.round(30 * s), Math.round(14 * s), true);
    y += (bH || Math.round(48 * s)) + Math.round(18 * s);

    // Alt Teslim Alanı
    drawDashedLine(ctx, pad + Math.round(4 * s), y, width - pad - Math.round(4 * s), y);
    y += Math.round(18 * s);
    ctx.font = `${Math.round(10 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Teslim Alan: ..............................', pad + Math.round(8 * s), y);
    ctx.textAlign = 'right';
    ctx.fillText('İmza: ............', width - pad - Math.round(8 * s), y);

    return y + Math.round(14 * s) + pad;
  };

  canvas.height = 1400;
  const calculatedHeight = drawContent(1400);
  const finalH = Math.max(Math.round(345 * s), calculatedHeight);
  canvas.height = finalH;
  drawContent(finalH);
}

export function renderProIadeEtiket({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.max(10, Math.round(12 * s));
  const siparis = v(values, 'Siparis_No', 'TY-900451');
  const musteri = v(values, 'Musteri_Adi', 'Ayşe Yılmaz');
  const sebep = v(values, 'Sebep', 'Beden uymadı');
  const iadeKodu = v(values, 'Iade_Kodu', 'IADE-99312');
  const depo = v(values, 'Depo_Adi', 'Merkez Ana Depo');

  const drawContent = (targetH: number): number => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, targetH);

    drawFrame(ctx, pad, targetH, width, Math.max(2, Math.round(2 * s)));

    // Başlık (İADE)
    const headerH = Math.round(36 * s);
    ctx.fillStyle = '#000000';
    ctx.fillRect(pad + Math.round(2 * s), pad + Math.round(2 * s), width - pad * 2 - Math.round(4 * s), headerH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('↩ E-TİCARET İADE ETİKETİ', width / 2, pad + Math.round(24 * s));

    let y = pad + headerH + Math.round(18 * s);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';

    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('SİPARİŞ NO:', pad + Math.round(8 * s), y);
    ctx.font = `bold ${Math.round(13 * s)}px monospace`;
    ctx.fillText(siparis, pad + Math.round(100 * s), y);

    y += Math.round(22 * s);
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('MÜŞTERİ:', pad + Math.round(8 * s), y);
    ctx.font = `${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(musteri, pad + Math.round(100 * s), y);

    y += Math.round(22 * s);
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('İADE SEBEBİ:', pad + Math.round(8 * s), y);
    ctx.font = `${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(sebep, pad + Math.round(100 * s), y);

    y += Math.round(22 * s);
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('HEDEF DEPO:', pad + Math.round(8 * s), y);
    ctx.font = `${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(depo, pad + Math.round(100 * s), y);

    y += Math.round(16 * s);
    drawDashedLine(ctx, pad + Math.round(4 * s), y, width - pad - Math.round(4 * s), y);

    y += Math.round(20 * s);
    ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`İADE KODU: ${iadeKodu}`, width / 2, y);

    y += Math.round(10 * s);
    const iadeBarcodeH = drawBarcodeToCanvas(ctx, iadeKodu, 'code128', width / 2, y, width - pad * 2 - Math.round(30 * s), Math.round(14 * s), true);

    y += (iadeBarcodeH || Math.round(50 * s)) + Math.round(18 * s);
    ctx.font = `italic ${Math.round(9.5 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('* Lütfen bu etiketi koli/paket üzerine yapıştırınız *', width / 2, y);

    return y + Math.round(14 * s) + pad;
  };

  canvas.height = 1400;
  const calculatedHeight = drawContent(1400);
  const finalH = Math.max(Math.round(345 * s), calculatedHeight);
  canvas.height = finalH;
  drawContent(finalH);
}

export function renderProPaletNakliye({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.max(10, Math.round(12 * s));
  const palet = v(values, 'Palet_No', 'PLT-4410');
  const gonderen = v(values, 'Gonderen', 'Ankara Lojistik Merkezi');
  const alici = v(values, 'Alici', 'İstanbul Kadıköy Şube');
  const koli = v(values, 'Koli_Sayisi', '18');
  const desi = v(values, 'Desi', '420');

  const drawContent = (targetH: number): number => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, targetH);

    drawFrame(ctx, pad, targetH, width, Math.max(2, Math.round(2.5 * s)));

    // Başlık
    const headerH = Math.round(34 * s);
    ctx.fillStyle = '#000000';
    ctx.fillRect(pad + Math.round(2 * s), pad + Math.round(2 * s), width - pad * 2 - Math.round(4 * s), headerH);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SEVKİYAT / PALET ETİKETİ', width / 2, pad + Math.round(24 * s));

    // Dev Palet No
    let y = pad + headerH + Math.round(16 * s);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('PALET NUMARASI', width / 2, y);

    y += Math.round(32 * s);
    ctx.font = `bold ${Math.round(28 * s)}px monospace`;
    ctx.fillText(palet, width / 2, y);

    y += Math.round(14 * s);
    const tblX = pad + Math.round(6 * s);
    const tblW = width - tblX * 2;
    const tableTop = y;

    // Gönderen / Alıcı Tablosu
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('GÖNDEREN:', tblX + Math.round(8 * s), y + Math.round(18 * s));
    ctx.font = `${Math.round(12 * s)}px sans-serif`;
    y = wrapText(ctx, gonderen, tblX + Math.round(8 * s), y + Math.round(34 * s), tblW - Math.round(16 * s), Math.round(16 * s));

    y += Math.round(8 * s);
    ctx.beginPath();
    ctx.moveTo(tblX, y);
    ctx.lineTo(tblX + tblW, y);
    ctx.stroke();

    y += Math.round(16 * s);
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('ALICI:', tblX + Math.round(8 * s), y);
    ctx.font = `${Math.round(12 * s)}px sans-serif`;
    y = wrapText(ctx, alici, tblX + Math.round(8 * s), y + Math.round(16 * s), tblW - Math.round(16 * s), Math.round(16 * s));

    const tableBottom = y + Math.round(10 * s);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
    ctx.strokeRect(tblX, tableTop, tblW, tableBottom - tableTop);

    // Koli & Desi Kutucukları
    y = tableBottom + Math.round(14 * s);
    const boxW = (tblW - Math.round(10 * s)) / 2;
    const boxH = Math.round(48 * s);

    ctx.strokeRect(tblX, y, boxW, boxH);
    ctx.strokeRect(tblX + boxW + Math.round(10 * s), y, boxW, boxH);

    ctx.textAlign = 'center';
    ctx.font = `${Math.round(10 * s)}px sans-serif`;
    ctx.fillText('KOLİ ADEDİ', tblX + boxW / 2, y + Math.round(16 * s));
    ctx.font = `bold ${Math.round(17 * s)}px sans-serif`;
    ctx.fillText(`${koli} Koli`, tblX + boxW / 2, y + Math.round(38 * s));

    ctx.font = `${Math.round(10 * s)}px sans-serif`;
    ctx.fillText('TOPLAM DESİ', tblX + boxW + Math.round(10 * s) + boxW / 2, y + Math.round(16 * s));
    ctx.font = `bold ${Math.round(17 * s)}px sans-serif`;
    ctx.fillText(`${desi} Desi`, tblX + boxW + Math.round(10 * s) + boxW / 2, y + Math.round(38 * s));

    y += boxH + Math.round(18 * s);

    // Barkod (Altta geniş ve güvenli marjinle)
    const bH = drawBarcodeToCanvas(ctx, palet, 'code128', width / 2, y, width - pad * 2 - Math.round(30 * s), Math.round(14 * s), true);
    y += (bH || Math.round(48 * s)) + Math.round(20 * s);

    return y + pad;
  };

  // İki Aşamalı Ölçüm ve Kusursuz Baskı Boyutu
  canvas.height = 1400;
  const calculatedHeight = drawContent(1400);
  const finalH = Math.max(Math.round(390 * s), calculatedHeight);
  canvas.height = finalH;
  drawContent(finalH);
}

// ==========================================
// 2. DEPO & STOK ŞABLONLARI
// ==========================================

export function renderProRafKonum({ ctx, width, canvas, values }: ProRenderContext) {
  const raf = v(values, 'Raf_Kodu', 'A-12-03');
  const bolum = v(values, 'Bolum', 'Ana Depo');
  const koridor = v(values, 'Koridor', 'Koridor 4');

  const totalH = 265;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  let y = 30;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${bolum.toUpperCase()}  •  ${koridor.toUpperCase()}`, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Büyük Raf Kutusu
  y += 18;
  ctx.fillRect(16, y, width - 32, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(raf, width / 2, y + 48);

  y += 85;
  ctx.fillStyle = '#000000';
  drawBarcodeToCanvas(ctx, raf, 'code128', width / 2, y, width - 40, 16, true);

  y += 75;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LOKASYON BARKODU', width / 2, y);
}

export function renderProPartiSkt({ ctx, width, canvas, values }: ProRenderContext) {
  const parti = v(values, 'Parti_No', 'LOT-2026-081');
  const uretim = v(values, 'Uretim', '2026-08-01');
  const skt = v(values, 'SKT', '2027-08-01');
  const op = v(values, 'Operator', 'M. Kaya');

  const totalH = 280;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ÜRETİM & PARTİ KİMLİĞİ', width / 2, 29);

  let y = 62;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PARTİ / LOT NO:', 16, y);
  ctx.font = 'bold 16px monospace';
  ctx.fillText(parti, 140, y);

  y += 26;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ÜRETİM TARİHİ:', 16, y);
  ctx.font = '14px sans-serif';
  ctx.fillText(uretim, 140, y);

  y += 26;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('SKT / TETT:', 16, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(skt, 140, y);

  y += 24;
  ctx.font = '12px sans-serif';
  ctx.fillText('OPERATÖR:', 16, y);
  ctx.fillText(op, 140, y);

  y += 16;
  drawDashedLine(ctx, 12, y, width - 12, y);

  y += 18;
  drawBarcodeToCanvas(ctx, parti, 'code128', width / 2, y, width - 40, 12, true);
}

export function renderProStokSayim({ ctx, width, canvas, values }: ProRenderContext) {
  const sira = v(values, 'Sira_No', '14');
  const barkod = v(values, 'Barkod', '8690123456789');
  const urun = v(values, 'Urun', 'Termal Kağıt Rulo 57mm');
  const raf = v(values, 'Raf', 'B-03-01');

  const totalH = 280;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`STOK SAYIM FİŞİ  #${sira}`, width / 2, 29);

  let y = 60;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÜRÜN ADI:', 16, y);
  y += 18;
  ctx.font = 'bold 15px sans-serif';
  y = wrapText(ctx, urun, 16, y, width - 32, 18);

  y += 10;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`LOKASYON: ${raf}`, 16, y);

  y += 16;
  drawDashedLine(ctx, 12, y, width - 12, y);

  y += 24;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('SAYILAN MİKTAR:', 16, y);
  ctx.strokeRect(150, y - 18, width - 166, 30);

  y += 30;
  drawBarcodeToCanvas(ctx, barkod, 'code128', width / 2, y, width - 40, 12, true);
}

export function renderProDepoTransfer({ ctx, width, canvas, values }: ProRenderContext) {
  const trf = v(values, 'Transfer_No', 'TRF-0078');
  const kaynak = v(values, 'Kaynak_Raf', 'A-01-02');
  const hedef = v(values, 'Hedef_Raf', 'D-09-01');
  const urun = v(values, 'Urun', 'LED Ampul E27');
  const adet = v(values, 'Adet', '24');

  const totalH = 290;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DEPO İÇİ TRANSFER ETİKETİ', width / 2, 29);

  let y = 60;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`TRANSFER NO: ${trf}`, width / 2, y);

  y += 20;
  // Kaynak -> Hedef Kutusu
  ctx.strokeRect(16, y, width - 32, 54);
  ctx.font = '11px sans-serif';
  ctx.fillText('ÇIKIŞ RAFI', (width - 32) / 4 + 16, y + 18);
  ctx.font = 'bold 16px monospace';
  ctx.fillText(kaynak, (width - 32) / 4 + 16, y + 42);

  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('➔', width / 2, y + 36);

  ctx.font = '11px sans-serif';
  ctx.fillText('HEDEF RAF', width - (width - 32) / 4 - 16, y + 18);
  ctx.font = 'bold 16px monospace';
  ctx.fillText(hedef, width - (width - 32) / 4 - 16, y + 42);

  y += 74;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÜRÜN:', 16, y);
  ctx.font = '14px sans-serif';
  ctx.fillText(urun, 70, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('MİKTAR:', 16, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${adet} Adet`, 70, y);

  y += 18;
  drawBarcodeToCanvas(ctx, trf, 'code128', width / 2, y, width - 40, 12, true);
}

// ==========================================
// 3. MAĞAZA & PERAKENDE ŞABLONLARI
// ==========================================

export function renderProAgirlikEtiket({ ctx, width, canvas, values }: ProRenderContext) {
  const urun = v(values, 'Urun', 'Antep Fıstığı');
  const miktar = v(values, 'Miktar', '1.5');
  const birim = v(values, 'Birim', 'KG');
  const birimFiyat = v(values, 'Birim_Fiyat', '480');
  const toplam = v(values, 'Toplam', '720');
  const lot = v(values, 'Lot', '8690123456789');

  const totalH = 310;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  let y = 32;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(urun.toUpperCase(), width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('AĞIRLIK / MİKTAR:', 16, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${miktar} ${birim}`, 150, y);

  y += 24;
  ctx.font = '13px sans-serif';
  ctx.fillText('BİRİM FİYAT:', 16, y);
  ctx.font = '14px sans-serif';
  ctx.fillText(`${birimFiyat} TL/${birim}`, 150, y);

  // TOPLAM TUTAR BÜYÜK KUTU
  y += 20;
  ctx.fillRect(16, y, width - 32, 54);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ÖDENECEK TUTAR:', 26, y + 33);
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${toplam} ₺`, width - 26, y + 36);

  y += 72;
  ctx.fillStyle = '#000000';
  drawBarcodeToCanvas(ctx, lot, 'ean13', width / 2, y, width - 40, 14, true);
}

export function renderProHediyeCeki({ ctx, width, canvas, values }: ProRenderContext) {
  const tutar = v(values, 'Tutar', '250');
  const kod = v(values, 'Kod', 'HEDIYE-2026');
  const sonTarih = v(values, 'Son_Tarih', '2026-12-31');
  const isletme = v(values, 'Isletme_Adi', 'Butik Ayşe');

  const totalH = 300;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Rozet
  let y = 30;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`★ ${isletme.toUpperCase()} ★`, width / 2, y);

  y += 24;
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('HEDİYE ÇEKİ', width / 2, y);

  y += 12;
  drawDashedLine(ctx, 20, y, width - 20, y);

  y += 40;
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(`${tutar} TL`, width / 2, y);

  y += 16;
  ctx.font = '11px sans-serif';
  ctx.fillText(`Son Geçerlilik: ${sonTarih}`, width / 2, y);

  y += 14;
  const hBarcodeH = drawBarcodeToCanvas(ctx, kod, 'code128', width / 2, y, width - 40, 12, true);

  y += (hBarcodeH || 50) + 16;
  ctx.font = 'italic 10px sans-serif';
  ctx.fillText('* Tek seferlik alışverişlerde geçerlidir *', width / 2, y);
}

export function renderProFisKdv({ ctx, width, canvas, values }: ProRenderContext) {
  const fisNo = v(values, 'Fis_No', 'FS-00241');
  const firma = v(values, 'Firma_Adi', 'iPrint Market');
  const tutar = v(values, 'Tutar', '847.46');
  const kdv = v(values, 'Kdv', '152.54');
  const genel = v(values, 'Genel_Toplam', '1000.00');

  const totalH = 340;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 1);

  let y = 30;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(firma.toUpperCase(), width / 2, y);

  y += 16;
  ctx.font = '11px monospace';
  ctx.fillText(`FİŞ NO: ${fisNo}`, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 12, y, width - 12, y);

  y += 24;
  ctx.font = '13px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ARA TOPLAM:', 16, y);
  ctx.textAlign = 'right';
  ctx.fillText(`${tutar} TL`, width - 16, y);

  y += 20;
  ctx.textAlign = 'left';
  ctx.fillText('KDV (%20):', 16, y);
  ctx.textAlign = 'right';
  ctx.fillText(`${kdv} TL`, width - 16, y);

  y += 14;
  drawDashedLine(ctx, 12, y, width - 12, y);

  y += 26;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('TOPLAM TUTAR:', 16, y);
  ctx.textAlign = 'right';
  ctx.fillText(`${genel} TL`, width - 16, y);

  y += 20;
  const fisBarcodeH = drawBarcodeToCanvas(ctx, fisNo, 'code128', width / 2, y, width - 40, 10, true);

  y += (fisBarcodeH || 48) + 16;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Mali değeri yoktur / Bilgi fişidir.', width / 2, y);
}

// ==========================================
// 4. ELEKTRONİK & SERVİS ŞABLONLARI
// ==========================================

export function renderProSeriImei({ ctx, width, canvas, values }: ProRenderContext) {
  const cihaz = v(values, 'Cihaz', 'iPhone 15 Pro');
  const imei = v(values, 'Imei', '356938035643809');
  const garanti = v(values, 'Garanti', '2027-08-25');

  const totalH = 265;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CİHAZ SERİ NO & IMEI ETİKETİ', width / 2, 28);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(cihaz, width / 2, y);

  y += 18;
  ctx.font = '12px monospace';
  ctx.fillText(`SN/IMEI: ${imei}`, width / 2, y);

  y += 14;
  drawBarcodeToCanvas(ctx, imei, 'code128', width / 2, y, width - 40, 14, false);

  y += 65;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 20;
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`GARANTİ BİTİŞ: ${garanti}`, width / 2, y);
}

export function renderProQcTest({ ctx, width, canvas, values }: ProRenderContext) {
  const urun = v(values, 'Urun', 'Kablosuz Kulaklık X9');
  const op = v(values, 'Operator', 'QC-2 Hattı');
  const testTarihi = v(values, 'Test_Tarihi', '2026-08-26');
  const seri = v(values, 'Seri_No', 'SN88312004');

  const totalH = 270;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 3);

  // Büyük QC PASSED Damgası
  let y = 36;
  ctx.fillStyle = '#000000';
  ctx.strokeRect(width / 2 - 80, y - 20, 160, 36);
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✔ QC PASSED', width / 2, y + 4);

  y += 34;
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(urun, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TEST OPERATÖRÜ:', 16, y);
  ctx.fillText(op, 150, y);

  y += 20;
  ctx.fillText('TEST TARİHİ:', 16, y);
  ctx.fillText(testTarihi, 150, y);

  y += 16;
  drawBarcodeToCanvas(ctx, seri, 'code128', width / 2, y, width - 40, 10, true);
}

export function renderProTeknikBakim({ ctx, width, canvas, values }: ProRenderContext) {
  const bakim = v(values, 'Bakim_Tarihi', '2027-02-25');
  const cihaz = v(values, 'Cihaz', 'Kombi Demirdöküm Nitron');
  const musteri = v(values, 'Musteri_Adi', 'Ahmet Demir');
  const firma = v(values, 'Firma_Adi', 'IsıServ Teknik');
  const tel = v(values, 'Firma_Tel', '0850 000 00 00');

  const totalH = 300;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PERİYODİK BAKIM KARTI', width / 2, 29);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SERVİS:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(firma, 80, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('MÜŞTERİ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(musteri, 80, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('CİHAZ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(cihaz, 80, y);

  y += 14;
  drawDashedLine(ctx, 12, y, width - 12, y);

  // SONRAKİ BAKIM KUTUSU
  y += 18;
  ctx.strokeRect(16, y, width - 32, 50);
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('BİR SONRAKİ BAKIM TARİHİ', width / 2, y + 18);
  ctx.font = 'bold 18px monospace';
  ctx.fillText(bakim, width / 2, y + 40);

  y += 65;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`SERVİS HATTI: ${tel}`, width / 2, y);
}

// ==========================================
// 5. ORGANİZASYON & SOSYAL ŞABLONLARI
// ==========================================

export function renderProQrMasa({ ctx, width, canvas, values }: ProRenderContext) {
  const masa = v(values, 'Masa_No', '7');
  const isletme = v(values, 'Isletme_Adi', 'Cafe Merkez');
  const link = v(values, 'Menu_Link', 'https://iprint.pro/menu');

  const totalH = 390;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  let y = 34;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isletme.toUpperCase(), width / 2, y);

  y += 12;
  drawDashedLine(ctx, 20, y, width - 20, y);

  y += 24;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('MASA NUMARASI', width / 2, y);

  y += 34;
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(masa, width / 2, y);

  y += 14;
  drawQRCodeToCanvas(ctx, link, width / 2, y, 140);

  y += 155;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('DİJİTAL MENÜYÜ GÖRÜNTÜLEMEK İÇİN', width / 2, y);
  y += 16;
  ctx.font = '11px sans-serif';
  ctx.fillText('Kameranızı QR koda doğrultunuz.', width / 2, y);
}

// ==========================================
// 6. SARF & DİĞER ŞABLONLARI
// ==========================================

export function renderProPickingSatir({ ctx, width, canvas, values }: ProRenderContext) {
  const siparis = v(values, 'Siparis_No', 'TY-900451');
  const raf = v(values, 'Raf', 'C-07-02');
  const urun = v(values, 'Urun', 'Fotoğraf Mug Beyaz');

  const totalH = 250;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`SİPARİŞ TOPLAMA: ${siparis}`, width / 2, 28);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('LOKASYON / RAF:', 16, y);
  ctx.font = 'bold 18px monospace';
  ctx.fillText(raf, 140, y);

  y += 24;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÜRÜN:', 16, y);
  ctx.font = '13px sans-serif';
  y = wrapText(ctx, urun, 70, y, width - 86, 16);

  y += 10;
  drawDashedLine(ctx, 12, y, width - 12, y);

  y += 18;
  drawBarcodeToCanvas(ctx, siparis, 'code128', width / 2, y, width - 40, 12, true);
}

export function renderProNumuneEtiket({ ctx, width, canvas, values }: ProRenderContext) {
  const urun = v(values, 'Urun', 'Sabun Numunesi 30g');
  const tarih = v(values, 'Tarih', '2026-08-26');
  const sorumlu = v(values, 'Sorumlu', 'Satış Ekibi');
  const kod = v(values, 'Kod', 'NMP-0055');

  const totalH = 240;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ NUMUNE - SATILMAZ ★', width / 2, 28);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÜRÜN:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(urun, 70, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('TARİH:', 16, y);
  ctx.fillText(tarih, 70, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('SORUMLU:', 16, y);
  ctx.fillText(sorumlu, 90, y);

  y += 14;
  drawBarcodeToCanvas(ctx, kod, 'code128', width / 2, y, width - 40, 10, true);
}

export function renderProSarfKutu({ ctx, width, canvas, values }: ProRenderContext) {
  const icerik = v(values, 'Icerik', 'Eldiven L Beden');
  const acilis = v(values, 'Acilis', '2026-08-26');
  const bitis = v(values, 'Bitis', '2026-11-26');
  const sorumlu = v(values, 'Sorumlu', 'Depo Görevlisi');

  const totalH = 220;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 30);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SARF KUTU AÇILIŞ TAKİBİ', width / 2, 28);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('İÇERİK:', 16, y);
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(icerik, 80, y);

  y += 26;
  ctx.font = '12px sans-serif';
  ctx.fillText('AÇILIŞ TARİHİ:', 16, y);
  ctx.font = '14px sans-serif';
  ctx.fillText(acilis, 130, y);

  y += 26;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('MİAD / BİTİŞ:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(bitis, 130, y);

  y += 26;
  ctx.font = '12px sans-serif';
  ctx.fillText('SORUMLU:', 16, y);
  ctx.fillText(sorumlu, 130, y);
}

export function renderProReklamasyonFis({ ctx, width, canvas, values }: ProRenderContext) {
  const musteri = v(values, 'Musteri_Adi', 'Zeynep K.');
  const urun = v(values, 'Urun', 'Seramik Vazo Büyük');
  const detay = v(values, 'Detay', 'Kapak kısmında kırık mevcut.');
  const kayit = v(values, 'Kayit_No', 'RK-0312');

  const totalH = 280;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('REKLAMASYON & ARIZA FİŞİ', width / 2, 29);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('MÜŞTERİ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(musteri, 90, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÜRÜN:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(urun, 90, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ŞİKAYET DETAYI:', 16, y);
  y += 18;
  ctx.font = '12px sans-serif';
  y = wrapText(ctx, detay, 16, y, width - 32, 16);

  y += 10;
  drawBarcodeToCanvas(ctx, kayit, 'code128', width / 2, y, width - 40, 10, true);
}

// ==========================================
// 7. EĞİTİM & OKUL ŞABLONLARI (YENİ)
// ==========================================

export function renderProOkulDefter({ ctx, width, canvas, values }: ProRenderContext) {
  const ogrenci = v(values, 'Ogrenci_Adi', 'Emir Karaca');
  const okulSinif = v(values, 'Okul_Sinif', 'Atatürk İlkokulu / 4-B');
  const ders = v(values, 'Ders_Adi', 'Matematik Defteri');
  const no = v(values, 'Okul_No', '482');
  const ogretmen = v(values, 'Ogretmen', 'Selin Öğretmen');

  const totalH = 300;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  // Süslü Okul Çerçevesi (Çift çizgi + köşe süsü)
  drawFrame(ctx, 6, totalH, width, 3);
  drawFrame(ctx, 10, totalH, width, 1);

  // Başlık banner
  ctx.fillStyle = '#000000';
  ctx.fillRect(14, 14, width - 28, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📚 DERS & OKUL DEFTERİ', width / 2, 38);

  let y = 72;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ÖĞRENCİ ADI SOYADI', width / 2, y);

  y += 24;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(ogrenci, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 20, y, width - 20, y);

  y += 22;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('OKUL / SINIF:', 20, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(okulSinif, 120, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('DERS ADI:', 20, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(ders, 120, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('OKUL NO:', 20, y);
  ctx.font = 'bold 14px monospace';
  ctx.fillText(no, 120, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('ÖĞRETMEN:', 20, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(ogretmen, 120, y);

  y += 24;
  ctx.font = 'italic 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ Başarılar Dileriz ★', width / 2, y);
}

export function renderProKitapAyraci({ ctx, width, canvas, values }: ProRenderContext) {
  const kitap = v(values, 'Kitap_Adi', 'Küçük Prens');
  const yazar = v(values, 'Yazar', 'Antoine de Saint-Exupéry');
  const sayfa = v(values, 'Hedef_Sayfa', 'Sayfa 64');
  const alinti = v(values, 'Alinti', 'İnsan ancak yüreğiyle baktığı zaman doğruyu görebilir. Gerçeğin mayası gözle görülmez.');
  const link = v(values, 'Kitap_Link', 'https://iprint.pro');

  const totalH = 420;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Üstte delik kesme halkası piktogramı
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, 22, 8, 0, Math.PI * 2);
  ctx.stroke();

  let y = 52;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 17px serif';
  ctx.textAlign = 'center';
  ctx.fillText(kitap, width / 2, y);

  y += 18;
  ctx.font = 'italic 12px serif';
  ctx.fillText(yazar, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 20, y, width - 20, y);

  y += 26;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`Kaldığım Yer: ${sayfa}`, width / 2, y);

  // Tırnak içinde alıntı
  y += 28;
  ctx.font = 'italic 13px serif';
  y = wrapText(ctx, `"${alinti}"`, width / 2, y, width - 40, 18, 'center');

  y += 12;
  drawDashedLine(ctx, 20, y, width - 20, y);

  y += 16;
  drawQRCodeToCanvas(ctx, link, width / 2, y, 90);

  y += 105;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📖 İyi Okumalar', width / 2, y);
}

export function renderProSinavSoru({ ctx, width, canvas, values }: ProRenderContext) {
  const ders = v(values, 'Ders', 'Fizik / Mekanik');
  const konu = v(values, 'Konu', 'Newton Hareket Yasaları');
  const formul = v(values, 'Formul', 'F_net = m · a');
  const ipucu = v(values, 'Ipucu', 'Sürtünme kuvveti daima hareket yönünün tersinedir: f_s = k · N');

  const totalH = 310;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ FORMÜL & HATIRLATICI', width / 2, 29);

  let y = 60;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DERS:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(ders, 70, y);

  y += 20;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('KONU:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(konu, 70, y);

  // Büyük Formül Kutusu
  y += 22;
  ctx.fillRect(16, y, width - 32, 54);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(formul, width / 2, y + 34);

  y += 70;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('💡 ÖNEMLİ İPUCU / NOT:', 16, y);

  y += 18;
  ctx.font = '12px sans-serif';
  y = wrapText(ctx, ipucu, 16, y, width - 32, 16);
}

// ==========================================
// 8. KAFE & BUTİK GIDA ŞABLONLARI (YENİ)
// ==========================================

export function renderProKahveSiparis({ ctx, width, canvas, values }: ProRenderContext) {
  const musteri = v(values, 'Musteri', 'Ece D.');
  const kahve = v(values, 'Kahve_Turu', 'Iced Caramel Oat Latte');
  const sut = v(values, 'Sut_Tipi', 'Yulaf Sütü (%100)');
  const surup = v(values, 'Surup', 'Karamel (2 Pompa)');
  const not = v(values, 'Ozel_Not', 'Ekstra buzlu, az şekerli');
  const barista = v(values, 'Barista', 'Ali');

  const totalH = 345;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Başlık
  let y = 30;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ ÖZEL KAHVE SİPARİŞİ', width / 2, y);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Müşteri Adı
  y += 24;
  ctx.font = '11px sans-serif';
  ctx.fillText('MÜŞTERİ', width / 2, y);
  y += 24;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(musteri.toUpperCase(), width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('KAHVE:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(kahve, 80, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SÜT TİPİ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(sut, 80, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ŞURUP:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(surup, 80, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÖZEL NOT:', 16, y);
  y += 18;
  ctx.font = 'italic 12px sans-serif';
  y = wrapText(ctx, not, 16, y, width - 32, 16);

  y += 10;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 18;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Barista: ${barista}  ✔`, width - 16, y);
}

export function renderProTatliIcerik({ ctx, width, canvas, values }: ProRenderContext) {
  const tatli = v(values, 'Tatli_Adi', 'San Sebastian Cheesecake');
  const kalori = v(values, 'Kalori', '380');
  const alerjenler = v(values, 'Alerjenler', 'Süt, Yumurta, Eser miktarda Fındık');
  const tuketim = v(values, 'Tuketim_Tarihi', '2026-08-28');
  const sef = v(values, 'Sef_Adi', 'Şef Mehmet');

  const totalH = 330;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🍰 GURME PASTA & FIRIN', width / 2, 29);

  let y = 62;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 17px serif';
  ctx.textAlign = 'center';
  ctx.fillText(tatli, width / 2, y);

  y += 20;
  ctx.font = '12px sans-serif';
  ctx.fillText(`Porsiyon Enerji: ${kalori} kcal`, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Alerjen Kutusu
  y += 22;
  ctx.strokeRect(16, y, width - 32, 60);
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('⚠ ALERJEN UYARISI:', 24, y + 18);
  ctx.font = '12px sans-serif';
  wrapText(ctx, alerjenler, 24, y + 36, width - 48, 16);

  y += 80;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SON TÜKETİM:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(tuketim, 120, y);

  y += 24;
  ctx.font = '12px sans-serif';
  ctx.fillText('ÜRETEN ŞEF:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(sef, 120, y);
}

export function renderProKavanozRecel({ ctx, width, canvas, values }: ProRenderContext) {
  const urun = v(values, 'Urun_Adi', 'Ev Yapımı Dağ Çileği Reçeli');
  const icindekiler = v(values, 'Icindekiler', 'Doğal Dağ Çileği (%65), Pancar Şekeri, Limon Suyu. Katkısız & Koruyucusuz.');
  const agirlik = v(values, 'Agirlik', '380 gr Net');
  const uretim = v(values, 'Uretim_Tarihi', '2026-08-20');
  const mensei = v(values, 'Mensei', 'Bolu / Abant');

  const totalH = 350;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Doğal Ürün Damgası
  let y = 30;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ %100 DOĞAL & KATKISIZ ★', width / 2, y);

  y += 24;
  ctx.font = 'bold 17px serif';
  ctx.fillText(urun, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 22;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('İÇİNDEKİLER:', 16, y);
  y += 16;
  ctx.font = '12px sans-serif';
  y = wrapText(ctx, icindekiler, 16, y, width - 32, 16);

  y += 10;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('NET AĞIRLIK:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(agirlik, 110, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('ÜRETİM TARİHİ:', 16, y);
  ctx.fillText(uretim, 110, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('MENŞEİ:', 16, y);
  ctx.fillText(mensei, 110, y);

  y += 24;
  ctx.font = 'italic 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Güneş ışığından koruyunuz. Açıldıktan sonra buzdolabında saklayınız.', width / 2, y);
}

// ==========================================
// 9. BİTKİ & BAHÇE ŞABLONLARI (YENİ)
// ==========================================

export function renderProBitkiBakim({ ctx, width, canvas, values }: ProRenderContext) {
  const bitki = v(values, 'Bitki_Turu', 'Monstera Deliciosa (Deve Tabanı)');
  const sulama = v(values, 'Sulama_Sikligi', 'Haftada 1 Kez (Toprak kuruyunca)');
  const isik = v(values, 'Isik_Ihtiyaci', 'Yarı gölge, dolaylı parlak ışık');
  const sonSulama = v(values, 'Son_Sulama', '2026-08-25');
  const not = v(values, 'Bakim_Notu', 'Yapraklarına haftada bir su püskürtün.');

  const totalH = 320;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Başlık
  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌿 BİTKİ BAKIM PASAPORTU', width / 2, 29);

  let y = 62;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText(bitki, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('💧 SULAMA REJİMİ:', 16, y);
  y += 18;
  ctx.font = '13px sans-serif';
  y = wrapText(ctx, sulama, 16, y, width - 32, 16);

  y += 12;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('☀️ IŞIK İHTİYACI:', 16, y);
  y += 18;
  ctx.font = '13px sans-serif';
  y = wrapText(ctx, isik, 16, y, width - 32, 16);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SON SULAMA:', 16, y);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(sonSulama, 120, y);

  y += 20;
  ctx.font = 'italic 11px sans-serif';
  ctx.fillText(`Not: ${not}`, 16, y);
}

export function renderProTohumPaket({ ctx, width, canvas, values }: ProRenderContext) {
  const cesit = v(values, 'Cesit_Adi', 'Organik Pembe Domates Tohumu');
  const ekim = v(values, 'Ekim_Ayi', 'Mart - Nisan');
  const cimlenme = v(values, 'Cimlenme_Gunu', '7-10');
  const hasat = v(values, 'Hasat_Suresi', '75-80 Gün');

  const totalH = 295;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  let y = 32;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌱 ORGANİK TOHUM PAKETİ', width / 2, y);

  y += 24;
  ctx.font = 'bold 16px serif';
  ctx.fillText(cesit, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EKİM DÖNEMİ:', 16, y);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(ekim, 140, y);

  y += 24;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('ÇİMLENME SÜRESİ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(`${cimlenme} Gün`, 140, y);

  y += 24;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('HASAT VAKTİ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(hasat, 140, y);

  y += 20;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Kuru, serin ve ışıksız ortamda muhafaza ediniz.', width / 2, y);
}

// ==========================================
// 10. ETKİNLİK, SİNEMA & BİLET ŞABLONLARI (YENİ)
// ==========================================

export function renderProKonserBilet({ ctx, width, canvas, values }: ProRenderContext) {
  const etkinlik = v(values, 'Etkinlik_Adi', 'Rock Senfoni Orkestrası');
  const tarihSaat = v(values, 'Tarih_Saat', '15.10.2026 - 20:30');
  const mekan = v(values, 'Mekan', 'Harbiye Açıkhava Tiyatrosu');
  const koltuk = v(values, 'Koltuk_Bilgisi', 'Protokol A Blok / Sıra 4 / No 12');
  const biletNo = v(values, 'Bilet_No', 'TCK-88194');

  const totalH = 375;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Başlık banner
  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎟 KONSER & TİYATRO GİRİŞ BİLETİ', width / 2, 29);

  let y = 62;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(etkinlik, width / 2, y);

  y += 20;
  ctx.font = 'bold 13px monospace';
  ctx.fillText(tarihSaat, width / 2, y);

  y += 18;
  ctx.font = '12px sans-serif';
  ctx.fillText(mekan, width / 2, y);

  // Bilet Koparma Çentikleri (Vintage Bilet Hissi)
  y += 24;
  drawTicketNotches(ctx, y, width, 12);

  y += 30;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('KOLTUK / GİRİŞ BİLGİSİ', width / 2, y);

  y += 22;
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(koltuk, width / 2, y);

  y += 20;
  const konserBarcodeH = drawBarcodeToCanvas(ctx, biletNo, 'code128', width / 2, y, width - 50, 12, true);

  y += (konserBarcodeH || 50) + 16;
  ctx.font = '10px sans-serif';
  ctx.fillText('* Kapıda barkod okutularak giriş yapılır *', width / 2, y);
}

export function renderProSinemaBilet({ ctx, width, canvas, values }: ProRenderContext) {
  const film = v(values, 'Film_Adi', 'Yıldızlararası (IMAX Re-Release)');
  const salon = v(values, 'Salon_No', 'Salon 3 (IMAX Laser)');
  const seans = v(values, 'Seans_Saati', '21:15');
  const koltuk = v(values, 'Koltuk_No', 'G-14, G-15');
  const kod = v(values, 'Bilet_Kodu', 'SNM-44210');

  const totalH = 390;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Kenar film şeritleri
  for (let i = 20; i < totalH - 20; i += 24) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(10, i, 6, 12);
    ctx.fillRect(width - 16, i, 6, 12);
  }

  let y = 36;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎬 SİNEMA GİRİŞ BİLETİ', width / 2, y);

  y += 24;
  ctx.font = 'bold 15px sans-serif';
  y = wrapText(ctx, film, width / 2, y, width - 64, 18, 'center');

  y += 10;
  drawDashedLine(ctx, 24, y, width - 24, y);

  // Salon & Seans & Koltuk Tablosu
  y += 22;
  const colW = (width - 60) / 3;
  ctx.font = '10px sans-serif';
  ctx.fillText('SALON', 30 + colW / 2, y);
  ctx.fillText('SEANS', 30 + colW + colW / 2, y);
  ctx.fillText('KOLTUK', 30 + colW * 2 + colW / 2, y);

  y += 18;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(salon.split(' ')[0] + ' ' + (salon.split(' ')[1] || ''), 30 + colW / 2, y);
  ctx.fillText(seans, 30 + colW + colW / 2, y);
  ctx.fillText(koltuk, 30 + colW * 2 + colW / 2, y);

  y += 18;
  drawDashedLine(ctx, 24, y, width - 24, y);

  y += 16;
  const cinemaBarcodeH = drawBarcodeToCanvas(ctx, kod, 'code128', width / 2, y, width - 60, 10, true);

  y += (cinemaBarcodeH || 48) + 18;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('İyi Seyirler Dileriz! 🍿', width / 2, y);
}

export function renderProPartiDavetiye({ ctx, width, canvas, values }: ProRenderContext) {
  const davetli = v(values, 'Davetli_Adi', 'Burak & Misafiri');
  const konsept = v(values, 'Konsept', 'Retro 80ler & Neon Gecesi');
  const tarih = v(values, 'Tarih', '28 Ağustos Cuma 21:00');
  const mekan = v(values, 'Mekan', 'Sky Lounge Kadıköy');
  const vip = v(values, 'Vip_Kodu', 'VIP-PARTY-88');

  const totalH = 390;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  let y = 34;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ VIP ÖZEL DAVETİYE ★', width / 2, y);

  y += 24;
  ctx.font = '11px sans-serif';
  ctx.fillText('SAYIN', width / 2, y);

  y += 24;
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(davetli.toUpperCase(), width / 2, y);

  y += 14;
  drawDashedLine(ctx, 20, y, width - 20, y);

  y += 22;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`KONSEPT: ${konsept}`, width / 2, y);

  y += 18;
  ctx.font = '13px monospace';
  ctx.fillText(tarih, width / 2, y);

  y += 18;
  ctx.font = '12px sans-serif';
  ctx.fillText(`Mekan: ${mekan}`, width / 2, y);

  y += 16;
  drawQRCodeToCanvas(ctx, `https://iprint.pro/vip/${vip}`, width / 2, y, 100);

  y += 115;
  ctx.font = '10px sans-serif';
  ctx.fillText('Girişte VIP QR Kodu gösteriniz.', width / 2, y);
}

// ==========================================
// 11. GEZİ, SEYAHAT & OTEL ŞABLONLARI (YENİ)
// ==========================================

export function renderProValizEtiket({ ctx, width, canvas, values }: ProRenderContext) {
  const yolcu = v(values, 'Yolcu_Adi', 'CANAN YILDIZ');
  const ucus = v(values, 'Ucus_No', 'TK 1984');
  const kalkis = v(values, 'Kalkis', 'IST (İstanbul)');
  const varis = v(values, 'Varis', 'LHR (Londra)');
  const tel = v(values, 'Telefon', '+90 532 999 88 77');
  const bagaj = v(values, 'Bagaj_No', 'BAGG-9012');

  const totalH = 380;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Boarding Pass Üst Banner
  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 34);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✈ BOARDING PASS / BAGAJ', width / 2, 30);

  // ROTA KODLARI BÜYÜK PUNTO
  let y = 68;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  const kKod = kalkis.split(' ')[0];
  const vKod = varis.split(' ')[0];
  ctx.fillText(`${kKod} ➔ ${vKod}`, width / 2, y);

  y += 16;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('YOLCU ADI:', 16, y);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(yolcu, 100, y);

  y += 24;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('UÇUŞ NO:', 16, y);
  ctx.font = 'bold 15px monospace';
  ctx.fillText(ucus, 100, y);

  y += 24;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('İLETİŞİM TEL:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(tel, 100, y);

  y += 18;
  drawBarcodeToCanvas(ctx, bagaj, 'code128', width / 2, y, width - 40, 14, true);

  y += 65;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Kaybolması durumunda lütfen iletişim numarasını arayınız.', width / 2, y);
}

export function renderProOtelKapi({ ctx, width, canvas, values }: ProRenderContext) {
  const oda = v(values, 'Oda_No', '408');
  const durum = v(values, 'Durum', 'Lütfen Odayı Temizleyiniz');
  const misafir = v(values, 'Misafir_Adi', 'Yıldız Ailesi');
  const tarih = v(values, 'Tarih', '2026-08-26');

  const isTemizlik = durum.toLowerCase().includes('temizle');
  const totalH = 370;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Kapı Kolu Deliği Çizimi
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, 40, 24, 0, Math.PI * 2);
  ctx.stroke();

  let y = 95;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ODA NUMARASI', width / 2, y);

  y += 34;
  ctx.font = 'bold 36px monospace';
  ctx.fillText(oda, width / 2, y);

  y += 18;
  drawDashedLine(ctx, 20, y, width - 20, y);

  // Durum Banner
  y += 24;
  ctx.fillRect(16, y, width - 32, 54);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isTemizlik ? '🧹 LÜTFEN ODAYI' : '🚫 LÜTFEN RAHATSIZ', width / 2, y + 24);
  ctx.fillText(isTemizlik ? 'TEMİZLEYİNİZ' : 'ETMEYİNİZ', width / 2, y + 44);

  y += 80;
  ctx.fillStyle = '#000000';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Misafir: ${misafir}`, width / 2, y);

  y += 20;
  ctx.font = '11px sans-serif';
  ctx.fillText(`Tarih: ${tarih}`, width / 2, y);
}

// ==========================================
// 12. SAĞLIK & YAŞAM ŞABLONLARI (YENİ)
// ==========================================

export function renderProSuTakip({ ctx, width, canvas, values }: ProRenderContext) {
  const hedef = v(values, 'Hedef_Litre', '2.5');
  const tarih = v(values, 'Tarih', '2026-08-26');
  const motivasyon = v(values, 'Motivasyon_Sozu', 'Vücudunu yenile, her yudumda canlan!');

  const totalH = 380;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Başlık
  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💧 GÜNLÜK SU TAKİP ÇETELESİ', width / 2, 29);

  let y = 62;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`HEDEF: ${hedef} LİTRE  |  ${tarih}`, width / 2, y);

  y += 16;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // 8 Bardak Grid Kutuları (4 sütun x 2 satır)
  y += 20;
  const startX = 24;
  const cupW = (width - 48 - 30) / 4;
  const cupH = 50;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col + 1;
      const cx = startX + col * (cupW + 10);
      const cy = y + row * (cupH + 16);
      drawCupBox(ctx, cx, cy, cupW, cupH, idx);
    }
  }

  y += 140;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 22;
  ctx.font = 'italic 12px sans-serif';
  ctx.textAlign = 'center';
  wrapText(ctx, `"${motivasyon}"`, width / 2, y, width - 32, 16, 'center');
}

export function renderProFitnessLog({ ctx, width, canvas, values }: ProRenderContext) {
  const bolge = v(values, 'Bolge', 'Göğüs & Arka Kol (Push Day)');
  const tarih = v(values, 'Tarih', '2026-08-26');
  const eg1 = v(values, 'Egzersiz_1', 'Bench Press: 4x10 (80kg)');
  const eg2 = v(values, 'Egzersiz_2', 'Incline Dumbbell: 3x12 (26kg)');
  const sure = v(values, 'Sure', '55');
  const kalori = v(values, 'Kalori', '420');

  const totalH = 340;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏋 FITNESS WORKOUT LOG', width / 2, 29);

  let y = 60;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(bolge, width / 2, y);

  y += 18;
  ctx.font = '12px monospace';
  ctx.fillText(tarih, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Egzersizler
  y += 24;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EGZERSİZ LİSTESİ:', 16, y);

  y += 20;
  ctx.font = '13px sans-serif';
  ctx.fillText(`• ${eg1}`, 20, y);

  y += 22;
  ctx.fillText(`• ${eg2}`, 20, y);

  y += 22;
  ctx.fillText('• ........................................', 20, y);

  y += 20;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Süre & Kalori Kutuları
  y += 16;
  const boxW = (width - 40) / 2;
  ctx.strokeRect(16, y, boxW, 44);
  ctx.strokeRect(24 + boxW, y, boxW, 44);

  ctx.textAlign = 'center';
  ctx.font = '10px sans-serif';
  ctx.fillText('SÜRE', 16 + boxW / 2, y + 15);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${sure} Dk`, 16 + boxW / 2, y + 36);

  ctx.font = '10px sans-serif';
  ctx.fillText('YAKILAN', 24 + boxW + boxW / 2, y + 15);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`${kalori} kcal`, 24 + boxW + boxW / 2, y + 36);
}

export function renderProIlacTakip({ ctx, width, canvas, values }: ProRenderContext) {
  const hasta = v(values, 'Hasta_Adi', 'Fatma Hanım');
  const ilac = v(values, 'Ilac_Adi', 'B12 Vitamini & Omega-3');
  const doz = v(values, 'Doz', '1 Tablet');
  const kullanim = v(values, 'Kullanim', 'Tok Karnına');

  const totalH = 335;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('💊 İLAÇ & VİTAMİN TAKİP ÇİZELGESİ', width / 2, 29);

  let y = 60;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('HASTA:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(hasta, 80, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('İLAÇ ADI:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(ilac, 80, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('DOZ / KULLANIM:', 16, y);
  ctx.fillText(`${doz}  (${kullanim})`, 130, y);

  y += 16;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Günlük Zaman Kutucukları (Sabah, Öğle, Akşam, Gece)
  y += 24;
  const times = [
    { label: 'SABAH (08:00)', icon: '☀️' },
    { label: 'ÖĞLE (13:00)', icon: '⛅' },
    { label: 'AKŞAM (19:00)', icon: '🌙' },
    { label: 'GECE (23:00)', icon: '💤' }
  ];

  times.forEach(t => {
    ctx.strokeRect(16, y - 14, 18, 18);
    ctx.font = '13px sans-serif';
    ctx.fillText(`${t.icon}  ${t.label}`, 44, y);
    y += 28;
  });
}

// ==========================================
// 13. EVCİL HAYVAN & VETERİNER ŞABLONLARI (YENİ)
// ==========================================

export function renderProPetTasma({ ctx, width, canvas, values }: ProRenderContext) {
  const pet = v(values, 'Pet_Adi', 'LOKUM');
  const tur = v(values, 'Tur', 'Golden Retriever');
  const sahip = v(values, 'Sahip_Adi', 'Emre Tekin');
  const tel = v(values, 'Telefon', '0544 321 00 99');
  const cip = v(values, 'Cip_No', 'TR-9900012485');

  const totalH = 390;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Pati İkonu Çizimi
  let y = 32;
  drawPawIcon(ctx, width / 2, y, 18);

  y += 34;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(pet.toUpperCase(), width / 2, y);

  y += 18;
  ctx.font = 'italic 13px sans-serif';
  ctx.fillText(tur, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('⚠ KAYIPSAM LÜTFEN ARAYIN! ⚠', width / 2, y);

  y += 26;
  ctx.font = 'bold 20px monospace';
  ctx.fillText(tel, width / 2, y);

  y += 18;
  ctx.font = '12px sans-serif';
  ctx.fillText(`Sahibi: ${sahip}`, width / 2, y);

  y += 14;
  drawQRCodeToCanvas(ctx, `tel:${tel}`, width / 2, y, 90);

  y += 105;
  ctx.font = '10px monospace';
  ctx.fillText(`Mikroçip No: ${cip}`, width / 2, y);
}

export function renderProVeterinerAsi({ ctx, width, canvas, values }: ProRenderContext) {
  const klinik = v(values, 'Klinik_Adi', 'Dostlar Veteriner Kliniği');
  const pet = v(values, 'Pet_Adi', 'Pamuk (Tekir Kedi)');
  const asi = v(values, 'Asi_Turu', 'Karma Aşı (3. Doz)');
  const uygulama = v(values, 'Uygulama_Tarihi', '2026-08-26');
  const gelecekDoz = v(values, 'Gelecek_Doz', '2027-08-26');
  const hekim = v(values, 'Hekim_Adi', 'Vet. Hekim Murat Arslan');

  const totalH = 345;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🐾 VETERİNER AŞI KARTI', width / 2, 29);

  let y = 60;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(klinik, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 24;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('HASTA / PET:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(pet, 110, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('AŞI TÜRÜ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(asi, 110, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('UYGULAMA:', 16, y);
  ctx.fillText(uygulama, 110, y);

  // GELECEK DOZ KUTUSU
  y += 18;
  ctx.strokeRect(16, y, width - 32, 50);
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('BİR SONRAKİ AŞI / DOZ TARİHİ', width / 2, y + 18);
  ctx.font = 'bold 16px monospace';
  ctx.fillText(gelecekDoz, width / 2, y + 40);

  y += 68;
  ctx.textAlign = 'right';
  ctx.font = 'italic 11px sans-serif';
  ctx.fillText(`${hekim} (Kaşe/İmza)`, width - 16, y);
}

// ==========================================
// 14. OTO & ARAÇ BAKIM ŞABLONLARI (YENİ)
// ==========================================

export function renderProOtoYagDegisim({ ctx, width, canvas, values }: ProRenderContext) {
  const plaka = v(values, 'Plaka', '34 BJK 1903');
  const mevcutKm = v(values, 'Mevcut_Km', '124.500');
  const gelecekKm = v(values, 'Gelecek_Km', '134.500');
  const yag = v(values, 'Yag_Turu', '5W-30 Tam Sentetik');
  const filtreler = v(values, 'Filtreler', 'Yağ + Hava + Polen');
  const servis = v(values, 'Servis_Adi', 'Usta Oto Bosch Car Service');
  const tarih = v(values, 'Tarih', '2026-08-26');

  const totalH = 385;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚗 PERİYODİK YAĞ & BAKIM KARTI', width / 2, 29);

  // Plaka Büyük Kutu
  let y = 56;
  ctx.fillStyle = '#000000';
  ctx.strokeRect(width / 2 - 90, y, 180, 40);
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(plaka, width / 2, y + 28);

  y += 56;
  const boxW = (width - 40) / 2;
  ctx.strokeRect(16, y, boxW, 52);
  ctx.strokeRect(24 + boxW, y, boxW, 52);

  ctx.font = '10px sans-serif';
  ctx.fillText('DEĞİŞİM KM', 16 + boxW / 2, y + 16);
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`${mevcutKm}`, 16 + boxW / 2, y + 38);

  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('SONRAKİ KM', 24 + boxW + boxW / 2, y + 16);
  ctx.font = 'bold 15px monospace';
  ctx.fillText(`${gelecekKm}`, 24 + boxW + boxW / 2, y + 38);

  y += 66;
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('YAĞ TÜRÜ:', 16, y);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(yag, 100, y);

  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('FİLTRELER:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(filtreler, 100, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('SERVİS:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(servis, 100, y);

  y += 22;
  ctx.font = '12px sans-serif';
  ctx.fillText('TARİH:', 16, y);
  ctx.fillText(tarih, 100, y);

  y += 26;
  ctx.font = 'italic 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('* Lütfen periyodik bakım aralıklarına uyunuz *', width / 2, y);
}

// ==========================================
// 15. EK ZENGİN & ÇOK YÖNLÜ ŞABLONLAR (YENİ)
// ==========================================

export function renderProSevkIrsaliye({ ctx, width, canvas, values }: ProRenderContext) {
  const irsaliye = v(values, 'Irsaliye_No', 'IRS-2026-904');
  const musteri = v(values, 'Musteri', 'Mavi Lojistik Ltd.');
  const tarih = v(values, 'Tarih', '2026-08-26');
  const k1 = v(values, 'Kalem_1', 'Termal Kağıt Rulo 57mm (10 Koli)');
  const k2 = v(values, 'Kalem_2', 'Bluetooth Mini Yazıcı v3 (2 Adet)');
  const k3 = v(values, 'Kalem_3', 'Yedek Şarj Kablosu Type-C (5 Adet)');
  const takip = v(values, 'Kargo_Takip', 'TRK90412288');

  const totalH = 390;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📦 SEVK & PAKET ÇIKIŞ FİŞİ', width / 2, 29);

  let y = 58;
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('İRSALİYE NO:', 16, y);
  ctx.font = 'bold 14px monospace';
  ctx.fillText(irsaliye, 110, y);

  y += 20;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('MÜŞTERİ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(musteri, 110, y);

  y += 20;
  ctx.font = '12px sans-serif';
  ctx.fillText('SEVK TARİHİ:', 16, y);
  ctx.fillText(tarih, 110, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Paket İçi Kontrol Listesi
  y += 20;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PAKET İÇERİĞİ / KONTROL LİSTESİ:', 16, y);

  const items = [k1, k2, k3].filter(Boolean);
  items.forEach((item, idx) => {
    y += 20;
    ctx.strokeRect(16, y - 12, 14, 14);
    ctx.font = '12px sans-serif';
    ctx.fillText(`${idx + 1}. ${item}`, 36, y);
  });

  y += 16;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 18;
  drawBarcodeToCanvas(ctx, takip, 'code128', width / 2, y, width - 40, 10, true);

  y += 55;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Paketleyen: .....................', 16, y);
  ctx.textAlign = 'right';
  ctx.fillText('Kontrol: [ ✔ ]', width - 16, y);
}

export function renderProKahveCekirdek({ ctx, width, canvas, values }: ProRenderContext) {
  const cekirdek = v(values, 'Cekirdek_Adi', 'Ethiopia Yirgacheffe G1');
  const koken = v(values, 'Koken_Rakim', 'Etiyopya / 2.100m');
  const kavrum = v(values, 'Kavrum', 'Medium Roast');
  const tadim = v(values, 'Tadim_Notlari', 'Yasemin, Bergamot, Narenciye, Bal tatlılığı');
  const kavrumTarihi = v(values, 'Kavrum_Tarihi', '2026-08-22');
  const gramaj = v(values, 'Gramaj', '250');

  const totalH = 410;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  let y = 32;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('☕ SPECIALTY COFFEE ROASTERS ☕', width / 2, y);

  y += 24;
  ctx.font = 'bold 17px serif';
  ctx.fillText(cekirdek, width / 2, y);

  y += 18;
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText(koken, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Kavrum Derecesi Göstergesi
  y += 22;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`KAVRUM PROFİLİ: ${kavrum.toUpperCase()}`, width / 2, y);

  // Tadım Notları Kutusu
  y += 16;
  ctx.strokeRect(16, y, width - 32, 54);
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TADIM NOTLARI & AROMA', width / 2, y + 16);
  ctx.font = 'italic 12px serif';
  wrapText(ctx, `"${tadim}"`, width / 2, y + 36, width - 48, 15, 'center');

  y += 74;
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('KAVRUM TARİHİ:', 16, y);
  ctx.font = '13px monospace';
  ctx.fillText(kavrumTarihi, 130, y);

  y += 22;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('NET AĞIRLIK:', 16, y);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${gramaj} gr Net`, 130, y);

  y += 16;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 20;
  ctx.font = 'italic 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Valfli özel ambalajında serin ve kuru yerde saklayınız.', width / 2, y);
}

export function renderProVintageEtiket({ ctx, width, canvas, values }: ProRenderContext) {
  const urun = v(values, 'Urun_Adi', 'Orijinal 90s Deri Bomber Ceket');
  const beden = v(values, 'Beden', 'L');
  const kondisyon = v(values, 'Kondisyon', 'Kusursuz (A+)');
  const fiyat = v(values, 'Fiyat', '1.450');
  const kod = v(values, 'Satici_Kod', 'VTG-8812');
  const ig = v(values, 'Instagram', 'https://instagram.com/iprint');

  const totalH = 390;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Askı deliği
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, 22, 7, 0, Math.PI * 2);
  ctx.stroke();

  let y = 48;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ VINTAGE & THRIFT SELECTION ★', width / 2, y);

  y += 24;
  ctx.font = 'bold 16px serif';
  ctx.fillText(urun, width / 2, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Beden & Kondisyon Kutucukları
  y += 18;
  const colW = (width - 40) / 2;
  ctx.strokeRect(16, y, colW, 44);
  ctx.strokeRect(24 + colW, y, colW, 44);

  ctx.font = '10px sans-serif';
  ctx.fillText('BEDEN', 16 + colW / 2, y + 15);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(beden, 16 + colW / 2, y + 36);

  ctx.font = '10px sans-serif';
  ctx.fillText('KONDİSYON', 24 + colW + colW / 2, y + 15);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(kondisyon.split(' ')[0], 24 + colW + colW / 2, y + 36);

  // Fiyat Büyük Banner
  y += 58;
  ctx.fillRect(16, y, width - 32, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`${fiyat} ₺`, width / 2, y + 32);

  y += 62;
  ctx.fillStyle = '#000000';
  ctx.font = '11px monospace';
  ctx.fillText(`KOD: ${kod}`, width / 2, y);

  y += 12;
  drawQRCodeToCanvas(ctx, ig, width / 2, y, 70);

  y += 82;
  ctx.font = '10px sans-serif';
  ctx.fillText('Kombin & İndirimler İçin Takip Edin', width / 2, y);
}

export function renderProOtoparkVale({ ctx, width, canvas, values }: ProRenderContext) {
  const plaka = v(values, 'Plaka', '34 TCP 2026');
  const saat = v(values, 'Giris_Saati', '19:45');
  const alan = v(values, 'Alan_Kat', 'Kat -2 / B-14');
  const model = v(values, 'Arac_Model', 'BMW 320i M Sport');
  const fisNo = v(values, 'Fis_No', 'VALE-0481');
  const tel = v(values, 'Iletisim', '0532 000 11 22');

  const totalH = 410;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  ctx.fillStyle = '#000000';
  ctx.fillRect(8, 8, width - 16, 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚗 OTOPARK & VALE KARTI', width / 2, 29);

  // Plaka Kutusu
  let y = 56;
  ctx.fillStyle = '#000000';
  ctx.strokeRect(width / 2 - 90, y, 180, 38);
  ctx.font = 'bold 22px monospace';
  ctx.fillText(plaka, width / 2, y + 27);

  y += 56;
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('GİRİŞ SAATİ:', 16, y);
  ctx.font = 'bold 14px monospace';
  ctx.fillText(saat, 110, y);

  y += 20;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PARK ALANI:', 16, y);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(alan, 110, y);

  y += 20;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('ARAÇ MODEL:', 16, y);
  ctx.font = '12px sans-serif';
  ctx.fillText(model, 110, y);

  // Vale Koçan Çentiği
  y += 18;
  drawTicketNotches(ctx, y, width, 10);

  y += 24;
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(`MÜŞTERİ TESLİM KOÇANI • ${fisNo}`, width / 2, y);

  y += 12;
  drawBarcodeToCanvas(ctx, fisNo, 'code128', width / 2, y, width - 40, 10, true);

  y += 55;
  ctx.font = '10px sans-serif';
  ctx.fillText(`Vale İletişim / Çağrı: ${tel}`, width / 2, y);
}

export function renderProTakiAksesuar({ ctx, width, canvas, values }: ProRenderContext) {
  const urun = v(values, 'Urun_Adi', 'Doğal Ametist Ay Kolye');
  const materyal = v(values, 'Materyal', '925 Ayar Gümüş');
  const tas = v(values, 'Tas_Turu', 'Hakiki Ametist');
  const gramaj = v(values, 'Gramaj', '4.8');
  const fiyat = v(values, 'Fiyat', '680');
  const kod = v(values, 'Barkod_Kodu', 'JW-AM881');

  const totalH = 360;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, 6, totalH, width, 2);

  // Askı deliği
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(width / 2, 20, 6, 0, Math.PI * 2);
  ctx.stroke();

  let y = 46;
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 13px serif';
  ctx.textAlign = 'center';
  ctx.fillText('💎 HANDMADE JEWELRY 💎', width / 2, y);

  y += 22;
  ctx.font = 'bold 16px serif';
  ctx.fillText(urun, width / 2, y);

  y += 12;
  drawDashedLine(ctx, 16, y, width - 16, y);

  y += 22;
  ctx.textAlign = 'left';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('MATERYAL:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(materyal, 100, y);

  y += 20;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('TAŞ TÜRÜ:', 16, y);
  ctx.font = '13px sans-serif';
  ctx.fillText(tas, 100, y);

  y += 20;
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('AĞIRLIK:', 16, y);
  ctx.font = '13px monospace';
  ctx.fillText(`${gramaj} gr`, 100, y);

  y += 14;
  drawDashedLine(ctx, 16, y, width - 16, y);

  // Fiyat & Barkod
  y += 22;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SATIŞ FİYATI:', 16, y);
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`${fiyat} ₺`, width - 16, y + 2);

  y += 14;
  drawBarcodeToCanvas(ctx, kod, 'code128', width / 2, y, width - 50, 8, true);
}

// ==========================================
// 16. 15x10 & 10x15 ENDÜSTRİYEL ETİKET RENDERER'LARI
// ==========================================

export function renderPro15x10KargoPazaryeri({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = Math.round(width >= 800 ? (width * 0.67) : 380); // 15x10 cm = 1.5:1 oran
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  // Dış Çift Çerçeve
  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(2.5 * s)));

  // Üst Başlık Bandı (Kargo & Rota Kodu)
  const headerH = Math.round(36 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`🚚 ${v(values, 'Kargo_Firmasi', 'Yurtiçi Kargo')}`, pad + Math.round(10 * s), pad + Math.round(24 * s));

  // Rota Rozeti (Sağ Üst)
  const rotaText = v(values, 'Rota_Kodu', '34-KDK / İST-04');
  ctx.textAlign = 'right';
  ctx.font = `bold ${Math.round(15 * s)}px monospace`;
  ctx.fillText(rotaText, width - pad - Math.round(10 * s), pad + Math.round(24 * s));

  let curY = pad + headerH + Math.round(10 * s);

  // İki Sütunlu Yapı: Sol Alıcı, Sağ Gönderici & Sipariş Bilgileri
  const midX = Math.round(width * 0.52);
  const leftW = midX - pad - Math.round(8 * s);
  const rightW = width - midX - pad - Math.round(8 * s);

  // SOL SÜTUN: ALICI BİLGİLERİ (Büyük & Vurgulu)
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad + Math.round(4 * s), curY, leftW, Math.round(20 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('ALICI (TESLİMAT ADRESİ)', pad + Math.round(10 * s), curY + Math.round(14 * s));

  ctx.fillStyle = '#000000';
  let leftY = curY + Math.round(36 * s);
  ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
  ctx.fillText(v(values, 'Alici_Adi', 'Deniz Korkmaz'), pad + Math.round(8 * s), leftY);

  leftY += Math.round(18 * s);
  ctx.font = `bold ${Math.round(12 * s)}px monospace`;
  ctx.fillText(`Tel: ${v(values, 'Alici_Tel', '0532 999 44 22')}`, pad + Math.round(8 * s), leftY);

  leftY += Math.round(16 * s);
  ctx.font = `${Math.round(11 * s)}px sans-serif`;
  leftY = wrapText(ctx, v(values, 'Teslimat_Adresi', 'Acıbadem Mah. Çeçen Sok. Akasya Evleri'), pad + Math.round(8 * s), leftY, leftW - Math.round(12 * s), Math.round(15 * s));

  leftY += Math.round(6 * s);
  ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
  ctx.fillText(`İLÇE/İL: ${v(values, 'Ilce', 'Üsküdar')} / ${v(values, 'Il', 'İSTANBUL')}`, pad + Math.round(8 * s), leftY);

  // SAĞ SÜTUN: GÖNDERİCİ & SİPARİŞ DETAYLARI
  ctx.fillStyle = '#000000';
  ctx.fillRect(midX, curY, rightW, Math.round(20 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.fillText('GÖNDERİCİ & SİPARİŞ DETAYI', midX + Math.round(6 * s), curY + Math.round(14 * s));

  ctx.fillStyle = '#000000';
  let rightY = curY + Math.round(34 * s);
  ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
  ctx.fillText(`FİRMA: ${v(values, 'Gonderici_Firma', 'MegaStore A.Ş.')}`, midX + Math.round(6 * s), rightY);

  rightY += Math.round(16 * s);
  ctx.font = `${Math.round(10.5 * s)}px monospace`;
  ctx.fillText(`SİPARİŞ NO: ${v(values, 'Siparis_No', 'TY-2026-9948')}`, midX + Math.round(6 * s), rightY);

  rightY += Math.round(16 * s);
  ctx.fillText(`PAKET/DESİ: ${v(values, 'Paket_Adet', '1')} Adet / ${v(values, 'Desi', '3')} Desi`, midX + Math.round(6 * s), rightY);

  rightY += Math.round(16 * s);
  ctx.font = `bold ${Math.round(10.5 * s)}px sans-serif`;
  ctx.fillText(`ÖDEME: ${v(values, 'Odeme_Turu', 'Peşin')}`, midX + Math.round(6 * s), rightY);

  // Dikey Ayırıcı Çizgi
  ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
  ctx.beginPath();
  ctx.moveTo(midX - Math.round(4 * s), curY);
  ctx.lineTo(midX - Math.round(4 * s), Math.max(leftY, rightY) + Math.round(10 * s));
  ctx.stroke();

  // Yatay Ayırıcı
  curY = Math.max(leftY, rightY) + Math.round(14 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY, [Math.round(4 * s), Math.round(4 * s)]);

  // İçerik Özeti (Koli İçi)
  curY += Math.round(14 * s);
  ctx.font = `bold ${Math.round(9.5 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('PAKET İÇERİĞİ:', pad + Math.round(8 * s), curY);
  ctx.font = `${Math.round(9.5 * s)}px sans-serif`;
  curY = wrapText(ctx, v(values, 'Icerik_Ozeti', 'Zebra Etiket Rulosu 150x100mm, Aksesuar Kabloları'), pad + Math.round(90 * s), curY, width - pad * 2 - Math.round(100 * s), Math.round(13 * s));

  // Barkod Bölümü (Büyük, Ortalanmış, Net)
  curY += Math.round(10 * s);
  const takipNo = v(values, 'Takip_No', 'YK-88402914820');
  const barcodeH = Math.round(48 * s);
  drawBarcodeToCanvas(ctx, takipNo, 'code128', width / 2, curY, width - pad * 2 - Math.round(30 * s), Math.round(16 * s), true);

  // Alt Teslimat İmzası & Bilgilendirme
  curY += barcodeH + Math.round(20 * s);
  if (curY < totalH - Math.round(24 * s)) {
    drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);
    ctx.font = `${Math.round(8.5 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Teslim Eden Kurye: .........................', pad + Math.round(10 * s), curY + Math.round(14 * s));
    ctx.textAlign = 'right';
    ctx.fillText('Teslim Alan İmza / Tarih: .........................', width - pad - Math.round(10 * s), curY + Math.round(14 * s));
  }
}

export function renderPro15x10PaletLojistik({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = Math.round(width >= 800 ? (width * 0.67) : 380);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  // Dış Çerçeve
  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(3 * s)));

  // Üst Başlık Bandı
  const headerH = Math.round(38 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('📦 GS1-128 PALET & LOJİSTİK SEVKİYAT', width / 2, pad + Math.round(24 * s));

  // Tesis Bilgileri
  let curY = pad + headerH + Math.round(14 * s);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
  ctx.fillText(`ÇIKIŞ TESİSİ: ${v(values, 'Gonderen_Tesis', 'Gebze Ana Lojistik Merkezi')}`, pad + Math.round(12 * s), curY);

  curY += Math.round(18 * s);
  ctx.fillText(`HEDEF DEPO: ${v(values, 'Hedef_Depo', 'İzmir Dağıtım Antreposu')}`, pad + Math.round(12 * s), curY);

  curY += Math.round(12 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // 4'lü Özet Tablo (Brüt, Net, Koli, Parti)
  curY += Math.round(14 * s);
  const colW = (width - pad * 2 - Math.round(20 * s)) / 4;

  const metrics = [
    { title: 'BRÜT KG', val: `${v(values, 'Brut_Agirlik', '485')} KG` },
    { title: 'NET KG', val: `${v(values, 'Net_Agirlik', '460')} KG` },
    { title: 'KOLİ ADEDİ', val: `${v(values, 'Koli_Adet', '36')} Koli` },
    { title: 'PARTİ / LOT', val: v(values, 'Parti_Lot', 'LOT-2026-88') }
  ];

  metrics.forEach((m, idx) => {
    const bx = pad + Math.round(10 * s) + idx * colW;
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx, curY, colW - Math.round(6 * s), Math.round(18 * s));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(9 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(m.title, bx + (colW - Math.round(6 * s)) / 2, curY + Math.round(13 * s));

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(12 * s)}px monospace`;
    ctx.fillText(m.val, bx + (colW - Math.round(6 * s)) / 2, curY + Math.round(36 * s));
  });

  curY += Math.round(48 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // Lojistik Uyarı Bandı
  curY += Math.round(12 * s);
  const uyari = v(values, 'Uyari_Notu', '⬆️ ÜST ÜSTE İSTİFLEME YAPMAYINIZ');
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad + Math.round(10 * s), curY, width - pad * 2 - Math.round(20 * s), Math.round(24 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(uyari, width / 2, curY + Math.round(16 * s));

  // Dev SSCC Barkodu (Code-128)
  curY += Math.round(32 * s);
  const sscc = v(values, 'SSCC_No', '386901234567890128');
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(11 * s)}px monospace`;
  ctx.fillText(`SSCC: (00) ${sscc}`, width / 2, curY);

  curY += Math.round(10 * s);
  drawBarcodeToCanvas(ctx, sscc, 'code128', width / 2, curY, width - pad * 2 - Math.round(40 * s), Math.round(18 * s), false);
}

export function renderPro15x10UrunKimlik({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = Math.round(width >= 800 ? (width * 0.67) : 380);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(2.5 * s)));

  // Üst Başlık
  const headerH = Math.round(34 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(13.5 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`🏷️ ${v(values, 'Marka_Uretici', 'iPrint Industrial')} - ÜRÜN KİMLİK ETİKETİ`, width / 2, pad + Math.round(22 * s));

  let curY = pad + headerH + Math.round(14 * s);

  // Model & Açıklama
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
  ctx.fillText(`MODEL: ${v(values, 'Model_Adi', 'PRO-THERMAL-Z150')}`, pad + Math.round(10 * s), curY);

  curY += Math.round(18 * s);
  ctx.font = `${Math.round(11 * s)}px sans-serif`;
  curY = wrapText(ctx, v(values, 'Urun_Aciklama', 'Endüstriyel Termal Barkod ve Sevk Yazıcısı'), pad + Math.round(10 * s), curY, width - pad * 2 - Math.round(120 * s), Math.round(15 * s));

  // Sağ Üst QR Kod (Teknik Kılavuz)
  const qrSize = Math.round(80 * s);
  const qrX = width - pad - qrSize - Math.round(10 * s);
  const qrY = pad + headerH + Math.round(10 * s);
  drawQRCodeToCanvas(ctx, v(values, 'Kullanim_Kilavuzu_Link', 'https://iprint.pro'), qrX + qrSize / 2, qrY, qrSize);
  ctx.font = `bold ${Math.round(8.5 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Kılavuz / Garanti', qrX + qrSize / 2, qrY + qrSize + Math.round(11 * s));

  // Teknik Parametreler Grid
  curY = Math.max(curY, qrY + qrSize + Math.round(16 * s));
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  curY += Math.round(14 * s);
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(10.5 * s)}px monospace`;
  ctx.fillText(`VOLTAJ: ${v(values, 'Voltaj', '100-240V AC')}`, pad + Math.round(10 * s), curY);
  ctx.fillText(`GÜÇ: ${v(values, 'Guc', '65')}W`, pad + Math.round(200 * s), curY);
  ctx.fillText(`MENŞEİ: ${v(values, 'Mensei', 'Made in Türkiye')}`, pad + Math.round(300 * s), curY);

  // Onay Kutucukları (CE, RoHS, TSE)
  curY += Math.round(20 * s);
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.fillText('ONAYLAR: [ CE ]  [ RoHS ]  [ TSE-HYB ]  [ ISO-9001:2026 ]', pad + Math.round(10 * s), curY);

  // Seri No Barkodu
  curY += Math.round(16 * s);
  const seriNo = v(values, 'Seri_No', 'SN-Z150-2026-004812');
  drawBarcodeToCanvas(ctx, seriNo, 'code128', width / 2, curY, width - pad * 2 - Math.round(30 * s), Math.round(14 * s), true);
}

export function renderPro15x10GidaBesinDeger({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = Math.round(width >= 800 ? (width * 0.67) : 380);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(2.5 * s)));

  // Üst Başlık
  const headerH = Math.round(34 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(v(values, 'Urun_Adi', 'Gurme Fıstık Ezmesi (%100 Doğal)'), width / 2, pad + Math.round(22 * s));

  let curY = pad + headerH + Math.round(12 * s);
  const midX = Math.round(width * 0.54);

  // SOL SÜTUN: İÇİNDEKİLER, ALERJEN, TARİHLER
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
  ctx.fillText(`NET MİKTAR: ${v(values, 'Net_Miktar', '400')} ${v(values, 'Birim', 'g')}`, pad + Math.round(8 * s), curY);

  curY += Math.round(16 * s);
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.fillText('İÇİNDEKİLER:', pad + Math.round(8 * s), curY);
  ctx.font = `${Math.round(9.5 * s)}px sans-serif`;
  curY = wrapText(ctx, v(values, 'Icindekiler', 'Kavrulmuş Yer Fıstığı (%100). Şeker ve koruyucu içermez.'), pad + Math.round(8 * s), curY + Math.round(12 * s), midX - pad - Math.round(16 * s), Math.round(13 * s));

  curY += Math.round(6 * s);
  ctx.font = `bold ${Math.round(9.5 * s)}px sans-serif`;
  ctx.fillText('ALERJEN UYARISI:', pad + Math.round(8 * s), curY);
  ctx.font = `${Math.round(9 * s)}px sans-serif`;
  curY = wrapText(ctx, v(values, 'Alerjenler', 'Yer fıstığı içerir. Eser miktarda sert kabuklu meyve içerebilir.'), pad + Math.round(8 * s), curY + Math.round(12 * s), midX - pad - Math.round(16 * s), Math.round(12 * s));

  curY += Math.round(8 * s);
  ctx.font = `bold ${Math.round(9.5 * s)}px monospace`;
  ctx.fillText(`İŞLETME KAYIT: ${v(values, 'Isletme_No', 'TR-34-K-098231')}`, pad + Math.round(8 * s), curY);
  curY += Math.round(14 * s);
  ctx.fillText(`TETT / SKT: ${v(values, 'TETT_Tarihi', '26.08.2027')}`, pad + Math.round(8 * s), curY);
  curY += Math.round(14 * s);
  ctx.fillText(`PARTİ NO: ${v(values, 'Parti_No', 'PE-260826-01')}`, pad + Math.round(8 * s), curY);

  // SAĞ SÜTUN: 100g BESİN DEĞERLERİ TABLOSU
  const tableY = pad + headerH + Math.round(12 * s);
  const tableW = width - midX - pad - Math.round(6 * s);

  ctx.strokeRect(midX, tableY, tableW, Math.round(130 * s));
  ctx.fillStyle = '#000000';
  ctx.fillRect(midX, tableY, tableW, Math.round(20 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(9 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('100g İÇİN BESİN DEĞERLERİ', midX + tableW / 2, tableY + Math.round(14 * s));

  const nutrition = [
    { name: 'Enerji', val: `${v(values, 'Enerji_Kcal', '588')} kcal / ${v(values, 'Enerji_Kj', '2460')} kJ` },
    { name: 'Yağ', val: `${v(values, 'Yag', '50')}g` },
    { name: ' - Doymuş Yağ', val: `${v(values, 'Doymus_Yag', '6.8')}g` },
    { name: 'Karbonhidrat', val: `${v(values, 'Karbonhidrat', '20')}g` },
    { name: ' - Şekerler', val: `${v(values, 'Seker', '4.5')}g` },
    { name: 'Protein', val: `${v(values, 'Protein', '25')}g` },
    { name: 'Tuz', val: `${v(values, 'Tuz', '0.02')}g` }
  ];

  let rY = tableY + Math.round(34 * s);
  ctx.fillStyle = '#000000';
  nutrition.forEach(n => {
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(8.5 * s)}px sans-serif`;
    ctx.fillText(n.name, midX + Math.round(6 * s), rY);
    ctx.textAlign = 'right';
    ctx.font = `bold ${Math.round(8.5 * s)}px monospace`;
    ctx.fillText(n.val, midX + tableW - Math.round(6 * s), rY);
    rY += Math.round(14 * s);
  });

  // Alt EAN Barkodu
  const barcodeY = Math.max(curY, tableY + Math.round(140 * s)) + Math.round(8 * s);
  const ean = v(values, 'Barkod_Ean', '8690123456789');
  drawBarcodeToCanvas(ctx, ean, 'ean13', width / 2, barcodeY, width - pad * 2 - Math.round(40 * s), Math.round(13 * s), true);
}

export function renderPro15x10QcMuayene({ ctx, width, canvas, values }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = Math.round(width >= 800 ? (width * 0.67) : 380);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(2.5 * s)));

  // Üst Başlık
  const headerH = Math.round(36 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('⚙️ KALİTE KONTROL & MUAYENE ONAY RAPORU', width / 2, pad + Math.round(24 * s));

  let curY = pad + headerH + Math.round(14 * s);

  // Sol Detaylar, Sağ Damga
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
  ctx.fillText(`İŞ EMRİ: ${v(values, 'Is_Emri_No', 'WO-2026-7781')}`, pad + Math.round(10 * s), curY);

  curY += Math.round(18 * s);
  ctx.fillText(`PARÇA: ${v(values, 'Parca_Adi', 'CNC Hassas Alüminyum Gövde')}`, pad + Math.round(10 * s), curY);

  curY += Math.round(18 * s);
  ctx.font = `${Math.round(11 * s)}px monospace`;
  ctx.fillText(`REV: ${v(values, 'Revizyon', '02')}  |  TARİH: ${v(values, 'Test_Tarihi', '26.08.2026')}`, pad + Math.round(10 * s), curY);

  // Sağda Büyük QC Damgası Kutusu
  const stampW = Math.round(130 * s);
  const stampH = Math.round(60 * s);
  const stampX = width - pad - stampW - Math.round(10 * s);
  const stampY = pad + headerH + Math.round(8 * s);

  ctx.lineWidth = Math.max(2, Math.round(2.5 * s));
  ctx.strokeRect(stampX, stampY, stampW, stampH);
  ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('★ QC PASSED ★', stampX + stampW / 2, stampY + Math.round(24 * s));
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.fillText('ONAYLANDI', stampX + stampW / 2, stampY + Math.round(44 * s));

  // Kontrol Kriterleri Tablosu
  curY = stampY + stampH + Math.round(14 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  curY += Math.round(14 * s);
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  const checks = [
    '• BOYUTSAL TOLERANS TESTİ: [ GEÇTİ - 0.01mm UYGUN ]',
    '• ELEKTRİKSEL VE İZOLASYON TESTİ: [ GEÇTİ - PASSED ]',
    '• GÖRSEL MUAYENE & YÜZEY TESTİ: [ KUSURSUZ - ONAYLI ]'
  ];
  checks.forEach(c => {
    ctx.fillText(c, pad + Math.round(10 * s), curY);
    curY += Math.round(16 * s);
  });

  // Operatör & Barkod
  curY += Math.round(8 * s);
  ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
  ctx.fillText(`OPERATÖR: ${v(values, 'Operator_Adi', 'Müh. Selim Çetin')}`, pad + Math.round(10 * s), curY);

  curY += Math.round(14 * s);
  const qcSeri = v(values, 'QC_Seri_No', 'QC-PASS-99042');
  drawBarcodeToCanvas(ctx, qcSeri, 'code128', width / 2, curY, width - pad * 2 - Math.round(30 * s), Math.round(14 * s), true);
}

export function renderPro10x15KargoZebra({ ctx, width, canvas, values, orientation = 'portrait', barcodeLayout = 'auto' }: ProRenderContext) {
  const isPortrait = orientation === 'portrait' || width <= 850;
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  // 10x15 cm için boy 1.5 katı (800x1200 px), yatayda 1200x800 px
  const totalH = isPortrait ? Math.round(width * 1.5) : Math.round(width * 0.67);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  // Çift çerçeve
  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(3 * s)));

  const kargoFirma = v(values, 'Kargo_Firmasi', 'Yurtiçi Kargo');
  const rotaKodu = v(values, 'Rota_Kodu', '34-KDK / İST-04');
  const takipNo = v(values, 'Takip_No', 'YK-88402914820');
  const aliciAdi = v(values, 'Alici_Adi', 'Ahmet Yılmaz');
  const aliciTel = v(values, 'Alici_Tel', '0532 999 44 22');
  const aliciAdres = v(values, 'Teslimat_Adresi', 'Atatürk Bulvarı Papatya Sokak No: 8 Daire: 4 Kadıköy / İstanbul');
  const ilceIl = `${v(values, 'Ilce', 'Kadıköy')} / ${v(values, 'Il', 'İSTANBUL')}`;
  const gonderici = v(values, 'Gonderici_Firma', 'MegaStore E-Ticaret A.Ş.');
  const siparisNo = v(values, 'Siparis_No', 'TY-2026-9948');
  const paketDesi = `${v(values, 'Paket_Adet', '1')} Adet / ${v(values, 'Desi', '3')} Desi`;
  const odemeTuru = v(values, 'Odeme_Turu', 'Gönderici Ödemeli (Peşin)');
  const icerik = v(values, 'Icerik_Ozeti', 'Zebra Termal Etiket 100x150mm Rulo, Elektronik Aksesuar');

  const isVerticalSideBarcode = barcodeLayout === 'vertical-side' || barcodeLayout === 'vertical';

  // Üst Başlık Bandı
  const headerH = Math.round(44 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(17 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`🚚 ${kargoFirma}`, pad + Math.round(12 * s), pad + Math.round(28 * s));

  ctx.textAlign = 'right';
  ctx.font = `bold ${Math.round(18 * s)}px monospace`;
  ctx.fillText(rotaKodu, width - pad - Math.round(12 * s), pad + Math.round(28 * s));

  let curY = pad + headerH + Math.round(12 * s);

  if (isVerticalSideBarcode && isPortrait) {
    // SAĞDA DİKEY BARKOD (10x15 cm Lojistik Standartı)
    const sideBarcodeWidth = Math.round(130 * s);
    const contentW = width - pad * 2 - sideBarcodeWidth - Math.round(12 * s);

    // Sağ Dikey Barkod Bölümü
    const sideX = width - pad - sideBarcodeWidth;
    ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
    ctx.beginPath();
    ctx.moveTo(sideX - Math.round(6 * s), curY);
    ctx.lineTo(sideX - Math.round(6 * s), totalH - pad - Math.round(10 * s));
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(12 * s)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`TAKİP: ${takipNo}`, sideX + sideBarcodeWidth / 2, curY + Math.round(14 * s));

    // Dikey Döndürülmüş Barkod (90°)
    const barcodeY = curY + Math.round(24 * s);
    drawBarcodeToCanvas(ctx, takipNo, 'code128', sideX + sideBarcodeWidth / 2, barcodeY, sideBarcodeWidth - Math.round(10 * s), Math.round(18 * s), true, 90);

    // Sol İçerik Alanı
    ctx.fillStyle = '#000000';
    ctx.fillRect(pad + Math.round(4 * s), curY, contentW, Math.round(24 * s));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('ALICI (TESLİMAT BİLGİSİ)', pad + Math.round(12 * s), curY + Math.round(16 * s));

    let leftY = curY + Math.round(42 * s);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(17 * s)}px sans-serif`;
    ctx.fillText(aliciAdi, pad + Math.round(8 * s), leftY);

    leftY += Math.round(22 * s);
    ctx.font = `bold ${Math.round(14 * s)}px monospace`;
    ctx.fillText(`Tel: ${aliciTel}`, pad + Math.round(8 * s), leftY);

    leftY += Math.round(20 * s);
    ctx.font = `${Math.round(13 * s)}px sans-serif`;
    leftY = wrapText(ctx, aliciAdres, pad + Math.round(8 * s), leftY, contentW - Math.round(12 * s), Math.round(18 * s));

    leftY += Math.round(8 * s);
    ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
    ctx.fillText(ilceIl, pad + Math.round(8 * s), leftY);

    // Gönderici & Paket Bilgileri
    leftY += Math.round(20 * s);
    drawDashedLine(ctx, pad + Math.round(4 * s), leftY, pad + contentW, leftY);

    leftY += Math.round(18 * s);
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(`GÖNDEREN: ${gonderici}`, pad + Math.round(8 * s), leftY);

    leftY += Math.round(20 * s);
    ctx.font = `${Math.round(12 * s)}px monospace`;
    ctx.fillText(`SİPARİŞ NO: ${siparisNo}`, pad + Math.round(8 * s), leftY);

    leftY += Math.round(18 * s);
    ctx.fillText(`PAKET/DESİ: ${paketDesi}`, pad + Math.round(8 * s), leftY);

    leftY += Math.round(18 * s);
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(`ÖDEME: ${odemeTuru}`, pad + Math.round(8 * s), leftY);

    leftY += Math.round(20 * s);
    drawDashedLine(ctx, pad + Math.round(4 * s), leftY, pad + contentW, leftY);

    leftY += Math.round(16 * s);
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('İÇERİK:', pad + Math.round(8 * s), leftY);
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    wrapText(ctx, icerik, pad + Math.round(60 * s), leftY, contentW - Math.round(68 * s), Math.round(15 * s));

    // Alt Yatay Mini Barkod (Hızlı Doğrulama)
    const bottomBarcodeY = totalH - pad - Math.round(65 * s);
    drawDashedLine(ctx, pad + Math.round(4 * s), bottomBarcodeY - Math.round(8 * s), pad + contentW, bottomBarcodeY - Math.round(8 * s));
    drawBarcodeToCanvas(ctx, siparisNo, 'code128', pad + contentW / 2, bottomBarcodeY, contentW - Math.round(20 * s), Math.round(11 * s), true, 0);

  } else {
    // KLASİK DİKEY AKIŞ (10x15 cm Tam Boy)
    ctx.fillStyle = '#000000';
    ctx.fillRect(pad + Math.round(4 * s), curY, width - pad * 2 - Math.round(8 * s), Math.round(24 * s));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('ALICI (TESLİMAT ADRESİ)', pad + Math.round(12 * s), curY + Math.round(16 * s));

    curY += Math.round(40 * s);
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(18 * s)}px sans-serif`;
    ctx.fillText(aliciAdi, pad + Math.round(10 * s), curY);

    curY += Math.round(22 * s);
    ctx.font = `bold ${Math.round(14 * s)}px monospace`;
    ctx.fillText(`Tel: ${aliciTel}`, pad + Math.round(10 * s), curY);

    curY += Math.round(20 * s);
    ctx.font = `${Math.round(13.5 * s)}px sans-serif`;
    curY = wrapText(ctx, aliciAdres, pad + Math.round(10 * s), curY, width - pad * 2 - Math.round(20 * s), Math.round(18 * s));

    curY += Math.round(6 * s);
    ctx.font = `bold ${Math.round(16 * s)}px sans-serif`;
    ctx.fillText(ilceIl, pad + Math.round(10 * s), curY);

    curY += Math.round(16 * s);
    drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

    // Gönderici & Paket Tablosu
    curY += Math.round(18 * s);
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(`GÖNDEREN: ${gonderici}`, pad + Math.round(10 * s), curY);

    curY += Math.round(20 * s);
    ctx.font = `${Math.round(12 * s)}px monospace`;
    ctx.fillText(`SİPARİŞ NO: ${siparisNo}`, pad + Math.round(10 * s), curY);
    ctx.fillText(`PAKET: ${paketDesi}`, pad + Math.round(260 * s), curY);

    curY += Math.round(20 * s);
    ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
    ctx.fillText(`ÖDEME: ${odemeTuru}`, pad + Math.round(10 * s), curY);

    curY += Math.round(20 * s);
    drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

    // Ana Takip Barkodu (Dev ve Net)
    curY += Math.round(16 * s);
    ctx.font = `bold ${Math.round(14 * s)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`TAKİP NO: ${takipNo}`, width / 2, curY);

    curY += Math.round(10 * s);
    const mainBarcodeH = Math.round(55 * s);
    drawBarcodeToCanvas(ctx, takipNo, 'code128', width / 2, curY, width - pad * 2 - Math.round(30 * s), Math.round(18 * s), true, 0);

    curY += mainBarcodeH + Math.round(30 * s);
    drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

    // İçerik ve İmza Alanı
    curY += Math.round(18 * s);
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('İÇERİK:', pad + Math.round(10 * s), curY);
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    curY = wrapText(ctx, icerik, pad + Math.round(65 * s), curY, width - pad * 2 - Math.round(80 * s), Math.round(15 * s));

    const signY = totalH - pad - Math.round(20 * s);
    ctx.font = `${Math.round(10 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Teslim Eden: .........................', pad + Math.round(12 * s), signY);
    ctx.textAlign = 'right';
    ctx.fillText('Teslim Alan / İmza: .........................', width - pad - Math.round(12 * s), signY);
  }
}

export function renderPro10x15TrendyolZebra({ ctx, width, canvas, values, orientation = 'portrait', barcodeLayout = 'auto' }: ProRenderContext) {
  const isPortrait = orientation === 'portrait' || width <= 850;
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = isPortrait ? Math.round(width * 1.5) : Math.round(width * 0.67);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(3 * s)));

  const pazaryeri = v(values, 'Pazaryeri', 'TRENDYOL');
  const kargoFirma = v(values, 'Kargo_Firmasi', 'Trendyol Express');
  const takipNo = v(values, 'Takip_No', 'TEX-9048123991');
  const siparisNo = v(values, 'Siparis_No', '8839049102');
  const musteriAdi = v(values, 'Alici_Adi', 'Selin Demir');
  const musteriTel = v(values, 'Alici_Tel', '0530 123 45 67');
  const teslimatAdres = v(values, 'Teslimat_Adresi', 'Fenerbahçe Mah. Kalamış Cad. No: 18 D: 6 Kadıköy / İstanbul');
  const saticiAdi = v(values, 'Satici_Magaza', 'iPrint Teknoloji Pazaryeri');
  const urunDetay = v(values, 'Urun_Listesi', '1 Adet Zebra 100x150 Termal Rulo\n1 Adet USB Barkod Okuyucu');

  // Üst Pazaryeri Bandı
  const headerH = Math.round(48 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(18 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`🛍️ ${pazaryeri} - ${kargoFirma}`, pad + Math.round(12 * s), pad + Math.round(30 * s));

  ctx.textAlign = 'right';
  ctx.font = `bold ${Math.round(15 * s)}px monospace`;
  ctx.fillText(`SİP: ${siparisNo}`, width - pad - Math.round(12 * s), pad + Math.round(30 * s));

  let curY = pad + headerH + Math.round(14 * s);

  // Alıcı Bilgileri
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad + Math.round(4 * s), curY, width - pad * 2 - Math.round(8 * s), Math.round(22 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('TESLİMAT ALICISI:', pad + Math.round(12 * s), curY + Math.round(15 * s));

  curY += Math.round(36 * s);
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(17 * s)}px sans-serif`;
  ctx.fillText(musteriAdi, pad + Math.round(10 * s), curY);

  curY += Math.round(20 * s);
  ctx.font = `bold ${Math.round(13 * s)}px monospace`;
  ctx.fillText(`İletişim: ${musteriTel}`, pad + Math.round(10 * s), curY);

  curY += Math.round(18 * s);
  ctx.font = `${Math.round(13 * s)}px sans-serif`;
  curY = wrapText(ctx, teslimatAdres, pad + Math.round(10 * s), curY, width - pad * 2 - Math.round(20 * s), Math.round(17 * s));

  curY += Math.round(14 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // Ana Kargo Barkodu (Büyük)
  curY += Math.round(16 * s);
  ctx.font = `bold ${Math.round(13 * s)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`KARGO TAKİP KODU: ${takipNo}`, width / 2, curY);

  curY += Math.round(10 * s);
  const mainBH = Math.round(52 * s);
  drawBarcodeToCanvas(ctx, takipNo, 'code128', width / 2, curY, width - pad * 2 - Math.round(30 * s), Math.round(18 * s), true, 0);

  curY += mainBH + Math.round(28 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // Satıcı ve Paket İçerik Tablosu
  curY += Math.round(16 * s);
  ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`SATICI: ${saticiAdi}`, pad + Math.round(10 * s), curY);

  curY += Math.round(20 * s);
  ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
  ctx.fillText('SİPARİŞ KALEMLERİ:', pad + Math.round(10 * s), curY);

  curY += Math.round(16 * s);
  ctx.font = `${Math.round(11.5 * s)}px monospace`;
  const items = urunDetay.split('\n');
  items.forEach(it => {
    ctx.fillText(`• ${it}`, pad + Math.round(12 * s), curY);
    curY += Math.round(16 * s);
  });

  // Alt Sipariş Doğrulama Barkodu
  const btmY = totalH - pad - Math.round(60 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), btmY - Math.round(10 * s), width - pad - Math.round(6 * s), btmY - Math.round(10 * s));
  drawBarcodeToCanvas(ctx, siparisNo, 'code128', width / 2, btmY, width - pad * 2 - Math.round(60 * s), Math.round(12 * s), true, 0);
}

export function renderPro10x10KareDepo({ ctx, width, canvas, values, barcodeLayout = 'auto' }: ProRenderContext) {
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  // 10x10 cm tam kare (800x800 px)
  const totalH = width;
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(3 * s)));

  const depoAdi = v(values, 'Depo_Adi', 'GEBZE ANA LOJİSTİK DEPOSU');
  const rafKodu = v(values, 'Raf_Kodu', 'RAF-A12-KAT3-GÖZ4');
  const urunAdi = v(values, 'Urun_Adi', 'Zebra Endüstriyel Termal Rulo (100x150)');
  const stokKodu = v(values, 'Stok_Kodu', 'STK-990412');
  const partiLot = v(values, 'Parti_Lot', 'LOT-2608-01');
  const adet = `${v(values, 'Miktar', '250')} ${v(values, 'Birim', 'Adet')}`;

  // Başlık
  const headerH = Math.round(40 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`📦 ${depoAdi}`, width / 2, pad + Math.round(26 * s));

  // Dev Raf / Lokasyon Kutusu (Göz Alıcı)
  let curY = pad + headerH + Math.round(14 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad + Math.round(10 * s), curY, width - pad * 2 - Math.round(20 * s), Math.round(48 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(20 * s)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(rafKodu, width / 2, curY + Math.round(32 * s));

  curY += Math.round(62 * s);
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`ÜRÜN: ${urunAdi}`, pad + Math.round(12 * s), curY);

  curY += Math.round(22 * s);
  ctx.font = `bold ${Math.round(13 * s)}px monospace`;
  ctx.fillText(`STOK KODU: ${stokKodu}`, pad + Math.round(12 * s), curY);
  ctx.fillText(`MİKTAR: ${adet}`, pad + Math.round(240 * s), curY);

  curY += Math.round(20 * s);
  ctx.fillText(`LOT / PARTİ: ${partiLot}`, pad + Math.round(12 * s), curY);

  curY += Math.round(16 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // Büyük Stok Barkodu
  curY += Math.round(16 * s);
  ctx.font = `bold ${Math.round(12 * s)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`BARKOD: ${stokKodu}`, width / 2, curY);

  curY += Math.round(10 * s);
  const bRotation = (barcodeLayout === 'vertical' || barcodeLayout === 'vertical-side') ? 90 : 0;
  drawBarcodeToCanvas(ctx, stokKodu, 'code128', width / 2, curY, width - pad * 2 - Math.round(40 * s), Math.round(18 * s), true, bRotation);
}

export function renderPro10x15Gs1Lojistik({ ctx, width, canvas, values, orientation = 'portrait', barcodeLayout = 'auto' }: ProRenderContext) {
  const isPortrait = orientation === 'portrait' || width <= 850;
  const s = width > 450 ? Math.min(2.8, Math.max(1, (width / 384) * 0.95)) : 1;
  const pad = Math.round(10 * s);
  const totalH = isPortrait ? Math.round(width * 1.5) : Math.round(width * 0.67);
  canvas.width = width;
  canvas.height = totalH;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, totalH);

  drawFrame(ctx, pad, totalH, width, Math.max(2, Math.round(3 * s)));

  const sscc = v(values, 'SSCC_No', '386901234567890128');
  const gonderen = v(values, 'Gonderen_Tesis', 'Gebze Ana Lojistik Merkezi');
  const hedef = v(values, 'Hedef_Depo', 'İzmir Dağıtım Antreposu');
  const brutKg = `${v(values, 'Brut_Agirlik', '485')} KG`;
  const netKg = `${v(values, 'Net_Agirlik', '460')} KG`;
  const koliAdet = `${v(values, 'Koli_Adet', '36')} Koli`;
  const partiLot = v(values, 'Parti_Lot', 'LOT-2026-88');
  const uyari = v(values, 'Uyari_Notu', '⬆️ ÜST ÜSTE İSTİFLEME YAPMAYINIZ');

  // Başlık
  const headerH = Math.round(44 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad, pad, width - pad * 2, headerH);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(16 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('📦 GS1-128 PALET & LOJİSTİK SEVKİYAT', width / 2, pad + Math.round(28 * s));

  let curY = pad + headerH + Math.round(16 * s);

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'left';
  ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
  ctx.fillText(`ÇIKIŞ TESİSİ: ${gonderen}`, pad + Math.round(12 * s), curY);

  curY += Math.round(22 * s);
  ctx.fillText(`HEDEF DEPO: ${hedef}`, pad + Math.round(12 * s), curY);

  curY += Math.round(16 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // 4'lü Metrik Tablosu
  curY += Math.round(16 * s);
  const colW = (width - pad * 2 - Math.round(20 * s)) / 4;
  const metrics = [
    { title: 'BRÜT KG', val: brutKg },
    { title: 'NET KG', val: netKg },
    { title: 'KOLİ ADEDİ', val: koliAdet },
    { title: 'PARTİ / LOT', val: partiLot }
  ];

  metrics.forEach((m, idx) => {
    const bx = pad + Math.round(10 * s) + idx * colW;
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx, curY, colW - Math.round(6 * s), Math.round(22 * s));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(m.title, bx + (colW - Math.round(6 * s)) / 2, curY + Math.round(16 * s));

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(13 * s)}px monospace`;
    ctx.fillText(m.val, bx + (colW - Math.round(6 * s)) / 2, curY + Math.round(44 * s));
  });

  curY += Math.round(58 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), curY, width - pad - Math.round(6 * s), curY);

  // Uyarı Bandı
  curY += Math.round(16 * s);
  ctx.fillStyle = '#000000';
  ctx.fillRect(pad + Math.round(10 * s), curY, width - pad * 2 - Math.round(20 * s), Math.round(28 * s));
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(12 * s)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(uyari, width / 2, curY + Math.round(19 * s));

  // Dev SSCC-18 Barkodu
  curY += Math.round(42 * s);
  ctx.fillStyle = '#000000';
  ctx.font = `bold ${Math.round(13 * s)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`SSCC: (00) ${sscc}`, width / 2, curY);

  curY += Math.round(12 * s);
  drawBarcodeToCanvas(ctx, sscc, 'code128', width / 2, curY, width - pad * 2 - Math.round(40 * s), Math.round(22 * s), false, 0);

  // Alt İkincil Doğrulama Barkodu
  const btmY = totalH - pad - Math.round(60 * s);
  drawDashedLine(ctx, pad + Math.round(6 * s), btmY - Math.round(10 * s), width - pad - Math.round(6 * s), btmY - Math.round(10 * s));
  drawBarcodeToCanvas(ctx, `(10)${partiLot}`, 'code128', width / 2, btmY, width - pad * 2 - Math.round(60 * s), Math.round(12 * s), true, 0);
}

// ==========================================
// RENDERER HARİTASI (TÜM ŞABLONLAR İÇİN)
// ==========================================

export const PRO_CUSTOM_RENDERERS: Record<string, (ctx: ProRenderContext) => void> = {
  // 10x15 & 10x10 & 15x10 Zebra / Endüstriyel
  'pro-10x15-kargo-zebra': renderPro10x15KargoZebra,
  'pro-10x15-trendyol-pazaryeri': renderPro10x15TrendyolZebra,
  'pro-10x10-kare-depo': renderPro10x10KareDepo,
  'pro-10x15-gs1-lojistik-dikey': renderPro10x15Gs1Lojistik,
  'pro-15x10-kargo-pazaryeri': renderPro15x10KargoPazaryeri,
  'pro-15x10-palet-lojistik': renderPro15x10PaletLojistik,
  'pro-15x10-urun-kimlik': renderPro15x10UrunKimlik,
  'pro-15x10-gida-besin-deger': renderPro15x10GidaBesinDeger,
  'pro-15x10-qc-muayene': renderPro15x10QcMuayene,
  // Lojistik & Kargo
  'pro-kargo-gonderi': renderProKargoGonderi,
  'pro-iade-etiket': renderProIadeEtiket,
  'pro-palet-nakliye': renderProPaletNakliye,
  'pro-sevk-irsaliye': renderProSevkIrsaliye,

  // Depo & Stok
  'pro-raf-konum': renderProRafKonum,
  'pro-parti-skt': renderProPartiSkt,
  'pro-stok-sayim': renderProStokSayim,
  'pro-depo-transfer': renderProDepoTransfer,

  // Mağaza & Perakende
  'pro-agirlik-etiket': renderProAgirlikEtiket,
  'pro-hediye-ceki': renderProHediyeCeki,
  'pro-fis-kdv': renderProFisKdv,
  'pro-vintage-etiket': renderProVintageEtiket,
  'pro-taki-aksesuar': renderProTakiAksesuar,

  // Elektronik & Servis
  'pro-seri-imei': renderProSeriImei,
  'pro-qc-test': renderProQcTest,
  'pro-teknik-bakim': renderProTeknikBakim,

  // Organizasyon & Sosyal
  'pro-qr-masa': renderProQrMasa,

  // Sarf & Özel İşlemler
  'pro-picking-satir': renderProPickingSatir,
  'pro-numune-etiket': renderProNumuneEtiket,
  'pro-sarf-kutu': renderProSarfKutu,
  'pro-reklamasyon-fis': renderProReklamasyonFis,

  // Eğitim & Okul (YENİ)
  'pro-okul-defter': renderProOkulDefter,
  'pro-kitap-ayraci': renderProKitapAyraci,
  'pro-sinav-soru': renderProSinavSoru,

  // Kafe & Butik Gıda (YENİ)
  'pro-kahve-siparis': renderProKahveSiparis,
  'pro-tatli-icerik': renderProTatliIcerik,
  'pro-kavanoz-recel': renderProKavanozRecel,
  'pro-kahve-cekirdek': renderProKahveCekirdek,

  // Bitki & Bahçe (YENİ)
  'pro-bitki-bakim': renderProBitkiBakim,
  'pro-tohum-paket': renderProTohumPaket,

  // Etkinlik & Bilet (YENİ)
  'pro-konser-bilet': renderProKonserBilet,
  'pro-sinema-bilet': renderProSinemaBilet,
  'pro-parti-davetiye': renderProPartiDavetiye,

  // Seyahat & Gezi (YENİ)
  'pro-valiz-etiket': renderProValizEtiket,
  'pro-otel-kapi': renderProOtelKapi,

  // Sağlık & Yaşam (YENİ)
  'pro-su-takip': renderProSuTakip,
  'pro-fitness-log': renderProFitnessLog,
  'pro-ilac-takip': renderProIlacTakip,

  // Evcil Hayvan (YENİ)
  'pro-pet-tasma': renderProPetTasma,
  'pro-veteriner-asi': renderProVeterinerAsi,

  // Oto & Araç Bakım (YENİ)
  'pro-oto-yag-degisim': renderProOtoYagDegisim,
  'pro-otopark-vale': renderProOtoparkVale
};
