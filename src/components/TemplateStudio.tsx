import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { QRCodeSVG } from 'qrcode.react';
import bwipjs from 'bwip-js';
import { 
  ListChecks, 
  Tag, 
  Wifi, 
  Receipt, 
  Package, 
  DollarSign, 
  FileText, 
  Plus, 
  Trash2, 
  PrinterCheck, 
  Sparkles, 
  CheckSquare, 
  Clock, 
  Calendar, 
  User, 
  MapPin, 
  Phone,
  BookmarkPlus,
  RefreshCw,
  Eye,
  ShoppingBag,
  Store,
  Zap,
  Briefcase,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  Eraser,
  BookmarkCheck,
  Ruler,
  LayoutGrid,
  X as XIcon,
  ArrowUp
} from 'lucide-react';
import { logger } from '../lib/logger';
import { historyStorage } from '../lib/history-storage';
import { PRO_TEMPLATES, PRO_EXAMPLES, ProTemplate } from '../lib/pro-templates';
import { extractVariables, resolveTemplate } from '../lib/template-variables';
import { renderProDesigned } from '../lib/canvas-blocks';
import { PRO_CUSTOM_RENDERERS } from '../lib/pro-renderers';
import { rotateCanvas } from '../lib/image-processing';
import { calculateLabelDimensions } from '../lib/dimension-utils';
import { RulerDimensionBadge } from './RulerDimensionBadge';

const TemplateThumbnailCard: React.FC<{
  template: ProTemplate;
  isSelected: boolean;
  onSelect: () => void;
  pageWidth: number;
}> = ({ template, isSelected, onSelect, pageWidth }) => {
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const vals = PRO_EXAMPLES[template.id] || {};
      if (PRO_CUSTOM_RENDERERS[template.id]) {
        try {
          PRO_CUSTOM_RENDERERS[template.id]({
            ctx,
            width: 400,
            canvas,
            values: vals,
            orientation: 'landscape',
            barcodeLayout: 'auto'
          });
          if (isMounted) setImgUrl(canvas.toDataURL());
          return;
        } catch {
          // fallback
        }
      }
      const blocks = resolveTemplate(template.text, vals);
      canvas.height = 300;
      const totalH = renderProDesigned(ctx, 400, template.title, blocks, { barcodeLayout: 'auto' });
      canvas.height = Math.max(260, totalH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, canvas.height);
      renderProDesigned(ctx, 400, template.title, blocks, { barcodeLayout: 'auto' });
      if (isMounted) setImgUrl(canvas.toDataURL());
    }
    return () => { isMounted = false; };
  }, [template]);

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg flex flex-col justify-between ${
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-500/50 dark:border-indigo-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
      }`}
    >
      <div className="w-full bg-slate-100 dark:bg-slate-950 p-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center min-h-[145px] relative overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={template.title}
            className="max-h-40 w-auto object-contain rounded-md shadow-xs group-hover:scale-103 transition-transform duration-200 [image-rendering:pixelated]"
          />
        ) : (
          <div className="h-32 w-full flex items-center justify-center text-slate-400 text-xs font-medium">
            Önizleme Yükleniyor...
          </div>
        )}
        {isSelected && (
          <span className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            ✓ Seçili
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60 truncate max-w-[70%]">
              {template.category}
            </span>
            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono">
              📐 {pageWidth <= 400 ? '57mm Rulo' : pageWidth <= 600 ? '80mm Rulo' : pageWidth > 800 ? '15x10 cm' : '10x15 cm'}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {template.title}
          </h4>
        </div>

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`w-full h-8 text-xs font-bold rounded-xl gap-1 transition-all ${
            isSelected
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              : 'bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {isSelected ? '✓ Seçildi (Düzenle ➔)' : 'Şablonu Seç & Düzenle ➔'}
        </Button>
      </div>
    </div>
  );
};

interface TemplateStudioProps {
  pageWidth: number;
  onPreviewAndPrint: (dataUrl: string, title: string) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  initialProId?: string;
  onSelectWidth?: (w: number) => void;
  activeDraft?: { id: string; title: string; category: string; payload?: any } | null;
  onClearActiveDraft?: () => void;
}

type TemplateCategory = 'pro' | 'todo' | 'shipping' | 'wifi' | 'receipt' | 'pantry' | 'price' | 'article';

