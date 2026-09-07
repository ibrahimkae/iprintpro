import bwipjs from 'bwip-js';
import { BarcodeArchiveRecord } from './barcode-archive-storage';
import { logger } from './logger';

export interface RenderArchiveLabelOptions {
  width?: number; // 384 (57mm), 576 (80mm), 800 (10x15)
  showItemsList?: boolean; // Etikette maddeler basılsın mı
  maxItemsToShow?: number; // Kaç maddeye kadar basılsın
}

/**
 * İçerik Arşivi (Koli / Kutu / Depo) için yüksek kaliteli siyah-beyaz termal etiket canvas'ı üretir.
 * 2 Mod Destekler:
 * 1. Sade Mod (showItemsList = false): Sadece Barkod/QR, kod numarası ve özel arşiv işareti. (Aşırı kompakt, kağıt tasarruflu).
 * 2. İçerikli Mod (showItemsList = true): Başlık, özel arşiv işareti, Barkod/QR ve koli içi maddeler listesi.
 */
export async function renderArchiveLabel(
  record: BarcodeArchiveRecord,
  options: RenderArchiveLabelOptions = {}
): Promise<string | null> {
  try {
    const width = options.width || 384;
    const showItems = options.showItemsList !== undefined ? options.showItemsList : (record.hideItemsOnLabel ? false : true);
    const scaleFactor = width / 384;
    const pad = Math.round(12 * scaleFactor);

    // 1. QR veya Barkod Kodunu bwipjs ile çiz
    const codeCanvas = document.createElement('canvas');
    if (record.codeType === 'qr') {
      bwipjs.toCanvas(codeCanvas, {
        bcid: 'qrcode',
        text: record.code,
        scale: Math.max(3, Math.round(3.8 * scaleFactor)),
        paddingwidth: 1,
        paddingheight: 1
      });
    } else {
      const bType = record.barcodeFormat || 'code128';
      const effectiveBcid = (bType === 'ean13' && !/^\d{12,13}$/.test(record.code)) ? 'code128' : bType;
      bwipjs.toCanvas(codeCanvas, {
        bcid: effectiveBcid,
        text: record.code,
        scale: Math.max(2, Math.round(2.5 * scaleFactor)),
        height: Math.round(18 * scaleFactor),
        includetext: true,
        textsize: Math.round(11 * scaleFactor),
        textxalign: 'center',
        paddingwidth: 2
      });
    }

    // 2. Yükseklik Hesaplama
    let calculatedHeight = pad * 2;

    if (!showItems) {
      // SADE MOD (Sadece Barkod ve Numara + Özel Arşiv İşareti)
      // Üst özel işaret rozeti
      calculatedHeight += Math.round(18 * scaleFactor);
      // Barkod / QR alanı
      calculatedHeight += codeCanvas.height + Math.round(8 * scaleFactor);
      // QR ise kod numarası satırı
      if (record.codeType === 'qr') {
        calculatedHeight += Math.round(18 * scaleFactor);
      }
      calculatedHeight += Math.round(6 * scaleFactor);
    } else {
      // İÇERİKLİ MOD (Başlık + Barkod/QR + Koli İçeriği)
      // Başlık & Özel Arşiv İşareti alanı
      calculatedHeight += Math.round(34 * scaleFactor);
      // Barkod / QR alanı
      calculatedHeight += codeCanvas.height + Math.round(10 * scaleFactor);
      // QR ise kod metni
      if (record.codeType === 'qr') {
        calculatedHeight += Math.round(16 * scaleFactor);
      }
      // İçerik listesi alanı
      const visibleItems = record.items.slice(0, options.maxItemsToShow || 12);
      if (visibleItems.length > 0) {
        calculatedHeight += Math.round(24 * scaleFactor); // Liste başlığı
        calculatedHeight += visibleItems.length * Math.round(18 * scaleFactor);
        if (record.items.length > visibleItems.length) {
          calculatedHeight += Math.round(16 * scaleFactor);
        }
      }
      calculatedHeight += Math.round(18 * scaleFactor); // Alt ince tarih çizgisi
    }

    // Canvas oluştur
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = calculatedHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Arka planı temiz beyaz yap
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, calculatedHeight);

    // Çerçeve (Minimalist net tek çizgi)
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scaleFactor));
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(pad / 2, pad / 2, width - pad, calculatedHeight - pad);

    let currentY = pad + Math.round(6 * scaleFactor);

    if (!showItems) {
      // ==========================================
      // 1. SADE MOD (Sadece Barkod ve Numara)
      // ==========================================
      // Özel Arşiv İşareti (Zarif & Minimalist Rozet)
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(9.5 * scaleFactor)}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('▣ ARŞİV', width - pad - 4, currentY + Math.round(8 * scaleFactor));
      
      // Sol tarafta minik bir nokta
      ctx.textAlign = 'left';
      ctx.fillText('●', pad + 4, currentY + Math.round(8 * scaleFactor));
      
      currentY += Math.round(14 * scaleFactor);

      // Barkod / QR Çizimi
      const codeX = Math.round((width - codeCanvas.width) / 2);
      ctx.drawImage(codeCanvas, codeX, currentY);
      currentY += codeCanvas.height + Math.round(6 * scaleFactor);

      // QR ise kod numarasını altına yaz
      if (record.codeType === 'qr') {
        ctx.font = `bold ${Math.round(12 * scaleFactor)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(record.code, width / 2, currentY + Math.round(10 * scaleFactor));
      }
    } else {
      // ==========================================
      // 2. İÇERİKLİ MOD (Başlık + Barkod + Koli İçeriği)
      // ==========================================
      // Üst Başlık ve Özel Arşiv İşareti
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.round(14 * scaleFactor)}px "Plus Jakarta Sans", sans-serif`;
      
      let titleStr = record.title.toUpperCase();
      if (titleStr.length > 22) titleStr = titleStr.slice(0, 20) + '..';
      ctx.fillText(titleStr, pad + 4, currentY + Math.round(12 * scaleFactor));

      // Sağ tarafta özel arşiv rozeti
      ctx.font = `bold ${Math.round(9.5 * scaleFactor)}px monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('▣ ARŞİV', width - pad - 4, currentY + Math.round(12 * scaleFactor));

      currentY += Math.round(18 * scaleFactor);

      // İnce ayırıcı çizgi
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(pad, currentY);
      ctx.lineTo(width - pad, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      currentY += Math.round(8 * scaleFactor);

      // Barkod / QR Çizimi
      const codeX = Math.round((width - codeCanvas.width) / 2);
      ctx.drawImage(codeCanvas, codeX, currentY);
      currentY += codeCanvas.height + Math.round(6 * scaleFactor);

      // QR ise kod numarasını altına yaz
      if (record.codeType === 'qr') {
        ctx.font = `bold ${Math.round(11 * scaleFactor)}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(record.code, width / 2, currentY + Math.round(8 * scaleFactor));
        currentY += Math.round(14 * scaleFactor);
      }

      // İçerik Listesi Bölümü
      const visibleItems = record.items.slice(0, options.maxItemsToShow || 12);
      if (visibleItems.length > 0) {
        // İnce liste çizgisi
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(pad, currentY);
        ctx.lineTo(width - pad, currentY);
        ctx.stroke();
        ctx.setLineDash([]);
        currentY += Math.round(12 * scaleFactor);

        ctx.textAlign = 'left';
        ctx.font = `bold ${Math.round(10.5 * scaleFactor)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillText(`KOLİ İÇERİĞİ (${record.items.length}):`, pad + 4, currentY);
        currentY += Math.round(14 * scaleFactor);

        // Kalemler
        for (const item of visibleItems) {
          ctx.font = `normal ${Math.round(10 * scaleFactor)}px "Plus Jakarta Sans", sans-serif`;
          const checkMark = item.checked ? '☑ ' : '☐ ';
          const qtyStr = item.quantity ? ` (${item.quantity})` : '';
          let itemLine = `${checkMark}${item.name}${qtyStr}`;

          if (itemLine.length > 34) {
            itemLine = itemLine.slice(0, 32) + '..';
          }
          ctx.fillText(itemLine, pad + 6, currentY);
          currentY += Math.round(16 * scaleFactor);
        }

        if (record.items.length > visibleItems.length) {
          ctx.font = `italic ${Math.round(9 * scaleFactor)}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText(`... ve ${record.items.length - visibleItems.length} diğer öğe`, pad + 6, currentY);
          currentY += Math.round(14 * scaleFactor);
        }
      }

      // Alt sade dipnot
      const dateStr = new Date(record.createdAt).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      ctx.font = `normal ${Math.round(8.5 * scaleFactor)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`iPrint Arşiv • ${dateStr}`, width / 2, currentY + Math.round(8 * scaleFactor));
    }

    return canvas.toDataURL('image/png');
  } catch (err) {
    logger.error('Failed to render archive label', err);
    return null;
  }
}
