/**
 * SPEC-02 — İş Modu Sistemi
 * 7 iş modu, araç haritası ve kalıcı mod tercihi.
 */

export type BusinessMode =
  | 'boutique'
  | 'marketplace'
  | 'cafe'
  | 'service'
  | 'appointment'
  | 'warehouse'
  | 'personal'
  | 'all';

/** Ana menü araçları — mevcut görünümler + gelecek modüller */
export type ToolId =
  | 'editor'
  | 'image'
  | 'templates'
  | 'archive'
  | 'tools'
  | 'document'
  | 'banner'
  | 'collage'
  | 'orders'
  | 'pos'
  | 'batch'
  | 'service'
  | 'appointments';

export interface ModeConfig {
  id: BusinessMode;
  label: string;
  icon: string; // lucide-react export adı
  /** Ana menü sırası — üsttekiler büyük kart, alttakiler normal kart */
  primaryTools: ToolId[];
  /** Bu moda özel otomatik yüklenen şablon paketi kimliği */
  templatePack: string[];
  /** İlk açılışta gösterilecek hızlı başlangıç adımları */
  onboardingSteps: string[];
}

export interface ModeStorage {
  mode: BusinessMode;
  configuredAt: number;
  seenOnboarding: boolean;
}

const STORAGE_KEY = 'iprint_business_mode_v1';

export const MODES: ModeConfig[] = [
  {
    id: 'boutique',
    label: 'Butik Satıcı',
    icon: 'ShoppingBag',
    primaryTools: ['templates', 'archive', 'editor', 'image', 'tools', 'document', 'banner', 'collage', 'batch'],
    templatePack: ['bt-thanks-card', 'bt-brand-card', 'bt-coupon', 'bt-price-tag', 'bt-ship-note', 'bt-package-receipt'],
    onboardingSteps: ['Teşekkür & marka kartlarını dene', 'Ürün fiyat etiketlerini bas', 'Kupon kodu dağıt'],
  },
  {
    id: 'marketplace',
    label: 'Pazaryeri Satıcısı',
    icon: 'Store',
    primaryTools: ['templates', 'archive', 'orders', 'batch', 'editor', 'image', 'tools', 'document'],
    templatePack: ['mp-ship-label', 'mp-order-note', 'mp-invoice-mini', 'mp-stock-tag', 'mp-return-info', 'mp-batch-sheet'],
    onboardingSteps: ['Trendyol siparişlerini bağla', 'Toplu kargo etiketi bas', 'Depo raf etiketleri oluştur'],
  },
  {
    id: 'cafe',
    label: 'Kafe / Restoran',
    icon: 'Coffee',
    primaryTools: ['templates', 'pos', 'tools', 'banner'],
    templatePack: ['cf-adisyon', 'cf-mutfak-siparis', 'cf-menu-fiyat', 'cf-hesap-fişi', 'cf-rezerve-masa', 'cf-gunsonu-rapor'],
    onboardingSteps: ['Adisyon / POS ekranını aç', 'Mutfak sipariş fişini bas', 'Menü fiyat etiketlerini güncelle'],
  },
  {
    id: 'service',
    label: 'Teknik Servis',
    icon: 'Wrench',
    primaryTools: ['templates', 'service', 'editor', 'tools'],
    templatePack: ['sv-kabul-formu', 'sv-tamir-etiketi', 'sv-garanti-belge', 'sv-parca-listesi', 'sv-teslim-makbuz', 'sv-ariza-rapor'],
    onboardingSteps: ['Cihaz kabul formunu bas', 'Servis takip numarası ver', 'Teslim makbuzu yazdır'],
  },
  {
    id: 'appointment',
    label: 'Randevulu Hizmet',
    icon: 'Scissors',
    primaryTools: ['templates', 'appointments', 'editor', 'tools'],
    templatePack: ['ap-randevu-karti', 'ap-hatirlatma', 'ap-fiyat-listesi', 'ap-uyelik-karti', 'ap-kampanya', 'ap-gunluk-plan'],
    onboardingSteps: ['Randevu takvimini aç', 'Hizmet fiyat listesini bas', 'Hatırlatma kartları oluştur'],
  },
  {
    id: 'warehouse',
    label: 'Depo / Toptancı',
    icon: 'Warehouse',
    primaryTools: ['templates', 'batch', 'tools', 'banner', 'document'],
    templatePack: ['wh-rafbasi', 'wh-palet-etiket', 'wh-envanter-liste', 'wh-alis-fisi', 'wh-sevkiyat-notu', 'wh-koli-icerigi'],
    onboardingSteps: ['Raf başı etiketleri yazdır', 'Toplu barkod üret', 'Sevkiyat notlarını hazırla'],
  },
  {
    id: 'personal',
    label: 'Kişisel & Genel',
    icon: 'Home',
    primaryTools: ['templates', 'archive', 'editor', 'image', 'tools', 'document', 'banner', 'collage', 'orders'],
    templatePack: ['ps-yapilacaklar', 'ps-market-listesi', 'ps-wifi-karti', 'ps-not-karti', 'ps-dogum-gunu', 'ps-etiketler'],
    onboardingSteps: ['Yapılacak listesi bas', 'Market alışverişi etiketi', 'Wi-Fi kartını misafire yapıştır'],
  },
  {
    id: 'all',
    label: 'Karma (Tüm Araçlar)',
    icon: 'LayoutGrid',
    primaryTools: ['templates', 'archive', 'editor', 'image', 'tools', 'document', 'banner', 'collage', 'batch', 'orders', 'pos', 'service', 'appointments'],
    templatePack: [],
    onboardingSteps: ['Tüm araçlar açık', 'Modu istediğin zaman değiştir'],
  },
];

