# SPEC-07 — Mikro POS / Adisyon (Kafe & Restoran)

> Durum: DETAY SPEC — onay bekliyor · Önem ★★★ (cafe modu çekirdeği)
> Bağımlılık: SPEC-01, SPEC-05 (Pro), 80mm destek (karar #5'te ikincil)

## Veri Modeli (yerel, localStorage → Faz 6'da bulut)

```ts
interface MenuItem { id: string; name: string; price: number; category: string; active: boolean; }
interface OrderTicket {
  id: string; type: 'dine_in' | 'takeaway';
  table?: string; items: { itemId: string; qty: number; note?: string }[];
  status: 'open' | 'closed'; createdAt: number;
}
```
Menü CSV importu: `ad,kategori,fiyat` başlıkları; eşleme SPEC-04 sihirbazı yeniden kullanılır.

## Ekranlar

1. **Menü yönetimi**: kategori sekmeleri + ürün tablosu; ekle/düzenle/pasifleştir; CSV içe aktar
2. **Satış ekranı**: solda kategori+ürün butonları (dokunmatik büyük), sağda sepet; adet +/-, not alanı
3. **Fiş seçimi**: [Mutfak Fişi] / [Müşteri Fişi] iki buton:
   - Mutfak: masa/paket + ürünler + notlar (tutarsız) — mutfağa gider
   - Müşteri: ürünler + tutarlar + toplam + (opsiyonel) ödeme QR bloğu
4. **Gün sonu**: bugünün kapalı adisyonları sayısı + ciro toplamı (yönetimsel; mali belge değildir — fişte "MALİ DEĞİLDİR" ibaresi)

## Ödeme Bloğu

- Ayarlarda IBAN + alıcı adı girilir
- Fiş altında EMVCo tutarlı statik QR (SPEC-BLUEPRINT kısıt notuna uygun) — tutar QR'a gömülü, müşteri banka uygulamasında onaylar
- Destekleyen uygulamada tutar gelir; gelmezse QR yine IBAN transferini açar

## Kabul Kriterleri

1. Ürün ekle→sepete at→mutfak fişi: ürünler+notlar basılır, tutar YOK
2. Müşteri fişi: KDV dahil görüntüleme (v1 dahil-only), toplam doğru yuvarlama (0.01 hassasiyet)
3. Gün sonu özeti kapalı adisyonlarla tutarlı
4. Menü CSV import 200 ürün <5sn, hatalı satır raporu
5. Free hesapta POS görünümü Pro duvarı ile açılır
6. Test: fiyat formatı (para tipi), toplam hesabı ≥8 unit test
