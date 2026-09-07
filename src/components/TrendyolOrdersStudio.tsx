import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/select';
import { formatMoney, type ResolvedBlock } from '../lib/template-variables';
import { ORDER_STATUS_TR, type NormalizedOrder } from '../lib/trendyol-types';
import {
  Printer, RefreshCw, Loader2, AlertTriangle,
  CheckCircle2, Package, FileText, Sparkles, Key, HelpCircle, Eye, EyeOff, X, Star, Check, Search, Wrench, ArrowLeft,
  LayoutGrid, Settings, ShieldCheck, Layers, Globe, Sliders,
  Plus, Trash2, ChevronDown, ChevronUp, Store, Truck
} from 'lucide-react';
import { ThermalTemplateRenderer } from '../template-archive/components/ThermalTemplateRenderer';
import { INITIAL_TEMPLATES } from '../template-archive/data/templates';
import { ThermalTemplate } from '../template-archive/types';
import { captureElementToDataUrl } from '../utils/dom-capture';
import { AssemblyManualStudio } from './AssemblyManualStudio';
import { AssemblyManualData } from '../lib/assembly-presets';

export interface TrendyolOrdersStudioProps {
  apiBase: string;
  pageWidth: number;
  onPrintShippingLabel: (blocks: ResolvedBlock[], label: string) => Promise<void>;
  onPrintPackingSlip: (blocks: ResolvedBlock[], label: string) => Promise<void>;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => Promise<void>;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

const PAGE_SIZE = 50;
const PRINTED_KEY = 'iprint_printed_packages_v1';
const DEFAULT_SHIPPING_TEMPLATE_KEY = 'iprint_default_shipping_template_id';
const DEFAULT_FALLBACK_TEMPLATE = 'tpl-trendyol-mini-slip-57mm';
const PRINT_CONFIRM_MSG = 'Bu paket için etiket basılmış. Yine de basılsın mı?';

export interface MarketplaceProfile {
  id: string;
  name: string;
  marketplace: 'trendyol' | 'hepsiburada' | 'custom';
  supplierId: string;
  apiKey: string;
  apiSecret: string;
  customEndpoint?: string;
}

export interface MarketplaceSettings {
  activeProfileId: string;
  profiles: MarketplaceProfile[];
  isLiveMode: boolean;
}

export interface MarketplaceCredentials {
  marketplace: 'trendyol' | 'hepsiburada';
  supplierId: string;
  apiKey: string;
  apiSecret: string;
  customEndpoint?: string;
  isLiveMode: boolean;
}

export const SETTINGS_KEY_V2 = 'iprint_marketplace_settings_v2';
export const CREDENTIALS_KEY = 'iprint_marketplace_credentials_v1';

export function loadMarketplaceSettings(): MarketplaceSettings {
  try {
    const rawV2 = localStorage.getItem(SETTINGS_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2);
      if (Array.isArray(parsed.profiles) && parsed.profiles.length > 0) {
        return {
          activeProfileId: parsed.activeProfileId || parsed.profiles[0].id,
          profiles: parsed.profiles,
          isLiveMode: typeof parsed.isLiveMode === 'boolean' ? parsed.isLiveMode : false
        };
      }
    }

    // Geriye dönük uyumluluk: v1 verisi varsa aktar
    const rawV1 = localStorage.getItem(CREDENTIALS_KEY);
    if (rawV1) {
      const old = JSON.parse(rawV1);
      const initialProfile: MarketplaceProfile = {
        id: 'prof_default',
        name: 'Trendyol Ana Mağaza',
        marketplace: old.marketplace || 'trendyol',
        supplierId: old.supplierId || '',
        apiKey: old.apiKey || '',
        apiSecret: old.apiSecret || '',
        customEndpoint: old.customEndpoint || ''
      };
      return {
        activeProfileId: 'prof_default',
        profiles: [initialProfile],
        isLiveMode: typeof old.isLiveMode === 'boolean' ? old.isLiveMode : false
      };
    }
  } catch {
    // fallback
  }

  const defaultProfile: MarketplaceProfile = {
    id: 'prof_default',
    name: 'Trendyol Ana Mağaza',
    marketplace: 'trendyol',
    supplierId: '',
    apiKey: '',
    apiSecret: '',
    customEndpoint: ''
  };
  return {
    activeProfileId: 'prof_default',
    profiles: [defaultProfile],
    isLiveMode: false
  };
}

export function saveMarketplaceSettings(settings: MarketplaceSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY_V2, JSON.stringify(settings));
  } catch {
    // safe
  }
}

export function loadMarketplaceCredentials(): MarketplaceCredentials {
  const s = loadMarketplaceSettings();
  const prof = s.profiles.find(p => p.id === s.activeProfileId) || s.profiles[0];
  return {
    marketplace: (prof.marketplace === 'hepsiburada' ? 'hepsiburada' : 'trendyol'),
    supplierId: prof.supplierId,
    apiKey: prof.apiKey,
    apiSecret: prof.apiSecret,
    customEndpoint: prof.customEndpoint,
    isLiveMode: s.isLiveMode
  };
}

export function saveMarketplaceCredentials(creds: MarketplaceCredentials): void {
  const s = loadMarketplaceSettings();
  const index = s.profiles.findIndex(p => p.id === s.activeProfileId);
  if (index >= 0) {
    s.profiles[index] = {
      ...s.profiles[index],
      marketplace: creds.marketplace,
      supplierId: creds.supplierId,
      apiKey: creds.apiKey,
      apiSecret: creds.apiSecret,
      customEndpoint: creds.customEndpoint
    };
  }
  s.isLiveMode = creds.isLiveMode;
  saveMarketplaceSettings(s);
}

export function parseRawTrendyolOrders(data: any): NormalizedOrder[] {
  let contentList: any[] = [];
  if (Array.isArray(data)) {
    contentList = data;
  } else if (Array.isArray(data?.content)) {
    contentList = data.content;
  } else if (Array.isArray(data?.orders)) {
    contentList = data.orders;
  } else if (Array.isArray(data?.items)) {
    contentList = data.items;
  } else {
    return [];
  }

  return contentList.map((raw, idx) => {
    if (raw.orderNumber && raw.packageId && raw.address && Array.isArray(raw.items)) {
      return raw as NormalizedOrder;
    }

    const addr = raw.shipmentAddress || raw.invoiceAddress || raw.address || {};
    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ') || 
                     [raw.customerFirstName, raw.customerLastName].filter(Boolean).join(' ') || 
                     raw.customerName || 'Müşteri';
    const lines = raw.lines || raw.items || [];
    const items = lines.map((l: any) => ({
      name: l.productName || l.name || 'Ürün',
      sku: l.merchantSku || l.sku || '',
      barcode: l.barcode ? String(l.barcode) : undefined,
      quantity: Number(l.quantity) || 1,
      variant: [l.color, l.size].filter(Boolean).join(' - ') || l.variant || undefined
    }));

    return {
      orderNumber: String(raw.orderNumber || raw.orderId || raw.id || `TY-${Date.now()}-${idx}`),
      packageId: String(raw.id || raw.packageId || raw.cargoTrackingNumber || raw.orderNumber || `PKG-${idx}`),
      status: raw.status || 'Created',
      customerName: fullName,
      customerPhone: addr.phone || raw.customerPhone || '',
      address: {
        line1: addr.fullAddress || addr.address1 || addr.address || addr.line1 || 'Adres belirtilmedi',
        district: addr.district || '',
        city: addr.city || '',
        postalCode: addr.postalCode ? String(addr.postalCode) : '',
        country: addr.countryCode || addr.country || 'Türkiye'
      },
      items: items.length > 0 ? items : [{ name: 'Sipariş Ürünü', sku: 'TY-01', quantity: 1 }],
      totalPrice: Number(raw.totalPrice ?? raw.grossAmount ?? 0),
      cargoProviderName: raw.cargoProviderName || 'Trendyol Express',
      cargoTrackingNumber: raw.cargoTrackingNumber ? String(raw.cargoTrackingNumber) : '',
      createdAt: raw.orderDate || raw.createdAt || Date.now()
    };
  });
}

