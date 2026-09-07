/**
 * Image Processing Utilities for Thermal Printing
 */

export type DitheringType = 'none' | 'floyd-steinberg' | 'atkinson' | 'stucki' | 'bayer' | 'threshold' | 'dot-matrix' | 'sierra' | 'jarvis-judice-ninke' | 'fast-print' | 'sketch' | 'document-clean';

export interface ImageAdjustments {
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  invert?: boolean;
}

export interface ProcessImageOptions {
  /**
   * Bit order inside each byte.
   * - false (default): LSB-first — LuckJingle / iPrint / GB03 style printers
   * - true: MSB-first — required by the ESC/POS "GS v 0" raster spec,
   *   where bit 7 of each byte is the leftmost pixel of the row.
   */
  msbFirst?: boolean;
}

export function processImage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dithering: DitheringType,
  adjustments?: ImageAdjustments,
  options?: ProcessImageOptions
): Uint8Array {
  // Safety check for zero dimensions
  if (width <= 0 || height <= 0) {
    return new Uint8Array(0);
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const brightness = adjustments?.brightness || 0;
  const contrast = adjustments?.contrast || 0;
  const invert = adjustments?.invert || false;

  // Pre-calculate contrast factor
  // factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast) || 1);

  // Convert to grayscale and apply brightness/contrast/invert
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    // If pixel has transparency, blend over white background (thermal paper is white)
    if (a < 255) {
      const alpha = a / 255;
      r = Math.round(r * alpha + 255 * (1 - alpha));
      g = Math.round(g * alpha + 255 * (1 - alpha));
      b = Math.round(b * alpha + 255 * (1 - alpha));
    }

    // Grayscale
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Apply brightness
    if (brightness !== 0) {
      gray = gray + brightness * 2.55;
    }

    // Apply contrast
    if (contrast !== 0) {
      gray = factor * (gray - 128) + 128;
    }

    // Clamp 0-255
    gray = Math.max(0, Math.min(255, gray));

    // Apply invert
    if (invert) {
      gray = 255 - gray;
    }

    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  if (dithering === 'floyd-steinberg') {
    applyFloydSteinberg(data, width, height);
  } else if (dithering === 'atkinson') {
    applyAtkinson(data, width, height);
  } else if (dithering === 'stucki') {
    applyStucki(data, width, height);
  } else if (dithering === 'bayer') {
    applyBayer(data, width, height);
  } else if (dithering === 'sierra') {
    applySierra(data, width, height);
  } else if (dithering === 'jarvis-judice-ninke') {
    applyJJN(data, width, height);
  } else if (dithering === 'fast-print') {
    applyFastPrint(data, width, height);
  } else if (dithering === 'sketch') {
    applySketchFilter(data, width, height);
  } else if (dithering === 'document-clean') {
    applyDocumentClean(data, width, height);
  } else if (dithering === 'dot-matrix') {
    applyDotMatrix(data, width, height);
  } else {
    // Simple threshold
    for (let i = 0; i < data.length; i += 4) {
      const val = data[i] > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }

  // Convert to 1-bit bitmap (8 pixels per byte), packed strictly per row so
  // every row starts on a byte boundary — required by both ESC/POS raster
  // commands and line-by-line LuckJingle streaming, regardless of width % 8.
  const msbFirst = options?.msbFirst ?? false;
  const bytesPerRow = Math.ceil(width / 8);
  const bitmap = new Uint8Array(bytesPerRow * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx] >= 128) continue; // white pixel -> bit stays 0
      if (msbFirst) {
        bitmap[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7);
      } else {
        bitmap[y * bytesPerRow + (x >> 3)] |= 1 << (x & 7);
      }
    }
  }

  return bitmap;
}

