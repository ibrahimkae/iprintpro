import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

export interface NormalizedOrder {
  orderNumber: string;
  packageId: string;
  status: string;
  customerName: string;
  customerPhone?: string;
  address: {
    line1: string;
    district: string;
    city: string;
    postalCode?: string;
    country: string;
  };
  items: {
    name: string;
    sku: string;
    barcode?: string;
    quantity: number;
    variant?: string;
  }[];
  totalPrice: number;
  cargoProviderName?: string;
  cargoTrackingNumber?: string;
  createdAt: number; // epoch ms
}

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const RETRY_DELAY_MS = 1200;
const SINGLE_FETCH_SIZE = 200;
const SINGLE_FETCH_MAX_PAGES = 5;
const SINGLE_FETCH_DAYS = 7;

const listCache = new Map<
  string,
  CacheEntry<{ totalElements: number; page: number; packages: NormalizedOrder[] }>
>();
let singleCache: CacheEntry<NormalizedOrder[]> | null = null;

export function clearTrendyolCache(): void {
  listCache.clear();
  singleCache = null;
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function num(v: unknown): number | null {
  const n =
    typeof v === 'number'
      ? v
      : typeof v === 'string' && v.trim() !== ''
        ? Number(v)
        : NaN;
  return Number.isFinite(n) ? n : null;
}

function maskLine(line: string): string {
  return line.length <= 10 ? line : `${line.slice(0, 10)}…`;
}

function joinVariant(attrs: unknown): string | undefined {
  if (!Array.isArray(attrs)) return undefined;
  const parts = attrs
    .map((a) =>
      typeof a === 'string' ? a.trim() : str((a as Record<string, unknown>)?.attributeValue)
    )
    .filter((v): v is string => !!v && v.length > 0);
  return parts.length > 0 ? parts.join(' / ') : undefined;
}

export function normalizePackage(raw: Record<string, unknown>): NormalizedOrder | null {
  // Trendyol ham JSON'u alan adları sürümden sürüme değişir — savunmacı okuma.
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, any>;
  const pkgId = num(r.id) ?? num(r.packageId);
  const orderNumber = str(r.orderNumber) ?? str(r.orderCode);
  if (pkgId === null || !orderNumber) return null;

  const addr = (r.shipmentAddress ?? r.deliveryAddress ?? {}) as Record<string, any>;
  const itemsRaw: unknown[] = Array.isArray(r.items) ? r.items : [];
  const items = itemsRaw.map((itRaw) => {
    const it = (itRaw ?? {}) as Record<string, any>;
    const variant = str(it.variant) ?? joinVariant(it.variantAttributes ?? it.attributes);
    const item: NormalizedOrder['items'][number] = {
      name: str(it.productName) ?? str(it.name) ?? '',
      sku: str(it.merchantSku) ?? str(it.sku) ?? '',
      quantity: num(it.quantity) ?? num(it.itemQuantity) ?? 1,
    };
    const barcode = str(it.barcode);
    if (barcode) item.barcode = barcode;
    if (variant) item.variant = variant;
    return item;
  });

  const out: NormalizedOrder = {
    orderNumber,
    packageId: String(pkgId),
    status: str(r.status) ?? str(r.packageStatus) ?? '',
    customerName:
      [str(r.customerFirstName), str(r.customerLastName)].filter(Boolean).join(' ') ||
      str(r.fullName) ||
      '',
    address: {
      line1: str(addr.line1) ?? str(addr.address1) ?? str(addr.fullAddress) ?? '',
      district: str(addr.district) ?? '',
      city: str(addr.city) ?? '',
      country: str(addr.country) ?? str(addr.countryCode) ?? 'TR',
    },
    items,
    totalPrice: num(r.totalPrice) ?? num(r.price) ?? 0,
    createdAt: num(r.createdDate) ?? num(r.createdAt) ?? Date.now(),
  };
  const phone = str(r.customerPhone) ?? str(addr.phone);
  if (phone) out.customerPhone = phone;
  const postal = str(addr.postalCode);
  if (postal) out.address.postalCode = postal;
  const cargo = str(r.cargoProviderName);
  if (cargo) out.cargoProviderName = cargo;
  const tracking = str(r.cargoTrackingNumber);
  if (tracking) out.cargoTrackingNumber = tracking;
  return out;
}

function extractPackages(json: unknown): { totalElements: number; packages: NormalizedOrder[] } {
  const payload = (json ?? {}) as Record<string, unknown>;
  const arr: unknown[] = Array.isArray(payload.content)
    ? payload.content
    : Array.isArray(payload.data)
      ? payload.data
      : [];
  const packages = arr
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map((p) => normalizePackage(p))
    .filter((p): p is NormalizedOrder => p !== null);
  return { totalElements: num(payload.totalElements) ?? packages.length, packages };
}

const blankToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const listQuerySchema = z.object({
  status: z.string().max(64).optional(),
  page: z.preprocess(blankToUndefined, z.coerce.number().int().min(0).default(0)),
  size: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(500).default(50)),
  days: z.preprocess(blankToUndefined, z.coerce.number().int().min(1).max(365).default(7)),
});

