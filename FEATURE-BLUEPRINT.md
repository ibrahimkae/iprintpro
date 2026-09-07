# iPrint Pro — Ürün Özellik Haritası (Blueprint)

> **Durum:** TASLAK — onay bekliyor.
> **Amaç:** Uygulamanın "satıcı ve işletme odaklı termal baskı platformu"na dönüşmesi için
> tüm özelliklerin eksiksiz listesi. Onaydan sonra her modül tek tek detaylandırılacak
> (veri modeli, ekranlar, API sözleşmeleri), ardından faz planına bölünecek.
>
> **Etiket rehberi:**
> `[Katman]` Free / Pro · `[Bağımlılık]` gereken altyapı · `[Kısıt]` teknik/yasal dikkat noktası ·
> `[Önem]` ★★★ kritik / ★★ yüksek / ★ değerli

---

## 0. Temel Mimari İlke: "İş Modu" Sistemi

Onlarca özellik eklenince en büyük risk **karışıklık**. Çözüm: ilk açılışta kullanıcı
bir **İş Modu** seçer; menü, şablon seti ve entegrasyonlar moda göre şekillenir.
Mod sonradan değiştirilebilir; tüm araçlar her zaman erişilebilir kalır (gizlenenler
"Ayarlar → Tüm Araçlar" altında).

| Mod | Öne çıkan araçlar | Arka planda gizlenenler |
|---|---|---|
| 🛍️ Butik Satıcı (Instagram/Shopier) | Teşekkür kartı, marka çıkartması, toplu barkod | POS, adisyon |
| 🏪 Pazaryeri Satıcısı | Sipariş etiketi, toplu baskı, koli fişi | Adisyon, sıramatik |
| ☕ Kafe / Restoran | Adisyon, mutfak fişi, ödeme QR, sıramatik | Pazaryeri, depo |
| 🔧 Teknik Servis | Cihaz kabul etiketi, durum takibi, bakım etiketi | POS, pazaryeri |
| 💇 Randevulu Hizmet | Randevu fişi, hatırlatma kartı | Depo, pazaryeri |
| 📦 Depo / Toptancı | Raf/koli etiketi, parti-IMEI, CSV toplu üretim | Adisyon, randevu |
| 🏠 Kişisel (B2C) | Okul isim etiketi, pet etiketi, fotoğraf | Tüm iş araçları |

Mod sistemine bağlı özellikler:
- [ ] Mod seçim sihirbazı (ilk açılış) `[Katman] Free` `[Önem] ★★★`
- [ ] Akıllı ana ekran: moda göre sıralanan araçlar + son işlemler `[★★★]`
- [ ] Global arama (⌘K): "fiyat etiketi" yazınca ilgili araca git `[★★]`
- [ ] Mod bazlı hazır şablon paketi otomatik yükleme `[★★★]`

---

## 1. Pazaryeri & E-Ticaret Entegrasyonları

### 1.1 Pazaryeri Bağlantıları `[Katman] Pro` `[Bağımlılık] Backend + kullanıcı API anahtarları`

| Entegrasyon | Önem | Not |
|---|---|---|
| Trendyol (Satıcı API) | ★★★ | TR'nin ana pazaryeri; resmi developer onayı gerekir |
| Hepsiburada (Seller API) | ★★★ | |
| Amazon TR (SP-API) | ★★ | OAuth; onay süreci uzun |
| Shopier | ★★ | Butik satıcılar için kritik; basit token |
| Shopify | ★★ | Global; ileride Shopify App Store potansiyeli |
| WooCommerce (REST) | ★★ | Anahtar+secret yeterli |
| N11, ikas, Ticimax, Ideasoft | ★ | Talebe göre eklenir |

Alt özellikler:
- [ ] API anahtarlarının cihazda şifreli saklanması (WebCrypto; sunucuya düz metin gitmez) `[★★★]`
- [ ] Bekleyen siparişler ekranı: durum, kargo firması, adres, kalemler `[★★★]`
- [ ] Tek tıkla kargo etiketi: alıcı, adres, sipariş no, gönderi barkodu `[★★★]`
- [ ] Toplu baskı kuyruğu: seçilen siparişleri sırayla bas + ilerleme + duraklat/devam `[★★★]`
- [ ] Paketleme doğrulama: kalemin barkodunu okut, doğru ürün mü kontrol et `[★★]`
- [ ] Koli / paket içi sipariş fişi: ürün, varyant, adet, fatura linki QR `[★★★]`
- [ ] İade etiketi üretimi `[★]`