// Sketch / Line-art filter for thermal printing
function applySketchFilter(data: Uint8ClampedArray, w: number, h: number) {
  const orig = new Uint8ClampedArray(data);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      
      // Sobel operator
      const gx = 
        -1 * orig[((y - 1) * w + (x - 1)) * 4] + 1 * orig[((y - 1) * w + (x + 1)) * 4] +
        -2 * orig[(y * w + (x - 1)) * 4]       + 2 * orig[(y * w + (x + 1)) * 4] +
        -1 * orig[((y + 1) * w + (x - 1)) * 4] + 1 * orig[((y + 1) * w + (x + 1)) * 4];

      const gy = 
        -1 * orig[((y - 1) * w + (x - 1)) * 4] - 2 * orig[((y - 1) * w + x) * 4] - 1 * orig[((y - 1) * w + (x + 1)) * 4] +
         1 * orig[((y + 1) * w + (x - 1)) * 4] + 2 * orig[((y + 1) * w + x) * 4] + 1 * orig[((y + 1) * w + (x + 1)) * 4];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      // If strong edge -> black line (0), else white (255)
      const val = magnitude > 70 ? 0 : 255;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }
}

// Document clean binarization
function applyDocumentClean(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // High contrast cut-off for crisp letters
      const val = data[i] > 140 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }
}

function applyStucki(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldVal = data[i];
      const newVal = oldVal > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < w) distributeError(data, (y * w + (x + 1)) * 4, err * 8 / 42);
      if (x + 2 < w) distributeError(data, (y * w + (x + 2)) * 4, err * 4 / 42);
      
      if (y + 1 < h) {
        if (x > 1) distributeError(data, ((y + 1) * w + (x - 2)) * 4, err * 2 / 42);
        if (x > 0) distributeError(data, ((y + 1) * w + (x - 1)) * 4, err * 4 / 42);
        distributeError(data, ((y + 1) * w + x) * 4, err * 8 / 42);
        if (x + 1 < w) distributeError(data, ((y + 1) * w + (x + 1)) * 4, err * 4 / 42);
        if (x + 2 < w) distributeError(data, ((y + 1) * w + (x + 2)) * 4, err * 2 / 42);
      }
      
      if (y + 2 < h) {
        if (x > 1) distributeError(data, ((y + 2) * w + (x - 2)) * 4, err * 1 / 42);
        if (x > 0) distributeError(data, ((y + 2) * w + (x - 1)) * 4, err * 2 / 42);
        distributeError(data, ((y + 2) * w + x) * 4, err * 4 / 42);
        if (x + 1 < w) distributeError(data, ((y + 2) * w + (x + 1)) * 4, err * 2 / 42);
        if (x + 2 < w) distributeError(data, ((y + 2) * w + (x + 2)) * 4, err * 1 / 42);
      }
    }
  }
}

function applyBayer(data: Uint8ClampedArray, w: number, h: number) {
  const bayerThresholdMap = [
    [  15, 135,  45, 165 ],
    [ 195,  75, 225, 105 ],
    [  60, 180,  30, 150 ],
    [ 240, 120, 210,  90 ]
  ];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const threshold = bayerThresholdMap[y % 4][x % 4];
      const val = data[i] > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }
}

function applyFloydSteinberg(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldVal = data[i];
      const newVal = oldVal > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < w) distributeError(data, (y * w + (x + 1)) * 4, err * 7 / 16);
      if (y + 1 < h) {
        if (x > 0) distributeError(data, ((y + 1) * w + (x - 1)) * 4, err * 3 / 16);
        distributeError(data, ((y + 1) * w + x) * 4, err * 5 / 16);
        if (x + 1 < w) distributeError(data, ((y + 1) * w + (x + 1)) * 4, err * 1 / 16);
      }
    }
  }
}

function applyAtkinson(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldVal = data[i];
      const newVal = oldVal > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = newVal;
      const err = (oldVal - newVal) / 8;

      if (x + 1 < w) distributeError(data, (y * w + (x + 1)) * 4, err);
      if (x + 2 < w) distributeError(data, (y * w + (x + 2)) * 4, err);
      if (y + 1 < h) {
        if (x > 0) distributeError(data, ((y + 1) * w + (x - 1)) * 4, err);
        distributeError(data, ((y + 1) * w + x) * 4, err);
        if (x + 1 < w) distributeError(data, ((y + 1) * w + (x + 1)) * 4, err);
      }
      if (y + 2 < h) {
        distributeError(data, ((y + 2) * w + x) * 4, err);
      }
    }
  }
}

