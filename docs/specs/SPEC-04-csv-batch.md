# SPEC-04 — CSV/Excel Toplu Etiket Üretici

> Durum: DETAY SPEC — onay bekliyor
> Önem: ★★★
> Bağımlılık: SPEC-01 (değişken motoru = üretim çekirdeği), Freemium limit kontrolü

## 1. Amaç

CSV dosyasındaki yüzlerce satırı, seçilen değişkenli şablon üzerinden tek seferde
sıralı termal baskıya dökmek. Raf etiketi, ürün/fiyat barkodu, parti listeleri ve
topluluk şablonlarının toplu kullanımı aynı boru hattından geçer.

## 2. Giriş Formatları

| Format | Destek |
|---|---|
| CSV (UTF-8) | ✅ birincil; `;` veya `,` ayraç otomatik algılanır |
| Excel (.xlsx) | ✅ SheetJS ile istemcide okunur (sunucuya dosya gitmez) |
| TSV / Google Sheets export | ✅ CSV ile aynı yol |

Sınır: 5.000 satır / 2 MB (Free'de ilk 3 satır).

## 3. Sihirbaz Akışı (4 adım)

### Adım 1 — Dosya & Şablon
- Dosya sürükle-bırak
- Hedef şablon: değişkenli şablonlar listesi (SPEC-01 `VariableTemplate`)
- Kağıt genişliği onayı (58mm varsayılan — karar #5)

### Adım 2 — Sütun Eşleme
- Her değişken için dropdown: CSV sütun başlıkları + "sabit değer gir" seçeneği
- **Otomatik tahmin:** başlık benzerliği (`barkod`↔`Barkod`, `fiyat`↔`Fiyat(TL)`)
- Zorunlu değişkenler eşlenmemişse ilerleme engellenir + kırmızı uyarı
- Eşleme şablonuna kaydedilir: sonraki yüklemelerde hatırlanır (`iprint_csv_mappings_v1`)

### Adım 3 — Önizleme Grid
- İlk 12 etiket gerçek boyutlu canvas önizleme (yatay scroll)
- Satır atlatma: "başlangıç satırı" alanı (başlık satırı otomatik algılanır)
- Toplam sayım: X etiket · Y sayfa karşılığı ~Z metre rulo tahmini

### Adım 4 — Bas
- Free limiti burada devreye girer (>3 satır → Pro duvarı + deneme CTA)
- Kuyruk: mevcut printBitmap serisi; ilerleme çubuğu + iptal
- **Kesinti dayanıklılığı:** tamamlanan satır indeksi saklanır; tarayıcı kapanırsa
  tekrar girişte "N etiketi kaldı, devam et?" istemi

### Bitiş Raporu
- Başarılı / hatalı / atlanan sayısı
- Hatalı satır tablosu (satır no + neden: eksik zorunlu alan, bozuk barkod...)
- "Hataları CSV olarak indir" butonu

## 4. Veri Modeli

```ts
interface CsvMapping {
  id: string;
  templateId: string;
  columnMap: Record<string, string>; // variableName -> csvHeader | "@literal"
  createdAt: number;
}

// Baskı kuyruğu kalemi
interface BatchJob {
  id: string;
  rows: Record<string, string>[];   // resolve edilecek değerler
  completedIndex: number;
  errors: { row: number; reason: string }[];
}
```

## 5. Kabul Kriterleri

1. 100 satırlık UTF-8 CSV → 100 etiket sırayla, ilerleme doğru, süre < baskı fiziksel süresi + %10 overhead
2. Ayraç otomatik algısı: `;` dosya ve `,` dosya karışık test edilir
3. .xlsx 500 satır → aynı sonuç (SheetJS yolu)
4. Otomatik eşleme: `Barkod,Fiyat,Urun_Adi` başlıkları elle dokunmadan doğru atanır
5. Eksik zorunlu alan içeren satır atlanır, raporda görünür, diğerleri basılır
6. Sayfa yenileme ortasında → geri dönüşte "kaldığın yerden devam" istemi çalışır
7. Free hesap 20 satırda → sadece 3'ü seçilebilir, duvar mesajı gösterilir
8. Bellek: 5.000 satırda UI donması yok (satırlar parça parça işlenir, tümü aynı anda DOM'a girmez)
9. Unit test: ayrıç algılama, eşleme tahmini, hatalı satır raporu ≥12 vaka

## 6. Kapsam Dışı

- Görsel sütunları (ürün fotoğrafı basma) → marka seti spec'iyle
- Sunucu tarafı büyük iş kuyruğu (50K+ satır) → Electron masaüstü hedefi