### 1.2 Kargo Firması Katmanı `[Katman] Pro` `[Kısıt] Bazı firmalar resmi API yerine despatch entegrasyonu ister`
- [ ] Gönderi kodu barkodu formatları (Yurtiçi, Aras, MNG, PTT, Sürat, TY Express, HepsiJet) `[★★★]`
- [ ] Alıcı için takip linki QR'ı `[★★]`
- [ ] Manuel kargo modu (API'sız firmalarda kodu elle gir) `[★★]`

### 1.3 Müşteri Deneyim Kartları
- [ ] Teşekkür kartı otomasyonu: "{Müşteri_Adi}, teşekkürler!" `[Katman] Free` `[★★★]`
- [ ] Yorum kartı: Google Maps / pazaryeri yorum QR + yıldız grafiği `[Free` `[★★★]`
- [ ] Marka kartı: Instagram QR, web sitesi, kupon kodu `[Free` `[★★★]`
- [ ] Kupon kartı: kod + son kullanma tarihi `[★★]`
- [ ] Hediye notu / hediye paketi etiketi `[★]`

### 1.4 Faturalama Köprüsü `[Katman] Pro` `[Kısıt] Özel entegratör gerekir (Paraşüt, Logo, Nebim)`
- [ ] E-Arşiv fatura linkinin fişte QR olarak basılması `[★]`
- [ ] Sipariş listesinde fatura durumu göstergesi `[★]`

---

## 2. Depo, Stok ve Varyant Yönetimi

### 2.1 Toplu Etiket Üretici `[Free ≤3 satır / Pro sınırsız]` `[Önem] ★★★`
- [ ] CSV/Excel yükleme + sütun eşleme sihirbazı ("hangi sütun barkod?") `[★★★]`
- [ ] Basım öncesi önizleme grid'i (100 etiketi yan yana gör) `[★★★]`
- [ ] Şablona bağlı seri üretim: kayıtlı fiyat etiketi × CSV satırları `[★★★]`
- [ ] Hatalı satır raporu + atlayarak devam `[★★]`

### 2.2 Depo Etiketleri `[Katman] Pro`
- [ ] Raf kodu etiketleri (A-12-03 formatı, dev punto) `[★★★]`
- [ ] Koli içerik etiketi: içindekiler listesi + koli QR `[★★]`
- [ ] Konum QR: tarayan personel raf bilgisini görür `[★]`

### 2.3 İzlenebilirlik `[Katman] Pro`
- [ ] Seri No / IMEI etiketi (tekil + sayaç ile seri üretim) `[★★]`
- [ ] Parti (Lot) etiketi: parti no + üretim tarihi + TETT/SKT `[★★★]` (kozmetik/gıda)
- [ ] GS1 uyumlu tarih format seçenekleri `[★★]`

### 2.4 Sayım Desteği `[Katman] Pro` `[Önem] ★`
- [ ] Boş çizgili sayım listesi basımı `[★]`
- [ ] Barkod okutarak hızlı yeniden baskı `[★★]`

---

## 3. Mikro POS, Restoran & Kafe

### 3.1 Hızlı Adisyon `[Katman] Pro` `[Bağımlılık] Yerel menü deposu` `[Önem] ★★★`
- [ ] Menü yönetimi: kategori/ürün/fiyat (yerel + CSV içe aktarma) `[★★★]`
- [ ] Dokunarak sepet; adet ve ürün notu ("az şekerli") `[★★★]`
- [ ] Masa / paket servis ayrımı; masa no fişte `[★★]`
- [ ] Mutfak fişi (ürün+not) ile müşteri fişi (tutarlı) ayrımı `[★★★]`
- [ ] Gün sonu yönetimsel özet (sipariş adedi, ciro) `[★★]` `[Kısıt] Mali belge değildir`

### 3.2 Ödeme Fişleri `[Katman] Pro`
- [ ] IBAN/TR-Karekod QR + tutar gömülü fiş (müşteri tutarı yazmaz) `[★★★]`
- [ ] QR üstte, toplam altta düzeni; bahşiş satırı opsiyonel `[★★]`

> **Dürüst teknik not:** Bankadan bağımsız gerçek "dinamik FAST QR" ancak PSP/banka
> anlaşmasıyla olur. İlk sürüm EMVCo standardında tutarlı statik QR kullanır
> (destekleyen banka uygulamaları tutarı otomatik çeker). PSP entegrasyonu ayrı faz.

### 3.3 Sıramatik `[Katman] Pro` `[Önem] ★★`
- [ ] Otomatik artan sıra no + tahmini bekleme süresi `[★★]`
- [ ] Canlı sıra takip QR'ı (backend'de basit sayaç sayfası) `[★★]`

