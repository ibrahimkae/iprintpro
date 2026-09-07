import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import {
  trendyolRoutes,
  normalizePackage,
  clearTrendyolCache,
} from '../src/routes/trendyol.js';
import type { NormalizedOrder } from '../src/routes/trendyol.js';

const ENV_SNAPSHOT = { ...process.env };
function setEnv(entries: Record<string, string | undefined>): void {
  for (const [k, v] of Object.entries(entries)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}
after(() => {
  process.env = ENV_SNAPSHOT;
});

async function buildApp(logLines?: string[]) {
  const app = Fastify({
    logger:
      logLines === undefined
        ? false
        : {
            stream: {
              write(chunk: string) {
                logLines.push(chunk);
              },
            },
          },
  });
  await app.register(trendyolRoutes);
  await app.ready();
  return app;
}

interface FetchCall {
  url: string;
  init?: RequestInit;
}
type FetchHandler = (url: string, init?: RequestInit) => { status: number; body?: unknown };

let calls: FetchCall[] = [];
let handler: FetchHandler = () => ({ status: 200, body: {} });
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: any, init?: any) => {
  const call: FetchCall = { url: String(url), init };
  calls.push(call);
  const r = handler(call.url, init);
  return new Response(JSON.stringify(r.body ?? {}), {
    status: r.status,
    headers: { 'content-type': 'application/json' },
  });
}) as typeof fetch;
after(() => {
  globalThis.fetch = realFetch;
});

function resetFetch(h: FetchHandler): void {
  calls = [];
  handler = h;
}

// ---- Normalizer fixtures ----

const CONTENT_FIXTURE = {
  id: 700101,
  orderNumber: 'TY-1001',
  status: 'Picking',
  customerFirstName: 'Ayşe',
  customerLastName: 'Yılmaz',
  shipmentAddress: {
    line1: 'Bağdat Cad. No:112 D:5',
    district: 'Kadıköy',
    city: 'İstanbul',
    postalCode: '34710',
    countryCode: 'TR',
    phone: '05321112233',
  },
  items: [
    {
      productName: 'Fotoğraf Mug 330ml',
      merchantSku: 'MUG-330-WHT',
      barcode: '8690123456789',
      quantity: 2,
    },
  ],
  totalPrice: 299.8,
  createdDate: 1787702400000,
};

const DATA_FIXTURE = {
  packageId: 700102,
  orderCode: 'TY-1002',
  packageStatus: 'Shipped',
  fullName: 'Mehmet Demir',
  customerPhone: '05332223344',
  deliveryAddress: {
    address1: 'Atatürk Blv. No:45 K:2',
    district: 'Konak',
    city: 'İzmir',
    country: 'Türkiye',
  },
  items: [
    {
      name: 'Canvas Baskı 30x40',
      sku: 'CNV-3040',
      quantity: '1',
      variant: 'A3 Siyah',
    },
  ],
  price: 189.9,
  createdAt: 1787616000000,
  cargoProviderName: 'Aras Kargo',
  cargoTrackingNumber: 'TRK123456',
};

test('normalizePackage: content-style fixture → full contract shape', () => {
  const out = normalizePackage(CONTENT_FIXTURE);
  assert.ok(out);
  assert.deepEqual(out, {
    orderNumber: 'TY-1001',
    packageId: '700101',
    status: 'Picking',
    customerName: 'Ayşe Yılmaz',
    customerPhone: '05321112233',
    address: {
      line1: 'Bağdat Cad. No:112 D:5',
      district: 'Kadıköy',
      city: 'İstanbul',
      postalCode: '34710',
      country: 'TR',
    },
    items: [{ name: 'Fotoğraf Mug 330ml', sku: 'MUG-330-WHT', barcode: '8690123456789', quantity: 2 }],
    totalPrice: 299.8,
    createdAt: 1787702400000,
  });
});

