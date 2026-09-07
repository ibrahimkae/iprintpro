/**
 * Trendyol normalize sipariş şeması (SPEC-03 §2.2).
 * Sunucu /api/trendyol/* yanıtları bu tipe normalize edilir; istemci ham JSON görmez.
 */

export interface NormalizedOrder {
  orderNumber: string;
  packageId: string;
  status: string; // Created|Picking|Invoiced|Shipped...
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
  totalPrice: number; // TRY
  cargoProviderName?: string;
  cargoTrackingNumber?: string;
  createdAt: number; // epoch ms
}

export const ORDER_STATUS_TR: Record<string, string> = {
  Created: 'Yeni',
  Picking: 'Hazırlanıyor',
  Invoiced: 'Faturalandı',
  Shipped: 'Kargolandı',
  Delivered: 'Teslim',
  Cancelled: 'İptal'
};
