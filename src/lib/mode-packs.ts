/**
 * SPEC-02 §6 — Mod Şablon Paketleri
 * TemplateStudio payload formatı; değişkenler {Degisken} olarak gömülür.
 */
import type { BusinessMode } from './business-modes';

export type PackCategory =
  | 'todo'
  | 'shipping'
  | 'wifi'
  | 'receipt'
  | 'pantry'
  | 'price'
  | 'article';

export interface PackTemplate {
  id: string;
  title: string;
  category: PackCategory;
  payload: Record<string, unknown>;
}

const PACKS_KEY = 'iprint_mode_packs_installed_v1';

interface InstalledPack {
  installed: boolean;
  installedAt: number;
  count: number;
  templates: PackTemplate[];
}

/* ── Butik Satıcı ─────────────────────────────────────────── */
const BOUTIQUE: PackTemplate[] = [
  {
    id: 'bt-thanks-card', title: 'Teşekkür Kartı', category: 'article',
    payload: {
      articleTitle: 'TEŞEKKÜRLER {Musteri_Adi}!', articleAuthor: '{Marka_Adi}',
      articleContent: 'Siparişinizi özenle hazırladık.\n\nBizi tercih ettiğiniz için teşekkür ederiz! Beğendiğinizde {Instagram} hesabımızdan fotoğrafınızı paylaşabilirsiniz.\n\nİyi günler dileriz.',
    },
  },
  {
    id: 'bt-brand-card', title: 'Marka Kartı', category: 'receipt',
    payload: {
      storeName: '{Marka_Adi}', storeSub: '{Instagram}', receiptNumber: 'NO: {Siparis_No}',
      receiptItems: [], receiptTax: 0,
      receiptFooter: 'Takipte kalın: {Instagram} • {Web_Sitesi}',
    },
  },
  {
    id: 'bt-coupon', title: 'Kupon Kodu', category: 'price',
    payload: {
      productName: '%10 İNDİRİM KUPONU', oldPrice: '', newPrice: '', currency: 'TL',
      promoBadge: '{Kod}', productBarcode: '',
    },
  },
  {
    id: 'bt-price-tag', title: 'Ürün Fiyat Etiketi', category: 'price',
    payload: {
      productName: '{Urun_Adi}', oldPrice: '{Eski_Fiyat}', newPrice: '{Yeni_Fiyat}',
      currency: 'TL', promoBadge: '{Etiket}', productBarcode: '{Barkod}',
    },
  },
  {
    id: 'bt-ship-note', title: 'Kargo Notu', category: 'shipping',
    payload: {
      senderName: '{Marka_Adi}', senderPhone: '{Telefon}', senderAddress: '{Adres}',
      receiverName: '{Musteri_Adi}', receiverPhone: '', receiverAddress: '',
      trackingNumber: '{Takip_No}', isFragile: true,
    },
  },
  {
    id: 'bt-package-receipt', title: 'Paket İçi Fiş', category: 'receipt',
    payload: {
      storeName: '{Marka_Adi}', storeSub: 'Paket İçeriği Fişi', receiptNumber: 'NO: {Siparis_No}',
      receiptItems: [{ name: '{Urun_1}', qty: 1, price: 0 }, { name: '{Urun_2}', qty: 1, price: 0 }],
      receiptTax: 0,
      receiptFooter: 'Değişim/iade için fişi saklayın. Sorularınız: {Instagram}',
    },
  },
];

