import { describe, it, expect } from 'vitest';
import {
  buildShippingBlocks, buildPackingBlocks
} from '../../views/OrdersView';
import { ORDER_STATUS_TR, type NormalizedOrder } from '../trendyol-types';

function mkOrder(overrides: Partial<NormalizedOrder> = {}): NormalizedOrder {
  return {
    orderNumber: 'TY-778812',
    packageId: 'PKG-99123',
    status: 'Created',
    customerName: 'Ayşe Yılmaz',
    customerPhone: '+90 555 111 2233',
    address: {
      line1: 'Bağdat Cd. No:112 D:4',
      district: 'Kadıköy',
      city: 'İstanbul',
      postalCode: '34710',
      country: 'Türkiye'
    },
    items: [
      { name: 'Kablosuz Kulaklık', sku: 'SKU-1', barcode: '8690000000015', quantity: 2 },
      { name: 'Telefon Kılıfı', sku: 'SKU-2', quantity: 1, variant: 'Siyah' }
    ],
    totalPrice: 1290.5,
    cargoProviderName: 'Yurtiçi Kargo',
    cargoTrackingNumber: 'TR-559988',
    createdAt: new Date('2026-08-20T14:30:00+03:00').getTime(),
    ...overrides
  };
}

describe('buildShippingBlocks', () => {
  it('contains a CODE128 barcode block with the packageId as value', () => {
    const blocks = buildShippingBlocks(mkOrder());
    const barcode = blocks.find(b => b.kind === 'barcode');
    expect(barcode).toBeDefined();
    expect(barcode?.value).toBe('PKG-99123');
    expect(barcode?.symbology).toBe('CODE128');
  });

  it('includes recipient name, phone and street address as their own lines', () => {
    const texts = buildShippingBlocks(mkOrder()).map(b => b.value);
    expect(texts).toContain('KARGO ETİKETİ');
    expect(texts).toContain('Ayşe Yılmaz');
    expect(texts).toContain('+90 555 111 2233');
    expect(texts).toContain('Bağdat Cd. No:112 D:4');
  });

  it('emits district/city combined line plus postal+country line', () => {
    const texts = buildShippingBlocks(mkOrder()).map(b => b.value);
    expect(texts).toContain('Kadıköy / İstanbul');
    expect(texts).toContain('34710 Türkiye');
  });

  it('summarizes items count and total price on one line', () => {
    const texts = buildShippingBlocks(mkOrder()).map(b => b.value);
    const summary = texts.find(t => t.includes('ürün •'));
    expect(summary).toBeDefined();
    expect(summary).toContain('2 ürün');
    expect(summary).toContain('₺');
  });

  it('appends cargo provider + tracking only when present, always with date footer', () => {
    const withCargo = buildShippingBlocks(mkOrder()).map(b => b.value);
    expect(withCargo).toContain('Yurtiçi Kargo · TR-559988');

    const bare = mkOrder({ cargoProviderName: undefined, cargoTrackingNumber: undefined });
    const withoutCargo = buildShippingBlocks(bare).map(b => b.value);
    expect(withoutCargo.some(t => t.includes('Yurtiçi'))).toBe(false);
    expect(withoutCargo.some(t => t.includes('2026'))).toBe(true);
  });

  it('handles empty items edge case without throwing (0 ürün)', () => {
    const blocks = buildShippingBlocks(mkOrder({ items: [] }));
    expect(blocks.map(b => b.value)).toContain('0 ürün • 1.290,50 ₺');
  });
});

describe('buildPackingBlocks', () => {
  it('has packing-slip title, qr block valued with orderNumber, and order line', () => {
    const blocks = buildPackingBlocks(mkOrder());
    expect(blocks[0]).toEqual({ kind: 'text', value: 'PAKET İÇİ SİPARİŞ FİŞİ' });
    const qr = blocks.find(b => b.kind === 'qr');
    expect(qr).toBeDefined();
    expect(qr?.value).toBe('TY-778812');
    expect(blocks.map(b => b.value)).toContain('Sipariş: TY-778812');
  });

  it('renders one "qty x name" line per item including variant in parentheses', () => {
    const texts = buildPackingBlocks(mkOrder()).map(b => b.value);
    expect(texts).toContain('2x Kablosuz Kulaklık');
    expect(texts).toContain('1x Telefon Kılıfı (Siyah)');
  });

  it('ends with a thank-you line even for empty item list', () => {
    const blocks = buildPackingBlocks(mkOrder({ items: [] }));
    const values = blocks.map(b => b.value);
    expect(values.filter(v => /x /.test(v))).toHaveLength(0);
    expect(values[values.length - 1]).toContain('teşekkürler');
  });
});

describe('ORDER_STATUS_TR', () => {
  it('maps all six statuses to Turkish labels', () => {
    expect(Object.keys(ORDER_STATUS_TR).sort()).toEqual(
      ['Cancelled', 'Created', 'Delivered', 'Invoiced', 'Picking', 'Shipped'].sort()
    );
    expect(ORDER_STATUS_TR.Created).toBe('Yeni');
    expect(ORDER_STATUS_TR.Picking).toBe('Hazırlanıyor');
    expect(ORDER_STATUS_TR.Invoiced).toBe('Faturalandı');
    expect(ORDER_STATUS_TR.Shipped).toBe('Kargolandı');
    expect(ORDER_STATUS_TR.Delivered).toBe('Teslim');
    expect(ORDER_STATUS_TR.Cancelled).toBe('İptal');
  });
});
