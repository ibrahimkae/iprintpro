# Uygulama Faz Planı (Spec'lerden koda)

> Tüm spec'ler onaylandı varsayımıyla. Her fazın çıkış kriteri: tsc ✅ · test ✅ · build ✅
> + manuel duman testi. Fazlar arası main her zaman çalışır durumda kalır.

## Faz A — İstemci Çekirdeği (backend'siz tam çalışır)
| Görev | Spec | Not |
|---|---|---|
| A1 ✅ `template-variables.ts`: parse/resolve/formatMoney/tarih/kaçış + 27 test | SPEC-01 | saf fonksiyon, en kritik test dosyası |
| A2 ✅ Değişken Form bileşeni + renderBlocks canvas çizici + editor akışına dallanma | SPEC-01 §6.2 | barkod/QR akış içinde basılır |
| A3 ✅ CSV eşleme + önizleme grid + seri baskı kuyruğu (Free limitli) | SPEC-04 | SheetJS bağımlılığı eklenir |
| A4 ✅ business-modes.ts + mod sihirbazı + akıllı ana ekran + ⌘K | SPEC-02 | menü matrisi kodda tek kaynak |
| A5 ✅ Mod şablon paketleri (7×6 şablon payload) | SPEC-02 §6 | mevcut renderPrice vb. üzerine |

**Çıkış:** backend'siz — değişkenli şablon oluştur → form doldur → bas; CSV toplu üret;
mod seçimi menüyü düzenler.

## Faz B — Backend & Lisans & Ekip
| Görev | Spec |
|---|---|
| B1 server: subscriptions tablosu + entitlements endpoint'i + trial | SPEC-05 |
| B2 PayTR/Iyzico checkout + imzalı webhook + poll geçişi | SPEC-05 §4 |
| B3 `entitlements.ts` client kapısı + Pro Duvar bileşeni + limit uygulayıcılar | SPEC-05 §3 |
| B4 teams tabloları + rol API'si + davet (kayıtlı e-posta) | SPEC-06 |
| B5 Şablonlar "Ekibim/Benim" sekmeleri + rol kilidi + faaliyet kaydı | SPEC-06 §5 |
| B6 Cihaz profili bulut senkronu | SPEC-06 §6 |
| B7 Server integration testleri (supertest) | hepsi |

**Çıkış:** iki tarayıcı, iki hesapla ekip senaryosu uçtan uca; Free/Pro duvarları gerçek.

## Faz C — Trendyol
| Görev | Spec |
|---|---|
| C1 server trendyol proxy + normalizer + cache + rate koruması | SPEC-03 §2 |
| C2 normalizer unit testleri (ham JSON fixture'larla ≥10) | SPEC-03 §6.7 |
| C3 Siparişler görünümü + filtreler + seçim | SPEC-03 §3.1 |
| C4 Kargo etiketi + koli fişi şablonları (değişkenli) | SPEC-03 §3.2 |
| C5 Toplu baskı kuyruğu + basıldı işareti + devam | SPEC-03 §3.3 |
| C6 GERÇEK API test planı (kullanıcının anahtarlarıyla 5 adım) | SPEC-03 §5 |

**Çıkış:** gerçek Trendyol hesabından sipariş çekip etiket basma (kullanıcı eşliğinde).

## Faz D — Sektör Modülleri
| Görev | Spec |
|---|---|
| D1 POS/adisyon + menü yönetimi + mutfak/müşteri fişi + ödeme QR | SPEC-07 |
| D2 Servis kabul + durum makinesi + takip sayfası | SPEC-08 |
| D3 Depo üçlüsü (raf/koli/parti-IMEI) | SPEC-09 |
| D4 Randevu fişi + .ics QR | SPEC-10 |
| D5 Her modül için İş Modu bağlantıları güncellenir | SPEC-02 |

## Faz E — Cila & Sürüm
- E1 KVKK metinleri (veri nerede tutulur açıklamaları)
- E2 Performans bütçesi ölçümü (açılış <2sn hedefi)
- E3 CHANGELOG 1.1.0 + sürüm etiketi
- E4 AI Studio zip + genel kontrol (kullanıcı ile birlikte)

## Paralel dış görev (kullanıcı)
- [ ] Trendyol developer başvurusunun durumu takip edilsin (C6 için hazır olsun)
- [ ] PayTR/Iyzico üyeliği (B2 öncesi)