type StatusFilter = '' | 'Created' | 'Picking' | 'Invoiced' | 'Shipped';

const STATUS_FILTERS: { value: StatusFilter; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: '', label: 'Tümü', icon: LayoutGrid },
  { value: 'Created', label: 'Yeni', icon: Sparkles },
  { value: 'Picking', label: 'Hazırlanıyor', icon: Package },
  { value: 'Invoiced', label: 'Faturalandırıldı', icon: CheckCircle2 }
];

const STATUS_BADGE: Record<string, string> = {
  Created: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300',
  Picking: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300',
  Invoiced: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300',
  Shipped: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300',
  Delivered: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300',
  Cancelled: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400'
};

export function packageKey(o: NormalizedOrder): string {
  return `${o.orderNumber}:${o.packageId}`;
}

function loadPrintedPackages(): Set<string> {
  try {
    const raw = localStorage.getItem(PRINTED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function savePrintedPackages(set: Set<string>): void {
  try {
    localStorage.setItem(PRINTED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // quota safe
  }
}

function formatDateTr(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return String(ms);
  return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

export function mapOrderToTemplateData(o: NormalizedOrder, template: ThermalTemplate): Record<string, any> {
  const data: Record<string, any> = { ...template.defaultData };
  const itemsText = o.items.map(i => `${i.quantity}x ${i.name}${i.variant ? ` (${i.variant})` : ''}`).join(', ');
  const totalQty = o.items.reduce((s, i) => s + i.quantity, 0);

  data.orderNumber = o.orderNumber;
  data.orderNo = o.orderNumber;
  data.order_id = o.orderNumber;
  data.recipientName = o.customerName;
  data.customerName = o.customerName;
  data.buyerName = o.customerName;
  data.customerPhone = o.customerPhone;
  data.recipientPhone = o.customerPhone;
  data.recipientAddress = o.address.line1;
  data.addressLine = o.address.line1;
  data.address = o.address.line1;
  data.recipientDistrictCity = `${o.address.district || ''} / ${o.address.city || ''}`.trim().replace(/^\/|\/$/g, '');
  data.destination = `${o.address.district || ''} / ${o.address.city || ''}`.toUpperCase().trim().replace(/^\/|\/$/g, '');
  data.barcodeVal = o.cargoTrackingNumber || o.packageId;
  data.barcode = o.cargoTrackingNumber || o.packageId;
  data.packageBarcode = o.cargoTrackingNumber || o.packageId;
  data.trackingBarcode = o.cargoTrackingNumber || o.packageId;
  data.cargoProvider = o.cargoProviderName || 'Trendyol Express';
  data.cargoName = o.cargoProviderName || 'Trendyol Express';
  data.carrier = o.cargoProviderName || 'Trendyol Express';
  data.productName = itemsText;
  data.itemSummary = itemsText;
  data.productQty = `${totalQty} Adet`;
  data.packageItemCount = `${totalQty}`;
  data.pieceInfo = `Koli 1 / 1 (Desi: 1.0)`;
  data.hubCode = `HUB: ${o.address.city ? o.address.city.toUpperCase().slice(0, 3) : 'IST'}-${o.cargoProviderName ? o.cargoProviderName.toUpperCase().slice(0, 3) : 'TEX'}-01`;
  data.originBranch = 'Merkez Çıkış Şubesi';
  data.totalPrice = formatMoney(o.totalPrice);
  data.date = formatDateTr(o.createdAt);
  data.marketplaceWarning = 'Kargo şirketinin dikkatine, bu bir pazaryeri anlaşmalı gönderisidir. İlgili anlaşma koduna göre işleme alınız.';

  if (o.items[0]) {
    data.productSku = o.items[0].sku || 'SKU-01';
    data.productBarcode = o.items[0].barcode || o.packageId;
    if (o.items[0].variant) {
      data.productColor = o.items[0].variant;
    }
  }
  return data;
}

export const MOCK_TRENDYOL_ORDERS: NormalizedOrder[] = [
  {
    orderNumber: 'TY-94827104',
    packageId: '734001928472',
    status: 'Created',
    customerName: 'Ahmet Yılmaz',
    customerPhone: '0532 *** ** 12',
    address: {
      line1: 'Atatürk Mah. Karanfil Sok. No: 14 D: 3',
      district: 'Kadıköy',
      city: 'İstanbul',
      postalCode: '34710',
      country: 'Türkiye'
    },
    items: [
      { name: 'Kablosuz Termal Yazıcı Etiketi 50x30mm', sku: 'TY-ETK-5030', barcode: '8680001928401', quantity: 2, variant: '500 Etiket/Rulo' },
      { name: 'Termal Rulo Kağıdı 57mm x 10m', sku: 'TY-RLO-57', barcode: '8680001928402', quantity: 5 }
    ],
    totalPrice: 429.90,
    cargoProviderName: 'Trendyol Express',
    cargoTrackingNumber: 'TEX-9988231',
    createdAt: Date.now() - 3600000 * 2
  },
  {
    orderNumber: 'TY-94826811',
    packageId: '734001928109',
    status: 'Picking',
    customerName: 'Ayşe Kaya',
    customerPhone: '0544 *** ** 88',
    address: {
      line1: 'Gazi Evrenos Cad. Paşa Apt. No: 8',
      district: 'Çankaya',
      city: 'Ankara',
      postalCode: '06680',
      country: 'Türkiye'
    },
    items: [
      { name: 'Ergonomik Bluetooth Mini Barkod Okuyucu', sku: 'TY-BRK-SCAN', barcode: '8680001928515', quantity: 1, variant: 'Siyah' }
    ],
    totalPrice: 899.00,
    cargoProviderName: 'Aras Kargo',
    cargoTrackingNumber: 'ARS-3321445',
    createdAt: Date.now() - 3600000 * 5
  },
  {
    orderNumber: 'TY-94825900',
    packageId: '734001927901',
    status: 'Invoiced',
    customerName: 'Mehmet Demir',
    customerPhone: '0505 *** ** 44',
    address: {
      line1: 'Karşıyaka Çarşı İçi No: 42',
      district: 'Karşıyaka',
      city: 'İzmir',
      postalCode: '35600',
      country: 'Türkiye'
    },
    items: [
      { name: 'Şeffaf Paketleme Bandı 45mmx100m', sku: 'TY-BND-45', barcode: '8680001928620', quantity: 6 },
      { name: 'A6 Kargo Poşeti Cepli 100 Adet', sku: 'TY-PST-A6', barcode: '8680001928621', quantity: 1 }
    ],
    totalPrice: 349.50,
    cargoProviderName: 'Yurtiçi Kargo',
    cargoTrackingNumber: 'YRT-7711902',
    createdAt: Date.now() - 3600000 * 18
  },
  {
    orderNumber: 'TY-94824510',
    packageId: '734001926880',
    status: 'Shipped',
    customerName: 'Zeynep Çelik',
    customerPhone: '0533 *** ** 77',
    address: {
      line1: 'Bahçelievler Mah. 7. Cadde No: 19',
      district: 'Çankaya',
      city: 'Ankara',
      postalCode: '06490',
      country: 'Türkiye'
    },
    items: [
      { name: 'Termal Barkod Etiketi 40x20mm (1000li)', sku: 'TY-ETK-4020', barcode: '8680001928733', quantity: 3 }
    ],
    totalPrice: 285.00,
    cargoProviderName: 'Trendyol Express',
    cargoTrackingNumber: 'TEX-8822910',
    createdAt: Date.now() - 3600000 * 28
  },
  {
    orderNumber: 'TY-94823102',
    packageId: '734001925410',
    status: 'Shipped',
    customerName: 'Caner Şahin',
    customerPhone: '0542 *** ** 19',
    address: {
      line1: 'Muratpaşa Mah. Lara Cad. No: 102',
      district: 'Muratpaşa',
      city: 'Antalya',
      postalCode: '07100',
      country: 'Türkiye'
    },
    items: [
      { name: 'Masaüstü Termal Etiket Tutucu Rulo Standı', sku: 'TY-STD-01', barcode: '8680001928990', quantity: 1 }
    ],
    totalPrice: 199.90,
    cargoProviderName: 'Yurtiçi Kargo',
    cargoTrackingNumber: 'YRT-4499102',
    createdAt: Date.now() - 3600000 * 42
  }
];

export function buildShippingBlocks(o: NormalizedOrder): ResolvedBlock[] {
  const blocks: ResolvedBlock[] = [
    { kind: 'text', value: 'KARGO ETİKETİ' },
    { kind: 'barcode', value: o.packageId, symbology: 'CODE128' }
  ];

  if (o.customerName.trim()) blocks.push({ kind: 'text', value: o.customerName });
  if (o.customerPhone?.trim()) blocks.push({ kind: 'text', value: o.customerPhone });
  if (o.address.line1.trim()) blocks.push({ kind: 'text', value: o.address.line1 });

  const districtCity = [o.address.district, o.address.city]
    .map(s => s.trim())
    .filter(Boolean)
    .join(' / ');
  if (districtCity) blocks.push({ kind: 'text', value: districtCity });

  const postalCountry = [o.address.postalCode, o.address.country]
    .map(s => s?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
  if (postalCountry) blocks.push({ kind: 'text', value: postalCountry });

  blocks.push({
    kind: 'text',
    value: `${o.items.length} ürün • ${formatMoney(o.totalPrice)}`
  });

  const cargoLine = [o.cargoProviderName, o.cargoTrackingNumber]
    .map(s => s?.trim() ?? '')
    .filter(Boolean)
    .join(' · ');
  if (cargoLine) blocks.push({ kind: 'text', value: cargoLine });

  blocks.push({ kind: 'text', value: formatDateTr(o.createdAt) });
  return blocks;
}

export function buildPackingBlocks(o: NormalizedOrder): ResolvedBlock[] {
  const blocks: ResolvedBlock[] = [
    { kind: 'text', value: 'PAKET İÇİ SİPARİŞ FİŞİ' },
    { kind: 'qr', value: o.orderNumber },
    { kind: 'text', value: `Sipariş: ${o.orderNumber}` }
  ];

  for (const item of o.items) {
    blocks.push({
      kind: 'text',
      value: `${item.quantity}x ${item.name}${item.variant ? ` (${item.variant})` : ''}`
    });
  }

  blocks.push({ kind: 'text', value: 'Bizi tercih ettiğiniz için teşekkürler!' });
  return blocks;
}

export function TrendyolOrdersStudio(props: TrendyolOrdersStudioProps) {
  const [activeStudioTab, setActiveStudioTab] = useState<'orders' | 'shipped' | 'assembly'>('orders');
  const [assemblyInitialData, setAssemblyInitialData] = useState<Partial<AssemblyManualData> | undefined>(undefined);

  const [orders, setOrders] = useState<NormalizedOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [days, setDays] = useState<'1' | '7' | '30'>('7');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printed, setPrinted] = useState<Set<string>>(() => loadPrintedPackages());
  const [printing, setPrinting] = useState(false);

  // Filter state
  const [cargoFilter, setCargoFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Batch Print engine state
  const [batchDelayMs, setBatchDelayMs] = useState<number>(400);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; orderNumber: string } | null>(null);
  const [batchPrintOrder, setBatchPrintOrder] = useState<NormalizedOrder | null>(null);
  const [batchCancelRequested, setBatchCancelRequested] = useState<boolean>(false);
  const batchHiddenRef = useRef<HTMLDivElement>(null);
  const batchCancelRef = useRef<boolean>(false);

  // Template management
  const shippingTemplates = useMemo(() => {
    return INITIAL_TEMPLATES.filter(
      (t) => t.category === 'ecommerce_shipping' || t.category === 'shipping' || t.tags.includes('kargo') || t.tags.includes('trendyol')
    );
  }, []);

  const [defaultTemplateId, setDefaultTemplateId] = useState<string>(() => {
    return localStorage.getItem(DEFAULT_SHIPPING_TEMPLATE_KEY) || DEFAULT_FALLBACK_TEMPLATE;
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return localStorage.getItem(DEFAULT_SHIPPING_TEMPLATE_KEY) || DEFAULT_FALLBACK_TEMPLATE;
  });

  const [previewOrder, setPreviewOrder] = useState<NormalizedOrder | null>(null);
  const [isPrintingSingle, setIsPrintingSingle] = useState(false);
  const [savedDefaultNotice, setSavedDefaultNotice] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeTemplate = useMemo(() => {
    return shippingTemplates.find(t => t.id === selectedTemplateId) || shippingTemplates[0] || INITIAL_TEMPLATES[0];
  }, [shippingTemplates, selectedTemplateId]);

  const handleSetDefaultTemplate = (tplId: string) => {
    localStorage.setItem(DEFAULT_SHIPPING_TEMPLATE_KEY, tplId);
    setDefaultTemplateId(tplId);
    setSavedDefaultNotice(true);
    setTimeout(() => setSavedDefaultNotice(false), 2500);
  };

  const handleOpenPreviewModal = (order: NormalizedOrder) => {
    setSelectedTemplateId(defaultTemplateId);
    setPreviewOrder(order);
  };

  const handleCreateAssemblyManualForOrder = (order: NormalizedOrder) => {
    const firstItem = order.items?.[0];
    const productName = firstItem?.name || 'ÜRÜN KURULUM KILAVUZU';
    const sku = firstItem?.sku ? `Kod: ${firstItem.sku}` : '';
    setAssemblyInitialData({
      title: `${productName.toUpperCase()} KURULUM KILAVUZU`,
      subTitle: sku ? `${sku} • Sipariş No: ${order.orderNumber}` : `Sipariş No: ${order.orderNumber}`,
      logoText: 'TRENDYOL SATICI MAĞAZASI'
    });
    setActiveStudioTab('assembly');
  };

  const handlePrintSingleOrder = async (order: NormalizedOrder) => {
    if (!previewRef.current) return;
    setIsPrintingSingle(true);
    try {
      const dataUrl = await captureElementToDataUrl(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const targetWidth = activeTemplate.recommendedWidthMm || 57;
      if (props.onDirectPrint) {
        await props.onDirectPrint(dataUrl, `Kargo-${order.orderNumber}`, targetWidth);
      } else if (props.onPreviewAndPrint) {
        props.onPreviewAndPrint(dataUrl, `Kargo-${order.orderNumber}`, targetWidth);
      } else {
        await props.onPrintShippingLabel(buildShippingBlocks(order), `Kargo-${order.orderNumber}`);
      }
      const printedSet = new Set(printed);
      printedSet.add(packageKey(order));
      savePrintedPackages(printedSet);
      setPrinted(new Set(printedSet));
      setPreviewOrder(null);
    } catch (err) {
      console.error('Print single error:', err);
      await props.onPrintShippingLabel(buildShippingBlocks(order), `Kargo-${order.orderNumber}`);
    } finally {
      setIsPrintingSingle(false);
    }
  };

  const handleOpenInPreviewStudio = async (order: NormalizedOrder) => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await captureElementToDataUrl(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const targetWidth = activeTemplate.recommendedWidthMm || 57;
      if (props.onPreviewAndPrint) {
        props.onPreviewAndPrint(dataUrl, `Kargo-${order.orderNumber}`, targetWidth);
      }
      setPreviewOrder(null);
    } catch (err) {
      console.error('Open preview studio error:', err);
    }
  };

  const serverPageRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);
  const [showApiPanel, setShowApiPanel] = useState(false);
  const [marketplaceSettings, setMarketplaceSettings] = useState<MarketplaceSettings>(() => loadMarketplaceSettings());
  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Aktif profil
  const activeProfile = useMemo(() => {
    return (
      marketplaceSettings.profiles.find(p => p.id === marketplaceSettings.activeProfileId) ||
      marketplaceSettings.profiles[0]
    );
  }, [marketplaceSettings]);

  // Profil değiştirme
  const handleSelectProfile = (profileId: string) => {
    setMarketplaceSettings(prev => {
      const next: MarketplaceSettings = { ...prev, activeProfileId: profileId };
      saveMarketplaceSettings(next);
      return next;
    });
    setApiTestResult(null);
  };

  // Aktif profil alanlarını güncelleme
  const handleUpdateActiveProfile = (partial: Partial<MarketplaceProfile>) => {
    setMarketplaceSettings(prev => {
      const updatedProfiles = prev.profiles.map(p =>
        p.id === activeProfile.id ? { ...p, ...partial } : p
      );
      const next: MarketplaceSettings = { ...prev, profiles: updatedProfiles };
      return next;
    });
  };

  // Yeni profil ekleme
  const handleAddProfile = () => {
    const newId = `prof_${Date.now()}`;
    const newProfile: MarketplaceProfile = {
      id: newId,
      name: `Mağaza ${marketplaceSettings.profiles.length + 1}`,
      marketplace: 'trendyol',
      supplierId: '',
      apiKey: '',
      apiSecret: '',
      customEndpoint: ''
    };
    setMarketplaceSettings(prev => {
      const next: MarketplaceSettings = {
        ...prev,
        activeProfileId: newId,
        profiles: [...prev.profiles, newProfile]
      };
      saveMarketplaceSettings(next);
      return next;
    });
    setApiTestResult(null);
  };

  // Aktif profili silme
  const handleDeleteActiveProfile = () => {
    if (marketplaceSettings.profiles.length <= 1) {
      alert('En az bir profil bulunmalıdır. Son profili silemezsiniz.');
      return;
    }
    const remaining = marketplaceSettings.profiles.filter(p => p.id !== activeProfile.id);
    const next: MarketplaceSettings = {
      ...marketplaceSettings,
      activeProfileId: remaining[0].id,
      profiles: remaining
    };
    setMarketplaceSettings(next);
    saveMarketplaceSettings(next);
    setApiTestResult(null);
  };

  const fetchPage = useCallback(
    async (page: number, replace: boolean) => {
      if (replace) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        let list: NormalizedOrder[] = [];
        let isDemo = false;

        // 1. Canlı API Modu aktifse ve aktif profil anahtarları girilmişse
        if (marketplaceSettings.isLiveMode && activeProfile.supplierId && activeProfile.apiKey) {
          const endpoint = activeProfile.customEndpoint?.trim() || `${props.apiBase}/trendyol/orders`;
          let targetUrl = endpoint;
          const queryParams = new URLSearchParams({
            status: statusFilter,
            page: String(page),
            size: String(PAGE_SIZE),
            days,
            supplierId: activeProfile.supplierId
          });

          if (endpoint.startsWith('http://') || endpoint.startsWith('https://') || endpoint.startsWith('/')) {
            targetUrl = endpoint.includes('?') ? `${endpoint}&${queryParams.toString()}` : `${endpoint}?${queryParams.toString()}`;
          }

          const headers: Record<string, string> = {
            'Accept': 'application/json'
          };
          if (activeProfile.apiKey && activeProfile.apiSecret) {
            try {
              headers['Authorization'] = `Basic ${btoa(`${activeProfile.apiKey}:${activeProfile.apiSecret}`)}`;
              headers['User-Agent'] = `${activeProfile.supplierId} - iPrintPro`;
            } catch {
              // base64 safe
            }
          }

          try {
            const res = await fetch(targetUrl, { headers, mode: 'cors' });
            if (res.ok) {
              const data = await res.json();
              list = parseRawTrendyolOrders(data);
              isDemo = false;
            } else {
              throw new Error(`API Hatası (${res.status}): ${res.statusText}`);
            }
          } catch (apiErr: any) {
            console.warn('Canlı API isteği başarısız, demo siparişler yedeklendi:', apiErr);
            setError(
              `"${activeProfile.name}" için Trendyol API bağlantısı kurulamadı (Tarayıcı CORS veya ağ hatası). API Ayarlarından bilgilerinizi kontrol edebilirsiniz.`
            );
            list = MOCK_TRENDYOL_ORDERS;
            isDemo = true;
          }
        } else {
          // Demo modu veya standart sunucu endpointi
          try {
            const params = new URLSearchParams({
              status: statusFilter,
              page: String(page),
              size: String(PAGE_SIZE),
              days
            });
            const res = await fetch(`${props.apiBase}/trendyol/orders?${params.toString()}`);
            const ctype = res.headers.get('content-type') || '';
            
            if (!res.ok || !ctype.includes('application/json')) {
              list = MOCK_TRENDYOL_ORDERS;
              isDemo = true;
            } else {
              const data: unknown = await res.json();
              list = parseRawTrendyolOrders(data);
            }
          } catch {
            list = MOCK_TRENDYOL_ORDERS;
            isDemo = true;
          }
        }

        if (!mountedRef.current) return;
        setIsDemoMode(isDemo);
        serverPageRef.current = page;
        setHasMore(!isDemo && list.length === PAGE_SIZE);
        setOrders(prev => (replace ? list : [...prev, ...list]));
        if (replace) {
          setSelected(new Set());
          setVisibleCount(PAGE_SIZE);
        } else {
          setVisibleCount(c => c + PAGE_SIZE);
        }
      } catch (e) {
        if (mountedRef.current) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [props.apiBase, statusFilter, days, marketplaceSettings.isLiveMode, activeProfile]
  );

  const handleTestConnection = async () => {
    if (!activeProfile.supplierId || !activeProfile.apiKey || !activeProfile.apiSecret) {
      setApiTestResult({
        success: false,
        message: 'Lütfen seçili profil için Satıcı ID, API Key ve API Secret alanlarının tamamını doldurunuz.'
      });
      return;
    }

    setApiTesting(true);
    setApiTestResult(null);

    try {
      const endpoint = activeProfile.customEndpoint?.trim() || `https://api.trendyol.com/sapigw/suppliers/${activeProfile.supplierId}/orders?size=1`;
      const headers: Record<string, string> = {
        'Authorization': `Basic ${btoa(`${activeProfile.apiKey}:${activeProfile.apiSecret}`)}`,
        'User-Agent': `${activeProfile.supplierId} - iPrintPro`
      };

      const res = await fetch(endpoint, { method: 'GET', headers, mode: 'cors' }).catch(() => {
        throw new Error('CORS_OR_NETWORK');
      });

      if (res.ok) {
        setApiTestResult({
          success: true,
          message: `Tebrikler! "${activeProfile.name}" profili için Trendyol API bağlantısı doğrulandı. Canlı veriler kullanılabilir.`
        });
      } else if (res.status === 401 || res.status === 403) {
        setApiTestResult({
          success: false,
          message: 'Yetkilendirme hatası (401/403): API Key, API Secret veya Satıcı ID hatalı.'
        });
      } else {
        setApiTestResult({
          success: false,
          message: `Sunucu yanıtı: ${res.status} ${res.statusText}`
        });
      }
    } catch (err: any) {
      if (err?.message === 'CORS_OR_NETWORK') {
        setApiTestResult({
          success: false,
          message: 'Tarayıcı CORS güvenlik kısıtı: Trendyol sunucusu doğrudan tarayıcı isteklerine izin vermiyor. Kendi Proxy URL\'inizi belirtebilirsiniz.'
        });
      } else {
        setApiTestResult({
          success: false,
          message: `Bağlantı hatası: ${err?.message || 'Bilinmeyen hata'}`
        });
      }
    } finally {
      setApiTesting(false);
    }
  };

  const handleSaveSettings = () => {
    saveMarketplaceSettings(marketplaceSettings);
    setShowApiPanel(false);
    void fetchPage(0, true);
  };

  useEffect(() => {
    void fetchPage(0, true);
  }, [fetchPage]);

  const handleRefresh = useCallback(() => {
    void fetchPage(0, true);
  }, [fetchPage]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (activeStudioTab === 'shipped') {
        if (o.status !== 'Shipped') return false;
      } else if (activeStudioTab === 'orders') {
        if (statusFilter) {
          if (o.status !== statusFilter) return false;
        } else {
          // Varsayılan tüm siparişlerde sevk edilmemişleri göster
          if (o.status === 'Shipped') return false;
        }
      }
      if (cargoFilter !== 'all') {
        const provider = (o.cargoProviderName || '').toLowerCase();
        if (!provider.includes(cargoFilter.toLowerCase())) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrder = o.orderNumber.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesCity = o.address.city.toLowerCase().includes(q);
        const matchesDistrict = o.address.district.toLowerCase().includes(q);
        const matchesTracking = (o.cargoTrackingNumber || '').toLowerCase().includes(q);
        if (!matchesOrder && !matchesName && !matchesCity && !matchesDistrict && !matchesTracking) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeStudioTab, statusFilter, cargoFilter, searchQuery]);

  const visible = useMemo(() => filteredOrders.slice(0, visibleCount), [filteredOrders, visibleCount]);
  const selectedCount = useMemo(
    () => filteredOrders.filter(o => selected.has(packageKey(o))).length,
    [filteredOrders, selected]
  );
  const allVisibleSelected =
    visible.length > 0 && visible.every(o => selected.has(packageKey(o)));

  function toggleRow(key: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach(o => next.delete(packageKey(o)));
      else visible.forEach(o => next.add(packageKey(o)));
      return next;
    });
  }

  function handleShowMore() {
    if (visibleCount < filteredOrders.length) {
      setVisibleCount(c => c + PAGE_SIZE);
      return;
    }
    if (hasMore && !loading && !loadingMore) void fetchPage(serverPageRef.current + 1, false);
  }

  async function runPrint(kind: 'label' | 'slip') {
    const chosen = filteredOrders.filter(o => selected.has(packageKey(o)));
    if (chosen.length === 0 || printing) return;

    setPrinting(true);
    batchCancelRef.current = false;
    setBatchCancelRequested(false);
    const printedSet = new Set(printed);
    const failures: string[] = [];

    try {
      for (let i = 0; i < chosen.length; i++) {
        if (batchCancelRef.current) {
          failures.push(`Toplu baskı iptal edildi (${i}/${chosen.length} tamamlandı).`);
          break;
        }
        const o = chosen[i];
        const key = packageKey(o);
        setBatchProgress({ current: i + 1, total: chosen.length, orderNumber: o.orderNumber });

        if (printedSet.has(key) && chosen.length === 1 && !window.confirm(PRINT_CONFIRM_MSG)) continue;

        try {
          if (kind === 'label' && props.onDirectPrint) {
            setBatchPrintOrder(o);
            await new Promise(r => setTimeout(r, 80));
            if (batchHiddenRef.current) {
              const dataUrl = await captureElementToDataUrl(batchHiddenRef.current, {
                scale: 2,
                backgroundColor: '#ffffff'
              });
              const targetWidth = activeTemplate.recommendedWidthMm || 57;
              await props.onDirectPrint(dataUrl, `Kargo-${o.orderNumber}`, targetWidth);
            }
          } else if (kind === 'label') {
            await props.onPrintShippingLabel(buildShippingBlocks(o), 'kargo-etiketi');
          } else {
            await props.onPrintPackingSlip(buildPackingBlocks(o), 'koli-fisi');
          }
          printedSet.add(key);
          savePrintedPackages(printedSet);
          setPrinted(new Set(printedSet));
        } catch (e) {
          failures.push(`${o.orderNumber}: ${e instanceof Error ? e.message : String(e)}`);
        }

        if (i < chosen.length - 1 && batchDelayMs > 0) {
          await new Promise(r => setTimeout(r, batchDelayMs));
        }
      }
    } finally {
      setPrinting(false);
      setBatchProgress(null);
      setBatchPrintOrder(null);
      if (failures.length > 0) setError(failures.slice(0, 3).join(' • '));
    }
  }

  const showMoreAvailable = visibleCount < orders.length || hasMore;

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* 1. Header Bar: Compact, Responsive & Overflow-Safe */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs">
        {/* Left: Back Button & Title */}
        <div className="flex items-center gap-2 shrink-0">
          {props.onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={props.onBack}
              title="Geri Dön"
              className="rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-2.5 cursor-pointer shrink-0 shadow-xs"
            >
              <ArrowLeft size={14} className="mr-1" /> Geri
            </Button>
          )}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
            {activeStudioTab === 'shipped' ? 'Kargodaki Siparişler' : 'Pazaryeri'}
          </span>
        </div>

        {/* Right: Quick Status Filter & Dropdown API Profiles Button & Print Selection */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {activeStudioTab === 'orders' && (
            <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 gap-0.5">
              {STATUS_FILTERS.map((opt) => {
                const isSelected = statusFilter === opt.value;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    title={opt.label}
                    className={`flex items-center gap-1.5 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap ${
                      isSelected
                        ? 'bg-orange-600 text-white px-2 sm:px-2.5 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 px-1.5 sm:px-2'
                    }`}
                  >
                    <IconComponent size={13} className="shrink-0" />
                    {isSelected && <span>{opt.label}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {activeStudioTab === 'shipped' && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 px-2.5 py-1 rounded-xl">
              <Truck size={13} className="shrink-0" />
              <span>Kargodakiler</span>
            </div>
          )}

          {/* Inline Dropdown API & Profile Toggle Button */}
          {(activeStudioTab === 'orders' || activeStudioTab === 'shipped') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowApiPanel(prev => !prev)}
              className={`h-7 sm:h-8 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                showApiPanel
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 shadow-xs'
                  : marketplaceSettings.isLiveMode && activeProfile.supplierId
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="API"
            >
              <span>Api</span>
              {showApiPanel ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </Button>
          )}

          {/* Print Selection Quick Button */}
          {(activeStudioTab === 'orders' || activeStudioTab === 'shipped') && selected.size > 0 && (
            <Button
              size="sm"
              onClick={() => runPrint('label')}
              disabled={printing}
              className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Printer size={13} />
              <span>Yazdır ({selected.size})</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. INLINE SLIDE-DOWN API & MULTI-PROFILE MANAGEMENT PANEL */}
      <AnimatePresence>
        {showApiPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-4 rounded-2xl border border-orange-200 dark:border-orange-950/70 shadow-sm bg-gradient-to-b from-white to-orange-50/20 dark:from-slate-900 dark:to-orange-950/10 space-y-4">
              {/* Header & Profiles Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-orange-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      API Profilleri
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Farklı mağaza ve API hesaplarınızı yönetin
                  </p>
                </div>

                {/* Profile Tabs + Add Profile Button */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 gap-1">
                    {marketplaceSettings.profiles.map(p => {
                      const isActive = p.id === activeProfile.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProfile(p.id)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer truncate max-w-[120px] ${
                            isActive
                              ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title={p.name}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddProfile}
                    className="h-7 px-2 text-xs font-bold rounded-lg border-dashed border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 cursor-pointer flex items-center gap-1"
                    title="Yeni Mağaza Profili Ekle"
                  >
                    <Plus size={12} />
                    <span>Yeni</span>
                  </Button>
                </div>
              </div>

              {/* Active Profile Settings Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Profile Name & Delete Button */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      Profil / Mağaza Adı
                    </label>
                    {marketplaceSettings.profiles.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDeleteActiveProfile}
                        className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                        title="Bu profili sil"
                      >
                        <Trash2 size={11} /> Profili Sil
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={activeProfile.name}
                    onChange={e => handleUpdateActiveProfile({ name: e.target.value })}
                    placeholder="Örn: Trendyol Ana Mağaza"
                    className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Supplier ID */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                    Satıcı ID (Supplier ID) *
                  </label>
                  <input
                    type="text"
                    value={activeProfile.supplierId}
                    onChange={e => handleUpdateActiveProfile({ supplierId: e.target.value.trim() })}
                    placeholder="Örn: 123456"
                    className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* API Key */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                    API Key *
                  </label>
                  <input
                    type="text"
                    value={activeProfile.apiKey}
                    onChange={e => handleUpdateActiveProfile({ apiKey: e.target.value.trim() })}
                    placeholder="Trendyol API Key"
                    className="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* API Secret */}
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                    API Secret (Gizli Anahtar) *
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={activeProfile.apiSecret}
                      onChange={e => handleUpdateActiveProfile({ apiSecret: e.target.value.trim() })}
                      placeholder="Trendyol API Secret"
                      className="w-full h-8 px-2.5 pr-8 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(s => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Live / Demo Mode Switch */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Canlı API Modu
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {marketplaceSettings.isLiveMode ? 'Gerçek veriler çekilir' : 'Demo siparişler'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMarketplaceSettings(prev => {
                        const next = { ...prev, isLiveMode: !prev.isLiveMode };
                        saveMarketplaceSettings(next);
                        return next;
                      });
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      marketplaceSettings.isLiveMode ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        marketplaceSettings.isLiveMode ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions: Test Connection, Rehber, Save */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={apiTesting}
                    className="h-8 text-xs font-bold rounded-lg border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {apiTesting ? (
                      <Loader2 size={13} className="animate-spin mr-1.5" />
                    ) : (
                      <RefreshCw size={13} className="mr-1.5" />
                    )}
                    Test Et
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiGuide(prev => !prev)}
                    className={`h-8 text-xs font-bold rounded-lg border cursor-pointer transition-colors flex items-center gap-1.5 ${
                      showApiGuide
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <HelpCircle size={13} />
                    <span>Rehber</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiPanel(false)}
                    className="h-8 text-xs rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Kapat
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveSettings}
                    className="h-8 px-4 text-xs font-bold rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs cursor-pointer"
                  >
                    Kaydet
                  </Button>
                </div>
              </div>

              {/* Test Result Message */}
              {apiTestResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
                    apiTestResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900'
                  }`}
                >
                  {apiTestResult.success ? (
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{apiTestResult.message}</span>
                </div>
              )}

              {/* API Integration Guide Inside Panel */}
              {showApiGuide && (
                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/80 bg-amber-50/70 dark:bg-amber-950/30 text-xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs">
                      <Key size={14} className="text-amber-600 dark:text-amber-400" />
                      <span>API Entegrasyon & Kurulum Rehberi</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowApiGuide(false)}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Trendyol Satıcı Paneli (<strong>partner.trendyol.com</strong>) üzerinden API bilgilerinizi alarak canlı siparişlerinizi çekebilir ve yazdırabilirsiniz:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/60">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">1. Satıcı ID (Supplier ID)</span>
                      <span className="text-slate-600 dark:text-slate-400">Hesap Bilgilerim sayfasında yer alan satıcı numaranızdır.</span>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/60">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">2. API Key & Secret</span>
                      <span className="text-slate-600 dark:text-slate-400">Entegrasyon Bilgileri sekmesinden üretilir.</span>
                    </div>
                    <div className="bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/60">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">3. Canlı / Demo</span>
                      <span className="text-slate-600 dark:text-slate-400">Canlı API Modunu açıp Test Et butonuna basınız.</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kurulum Şeması Stüdyosu Render */}
      {activeStudioTab === 'assembly' ? (
        <AssemblyManualStudio
          initialData={assemblyInitialData}
          onDirectPrint={props.onDirectPrint}
          onPreviewAndPrint={props.onPreviewAndPrint}
          onBack={() => setActiveStudioTab('orders')}
        />
      ) : (
        <>
      {/* 3. WIDE DEFAULT TEMPLATE SELECTOR ROW */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0 text-slate-700 dark:text-slate-300">
          <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />
          <span className="text-xs font-bold whitespace-nowrap">
            Şablon:
          </span>
        </div>
        <Select
          value={defaultTemplateId}
          onValueChange={(val) => val && handleSetDefaultTemplate(val)}
        >
          <SelectTrigger className="h-8 text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 rounded-lg flex-1 min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-slate-900 dark:border-slate-800 max-h-72">
            {shippingTemplates.map((tpl) => (
              <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                {tpl.title} ({tpl.recommendedWidthMm}mm)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Live Integration Status Badge (Only when connected) */}
      {marketplaceSettings.isLiveMode && activeProfile.supplierId && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/80 p-2.5 text-xs text-emerald-900 dark:text-emerald-100 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>
              <strong>Canlı Mağaza:</strong> {activeProfile.name} (Satıcı ID: <code>{activeProfile.supplierId}</code>)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowApiPanel(true)}
            className="h-6 text-[11px] font-bold px-2 rounded-lg text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 shrink-0 cursor-pointer"
          >
            Profili Değiştir
          </Button>
        </div>
      )}

      <Card className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-3">
        {/* Top Controls: Yenile (Sol) ve Son Tarih Filtresi (Sağ) */}
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => void fetchPage(0, true)}
            className="h-8 rounded-lg text-xs font-bold px-3 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={13} className="mr-1.5 animate-spin" />
            ) : (
              <RefreshCw size={13} className="mr-1.5" />
            )}
            Yenile
          </Button>

          <div className="flex items-center gap-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Son
            </Label>
            <Select value={days} onValueChange={v => setDays((v ?? '7') as '1' | '7' | '30')}>
              <SelectTrigger className="w-24 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" className="text-xs">1 gün</SelectItem>
                <SelectItem value="7" className="text-xs">7 gün</SelectItem>
                <SelectItem value="30" className="text-xs">30 gün</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live Search & Cargo Provider Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sipariş no, alıcı adı, şehir veya takip no ara..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Kargo Firması:</span>
            <Select value={cargoFilter} onValueChange={(val) => setCargoFilter(val || 'all')}>
              <SelectTrigger className="h-8 text-xs font-bold rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Tümü (Tüm Kargo Firmaları)</SelectItem>
                <SelectItem value="Trendyol Express" className="text-xs">Trendyol Express (TEX)</SelectItem>
                <SelectItem value="Aras Kargo" className="text-xs">Aras Kargo</SelectItem>
                <SelectItem value="Yurtiçi Kargo" className="text-xs">Yurtiçi Kargo</SelectItem>
                <SelectItem value="Sürat Kargo" className="text-xs">Sürat Kargo</SelectItem>
                <SelectItem value="MNG Kargo" className="text-xs">MNG Kargo</SelectItem>
                <SelectItem value="HepsiJet" className="text-xs">HepsiJet</SelectItem>
                <SelectItem value="PTT Kargo" className="text-xs">PTT Kargo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-2.5">
            <AlertTriangle size={14} className="mt-0.5 text-red-500 shrink-0" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}
      </Card>

      {loading ? (
        <Card className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-teal-600" />
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 text-center">
          <Package size={22} className="mx-auto mb-2 text-slate-300" />
          <div className="text-xs font-bold text-slate-400">Sipariş bulunamadı.</div>
        </Card>
      ) : (
        <Card className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center justify-between p-2.5 border-b border-slate-100 dark:border-slate-800 select-none bg-slate-50/50 dark:bg-slate-900/50 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 rounded accent-orange-600"
                />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Tümünü seç ({visible.length})
                </span>
              </label>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="h-6 px-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-1"
                title="Siparişleri Yenile"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin text-orange-600' : ''} />
                <span>Yenile</span>
              </Button>
            </div>

            <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
              {selectedCount} seçili
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map(o => {
              const key = packageKey(o);
              const isPrinted = printed.has(key);
              const trStatus = ORDER_STATUS_TR[o.status] ?? o.status;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2.5 p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    selected.has(key) ? 'bg-teal-50/60 dark:bg-teal-950/20' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(key)}
                    onChange={() => toggleRow(key)}
                    className="h-4 w-4 rounded accent-teal-600 shrink-0 cursor-pointer"
                  />

                  {/* Clickable order info opening preview */}
                  <div
                    onClick={() => handleOpenPreviewModal(o)}
                    className="flex-1 min-w-0 cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 transition-colors">
                        {o.customerName}
                      </span>
                      {isPrinted && (
                        <span className="inline-flex items-center gap-0.5 shrink-0 py-0.5 px-1.5 rounded-md bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                          <CheckCircle2 size={10} /> Basıldı
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        #{o.packageId}
                      </span>
                      <span
                        className={`py-0.5 px-1.5 rounded-md border text-[10px] font-bold ${
                          STATUS_BADGE[o.status] ??
                          'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {trStatus}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {o.items.reduce((n, i) => n + i.quantity, 0)} kalem
                      </span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                        (Etiketi Gör)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 mr-1">
                      {formatMoney(o.totalPrice)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCreateAssemblyManualForOrder(o)}
                      className="h-7 px-2 text-[11px] font-bold rounded-lg gap-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 cursor-pointer"
                      title="Kılavuz Oluştur"
                    >
                      <Wrench size={12} className="text-teal-600 dark:text-teal-400" />
                      <span className="hidden sm:inline">Kılavuz</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenPreviewModal(o)}
                      className="h-7 px-2 text-[11px] font-bold rounded-lg gap-1 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950 cursor-pointer"
                      title="Kargo Etiketini Önizle & Bas"
                    >
                      <Eye size={12} />
                      <span className="hidden sm:inline">Etiket</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {showMoreAvailable && (
            <button
              type="button"
              onClick={handleShowMore}
              disabled={loadingMore}
              className="w-full py-2.5 text-xs font-bold text-teal-600 dark:text-teal-400 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Yükleniyor…
                </>
              ) : (
                <>Daha fazla ({Math.max(orders.length - visibleCount, hasMore ? PAGE_SIZE : 0)})</>
              )}
            </button>
          )}
        </Card>
      )}

      {/* Bulk Print Actions Floating Bar */}
      <div className="sticky bottom-3 z-10">
        <Card className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur flex items-center justify-between gap-2 sm:gap-3">
          <Button
            disabled={selectedCount === 0 || printing}
            onClick={() => void runPrint('label')}
            className="flex-1 h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            {printing ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            <span>Toplu Etiket ({selectedCount})</span>
          </Button>

          <Button
            variant="outline"
            disabled={selectedCount === 0 || printing}
            onClick={() => void runPrint('slip')}
            className="flex-1 h-9 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <FileText size={14} />
            <span>Koli Barkod ({selectedCount})</span>
          </Button>
        </Card>
      </div>

      {/* Offscreen Hidden Rendering Element for Batch Print Jobs */}
      {batchPrintOrder && (
        <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', pointerEvents: 'none', zIndex: -100 }}>
          <div ref={batchHiddenRef} className="bg-white p-0.5 inline-block">
            <ThermalTemplateRenderer
              template={activeTemplate}
              data={mapOrderToTemplateData(batchPrintOrder, activeTemplate)}
              widthMm={activeTemplate.recommendedWidthMm || 57}
              paperStyle="standard"
              scale={1}
            />
          </div>
        </div>
      )}

      {/* Batch Progress Modal */}
      <AnimatePresence>
        {batchProgress && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400">
                <Printer size={24} className="animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Toplu Baskı Yapılıyor</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  Sipariş: <span className="text-teal-600 dark:text-teal-400 font-bold">{batchProgress.orderNumber}</span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  <span>İlerleme</span>
                  <span>{batchProgress.current} / {batchProgress.total}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  batchCancelRef.current = true;
                  setBatchCancelRequested(true);
                }}
                disabled={batchCancelRequested}
                className="w-full text-xs font-bold border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 h-8 rounded-xl"
              >
                {batchCancelRequested ? 'İptal Ediliyor...' : 'Baskıyı İptal Et'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Order Shipping Label Preview & Direct Print Modal */}
      <AnimatePresence>
        {previewOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
                <div>
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-teal-600 dark:text-teal-400" />
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                      Kargo Etiketi Önizleme
                    </h3>
                    <span className="bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                      {previewOrder.orderNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {previewOrder.customerName} • {previewOrder.cargoProviderName} ({previewOrder.cargoTrackingNumber || previewOrder.packageId})
                  </p>
                </div>
                <button
                  onClick={() => setPreviewOrder(null)}
                  className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Template Selector & Default Switcher Toolbar */}
              <div className="p-3 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
                    Şablon:
                  </Label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(val) => val && setSelectedTemplateId(val)}
                  >
                    <SelectTrigger className="h-8 text-xs font-bold rounded-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white max-h-64">
                      {shippingTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.title} ({t.recommendedWidthMm}mm{t.heightMm ? `×${t.heightMm}mm` : ''})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDefaultTemplate(selectedTemplateId)}
                  className={`h-8 rounded-lg text-xs font-bold gap-1.5 transition-all cursor-pointer ${
                    selectedTemplateId === defaultTemplateId
                      ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/30'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {savedDefaultNotice ? (
                    <>
                      <Check size={13} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-300">Varsayılan Kaydedildi!</span>
                    </>
                  ) : selectedTemplateId === defaultTemplateId ? (
                    <>
                      <Star size={13} className="fill-amber-500 text-amber-500" />
                      <span>Varsayılan Şablon</span>
                    </>
                  ) : (
                    <>
                      <Star size={13} />
                      <span>Varsayılan Yap</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Rendered Live Cargo Label Preview Stage */}
              <div className="flex-1 overflow-auto p-3 sm:p-4 flex flex-col items-center justify-center bg-slate-100/70 dark:bg-slate-950 min-h-[280px]">
                {/* Template Info Badge */}
                <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-bold shadow-xs">
                    {activeTemplate.recommendedWidthMm || 57} mm ({(activeTemplate.recommendedWidthMm === 57 ? 384 : activeTemplate.recommendedWidthMm === 80 ? 576 : 800)} px)
                  </span>
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">• {activeTemplate.title}</span>
                </div>

                <div
                  ref={previewRef}
                  className="bg-white rounded-none shadow-2xl p-0 max-w-full overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700 select-none [image-rendering:pixelated]"
                >
                  <ThermalTemplateRenderer
                    template={activeTemplate}
                    data={mapOrderToTemplateData(previewOrder, activeTemplate)}
                    widthMm={activeTemplate.recommendedWidthMm || 57}
                    paperStyle="standard"
                    scale={1}
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPreviewOrder(null)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white h-9 rounded-xl"
                >
                  Kapat
                </Button>

                <div className="flex items-center gap-2 flex-wrap max-w-full overflow-x-auto">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await props.onPrintPackingSlip(buildPackingBlocks(previewOrder), 'koli-fisi');
                      setPreviewOrder(null);
                    }}
                    className="text-xs font-bold h-9 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                  >
                    <FileText size={14} className="mr-1.5" /> Paket Fişi
                  </Button>

                  {props.onPreviewAndPrint && (
                    <Button
                      variant="outline"
                      onClick={() => handleOpenInPreviewStudio(previewOrder)}
                      className="text-xs font-bold h-9 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 whitespace-nowrap"
                    >
                      <Eye size={14} className="text-teal-600 dark:text-teal-400" /> Önizle & Düzenle
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCreateAssemblyManualForOrder(previewOrder);
                      setPreviewOrder(null);
                    }}
                    className="text-xs font-bold h-9 rounded-xl border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 gap-1.5 whitespace-nowrap"
                  >
                    <Wrench size={14} /> Kılavuz Oluştur
                  </Button>

                  <Button
                    onClick={() => handlePrintSingleOrder(previewOrder)}
                    disabled={isPrintingSingle}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-teal-600/30 gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    {isPrintingSingle ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Printer size={14} />
                    )}
                    {isPrintingSingle ? 'Yazdırılıyor...' : 'Yazdır'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => {
            setActiveStudioTab('orders');
            setVisibleCount(PAGE_SIZE);
          }}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeStudioTab === 'orders'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package size={14} />
          <span>Siparişler</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveStudioTab('shipped');
            setVisibleCount(PAGE_SIZE);
          }}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeStudioTab === 'shipped'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Truck size={14} />
          <span>Kargoda</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAssemblyInitialData(undefined);
            setActiveStudioTab('assembly');
          }}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeStudioTab === 'assembly'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench size={14} />
          <span>Kılavuz</span>
        </button>
      </div>
    </div>
  );
}
