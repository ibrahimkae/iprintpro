# Changelog

## 1.0.0 — 2026-08-25

### Printing engine (verified on GB03-class printers)
- Flow-controlled BLE writes (ACK backpressure) — no more dropped lines
- Wake settle delay + end-of-job drain + chunked paper feed
- Protocol-aware bit packing (LuckJingle LSB / ESC/POS MSB), row-aligned at any width
- Cancel-flag poisoning fixed (wake no longer dropped after a cancelled job)
- Battery percentage via notify channel (0xA3 parse) + standard Battery Service

### Features
- Device profiles: printer settings auto-saved after print, auto-restored on reconnect
- EAN-13 auto-detect + aspect-correct barcodes in price/shipping templates
- PWA: installable app shell, offline UI, font caching
- Backend scaffold (`server/`): Fastify + MariaDB, JWT auth, community template API

### Quality
- 34 unit tests (CRC8 vectors, packet framing, bit packing, dithering invariants, storage)
- ESLint (0 errors) + Prettier; strict type checks on client and server
- Code splitting: OCR/background-removal models load on demand

### Fixed
- Turkish characters crashing QR generation (Unicode SVG serialization)
- Print history silently lost when localStorage quota exceeded (compressed + evicts oldest)
- Article template title/subtitle overlap