export interface ToolMeta {
  title: string;
  keywords: string[];
  /** Görünüm henüz yoksa true — "Yakında" rozeti ile gösterilir */
  comingSoon?: boolean;
}

/** Global arama (⌘K) için statik araç kataloğu — gelecek araçlar dahil */
export const TOOL_CATALOG: Record<ToolId, ToolMeta> = {
  archive: { title: 'Mağaza', keywords: ['mağaza', 'arşiv', 'şablon', 'galeri', 'dinamik', 'etiket', 'rulo', 'keşfet', 'topluluk'] },
  templates: { title: 'Favoriler & Taslaklar', keywords: ['favoriler', 'taslaklar', 'şablon', 'hazır', 'tasarım', 'kalıp'] },
  editor: { title: 'Metin Editörü', keywords: ['metin', 'yazı', 'not', 'editör'] },
  image: { title: 'Görsel Baskı', keywords: ['fotoğraf', 'resim', 'görsel', 'filtre'] },
  tools: { title: 'QR & Barkod Araçları', keywords: ['qr', 'barkod', 'araç', 'kod'] },
  document: { title: 'PDF Belge Yazdırma', keywords: ['pdf', 'belge', 'döküman', 'dosya'] },
  banner: { title: 'Banner & Raf Etiketi', keywords: ['banner', 'raf', 'afiş', 'duyuru'] },
  collage: { title: 'Kolaj Tasarımcısı', keywords: ['kolaj', 'birleştir', 'çerçeve'] },
  orders: { title: 'Uygulamalar & Siparişler', keywords: ['sipariş', 'trendyol', 'kargo', 'pazaryeri', 'acil sağlık kartı', 'ice', 'polaroid', 'fotoğraf', 'oyunlar', 'bavul', 'çanta', 'kayıp', 'bagaj', 'luggage'] },
  pos: { title: 'Adisyon / POS', keywords: ['adisyon', 'kasa', 'fiş', 'masa'],  },
  batch: { title: 'Toplu İşlem', keywords: ['toplu', 'csv', 'excel', 'seri'],  },
  service: { title: 'Teknik Servis Takibi', keywords: ['servis', 'tamir', 'takip', 'onarım'],  },
  appointments: { title: 'Randevular', keywords: ['randevu', 'takvim', 'müşteri', 'saat'] },
};

export function getMode(): ModeStorage | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      MODES.some((m) => m.id === parsed.mode) &&
      typeof parsed.configuredAt === 'number' &&
      typeof parsed.seenOnboarding === 'boolean'
    ) {
      return parsed as ModeStorage;
    }
    return null;
  } catch {
    return null;
  }
}

export function setMode(mode: BusinessMode): ModeStorage {
  const prev = getMode();
  const entry: ModeStorage = {
    mode,
    configuredAt: Date.now(),
    seenOnboarding: prev?.seenOnboarding ?? false,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  return entry;
}

export function markOnboardingSeen(): void {
  const prev = getMode();
  if (!prev) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...prev, seenOnboarding: true }),
  );
}

export function clearMode(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Matris tutarlılık denetimi:
 * - her primaryTool TOOL_CATALOG'ta var olmalı
 * - her modda en az 3 primaryTool olmalı
 * - her katalog aracı en az bir modda kullanılmalı (— hiçbir araç tamamen gizlenmez)
 * @returns hata mesajları dizisi (boş = geçerli)
 */
export function validateModeMatrix(): string[] {
  const errors: string[] = [];
  for (const m of MODES) {
    if (m.primaryTools.length < 3) {
      errors.push(`${m.id}: primaryTools < 3 (${m.primaryTools.length})`);
    }
    for (const t of m.primaryTools) {
      if (!(t in TOOL_CATALOG)) errors.push(`${m.id}: bilinmeyen araç "${t}"`);
    }
  }
  const used = new Set<ToolId>(MODES.flatMap((m) => m.primaryTools));
  for (const t of Object.keys(TOOL_CATALOG) as ToolId[]) {
    if (!used.has(t)) errors.push(`"${t}" hiçbir modda görünmüyor`);
  }
  return errors;
}
