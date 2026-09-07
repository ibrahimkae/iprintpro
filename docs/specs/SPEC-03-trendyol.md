# SPEC-03 — Trendyol Entegrasyonu (Sipariş → Etiket)

> Durum: DETAY SPEC — onay bekliyor
> Önem: ★★★
> Test ortamı: kullanıcının mevcut Trendyol API erişimi kullanılır
> (anahtarlar `server/.env` içinde; kod ve git'e ASLA girmez)
> Bağımlılık: SPEC-01 (etiket şablonları değişken motorunu kullanır),
> Faz 6 backend (proxy + anahtar saklama)

## 1. Mimari Karar: Neden Backend Proxy?

Trendyol API temel kimlik doğrulaması (supplierId + apiKey + apiSecret) kullanır.
Anahtarlar tarayıcıda tutulursa herkes DevTools'tan çalar. Bu yüzden:

```
PWA ──JWT──▶ server /api/trendyol/* ──basic-auth──▶ api.trendyol.com
                ▲ anahtarlar burada (server .env)
```

- Anahtarlar yalnızca sunucuda; istemci yalnız kendi JWT'siyle sorar
- Electron/masaüstü sürümde ileride "yerel anahtar" modu eklenebilir — şimdilik tek yol proxy

## 2. Sunucu Tarafı

### 2.1 Yapılandırma (`server/.env`)
```
TRENDYOL_SUPPLIER_ID=...
TRENDYOL_API_KEY=...
TRENDYOL_API_SECRET=...
TRENDYOL_BASE_URL=https://apigw.trendyol.com   # test için değiştirilebilir
```

### 2.2 Endpoint'ler (istemciye açılan)

| Yöntem | Yol | Açıklama |
|---|---|---|
| GET | `/api/trendyol/orders?status=&page=&size=&startDate=` | Bekleyen siparişler (normalize edilmiş) |
| GET | `/api/trendyol/orders/:orderNumber` | Tek sipariş detayı (paket bazlı) |
| POST | `/api/trendyol/cache/refresh` | Elle yenile (rate limit korumalı) |

- Yanıt **normalize edilir** — istemci Trendyol ham JSON'unu görmez:

```ts
interface NormalizedOrder {
  orderNumber: string;
  packageId: string;
  status: string;               // Created|Picking|Invoiced|Shipped...
  customerName: string;
  customerPhone?: string;
  shippingAddress: {
    line1: string; district: string; city: string;
    postalCode?: string; country: string;
  };
  items: { name: string; sku: string; barcode?: string; quantity: number; variant?: string }[];
  totalPrice: number;           // TRY
  cargoProviderName?: string;
  cargoTrackingNumber?: string;
  createdAt: number;            // epoch ms
}
```

### 2.3 Rate limit & dayanıklılık
- Trendyol tarafı: saniyede istek sınırı var → server'da basit kuyruk + 429'da üstel bekleme
- İstemci tarafı: @fastify/rate-limit ile kullanıcı başına dakikalık tavan
- Hata sözlüğü TR: "Anahtar geçersiz", "Bağlantı zaman aşımı", "Sipariş bulunamadı"

## 3. İstemci Tarafı

### 3.1 Yeni görünüm: **Siparişler** (`view: orders`, SPEC-02'de marketplace moda bağlı)
Ekran akışı:
1. Üstte filtre satırı: durum çipleri (Bekliyor/Hazırlanıyor/Tümü) + tarih aralığı + arama
2. Sipariş listesi: her satır → müşteri, paket no, kalem sayısı, tutar, [☑] seçim kutusu
3. Alt bar: "Seçili N etiketi bas" + "Koli fişi bas" + toplu ilerleme çubuğu

### 3.2 Etiket üretimi
- Hazır **kargo etiketi şablonu** (SPEC-01 değişkenli):
  `{Musteri_Adi}`, `{Adres}`, `{Ilce}/{Il}`, `{Paket_No}` barkod, `{Takip_No}`,
  kalemler tablosu, `{Cargo}`
- 58mm dikey düzen: barkod en altta (tarayıcı için), adres orta blokta büyük punto
- Koli fişi ayrı şablon: kalemler + adetler + sipariş no QR

### 3.3 Toplu baskı boru hattı
```
seçili siparişler → her biri için resolveVariables → bitmap → printBitmap sırası
                 ↘ her başarılı baskıdan sonra işaretle (localStorage set)
                 ↘ iptal edilirse kaldığı yerden devam seçeneği
```
Mevcut `sendData` ACK flow-control'ü sayesinde seri baskı güvenliği zaten sağlı.

### 3.4 Paketleme doğrulama (v1 içinde basit hali)
- Etiket basılan paket "basıldı" işaretlenir
- Kalem barkodu okutma girişi varsa eşleşme ✓/✗ gösterilir (kamera API'si web'de sınırlı → manuel giriş da kabul)

## 4. Veri Saklama

| Veri | Nerede | Süre |
|---|---|---|
| Normalize sipariş önbelleği | server bellek + 15dk disk cache | kısa |
| "Basıldı" işaretleri | localStorage `iprint_printed_packages_v1` | kalıcı |
| Baskı geçmişi | mevcut historyStorage | mevcut davranış |

Müşteri adres verisi cihaz dışına yalnızca yazdırma anında gider (canvas'a işlenir);
kalıcı olarak sunucuda saklanmaz — KVKK notu.

## 5. Test Planı (kullanıcının gerçek API'siyle)

1. **Bağlantı testi:** server'a anahtar girilir → `/health/trendyol` endpoint'i
   supplier bilgisi döner (ad, e-posta maskeli)
2. **Liste testi:** son 7 günün siparişleri çekilir, normalize şema doğrulanır
3. **Tek etiket:** gerçek bir siparişle etiket basılır → barkod okutularak alan kontrolü
4. **Toplu test:** ≥10 paket seçilip seri baskı; kesinti simülasyonu (BT kapama) → devam davranışı
5. **Hata senaryoları:** yanlış anahtar (401), boş liste, rate limit (hızlı yenilemeler)

Her adımın kabul kriteri spec'in sonundaki listede.

## 6. Kabul Kriterleri

1. Anahtarlar yalnızca `server/.env`'de; repoda hiçbir yerde düz metin yok (grep testi CI'a eklenir)
2. İstemci, Trendyol domainine doğrudan istek atmaz (network assert)
3. Sipariş listesi sayfalı; 200+ pakette akıcılık korunur (virtual scroll)
4. Tek etiket: tüm zorunlu alanlar dolu, barkod ilk okumada çözülür
5. Toplu baskıda 50 paket sırayla, ilerleme %'si doğru, iptal→devam kayıpsız
6. Basılmış paket yeniden seçilirse uyarı verir ("zaten basıldı")
7. Server unit testleri: normalizer (ham JSON fixture → NormalizedOrder) ≥10 vaka
8. Free hesapta orders görünümü Pro duvarıyla gelir + deneme bağlantısı CTA

## 7. Kapsam Dışı (bilinçli)

- Otomatik periyodik çekme (arka plan cron) → SPEC-07 otomasyon katmanı
- Kargo gönderi oluşturma (despatch) → sadece mevcut takip numarasının basılması
- Diğer pazaryerleri → aynı normalize şema genişletilerek SPEC-03b... ile eklenir
