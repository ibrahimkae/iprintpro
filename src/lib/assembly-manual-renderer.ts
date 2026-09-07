/**
 * Assembly Manual Canvas Renderer
 * Kurulum şeması verilerini termal yazıcıya uygun yüksek kontrastlı monokrom canvas'a çizer.
 */

import bwipjs from 'bwip-js';
import { AssemblyManualData, AssemblyStepBlock, HardwareItem } from './assembly-presets';

export async function renderAssemblyManualToCanvas(
  data: AssemblyManualData,
  targetWidth?: number,
  targetHeight?: number,
  isAutoHeight?: boolean
): Promise<HTMLCanvasElement> {
  const width = targetWidth || data.paperWidthPreset || 576;
  const isContinuousRoll = isAutoHeight !== undefined ? isAutoHeight : (data.isAutoHeight ?? (data.paperHeightPreset ? false : true));
  const requestedHeight = targetHeight !== undefined ? targetHeight : (data.paperHeightPreset || 0);

  const pad = Math.max(10, Math.round(width * 0.03)); // %3 kenar boşluğu (min 10px)
  const contentWidth = width - pad * 2;
  const scale = Math.max(0.92, width / 576);

  // FONT BOYUTU HİYERARŞİSİ (Referans Başlık: 18px * scale)
  const fontRefHeader = Math.round(17 * scale);      // %100 Başlık
  const fontSubTitle = Math.round(13 * scale);       // %75 Alt Başlık
  const fontSectionHeader = Math.round(13.5 * scale); // %78 Kısım Başlığı
  const fontBodyText = Math.round(11 * scale);       // %61 Açıklama
  const fontMinText = Math.round(9.5 * scale);       // %53 Rozet & Dipnot

  // Offscreen canvas context for accurate height pre-measurement
  const dummyCanvas = document.createElement('canvas');
  const dummyCtx = dummyCanvas.getContext('2d');

  // 1. ADIM: Dinamik Yükseklik Pre-Calculation (Piksel Hassasiyetli)
  let estimatedHeight = pad;

  // Header Yüksekliği
  if (data.logoDataUrl || data.logoText) {
    estimatedHeight += Math.round(36 * scale);
  }
  if (dummyCtx) {
    dummyCtx.font = `900 ${fontRefHeader}px sans-serif`;
    const titleLines = wrapText(dummyCtx, data.title || 'KURULUM KILAVUZU', contentWidth - Math.round(8 * scale));
    estimatedHeight += titleLines.length * Math.round(22 * scale) + Math.round(4 * scale);

    if (data.subTitle) {
      dummyCtx.font = `bold ${fontSubTitle}px sans-serif`;
      const subLines = wrapText(dummyCtx, data.subTitle, contentWidth - Math.round(8 * scale));
      estimatedHeight += subLines.length * Math.round(17 * scale) + Math.round(4 * scale);
    }
  } else {
    estimatedHeight += Math.round(60 * scale);
  }
  estimatedHeight += Math.round(18 * scale); // Çift çizgi ve alt boşluk

  // Blok Yükseklikleri
  for (const block of data.blocks) {
    if (block.type === 'image') {
      const h = Math.round((block.imageHeight || 240) * scale);
      estimatedHeight += h + Math.round(16 * scale);
    } else if (block.type === 'text') {
      let blockH = 0;
      if (block.stepNumber && block.stepTitle && dummyCtx) {
        dummyCtx.font = `900 ${fontSectionHeader}px sans-serif`;
        const stepTextW = dummyCtx.measureText(block.stepNumber).width + Math.round(14 * scale);
        const titleAvailW = contentWidth - stepTextW - Math.round(8 * scale);
        const stepTitleLines = wrapText(dummyCtx, block.stepTitle, titleAvailW);
        blockH += Math.max(Math.round(24 * scale), stepTitleLines.length * Math.round(18 * scale)) + Math.round(6 * scale);
      } else if (block.stepNumber) {
        blockH += Math.round(26 * scale);
      } else if (block.stepTitle && dummyCtx) {
        dummyCtx.font = `900 ${fontSectionHeader}px sans-serif`;
        const stepTitleLines = wrapText(dummyCtx, block.stepTitle, contentWidth);
        blockH += stepTitleLines.length * Math.round(18 * scale) + Math.round(6 * scale);
      }

      if (block.stepDescription && dummyCtx) {
        dummyCtx.font = `bold ${fontBodyText}px sans-serif`;
        const lines = wrapText(dummyCtx, block.stepDescription, contentWidth);
        blockH += lines.length * Math.round(16 * scale) + Math.round(6 * scale);
      }
      if (block.tipText && dummyCtx) {
        dummyCtx.font = `bold ${fontMinText}px sans-serif`;
        const tipLines = wrapText(dummyCtx, block.tipText, contentWidth - Math.round(18 * scale));
        blockH += Math.round(10 * scale) + tipLines.length * Math.round(14 * scale) + Math.round(6 * scale);
      }
      estimatedHeight += blockH + Math.round(10 * scale);
    } else if (block.type === 'hardware_grid') {
      const items = block.hardwareItems || [];
      const rows = Math.ceil(items.length / 2);
      const rowHeight = Math.round(72 * scale);
      estimatedHeight += Math.round(24 * scale) + rows * (rowHeight + Math.round(8 * scale)) + Math.round(12 * scale);
    } else if (block.type === 'qr_block') {
      const qrSize = Math.round(contentWidth * 0.42);
      const qrBoxH = Math.max(qrSize + Math.round(16 * scale), Math.round(85 * scale));
      estimatedHeight += qrBoxH + Math.round(16 * scale);
    } else if (block.type === 'barcode') {
      estimatedHeight += Math.round(105 * scale) + Math.round(14 * scale);
    } else if (block.type === 'divider') {
      estimatedHeight += Math.round(16 * scale);
    }
  }

  // Footer Yüksekliği
  estimatedHeight += Math.round(16 * scale);
  if (data.supportPhone) estimatedHeight += Math.round(22 * scale);
  if (data.footerNote && dummyCtx) {
    dummyCtx.font = `bold italic ${fontMinText}px sans-serif`;
    const noteLines = wrapText(dummyCtx, data.footerNote, contentWidth);
    estimatedHeight += noteLines.length * Math.round(14 * scale) + Math.round(6 * scale);
  }
  if (data.showFooterLogo !== false && data.logoText) estimatedHeight += Math.round(18 * scale);
  estimatedHeight += pad + Math.round(20 * scale);

  // 2. ADIM: Geniş Güvenlik Paylı Çalışma Tuvali Oluşturma
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.max(350, Math.ceil(estimatedHeight + 250));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Saf Beyaz Zemin
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, canvas.height);

  let curY = pad;

  // === HEADER ÇİZİMİ ===
  // Marka Logosu / Metni
  if (data.logoDataUrl) {
    try {
      const logoImg = await loadImage(data.logoDataUrl);
      const logoMaxH = Math.round(38 * scale);
      const logoScale = Math.min((contentWidth * 0.65) / logoImg.width, logoMaxH / logoImg.height);
      const lw = Math.round(logoImg.width * logoScale);
      const lh = Math.round(logoImg.height * logoScale);
      ctx.drawImage(logoImg, Math.round((width - lw) / 2), curY, lw, lh);
      curY += lh + Math.round(6 * scale);
    } catch {
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `900 ${fontSectionHeader}px sans-serif`;
      ctx.fillText(data.logoText || 'MONTAJ KILAVUZU', width / 2, curY + Math.round(14 * scale));
      curY += Math.round(20 * scale);
    }
  } else if (data.logoText) {
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `900 ${fontSectionHeader}px sans-serif`;
    ctx.fillText(`★ ${data.logoText.toUpperCase()} ★`, width / 2, curY + Math.round(14 * scale));
    curY += Math.round(20 * scale);
  }

  // Ürün Adı / Başlığı (Taşmasız Çok Satırlı Ortalanmış Başlık)
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = `900 ${fontRefHeader}px sans-serif`;
  const titleLines = wrapText(ctx, (data.title || 'KURULUM KILAVUZU').trim(), contentWidth - Math.round(8 * scale));
  for (const line of titleLines) {
    ctx.fillText(line, width / 2, curY + Math.round(16 * scale));
    curY += Math.round(22 * scale);
  }
  curY += Math.round(4 * scale);

  // Model / Ölçü Alt Başlığı (%75 Boyut)
  if (data.subTitle) {
    ctx.font = `bold ${fontSubTitle}px sans-serif`;
    ctx.textAlign = 'center';
    const subLines = wrapText(ctx, data.subTitle.trim(), contentWidth - Math.round(8 * scale));
    for (const sline of subLines) {
      ctx.fillText(sline, width / 2, curY + Math.round(12 * scale));
      curY += Math.round(17 * scale);
    }
    curY += Math.round(4 * scale);
  }

  // Çift Ayırıcı Kılavuz Çizgi (Tam Pad Sınırları İçinde)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(1.5, Math.round(2 * scale));
  ctx.beginPath();
  ctx.moveTo(pad, curY);
  ctx.lineTo(width - pad, curY);
  ctx.stroke();

  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, curY + Math.round(3.5 * scale));
  ctx.lineTo(width - pad, curY + Math.round(3.5 * scale));
  ctx.stroke();

  curY += Math.round(14 * scale);

  // === BLOKLARI ÇİZME ===
  for (const block of data.blocks) {
    if (block.type === 'image') {
      const h = Math.round((block.imageHeight || 240) * scale);

      // Çerçeve
      if (block.hasBorder !== false) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
        if (block.borderStyle === 'dashed') {
          ctx.setLineDash([5 * scale, 4 * scale]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.strokeRect(pad, curY, contentWidth, h);
        ctx.setLineDash([]);
      }

      // Görsel Varsa Çiz
      if (block.imageDataUrl) {
        try {
          const img = await loadImage(block.imageDataUrl);
          const innerPad = Math.round(6 * scale);
          const badgeOffset = block.badgeText ? Math.round(20 * scale) : 0;
          const drawAreaW = contentWidth - innerPad * 2;
          const drawAreaH = h - innerPad * 2 - badgeOffset;

          const imgScale = Math.min(drawAreaW / img.width, drawAreaH / img.height);
          const dw = Math.round(img.width * imgScale);
          const dh = Math.round(img.height * imgScale);
          const dx = pad + Math.round((contentWidth - dw) / 2);
          const dy = curY + innerPad + Math.round((drawAreaH - dh) / 2);

          ctx.drawImage(img, dx, dy, dw, dh);
        } catch (e) {
          console.warn('Görsel çizilemedi:', e);
        }
      } else {
        ctx.fillStyle = '#666666';
        ctx.font = `italic ${fontMinText}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('[ Kurulum Şeması / Ürün Görseli Ekle ]', width / 2, curY + h / 2);
      }

      // Alt Rozet ("ŞEKİL 1: AYAK MONTAJI")
      if (block.badgeText) {
        const badgeH = Math.round(20 * scale);
        const badgeY = curY + h - badgeH - Math.round(4 * scale);

        ctx.fillStyle = '#000000';
        ctx.fillRect(pad + Math.round(6 * scale), badgeY, contentWidth - Math.round(12 * scale), badgeH);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 ${fontMinText}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(block.badgeText.toUpperCase(), width / 2, badgeY + Math.round(13.5 * scale));
      }

      curY += h + Math.round(14 * scale);

    } else if (block.type === 'text') {
      // Adım Numarası Rozeti & Başlık (%78 Boyut)
      if (block.stepNumber && block.stepTitle) {
        ctx.font = `900 ${fontSectionHeader}px sans-serif`;
        const stepTextW = ctx.measureText(block.stepNumber).width + Math.round(14 * scale);
        const badgeH = Math.round(22 * scale);

        // Adım Rozeti
        ctx.fillStyle = '#000000';
        ctx.fillRect(pad, curY, stepTextW, badgeH);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(block.stepNumber, pad + stepTextW / 2, curY + Math.round(15.5 * scale));

        // Başlık Metni (Taşmasız Wrap)
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        const titleAvailW = contentWidth - stepTextW - Math.round(8 * scale);
        const stepTitleLines = wrapText(ctx, block.stepTitle, titleAvailW);
        let stY = curY + Math.round(15.5 * scale);
        for (const stLine of stepTitleLines) {
          ctx.fillText(stLine, pad + stepTextW + Math.round(8 * scale), stY);
          stY += Math.round(18 * scale);
        }
        curY += Math.max(badgeH + Math.round(6 * scale), stepTitleLines.length * Math.round(18 * scale) + Math.round(4 * scale));
      } else if (block.stepNumber) {
        ctx.font = `900 ${fontSectionHeader}px sans-serif`;
        const stepTextW = ctx.measureText(block.stepNumber).width + Math.round(14 * scale);
        const badgeH = Math.round(22 * scale);

        ctx.fillStyle = '#000000';
        ctx.fillRect(pad, curY, stepTextW, badgeH);

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(block.stepNumber, pad + stepTextW / 2, curY + Math.round(15.5 * scale));
        curY += badgeH + Math.round(8 * scale);
      } else if (block.stepTitle) {
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.font = `900 ${fontSectionHeader}px sans-serif`;
        const stepTitleLines = wrapText(ctx, block.stepTitle, contentWidth);
        for (const stLine of stepTitleLines) {
          ctx.fillText(stLine, pad, curY + Math.round(14 * scale));
          curY += Math.round(18 * scale);
        }
        curY += Math.round(4 * scale);
      }

      // Adım Açıklaması (%61 Boyut - Taşmayan Hassas Satır Kaydırma)
      if (block.stepDescription) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${fontBodyText}px sans-serif`;
        ctx.textAlign = 'left';
        const lines = wrapText(ctx, block.stepDescription, contentWidth);
        for (const line of lines) {
          ctx.fillText(line, pad, curY + Math.round(12 * scale));
          curY += Math.round(16 * scale);
        }
        curY += Math.round(4 * scale);
      }

      // Önemli İpucu Kutusu (%53 Boyut)
      if (block.tipText) {
        ctx.font = `bold ${fontMinText}px sans-serif`;
        const tipLines = wrapText(ctx, `💡 İPUCU: ${block.tipText}`, contentWidth - Math.round(18 * scale));
        const tipH = Math.round(10 * scale) + tipLines.length * Math.round(14 * scale);

        ctx.fillStyle = '#F8F8F8';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, Math.round(1.2 * scale));
        ctx.fillRect(pad, curY, contentWidth, tipH);
        ctx.strokeRect(pad, curY, contentWidth, tipH);

        ctx.fillStyle = '#000000';
        let tipY = curY + Math.round(12.5 * scale);
        for (const tline of tipLines) {
          ctx.fillText(tline, pad + Math.round(8 * scale), tipY);
          tipY += Math.round(14 * scale);
        }
        curY += tipH + Math.round(6 * scale);
      }

      curY += Math.round(8 * scale);

    } else if (block.type === 'hardware_grid') {
      // DONANIM / VİDA PAKETİ GRİD (%78 Başlık, %61 Adet, %53 İsim)
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${fontSectionHeader}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('🔩 MONTAJ PARÇALARI & VİDA LİSTESİ', pad, curY + Math.round(14 * scale));
      curY += Math.round(20 * scale);

      const items = block.hardwareItems || [];
      const colGap = Math.round(6 * scale);
      const colW = Math.floor((contentWidth - colGap) / 2);
      const cellH = Math.round(68 * scale);

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cellX = pad + col * (colW + colGap);
        const cellY = curY + row * (cellH + Math.round(6 * scale));

        // Kutucuk Çerçevesi
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, Math.round(1.2 * scale));
        ctx.strokeRect(cellX, cellY, colW, cellH);

        // Kod Rozeti (A, B, C, D)
        const codeW = Math.round(20 * scale);
        ctx.fillStyle = '#000000';
        ctx.fillRect(cellX, cellY, codeW, Math.round(18 * scale));
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 ${fontMinText}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(item.code || String.fromCharCode(65 + i), cellX + codeW / 2, cellY + Math.round(13 * scale));

        // Adet Rozeti (Sağ Üst: "8 Adet" / "x8")
        ctx.fillStyle = '#000000';
        ctx.font = `900 ${fontMinText}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(item.count || '1 Adet', cellX + colW - Math.round(5 * scale), cellY + Math.round(14 * scale));

        // İkon veya Çizim (Sol Kısım)
        const iconAreaW = Math.round(40 * scale);
        const iconAreaH = cellH - Math.round(8 * scale);
        if (item.dataUrl || item.iconSvg) {
          try {
            const iconImg = await loadImage(item.dataUrl || (item.iconSvg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.iconSvg)}` : ''));
            const iscale = Math.min(iconAreaW / iconImg.width, iconAreaH / iconImg.height);
            const iw = Math.round(iconImg.width * iscale);
            const ih = Math.round(iconImg.height * iscale);
            ctx.drawImage(iconImg, cellX + Math.round(4 * scale), cellY + Math.round((cellH - ih) / 2) + Math.round(2 * scale), iw, ih);
          } catch {
            // Pas geç
          }
        }

        // Parça Adı Metni (Taşmasız wrapText)
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.font = `bold ${fontMinText}px sans-serif`;
        const textX = cellX + iconAreaW + Math.round(4 * scale);
        const maxTextW = colW - iconAreaW - Math.round(6 * scale);
        const nameLines = wrapText(ctx, item.name || 'Montaj Parçası', maxTextW);

        let nameY = cellY + Math.round(32 * scale);
        for (let l = 0; l < Math.min(2, nameLines.length); l++) {
          ctx.fillText(nameLines[l], textX, nameY);
          nameY += Math.round(13 * scale);
        }
      }

      const totalRows = Math.ceil(items.length / 2);
      curY += totalRows * (cellH + Math.round(6 * scale)) + Math.round(10 * scale);

    } else if (block.type === 'qr_block') {
      // QR KOD KUTUSU (%42 Genişlik, Düzgün Yan Metinler)
      const qrSize = Math.round(contentWidth * 0.42);
      const qrBoxH = Math.max(qrSize + Math.round(16 * scale), Math.round(85 * scale));

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
      ctx.strokeRect(pad, curY, contentWidth, qrBoxH);

      // QR Kod Render
      const qrX = pad + Math.round(8 * scale);
      const qrY = curY + Math.round((qrBoxH - qrSize) / 2);

      try {
        const qrCanvas = document.createElement('canvas');
        bwipjs.toCanvas(qrCanvas, {
          bcid: 'qrcode',
          text: block.qrUrl || 'https://youtube.com',
          scale: 4
        });
        ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
      } catch {
        ctx.fillStyle = '#000000';
        ctx.strokeRect(qrX, qrY, qrSize, qrSize);
        ctx.font = `bold ${fontMinText}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('[ QR KOD ]', qrX + qrSize / 2, qrY + qrSize / 2);
      }

      // QR Yan Metinleri (%78 Başlık, %53 Alt Metin)
      const textX = qrX + qrSize + Math.round(10 * scale);
      const textW = contentWidth - qrSize - Math.round(18 * scale);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `900 ${fontSectionHeader}px sans-serif`;
      const qrTitleLines = wrapText(ctx, block.qrTitle || '📱 VİDEO KURULUM', textW);
      let qty = curY + Math.round(20 * scale);
      for (const tline of qrTitleLines) {
        ctx.fillText(tline, textX, qty);
        qty += Math.round(16 * scale);
      }

      ctx.font = `bold ${fontMinText}px sans-serif`;
      const qrSubLines = wrapText(ctx, block.qrSubtitle || 'Kameranızla okutarak montaj videosunu izleyebilirsiniz.', textW);
      let qsy = qty + Math.round(4 * scale);
      for (const line of qrSubLines) {
        ctx.fillText(line, textX, qsy);
        qsy += Math.round(13 * scale);
      }

      curY += qrBoxH + Math.round(14 * scale);

    } else if (block.type === 'barcode') {
      // BARKOD BLOĞU (%75 Başlık, %53 Alt Kod)
      const bcBoxH = Math.round(105 * scale);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
      ctx.strokeRect(pad, curY, contentWidth, bcBoxH);

      const bcVal = (block.barcodeText || '8691234567890').trim();
      const bcTitle = block.barcodeTitle || 'ÜRÜN / STOK BARKODU';

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${fontSubTitle}px sans-serif`;
      ctx.textAlign = 'center';
      const bTitleLines = wrapText(ctx, bcTitle.toUpperCase(), contentWidth - Math.round(16 * scale));
      let bty = curY + Math.round(16 * scale);
      for (const bt of bTitleLines) {
        ctx.fillText(bt, width / 2, bty);
        bty += Math.round(15 * scale);
      }

      let renderedSuccess = false;
      const bcType = block.barcodeType || 'code128';

      // Birincil Deneme
      try {
        const bcCanvas = document.createElement('canvas');
        bwipjs.toCanvas(bcCanvas, {
          bcid: bcType,
          text: bcVal,
          scale: 3,
          height: 14,
          includetext: true,
          textxalign: 'center',
          backgroundcolor: 'FFFFFF',
          paddingwidth: 8,
          paddingheight: 4
        });
        if (bcCanvas.width > 0 && bcCanvas.height > 0) {
          const targetW = Math.min(contentWidth - Math.round(16 * scale), bcCanvas.width * scale * 0.82);
          const targetH = Math.round(58 * scale);
          const drawX = Math.round((width - targetW) / 2);
          const drawY = curY + Math.round(28 * scale);
          ctx.drawImage(bcCanvas, drawX, drawY, targetW, targetH);
          renderedSuccess = true;
        }
      } catch (err) {
        console.warn('Barkod çizim hatası:', err);
      }

      // İkincil Deneme (Code128 Fallback)
      if (!renderedSuccess) {
        try {
          const bcCanvas = document.createElement('canvas');
          bwipjs.toCanvas(bcCanvas, {
            bcid: 'code128',
            text: bcVal || '1234567890',
            scale: 3,
            height: 14,
            includetext: true,
            textxalign: 'center',
            backgroundcolor: 'FFFFFF',
            paddingwidth: 8,
            paddingheight: 4
          });
          if (bcCanvas.width > 0 && bcCanvas.height > 0) {
            const targetW = Math.min(contentWidth - Math.round(16 * scale), bcCanvas.width * scale * 0.82);
            const targetH = Math.round(58 * scale);
            const drawX = Math.round((width - targetW) / 2);
            const drawY = curY + Math.round(28 * scale);
            ctx.drawImage(bcCanvas, drawX, drawY, targetW, targetH);
            renderedSuccess = true;
          }
        } catch {
          // pas geç
        }
      }

      // Üçüncül Deneme (Vektörel Barkod Çizimi)
      if (!renderedSuccess) {
        const startX = pad + Math.round(16 * scale);
        const availW = contentWidth - Math.round(32 * scale);
        const barCount = 44;
        const barW = availW / barCount;
        const barH = Math.round(42 * scale);
        const barY = curY + Math.round(26 * scale);

        ctx.fillStyle = '#000000';
        for (let i = 0; i < barCount; i++) {
          if (i % 2 === 0 || i % 7 === 0 || i % 9 === 0) {
            ctx.fillRect(startX + i * barW, barY, Math.max(1.5, barW * 0.75), barH);
          }
        }
        ctx.font = `900 ${fontMinText}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(bcVal, width / 2, barY + barH + Math.round(13 * scale));
      }

      curY += bcBoxH + Math.round(14 * scale);

    } else if (block.type === 'divider') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
      ctx.setLineDash([5 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(pad, curY + Math.round(7 * scale));
      ctx.lineTo(width - pad, curY + Math.round(7 * scale));
      ctx.stroke();
      ctx.setLineDash([]);
      curY += Math.round(16 * scale);
    }
  }

  // === FOOTER ÇİZİMİ ===
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(1, Math.round(2 * scale));
  ctx.beginPath();
  ctx.moveTo(pad, curY);
  ctx.lineTo(width - pad, curY);
  ctx.stroke();
  curY += Math.round(12 * scale);

  // WhatsApp Destek (%78 Boyut)
  if (data.supportPhone) {
    ctx.fillStyle = '#000000';
    ctx.font = `900 ${fontSectionHeader}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`💬 ${data.supportPhone.toUpperCase()}`, width / 2, curY + Math.round(12 * scale));
    curY += Math.round(20 * scale);
  }

  // Dipnot (%53 Boyut)
  if (data.footerNote) {
    ctx.fillStyle = '#000000';
    ctx.font = `bold italic ${fontMinText}px sans-serif`;
    ctx.textAlign = 'center';
    const noteLines = wrapText(ctx, data.footerNote, contentWidth);
    for (const nline of noteLines) {
      ctx.fillText(nline, width / 2, curY + Math.round(10 * scale));
      curY += Math.round(14 * scale);
    }
    curY += Math.round(4 * scale);
  }

  // Marka İmzası (%53 Boyut)
  if (data.showFooterLogo !== false && data.logoText) {
    ctx.fillStyle = '#000000';
    ctx.font = `900 ${fontMinText}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`• ${data.logoText} •`, width / 2, curY + Math.round(11 * scale));
    curY += Math.round(16 * scale);
  }

  // Tuval Boyutlandırma, Sayfa Uyarlama ve Hassas Kırpma
  const contentActualHeight = Math.ceil(curY + pad);
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = width;

  if (isContinuousRoll || requestedHeight <= 0) {
    // Sürekli Rulo Modu: İçerik ne kadarsa tam o yükseklikte kesilir
    finalCanvas.height = contentActualHeight;
    const fctx = finalCanvas.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#FFFFFF';
      fctx.fillRect(0, 0, width, finalCanvas.height);
      fctx.drawImage(canvas, 0, 0, width, finalCanvas.height, 0, 0, width, finalCanvas.height);
    }
  } else {
    // Sabit Sayfa / Etiket Modu (Örn: 10x15cm, 10x10cm, A5 vb.)
    finalCanvas.height = requestedHeight;
    const fctx = finalCanvas.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#FFFFFF';
      fctx.fillRect(0, 0, width, requestedHeight);

      if (contentActualHeight <= requestedHeight) {
        // İçerik tam sığıyor: Doğrudan net çizilir
        fctx.drawImage(canvas, 0, 0, width, contentActualHeight, 0, 0, width, contentActualHeight);
      } else {
        // İçerik etiket boyunu aşıyorsa: Taşmayı önleyip sayfaya sığdıracak şekilde akıllı ölçekle
        const fitRatio = Math.min(1, (requestedHeight - pad * 2) / (contentActualHeight - pad * 2));
        const targetW = Math.round((width - pad * 2) * fitRatio);
        const targetH = Math.round((contentActualHeight - pad * 2) * fitRatio);
        const offsetX = Math.round((width - targetW) / 2);
        const offsetY = pad;

        fctx.imageSmoothingEnabled = true;
        fctx.imageSmoothingQuality = 'high';
        fctx.drawImage(
          canvas,
          0,
          0,
          width,
          contentActualHeight,
          offsetX,
          offsetY,
          targetW,
          targetH
        );
      }
    }
  }

  return finalCanvas;
}

/**
 * Metin Satır Kaydırma (Word Wrap & Long Word Character Break)
 */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const rawParagraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of rawParagraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.trim().split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }

        // Kelime tek başına maxWidth'tan büyükse karakter karakter böl
        const singleWordWidth = ctx.measureText(word).width;
        if (singleWordWidth > maxWidth) {
          let partialWord = '';
          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const testCharLine = partialWord + char;
            if (ctx.measureText(testCharLine).width <= maxWidth) {
              partialWord = testCharLine;
            } else {
              if (partialWord) lines.push(partialWord);
              partialWord = char;
            }
          }
          currentLine = partialWord;
        } else {
          currentLine = word;
        }
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }
  return lines;
}

/**
 * Image Yükleme Yardımcısı
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