---

## 4. Hizmet Sektörü, Teknik Servis & Takip

### 4.1 Cihaz Kabul & Servis Takibi `[Katman] Pro` `[Önem] ★★★`
- [ ] Kabul etiketi: müşteri, telefon, cihaz, arıza özeti, tarih, takip no barkodu `[★★★]`
- [ ] Durum akışı: Kabul → İnceleme → Onay → Tamir → Hazır → Teslim `[★★★]`
- [ ] Müşteri takip QR: tarayınca cihaz durumu görünür (backend sayfası) `[★★★]`
- [ ] Hazır olunca WhatsApp/SMS mesaj taslağı kopyalama `[★★]`
- [ ] Kompakt kutu etiketi versiyonu `[★★]`

### 4.2 Randevu Fişleri `[Katman] Pro` `[Önem] ★★`
- [ ] Randevu tarihi/saati + takvime ekleme QR (.ics) `[★★★]`
- [ ] Konum/navigasyon QR `[★★]`
- [ ] İşlem notu alanı `[★]`

### 4.3 Bakım & Kalibrasyon `[Katman] Pro` `[Önem] ★★`
- [ ] "Sonraki bakım: ___" yapışkan etiketi (kombi, klima, araç) `[★★★]`
- [ ] Geçmiş bakım kaydı QR `[★★]`
- [ ] Yağ değişimi vinyet formatı `[★]`

---

## 5. Gelişmiş Şablon & Tasarım Araçları

### 5.1 Değişken Veri Motoru `[Free: temel / Pro: tüm tipler]` `[Önem] ★★★` — platformun kalbi
- [ ] `{Degisken}` sözdizimi; tipler: metin, sayı, **para**, tarih, barkod, QR, çoklu satır `[★★★]`
- [ ] Değişken tanımlanınca otomatik form üretilir → doldur → yazdır `[★★★]`
- [ ] Varsayılan değerler + zorunlu alan işareti `[★★]`
- [ ] Formu CSV ile besle → toplu üretim (2.1 ile aynı boru hattı) `[★★★]`
- [ ] Son kullanılan form girişleri hatırlanır `[★★]`

### 5.2 Şablon Stüdyosu
- [ ] Sürükle-bırak düzenleme (mevcut fabric altyapısından devralınır) `[★★]`
- [ ] Marka seti: logo + font + footer; tek tıkla şablona uygula `[★★★]`
  - `[Katman] Free` fişte "iPrint ile hazırlandı" imzası · `[Pro]` kaldırılabilir `[Kısıt]`
- [ ] Şablon çoğaltma + sürüm geçmişi `[★★]`
- [ ] 50+ sektörel hazır şablon kütüphanesi `[Katman] Pro` `[★★★]`

### 5.3 AI Görsel Araçları `[Katman] Pro` `[Kısıt] Online çalışır, API maliyeti var`
- [ ] Metinden ikon/çıkartma: "kahve bardağı" → termal dostu 1-bit görsel `[★★★]`
- [ ] Pipeline: üretim → otomatik threshold/dithering → önizleme → onayla/tekrar üret `[★★★]`
- [ ] Arka plan silme + OCR ile aynı "AI Araçları" panelinde toplanır `[★★]`

### 5.4 Topluluk Şablon Marketi `[Free: indirme / Pro: paylaşım]` `[Bağımlılık] Faz 6-7 API (kod hazır)` `[★★★]`
- [ ] Galeri: gezinme, mod/kategori filtresi, arama, puanlama
- [ ] "Paylaş" butonu: şablon payload'ını sunucuya gönder (değişkenler korunur)
- [ ] Moderasyon kuyruğu + kötüye kullanım raporu

