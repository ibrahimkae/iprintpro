# SPEC-08 — Teknik Servis Takip

> Durum: DETAY SPEC — onay bekliyor · Önem ★★★ (service modu çekirdeği)
> Bağımlılık: SPEC-01, Faz 6 backend (durum sayfası), SPEC-05

## Veri Modeli

```ts
// client (localStorage) + server sync
interface ServiceTicket {
  id: string;                    // takip no: SRV-XXXX (sayaç)
  customerName: string; phone: string;
  deviceType: string; brand?: string; model?: string;
  issue: string;                 // arıza özeti
  accessories?: string;          // yanında gelenler ("şarj aleti yok")
  status: 'received'|'inspecting'|'awaiting_approval'|'repairing'|'ready'|'delivered';
  createdAt: number; updatedAt: number;
}
```

Server: `service_tickets` tablosu (aynı alanlar) + `GET /track/:ticketId` public durum sayfası.

## Ekranlar

1. **Yeni Kabul**: form → [Kabul Etiketi Bas] + [Kutu Etiketi Bas] (kompakt versiyon)
2. **Takip listesi**: durum filtre çipleri; satır tıkla → durum değiştir dropdown
3. **Durum değişince**: WhatsApp/SMS taslağı kopyalanır:
   `"Merhaba {ad}, {cihaz} cihazınızın durumu: {durum}. Takip: {link}"`
4. **Müşteri takip sayfası** (backend): ticketId ile durum + son güncelleme zamanı; telefon no son 4 hanesi doğrulama sorusu (basit koruma)

## Etiket Şablonları (SPEC-01 değişkenli)

- Kabul etiketi: `{Takip_No}` barkod, müşteri/telefon, cihaz, arıza, tarih, imza alanı
- Kutu etiketi: kompakt — takip no + soyad + durum

## Kabul Kriterleri

1. Kabul oluştur → etiket basılır; barkod okutunca takip sayfası açılır
2. Durum "ready" yapılınca mesaj taslağı panoya kopyalanır
3. Takip sayfası yalnız doğru son-4-hane ile açılır
4. Çevrimdışı kayıt: yerel saklanır, bağlantı gelince senkron (kuyruk)
5. Free'te modül Pro duvarlı; test ≥6 unit (durum makinesi geçişleri)

## Kapsam Dışı

- SMS/WhatsApp otomatik gönderimi (API sözleşmesi ayrı) — v1'de taslak kopyalama yeterli
