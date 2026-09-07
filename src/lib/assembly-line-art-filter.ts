/**
 * Assembly Line Art Filter Engine - Professional CAD / IKEA Manual Style
 * Gerçek ürün veya parça fotoğraflarını kurulum şeması (IKEA / CAD / Blueprint) 
 * tarzı pürüzsüz, yüksek kontrastlı ve temiz siyah-beyaz vektörel konturlara dönüştüren gelişmiş görüntü işleme motoru.
 */

export interface LineArtOptions {
  mode: 'ikea_cad' | 'line_art' | 'blueprint_edge' | 'high_contrast' | 'original';
  thickness: 'thin' | 'medium' | 'thick'; // 1px, 2px, 3px
  detailLevel: 'high' | 'balanced' | 'contours_only'; // Sobel & DoG detayı
  noiseThreshold: number; // 0 - 100 (arka plan gürültü temizleme eşiği)
  despeckleLevel: number; // 0 - 10 (nokta pürüz ve parazit silme)
  contrastBoost: number; // 1.0 - 2.5
  invert: boolean; // false = beyaz zemin siyah çizgi, true = siyah zemin beyaz çizgi
  removeBg?: boolean; // AI arka plan temizleme çalıştırılsın mı?
  smoothEdges?: boolean; // Vektörel çizgi yumuşatma
}

export const DEFAULT_LINE_ART_OPTIONS: LineArtOptions = {
  mode: 'ikea_cad', // Profesyonel IKEA CAD Çizim Modu (Varsayılan)
  thickness: 'medium',
  detailLevel: 'balanced',
  noiseThreshold: 30,
  despeckleLevel: 4,
  contrastBoost: 1.6,
  invert: false,
  removeBg: false,
  smoothEdges: true
};

/**
 * Verilen bir HTMLImageElement veya Canvas'ı çizgisel kurulum şemasına dönüştürür.
 */
