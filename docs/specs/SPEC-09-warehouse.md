# SPEC-09 — Depo Etiketleri (Raf / Koli / Parti-IMEI)

> Durum: DETAY SPEC — onay bekliyor · Önem ★★
> Bağımlılık: SPEC-01 + SPEC-04 (toplu üretim)

## Üç Araç, Tek Kalıp

### 9.1 Raf Kodu Etiketi
- Giriş: raf kodu listesi (`A-12-03` formatı) — tek tek veya CSV/toplu desen üretici
  (`A-{01..30}-{01..04}` aralık sözdizimi)
- Tasarım: kod DEV punto (okunabilirlik 2m), altında barkod (CODE128), opsiyonel bölge bandı

### 9.2 Koli İçerik Etiketi
- Giriş: koli no + içindeki ürünler (CSV veya manuel satırlar)
- Çıktı: ürün/adet listesi + koli QR (QR içeriği: düz metin liste — sunucu gerekmez)

### 9.3 Seri No / IMEI / Parti
- **Seri/IMEI**: başlangıç değeri + adet → sayaç ile seri üretim; her etiket tekil barkod
- **Parti (Lot)**: parti no + üretim tarihi + SKT/TETT (tarih tipi, GS1 format seçenekleri: `GG.AA.YYYY` | `AA.YYYY`)
- Gıda/kozmetik için "Son kullanma" önceden tanımlı şablonlar

## Kabul Kriterleri

1. `A-{01..20}-01` deseni → 20 benzersiz raf etiketi sıralı basılır
2. IMEI 15 hane doğrulaması (Luhn) — yanlış girişte uyarı (basım engellenmez, uyarı gösterilir)
3. Koli QR'ı telefonda taranınca içerik listesi okunur
4. Parti etiketinde tarih formatları doğru çıkar
5. Tüm akışlar SPEC-04 önizleme grid'ini paylaşır; ≥10 unit test (desen üretici, Luhn, tarih formatları)

## Kapsam Dışı

- Zebra ZPL çıktısı (ileride değerlendirilir)
- Envanter yönetimi (sayım/stok takibi) — bu spec yalnız ETİKET üretir
