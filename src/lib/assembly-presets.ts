/**
 * Assembly Presets & Built-in Hardware Library
 * Kurulum şemalarında kullanılan hazır parça, donanım, mobilya ve ikon çizimleri
 */

export interface HardwareItem {
  id: string;
  name: string;
  code: string; // A, B, C, D vb.
  count: string; // 8 Adet, 4 Adet vb.
  iconSvg?: string;
  dataUrl?: string;
}

export interface AssemblyStepBlock {
  id: string;
  type: 'image' | 'text' | 'hardware_grid' | 'qr_block' | 'divider' | 'callout' | 'barcode';
  // Image Block Props
  imageHeight?: number; // px cinsinden yükseklik (100 - 600)
  imageDataUrl?: string;
  filterMode?: 'ikea_cad' | 'line_art' | 'original' | 'high_contrast' | 'blueprint_edge';
  lineThickness?: 'thin' | 'medium' | 'thick';
  detailLevel?: 'high' | 'balanced' | 'contours_only';
  noiseThreshold?: number;
  badgeText?: string; // "ŞEKİL 1", "ADIM 1 - MONTAJ" vb.
  hasBorder?: boolean;
  borderStyle?: 'solid' | 'dashed' | 'none';

  // Text Block Props
  stepNumber?: string; // "Adım 1", "Adım 2" vb.
  stepTitle?: string; // "Ayakların Gövdeye Sabitlenmesi"
  stepDescription?: string; // "Alyan vidasını (A) kullanarak ayakları taban yuvasına sıkınız."
  tipText?: string; // "⚠️ Vidaları tüm parçalar yerine oturmadan tam sıkmayınız."

  // Hardware Grid Props (2'li yan yana veya 4'lü grid)
  hardwareItems?: HardwareItem[];

  // QR Block Props
  qrTitle?: string;
  qrUrl?: string;
  qrSubtitle?: string;

  // Barcode Block Props
  barcodeTitle?: string;
  barcodeText?: string;
  barcodeType?: 'code128' | 'ean13';

  // Callout Props
  calloutTitle?: string;
  calloutText?: string;
  calloutIcon?: string;
}

export interface AssemblyManualData {
  id: string;
  title: string; // Ürün Adı (örn: "LUNA ÇALIŞMA MASASI")
  subTitle?: string; // Model Kodu (örn: "Model: LN-705 • 120x60cm")
  logoText?: string; // Mağaza / Marka Adı (örn: "DEKO MOBİLYA")
  logoDataUrl?: string; // Yüklenen logo resmi
  paperWidthPreset: number; // 384 (4.8cm), 576 (7.2cm), 800 (10cm), 1200 (15cm) vb.
  paperHeightPreset?: number; // Sabit yükseklik örn: 1200 (15cm) veya rulo için 0 / undefined
  canvasWidthCm?: number; // cm cinsinden genişlik (örn: 10)
  canvasHeightCm?: number; // cm cinsinden yükseklik (örn: 15)
  isAutoHeight?: boolean; // true = Sürekli rulo (içeriğe göre dinamik boy), false = Sabit etiket/sayfa boyutu
  supportPhone?: string; // "0850 123 45 67" veya "WhatsApp: 0532 123 45 67"
  showFooterLogo?: boolean;
  footerNote?: string; // "Eksik parça veya hasar durumunda lütfen WhatsApp destek hattımızdan iletişime geçiniz."
  blocks: AssemblyStepBlock[];
}