export async function convertToAssemblyLineArt(
  source: HTMLImageElement | HTMLCanvasElement,
  options: Partial<LineArtOptions> = {}
): Promise<string> {
  const opts: LineArtOptions = { ...DEFAULT_LINE_ART_OPTIONS, ...options };

  // 0. ADIM: AI Arka Plan Temizleme (İstenmişse)
  let workingSource: HTMLImageElement | HTMLCanvasElement = source;
  if (opts.removeBg && typeof window !== 'undefined') {
    try {
      let dataUrlToClean = '';
      if (source instanceof HTMLCanvasElement) {
        dataUrlToClean = source.toDataURL('image/png');
      } else {
        const tmpC = document.createElement('canvas');
        tmpC.width = source.naturalWidth || source.width;
        tmpC.height = source.naturalHeight || source.height;
        const tmpCtx = tmpC.getContext('2d');
        if (tmpCtx) {
          tmpCtx.drawImage(source, 0, 0);
          dataUrlToClean = tmpC.toDataURL('image/png');
        }
      }

      if (dataUrlToClean) {
        const { removeBackground } = await import('./background-removal');
        const cleanedDataUrl = await removeBackground(dataUrlToClean);
        const cleanedImg = new Image();
        cleanedImg.crossOrigin = 'anonymous';
        cleanedImg.src = cleanedDataUrl;
        await new Promise((resolve) => { cleanedImg.onload = resolve; });
        workingSource = cleanedImg;
      }
    } catch (bgErr) {
      console.warn('AI Arka plan temizleme pas geçildi, varsayılan akış devam ediyor:', bgErr);
    }
  }

  const canvas = document.createElement('canvas');
  const w = workingSource instanceof HTMLImageElement ? (workingSource.naturalWidth || workingSource.width) : workingSource.width;
  const h = workingSource instanceof HTMLImageElement ? (workingSource.naturalHeight || workingSource.height) : workingSource.height;

  // Performans ve CAD netliği için optimal 1200px işleme boyutu
  const maxDim = 1200;
  let targetW = w;
  let targetH = h;
  if (targetW > maxDim || targetH > maxDim) {
    const scale = maxDim / Math.max(targetW, targetH);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  // Arka planı saf beyaz yap ve görseli çiz
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(workingSource, 0, 0, targetW, targetH);

  if (opts.mode === 'original') {
    return canvas.toDataURL('image/png');
  }

  const imgData = ctx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;
  const len = targetW * targetH;

  // 1. ADIM: Grayscale ve Kontrast Ayarı
  const gray = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    const alpha = data[idx + 3];

    // Şeffaf bölgeleri saf beyaz (255) olarak ele al
    if (alpha < 50) {
      gray[i] = 255;
      continue;
    }

    // Standart insan gözü algısı ağırlıkları (Rec. 709)
    let g = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
    
    // Kontrast artırma
    if (opts.contrastBoost !== 1.0) {
      g = ((g / 255 - 0.5) * opts.contrastBoost + 0.5) * 255;
      g = Math.max(0, Math.min(255, g));
    }
    gray[i] = g;
  }

  // 2. ADIM: Kenar Koruyan Yüzey Düzleştirme (Bilateral / Edge-Preserving Filter)
  // Ahşap dokusu, gölgeler ve yüzey pürüzlerini bastırır; mobilya kenarlarını keskin tutar.
  const smoothed = applyEdgePreservingSmoothing(gray, targetW, targetH, opts.mode === 'ikea_cad' ? 2 : 1);

  // 3. ADIM: Kenar Algılama (Sobel + Difference of Gaussians / DoG - CAD Vektör Çizimi)
  const edges = new Float32Array(len);

  if (opts.mode === 'high_contrast') {
    for (let i = 0; i < len; i++) {
      edges[i] = gray[i] < 128 ? 0 : 255;
    }
  } else if (opts.mode === 'ikea_cad') {
    // === İKİ KADEMELİ CAD VEKTÖR SENTEZİ (DoG + Directional Sobel) ===
    const blur1 = applyFastBoxBlur(smoothed, targetW, targetH, 1);
    const blur2 = applyFastBoxBlur(smoothed, targetW, targetH, 3);
    
    // Sobel Operatörleri
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    const thresholdBase = opts.detailLevel === 'high' ? 14 : opts.detailLevel === 'balanced' ? 24 : 38;
    const finalThreshold = thresholdBase + Math.round(opts.noiseThreshold * 1.4);

    for (let y = 1; y < targetH - 1; y++) {
      for (let x = 1; x < targetW - 1; x++) {
        const idx = y * targetW + x;

        // 1. Difference of Gaussians (DoG) - Mimari Mühendislik Konturu
        const dogVal = blur1[idx] - 0.94 * blur2[idx];

        // 2. Sobel Gradyan Büyüklüğü
        let gx = 0;
        let gy = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pixelVal = smoothed[(y + dy) * targetW + (x + dx)];
            gx += pixelVal * sobelX[k];
            gy += pixelVal * sobelY[k];
            k++;
          }
        }
        const mag = Math.sqrt(gx * gx + gy * gy);

        // DoG ve Sobel Sentezi
        const cadEdgeScore = mag * 0.65 + Math.max(0, -dogVal * 2.8) * 0.35;

        // Siyah Çizgi (0) veya Saf Beyaz Zemin (255)
        edges[idx] = cadEdgeScore > finalThreshold ? 0 : 255;
      }
    }

    // Morfolojik Kapatma (Morphological Closing): Kopuk masa/ayak çizgilerini birleştirir
    applyMorphologicalClosing(edges, targetW, targetH);

  } else {
    // Standart Line Art / Blueprint Edge
    const blur = applyFastBoxBlur(smoothed, targetW, targetH, opts.detailLevel === 'contours_only' ? 2 : 1);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < targetH - 1; y++) {
      for (let x = 1; x < targetW - 1; x++) {
        let gx = 0;
        let gy = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pixelVal = blur[(y + dy) * targetW + (x + dx)];
            gx += pixelVal * sobelX[k];
            gy += pixelVal * sobelY[k];
            k++;
          }
        }
        const mag = Math.sqrt(gx * gx + gy * gy);
        edges[y * targetW + x] = mag;
      }
    }

    const thresholdBase = opts.detailLevel === 'high' ? 18 : opts.detailLevel === 'balanced' ? 30 : 50;
    const finalThreshold = thresholdBase + Math.round(opts.noiseThreshold * 1.5);

    for (let i = 0; i < len; i++) {
      edges[i] = edges[i] > finalThreshold ? 0 : 255;
    }
  }

  // 4. ADIM: Gürültü ve Nokta Parazit Temizleme (Despeckle / Island Removal)
  if (opts.despeckleLevel && opts.despeckleLevel > 0) {
    removeSpeckleNoise(edges, targetW, targetH, opts.despeckleLevel);
  }

  // 5. ADIM: Çizgi Kalınlaştırma veya İnceltme (Dilation / Thinning)
  if (opts.thickness === 'thin') {
    applyLineThinning(edges, targetW, targetH);
  } else if (opts.thickness === 'medium' || opts.thickness === 'thick') {
    const radius = opts.thickness === 'thick' ? 2 : 1;
    const dilated = new Float32Array(edges);

    for (let y = radius; y < targetH - radius; y++) {
      for (let x = radius; x < targetW - radius; x++) {
        if (edges[y * targetW + x] === 0) {
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              dilated[(y + dy) * targetW + (x + dx)] = 0;
            }
          }
        }
      }
    }
    for (let i = 0; i < len; i++) {
      edges[i] = dilated[i];
    }
  }

  // 6. ADIM: Piksel Verisini Çıktı Canvas'ına Yazma
  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    let val = edges[i];
    if (opts.invert) {
      val = 255 - val;
    }

    data[idx] = val;     // R
    data[idx + 1] = val; // G
    data[idx + 2] = val; // B
    data[idx + 3] = 255; // Alpha
  }

  ctx.putImageData(imgData, 0, 0);

  if (opts.smoothEdges) {
    applySubtleStrokeSmoothing(ctx, targetW, targetH, opts.invert);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Kenar Koruyan Yüzey Düzleştirme (Edge-Preserving Surface Filter)
 */
function applyEdgePreservingSmoothing(input: Float32Array, w: number, h: number, passes: number): Float32Array {
  let current = input;

  for (let p = 0; p < passes; p++) {
    const next = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const center = current[y * w + x];
        let sum = 0;
        let totalWeight = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const neighbor = current[(y + dy) * w + (x + dx)];
            const diff = Math.abs(center - neighbor);
            const weight = Math.exp(-(diff * diff) / 450);
            sum += neighbor * weight;
            totalWeight += weight;
          }
        }
        next[y * w + x] = totalWeight > 0 ? sum / totalWeight : center;
      }
    }
    current = next;
  }

  return current;
}