---

## 6. Freemium & Gelir Modeli

### 6.1 Katman Matrisi

| Özellik | Free | Pro / İşletme |
|---|---|---|
| Metin, fotoğraf, QR, banner | ✅ Sınırsız | ✅ |
| Standart şablonlar | 6 temel | 50+ sektörel |
| Toplu baskı | ≤3 etiket | Sınırsız |
| Kayıt/taslak | 5 kayıt | Sınırsız + bulut |
| Marka seti / footer | "iPrint ile hazırlandı" sabit | Özel logo, kaldırılabilir |
| Pazaryeri entegrasyonu | — | ✅ Sınırsız |
| POS/adisyon, servis takibi, depo araçları | — | ✅ |
| AI görsel üretimi | — | Kota bazlı |
| Topluluk şablonu | İndirme | İndirme + paylaşım |

### 6.2 Lisans Altyapısı `[Bağımlılık] Faz 6 backend`
- [ ] Hesap bazlı yetki (JWT claim) — cihaz değişse de Pro takip eder `[★★★]`
- [ ] Offline toleransı: son doğrulama 7 gün cache'li `[★★★]`
- [ ] Kullanım ölçümü: aylık baskı sayacı (toplu baskı limiti için) `[★★]`
- [ ] Free→Pro denemesi: 14 gün tam özellik `[★★]`

### 6.3 Ödeme Kanalları `[Kısıt] ÖNEMLİ`
> Web/PWA üzerinden PayTR/Iyzico/Shopier serbesttir. App Store/Play Store'da dağıtılırsa
> dijital abonelik için mağaza IAP zorunludur (komisyon ~%15-30). Strateji: Pro satışı
> önce web'den; mağaza sürümlerinde "web hesabıyla giriş" modeli.

