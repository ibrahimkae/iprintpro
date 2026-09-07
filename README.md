# iPrint Pro

Bluetooth termal yazıcı stüdyosu — tek kod tabanından web, Android ve masaüstü.
Fotoğraf baskısı, PDF, metin editörü, banner/etiket, kolaj, QR/barkod araçları,
7 kategori şablon stüdyosu, cihaz profilleri ve topluluk şablonu altyapısı.

## Platformlar

| Platform | Durum | Not |
|---|---|---|
| Web (PWA) | ✅ Çalışır | `npm run dev` / `npm run build` |
| Android | ✅ APK/AAB | Capacitor 7 — bkz. `docs/ANDROID-RELEASE.md` |
| macOS/Windows | ✅ Electron | `electron/` klasörü |
| iOS | 📋 Hazır adımlar | GEMINI.md + ROADMAP Faz 8 |

## Hızlı başlangıç
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 34 unit test
npm run lint       # tsc --noEmit
npm run build      # production + PWA (sw.js, manifest)
```

## Yazdırma mimarisi (özet)
```
Görünüm → canvas → processImage() [dithering + bit packing]
        → PrinterService.sendData() [BLE ACK flow control]
        → yazıcı (LuckJingle veya ESC/POS protokolü)
```
- Protokol otomatik seçimi: cihaz adına göre (`printer.ts → getProtocol`)
- Bit sırası protokole göre: LSB (LuckJingle) / MSB (ESC/POS GS v 0)
- Cihaz profilleri her başarılı baskıdan sonra kaydedilir, yeniden bağlanınca geri yüklenir

## Klasörler
```
src/views/       Görünümler (editor, document, banner, ...)
src/context/     PrinterProvider (bağlantı/pil/profil state'i)
src/lib/         printer.ts, image-processing.ts, device-profiles.ts ...
server/          Fastify + MariaDB API (auth, topluluk şablonları)
docs/            Release rehberleri
ROADMAP.md       Faz planı ve ilerleme
```

## Test & kalite
- `npm test` — CRC8 vektörleri, paket formatı, LSB/MSB packing, dithering
  değişmezleri, depolama kota davranışı
- `npm run lint` — TypeScript strict kontrolü
- `server/` ayrı tsc doğrulamasına sahip

## Lisans
MIT — bkz. LICENSE