/**
 * Morfolojik Kapatma (Morphological Closing): Dilation ardından Erosion uygulayarak
 * kopuk masa veya mobilya kenarlarını birleştirir.
 */
function applyMorphologicalClosing(edges: Float32Array, w: number, h: number): void {
  const temp = new Float32Array(edges);

  // 1. Dilation
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (edges[y * w + x] === 0) {
        temp[(y - 1) * w + x] = 0;
        temp[(y + 1) * w + x] = 0;
        temp[y * w + (x - 1)] = 0;
        temp[y * w + (x + 1)] = 0;
      }
    }
  }

  // 2. Erosion
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (temp[y * w + x] === 0) {
        let whiteNeighborCount = 0;
        if (temp[(y - 1) * w + x] === 255) whiteNeighborCount++;
        if (temp[(y + 1) * w + x] === 255) whiteNeighborCount++;
        if (temp[y * w + (x - 1)] === 255) whiteNeighborCount++;
        if (temp[y * w + (x + 1)] === 255) whiteNeighborCount++;

        edges[y * w + x] = whiteNeighborCount >= 2 ? 255 : 0;
      } else {
        edges[y * w + x] = 255;
      }
    }
  }
}

/**
 * Çizgi İnceltme (Thinning)
 */
function applyLineThinning(edges: Float32Array, w: number, h: number): void {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (edges[y * w + x] === 0) {
        let blackCount = 0;
        if (edges[(y - 1) * w + x] === 0) blackCount++;
        if (edges[(y + 1) * w + x] === 0) blackCount++;
        if (edges[y * w + (x - 1)] === 0) blackCount++;
        if (edges[y * w + (x + 1)] === 0) blackCount++;

        if (blackCount >= 4) {
          edges[y * w + x] = 255;
        }
      }
    }
  }
}

/**
 * Hızlı 1-pass kutu bulanıklaştırma
 */
function applyFastBoxBlur(input: Float32Array, w: number, h: number, radius: number): Float32Array {
  if (radius <= 0) return input;
  const output = new Float32Array(input.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx >= 0 && nx < w) {
              sum += input[ny * w + nx];
              count++;
            }
          }
        }
      }
      output[y * w + x] = count > 0 ? sum / count : input[y * w + x];
    }
  }
  return output;
}

/**
 * İzole küçük siyah pürüz noktalarını temizler.
 */
function removeSpeckleNoise(edges: Float32Array, w: number, h: number, level: number): void {
  const minIslandSize = level * 8;
  const visited = new Uint8Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (edges[idx] === 0 && visited[idx] === 0) {
        const islandPixels: number[] = [];
        const queue: number[] = [idx];
        visited[idx] = 1;

        let qHead = 0;
        while (qHead < queue.length && islandPixels.length <= minIslandSize + 15) {
          const curr = queue[qHead++];
          islandPixels.push(curr);

          const cx = curr % w;
          const cy = Math.floor(curr / w);

          const neighbors = [
            cy > 0 ? (cy - 1) * w + cx : -1,
            cy < h - 1 ? (cy + 1) * w + cx : -1,
            cx > 0 ? cy * w + (cx - 1) : -1,
            cx < w - 1 ? cy * w + (cx + 1) : -1
          ];

          for (const nIdx of neighbors) {
            if (nIdx !== -1 && edges[nIdx] === 0 && visited[nIdx] === 0) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }

        if (islandPixels.length <= minIslandSize) {
          for (const pIdx of islandPixels) {
            edges[pIdx] = 255;
          }
        }
      }
    }
  }
}

/**
 * Canvas üzerinde konturları yumuşatan son pas
 */
function applySubtleStrokeSmoothing(ctx: CanvasRenderingContext2D, w: number, h: number, invert: boolean): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'contrast(125%) brightness(98%)';
  ctx.drawImage(ctx.canvas, 0, 0, w, h);
  ctx.restore();
}