/* ── Pazaryeri Satıcısı ───────────────────────────────────── */
const MARKETPLACE: PackTemplate[] = [
  {
    id: 'mp-ship-label', title: 'Kargo Gönderi Etiketi', category: 'shipping',
    payload: {
      senderName: '{Magaza_Adi}', senderPhone: '{Telefon}', senderAddress: '{Depo_Adres}',
      receiverName: '{Alici_Adi}', receiverPhone: '{Alici_Telefon}', receiverAddress: '{Alici_Adres}',
      trackingNumber: '{Takip_No}', isFragile: false,
    },
  },
  {
    id: 'mp-order-note', title: 'Sipariş Notu', category: 'receipt',
    payload: {
      storeName: '{Magaza_Adi}', storeSub: 'Sipariş: {Platform}', receiptNumber: 'NO: {Siparis_No}',
      receiptItems: [{ name: '{Urun_1}', qty: 1, price: 0 }, { name: '{Urun_2}', qty: 1, price: 0 }],
      receiptTax: 0,
      receiptFooter: 'Trendyol / Hepsiburada siparişi — kargoya verildi: {Gonderim_Tarihi}',
    },
  },
  {
    id: 'mp-invoice-mini', title: 'Mini Fatura', category: 'receipt',
    payload: {
      storeName: '{Magaza_Adi}', storeSub: '{Vergi_Daire}', receiptNumber: 'NO: {Fatura_No}',
      receiptItems: [{ name: '{Urun_Adi}', qty: 2, price: 149.9 }],
      receiptTax: 20, receiptFooter: 'VKN: {VKN} — Teşekkür ederiz!',
    },
  },
  {
    id: 'mp-stock-tag', title: 'Stok Raf Etiketi', category: 'pantry',
    payload: {
      pantryItem: '{Urun_Adi}', pantryCategory: '{Kategori}',
      pantryPackDate: '{Stok_Girisi}', pantryExpiryDate: '{Son_Kontrol}', pantryStorage: 'Raf {Raf_No}',
    },
  },
  {
    id: 'mp-return-info', title: 'İade Bilgi Kartı', category: 'article',
    payload: {
      articleTitle: 'İADE & DEĞİŞİM KOŞULLARI', articleAuthor: '{Magaza_Adi}',
      articleContent: '14 gün içinde ücretsiz iade hakkınız vardır.\n\nİade talebi: {Iade_Link}\nDestek: {Telefon}',
    },
  },
  {
    id: 'mp-batch-sheet', title: 'Toplu Gönderi Listesi', category: 'todo',
    payload: {
      todoTitle: 'KARGO LİSTESİ — {Tarih}', todoDate: '{Tarih}',
      items: ['{Takip_No_1} — {Alici_1}', '{Takip_No_2} — {Alici_2}', '{Takip_No_3} — {Alici_3}'],
    },
  },
];

/* ── Kafe / Restoran ──────────────────────────────────────── */
const CAFE: PackTemplate[] = [
  {
    id: 'cf-adisyon', title: 'Masa Adisyonu', category: 'receipt',
    payload: {
      storeName: '{Isletme_Adi}', storeSub: 'Masa: {Masa_No}', receiptNumber: 'ADİSYON NO: {Adisyon_No}',
      receiptItems: [{ name: '{Urun_1}', qty: 1, price: 0 }, { name: '{Urun_2}', qty: 2, price: 0 }],
      receiptTax: 10, receiptFooter: 'Garson: {Garson_Adi} — Afiyet olsun!',
    },
  },
  {
    id: 'cf-mutfak-siparis', title: 'Mutfak Sipariş Fişi', category: 'todo',
    payload: {
      todoTitle: 'MUFAK — MASA {Masa_No}', todoDate: '{Tarih}',
      items: ['{Urun_1} ({Adet}) — {Not_1}', '{Urun_2} ({Adet}) — {Not_2}', '{Urun_3} ({Adet})'],
    },
  },
  {
    id: 'cf-menu-fiyat', title: 'Menü Fiyat Etiketi', category: 'price',
    payload: {
      productName: '{Urun_Adi}', oldPrice: '{Eski_Fiyat}', newPrice: '{Fiyat}',
      currency: 'TL', promoBadge: '{Kampanya}', productBarcode: '{Urun_Kodu}',
    },
  },
  {
    id: 'cf-hesap-fisi', title: 'Ödeme Hesap Fişi', category: 'receipt',
    payload: {
      storeName: '{Isletme_Adi}', storeSub: '{Adres}', receiptNumber: 'FİŞ NO: {Fis_No}',
      receiptItems: [{ name: 'Filtre Kahve', qty: 2, price: 65 }, { name: '{Urun_2}', qty: 1, price: 0 }],
      receiptTax: 10, receiptFooter: 'Bizi tercih ettiğiniz için teşekkürler! Yine bekleriz.',
    },
  },
  {
    id: 'cf-rezerve-masa', title: 'Rezervasyon Kartı', category: 'article',
    payload: {
      articleTitle: 'REZERVASYON', articleAuthor: '{Isletme_Adi}',
      articleContent: 'Masa No: {Masa_No}\nSaat: {Randevu_Saati}\nMisafir: {Musteri_Adi}\nKişi Sayısı: {Kisi_Sayisi}',
    },
  },
  {
    id: 'cf-gunsonu-rapor', title: 'Gün Sonu Raporu', category: 'receipt',
    payload: {
      storeName: '{Isletme_Adi}', storeSub: 'GÜN SONU — {Tarih}', receiptNumber: 'Z RAPORU',
      receiptItems: [{ name: 'Toplam Adisyon', qty: 1, price: 0 }, { name: 'Nakit', qty: 1, price: 0 }, { name: 'Kart', qty: 1, price: 0 }],
      receiptTax: 0, receiptFooter: 'Kasa Sorumlusu: {Personel}',
    },
  },
];

