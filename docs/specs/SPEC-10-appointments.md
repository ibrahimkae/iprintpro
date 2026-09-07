# SPEC-10 — Randevu Fişleri (Klinik / Kuaför / Salon)

> Durum: DETAY SPEC — onay bekliyor · Önem ★★
> Bağımlılık: SPEC-01

## Akış (tek ekran, 60 saniyede fiş)

Giriş formu → [Fiş Bas]:
- `{Musteri_Adi}`, `{Islem}` ("saç boyama"), `{Randevu_Tarihi:tarih}`, `{Randevu_Saati}`
- Opsiyonel: `{Telefon}`, not satırı
- Otomatik bloklar:
  - **Takvime ekle QR**: `.ics` dosyası data-URI olarak QR'a gömülü (Google/Apple takvim uyumlu)
  - **Konum QR**: ayarlardaki işletme adresi → maps linki
  - Hatırlatma metni: "Randevunuza 15 dk önce..."

## .ics Üretimi

İstemcide string üretimi (`text/calendar` data URI), sunucu gerekmez.
Saat dilimi: cihaz yereli; `DTSTART;TZID=` yerine UTC offset'li yazım.

## Kabul Kriterleri

1. Fişteki takvim QR iPhone ve Android'de etkinlik olarak eklenir (doğru tarih/saat)
2. Konum QR haritada işletmeyi açar
3. Form girişleri son kullanılanlarla hatırlanır (SPEC-01 kayıtlı giriş davranışı)
4. Free'te şablon temel alanlarla çalışır; marka footer kuralı SPEC-05 ile aynı
5. ≥6 unit test (.ics çıktısı formatı, tarih/saat dönüşümleri)

## Kapsam Dışı

- Randevu yönetim sistemi (ajanda) — bu spec yalnız FİŞ üretir
- Otomatik SMS hatırlatma — v1.1
