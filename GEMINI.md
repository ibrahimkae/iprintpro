# iPrint Pro - Project Documentation

## Current State (29 Ağustos 2026)

- **Web Build**: Building correctly (`npm run build`). Heavy AI libs are lazy-loaded chunks.
- **Type Check**: 100% clean (`npm run lint` / `tsc --noEmit`).
- **Printing**: Stable. Flow control via `BleClient.write` (ACK backpressure), settle delay after wake, end-of-job drain wait, chunked paper feed.
- **Template System & Store**: Redundant menus removed, compact Pinterest waterfall layout for templates, dedicated "Profesyonel Şablonlar" category, and compact tabbed library view (Favoriler, Taslaklar, Hızlı Metin).
- **Connection Management**: Minimalist dialog with in-app BLE details, auto-reconnect toggle, paired device list, and collapsible advanced USB settings.

## Recent Fixes (this revision)

1. **Cancel-flag bug** (`printer.ts`): `resetCancellation()` is now called in `wake()`. Previously a cancelled job poisoned the next print (wake packet silently dropped → top of image cut).
2. **Bit order per protocol** (`image-processing.ts`): `processImage(..., { msbFirst })`. LuckJingle = LSB-first (default), real ESC/POS devices get MSB-first as the GS v 0 spec requires. Packing is strictly row-aligned (`bytesPerRow = ceil(w/8)`), safe for any width.
3. **Battery via notifications** (`printer.ts`): subscribes to the printer notify channel on connect and parses the 0xA3 answer (percent byte or mV voltage); also listens on standard Battery Service when present. Battery % now works on GB03-class printers.
4. **Print error logging** (`App.tsx`): catch block in `handlePrint` logs view/protocol/canvas size to the logger.
5. **Article template overlap** (`TemplateStudio.tsx`): subtitle/divider positioned dynamically under multi-line titles.
6. **Barcode quality** (`TemplateStudio.tsx`): EAN-13 auto-detect, natural aspect ratio draw, dynamic tag height.
7. **Storage safety** (`history-storage.ts`): history/draft previews compressed to ~420px JPEG; quota overflow evicts oldest entries instead of failing silently.
8. **QR Unicode** (`QRGenerator.tsx`): SVG serialization uses `encodeURIComponent` — Turkish characters no longer crash generation.
9. **Code splitting**: `background-removal` + `ocr` dynamically imported (button-time), removed from main bundle.
10. **Cleanup**: dead web view state removed, console logging dev-only, unused deps dropped (`@google/genai`, `express`, `dotenv`; `shadcn` kept — provides tailwind.css preset).

## Known Remaining Items (low priority)

- OCR language data + imgly models still download from CDN at first use (offline-first use needs local hosting).
- Google Fonts via CDN @import: offline fallback fonts differ slightly from preview.
- pdf.js worker loaded from unpkg CDN.
- i18n coverage is partial (~menu keys translated, rest hardcoded TR).

