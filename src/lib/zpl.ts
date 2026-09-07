/**
 * ZPL (Zebra Programming Language) & TSPL Generators
 * Specially optimized for Zebra ZD220, ZD230, ZD420, GK420d, ZT series (203 DPI / 300 DPI)
 * and generic 4-inch USB label printers (10x10cm, 10x15cm, 15x10cm, etc.)
 */

export interface ZplPrintOptions {
  dpmm?: number; // 8 dots/mm = 203 DPI (Zebra ZD220 standard), 12 dots/mm = 300 DPI
  darkness?: number; // 0-30 (Zebra ~SD command)
  speed?: number; // 2-6 inches/sec (~PR command)
  labelWidthMm?: number;
  labelHeightMm?: number;
  mediaType?: 'gap' | 'continuous' | 'blackmark'; // ^MNY (Gap/Web) | ^MNN (Continuous) | ^MNM (Mark)
  mediaHandling?: 'tear' | 'peel' | 'rewind'; // ^MMT (Tear-off) | ^MMP | ^MMR
  gapMm?: number; // Gap between labels in mm (standard 2mm or 3mm)
  directThermal?: boolean; // true = ^MTD (Direct Thermal), false = ^MTT (Thermal Transfer)
  tearOffAdjustDots?: number; // ~TA adjust tear-off position in dots (-120 to +120)
}

/**
 * Converts binary monochrome pixel data into ZPL Graphic Field (^GFA) hex format.
 * bytesPerRow = Math.ceil(width / 8)
 * MSB-first: Top-left bit is MSB (0x80). 1 = black dot, 0 = white dot.
 */
export function imageToZplHex(
  bitmap: Uint8Array,
  width: number,
  height: number
): { zplHex: string; totalBytes: number; bytesPerRow: number } {
  const bytesPerRow = Math.ceil(width / 8);
  const totalBytes = bytesPerRow * height;
  const hexChars: string[] = [];

  for (let i = 0; i < bitmap.length && i < totalBytes; i++) {
    const byte = bitmap[i];
    const hex = byte.toString(16).toUpperCase().padStart(2, '0');
    hexChars.push(hex);
  }

  // Pad if bitmap length is shorter than expected totalBytes
  while (hexChars.length < totalBytes) {
    hexChars.push('00');
  }

  return {
    zplHex: hexChars.join(''),
    totalBytes,
    bytesPerRow
  };
}

/**
 * Builds a complete, robust ZPL II code string ready to be transmitted
 * to any Zebra printer (ZD220, ZD230, GK420, ZT410, etc.) over USB or Serial.
 * Full support for Gapped (die-cut), Continuous, and Black Mark labels.
 */
export function buildZplLabel(
  bitmap: Uint8Array,
  widthDots: number,
  heightDots: number,
  options: ZplPrintOptions = {}
): string {
  const darkness = Math.min(30, Math.max(0, Math.round(options.darkness ?? 15)));
  const mediaType = options.mediaType ?? 'gap'; // Default to gap for die-cut label rolls
  const mediaHandling = options.mediaHandling ?? 'tear';
  const directThermal = options.directThermal !== false;
  const { zplHex, totalBytes, bytesPerRow } = imageToZplHex(bitmap, widthDots, heightDots);

  // Media Tracking: ^MNY = Web/Gap sensor (Boşluklu), ^MNN = Continuous (Sürekli), ^MNM = Black Mark (Siyah Çizgi)
  const mnCommand = mediaType === 'gap' ? '^MNY' : (mediaType === 'blackmark' ? '^MNM' : '^MNN');
  // Media Handling: ^MMT = Tear-Off (Yırtma çizgisine hizalama)
  const mmCommand = mediaHandling === 'tear' ? '^MMT' : (mediaHandling === 'peel' ? '^MMP' : '^MMR');
  // Media Type: ^MTD = Direct Thermal, ^MTT = Thermal Transfer (Ribbon)
  const mtCommand = directThermal ? '^MTD' : '^MTT';

  // ^XA = Start format
  // ^MMT = Tear-off mode (advances gap to tear bar, backfeeds on next print)
  // ^MNY = Web/Gap sensor (detects 2-3mm gap between labels)
  // ^MTD = Direct thermal media
  // ^PW<width> = Print width in dots
  // ^LL<height> = Exact label length in dots (Crucial for gap calibration & accurate stopping!)
  // ^LS0 = Label shift 0
  // ^LH0,0 = Label home coordinates
  // ~SD<darkness> = Set darkness (0-30)
  // ^PR3,3 = Smooth print and slew speed (3 in/s)
  // ^FO0,0^GFA,...^FS = Graphics field
  // ^PQ1,0,1,Y = Print 1 quantity and align to gap
  // ^XZ = End format
  const zpl = [
    '^XA',
    mmCommand,
    mnCommand,
    mtCommand,
    `^PW${widthDots}`,
    `^LL${heightDots}`,
    '^LS0',
    '^LH0,0',
    `~SD${darkness}`,
    '^PR3,3',
    `^FO0,0^GFA,${totalBytes},${totalBytes},${bytesPerRow},${zplHex}^FS`,
    '^PQ1,0,1,Y',
    '^XZ'
  ].join('\n');

  return zpl;
}

/**
 * Builds ZPL sensor calibration command (~JC)
 * Forces the Zebra printer to feed 2-3 labels, measure the exact gap threshold,
 * calibrate optical sensors, and align to the start of the next label.
 */
