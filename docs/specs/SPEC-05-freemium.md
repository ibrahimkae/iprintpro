# SPEC-05 — Freemium Lisans Altyapısı

> Durum: DETAY SPEC — onay bekliyor
> Önem: ★★★ (Pro özelliklerin kapısı)
> Bağımlılık: Faz 6 backend (users + yeni subscriptions tablosu), PayTR/Iyzico webhook

## 1. Katman Kuralları

| Sınır | Free | Pro |
|---|---|---|
| Toplu baskı | ≤3 satır/iş | sınırsız |
| Kayıt/taslak | 5 | sınırsız |
| Pazaryeri, POS, servis, depo modülleri | — | ✅ |
| Marka footer | sabit "iPrint ile hazırlandı" | kaldırılabilir/özel |
| Şablon kütüphanesi | 6 temel | 50+ sektörel |

## 2. Veri Modeli

### Server
```sql
CREATE TABLE subscriptions (
  user_id INT PRIMARY KEY,
  plan ENUM('free','pro_monthly','pro_yearly'),
  status ENUM('active','past_due','canceled','trialing'),
  trial_ends_at DATETIME NULL,
  current_period_end DATETIME NOT NULL,
  provider ENUM('paytr','iyzico','manual') NOT NULL,
  provider_ref VARCHAR(120),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Client
```ts
interface Entitlements {
  plan: 'free' | 'pro';
  source: 'server' | 'cache';     // cache = offline tolerans
  checkedAt: number;              // cache 7 gün geçerli (karar #2)
  features: { batchUnlimited: boolean; marketplace: boolean; pos: boolean;
              service: boolean; warehouse: boolean; customBranding: boolean };
}
```

## 3. Kontrol Noktası Tasarımı

Tek giriş noktası — her Pro özellik aynı kapıdan sorar:

```ts
// src/lib/entitlements.ts
can('marketplace')            // boolean
requireFeature('pos', onWall) // değilse Pro duvar bileşeni açar
```

- **Duvar bileşeni** (tek yerde): kilit ikonu + hangi özellik + fiyat + "14 gün ücretsiz dene" CTA
- Limitler çalışma anında zorlanır (ör. CSV sihirbazında satır seçimi), UI sonradan gizlemez → dürüst UX

## 4. Ödeme Akışı

```
1. İstemci: "Pro'ya geç" → server POST /billing/checkout {plan}
2. Server: sağlayıcı iframe/link token üretir → istemci yönlendirir
3. Sağlayıcı callback → server webhook (imza doğrulamalı) → subscriptions güncelle
4. İstemci bir sonraki entitlement kontrolünde Pro görür; anlık geçiş için
   webhook sonrası push yoksa client poll (30sn x5) yapar
```

- İptal: dönem sonu kadar Pro sürer (`status=canceled` + `current_period_end`)
- İade/politika v1: sağlayıcı panelinden manuel

## 5. Deneme (Trial)

- 14 gün, kart istemeden başlar (dönüşüm > sahtecilik dengesi)
- `trial_ends_at` dolunca otomatik Free'ye düşer; son 3 gün uygulama içi bildirim bandı

## 6. Offline Toleransı

- Son başarılı kontrol `localStorage`'da; sunucuya 7 gün erişilemezse Pro devam eder
- 7 gün sonra: tüm Pro özellikleri okunur modda kilitlenmez — kaydetme/baskı Free limitine düşer ve açıklama gösterilir

## 7. Manuel Lisans (bayi/kurumsal)
- Server admin endpoint'i: e-postaya pro_yearly + provider='manual' ataması
- Fatura kesilen kurumsal müşteriler için yeterli ilk adım

## 8. Kabul Kriterleri

1. Free JWT ile `/api/trendyol/orders` çağrısı 403 + net TR mesaj döner
2. CSV'de >3 satır seçimi Free'de engellenir; deneme başlatınca anında açılır
3. Webhook (imzalı) geldiğinde 30sn içinde istemci Pro'ya geçer (poll doğrulaması)
4. Uçuş modu + 6 gün: Pro davranışı sürer; 8. gün: Free limitleri + açıklama
5. İptal sonrası dönem bitiminde otomatik Free
6. Footer: Free fişte "iPrint ile hazırlandı" basılır; Pro'da ayarlardan kaldırılabilir
7. Server testleri: webhook imza doğrulama (geçersiz imza reddi), plan geçişleri ≥10 vaka
8. Client testleri: can()/requireFeature() matrisi ≥12 vaka

## 9. Kapsam Dışı

- App Store / Play IAP (strateji: web-first — FEATURE-BLUEPRINT §6.3 notu)
- Kupon/kampanya kodları → talebe göre v1.1
