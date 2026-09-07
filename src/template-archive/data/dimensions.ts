import { LabelDimension } from '../types';

export const STANDARD_DIMENSIONS: LabelDimension[] = [
  {
    id: '57mm-roll',
    name: '57 mm Mini Rulo',
    widthMm: 57,
    description: 'Standart Taşınabilir Mini Termal Barkod & Fiş Yazıcıları',
    badge: 'Popüler 57mm'
  },
  {
    id: '57x30mm',
    name: '57 x 30 mm Etiket',
    widthMm: 57,
    heightMm: 30,
    description: 'Küçük Ürün ve Fiyat Etiketi',
    badge: '57x30'
  },
  {
    id: '57x50mm',
    name: '57 x 50 mm Etiket',
    widthMm: 57,
    heightMm: 50,
    description: 'Kavanoz & Kutu Ürün Etiketi',
    badge: '57x50'
  },
  {
    id: '80mm-roll',
    name: '80 mm POS Fiş',
    widthMm: 80,
    description: 'Restoran, Kafe ve Mağaza Satış Fişleri',
    badge: '80mm'
  },
  {
    id: '100x100mm',
    name: '100 x 100 mm (10x10 cm) Koli',
    widthMm: 100,
    heightMm: 100,
    description: 'Kare Koli, Pazaryeri & Depo Sevk Barkodu',
    badge: '10x10 cm'
  },
  {
    id: '100x150mm',
    name: '100 x 150 mm (10x15 cm) Kargo',
    widthMm: 100,
    heightMm: 150,
    description: 'Trendyol, Hepsiburada, Amazon & Resmi Kargo Barkodu (4x6")',
    badge: '10x15 cm Kargo'
  },
  {
    id: '100mm-roll',
    name: '100 mm (10 cm) Geniş Rulo',
    widthMm: 100,
    description: 'Koli, Gönderi & Büyük Ürün Etiketi',
    badge: '10 cm'
  },
  {
    id: '150mm-roll',
    name: '150 mm (15 cm) Endüstriyel',
    widthMm: 150,
    description: 'Büyük Boy Depo, Palet & Geniş Tasarım Etiketi',
    badge: '15 cm'
  }
];

export const CATEGORY_METADATA: { id: string; label: string; icon: string; countHint?: string }[] = [
  { id: 'all', label: 'Tüm Şablonlar', icon: 'LayoutGrid' },
  { id: 'pro', label: '⭐ Profesyonel Şablonlar', icon: 'Zap' },
  { id: 'ecommerce_shipping', label: 'Pazaryeri & Kargo Barkodları', icon: 'ShoppingBag' },
  { id: 'product', label: 'Ürün Etiketleri', icon: 'Tag' },
  { id: 'receipt', label: 'Sipariş & Fişler', icon: 'Receipt' },
  { id: 'inventory', label: 'Envanter & Barkod', icon: 'Barcode' },
  { id: 'shipping', label: 'Kargo & Gönderi', icon: 'Truck' },
  { id: 'warning', label: 'Uyarı & Güvenlik', icon: 'AlertTriangle' },
  { id: 'organization', label: 'Hizmet & Düzenleme', icon: 'Layers' },
  { id: 'stickers', label: 'Çıkartmalar & Tipografi', icon: 'Sparkles' },
  { id: 'notes', label: 'Not & Hatırlatıcı', icon: 'CheckSquare' },
  { id: 'custom', label: 'Benim Şablonlarım', icon: 'Bookmark' }
];