- [ ] PayTR/Iyzico abonelik entegrasyonu (backend webhook'lu) `[★★★]`
- [ ] Lisans anahtarı alternatifi (satış kanalları için manuel anahtar) `[★★]`

### 6.4 Ek Monetizasyon Fikirleri
- [ ] Beyaz etiket (white-label) işletme lisansı: kendi logolu özel build `[★]`
- [ ] Sarf malzeme ortağı programı (rulo satışı ortaklığı) `[★]`
- [ ] Shopify App Store listelemesi (global dağıtım kanalı) `[★★]`

---

## 7. Otomasyon & Entegrasyon Katmanı (yeni öneri)

### 7.1 Yazdırma API'si — farklılaştırıcı güç `[Katman] Pro` `[Bağımlılık] Backend + açık PWA sekmesi` `[★★★]`
- [ ] `POST /print`: dış sistemden JSON şablon+veri gönder → kullanıcı onaylı otomatik basım
- [ ] Uç kullanım: e-ticaret paketi kapanınca otomatik etiket, kasa sistemi entegrasyonu
- [ ] Güvenlik: cihaz başına token, onay penceresi ayarı ("her zaman izin ver")

### 7.2 İş Kuralları / Zamanlanmış Görevler `[Katman] Pro` `[Önem] ★★`
- [ ] "Her gün 14:00'te bekleyen sipariş etiketlerini bas" (PWA arka plan senkron sınırlı; açık sekme gerektirir — dürüst kısıt)
- [ ] Yeni sipariş geldiğinde bildirim + tek tık bas

### 7.3 Dışa Aktarma
- [ ] Baskı geçmişi raporu CSV export `[★★]`
- [ ] Aylık özet: kaç etiket, hangi türler, sarf tahmini `[★★]`

## 8. Ekip & Çoklu Kullanım `[Katman] İşletme` `[Bağımlılık] Backend` (yeni öneri)
- [ ] Ekip hesapları: yönetici + görevli rolleri `[★★]`
- [ ] Ortak şablon kütüphanesi ve cihaz profillerinin bulut senkronu `[★★★]`
- [ ] Kim ne bastı faaliyet kaydı `[★★]`
- [ ] Cihazlar arası devam: telefonda başlanan kuyruk masada sürsün `[★]`

## 9. Raporlama & Yönetim Paneli `[Katman] Pro` (yeni öneri)
- [ ] Basit dashboard: günlük/haftalık baskı sayıları, en çok kullanılan şablonlar `[★★]`
- [ ] Sarf tahmini: rulo bitmeden uyarı (manuel metre girişiyle) `[★]`
- [ ] Etiket maliyet hesaplayıcı (rulo fiyatı / etiket adedi) `[★]`

## 10. Platform & Teknik Sağlık (devam eden yatırım)
- [ ] KVKK/GDPR: tüm müşteri verisi varsayılan olarak cihazda; sunucuya yalnız opt-in senkron `[★★★]`
- [ ] Çok dil: TR/EN tam kapsam; DE/AR ileride `[★★]`
- [ ] Erişilebilirlik: büyük punto modu, kontrast `[★]`
- [ ] Performans bütçeleri: açılış <2sn, baskıya kadar <5sn `[★★]`
- [ ] Crash reporting (Sentry) + sürüm telemetrisi (opt-in) `[★★]`

---

## Teknik Kısıtlar & Yasal Notlar (özet)

1. **Pazaryeri API'leri** resmi developer başvurusu + onay ister (Trendyol/HB/Amazon). Sandbox test fazı planlanmalı.
2. **Dinamik FAST QR** banka/PSP anlaşması gerektirir; v1 EMVCo tutarlı statik QR.
3. **E-fatura/e-arşiv** özel entegratör (GİB yetkili) üzerinden yapılır; yasal mali fiş bu uygulamanın kapsamı DEĞİL — tüm fişler "yönetimsel".
4. **Mağaza IAP**: mobil mağazalarda dijital abonelik komisyonu; web-first satış stratejisi.
5. **AI görsel üretimi** online + token maliyetli; offline fallback yok (OCR/benzeri gibi davranır).
6. **Arka plan otomasyonu** PWA'da sekme açıkken çalışır; gerçek cron için masaüstü (Electron) veya sunucu tetiklemesi gerekir.

## Karar Bekleyen Sorular (detaylandırmadan önce)

1. İlk pazaryeri hedefi Trendyol mu, Shopier mi? (butik vs kurumsal stratejiyi belirler)
2. Pro fiyatlandırma: aylık TL abonelik mi, yıllık mı, tek seferlik lisans da olsun mu?
3. AI görsel için tercih: Google Gemini (mevcut altyapıya yakın) mi, başka sağlayıcı mı?
4. Ekip/çoklu kullanım ilk sürümde gerekli mi, sonrasına bırakılsın mı?
5. Hedef cihaz: 58mm mi 80mm mi ağırıklı? (POS modülü 80mm'yi önceliklendirir)

---

## Karar Kaydı (25 Ağustos 2026 — onaylandı)

| # | Soru | Karar |
|---|---|---|
| 1 | İlk pazaryeri | **Trendyol** (Satıcı API) |
| 2 | Fiyatlandırma | **Aylık + Yıllık abonelik** (web üzerinden PayTR/Iyzico) |
| 3 | AI görsel üretimi | **Sonraki sürüme ertelendi** — panel yeri hazır tutulur |
| 4 | Ekip / çoklu kullanım | **İlk sürümde dahil** (yönetici+görevli rolleri, ortak şablonlar) |
| 5 | Kağıt genişliği | **58mm ağırlıklı** (POS modülünde 80mm desteklenir) |

Bu kararlarla kapsam değişiklikleri:
- Bölüm 5.3 (AI görsel) → v1.1 planına taşındı; "AI Araçları" panelinde yer ayrılır.
- Bölüm 8 (Ekip) → ilk büyük sürüm kapsamında zorunlu modül.
- Trendyol entegrasyonu için developer başvuru süreci paralel başlatılmalı (onay bekleme süresi projeden bağımsız).

### Ek karar (25 Ağustos 2026)
- **Trendyol test ortamı:** Kullanıcının mevcut bir projesindeki Trendyol API erişimi
  geliştirme/test aşamasında kullanılacak. Anahtarlar `.env` içinde tutulur (git'e ASLA girmez),
  kod tarafında yalnızca `TRENDYOL_SUPPLIER_ID` / `TRENDYOL_API_KEY` / `TRENDYOL_API_SECRET`
  değişkenleri referans alınır.