/* ── Teknik Servis ────────────────────────────────────────── */
const SERVICE: PackTemplate[] = [
  {
    id: 'sv-kabul-formu', title: 'Cihaz Kabul Formu', category: 'receipt',
    payload: {
      storeName: '{Servis_Adi}', storeSub: 'CİHAZ KABUL FORMU', receiptNumber: 'SERVIS NO: {Servis_No}',
      receiptItems: [{ name: '{Cihaz_Marka_Model}', qty: 1, price: 0 }],
      receiptTax: 0,
      receiptFooter: 'Müşteri: {Musteri_Adi} • Tel: {Telefon} • Kabul: {Tarih}',
    },
  },
  {
    id: 'sv-tamir-etiketi', title: 'Tamir Durum Etiketi', category: 'pantry',
    payload: {
      pantryItem: '{Cihaz_Marka_Model}', pantryCategory: '{Ariza_Tanimi}',
      pantryPackDate: '{Kabul_Tarihi}', pantryExpiryDate: '{Teslim_Tarihi}',
      pantryStorage: 'Raf {Raf_No} — Durum: {Durum}',
    },
  },
  {
    id: 'sv-garanti-belge', title: 'Garanti Belgesi', category: 'article',
    payload: {
      articleTitle: 'GARANTİ BELGESİ — {Servis_No}', articleAuthor: '{Servis_Adi}',
      articleContent: 'Yapılan işlem: {Islem_Tanimi}\nGaranti süresi: {Garanti_Sure} ay\nBaşlangıç: {Teslim_Tarihi}\nKoşullar: kullanıcı kaynaklı hasarlar kapsam dışıdır.',
    },
  },
  {
    id: 'sv-parca-listesi', title: 'Parça Listesi', category: 'todo',
    payload: {
      todoTitle: 'PARÇA LİSTESİ — {Servis_No}', todoDate: '{Tarih}',
      items: ['{Parca_1} — {Parca_Fiyat_1}', '{Parca_2} — {Parca_Fiyat_2}', 'İşçilik — {Iscilik_Ucreti}'],
    },
  },
  {
    id: 'sv-teslim-makbuz', title: 'Teslim Makbuzu', category: 'receipt',
    payload: {
      storeName: '{Servis_Adi}', storeSub: 'TESLİM TESLİM ALMA MAKBUZU', receiptNumber: 'SERVIS NO: {Servis_No}',
      receiptItems: [{ name: '{Cihaz_Marka_Model}', qty: 1, price: 0 }],
      receiptTax: 20, receiptFooter: 'Toplam: {Toplam_Ucret} TL — Teslim Eden: {Personel}',
    },
  },
  {
    id: 'sv-ariza-rapor', title: 'Arıza Tespit Raporu', category: 'article',
    payload: {
      articleTitle: 'ARIZA TESPİT RAPORU — {Servis_No}', articleAuthor: '{Teknisyen_Adi}',
      articleContent: 'Bildirilen arıza: {Ariza_Bildirimi}\n\nTespit edilen sorun:\n{Tespit}\n\nÇözüm önerisi:\n{Cozum_Onerisi}',
    },
  },
];