// Hazır Vektörel Kurulum İkonları (SVG data URI formatında)
export const ASSEMBLY_HARDWARE_ICONS = {
  screw_hex: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <polygon points="50,12 80,28 80,64 50,80 20,64 20,28" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <polygon points="50,26 68,36 68,56 50,66 32,56 32,36" fill="#000000"/>
  </svg>`,
  screw_wood: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect x="32" y="10" width="36" height="14" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <line x1="50" y1="12" x2="50" y2="22" stroke="#000000" stroke-width="5"/>
    <polygon points="40,24 60,24 55,75 50,88 45,75" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <line x1="40" y1="36" x2="60" y2="44" stroke="#000000" stroke-width="4"/>
    <line x1="40" y1="50" x2="60" y2="58" stroke="#000000" stroke-width="4"/>
    <line x1="42" y1="64" x2="58" y2="72" stroke="#000000" stroke-width="4"/>
  </svg>`,
  allen_key: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M22,25 L72,25 A10,10 0 0,1 82,35 L82,82" fill="none" stroke="#000000" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  dowel_wood: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect x="36" y="15" width="28" height="70" rx="8" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <line x1="43" y1="25" x2="43" y2="75" stroke="#000000" stroke-width="3" stroke-dasharray="4,4"/>
    <line x1="57" y1="25" x2="57" y2="75" stroke="#000000" stroke-width="3" stroke-dasharray="4,4"/>
  </svg>`,
  minifix_cam: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="35" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <path d="M50,22 L50,50 L70,62" fill="none" stroke="#000000" stroke-width="7" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="7" fill="#000000"/>
  </svg>`,
  furniture_leg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect x="22" y="15" width="56" height="12" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <polygon points="30,27 70,27 62,82 38,82" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <rect x="34" y="82" width="32" height="8" rx="2" fill="#000000"/>
  </svg>`,
  bracket_l: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M25,18 L44,18 L44,62 L82,62 L82,80 L25,80 Z" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <circle cx="34" cy="35" r="5" fill="#000000"/>
    <circle cx="65" cy="71" r="5" fill="#000000"/>
  </svg>`,
  screwdriver: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <path d="M22,22 L42,42 L36,48 L16,28 Z" fill="#FFFFFF" stroke="#000000" stroke-width="4"/>
    <rect x="36" y="36" width="38" height="16" rx="5" transform="rotate(45 55 44)" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <line x1="68" y1="58" x2="88" y2="78" stroke="#000000" stroke-width="8" stroke-linecap="round"/>
  </svg>`,
  hinge_door: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="32" cy="50" r="22" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <rect x="42" y="28" width="42" height="44" rx="4" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <circle cx="32" cy="50" r="6" fill="#000000"/>
    <circle cx="62" cy="38" r="4" fill="#000000"/>
    <circle cx="62" cy="62" r="4" fill="#000000"/>
  </svg>`,
  nut_washer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <circle cx="50" cy="50" r="35" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
    <circle cx="50" cy="50" r="18" fill="#FFFFFF" stroke="#000000" stroke-width="5"/>
  </svg>`
};

// Hazır Referans Çizim (Kullanıcının gönderdiği Masa Çizgisel Şablonu)
export const BUILTIN_TABLE_LINEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <!-- Masa Üst Tablası (İzometrik Çizgi) -->
  <polygon points="250,80 440,140 220,205 48,138" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
  <polygon points="48,138 220,205 220,215 48,148" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
  <polygon points="220,205 440,140 440,150 220,215" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>

  <!-- Ön Sol Ayak -->
  <polyline points="55,150 55,390 68,390 68,154" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
  
  <!-- Ön Orta/Sağ Ayak -->
  <polyline points="210,217 210,445 223,445 223,217" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>
  
  <!-- Arka Sol Ayak -->
  <polyline points="270,165 270,340 283,340 283,170" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>

  <!-- Arka Sağ Ayak -->
  <polyline points="420,152 420,395 433,395 433,148" fill="#FFFFFF" stroke="#000000" stroke-width="4" stroke-linejoin="round"/>

  <!-- Alt Destek / Çerçeve Çizgileri -->
  <line x1="68" y1="165" x2="210" y2="225" stroke="#000000" stroke-width="3"/>
  <line x1="223" y1="225" x2="420" y2="162" stroke="#000000" stroke-width="3"/>
</svg>`;

export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

// Varsayılan Örnek Kurulum Şeması Verisi
export const INITIAL_ASSEMBLY_MANUAL: AssemblyManualData = {
  id: 'manual-demo-table',
  title: 'MODERN ÇALIŞMA MASASI KURULUM KILAVUZU',
  subTitle: 'Model: LUNA-120 • Ölçü: 120x60x75 cm',
  logoText: 'DEKO MOBİLYA A.Ş.',
  paperWidthPreset: 576, // 80mm
  supportPhone: 'WhatsApp Destek: 0532 999 88 77',
  showFooterLogo: true,
  footerNote: 'Parça eksiği veya hasar durumunda lütfen parçayı monte etmeden önce WhatsApp destek hattımızdan iletişime geçiniz.',
  blocks: [
    {
      id: 'blk-hardware-summary',
      type: 'hardware_grid',
      hardwareItems: [
        {
          id: 'hw-1',
          code: 'A',
          name: 'M6x35mm Alyan Vida',
          count: '8 Adet',
          iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_hex
        },
        {
          id: 'hw-2',
          code: 'B',
          name: '4mm Alyan Anahtarı',
          count: '1 Adet',
          iconSvg: ASSEMBLY_HARDWARE_ICONS.allen_key
        },
        {
          id: 'hw-3',
          code: 'C',
          name: 'Ayarlanabilir Pabuç Ayak',
          count: '4 Adet',
          iconSvg: ASSEMBLY_HARDWARE_ICONS.furniture_leg
        },
        {
          id: 'hw-4',
          code: 'D',
          name: 'Ahşap Kavela Dübel',
          count: '4 Adet',
          iconSvg: ASSEMBLY_HARDWARE_ICONS.dowel_wood
        }
      ]
    },
    {
      id: 'blk-step-1-title',
      type: 'text',
      stepNumber: '1. ADIM',
      stepTitle: 'Masa Ayaklarının Çerçeveye Montajı',
      stepDescription: 'Üst ahşap tablayı temiz ve yumuşak bir zemin üzerine ters şekilde yatırınız. Metal ayakları köşe yuvalarına denk getirip (A) alyan vidaları ile sabitleyiniz.',
      tipText: '⚠️ Ayak vidalarını tüm ayaklar oturana kadar yarı sıkı bırakınız.'
    },
    {
      id: 'blk-step-1-img',
      type: 'image',
      imageHeight: 280,
      imageDataUrl: svgToDataUrl(BUILTIN_TABLE_LINEART_SVG),
      filterMode: 'line_art',
      badgeText: 'ŞEKİL 1: GENEL MONTAJ DÜZENİ',
      hasBorder: true,
      borderStyle: 'solid'
    },
    {
      id: 'blk-step-2-title',
      type: 'text',
      stepNumber: '2. ADIM',
      stepTitle: 'Pabuç Ayakların Takılması & Denge',
      stepDescription: '4 adet ayarlanabilir pabuç ayağı (C) masa ayaklarının altındaki dişli yuvalara saat yönünde çevirerek takınız. Masayı dikkatlice düz konuma çeviriniz.',
      tipText: 'Masayı zemine göre pabuçları döndürerek teraziye alınız.'
    },
    {
      id: 'blk-qr-guide',
      type: 'qr_block',
      qrTitle: '📱 VİDEOLU KURULUM KILAVUZU',
      qrUrl: 'https://youtube.com/results?search_query=masa+kurulumu',
      qrSubtitle: 'Telefonunuzun kamerasıyla QR kodu okutarak adım adım videolu montaj kılavuzunu izleyebilirsiniz.'
    }
  ]
};