test('normalizePackage: data-style + fullName/deliveryAddress/name-sku fallbacks', () => {
  const out = normalizePackage(DATA_FIXTURE);
  assert.ok(out);
  assert.equal(out.orderNumber, 'TY-1002');
  assert.equal(out.packageId, '700102');
  assert.equal(out.status, 'Shipped');
  assert.equal(out.customerName, 'Mehmet Demir');
  assert.equal(out.address.line1, 'Atatürk Blv. No:45 K:2');
  assert.equal(out.address.postalCode, undefined);
  assert.equal(out.address.country, 'Türkiye');
  assert.deepEqual(out.items[0], {
    name: 'Canvas Baskı 30x40',
    sku: 'CNV-3040',
    quantity: 1,
    variant: 'A3 Siyah',
  });
  assert.equal(out.totalPrice, 189.9);
  assert.equal(out.createdAt, 1787616000000);
  assert.equal(out.cargoProviderName, 'Aras Kargo');
  assert.equal(out.cargoTrackingNumber, 'TRK123456');
});

test('normalizePackage: variantAttributes joined + unknown fields tolerated', () => {
  const out = normalizePackage({
    id: 1,
    orderNumber: 'X-1',
    status: 'Created',
    totallyUnknownTopLevel: { nested: true },
    items: [
      {
        productName: 'Takvim',
        merchantSku: 'TKV-01',
        variantAttributes: [
          { attributeName: 'Renk', attributeValue: 'Mavi' },
          { attributeName: 'Boyut', attributeValue: 'A4' },
        ],
        mysteryField: 42,
      },
    ],
  });
  assert.ok(out);
  assert.equal((out as unknown as Record<string, unknown>).totallyUnknownTopLevel, undefined);
  assert.deepEqual(out.items[0], {
    name: 'Takvim',
    sku: 'TKV-01',
    quantity: 1,
    variant: 'Mavi / A4',
  });
});

test('normalizePackage: record without id/orderNumber rejected', () => {
  assert.equal(normalizePackage({ orderNumber: 'no-id' }), null);
  assert.equal(normalizePackage({ id: 5 }), null);
  assert.equal(normalizePackage(null as never), null);
});

// ---- Mock mode ----

async function mockApp() {
  clearTrendyolCache();
  setEnv({
    TRENDYOL_MOCK: 'true',
    TRENDYOL_SUPPLIER_ID: undefined,
    TRENDYOL_API_KEY: undefined,
    TRENDYOL_API_SECRET: undefined,
  });
  return buildApp();
}

const CONTRACT_ORDER_KEYS = [
  'orderNumber',
  'packageId',
  'status',
  'customerName',
  'address',
  'items',
  'totalPrice',
  'createdAt',
].sort();
const OPTIONAL_ORDER_KEYS = ['customerPhone', 'cargoProviderName', 'cargoTrackingNumber'].sort();
const ADDRESS_KEYS = ['line1', 'district', 'city', 'country'].sort();
const OPTIONAL_ADDRESS_KEYS = ['postalCode'];

test('mock mode: GET /trendyol/orders returns 12 packages matching contract shape', async () => {
  const app = await mockApp();
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(res.statusCode, 200);
  const body = res.json() as {
    totalElements: number;
    page: number;
    packages: NormalizedOrder[];
  };
  assert.equal(body.totalElements, 12);
  assert.equal(body.page, 0);
  assert.equal(body.packages.length, 12);
  for (const p of body.packages) {
    const extra = Object.keys(p)
      .filter((k) => !CONTRACT_ORDER_KEYS.includes(k))
      .sort();
    assert.ok(
      extra.every((k) => OPTIONAL_ORDER_KEYS.includes(k)),
      `unexpected keys: ${extra.join(',')}`
    );
    assert.ok(CONTRACT_ORDER_KEYS.every((k) => k in p));
    assert.ok(p.status === 'Created' || p.status === 'Picking' || p.status === 'Invoiced' || p.status === 'Shipped');
    assert.deepEqual(
      Object.keys(p.address)
        .filter((k) => (p.address[k as keyof typeof p.address]) !== undefined)
        .sort(),
      [...ADDRESS_KEYS, ...OPTIONAL_ADDRESS_KEYS.filter((k) => k in p.address)].sort()
    );
    assert.ok(p.items.length > 0);
    for (const it of p.items) {
      assert.equal(typeof it.name, 'string');
      assert.equal(typeof it.sku, 'string');
      assert.equal(typeof it.quantity, 'number');
      assert.ok(it.barcode === undefined || /^869\d{10}$/.test(it.barcode));
    }
    assert.equal(typeof p.createdAt, 'number');
  }
  // Deterministik: ikinci çağrı aynı sonucu verir
  const again = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.deepEqual(again.json(), body);
  await app.close();
});

