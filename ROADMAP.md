# iPrint Pro — Master Yol Haritası

> Kural: Her faz biterken **doğrulanmış, çalışan** durumda olur. Yarım/demo özellik main'e girmez.
> Her fazın sonunda: `tsc --noEmit` ✅ · `vitest run` ✅ · `vite build` ✅ · manuel duman testi not edilir.

## Faz 0 — Temel Altyapı  ✅ (bu commit ile başlar)
- [x] Git deposu başlat, baseline commit
- [x] Vitest kurulumu (`npm test`)
- [x] ESLint + Prettier yapılandırması
- [ ] GitHub Actions CI (tsc + test + build) — remote eklenince aktifleşir

## Faz 1 — Test Güvenliği Ağı
Kritik saf fonksiyonlar test altına alınır. Amaç: refactor ve yeni özelliklerde
yazdırma davranışının asla sessizce bozulmaması.
- [ ] `crc8` — bilinen vektörler + boş giriş
- [ ] `createLuckJinglePacket` — header/uzunluk/CRC/tail byte doğrulama
- [ ] `processImage` bit packing — LSB (LuckJingle) ve MSB (ESC/POS) modları,
      satır-hizalama (width % 8 ≠ 0 dahil), siyah=bir eşleşmesi
- [ ] Dithering fonksiyonları — çıktı yalnızca {0,255} değerleri içeriyor mu
- [ ] `history-storage` — sıkıştırma çağrısı + kota taşma tahliyesi
- [ ] `feedPaper` / `bitmapCommand` komut bayt dizileri snapshot

## Faz 2 — Mimari Refactor
- [ ] Klasör yapısı: `src/views/{editor,image,document,banner,collage,tools,templates}`,
      `src/hooks`, `src/context`
- [ ] `usePrinterContext` — bağlantı/pil/protokol state'i merkezi; prop drilling sonu
- [ ] `PrinterService` → context provider içinde tek instance
- [ ] App.tsx ≤ ~400 satır (yalnızca kabuk + yönlendirme)
- Doğrulama: tüm görünümler açılıyor, yazdırma akışı değişmedi (testler yeşil)

## Faz 3 — Yazdırma Motoru Pro
- [ ] Cihaz profilleri: kayıtlı yazıcılar (isim, deviceId, protokol, kanal,
      koyuluk, sayfa genişliği) localStorage'da; yeniden bağlanınca profil otomatik uygulanır
- [ ] Yazıcı durum sorgusu (0xA7 ailesi): kağıt yok / aşırı sıcak / pil — UI uyarı bandı
- [ ] Kalibrasyon sihirbazı: ilk bağlantıda test deseni → önerilen koyuluk/genişlik
- [ ] İş kuyruğu: yarım kalan baskı kaydı, "devam et?" istemi
- Doğrulama: GB03 üzerinde gerçek baskıyla senaryo testi

## Faz 4 — PWA + Offline Kabuk
- [ ] vite-plugin-pwa: manifest + service worker (app shell cache)
- [ ] İkon seti (192/512/maskable) — mevcut appIcon.png'den üretim
- [ ] CDN bağımlılıklarının zarif düşüşü: font fallback bildirimi, OCR/model
      indiremezse açıklayıcı hata (sessiz başarısızlık yok)
- Doğrulama: Lighthouse PWA denetimi ≥ installable; uçak modunda kabuk açılır

## Faz 5 — Android Release Pipeline
- [ ] `versionCode`/`versionName` stratejisi (semver → build numarası)
- [ ] Signing config (keystore üretim rehberi + .gitignore'a keystore)
- [ ] AAB çıktısı + Play Store listing metinleri (TR/EN)
- [ ] BLE izinleri Android 12+ runtime akışı doğrulaması
- Doğrulama: imzalı AAB kurulup gerçek cihazda baskı

## Faz 6 — Backend + MariaDB
- [ ] Fastify + TypeScript API iskeleti (`server/` klasörü, ayrı package.json)
- [ ] MariaDB şeması: users, devices, templates, template_versions, ratings
- [ ] Auth: e-posta + JWT (refresh rotasyonlu)
- [ ] Şablon CRUD + cihaz ayarı senkronizasyon endpoint'leri
- [ ] Docker Compose (mariaDb + api) ile tek komut lokal kurulum
- Doğrulama: entegrasyon testleri (supertest) + iki istemciden senkron demosu

## Faz 7 — Topluluk Şablonları
- [ ] Şablonda "Paylaş" → sunucuya JSON payload (canvas verisi değil, veri modeli)
- [ ] Galeride gezinme/arama/kategori filtresi; önizleme thumbnail'ları
- [ ] Puanlama + kötüye kullanım raporu; temel moderasyon kuyruğu
- [ ] Hız limiti + payload boyutu sınırı + şema doğrulama
- Doğrulama: paylaş→galeride görün→başka hesapta aç→bas akışı uçtan uca

## Faz 8 — iOS
- [ ] CocoaPods + `npx cap add ios` + Info.plist BLE izinleri
- [ ] İkon/splash üretimi (`@capacitor/assets`)
- Doğrulama: simülatörde kabuk + gerçek cihazda BLE taraması

## Faz 9 — Cila & v1.0
- [ ] Electron auto-update (electron-updater + update feed kararı)
- [ ] Sentry entegrasyonu (ücretsiz katman)
- [ ] README overhaul (platform matrisi, ekran görüntüleri) + LICENSE + CHANGELOG.md
- [ ] `1.0.0` etiketi

---

## Çalışma Sözleşmesi
1. Her faz kendi branch'inde: `faz/1-test-agı` vb., bitince main'e merge.
2. AI Studio'ya yükleme anları: her faz sonundaki zip `iprint-pro-fazN.zip`.
3. Testler kırmızıyken hiçbir özellik merge edilmez.
4. Sunucu gerektiren fazlarda (6-7) önce lokal Docker, sonra canlı karar verilir.
