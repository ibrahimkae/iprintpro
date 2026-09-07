# SPEC-02 — İş Modu Sistemi & Akıllı Ana Ekran

> Durum: DETAY SPEC — onay bekliyor
> Önem: ★★★ (tüm yeni modüllerin yerleşeceği iskelet)
> Bağımlılık: Yok (mevcut AppShell menü yapısı üzerine kurulur)

## 1. Amaç

Yüzlerce özellik eklenirken arayüzün sade kalması: kullanıcı kendi sektörüne göre
bir **İş Modu** seçer, ana ekran ve menü moda göre düzenlenir. Tüm araçlar asla
silinmez — yalnızca önceliklendirilir.

## 2. Mod Tanımları

```ts
// src/lib/business-modes.ts
type BusinessMode =
  | 'boutique'      // 🛍️ Butik Satıcı
  | 'marketplace'   // 🏪 Pazaryeri Satıcısı
  | 'cafe'          // ☕ Kafe / Restoran
  | 'service'       // 🔧 Teknik Servis
  | 'appointment'   // 💇 Randevulu Hizmet
  | 'warehouse'     // 📦 Depo / Toptancı
  | 'personal';     // 🏠 Kişisel

interface ModeConfig {
  id: BusinessMode;
  label: string;
  icon: string;
  /** Ana menü sırası — üsttekiler büyük kart, alttakiler "Tüm Araçlar" altında */
  primaryTools: ToolId[];
  /** Bu moda özel otomatik yüklenen şablon paketi */
  templatePack: string[];
  /** İlk açılışta gösterilecek 3 adımlık hızlı başlangıç */
  onboardingSteps: string[];
}
```

### Menü araç haritası (özet)

| ToolId | boutique | marketplace | cafe | service | appointment | warehouse | personal |
|---|---|---|---|---|---|---|---|
| editor | ● | ● | ○ | ● | ● | ○ | ● |
| image | ● | ● | ○ | ○ | ○ | ○ | ● |
| templates | ●● | ●● | ●● | ●● | ●● | ●● | ●● |
| tools(QR) | ● | ● | ● | ● | ● | ● | ● |
| document | ● | ● | ○ | ○ | ○ | ● | ● |
| banner | ● | ○ | ●(menü) | ○ | ○ | ●(raf) | ● |
| collage | ● | ○ | ○ | ○ | ○ | ○ | ● |
| **orders** (yeni) | ○ | ●● | — | — | — | ○ | — |
| **pos** (yeni) | — | — | ●● | — | — | — | — |
| **batch** (yeni) | ● | ●● | — | — | — | ●● | ○ |
| **service** (yeni) | — | — | — | ●● | — | — | — |
| **appointments** (yeni) | — | — | — | — | ●● | — | — |

`●●` = büyük kart · `●` = normal · `○` = "Tüm Araçlar" listesinde · `—` = gizli

## 3. Veri Modeli & Saklama

```ts
// localStorage: iprint_business_mode_v1
{ mode: BusinessMode, configuredAt: number, seenOnboarding: boolean }
```

- Mod değiştirme: Ayarlar → İş Modu → 7 seçenek kartı (anında geçiş, veri kaybı yok)
- Hiç seçim yapılmadan da uygulama kullanılabilir (ilk istek "Kişisel" davranışı = mevcut menü)

## 4. Akıllı Ana Ekran

Mevcut statik menü grid'i yerine bileşen tabanlı düzen:

1. **Karşılama satırı**: mod ikonu + adı + "Değiştir" bağlantısı
2. **Son işlemler**: print history'den son 3 baskının küçük kartları (tek tık yeniden bas)
3. **primaryTools grid'i**: moda göre büyük/normal kartlar
4. **"Tüm Araçlar"** açılır bölümü: ○ işaretliler + mod değişimi

## 5. Global Arama (⌘K / 🔍 butonu)

- Kayıt: statik index — `{toolId, başlık, anahtar kelimeler[], hedef view}`
  ```ts
  { toolId:'pos', title:'Adisyon / POS', keywords:['kasa','fiş','masa','sipariş'] }
  ```
- Davranış: yazarken filtrele → Enter ile ilgili görünüme git
- Kapsam v1: yalnız araçlara navigasyon (şablon arama SPEC-05'e)

## 6. Mod Şablon Paketleri

Her mod için 6 hazır şablon (TemplateStudio payload formatında, SPEC-01
değişkenleri dahil). Örnek — Butik Satıcı:
teşekkür kartı `{Musteri_Adi}`, marka kartı `{Instagram}`, kupon `{Kod},{Son_Tarih}`,
fiyat etiketi, kargo notu, paket içi fiş.

Paketler kod içinde sabit (`src/lib/mode-packs/*.ts`) — kullanıcıya ilk mod
seçiminde "Bu modun şablonlarını yükle?" sorulur, localStorage'a kopyalanır
(böylece düzenleyip bozsa bile orijinal paket korunur).

## 7. Kabul Kriterleri

1. İlk açılışta mod sihirbazı bir kez görünür; atlanabilir
2. Mod "Kafe" seçilince ana ekranda POS büyük kart; pazaryeri aracı görünmez ama Ayarlar→Tüm Araçlar'da erişilir
3. Mod değişikliği mevcut taslak/geçmiş/ayarları bozmaz
4. ⌘K ile "adisyon" yazınca POS görünümüne gider (cafe modunda); "kargo" araması marketplace dışındaki modda da orders aracını bulur
5. Şablon paketi onaylanmadan localStorage'a yazılmaz; onaylanınca 6 şablon Şablonlar ekranında görünür
6. Mevcut tüm unit testleri yeşil kalır; mode-config için ≥8 yeni test (harita tutarlılığı: her tool en az bir modda ● olmalı vb.)

## 8. Kapsam Dışı

- Sunucu tarafı kişiselleştirme (mod tercihi bulut senkronu) → Ekip modülüyle birlikte
- Mod başına tema/renk değişimi → ileride değerlendirilir