function applyDotMatrix(data: Uint8ClampedArray, w: number, h: number) {
  // Simple pattern-based dithering for a "dot-matrix" look
  const matrix = [
    [0, 128],
    [192, 64]
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const threshold = matrix[y % 2][x % 2];
      const val = data[i] > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }
}

function applySierra(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldVal = data[i];
      const newVal = oldVal > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < w) distributeError(data, (y * w + (x + 1)) * 4, err * 5 / 32);
      if (x + 2 < w) distributeError(data, (y * w + (x + 2)) * 4, err * 3 / 32);
      if (y + 1 < h) {
        if (x > 1) distributeError(data, ((y + 1) * w + (x - 2)) * 4, err * 2 / 32);
        if (x > 0) distributeError(data, ((y + 1) * w + (x - 1)) * 4, err * 4 / 32);
        distributeError(data, ((y + 1) * w + x) * 4, err * 5 / 32);
        if (x + 1 < w) distributeError(data, ((y + 1) * w + (x + 1)) * 4, err * 4 / 32);
        if (x + 2 < w) distributeError(data, ((y + 1) * w + (x + 2)) * 4, err * 2 / 32);
      }
      if (y + 2 < h) {
        if (x > 0) distributeError(data, ((y + 2) * w + (x - 1)) * 4, err * 2 / 32);
        distributeError(data, ((y + 2) * w + x) * 4, err * 3 / 32);
        if (x + 1 < w) distributeError(data, ((y + 2) * w + (x + 1)) * 4, err * 2 / 32);
      }
    }
  }
}

function applyJJN(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldVal = data[i];
      const newVal = oldVal > 128 ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = newVal;
      const err = oldVal - newVal;

      if (x + 1 < w) distributeError(data, (y * w + (x + 1)) * 4, err * 7 / 48);
      if (x + 2 < w) distributeError(data, (y * w + (x + 2)) * 4, err * 5 / 48);
      
      if (y + 1 < h) {
        for (let dx = -2; dx <= 2; dx++) {
          if (x + dx >= 0 && x + dx < w) {
            const weights = [3, 5, 7, 5, 3];
            distributeError(data, ((y + 1) * w + (x + dx)) * 4, err * weights[dx + 2] / 48);
          }
        }
      }
      if (y + 2 < h) {
        for (let dx = -2; dx <= 2; dx++) {
          if (x + dx >= 0 && x + dx < w) {
            const weights = [1, 3, 5, 3, 1];
            distributeError(data, ((y + 2) * w + (x + dx)) * 4, err * weights[dx + 2] / 48);
          }
        }
      }
    }
  }
}

function applyFastPrint(data: Uint8ClampedArray, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Ultra fast: ignore even lines or use high contrast threshold
      if (y % 2 === 0) {
        data[i] = data[i + 1] = data[i + 2] = data[i] > 100 ? 255 : 0;
      } else {
        data[i] = data[i + 1] = data[i + 2] = 255; // Skip every other line
      }
    }
  }
}

function distributeError(data: Uint8ClampedArray, i: number, err: number) {
  data[i] = Math.min(255, Math.max(0, data[i] + err));
  data[i + 1] = data[i];
  data[i + 2] = data[i];
}

/**
 * Verilen Canvas'ı saat yönünde 90, 180 veya 270 derece döndürür.
 * Termal yazıcılarda 10cm'lik rulo kafasına 15x10cm gibi yatay tasarımları tam dikey beslemek için kullanılır.
 */
export function rotateCanvas(
  sourceCanvas: HTMLCanvasElement,
  degrees: 90 | 180 | 270 = 90
): HTMLCanvasElement {
  const rotCanvas = document.createElement('canvas');
  if (degrees === 90 || degrees === 270) {
    rotCanvas.width = sourceCanvas.height;
    rotCanvas.height = sourceCanvas.width;
  } else {
    rotCanvas.width = sourceCanvas.width;
    rotCanvas.height = sourceCanvas.height;
  }

  const ctx = rotCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rotCanvas.width, rotCanvas.height);

  ctx.save();
  ctx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);
  ctx.restore();

  return rotCanvas;
}
