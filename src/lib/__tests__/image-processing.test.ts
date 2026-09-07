import { describe, it, expect } from 'vitest';
import { processImage, DitheringType } from '../image-processing';

/** Minimal CanvasRenderingContext2D stub: only getImageData is needed. */
function fakeCtx(pixels: Uint8ClampedArray) {
  return {
    getImageData: () => ({ data: pixels })
  } as unknown as CanvasRenderingContext2D;
}

function solidPixels(w: number, h: number, gray: number): Uint8ClampedArray {
  const px = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = px[i + 1] = px[i + 2] = gray;
    px[i + 3] = 255;
  }
  return px;
}

const W = 9; // deliberately NOT a multiple of 8
const H = 2;

describe('processImage bit packing', () => {
  it('LSB mode (LuckJingle): all-black image fills each row fully', () => {
    const bitmap = processImage(fakeCtx(solidPixels(W, H, 0)), W, H, 'none');
    expect(bitmap.length).toBe(Math.ceil(W / 8) * H); // 4 bytes: 2 rows x ceil(9/8)
    // row = 9 black pixels -> byte0 = 0xFF (bits 0..7), byte1 = 0x01 (bit 8)
    for (let y = 0; y < H; y++) {
      const row = bitmap.slice(y * 2, y * 2 + 2);
      expect(Array.from(row)).toEqual([0xff, 0x01]);
    }
  });

  it('MSB mode (ESC/POS): leftmost pixel lands on bit 7', () => {
    const bitmap = processImage(fakeCtx(solidPixels(W, H, 0)), W, H, 'none', undefined, {
      msbFirst: true
    });
    for (let y = 0; y < H; y++) {
      const row = bitmap.slice(y * 2, y * 2 + 2);
      expect(Array.from(row)).toEqual([0xff, 0x80]); // pixel 8 -> highest bit of byte 1
    }
  });

  it('single black pixel position distinguishes the two modes', () => {
    const px = solidPixels(W, H, 255); // white
    px[0] = px[1] = px[2] = 0; // only pixel (0,0) black

    const lsb = processImage(fakeCtx(px), W, H, 'none');
    expect(lsb[0] & 1).toBe(1); // bit 0
    expect(lsb[0]).toBe(0x01);

    const msb = processImage(fakeCtx(px), W, H, 'none', undefined, { msbFirst: true });
    expect(msb[0] & 0x80).toBe(0x80); // bit 7
    expect(msb[0]).toBe(0x80);

    // second row untouched
    expect(lsb[2]).toBe(0x00);
    expect(msb[2]).toBe(0x00);
  });

  it('white images pack to zeros in both modes', () => {
    const white = solidPixels(W, H, 255);
    expect(processImage(fakeCtx(white), W, H, 'none').every((b) => b === 0)).toBe(true);
    expect(
      processImage(fakeCtx(white), W, H, 'none', undefined, { msbFirst: true }).every(
        (b) => b === 0
      )
    ).toBe(true);
  });

  it('threshold at default level: 200 stays white, 50 turns black', () => {
    const lightOnly = processImage(fakeCtx(solidPixels(W, H, 200)), W, H, 'none');
    expect(lightOnly.every((b) => b === 0)).toBe(true);

    const darkOnly = processImage(fakeCtx(solidPixels(W, H, 50)), W, H, 'none');
    expect(darkOnly.some((b) => b !== 0)).toBe(true);
  });
});

describe('dithering algorithms stay binary', () => {
  const algorithms: DitheringType[] = [
    'floyd-steinberg',
    'atkinson',
    'stucki',
    'bayer',
    'sierra',
    'jarvis-judice-ninke'
  ];

  it.each(algorithms)('%s outputs only {0,255} grayscale values', (algo) => {
    // Gradient input exercises error diffusion paths
    const w = 16;
    const h = 16;
    const px = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const v = Math.round((i / (w * h)) * 255);
      px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
      px[i * 4 + 3] = 255;
    }
    processImage(fakeCtx(px), w, h, algo as DitheringType);
    for (let i = 0; i < px.length; i += 4) {
      expect([0, 255]).toContain(px[i]);
    }
  });

  it.each(algorithms)('%s produces both ink and paper on a gradient (%s)', (algo) => {
    const w = 16;
    const h = 16;
    const px = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const v = Math.round((i / (w * h)) * 255);
      px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
      px[i * 4 + 3] = 255;
    }
    processImage(fakeCtx(px), w, h, algo as DitheringType);
    let sawBlack = false;
    let sawWhite = false;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i] === 0) sawBlack = true;
      if (px[i] === 255) sawWhite = true;
    }
    expect(sawBlack).toBe(true);
    expect(sawWhite).toBe(true);
  });
});