/* ── Randevulu Hizmet ─────────────────────────────────────── */
const APPOINTMENT: PackTemplate[] = [
  {
    id: 'ap-randevu-karti', title: 'Randevu Kartı', category: 'article',
    payload: {
      articleTitle: 'RANDEVUNUZ HAZIR', articleAuthor: '{Isletme_Adi}',
      articleContent: 'Sayın {Musteri_Adi},\n\nTarih & Saat: {Randevu_Tarihi} {Randevu_Saati}\nHizmet: {Hizmet_Adi}\nPersonel: {Personel_Adi}\n\nLütfen 5 dk önce geliniz.',
    },
  },
  {
    id: 'ap-hatirlatma', title: 'Hatırlatma Fişi', category: 'todo',
    payload: {
      todoTitle: 'HATIRLATMA — {Musteri_Adi}', todoDate: '{Randevu_Tarihi}',
      items: ['{Randevu_Saati} — {Hizmet_Adi}', 'Tel: {Telefon}', 'Not: {Not}'],
    },
  },
  {
    id: 'ap-fiyat-listesi', title: 'Hizmet Fiyat Listesi', category: 'receipt',
    payload: {
      storeName: '{Isletme_Adi}', storeSub: 'FİYAT LİSTEMİZ', receiptNumber: '',
      receiptItems: [{ name: '{Hizmet_1}', qty: 1, price: 0 }, { name: '{Hizmet_2}', qty: 1, price: 0 }, { name: '{Hizmet_3}', qty: 1, price: 0 }],
      receiptTax: 0, receiptFooter: 'Rezervasyon: {Telefon}',
    },
  },
  {
    id: 'ap-uyelik-karti', title: 'Üyelik Kartı', category: 'pantry',
    payload: {
      pantryItem: '{Musteri_Adi}', pantryCategory: '{Paket_Adi}',
      pantryPackDate: '{Baslangic_Tarihi}', pantryExpiryDate: '{Bitis_Tarihi}',
      pantryStorage: 'Kalan Seans: {Kalan_Seans}',
    },
  },
  {
    id: 'ap-kampanya', title: 'Kampanya Duyurusu', category: 'price',
    payload: {
      productName: '{Kampanya_Baslik}', oldPrice: '{Normal_Fiyat}', newPrice: '{Kampanyali_Fiyat}',
      currency: 'TL', promoBadge: '{Kod}', productBarcode: '',
    },
  },
  {
    id: 'ap-gunluk-plan', title: 'Günlük Randevu Planı', category: 'todo',
    payload: {
      todoTitle: 'GÜNLÜK PLAN — {Tarih}', todoDate: '{Tarih}',
      items: ['{Saat_1} — {Musteri_1}', '{Saat_2} — {Musteri_2}', '{Saat_3} — {Musteri_3}'],
    },
  },
];

/* ── Depo / Toptancı ──────────────────────────────────────── */
const WAREHOUSE: PackTemplate[] = [
  {
    id: 'wh-rafbasi', title: 'Raf Başı Etiketi', category: 'pantry',
    payload: {
      pantryItem: '{Urun_Adi}', pantryCategory: '{Kategori}',
      pantryPackDate: '{Stok_Girisi}', pantryExpiryDate: '{Son_Kontrol}',
      pantryStorage: 'RAF {Raf_No} — Bölüm {Bolum}',
    },
  },
  {
    id: 'wh-palet-etiket', title: 'Palet Etiketi', category: 'shipping',
    payload: {
      senderName: '{Depo_Adi}', senderPhone: '{Telefon}', senderAddress: '{Depo_Adres}',
      receiverName: '{Alici_Firma}', receiverPhone: '', receiverAddress: '{Sevk_Adres}',
      trackingNumber: 'PALET-{Palet_No}', isFragile: false,
    },
  },
  {
    id: 'wh-envanter-liste', title: 'Envanter Kontrol Listesi', category: 'todo',
    payload: {
      todoTitle: 'ENVANTER — {Depo_Bolum}', todoDate: '{Tarih}',
      items: ['{Urun_1}: {Miktar_1}', '{Urun_2}: {Miktar_2}', '{Urun_3}: {Miktar_3}'],
    },
  },
  {
    id: 'wh-alis-fisi', title: 'Alış Fişi', category: 'receipt',
    payload: {
      storeName: '{Depo_Adi}', storeSub: 'ALIŞ FİŞİ', receiptNumber: 'NO: {Fis_No}',
      receiptItems: [{ name: '{Urun_1}', qty: 1, price: 0 }, { name: '{Urun_2}', qty: 1, price: 0 }],
      receiptTax: 20, receiptFooter: 'Tedarikçi: {Tedarikci_Adi} — İrsaliye: {Irsaliye_No}',
    },
  },
  {
    id: 'wh-sevkiyat-notu', title: 'Sevkiyat Notu', category: 'shipping',
    payload: {
      senderName: '{Depo_Adi}', senderPhone: '{Telefon}', senderAddress: '',
      receiverName: '{Alici_Firma}', receiverPhone: '{Alici_Telefon}', receiverAddress: '{Alici_Adres}',
      trackingNumber: 'SEVK-{Sevk_No}', isFragile: true,
    },
  },
  {
    id: 'wh-koli-icerigi', title: 'Koli İçerik Fişi', category: 'receipt',
    payload: {
      storeName: '{Depo_Adi}', storeSub: 'KOLİ İÇERİĞİ', receiptNumber: 'KOLİ NO: {Koli_No}',
      receiptItems: [{ name: '{Urun_1}', qty: 1, price: 0 }, { name: '{Urun_2}', qty: 1, price: 0 }],
      receiptTax: 0, receiptFooter: 'Toplam Koli: {Koli_Sayisi} — Hazırlayan: {Personel}',
    },
  },
];