export function buildZplCalibrateCommand(): string {
  return [
    '^XA',
    '^MNY', // Web/Gap sensor
    '^MMT', // Tear-off mode
    '~JC',  // Set Media Sensor Calibration
    '^JUS', // Save to EEPROM
    '^XZ'
  ].join('\n');
}

/**
 * Builds ZPL Form Feed command (~FF or ^XA^XZ) to align to the next label gap
 */
export function buildZplFeedToGapCommand(): string {
  return [
    '^XA',
    '^MNY',
    '^MMT',
    '^FO0,0^FS',
    '^PQ1,0,1,Y',
    '^XZ'
  ].join('\n');
}

/**
 * Builds TSPL format for Taiwan Semi / Xprinter / Gprinter 4-inch USB barcode printers.
 * With support for GAP sensing and auto-alignment.
 */
export function buildTsplLabel(
  bitmap: Uint8Array,
  widthDots: number,
  heightDots: number,
  widthMm: number = 100,
  heightMm: number = 100,
  options: {
    gapMm?: number;
    mediaType?: 'gap' | 'continuous' | 'blackmark';
    darkness?: number; // 0-100 or 0-15
  } = {}
): Uint8Array {
  const bytesPerRow = Math.ceil(widthDots / 8);
  const gap = options.mediaType === 'continuous' ? 0 : (options.gapMm ?? 2);
  const density = options.darkness !== undefined
    ? Math.min(15, Math.max(0, Math.round((options.darkness <= 15 ? options.darkness : (options.darkness / 100) * 15))))
    : 8;

  const header = [
    `SIZE ${widthMm} mm, ${heightMm} mm`,
    `GAP ${gap} mm, 0 mm`,
    `DENSITY ${density}`,
    `DIRECTION 1`,
    `SET PEEL OFF`,
    `SET TEAR ON`,
    `CLS`,
    `BITMAP 0,0,${bytesPerRow},${heightDots},0,`
  ].join('\n');
  const footer = `\nPRINT 1,1\n`;

  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(header);
  const footerBytes = encoder.encode(footer);

  const total = new Uint8Array(headerBytes.length + bitmap.length + footerBytes.length);
  total.set(headerBytes, 0);
  total.set(bitmap, headerBytes.length);
  total.set(footerBytes, headerBytes.length + bitmap.length);

  return total;
}

/**
 * Builds TSPL Calibration / Home command
 */
export function buildTsplCalibrateCommand(): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode('GAPDETECT\nHOME\n');
}

/**
 * Builds TSPL Feed to Next Gap command
 */
export function buildTsplFeedToGapCommand(): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode('FORMFEED\n');
}

/**
 * Standard Label Size Definitions (Dots calculated at 203 DPI = 8 dots/mm)
 */
export interface LabelDimensionPreset {
  id: string;
  name: string;
  category: 'mini' | 'pos' | 'zebra' | 'cargo';
  widthMm: number;
  heightMm: number;
  widthDots: number;
  heightDots: number;
  description: string;
}

export const LABEL_DIMENSION_PRESETS: LabelDimensionPreset[] = [
  {
    id: '57mm',
    name: '57mm Mini Termal',
    category: 'mini',
    widthMm: 48,
    heightMm: 0,
    widthDots: 384,
    heightDots: 0,
    description: 'GB03, LuckJingle, Peripage, Mini Bluetooth (Sürekli Rulo)'
  },
  {
    id: '80mm',
    name: '80mm POS / Adisyon',
    category: 'pos',
    widthMm: 72,
    heightMm: 0,
    widthDots: 576,
    heightDots: 0,
    description: 'Epson, Bixolon, Standart 80mm Adisyon & Fiş Yazıcı'
  },
  {
    id: '10x10',
    name: '10x10 cm (100x100 mm)',
    category: 'zebra',
    widthMm: 100,
    heightMm: 100,
    widthDots: 800,
    heightDots: 800,
    description: 'Zebra ZD220/ZD230 Kare Kargo, Depo ve Ürün Etiketi'
  },
  {
    id: '10x15',
    name: '10x15 cm (100x150 mm)',
    category: 'cargo',
    widthMm: 100,
    heightMm: 150,
    widthDots: 800,
    heightDots: 1200,
    description: 'Zebra ZD220 Standart E-Ticaret, Kargo & Sevk İrsaliyesi'
  },
  {
    id: '15x10',
    name: '15x10 cm (150x100 mm)',
    category: 'zebra',
    widthMm: 150,
    heightMm: 100,
    widthDots: 1200,
    heightDots: 800,
    description: 'Zebra ZD220 Yatay Koli, Sandık ve Palet Tanımlama Etiketi'
  },
  {
    id: '104mm',
    name: '104mm (4.09" Max)',
    category: 'zebra',
    widthMm: 104,
    heightMm: 0,
    widthDots: 832,
    heightDots: 0,
    description: 'Zebra ZD220 Tam Kafa Genişliği (832 Dot Continuous)'
  },
  {
    id: '50x30',
    name: '50x30 mm',
    category: 'zebra',
    widthMm: 50,
    heightMm: 30,
    widthDots: 400,
    heightDots: 240,
    description: 'Küçük Ürün ve Barkod Etiketi'
  },
  {
    id: '60x40',
    name: '60x40 mm',
    category: 'zebra',
    widthMm: 60,
    heightMm: 40,
    widthDots: 480,
    heightDots: 320,
    description: 'Standart Raf ve Fiyat Etiketi'
  },
  {
    id: '80x50',
    name: '80x50 mm',
    category: 'zebra',
    widthMm: 80,
    heightMm: 50,
    widthDots: 640,
    heightDots: 400,
    description: 'Orta Boy Kutu ve Koli Etiketi'
  }
];
