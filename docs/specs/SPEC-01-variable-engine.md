# SPEC-01 — Değişken Veri Motoru

> Durum: DETAY SPEC — onay bekliyor
> Önem: ★★★ (tüm toplu üretim, pazaryeri etiketleri ve POS fişleri bu motoru kullanır)
> Bağımlılık: Yok (mevcut TemplateStudio + canvas pipeline üzerine kurulur)

## 1. Amaç

Kullanıcının kendi tasarladığı şablonda `{Degisken}` yazması; uygulamanın bu
değişkenlerden otomatik form üretmesi; formun doldurulup tek tıkla yazdırılması
veya CSV ile beslenip yüzlerce kopya üretilmesi.

## 2. Sözdizimi

```
{DegiskenAdi}              → temel kullanım
{Fiyat:para}               → tip belirtilmiş
{Tarih:tarih=DD.MM.YYYY}   → tip + format parametresi
{Barkod:barkod=EAN13}      → barkod sembolojisi
{Not:metin=Müşteri notu}   → varsayılan/yardım metni
```

Kurallar:
- Değişken adı: harf/rakam/alt çizgi, Türkçe karakter destekli (`Musteri_Adi` ✅ `Müşteri Adı` ✅)
- Aynı değişken şablonda birden çok yerde geçebilir (tek giriş, çok nokta)
- Tanınmayan sözdizimi (`{bozuk`) olduğu gibi basılır, hata verilmez — kullanıcı deneyimi öncelikli
- Kaçış: `{{` yazılırsa literal `{` basılır

## 3. Veri Tipleri

| Tip | Formda görüntü | Çıktı davranışı |
|---|---|---|
| `metin` (varsayılan) | Tek satır input | Olduğu gibi |
| `sayi` | Number input | Binlik ayraç opsiyonel |
| `para` | Number input + ₺ son eki | 1234.5 → "1.234,50 ₺" |
| `tarih` | Date input | Format parametreli (DD.MM.YYYY varsayılan) |
| `coksatir` | Textarea | \n korunur |
| `barkod` | Metin + canlı barkod önizleme | Canvas'a bwip-js ile çizilir (EAN13/CODE128 otomatik) |
| `qr` | Metin | QR olarak çizilir |
| `secim` | Dropdown (`=A,B,C` parametresiyle) | Seçilen değer |

## 4. Veri Modeli

```ts
// src/lib/template-variables.ts
interface VariableDef {
  name: string;          // "Musteri_Adi"
  type: 'metin' | 'sayi' | 'para' | 'tarih' | 'coksatir' | 'barkod' | 'qr' | 'secim';
  required?: boolean;
  defaultValue?: string;
  hint?: string;         // form yardımı
  options?: string[];    // secim tipi için
  format?: string;       // tarih/barkod parametresi
}

interface VariableTemplate {
  id: string;
  baseTemplateId: string;      // hangi şablondan türedi
  canvasSnapshot: string;      // {Degisken} halleriyle önizleme dataURL
  variables: VariableDef[];
  createdAt: number;
}
```

Saklama: localStorage (`iprint_variable_templates_v1`). Faz 6 backend'de
`templates.payload` JSON kolonuna aynı şema gider — **tek kaynak doğruluk istemci şemasıdır**.

## 5. İşlem Hattı (pipeline)

```
Şablon canvas'ı
  → extractVariables(canvasText)     [regex parse → VariableDef[]]
  → VariableForm (otomatik UI)       [kullanıcı doldurur]
  → resolveVariables(template, values) [string interpolation]
  → mevcut renderPrice/renderArticle... akışı (değişiklik yok)
  → CSV modu: her satır → resolve → baskı kuyruğu → printBitmap serisi
```

Önemli: Motor **yalnızca metin katmanında** çalışır; mevcut çizim fonksiyonlarına
dokunmaz. Barkod/QR tipleri resolve aşamasında ayrı canvas elemanına dönüşür.

CSV boru hattı (SPEC-04 ile paylaşılır):
- Papağan hataya karşı: satır başına try/catch, hatalı satır atlanır, sonda rapor
- Free katman limiti (≤3) kuyruğa alınmadan önce kontrol edilir

## 6. Ekranlar

### 6.1 Şablon editöründe
- Metin alanının altında "Değişkenler" rozeti: şablondaki değişkenleri listeler,
  tıklayınca sözdizimi kopyalanır
- Geçersiz sözdizimi sarı işaretle uyarır (basımı engellemez)

### 6.2 Yazdır düğmesinde (akıllı dallanma)
- Şablonda değişken varsa → **Form ekranı** açılır (önizleme dialogundan önce)
- Formda her değişken: tipine göre input + zorunlu yıldızı
- "Yazdır" / "CSV ile Toplu Üret" iki aksiyon

### 6.3 CSV Toplu Üretim sihirbazı
1. Dosya seç (CSV; Excel için önce UTF-8 CSV'ye çevirme notu gösterilir)
2. Sütun ↔ değişken eşleme tablosu (otomatik tahmin: başlık adı benzerliği)
3. Önizleme grid (ilk 12 etiket)
4. Bas + ilerleme + satır raporu (başarılı/hatalı/atlanan)

## 7. Backend Sözleşmesi (Faz 6, önceden sabitlenir)

```
GET  /templates/:id        → payload: { variables: VariableDef[], ... }
POST /templates            → payload içinde variables doğrulanır (zod şeması sunucuda aynadır)
```
Sunucu zod şeması istemci TS tipinin birebir çevirisi; sürüm alanı
`schemaVersion: 1` eklenir (ileride uyumluluk kırılırsa migrasyon zemini).

## 8. Kabul Kriterleri (hepsi testle doğrulanır)

1. `{Musteri_Adi}` içeren şablon → formda tek alan görünür, girilen değer basılır
2. `{Fiyat:para}` → "1290.5" girişi etikette "1.290,50 ₺" olarak çıkar
3. `{Tarih:tarih=DD.MM.YYYY}` → date picker değeri doğru formatta basılır
4. `{Barkod:barkod=EAN13}` → 13 rakam girilince EAN-13 çizilir; 12 rakam da kabul (checksum tamamlanır)
5. Aynı değişken 3 farklı yerde → tek giriş, üç noktada güncellenir
6. `{{` kaçış dizisi literal `{` basar
7. CSV 50 satır → 50 etiket sırayla, ilerleme çubuğuyla; 2 bozuk satır raporlanıp atlanır
8. Free hesapta 4+ satır CSV → limit uyarısı, ilk 3 satır seçilebilir
9. Mevcut unit testleri kırmaz; yeni: extract/resolve/formatMoney/escape için ≥15 test

## 9. Kapsam Dışı (bu spec'te bilinçli yok)

- Koşullu bölümler (`{?if}`) — v1.1
- Hesaplanan değişkenler ({Toplam = Adet*Fiyat}) — v1.1
- Görsel değişkenler ({Logo:gorsel}) — marka seti spec'iyle birlikte