/* ── Kişisel ──────────────────────────────────────────────── */
const PERSONAL: PackTemplate[] = [
  {
    id: 'ps-yapilacaklar', title: 'Yapılacaklar Listesi', category: 'todo',
    payload: {
      todoTitle: 'GÜNLÜK PLAN', todoDate: '{Tarih}',
      items: ['Sabah spor', '{Gorev_1}', '{Gorev_2}', 'Akşam alışveriş'],
    },
  },
  {
    id: 'ps-market-listesi', title: 'Market Listesi', category: 'todo',
    payload: {
      todoTitle: 'MARKET LİSTESİ — {Hafta}', todoDate: '{Tarih}',
      items: ['{Urun_1}', '{Urun_2}', '{Urun_3}'],
    },
  },
  {
    id: 'ps-wifi-karti', title: 'Ev Wi-Fi Kartı', category: 'wifi',
    payload: {
      wifiSsid: '{Ag_Adi}', wifiPassword: '{Sifre}', wifiSecurity: 'WPA',
      wifiMessage: 'Misafir ağımıza hoş geldiniz! QR kodu tarayarak bağlanın.',
    },
  },
  {
    id: 'ps-not-karti', title: 'Buzdolabı Notu', category: 'article',
    payload: {
      articleTitle: '{Baslik}', articleAuthor: '{Kim_Icin}',
      articleContent: '{Mesaj}\n\n— {Imzalayan}',
    },
  },
  {
    id: 'ps-dogum-gunu', title: 'Doğum Günü Kartı', category: 'article',
    payload: {
      articleTitle: 'DOĞUM GÜNÜN KUTLU OLSUN!', articleAuthor: '{Kimden}',
      articleContent: 'Sevgili {Kisi_Adi},\n\nMutlu yıllar! Bu yıl en güzel hayallerin gerçek olsun. 🎂\n\n{Ozel_Not}',
    },
  },
  {
    id: 'ps-etiketler', title: 'Eşya Etiketleri', category: 'pantry',
    payload: {
      pantryItem: '{Esya_Adi}', pantryCategory: '{Dolap/Bölüm}',
      pantryPackDate: '{Paketleme_Tarihi}', pantryExpiryDate: '{Son_Kullanma}',
      pantryStorage: 'Saklama: {Yer}',
    },
  },
];

export const MODE_PACKS: Record<BusinessMode, PackTemplate[]> = {
  boutique: BOUTIQUE,
  marketplace: MARKETPLACE,
  cafe: CAFE,
  service: SERVICE,
  appointment: APPOINTMENT,
  warehouse: WAREHOUSE,
  personal: PERSONAL,
  all: [],
};

function readInstalled(): Record<string, InstalledPack> {
  try {
    const raw = window.localStorage.getItem(PACKS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, InstalledPack>) : {};
  } catch {
    return {};
  }
}

/** Modun şablon paketini localStorage'a yükler; eklenen şablon sayısını döndürür. */
export function installPack(mode: BusinessMode): number {
  const pack = MODE_PACKS[mode] ?? [];
  if (pack.length === 0) return 0;
  const all = readInstalled();
  all[mode] = {
    installed: true,
    installedAt: Date.now(),
    count: pack.length,
    templates: pack,
  };
  window.localStorage.setItem(PACKS_KEY, JSON.stringify(all));
  return pack.length;
}

export function isInstalled(mode: BusinessMode): boolean {
  return readInstalled()[mode]?.installed === true;
}

/** Şablonlar ekranının paketi okuması için */
export function getInstalledTemplates(mode: BusinessMode): PackTemplate[] {
  return readInstalled()[mode]?.templates ?? [];
}