export const TemplateStudio: React.FC<TemplateStudioProps> = ({ 
  pageWidth, 
  onPreviewAndPrint, 
  onDirectPrint,
  initialProId, 
  onSelectWidth,
  activeDraft,
  onClearActiveDraft
}) => {
  const [currentWidth, setCurrentWidth] = useState<number>(pageWidth || 800);
  const [labelOrientation, setLabelOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [barcodeLayoutMode, setBarcodeLayoutMode] = useState<'auto' | 'horizontal' | 'vertical' | 'vertical-side'>('auto');
  const [category, setCategory] = useState<TemplateCategory>(initialProId ? 'pro' : 'pro');
  const [selectedProId, setSelectedProId] = useState<string>(initialProId || 'pro-10x15-kargo-zebra');
  const [proCategoryFilter, setProCategoryFilter] = useState<string>('ALL');
  const [isPaperSizeOpen, setIsPaperSizeOpen] = useState<boolean>(false);
  const [proValues, setProValues] = useState<Record<string, Record<string, string>>>(PRO_EXAMPLES);
  const [activeStudioSubTab, setActiveStudioSubTab] = useState<'gallery' | 'edit' | 'preview'>('gallery');

  // Scroll to top floating button state
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize currentWidth if pageWidth changes from printer / parent
  useEffect(() => {
    if (pageWidth && pageWidth !== currentWidth) {
      setCurrentWidth(pageWidth);
    }
  }, [pageWidth]);

  useEffect(() => {
    if (activeDraft) {
      if (activeDraft.payload) {
        const p = activeDraft.payload;
        if (p.category) setCategory(p.category as TemplateCategory);
        if (p.selectedProId) setSelectedProId(p.selectedProId);
        if (p.proValues) setProValues(prev => ({ ...prev, ...p.proValues }));
        if (p.todoTitle) setTodoTitle(p.todoTitle);
        if (p.senderName) setSenderName(p.senderName);
        if (p.wifiSsid) setWifiSsid(p.wifiSsid);
        if (p.storeName) setStoreName(p.storeName);
        if (p.pantryItem) setPantryItem(p.pantryItem);
        if (p.productName) setProductName(p.productName);
        if (p.articleTitle) setArticleTitle(p.articleTitle);
      }
      setActiveStudioSubTab('edit');
    }
  }, [activeDraft]);

  useEffect(() => {
    if (pageWidth && pageWidth !== currentWidth) {
      setCurrentWidth(pageWidth);
    }
  }, [pageWidth]);

  const handleSetWidth = (w: number, defaultOrient?: 'portrait' | 'landscape') => {
    setCurrentWidth(w);
    if (defaultOrient) {
      setLabelOrientation(defaultOrient);
    }
    onSelectWidth?.(w);
  };

  const handleOrientationChange = (orient: 'portrait' | 'landscape') => {
    setLabelOrientation(orient);
    if (orient === 'landscape' && currentWidth <= 800) {
      handleSetWidth(1200, 'landscape');
    } else if (orient === 'portrait' && currentWidth >= 1000) {
      handleSetWidth(800, 'portrait');
    }
  };
  
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');

  // 1. To-Do / Checklist State
  const [todoTitle, setTodoTitle] = useState('GÜNLÜK PLAN & HEDEFLER');
  const [todoDate, setTodoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [todoStyle, setTodoStyle] = useState<'checkbox' | 'circle' | 'numbered'>('checkbox');
  const [todoItems, setTodoItems] = useState<string[]>([
    'Sabah kahvesi ve e-postalar',
    'Termal yazıcı test çıktıları',
    'Müşteri kargo etiketlerini hazırla',
    'Akşam toplantı notlarını toparla'
  ]);

  // 2. Shipping Label State
  const [senderName, setSenderName] = useState('iPrint Pro Store');
  const [senderPhone, setSenderPhone] = useState('+90 555 123 45 67');
  const [senderAddress, setSenderAddress] = useState('Merkez Mah. Teknoloji Cad. No: 12/A İstanbul');
  const [receiverName, setReceiverName] = useState('Ahmet Yılmaz');
  const [receiverPhone, setReceiverPhone] = useState('+90 532 987 65 43');
  const [receiverAddress, setReceiverAddress] = useState('Atatürk Bulvarı Papatya Sokak No: 8 Daire: 4 Kadıköy / İstanbul');
  const [trackingNumber, setTrackingNumber] = useState('KP048291038TR');
  const [isFragile, setIsFragile] = useState(true);

  // 3. Wi-Fi Card State
  const [wifiSsid, setWifiSsid] = useState('iPrint-Misafir-WiFi');
  const [wifiPassword, setWifiPassword] = useState('HızlıBaskı2026!');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiMessage, setWifiMessage] = useState('Kameranızla QR kodu taratarak ağa otomatik bağlanabilirsiniz.');

  // 4. POS Receipt State
  const [storeName, setStoreName] = useState('İPRİNT KAFE & MARKET');
  const [storeSub, setStoreSub] = useState('Fatih Mah. İstiklal Cad. No:44');
  const [receiptNumber, setReceiptNumber] = useState('NO: 004829');
  const [receiptItems, setReceiptItems] = useState([
    { name: 'Filtre Kahve', qty: 2, price: 65 },
    { name: 'Kruvasan Sade', qty: 1, price: 80 },
    { name: 'Termal Rulo Kağıt (3lü)', qty: 1, price: 120 }
  ]);
  const [receiptTax, setReceiptTax] = useState(10); // %10 KDV
  const [receiptFooter, setReceiptFooter] = useState('Bizi tercih ettiğiniz için teşekkür ederiz! Yine bekleriz.');

  // 5. Pantry / Organizer State
  const [pantryItem, setPantryItem] = useState('Kuru Fasulye (Dermason)');
  const [pantryCategory, setPantryCategory] = useState('Bakliyat');
  const [pantryPackDate, setPantryPackDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pantryExpiryDate, setPantryExpiryDate] = useState('2027-08-30');
  const [pantryStorage, setPantryStorage] = useState('Serin, Kuru & Işıksız Ortam');

  // 6. Price & Sale Tag State
  const [productName, setProductName] = useState('Premium Termal Çıkartma Kağıdı');
  const [oldPrice, setOldPrice] = useState('149.90');
  const [newPrice, setNewPrice] = useState('99.50');
  const [currency, setCurrency] = useState('TL');
  const [promoBadge, setPromoBadge] = useState('SÜPER İNDİRİM');
  const [productBarcode, setProductBarcode] = useState('869012345678');

  // 7. Article / Reader State
  const [articleTitle, setArticleTitle] = useState('Termal Yazıcı Teknolojisi ve Verimlilik');
  const [articleAuthor, setArticleAuthor] = useState('iPrint Pro Araştırma');
  const [articleContent, setArticleContent] = useState(
    'Termal baskı teknolojisi mürekkep veya kartuş gerektirmeden, ısıya duyarlı özel termal kağıt üzerine mikroskobik ısıtıcı pinler ile mikrosaniyeler içinde yüksek kontrastlı baskı sağlar.\n\nTaşınabilir Bluetooth termal yazıcılar günümüzde lojistik, kargo, perakende fişleri, ajanda tutma ve fotoğraf hatıra çıktılarında vazgeçilmez bir yer edinmiştir.'
  );

  useEffect(() => {
    if (initialProId) {
      setSelectedProId(initialProId);
      setCategory('pro');
    }
  }, [initialProId]);

  // Re-render the canvas whenever state changes
  useEffect(() => {
    renderCurrentTemplate();
  }, [
    category,
    selectedProId,
    proValues,
    currentWidth,
    pageWidth,
    labelOrientation,
    barcodeLayoutMode,
    todoTitle, todoDate, todoStyle, todoItems,
    senderName, senderPhone, senderAddress, receiverName, receiverPhone, receiverAddress, trackingNumber, isFragile,
    wifiSsid, wifiPassword, wifiSecurity, wifiMessage,
    storeName, storeSub, receiptNumber, receiptItems, receiptTax, receiptFooter,
    pantryItem, pantryCategory, pantryPackDate, pantryExpiryDate, pantryStorage,
    productName, oldPrice, newPrice, currency, promoBadge, productBarcode,
    articleTitle, articleAuthor, articleContent
  ]);

  const renderPro = (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const t = PRO_TEMPLATES.find(item => item.id === selectedProId) || PRO_TEMPLATES[0];
    const vals = proValues[t.id] || PRO_EXAMPLES[t.id] || {};
    
    if (PRO_CUSTOM_RENDERERS[t.id]) {
      PRO_CUSTOM_RENDERERS[t.id]({ 
        ctx, 
        width: w, 
        canvas, 
        values: vals, 
        orientation: labelOrientation, 
        barcodeLayout: barcodeLayoutMode 
      });
    } else {
      const blocks = resolveTemplate(t.text, vals);
      // First pass to measure height
      canvas.height = labelOrientation === 'portrait' ? Math.round(w * 1.5) : 1000;
      const totalH = renderProDesigned(ctx, w, t.title, blocks, { barcodeLayout: barcodeLayoutMode });
      canvas.height = totalH;

      // Background white fill
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, totalH);

      // Final render
      renderProDesigned(ctx, w, t.title, blocks, { barcodeLayout: barcodeLayoutMode });
    }
  };

  const renderCurrentTemplate = async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = currentWidth || pageWidth || 800;
    canvas.width = w;

    if (category === 'pro') {
      renderPro(ctx, w, canvas);
    } else if (category === 'todo') {
      renderTodo(ctx, w, canvas);
    } else if (category === 'shipping') {
      await renderShipping(ctx, w, canvas);
    } else if (category === 'wifi') {
      await renderWifi(ctx, w, canvas);
    } else if (category === 'receipt') {
      renderReceipt(ctx, w, canvas);
    } else if (category === 'pantry') {
      renderPantry(ctx, w, canvas);
    } else if (category === 'price') {
      await renderPrice(ctx, w, canvas);
    } else if (category === 'article') {
      renderArticle(ctx, w, canvas);
    }

    setLivePreviewUrl(canvas.toDataURL('image/png'));
  };

  // 1. Render To-Do
  const renderTodo = (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));
    const lineHeight = Math.round(32 * s);
    const estimatedHeight = Math.round(110 * s) + todoItems.length * lineHeight + Math.round(50 * s);
    canvas.height = estimatedHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvas.height);
    ctx.fillStyle = '#000000';

    // Header Box
    ctx.fillRect(pad, Math.round(14 * s), w - pad * 2, Math.round(34 * s));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(todoTitle, w / 2, Math.round(36 * s));

    // Date Subtitle
    ctx.fillStyle = '#000000';
    ctx.font = `${Math.round(11 * s)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`TARİH: ${todoDate}`, w / 2, Math.round(64 * s));

    // Divider
    ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
    ctx.setLineDash([Math.round(4 * s), Math.round(4 * s)]);
    ctx.beginPath();
    ctx.moveTo(pad, Math.round(74 * s));
    ctx.lineTo(w - pad, Math.round(74 * s));
    ctx.stroke();
    ctx.setLineDash([]);

    // Items
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(13 * s)}px sans-serif`;
    let y = Math.round(104 * s);

    todoItems.forEach((item, idx) => {
      // Checkbox icon / circle / number
      if (todoStyle === 'checkbox') {
        ctx.lineWidth = Math.max(1.5, Math.round(2 * s));
        ctx.strokeRect(pad + Math.round(4 * s), y - Math.round(14 * s), Math.round(16 * s), Math.round(16 * s));
      } else if (todoStyle === 'circle') {
        ctx.lineWidth = Math.max(1.5, Math.round(2 * s));
        ctx.beginPath();
        ctx.arc(pad + Math.round(12 * s), y - Math.round(6 * s), Math.round(8 * s), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
        ctx.fillText(`${idx + 1}.`, pad + Math.round(4 * s), y);
      }

      ctx.font = `${Math.round(13 * s)}px sans-serif`;
      const itemX = pad + Math.round(28 * s);
      const maxItemW = w - itemX - pad;
      const words = item.split(' ');
      let line = '';
      for (const wd of words) {
        const test = line ? line + ' ' + wd : wd;
        if (ctx.measureText(test).width > maxItemW && line) {
          ctx.fillText(line, itemX, y);
          y += Math.round(18 * s);
          line = wd;
        } else {
          line = test;
        }
      }
      if (line) {
        ctx.fillText(line, itemX, y);
      }
      y += lineHeight;
    });

    // Bottom Decorative Bar
    ctx.fillRect(pad, y + Math.round(6 * s), w - pad * 2, Math.max(2, Math.round(3 * s)));
  };

  // 2. Render Shipping
  const renderShipping = async (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const isPortrait = labelOrientation === 'portrait' || w <= 800;
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));
    const headerH = Math.round(36 * s);

    const isSideBarcode = (barcodeLayoutMode === 'vertical-side' || barcodeLayoutMode === 'vertical') && isPortrait && w >= 600;

    if (isSideBarcode) {
      // DİKEY YAN BARKODLU 10x15 cm DÜZENİ
      const totalHeight = isPortrait && w >= 700 ? Math.round(w * 1.5) : Math.round(580 * s);
      canvas.height = totalHeight;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, canvas.height);
      ctx.fillStyle = '#000000';

      // Outer border with safe margins
      ctx.lineWidth = Math.max(2, Math.round(2.5 * s));
      ctx.strokeRect(pad, pad, w - pad * 2, totalHeight - pad * 2);

      // Top Header: EXPRESS CARGO
      ctx.fillRect(pad, pad, w - pad * 2, headerH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('🚚 HIZLI KARGO / SEVK ETİKETİ', w / 2, pad + Math.round(23 * s));

      const sideW = Math.round(130 * s);
      const contentW = w - pad * 2 - sideW - Math.round(12 * s);
      const sideX = w - pad - sideW;

      // Yan Dikey Çizgi
      ctx.fillStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
      ctx.beginPath();
      ctx.moveTo(sideX - Math.round(4 * s), pad + headerH);
      ctx.lineTo(sideX - Math.round(4 * s), totalHeight - pad);
      ctx.stroke();

      // Dikey Barkod
      ctx.font = `bold ${Math.round(11 * s)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`TAKİP: ${trackingNumber}`, sideX + sideW / 2, pad + headerH + Math.round(16 * s));

      try {
        const barcodeCanvas = document.createElement('canvas');
        bwipjs.toCanvas(barcodeCanvas, {
          bcid: 'code128',
          text: trackingNumber,
          scale: Math.max(2, Math.round(3 * s)),
          height: Math.round(14 * s),
          includetext: true
        });

        const dw = Math.min(Math.round(totalHeight * 0.65), Math.round(barcodeCanvas.width * 0.8));
        const dh = Math.min(sideW - Math.round(16 * s), barcodeCanvas.height);
        ctx.save();
        ctx.translate(sideX + sideW / 2, pad + headerH + Math.round(30 * s) + dw / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(barcodeCanvas, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } catch (e) {
        logger.error('Side barcode failed', e);
      }

      // Sol İçerik
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
      let curY = pad + headerH + Math.round(16 * s);
      ctx.fillText('GÖNDERİCİ (FROM):', pad + Math.round(8 * s), curY);
      curY += Math.round(16 * s);
      ctx.font = `${Math.round(11 * s)}px sans-serif`;
      curY = wrapText(ctx, `${senderName} • Tel: ${senderPhone}`, pad + Math.round(8 * s), curY, contentW - Math.round(16 * s), Math.round(14 * s));
      curY = wrapText(ctx, senderAddress, pad + Math.round(8 * s), curY, contentW - Math.round(16 * s), Math.round(14 * s));

      curY += Math.round(12 * s);
      ctx.lineWidth = Math.max(1, Math.round(1 * s));
      ctx.beginPath();
      ctx.moveTo(pad, curY);
      ctx.lineTo(pad + contentW, curY);
      ctx.stroke();

      // Alıcı Bölümü
      curY += Math.round(8 * s);
      ctx.fillRect(pad, curY, contentW, Math.round(22 * s));
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
      ctx.fillText('ALICI (TO):', pad + Math.round(8 * s), curY + Math.round(15 * s));

      curY += Math.round(34 * s);
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
      curY = wrapText(ctx, receiverName, pad + Math.round(8 * s), curY, contentW - Math.round(16 * s), Math.round(16 * s));
      ctx.font = `bold ${Math.round(11 * s)}px monospace`;
      ctx.fillText(`Tel: ${receiverPhone}`, pad + Math.round(8 * s), curY);
      curY += Math.round(16 * s);
      ctx.font = `${Math.round(11 * s)}px sans-serif`;
      curY = wrapText(ctx, receiverAddress, pad + Math.round(8 * s), curY, contentW - Math.round(16 * s), Math.round(14 * s));

      if (isFragile) {
        curY += Math.round(14 * s);
        ctx.lineWidth = Math.max(1.5, Math.round(2 * s));
        ctx.strokeRect(pad + Math.round(8 * s), curY, Math.round(120 * s), Math.round(24 * s));
        ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ DİKKAT KIRILACAK', pad + Math.round(68 * s), curY + Math.round(16 * s));
      }

      // Alt İmza
      const signY = totalHeight - pad - Math.round(16 * s);
      ctx.font = `${Math.round(10 * s)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('İmza / Teslim: ..........................', pad + Math.round(8 * s), signY);

    } else {
      // STANDART YATAY BARKODLU DÜZEN (57mm, 80mm ve 10x15cm Dikey/Yatay için Dinamik Yükseklik)
      let barcodeCanvas: HTMLCanvasElement | null = null;
      let bw = 0;
      let bh = 0;
      try {
        barcodeCanvas = document.createElement('canvas');
        bwipjs.toCanvas(barcodeCanvas, {
          bcid: 'code128',
          text: trackingNumber,
          scale: Math.max(2, Math.round(2.5 * s)),
          height: Math.round(12 * s),
          includetext: false
        });
        bw = Math.min(Math.round(300 * s), w - pad * 2 - Math.round(20 * s));
        bh = Math.round((bw * barcodeCanvas.height) / barcodeCanvas.width);
      } catch (e) {
        logger.error('Shipping barcode prep failed', e);
      }

      const drawHorizontalContent = (targetH: number) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, targetH);
        ctx.fillStyle = '#000000';

        // Outer border
        ctx.lineWidth = Math.max(2, Math.round(2.5 * s));
        ctx.strokeRect(pad, pad, w - pad * 2, targetH - pad * 2);

        // Header
        ctx.fillRect(pad, pad, w - pad * 2, headerH);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🚚 HIZLI KARGO SEVK ETİKETİ', w / 2, pad + Math.round(22 * s));

        // Sender Section
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
        let y = pad + headerH + Math.round(14 * s);
        ctx.fillText('GÖNDERİCİ (FROM):', pad + Math.round(8 * s), y);
        y += Math.round(15 * s);
        ctx.font = `${Math.round(11 * s)}px sans-serif`;
        y = wrapText(ctx, `${senderName} • Tel: ${senderPhone}`, pad + Math.round(8 * s), y, w - pad * 2 - Math.round(16 * s), Math.round(14 * s));
        y = wrapText(ctx, senderAddress, pad + Math.round(8 * s), y, w - pad * 2 - Math.round(16 * s), Math.round(14 * s));

        // Divider
        y += Math.round(8 * s);
        ctx.lineWidth = Math.max(1, Math.round(1 * s));
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(w - pad, y);
        ctx.stroke();

        // Receiver Section (Highlighted)
        const recBoxH = Math.round(22 * s);
        ctx.fillRect(pad, y, w - pad * 2, recBoxH);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
        ctx.fillText('ALICI (TO):', pad + Math.round(8 * s), y + Math.round(15 * s));
        y += recBoxH + Math.round(14 * s);

        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
        y = wrapText(ctx, receiverName, pad + Math.round(8 * s), y, w - pad * 2 - Math.round(16 * s), Math.round(16 * s));
        ctx.font = `bold ${Math.round(11 * s)}px monospace`;
        ctx.fillText(`Tel: ${receiverPhone}`, pad + Math.round(8 * s), y);
        y += Math.round(16 * s);
        ctx.font = `${Math.round(11 * s)}px sans-serif`;
        y = wrapText(ctx, receiverAddress, pad + Math.round(8 * s), y, w - pad * 2 - Math.round(16 * s), Math.round(14 * s));

        // Divider
        y += Math.round(8 * s);
        ctx.lineWidth = Math.max(1, Math.round(1 * s));
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(w - pad, y);
        ctx.stroke();

        // Fragile Badge
        if (isFragile) {
          ctx.lineWidth = Math.max(1.5, Math.round(1.8 * s));
          ctx.strokeRect(w - pad - Math.round(100 * s), y + Math.round(4 * s), Math.round(92 * s), Math.round(20 * s));
          ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('! KIRILACAK', w - pad - Math.round(54 * s), y + Math.round(18 * s));
        }

        // Tracking Header
        ctx.textAlign = 'left';
        ctx.font = `bold ${Math.round(11 * s)}px monospace`;
        ctx.fillText(`TAKİP NO: ${trackingNumber}`, pad + Math.round(8 * s), y + Math.round(18 * s));
        y += Math.round(26 * s);

        // Barcode
        if (barcodeCanvas && bw > 0 && bh > 0) {
          ctx.drawImage(barcodeCanvas, (w - bw) / 2, y, bw, bh);
          y += bh + Math.round(14 * s);
        }

        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.round(12 * s)}px monospace`;
        ctx.fillText(trackingNumber, w / 2, y);
        y += Math.round(18 * s);

        ctx.font = `${Math.round(10 * s)}px sans-serif`;
        ctx.fillText('İmza / Teslim: .......................................', w / 2, y);
        y += Math.round(16 * s);

        return y + Math.round(14 * s) + pad;
      };

      // 1. Ölçüm pası
      canvas.height = 1200;
      const calculatedHeight = drawHorizontalContent(1200);
      const minStandardH = isPortrait && w >= 700 ? Math.round(w * 1.5) : (w >= 1000 ? Math.round(w * 0.67) : Math.round(380 * s));
      const finalH = Math.max(minStandardH, calculatedHeight + Math.round(16 * s));
      canvas.height = finalH;
      // 2. Net çizim
      drawHorizontalContent(finalH);
    }
  };

  // 3. Render Wi-Fi Card
  const renderWifi = async (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));

    // Draw QR Code
    const wifiString = `WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};;`;
    const qrSize = Math.min(Math.round(160 * s), w - pad * 2 - Math.round(40 * s));
    const qrX = (w - qrSize) / 2;
    const qrY = pad + Math.round(56 * s);

    // Render SVG QR to canvas
    const qrCanvas = document.createElement('canvas');
    try {
      bwipjs.toCanvas(qrCanvas, {
        bcid: 'qrcode',
        text: wifiString,
        scale: Math.max(3, Math.round(4 * s)),
        paddingwidth: 1,
        paddingheight: 1
      });
    } catch (e) {
      logger.error('Wifi QR render error', e);
    }

    const boxY = qrY + qrSize + Math.round(14 * s);
    const boxH = Math.round(68 * s);
    const footerY = boxY + boxH + Math.round(20 * s);
    const totalHeight = footerY + Math.round(45 * s) + pad;
    canvas.height = totalHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvas.height);
    ctx.fillStyle = '#000000';

    // Decorative outer frame
    ctx.lineWidth = Math.max(2, Math.round(2.5 * s));
    ctx.strokeRect(pad, pad, w - pad * 2, totalHeight - pad * 2);
    ctx.lineWidth = Math.max(1, Math.round(1 * s));
    ctx.strokeRect(pad + Math.round(4 * s), pad + Math.round(4 * s), w - pad * 2 - Math.round(8 * s), totalHeight - pad * 2 - Math.round(8 * s));

    // Title
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(15 * s)}px sans-serif`;
    ctx.fillText('MİSAFİR Wİ-Fİ AĞI', w / 2, pad + Math.round(28 * s));

    // Subtitle
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('Kameranızı QR koda tutarak bağlanın', w / 2, pad + Math.round(44 * s));

    if (qrCanvas && qrCanvas.width > 0) {
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    }

    // Wi-Fi Details Box
    const innerBoxPad = pad + Math.round(10 * s);
    const innerBoxW = w - innerBoxPad * 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(innerBoxPad, boxY, innerBoxW, boxH);
    ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
    ctx.strokeRect(innerBoxPad, boxY, innerBoxW, boxH);

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(`AĞ ADI (SSID):`, innerBoxPad + Math.round(10 * s), boxY + Math.round(20 * s));
    ctx.font = `bold ${Math.round(12 * s)}px monospace`;
    ctx.fillText(wifiSsid.slice(0, 24), innerBoxPad + Math.round(10 * s), boxY + Math.round(36 * s));

    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText(`ŞİFRE:`, innerBoxPad + Math.round(10 * s), boxY + Math.round(54 * s));
    ctx.font = `bold ${Math.round(12 * s)}px monospace`;
    ctx.fillText(wifiPassword.slice(0, 24), innerBoxPad + Math.round(56 * s), boxY + Math.round(54 * s));

    // Footer note
    ctx.textAlign = 'center';
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    wrapText(ctx, wifiMessage, w / 2, footerY, w - pad * 2 - Math.round(20 * s), Math.round(14 * s));
  };

  // 4. Render Receipt
  const renderReceipt = (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));
    const rowHeight = Math.round(22 * s);
    const totalLines = receiptItems.length;
    canvas.height = Math.round(200 * s) + totalLines * rowHeight + Math.round(120 * s);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvas.height);
    ctx.fillStyle = '#000000';

    // Store Name Header
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(16 * s)}px sans-serif`;
    ctx.fillText(storeName, w / 2, Math.round(28 * s));
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    ctx.fillText(storeSub, w / 2, Math.round(44 * s));

    const now = new Date();
    const dateStr = `${now.toLocaleDateString('tr-TR')}  ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    ctx.font = `bold ${Math.round(11 * s)}px monospace`;
    ctx.fillText(dateStr, w / 2, Math.round(60 * s));
    ctx.fillText(receiptNumber, w / 2, Math.round(74 * s));

    // Dotted Divider
    ctx.lineWidth = Math.max(1, Math.round(1 * s));
    ctx.setLineDash([Math.round(3 * s), Math.round(3 * s)]);
    ctx.beginPath();
    ctx.moveTo(pad, Math.round(86 * s));
    ctx.lineTo(w - pad, Math.round(86 * s));
    ctx.stroke();

    // Table Header
    ctx.setLineDash([]);
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(11 * s)}px monospace`;
    ctx.fillText('ÜRÜN', pad, Math.round(102 * s));
    ctx.textAlign = 'center';
    ctx.fillText('ADET', w - pad - Math.round(90 * s), Math.round(102 * s));
    ctx.textAlign = 'right';
    ctx.fillText('TUTAR', w - pad, Math.round(102 * s));

    ctx.setLineDash([Math.round(3 * s), Math.round(3 * s)]);
    ctx.beginPath();
    ctx.moveTo(pad, Math.round(110 * s));
    ctx.lineTo(w - pad, Math.round(110 * s));
    ctx.stroke();
    ctx.setLineDash([]);

    // Rows
    let curY = Math.round(128 * s);
    let subtotal = 0;

    receiptItems.forEach((item) => {
      const itemTotal = item.qty * item.price;
      subtotal += itemTotal;

      ctx.textAlign = 'left';
      ctx.font = `${Math.round(12 * s)}px sans-serif`;
      const maxNameWidth = w - pad * 2 - Math.round(140 * s);
      let truncatedName = item.name;
      while (ctx.measureText(truncatedName).width > maxNameWidth && truncatedName.length > 3) {
        truncatedName = truncatedName.slice(0, -1);
      }
      ctx.fillText(truncatedName, pad, curY);

      ctx.textAlign = 'center';
      ctx.font = `${Math.round(12 * s)}px monospace`;
      ctx.fillText(`${item.qty}x`, w - pad - Math.round(90 * s), curY);

      ctx.textAlign = 'right';
      ctx.font = `bold ${Math.round(12 * s)}px monospace`;
      ctx.fillText(`${itemTotal.toFixed(2)} TL`, w - pad, curY);

      curY += rowHeight;
    });

    // Totals Section
    ctx.setLineDash([Math.round(3 * s), Math.round(3 * s)]);
    ctx.beginPath();
    ctx.moveTo(pad, curY);
    ctx.lineTo(w - pad, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    curY += Math.round(20 * s);
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(11 * s)}px monospace`;
    ctx.fillText(`ARA TOPLAM:`, pad, curY);
    ctx.textAlign = 'right';
    ctx.fillText(`${subtotal.toFixed(2)} TL`, w - pad, curY);

    const taxAmount = (subtotal * receiptTax) / 100;
    curY += Math.round(18 * s);
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(11 * s)}px monospace`;
    ctx.fillText(`KDV (%${receiptTax}):`, pad, curY);
    ctx.textAlign = 'right';
    ctx.fillText(`${taxAmount.toFixed(2)} TL`, w - pad, curY);

    curY += Math.round(24 * s);
    ctx.fillRect(pad, curY - Math.round(16 * s), w - pad * 2, Math.round(24 * s));
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(13 * s)}px monospace`;
    ctx.fillText(`GENEL TOPLAM:`, pad + Math.round(8 * s), curY);
    ctx.textAlign = 'right';
    ctx.fillText(`${(subtotal + taxAmount).toFixed(2)} TL`, w - pad - Math.round(8 * s), curY);

    // Footer
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    curY += Math.round(34 * s);
    wrapText(ctx, receiptFooter, w / 2, curY, w - pad * 2 - Math.round(10 * s), Math.round(14 * s));

    curY += Math.round(28 * s);
    ctx.font = `bold ${Math.round(10 * s)}px monospace`;
    ctx.fillText('*** MALİ DEĞERİ YOKTUR / BİLGİ FİŞİDİR ***', w / 2, curY);
  };

  // 5. Render Pantry / Organizer
  const renderPantry = (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));
    const totalHeight = Math.round(260 * s);
    canvas.height = totalHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvas.height);
    ctx.fillStyle = '#000000';

    // Double frame
    ctx.lineWidth = Math.max(2, Math.round(2.5 * s));
    ctx.strokeRect(pad, pad, w - pad * 2, totalHeight - pad * 2);
    ctx.lineWidth = Math.max(1, Math.round(1 * s));
    ctx.strokeRect(pad + Math.round(4 * s), pad + Math.round(4 * s), w - pad * 2 - Math.round(8 * s), totalHeight - pad * 2 - Math.round(8 * s));

    // Category tag
    ctx.fillRect(pad + Math.round(12 * s), pad + Math.round(12 * s), Math.round(100 * s), Math.round(20 * s));
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(10 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(pantryCategory.toUpperCase(), pad + Math.round(62 * s), pad + Math.round(26 * s));

    // Main item name
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(17 * s)}px sans-serif`;
    ctx.fillText(pantryItem, w / 2, pad + Math.round(62 * s));

    // Divider line with diamond center
    ctx.lineWidth = Math.max(1, Math.round(1 * s));
    ctx.beginPath();
    ctx.moveTo(pad + Math.round(20 * s), pad + Math.round(78 * s));
    ctx.lineTo(w - pad - Math.round(20 * s), pad + Math.round(78 * s));
    ctx.stroke();

    // Dates grid
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('PAKETLEME:', pad + Math.round(16 * s), pad + Math.round(104 * s));
    ctx.font = `bold ${Math.round(12 * s)}px monospace`;
    ctx.fillText(pantryPackDate, pad + Math.round(16 * s), pad + Math.round(120 * s));

    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.fillText('SON TÜKETİM (TETT):', pad + Math.round(16 * s), pad + Math.round(148 * s));
    ctx.font = `bold ${Math.round(14 * s)}px monospace`;
    ctx.fillText(pantryExpiryDate, pad + Math.round(16 * s), pad + Math.round(166 * s));

    // Storage condition box (Pure white background)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pad + Math.round(14 * s), pad + Math.round(184 * s), w - pad * 2 - Math.round(28 * s), Math.round(28 * s));
    ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
    ctx.strokeRect(pad + Math.round(14 * s), pad + Math.round(184 * s), w - pad * 2 - Math.round(28 * s), Math.round(28 * s));

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(11 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`[SAKLAMA] ${pantryStorage}`, w / 2, pad + Math.round(203 * s));
  };

  // 6. Render Price Tag
  const renderPrice = async (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));
    const maxWidth = w - pad * 2 - Math.round(16 * s);
    
    // Dynamic product title calculation
    ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
    const titleLines = getLines(ctx, productName || 'Ürün Adı', maxWidth);
    const titleHeight = Math.max(Math.round(22 * s), titleLines.length * Math.round(19 * s));
    
    const ribbonHeight = Math.round(28 * s);
    const productTitleY = pad + ribbonHeight + Math.round(10 * s);
    const priceBoxY = productTitleY + titleHeight + Math.round(10 * s);
    const barcodeStartY = priceBoxY + Math.round(68 * s);

    // Generate Barcode with crisp bwip-js text and bars
    let barcodeCanvas: HTMLCanvasElement | null = null;
    const cleanBarcode = (productBarcode || '').trim();
    if (cleanBarcode) {
      try {
        barcodeCanvas = document.createElement('canvas');
        const isNumeric = /^\d+$/.test(cleanBarcode);
        const isEan13 = isNumeric && (cleanBarcode.length === 12 || cleanBarcode.length === 13);
        bwipjs.toCanvas(barcodeCanvas, {
          bcid: isEan13 ? 'ean13' : 'code128',
          text: cleanBarcode,
          scale: Math.max(2, Math.round(3 * s)),
          height: Math.round(12 * s),
          includetext: true,
          textsize: Math.round(11 * s),
          textxalign: 'center',
        });
      } catch (e) {
        try {
          barcodeCanvas = document.createElement('canvas');
          bwipjs.toCanvas(barcodeCanvas, {
            bcid: 'code128',
            text: cleanBarcode,
            scale: Math.max(2, Math.round(3 * s)),
            height: Math.round(12 * s),
            includetext: true,
            textsize: Math.round(11 * s),
            textxalign: 'center',
          });
        } catch (err2) {
          logger.error('Price tag barcode render error', err2);
        }
      }
    }

    let bw = 0;
    let bh = 0;
    let barcodeSectionHeight = 0;
    if (barcodeCanvas && barcodeCanvas.width > 0) {
      bw = Math.min(Math.round(260 * s), w - pad * 2 - Math.round(16 * s));
      bh = Math.round((bw * barcodeCanvas.height) / barcodeCanvas.width);
      barcodeSectionHeight = bh + Math.round(8 * s);
    }

    const totalHeight = Math.max(Math.round(280 * s), barcodeStartY + barcodeSectionHeight + pad + Math.round(14 * s));
    canvas.height = totalHeight;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvas.height);
    ctx.fillStyle = '#000000';

    // Promo Ribbon (clean text, high contrast)
    ctx.fillRect(pad, pad, w - pad * 2, ribbonHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(13 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(promoBadge || 'SÜPER İNDİRİM', w / 2, pad + Math.round(19 * s));

    // Product Title
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(14 * s)}px sans-serif`;
    ctx.textAlign = 'center';
    titleLines.forEach((l, idx) => {
      ctx.fillText(l, w / 2, productTitleY + (idx + 1) * Math.round(19 * s) - Math.round(4 * s));
    });

    // Price Box
    ctx.textAlign = 'center';
    if (oldPrice) {
      ctx.font = `${Math.round(13 * s)}px monospace`;
      const oldPriceText = `${oldPrice} ${currency}`;
      ctx.fillText(oldPriceText, w / 2, priceBoxY + Math.round(14 * s));
      const textW = ctx.measureText(oldPriceText).width;
      ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
      ctx.beginPath();
      ctx.moveTo(w / 2 - textW / 2 - 4, priceBoxY + Math.round(10 * s));
      ctx.lineTo(w / 2 + textW / 2 + 4, priceBoxY + Math.round(10 * s));
      ctx.stroke();
    }

    // New Price Huge
    ctx.font = `bold ${Math.round(28 * s)}px sans-serif`;
    ctx.fillText(`${newPrice} ${currency}`, w / 2, priceBoxY + Math.round(46 * s));

    // Draw Barcode with natural aspect ratio
    if (barcodeCanvas && bw > 0 && bh > 0) {
      ctx.drawImage(barcodeCanvas, (w - bw) / 2, barcodeStartY, bw, bh);
    }

    // Outer frame with safe bottom padding
    ctx.lineWidth = Math.max(2, Math.round(2.5 * s));
    ctx.strokeRect(pad, pad, w - pad * 2, totalHeight - pad * 2);
  };

  // 7. Render Long Article
  const renderArticle = (ctx: CanvasRenderingContext2D, w: number, canvas: HTMLCanvasElement) => {
    const s = w > 450 ? Math.min(2.8, Math.max(1, (w / 384) * 0.95)) : 1;
    const pad = Math.max(16, Math.round(18 * s));
    const maxWidth = w - pad * 2;
    
    ctx.font = `bold ${Math.round(16 * s)}px sans-serif`;
    const titleLines = getLines(ctx, articleTitle, maxWidth);
    const titleHeight = titleLines.length * Math.round(22 * s);

    ctx.font = `${Math.round(13 * s)}px sans-serif`;
    const paragraphs = articleContent.split('\n');
    let totalBodyLines = 0;
    paragraphs.forEach(p => {
      const lines = getLines(ctx, p, maxWidth);
      totalBodyLines += lines.length + 1;
    });

    const subTitleY = Math.round(30 * s) + titleHeight + Math.round(10 * s);
    const dividerY = subTitleY + Math.round(16 * s);
    const bodyStartY = dividerY + Math.round(22 * s);
    const totalHeight = bodyStartY + totalBodyLines * Math.round(20 * s) + Math.round(60 * s);
    canvas.height = totalHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, canvas.height);
    ctx.fillStyle = '#000000';

    // Title (multi-line supported)
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(16 * s)}px sans-serif`;
    titleLines.forEach((line, idx) => {
      ctx.fillText(line, w / 2, Math.round(30 * s) + idx * Math.round(22 * s));
    });

    // Subtitle & Date (dynamically positioned under the title)
    const now = new Date().toLocaleDateString('tr-TR');
    ctx.font = `${Math.round(11 * s)}px sans-serif`;
    ctx.fillText(`${articleAuthor} • ${now}`, w / 2, subTitleY);

    // Divider
    ctx.lineWidth = Math.max(1, Math.round(1 * s));
    ctx.beginPath();
    ctx.moveTo(pad, dividerY);
    ctx.lineTo(w - pad, dividerY);
    ctx.stroke();

    // Body
    ctx.textAlign = 'left';
    ctx.font = `${Math.round(13 * s)}px sans-serif`;
    let curY = bodyStartY;

    paragraphs.forEach((para) => {
      if (!para.trim()) {
        curY += Math.round(10 * s);
        return;
      }
      const lines = getLines(ctx, para, maxWidth);
      lines.forEach((line) => {
        ctx.fillText(line, pad, curY);
        curY += Math.round(20 * s);
      });
      curY += Math.round(8 * s);
    });

    // End Marker with safety margin
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(11 * s)}px monospace`;
    ctx.fillText('■ ■ ■ [SON] ■ ■ ■', w / 2, curY + Math.round(16 * s));
  };

  // Helper function to split text into wrapped lines
  function getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const lines = getLines(ctx, text, maxWidth);
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    return y + lines.length * lineHeight;
  }

  const handlePrint = () => {
    if (!livePreviewUrl) return;
    const activePro = PRO_TEMPLATES.find(p => p.id === selectedProId);
    const titles: Record<TemplateCategory, string> = {
      pro: activePro ? activePro.title : 'Profesyonel Etiket',
      todo: todoTitle,
      shipping: `Kargo - ${receiverName}`,
      wifi: `Wi-Fi Kartı (${wifiSsid})`,
      receipt: `Fiş (${storeName})`,
      pantry: `Etiket - ${pantryItem}`,
      price: `Fiyat - ${productName}`,
      article: articleTitle
    };

    let exportUrl = livePreviewUrl;
    const canvas = previewCanvasRef.current;
    // 10cm Rulo Koruması: Genişliği 800'den büyük olanlar (örn 15x10cm 1200px) 10cm kafa için 90° dikey çevrilir
    if (canvas && canvas.width > 800) {
      const rot = rotateCanvas(canvas, 90);
      exportUrl = rot.toDataURL('image/png');
      logger.info(`[OTO-DİKEY ŞABLON] 15x10cm yatay şablon 10cm rulo için 90° dikey çevrildi: ${rot.width}x${rot.height}`);
    }

    const title = titles[category] || 'Şablon Çıktısı';
    const widthMm = currentWidth <= 400 ? 57 : currentWidth <= 600 ? 80 : 100;

    if (onDirectPrint) {
      onDirectPrint(exportUrl, title, widthMm);
    } else {
      onPreviewAndPrint(exportUrl, title);
    }
  };

  const handleSaveDraft = async () => {
    const defaultTitle = category === 'pro' 
      ? (PRO_TEMPLATES.find(p => p.id === selectedProId)?.title || 'Profesyonel Şablon')
      : category.toUpperCase() + ' Şablonu';

    if (activeDraft && activeDraft.id) {
      const isUpdate = confirm(`"${activeDraft.title}" isimli taslak düzenleniyor.\n\n[Tamam] = Taslağı Güncelle (Üzerine Yaz)\n[İptal] = Yeni Taslak Olarak Kaydet`);
      if (isUpdate) {
        await historyStorage.updateDraft(activeDraft.id, {
          title: activeDraft.title,
          category,
          previewDataUrl: livePreviewUrl,
          payload: { category, selectedProId, proValues, todoTitle, senderName, wifiSsid, storeName, pantryItem, productName, articleTitle }
        });
        alert(`"${activeDraft.title}" taslağı başarıyla güncellendi!`);
        return;
      }
    }

    const customTitle = prompt('Taslak için bir isim giriniz:', activeDraft?.title || defaultTitle);
    if (!customTitle || !customTitle.trim()) return;

    await historyStorage.saveDraft({
      title: customTitle.trim(),
      category,
      previewDataUrl: livePreviewUrl,
      payload: { category, selectedProId, proValues, todoTitle, senderName, wifiSsid, storeName, pantryItem, productName, articleTitle }
    });
    alert(`"${customTitle}" taslak olarak kaydedildi!`);
  };

  // Get filtered pro templates based on sub-category filter & search
  const categoriesList = ['ALL', ...Array.from(new Set(PRO_TEMPLATES.map(t => t.category)))];
  const [proSearchTerm, setProSearchTerm] = useState('');

  const filteredProTemplates = PRO_TEMPLATES.filter(t => {
    const matchesCat = proCategoryFilter === 'ALL' || t.category === proCategoryFilter;
    const matchesSearch = !proSearchTerm.trim() || 
      t.title.toLowerCase().includes(proSearchTerm.toLowerCase()) || 
      t.tags.some(tag => tag.toLowerCase().includes(proSearchTerm.toLowerCase())) ||
      t.category.toLowerCase().includes(proSearchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeProTemplate = PRO_TEMPLATES.find(t => t.id === selectedProId) || PRO_TEMPLATES[0];
  const activeProVariables = extractVariables(activeProTemplate.text);
  const activeProVals = proValues[activeProTemplate.id] || PRO_EXAMPLES[activeProTemplate.id] || {};

  return (
    <div className="space-y-4 pb-24">
      {/* Hidden processing canvas */}
      <canvas ref={previewCanvasRef} className="hidden" />

      {/* 3'lü Sabit Üst Menü Seçeneği */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveStudioSubTab('gallery')}
          className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
            activeStudioSubTab === 'gallery'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <span className="whitespace-nowrap">Galeri</span>
        </button>
        <button
          onClick={() => setActiveStudioSubTab('edit')}
          className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
            activeStudioSubTab === 'edit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <span className="whitespace-nowrap">Düzenleme</span>
        </button>
        <button
          onClick={() => setActiveStudioSubTab('preview')}
          className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
            activeStudioSubTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <span className="whitespace-nowrap">Önizleme</span>
        </button>
      </div>

      {/* Category selector chips (shown in Gallery & Edit tabs) */}
      {activeStudioSubTab !== 'preview' && (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'pro', label: `Profesyonel (${PRO_TEMPLATES.length})`, icon: Zap },
            { id: 'todo', label: 'Yapılacak', icon: ListChecks },
            { id: 'shipping', label: 'Kargo', icon: Package },
            { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
            { id: 'receipt', label: 'Fiş/Fatura', icon: Receipt },
            { id: 'pantry', label: 'Düzenleyici', icon: Tag },
            { id: 'price', label: 'Fiyat', icon: DollarSign },
            { id: 'article', label: 'Makale', icon: FileText }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = category === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id as TemplateCategory)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white dark:bg-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} className="mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Label / Paper Size Presets & Orientation & Barcode Layout (Collapsible, Default Closed) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsPaperSizeOpen(!isPaperSizeOpen)}
          className="w-full p-3 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Sliders size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Kağıt & Etiket Boyutu Ayarları</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              {currentWidth === 800 && labelOrientation === 'portrait' ? '10x15 cm Dikey Zebra' :
               currentWidth === 800 && labelOrientation === 'landscape' ? '10x15 cm Yatay Zebra' :
               currentWidth === 1200 ? '15x10 cm Yatay Zebra' :
               currentWidth === 576 ? '80mm POS Termal' :
               currentWidth === 384 ? '57mm Mini Termal' : `${currentWidth}px`}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-medium">
            <span>{isPaperSizeOpen ? 'Kapat' : 'Değiştir'}</span>
            {isPaperSizeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {isPaperSizeOpen && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 text-xs animate-in fade-in duration-200">
            {/* Kağıt Boyutları */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-400 text-[11px]">Etiket Standartları:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { width: 800, label: '10x15 cm Dikey Zebra (800x1200px - 100x150mm)', short: '📦 10x15 cm Dikey (Zebra)', orient: 'portrait' as const },
                  { width: 800, label: '10x10 cm Kare Zebra (800x800px - 100x100mm)', short: '🔲 10x10 cm Kare (Zebra)', orient: 'portrait' as const },
                  { width: 1200, label: '15x10 cm Yatay Zebra (1200x800px - 150x100mm)', short: '🏷️ 15x10 cm Yatay', orient: 'landscape' as const },
                  { width: 576, label: '80mm POS Termal (576px)', short: '📜 80mm POS', orient: 'portrait' as const },
                  { width: 384, label: '57mm Mini Termal (384px)', short: '📄 57mm Mini', orient: 'portrait' as const }
                ].map((preset) => (
                  <button
                    key={`${preset.width}-${preset.short}`}
                    onClick={() => handleSetWidth(preset.width, preset.orient)}
                    title={preset.label}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      currentWidth === preset.width && (preset.short.includes('Yatay') ? labelOrientation === 'landscape' : labelOrientation === 'portrait')
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {preset.short}
                  </button>
                ))}
              </div>
            </div>

            {/* Yönlendirme (Orientation) ve Barkod Yönü (Barcode Layout) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              {/* Yönlendirme */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Etiket Yönü:</span>
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => handleOrientationChange('portrait')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      labelOrientation === 'portrait'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    📱 Dikey (Boyuna 15cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrientationChange('landscape')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      labelOrientation === 'landscape'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                    }`}
                  >
                    🖥️ Yatay (15x10 cm)
                  </button>
                </div>
              </div>

              {/* Barkod Düzeni & Yönü */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-500">Barkod Düzeni:</span>
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
                  {[
                    { id: 'auto', label: '⚡ Otomatik' },
                    { id: 'horizontal', label: '➖ Yatay (0°)' },
                    { id: 'vertical-side', label: '📑 Sağ Kenar (90°)' },
                    { id: 'vertical', label: '🔄 Dikey (90°)' }
                  ].map((bMode) => (
                    <button
                      key={bMode.id}
                      type="button"
                      onClick={() => setBarcodeLayoutMode(bMode.id as any)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                        barcodeLayoutMode === bMode.id
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {bMode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. TAB: Şablon Galerisi (Pinterest Visual Masonry Grid) */}
      {activeStudioSubTab === 'gallery' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Şablon veya sektör ara (örn: kargo, depo, kahve, gıda, bilet)..."
                value={proSearchTerm}
                onChange={(e) => setProSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              {proSearchTerm && (
                <button
                  onClick={() => setProSearchTerm('')}
                  className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0">
              {filteredProTemplates.length} Görsel Şablon
            </span>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categoriesList.map((cat) => {
              const isSelected = proCategoryFilter === cat;
              const catCount = cat === 'ALL' ? PRO_TEMPLATES.length : PRO_TEMPLATES.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setProCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>{cat === 'ALL' ? 'Tüm Şablonlar' : cat}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Pinterest Visual Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProTemplates.map((tpl) => (
              <TemplateThumbnailCard
                key={tpl.id}
                template={tpl}
                isSelected={selectedProId === tpl.id}
                pageWidth={currentWidth}
                onSelect={() => {
                  setSelectedProId(tpl.id);
                  setCategory('pro');
                  if (!proValues[tpl.id]) {
                    setProValues((prev) => ({ ...prev, [tpl.id]: PRO_EXAMPLES[tpl.id] || {} }));
                  }
                  setActiveStudioSubTab('edit');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. TAB: Düzenleme & Form */}
      {activeStudioSubTab === 'edit' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start animate-in fade-in duration-200">
          {/* Form Controls Section */}
          <Card className="p-4 rounded-xl space-y-3 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs">
          {category === 'pro' && (
            <div className="space-y-3">
              {/* Pro Search Input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Şablon veya sektör ara (örn: kargo, depo, kahve, bilet)..."
                  value={proSearchTerm}
                  onChange={(e) => setProSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-7 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
                />
                {proSearchTerm && (
                  <button
                    onClick={() => setProSearchTerm('')}
                    className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Pro Sub-Category Selector Carousel Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
                  <span>Kategoriler</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {proCategoryFilter === 'ALL' ? `Tüm Şablonlar (${PRO_TEMPLATES.length})` : proCategoryFilter}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-[11px]">
                  {categoriesList.map(cat => {
                    const isSelected = proCategoryFilter === cat;
                    const catCount = cat === 'ALL' ? PRO_TEMPLATES.length : PRO_TEMPLATES.filter(t => t.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setProCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{cat === 'ALL' ? 'Tümü' : cat}</span>
                        <span className={`px-1 py-0.2 rounded-full text-[9px] ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          {catCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Card Selectors */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-0.5">
                  <span>Seçilebilir Şablonlar ({filteredProTemplates.length})</span>
                  {proSearchTerm && (
                    <span className="text-amber-600 dark:text-amber-400">Arama sonucu</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {filteredProTemplates.map(t => {
                    const isSel = selectedProId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedProId(t.id);
                          if (!proValues[t.id]) {
                            setProValues(prev => ({ ...prev, [t.id]: PRO_EXAMPLES[t.id] || {} }));
                          }
                        }}
                        className={`text-left p-2 rounded-lg border text-xs transition-all relative overflow-hidden group ${
                          isSel
                            ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-100 font-bold shadow-xs ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="block truncate text-[11px] leading-tight font-bold">{t.title}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="inline-block text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[85%]">
                            {t.category}
                          </span>
                          {isSel && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Draft Indicator Banner */}
              {activeDraft && (
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
                      📌 Taslak: "{activeDraft.title}"
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Güncelle
                    </button>
                    {onClearActiveDraft && (
                      <button
                        type="button"
                        onClick={onClearActiveDraft}
                        className="p-1 rounded text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        title="Taslak Modundan Çık"
                      >
                        <XIcon size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Variables Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[50%]">
                    {category === 'pro' ? `${activeProTemplate.title} — Form` : `${String(category).toUpperCase()} — Form`}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={() => {
                        if (category === 'pro') {
                          const clearedVals: Record<string, string> = {};
                          activeProVariables.forEach(v => { clearedVals[v.name] = ''; });
                          setProValues(prev => ({ ...prev, [activeProTemplate.id]: clearedVals }));
                        } else if (category === 'todo') {
                          setTodoTitle(''); setTodoDate(''); setTodoItems([]);
                        } else if (category === 'shipping') {
                          setSenderName(''); setSenderPhone(''); setSenderAddress(''); setReceiverName(''); setReceiverPhone(''); setReceiverAddress(''); setTrackingNumber('');
                        } else if (category === 'wifi') {
                          setWifiSsid(''); setWifiPassword(''); setWifiMessage('');
                        } else if (category === 'receipt') {
                          setStoreName(''); setStoreSub(''); setReceiptNumber(''); setReceiptItems([]); setReceiptTax(0); setReceiptFooter('');
                        } else if (category === 'pantry') {
                          setPantryItem(''); setPantryCategory(''); setPantryPackDate(''); setPantryExpiryDate(''); setPantryStorage('');
                        } else if (category === 'price') {
                          setProductName(''); setOldPrice(''); setNewPrice(''); setPromoBadge(''); setProductBarcode('');
                        } else if (category === 'article') {
                          setArticleTitle(''); setArticleAuthor(''); setArticleContent('');
                        }
                      }}
                      className="h-6 text-[10px] font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900/50 px-2 gap-1 rounded-md"
                      title="Tüm form kutularını temizler"
                    >
                      <Eraser size={11} /> Formu Temizle
                    </Button>
                    {category === 'pro' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => {
                          setProValues(prev => ({ ...prev, [activeProTemplate.id]: PRO_EXAMPLES[activeProTemplate.id] || {} }));
                        }}
                        className="h-6 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 px-1.5 gap-1"
                        title="Örnek verileri yükler"
                      >
                        <Zap size={11} /> Örnek Doldur
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {activeProVariables.map(v => {
                    const val = activeProVals[v.name] ?? '';
                    const updateVal = (newVal: string) => {
                      setProValues(prev => ({
                        ...prev,
                        [activeProTemplate.id]: {
                          ...(prev[activeProTemplate.id] || {}),
                          [v.name]: newVal
                        }
                      }));
                    };

                    if (v.type === 'coksatir') {
                      return (
                        <div key={v.name} className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-500 uppercase">{v.name}</Label>
                          <textarea
                            value={val}
                            onChange={e => updateVal(e.target.value)}
                            rows={2}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 resize-none font-sans"
                          />
                        </div>
                      );
                    }

                    if (v.type === 'tarih') {
                      return (
                        <div key={v.name} className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-500 uppercase">{v.name}</Label>
                          <Input
                            type="date"
                            value={val}
                            onChange={e => updateVal(e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={v.name} className="space-y-1">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase">{v.name}</Label>
                        <Input
                          value={val}
                          onChange={e => updateVal(e.target.value)}
                          className="h-8 text-xs rounded-lg"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {category === 'todo' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Liste Başlığı</Label>
                <Input value={todoTitle} onChange={e => setTodoTitle(e.target.value)} className="h-8 text-xs rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Tarih</Label>
                  <Input type="date" value={todoDate} onChange={e => setTodoDate(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Kutu Stili</Label>
                  <Select value={todoStyle} onValueChange={(v: any) => v && setTodoStyle(v)}>
                    <SelectTrigger className="h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkbox">Kare Kutucuk [ ]</SelectItem>
                      <SelectItem value="circle">Yuvarlak O</SelectItem>
                      <SelectItem value="numbered">Numaralı 1. 2.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Maddeler ({todoItems.length})</Label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {todoItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        value={item}
                        onChange={e => {
                          const updated = [...todoItems];
                          updated[idx] = e.target.value;
                          setTodoItems(updated);
                        }}
                        className="h-8 text-xs rounded-lg flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setTodoItems(todoItems.filter((_, i) => i !== idx))}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTodoItems([...todoItems, 'Yeni görev'])}
                  className="w-full text-xs font-bold gap-1 rounded-lg h-8 mt-1"
                >
                  <Plus size={13} /> Madde Ekle
                </Button>
              </div>
            </div>
          )}

          {category === 'shipping' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gönderici Bilgileri</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Ad / Firma" value={senderName} onChange={e => setSenderName(e.target.value)} className="h-8 text-xs rounded-lg" />
                  <Input placeholder="Telefon" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
                <Input placeholder="Adres" value={senderAddress} onChange={e => setSenderAddress(e.target.value)} className="h-8 text-xs rounded-lg" />
              </div>

              <div className="p-2.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-lg border border-teal-200 dark:border-teal-900/50 space-y-2">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">Alıcı Bilgileri</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Alıcı Adı" value={receiverName} onChange={e => setReceiverName(e.target.value)} className="h-8 text-xs rounded-lg" />
                  <Input placeholder="Telefon" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
                <Input placeholder="Tam Adres" value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} className="h-8 text-xs rounded-lg" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Takip No</Label>
                  <Input value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="h-8 text-xs rounded-lg font-mono" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={isFragile} onChange={e => setIsFragile(e.target.checked)} className="rounded" />
                    ⚠️ Kırılacak Uyarısı
                  </label>
                </div>
              </div>
            </div>
          )}

          {category === 'wifi' && (
            <div className="space-y-3">
              <div>
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Ağ Adı (SSID)</Label>
                <Input value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className="h-8 text-xs rounded-lg font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Wi-Fi Şifresi</Label>
                  <Input value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="h-8 text-xs rounded-lg font-mono" />
                </div>
                <div>
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Güvenlik Türü</Label>
                  <Select value={wifiSecurity} onValueChange={(v: any) => v && setWifiSecurity(v)}>
                    <SelectTrigger className="h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA / WPA2 / WPA3</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">Şifresiz (Açık)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Alt Mesaj</Label>
                <Input value={wifiMessage} onChange={e => setWifiMessage(e.target.value)} className="h-8 text-xs rounded-lg" />
              </div>
            </div>
          )}

          {category === 'receipt' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">İşletme Adı</Label>
                  <Input value={storeName} onChange={e => setStoreName(e.target.value)} className="h-8 text-xs rounded-lg font-bold" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Fiş No</Label>
                  <Input value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Adres / Alt Başlık</Label>
                <Input value={storeSub} onChange={e => setStoreSub(e.target.value)} className="h-8 text-xs rounded-lg" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Kalemler</Label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {receiptItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Input
                        placeholder="Ürün"
                        value={item.name}
                        onChange={e => {
                          const u = [...receiptItems];
                          u[idx].name = e.target.value;
                          setReceiptItems(u);
                        }}
                        className="h-8 text-xs rounded-lg flex-2"
                      />
                      <Input
                        type="number"
                        placeholder="Adet"
                        value={item.qty}
                        onChange={e => {
                          const u = [...receiptItems];
                          u[idx].qty = Number(e.target.value) || 1;
                          setReceiptItems(u);
                        }}
                        className="h-8 text-xs rounded-lg w-14 text-center"
                      />
                      <Input
                        type="number"
                        placeholder="Fiyat"
                        value={item.price}
                        onChange={e => {
                          const u = [...receiptItems];
                          u[idx].price = Number(e.target.value) || 0;
                          setReceiptItems(u);
                        }}
                        className="h-8 text-xs rounded-lg w-16 text-right"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setReceiptItems(receiptItems.filter((_, i) => i !== idx))}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReceiptItems([...receiptItems, { name: 'Yeni Kalem', qty: 1, price: 50 }])}
                  className="w-full text-xs font-bold gap-1 rounded-lg h-8"
                >
                  <Plus size={13} /> Kalem Ekle
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">KDV Oranı (%)</Label>
                  <Input type="number" value={receiptTax} onChange={e => setReceiptTax(Number(e.target.value) || 0)} className="h-8 text-xs rounded-lg" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Teşekkür Notu</Label>
                  <Input value={receiptFooter} onChange={e => setReceiptFooter(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
              </div>
            </div>
          )}

          {category === 'pantry' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Ürün Adı</Label>
                  <Input value={pantryItem} onChange={e => setPantryItem(e.target.value)} className="h-8 text-xs rounded-lg font-bold" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</Label>
                  <Input value={pantryCategory} onChange={e => setPantryCategory(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Paketleme Tarihi</Label>
                  <Input type="date" value={pantryPackDate} onChange={e => setPantryPackDate(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Son Tüketim (TETT)</Label>
                  <Input type="date" value={pantryExpiryDate} onChange={e => setPantryExpiryDate(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Saklama Koşulu</Label>
                <Input value={pantryStorage} onChange={e => setPantryStorage(e.target.value)} className="h-8 text-xs rounded-lg" />
              </div>
            </div>
          )}

          {category === 'price' && (
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] font-bold text-slate-500 uppercase">Ürün Adı</Label>
                <Input value={productName} onChange={e => setProductName(e.target.value)} className="h-8 text-[16px] sm:text-xs rounded-lg font-bold" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Eski Fiyat</Label>
                  <Input value={oldPrice} onChange={e => setOldPrice(e.target.value)} className="h-8 text-[16px] sm:text-xs rounded-lg" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Yeni Fiyat</Label>
                  <Input value={newPrice} onChange={e => setNewPrice(e.target.value)} className="h-8 text-[16px] sm:text-xs rounded-lg font-bold" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Birim</Label>
                  <Input value={currency} onChange={e => setCurrency(e.target.value)} className="h-8 text-[16px] sm:text-xs rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Rozet / Başlık</Label>
                  <Input value={promoBadge} onChange={e => setPromoBadge(e.target.value)} className="h-8 text-[16px] sm:text-xs rounded-lg" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Barkod No</Label>
                  <Input value={productBarcode} onChange={e => setProductBarcode(e.target.value)} className="h-8 text-[16px] sm:text-xs rounded-lg font-mono" />
                </div>
              </div>
            </div>
          )}

          {category === 'article' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Makale Başlığı</Label>
                  <Input value={articleTitle} onChange={e => setArticleTitle(e.target.value)} className="h-8 text-xs rounded-lg font-bold" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500 uppercase">Yazar / Kaynak</Label>
                  <Input value={articleAuthor} onChange={e => setArticleAuthor(e.target.value)} className="h-8 text-xs rounded-lg" />
                </div>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-slate-500 uppercase">İçerik Metni</Label>
                <textarea
                  value={articleContent}
                  onChange={e => setArticleContent(e.target.value)}
                  onInput={e => {
                    const target = e.currentTarget;
                    target.style.height = 'auto';
                    target.style.height = `${Math.max(140, target.scrollHeight)}px`;
                  }}
                  rows={6}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 resize-y font-sans leading-relaxed"
                  placeholder="Yazdırmak istediğiniz uzun metni buraya yapıştırın..."
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-10"
            >
              <BookmarkPlus size={14} /> Taslak Kaydet
            </Button>
            <Button
              onClick={() => setActiveStudioSubTab('preview')}
              className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold gap-1.5 h-10 shadow-xs cursor-pointer"
            >
              <Eye size={15} /> Önizleme ➔
            </Button>
          </div>
        </Card>

        {/* Live Thermal Paper Preview Side Panel */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between px-1 gap-1">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={13} className="text-teal-500" /> Baskı Önizlemesi
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {labelOrientation === 'portrait'
                  ? (currentWidth <= 400 ? '📱 57mm Dikey' : currentWidth <= 600 ? '📱 80mm Dikey' : '📱 10x15 cm Dikey')
                  : '🖥️ Yatay'}
              </span>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-3 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2 overflow-hidden">
            {(() => {
              const canvas = previewCanvasRef.current;
              const w = canvas?.width || currentWidth;
              const h = canvas?.height || (labelOrientation === 'portrait' ? 1200 : 800);
              return <RulerDimensionBadge widthPx={w} heightPx={h} label="Şablon Etiket Ölçüsü" />;
            })()}

            {livePreviewUrl ? (
              <div className="bg-white dark:bg-slate-950 rounded-md p-1.5 shadow-xs max-h-[480px] overflow-y-auto w-full flex justify-center items-start border border-slate-200 dark:border-slate-800">
                <img
                  src={livePreviewUrl}
                  alt="Thermal preview"
                  className="w-full max-w-[340px] [image-rendering:pixelated] rounded shadow-xs bg-white"
                />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500 text-xs">
                Yükleniyor...
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 3. TAB: Önizleme & Yazdır */}
      {activeStudioSubTab === 'preview' && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3 overflow-hidden">
            <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 px-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PrinterCheck size={16} className="text-teal-600 dark:text-teal-400" /> Tam Ekran Şablon Önizleme
              </span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                {currentWidth}px ({currentWidth <= 400 ? '57mm Mini Termal' : currentWidth <= 600 ? '80mm POS Termal' : currentWidth === 800 ? '10x15 cm Zebra' : currentWidth === 1200 ? '15x10 cm Zebra' : 'Termal'})
              </span>
            </div>

            {(() => {
              const canvas = previewCanvasRef.current;
              const w = canvas?.width || currentWidth;
              const h = canvas?.height || (labelOrientation === 'portrait' ? 1200 : 800);
              return <RulerDimensionBadge widthPx={w} heightPx={h} label="Şablon Etiket Ölçüsü" />;
            })()}

            {livePreviewUrl ? (
              <div className="bg-white dark:bg-slate-950 rounded-xl p-3 shadow-md max-h-[580px] overflow-y-auto w-full flex justify-center items-start border border-slate-200 dark:border-slate-800">
                <img
                  src={livePreviewUrl}
                  alt="Thermal preview"
                  className="w-full max-w-[420px] [image-rendering:pixelated] rounded shadow-md bg-white"
                />
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
                Önizleme yükleniyor...
              </div>
            )}

            <div className="w-full pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="flex-1 rounded-xl text-xs font-bold gap-1.5 h-11 border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer"
              >
                <BookmarkPlus size={15} /> Taslak Kaydet
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold gap-2 h-11 shadow-lg cursor-pointer"
              >
                <PrinterCheck size={18} /> Yazdır (Baskı Al)
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
            <Zap size={16} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Zebra 10cm Rulo Koruması:</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">
                {currentWidth > 800 || labelOrientation === 'landscape'
                  ? "Yatay tasarım (15x10cm), 10cm'lik rulo yazıcı kafasına tam oturması için baskıda otomatik 90° dikey yönde (10x15cm) beslenir."
                  : "10x15cm (100x150mm) ve 10x10cm etiketler 10cm rulo genişliğine ve 15cm uzunluğuna göre sıfır kayma ile doğrudan basılır."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sabit 3'lü Alt Menü Çubuğu (Aktif Olan Başlık Gösterir, Diğerleri Minimal İkondur) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveStudioSubTab('gallery')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeStudioSubTab === 'gallery'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Şablon Galerisi"
        >
          <LayoutGrid size={15} className="shrink-0" />
          {activeStudioSubTab === 'gallery' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Galeri</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioSubTab('edit')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeStudioSubTab === 'edit'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Şablon Düzenleyici"
        >
          <Sliders size={15} className="shrink-0" />
          {activeStudioSubTab === 'edit' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Düzenleme</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioSubTab('preview')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeStudioSubTab === 'preview'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Yazdırma Önizleme"
        >
          <Eye size={15} className="shrink-0" />
          {activeStudioSubTab === 'preview' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Önizleme</span>
          )}
        </button>
      </div>

      {/* Yukarı Çık Yüzen Butonu (Scroll to Top) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:right-6 z-50 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer border border-indigo-400/30 backdrop-blur-md"
          title="Sayfa Başına Dön"
          aria-label="Sayfa Başına Dön"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
};