interface Creds {
  supplierId: string;
  apiKey: string;
  apiSecret: string;
}

function getCreds(): Creds | null {
  const supplierId = process.env.TRENDYOL_SUPPLIER_ID;
  const apiKey = process.env.TRENDYOL_API_KEY;
  const apiSecret = process.env.TRENDYOL_API_SECRET;
  if (!supplierId || !apiKey || !apiSecret) return null;
  return { supplierId, apiKey, apiSecret };
}

function baseUrl(): string {
  return process.env.TRENDYOL_BASE_URL || 'https://apigw.trendyol.com';
}

function mockEnabled(): boolean {
  return process.env.TRENDYOL_MOCK === 'true';
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type UpstreamResult =
  | { kind: 'ok'; json: unknown }
  | { kind: 'unauthorized' }
  | { kind: 'rateLimited' }
  | { kind: 'other'; status: number };

async function trendyolGet(path: string, creds: Creds): Promise<UpstreamResult> {
  const auth = `Basic ${Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString('base64')}`;
  const call = () =>
    fetch(`${baseUrl()}${path}`, { headers: { Authorization: auth, Accept: 'application/json' } });
  let res: Response;
  try {
    res = await call();
    // 429 → tek kez 1200ms bekleyip tekrar dene (SPEC-03 §2.3)
    if (res.status === 429) {
      await sleep(RETRY_DELAY_MS);
      res = await call();
    }
  } catch {
    return { kind: 'other', status: 0 };
  }
  if (res.status === 200) {
    try {
      return { kind: 'ok', json: await res.json() };
    } catch {
      return { kind: 'other', status: 200 };
    }
  }
  if (res.status === 401) return { kind: 'unauthorized' };
  if (res.status === 429) return { kind: 'rateLimited' };
  return { kind: 'other', status: res.status };
}

const MOCK_BASE_TIME = 1787702400000;

export function buildMockPackages(): NormalizedOrder[] {
  const statuses = ['Created', 'Picking', 'Invoiced', 'Shipped'];
  const people: [string, string][] = [
    ['Ayşe Yılmaz', '0532 111 22 33'],
    ['Mehmet Demir', '0533 222 33 44'],
    ['Elif Kaya', ''],
    ['Mustafa Çelik', '0535 444 55 66'],
    ['Zeynep Şahin', '0536 555 66 77'],
    ['Ali Yıldırım', ''],
    ['Fatma Aydın', '0538 777 88 99'],
    ['Emre Öztürk', '0539 888 99 00'],
    ['Hatice Arslan', ''],
    ['Burak Doğan', '0542 000 11 22'],
    ['Merve Koç', '0543 121 23 34'],
    ['Serkan Kurt', ''],
  ];
  const addresses: NormalizedOrder['address'][] = [
    { line1: 'Bağdat Cad. No:112 D:5', district: 'Kadıköy', city: 'İstanbul', postalCode: '34710', country: 'TR' },
    { line1: 'Atatürk Blv. No:45 K:2', district: 'Konak', city: 'İzmir', country: 'TR' },
    { line1: 'Kızılay Meydanı No:7', district: 'Çankaya', city: 'Ankara', postalCode: '06420', country: 'TR' },
    { line1: 'Zafer Cad. No:23 D:1', district: 'Nilüfer', city: 'Bursa', postalCode: '16140', country: 'TR' },
  ];
  const catalog = [
    { name: 'Fotoğraf Mug 330ml', sku: 'MUG-330-WHT', barcode: '8690123456789' },
    { name: 'Tişört Beyaz L', sku: 'TSR-BYZ-L', barcode: '8690123456790' },
    { name: 'Canvas Baskı 30x40', sku: 'CNV-3040', barcode: '8690123456791' },
    { name: 'Duvar Takvimi 2027 A4', sku: 'TKV-2027-A4', barcode: '8690123456792' },
  ];
  const cargos = ['Yurtiçi Kargo', 'Aras Kargo', 'PTT Kargo', 'MNG Kargo'];
  return Array.from({ length: 12 }, (_, i) => {
    const status = statuses[i % 4];
    const pkg: NormalizedOrder = {
      orderNumber: `TY-${90001 + i}`,
      packageId: String(700001 + i),
      status,
      customerName: people[i][0],
      address: { ...addresses[i % addresses.length] },
      items: [{ ...catalog[i % catalog.length], quantity: (i % 3) + 1 }],
      totalPrice: Math.round((149.9 + i * 35.25) * 100) / 100,
      createdAt: MOCK_BASE_TIME - i * 3600_000,
    };
    const phone = people[i][1];
    if (phone) pkg.customerPhone = phone;
    if (status === 'Invoiced' || status === 'Shipped') {
      pkg.cargoProviderName = cargos[i % cargos.length];
    }
    if (status === 'Shipped') pkg.cargoTrackingNumber = `TRK${730001 + i}`;
    return pkg;
  });
}

async function trendyolRoutes(app: FastifyInstance): Promise<void> {
  // Güvenlik kapısı: TRENDYOL_REQUIRE_AUTH=true iken tüm rotalar geçerli JWT ister.
  // (Deployed ortamda sipariş/müşteri verisi herkese açık kalmasın diye.)
  const requireAuth = process.env.TRENDYOL_REQUIRE_AUTH === 'true';
  const guard = requireAuth
    ? { onRequest: [async (req: any, reply: any) => {
        try { await req.jwtVerify(); } catch { return reply.code(401).send({ error: 'Oturum gerekli' }); }
      }] as any }
    : {};
  const opts = (extra: Record<string, unknown> = {}) => (requireAuth ? { ...guard, ...extra } : extra);

  app.get('/trendyol/orders', opts(), async (req, reply) => {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'Sorgu geçersiz' });
    const { page, size, days } = parsed.data;
    const status = parsed.data.status?.trim() || undefined;

    if (mockEnabled()) {
      const all = buildMockPackages();
      const filtered = status ? all.filter((p) => p.status === status) : all;
      const start = page * size;
      return { totalElements: filtered.length, page, packages: filtered.slice(start, start + size) };
    }

    const creds = getCreds();
    if (!creds) return reply.code(503).send({ error: 'Trendyol anahtarları eksik (.env)' });

    const key = `${status ?? ''}|${page}|${size}|${days}`;
    const hit = listCache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value;

    const endDate = Date.now();
    const startDate = endDate - days * 24 * 60 * 60 * 1000;
    let path = `/integration/order/seller-packages?supplierId=${encodeURIComponent(
      creds.supplierId
    )}&page=${page}&size=${size}&startDate=${startDate}&endDate=${endDate}`;
    if (status) path += `&status=${encodeURIComponent(status)}`;

    const res = await trendyolGet(path, creds);
    if (res.kind === 'unauthorized') {
      return reply.code(401).send({ error: 'Trendyol anahtarları geçersiz' });
    }
    if (res.kind === 'rateLimited') {
      return reply.code(502).send({ error: 'Trendyol hız sınırı' });
    }
    if (res.kind !== 'ok') {
      // 556 = Trendyol kenar servisi IP/seviye engeli: bu ağdan istekler reddediliyor.
      return reply.code(502).send({
        error: 'Trendyol bu ağdan gelen istekleri engelliyor (556). Farklı bir ağ (telefon hotspot) veya AI Studio bulut dağıtımından deneyin; Satıcı Paneli > Entegrasyon Bilgileri sayfasindan API erişiminizin aktif olduğunu kontrol edin.'
      });
    }

    const { totalElements, packages } = extractPackages(res.json);
    const value = { totalElements, page, packages };
    listCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });

    const first = packages[0];
    // KVKK: tam adres ASLA loglanmaz — sadece ilk 10 karakter maskeli örnek
    req.log.info(
      {
        count: packages.length,
        totalElements,
        sampleLine1Masked: first ? maskLine(first.address.line1) : undefined,
      },
      'trendyol orders fetched'
    );
    return value;
  });

  app.get('/trendyol/orders/:packageId', opts(), async (req, reply) => {
    const { packageId } = req.params as { packageId: string };

    if (mockEnabled()) {
      const found = buildMockPackages().find((p) => p.packageId === packageId);
      if (!found) return reply.code(404).send({ error: 'Sipariş bulunamadı' });
      return found;
    }

    const creds = getCreds();
    if (!creds) return reply.code(503).send({ error: 'Trendyol anahtarları eksik (.env)' });

    const scan = (orders: NormalizedOrder[]): NormalizedOrder | undefined =>
      orders.find((p) => p.packageId === packageId);

    if (singleCache && singleCache.expiresAt > Date.now()) {
      const found = scan(singleCache.value);
      if (found) return found;
    }
    for (const entry of listCache.values()) {
      if (entry.expiresAt > Date.now()) {
        const found = scan(entry.value.packages);
        if (found) return found;
      }
    }

    const orders: NormalizedOrder[] = [];
    for (let page = 0; page < SINGLE_FETCH_MAX_PAGES; page++) {
      const endDate = Date.now();
      const startDate = endDate - SINGLE_FETCH_DAYS * 24 * 60 * 60 * 1000;
      const path = `/integration/order/seller-packages?supplierId=${encodeURIComponent(
        creds.supplierId
      )}&page=${page}&size=${SINGLE_FETCH_SIZE}&startDate=${startDate}&endDate=${endDate}`;
      const res = await trendyolGet(path, creds);
      if (res.kind === 'unauthorized') {
        return reply.code(401).send({ error: 'Trendyol anahtarları geçersiz' });
      }
      if (res.kind === 'rateLimited') {
        return reply.code(502).send({ error: 'Trendyol hız sınırı' });
      }
      if (res.kind !== 'ok') {
        return reply.code(502).send({ error: 'Trendyola ulaşılamadı' });
      }
      const { totalElements, packages } = extractPackages(res.json);
      orders.push(...packages);
      if (packages.length < SINGLE_FETCH_SIZE || orders.length >= totalElements) break;
    }

    singleCache = { expiresAt: Date.now() + CACHE_TTL_MS, value: orders };
    const found = scan(orders);
    if (!found) return reply.code(404).send({ error: 'Sipariş bulunamadı' });

    req.log.info(
      { packageId, line1Masked: maskLine(found.address.line1) },
      'trendyol order detail'
    );
    return found;
  });

  app.post('/trendyol/cache/refresh', opts(), async () => {
    clearTrendyolCache();
    return { ok: true };
  });
}

export { trendyolRoutes };