test('mock mode: status filter narrows to Created only', async () => {
  const app = await mockApp();
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders?status=Created' });
  const body = res.json() as { totalElements: number; packages: NormalizedOrder[] };
  assert.equal(res.statusCode, 200);
  assert.equal(body.totalElements, 3);
  assert.ok(body.packages.every((p) => p.status === 'Created'));
  await app.close();
});

test('mock mode: single order by packageId + 404 for unknown', async () => {
  const app = await mockApp();
  const ok = await app.inject({ method: 'GET', url: '/trendyol/orders/700003' });
  assert.equal(ok.statusCode, 200);
  const pkg = ok.json() as NormalizedOrder;
  assert.equal(pkg.packageId, '700003');
  const extra = Object.keys(pkg)
    .filter((k) => !CONTRACT_ORDER_KEYS.includes(k))
    .sort();
  assert.ok(
    extra.every((k) => OPTIONAL_ORDER_KEYS.includes(k)),
    `unexpected keys: ${extra.join(',')}`
  );
  assert.ok(CONTRACT_ORDER_KEYS.every((k) => k in pkg));

  const missing = await app.inject({ method: 'GET', url: '/trendyol/orders/999999' });
  assert.equal(missing.statusCode, 404);
  assert.equal((missing.json() as { error: string }).error, 'Sipariş bulunamadı');
  await app.close();
});

test('signature-free: no auth header required on orders endpoints', async () => {
  const app = await mockApp();
  const list = await app.inject({ method: 'GET', url: '/trendyol/orders?size=50&page=0&days=7' });
  assert.equal(list.statusCode, 200);
  const single = await app.inject({ method: 'GET', url: '/trendyol/orders/700001' });
  assert.equal(single.statusCode, 200);
  await app.close();
});

// ---- Real mode (injected fetch) ----

async function realApp(env: Record<string, string | undefined> = {}) {
  clearTrendyolCache();
  setEnv({
    TRENDYOL_MOCK: 'false',
    TRENDYOL_SUPPLIER_ID: 'SUP-42',
    TRENDYOL_API_KEY: 'mykey',
    TRENDYOL_API_SECRET: 'mysecret',
    ...env,
  });
  return buildApp();
}

test('real mode: missing creds → 503 with exact message', async () => {
  const app = await realApp({
    TRENDYOL_SUPPLIER_ID: undefined,
    TRENDYOL_API_KEY: undefined,
    TRENDYOL_API_SECRET: undefined,
  });
  resetFetch(() => ({ status: 200 }));
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.json(), { error: 'Trendyol anahtarları eksik (.env)' });
  assert.equal(calls.length, 0);
  await app.close();
});

test('real mode: upstream called with supplierId/status/page/size + Basic auth', async () => {
  const app = await realApp();
  resetFetch(() => ({
    status: 200,
    body: { totalElements: 1, content: [CONTENT_FIXTURE] },
  }));
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders?status=Picking&page=2&size=25' });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 1);
  const url = new URL(calls[0].url);
  assert.equal(url.origin + url.pathname, 'https://apigw.trendyol.com/integration/order/seller-packages');
  assert.equal(url.searchParams.get('supplierId'), 'SUP-42');
  assert.equal(url.searchParams.get('status'), 'Picking');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('size'), '25');
  const auth = (calls[0].init?.headers as Record<string, string>)['Authorization'];
  assert.match(auth, /^Basic /);
  assert.equal(Buffer.from(auth.slice(6), 'base64').toString(), 'mykey:mysecret');
  const body = res.json() as { totalElements: number; page: number; packages: NormalizedOrder[] };
  assert.equal(body.totalElements, 1);
  assert.equal(body.page, 2);
  assert.equal(body.packages[0]?.packageId, '700101');
  await app.close();
});

test('real mode: days param → epoch-ms startDate/endDate window in URL', async () => {
  const app = await realApp();
  resetFetch(() => ({ status: 200, body: { totalElements: 0, content: [] } }));
  await app.inject({ method: 'GET', url: '/trendyol/orders?days=3' });
  let url = new URL(calls[calls.length - 1].url);
  let start = Number(url.searchParams.get('startDate'));
  let end = Number(url.searchParams.get('endDate'));
  assert.ok(Number.isFinite(start) && Number.isFinite(end));
  assert.ok(Math.abs(end - start - 3 * 24 * 60 * 60 * 1000) < 5000);

  await app.inject({ method: 'GET', url: '/trendyol/orders?days=7' });
  url = new URL(calls[calls.length - 1].url);
  start = Number(url.searchParams.get('startDate'));
  end = Number(url.searchParams.get('endDate'));
  assert.ok(Math.abs(end - start - 7 * 24 * 60 * 60 * 1000) < 5000);
  await app.close();
});

test('cache: identical repeat avoids second upstream call; different key refetches', async () => {
  const app = await realApp();
  resetFetch(() => ({ status: 200, body: { totalElements: 0, content: [] } }));

  await app.inject({ method: 'GET', url: '/trendyol/orders?page=0&size=50&days=7' });
  await app.inject({ method: 'GET', url: '/trendyol/orders?page=0&size=50&days=7' });
  assert.equal(calls.length, 1);

  await app.inject({ method: 'GET', url: '/trendyol/orders?page=0&size=50&days=14' });
  assert.equal(calls.length, 2);
  await app.close();
});

test('cache refresh endpoint forces a fresh upstream call', async () => {
  const app = await realApp();
  resetFetch(() => ({ status: 200, body: { totalElements: 0, content: [] } }));

  await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(calls.length, 1);
  const refreshed = await app.inject({ method: 'POST', url: '/trendyol/cache/refresh' });
  assert.equal(refreshed.statusCode, 200);
  assert.deepEqual(refreshed.json(), { ok: true });

  await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(calls.length, 2);
  await app.close();
});

test('real mode: 401 → exact error message', async () => {
  const app = await realApp();
  resetFetch(() => ({ status: 401, body: {} }));
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.json(), { error: 'Trendyol anahtarları geçersiz' });
  await app.close();
});

test('real mode: 429 once then 200 → retried exactly once, succeeds', async () => {
  const app = await realApp();
  let n = 0;
  resetFetch(() => {
    n++;
    return n === 1 ? { status: 429 } : { status: 200, body: { totalElements: 0, content: [] } };
  });
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 2);
  await app.close();
});

test('real mode: persistent 429 → 502 Trendyol hız sınırı after single retry', async () => {
  const app = await realApp();
  resetFetch(() => ({ status: 429 }));
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.json(), { error: 'Trendyol hız sınırı' });
  assert.equal(calls.length, 2); // retry-once, sonra vazgeç
  await app.close();
});

test('single order: found via cache-or-fetch across pages (data[] array)', async () => {
  const app = await realApp();
  resetFetch((url) => {
    const page = Number(new URL(url).searchParams.get('page'));
    if (page === 0) {
      return {
        status: 200,
        body: {
          totalElements: 250,
          data: Array.from({ length: 200 }, (_, i) => ({
            id: 800001 + i,
            orderNumber: `BULK-${i}`,
            status: 'Created',
            fullName: `Kişi ${i}`,
            items: [],
          })),
        },
      };
    }
    return {
      status: 200,
      body: {
        totalElements: 250,
        data: [{ ...DATA_FIXTURE, packageId: 900777 }],
      },
    };
  });
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders/900777' });
  assert.equal(res.statusCode, 200);
  const pkg = res.json() as NormalizedOrder;
  assert.equal(pkg.orderNumber, 'TY-1002');
  assert.equal(calls.length, 2); // sayfa 0 dolu → sayfa 1'de bulundu
  await app.close();
});

test('logs mask full addresses to first 10 chars of line1', async () => {
  const lines: string[] = [];
  clearTrendyolCache();
  setEnv({
    TRENDYOL_MOCK: 'false',
    TRENDYOL_SUPPLIER_ID: 'SUP-42',
    TRENDYOL_API_KEY: 'mykey',
    TRENDYOL_API_SECRET: 'mysecret',
  });
  const app = await buildApp(lines);
  resetFetch(() => ({ status: 200, body: { totalElements: 1, content: [CONTENT_FIXTURE] } }));
  const res = await app.inject({ method: 'GET', url: '/trendyol/orders' });
  assert.equal(res.statusCode, 200);
  assert.ok(lines.length > 0);
  const all = lines.join('\n');
  assert.ok(all.includes('Bağdat Cad')); // ilk 10 karakter görünür
  assert.ok(!all.includes('No:112')); // gerisi maskeli — tam adres ASLA loglanmaz
  await app.close();
});
