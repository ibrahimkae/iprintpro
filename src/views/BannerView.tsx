import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import bwipjs from 'bwip-js';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  X, Minus, Plus, Tag, Columns, Sparkles, Eye,
  AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter,
  ShoppingBag, Package, Flame, Star, AlertTriangle, Coffee, Gift, RefreshCw, Check, Ruler,
  Printer, ChevronDown, ChevronUp, SlidersHorizontal
} from 'lucide-react';
import { logger } from '../lib/logger';
import { historyStorage } from '../lib/history-storage';
import { Bookmark } from 'lucide-react';
import { calculateLabelDimensions } from '../lib/dimension-utils';
import { RulerDimensionBadge } from '../components/RulerDimensionBadge';

export interface BannerViewProps {
  bannerText: string;
  setBannerText: (s: string) => void;
  bannerType: 'banner' | 'etiket';
  setBannerType: (t: 'banner' | 'etiket') => void;
  bannerOrientation: 'horizontal' | 'vertical';
  setBannerOrientation: (o: 'horizontal' | 'vertical') => void;
  bannerFontSize: number;
  setBannerFontSize: React.Dispatch<React.SetStateAction<number>>;
  previewImage: string | null;
  onApplyPreview?: (dataUrl: string) => void;
  onGeneratePreview: () => void;
  onBack: () => void;
  activeDraft?: { id: string; title: string; category: string } | null;
  onClearActiveDraft?: () => void;
}

export function BannerView(p: BannerViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'shelf' | 'campaign' | 'warehouse' | 'classic'>('shelf');
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Raf Etiketi State
  const [shelfTitle, setShelfTitle] = useState('ORGANİK SIZMA ZEYTİNYAĞI');
  const [shelfSubtitle, setShelfSubtitle] = useState('1 Litre Cam Şişe • Soğuk Sıkım');
  const [shelfOldPrice, setShelfOldPrice] = useState('389.00 ₺');
  const [shelfPrice, setShelfPrice] = useState('269.90 ₺');
  const [shelfDiscountBadge, setShelfDiscountBadge] = useState('-%30 İNDİRİM');
  const [shelfBarcode, setShelfBarcode] = useState('8690123456789');
  const [shelfDate, setShelfDate] = useState('Fiyat Değişiklik: 26.08.2026');

  // Kampanya / Vitrin State
  const [campBadge, setCampBadge] = useState('🔥 GÜNÜN FIRSATI');
  const [campMainText, setCampMainText] = useState('%50 İNDİRİM');
  const [campSubText, setCampSubText] = useState('SEÇİLİ TÜM ÜRÜNLERDE GEÇERLİDİR');
  const [campTheme, setCampTheme] = useState<'white' | 'inverted' | 'striped'>('inverted');
  const [campBorder, setCampBorder] = useState<'double' | 'dashed' | 'solid' | 'badge'>('double');

  // Depo / Koli State
  const [whLocation, setWhLocation] = useState('RAF: A-14 / KAT: 3');
  const [whTitle, setWhTitle] = useState('ELEKTRONİK YEDEK PARÇA');
  const [whQty, setWhQty] = useState('12 ADET');
  const [whWarning, setWhWarning] = useState('⚠️ DİKKAT: KIRILABİLİR ÜRÜN');
  const [whBarcode, setWhBarcode] = useState('KOL-884920');

  // Klasik Banner State
  const [classicInvert, setClassicInvert] = useState(false);
  const [classicBorder, setClassicBorder] = useState<'none' | 'box' | 'double'>('box');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

  // Sync with main banner text when changed
  useEffect(() => {
    if (activeTab === 'classic') {
      if (p.bannerText) {
        // use p.bannerText
      }
    }
  }, [p.bannerText, activeTab]);

  // Generate Live Thermal Preview Canvas
  const renderLivePreview = () => {
    const width = 384;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTab === 'shelf') {
      // 1. Raf Etiketi Çizimi
      const height = 280;
      canvas.height = height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Ana dış çerçeve
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // Üst Başlık Şeridi
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(shelfTitle, width / 2, 14);

      // Alt detay
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#222222';
      ctx.fillText(shelfSubtitle, width / 2, 34);

      // Ayırıcı çizgi
      ctx.beginPath();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.moveTo(12, 52);
      ctx.lineTo(width - 12, 52);
      ctx.stroke();

      // Fiyat Alanı
      // Sol taraf: Eski Fiyat ve İndirim Rozeti
      if (shelfDiscountBadge) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(16, 60, 110, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(shelfDiscountBadge, 71, 64);
      }

      if (shelfOldPrice) {
        ctx.fillStyle = '#000000';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Eski: ${shelfOldPrice}`, 18, 92);
        // Üstü çizili
        const oldW = ctx.measureText(`Eski: ${shelfOldPrice}`).width;
        ctx.beginPath();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.moveTo(16, 99);
        ctx.lineTo(18 + oldW + 4, 99);
        ctx.stroke();
      }

      // Sağ taraf: Büyük İndirimli Fiyat
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(shelfPrice, width - 18, 62);

      // Barkod Çizimi
      if (shelfBarcode) {
        try {
          const tempCanvas = document.createElement('canvas');
          bwipjs.toCanvas(tempCanvas, {
            bcid: 'code128',
            text: shelfBarcode.trim(),
            scale: 2.2,
            height: 10,
            includetext: true,
            textsize: 9,
            textxalign: 'center'
          });
          const bw = Math.min(320, tempCanvas.width);
          const bh = Math.round((bw * tempCanvas.height) / tempCanvas.width);
          ctx.drawImage(tempCanvas, (width - bw) / 2, 128, bw, bh);
        } catch (e) {
          logger.error('Shelf barcode render error', e);
        }
      }

      // Alt Bilgi / Tarih
      ctx.fillStyle = '#000000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(shelfDate, width / 2, height - 20);

    } else if (activeTab === 'campaign') {
      // 2. Kampanya & Vitrin Banner Çizimi
      const height = 240;
      canvas.height = height;

      if (campTheme === 'inverted') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // İç Beyaz Çerçeve
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = campBorder === 'double' ? 3 : 2;
        if (campBorder === 'dashed') ctx.setLineDash([8, 4]);
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.setLineDash([]);

        if (campBorder === 'double') {
          ctx.lineWidth = 1;
          ctx.strokeRect(14, 14, width - 28, height - 28);
        }

        // Üst Rozet
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(campBadge, width / 2, 24);

        // Ana Büyük Metin
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(campMainText, width / 2, 70);

        // Alt Slogan
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(campSubText, width / 2, 140);

        // Alt Yıldızlar
        ctx.font = '14px sans-serif';
        ctx.fillText('★ ★ ★ ★ ★', width / 2, 185);

      } else {
        // Beyaz Zemin Kampanya
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, width - 16, height - 16);

        // Üst Siyah Rozet Bandı
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 10, width - 20, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(campBadge, width / 2, 26);

        // Ana Başlık
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 42px sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(campMainText, width / 2, 75);

        // Alt Çizgi ve Slogan
        ctx.beginPath();
        ctx.moveTo(30, 145);
        ctx.lineTo(width - 30, 145);
        ctx.stroke();

        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(campSubText, width / 2, 160);

        ctx.font = '11px sans-serif';
        ctx.fillText('Sinirli Süre • Kaçırmayın', width / 2, 195);
      }

    } else if (activeTab === 'warehouse') {
      // 3. Depo / Koli Konum Etiketi
      const height = 270;
      canvas.height = height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Dış Çerçeve
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // Üst Siyah Konum Kutusu
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, 8, width - 16, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(whLocation, width / 2, 28);

      // Ürün Başlığı & Adet
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 18px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(whTitle, width / 2, 60);

      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`MİKTAR: ${whQty}`, width / 2, 88);

      // Uyarı Bandı
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(16, 116, width - 32, 24);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 116, width - 32, 24);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(whWarning, width / 2, 121);

      // Koli Barkodu
      if (whBarcode) {
        try {
          const tempCanvas = document.createElement('canvas');
          bwipjs.toCanvas(tempCanvas, {
            bcid: 'code128',
            text: whBarcode.trim(),
            scale: 2.2,
            height: 12,
            includetext: true,
            textsize: 10,
            textxalign: 'center'
          });
          const bw = Math.min(300, tempCanvas.width);
          const bh = Math.round((bw * tempCanvas.height) / tempCanvas.width);
          ctx.drawImage(tempCanvas, (width - bw) / 2, 150, bw, bh);
        } catch (e) {
          logger.error('Warehouse barcode render error', e);
        }
      }

    } else {
      // 4. Klasik Serbest Banner
      const textToPrint = p.bannerText || 'ÖRNEK BANNER YAZISI';
      ctx.font = `bold ${p.bannerFontSize}px sans-serif`;

      if (p.bannerType === 'etiket') {
        if (p.bannerOrientation === 'horizontal') {
          const h = Math.max(90, p.bannerFontSize + 50);
          canvas.height = h;
          ctx.fillStyle = classicInvert ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, width, h);

          if (classicBorder !== 'none') {
            ctx.strokeStyle = classicInvert ? '#ffffff' : '#000000';
            ctx.lineWidth = classicBorder === 'double' ? 3 : 2;
            ctx.strokeRect(8, 8, width - 16, h - 16);
          }

          ctx.fillStyle = classicInvert ? '#ffffff' : '#000000';
          ctx.font = `bold ${p.bannerFontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(textToPrint, width / 2, h / 2);
        } else {
          const chars = textToPrint.split('');
          const h = Math.max(120, chars.length * (p.bannerFontSize * 1.15) + 50);
          canvas.height = h;
          ctx.fillStyle = classicInvert ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, width, h);

          if (classicBorder !== 'none') {
            ctx.strokeStyle = classicInvert ? '#ffffff' : '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(8, 8, width - 16, h - 16);
          }

          ctx.fillStyle = classicInvert ? '#ffffff' : '#000000';
          ctx.font = `bold ${p.bannerFontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          chars.forEach((char, i) => {
            ctx.fillText(char, width / 2, 24 + i * (p.bannerFontSize * 1.15));
          });
        }
      } else {
        // Banner modu (şerit)
        if (p.bannerOrientation === 'horizontal') {
          const textWidth = ctx.measureText(textToPrint).width;
          const h = textWidth + 60;
          canvas.height = h;
          ctx.fillStyle = classicInvert ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, width, h);

          ctx.save();
          ctx.translate(width / 2, h / 2);
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = classicInvert ? '#ffffff' : '#000000';
          ctx.font = `bold ${p.bannerFontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(textToPrint, 0, 0);
          ctx.restore();
        } else {
          const chars = textToPrint.split('');
          const h = chars.length * (p.bannerFontSize * 1.18) + 50;
          canvas.height = h;
          ctx.fillStyle = classicInvert ? '#000000' : '#ffffff';
          ctx.fillRect(0, 0, width, h);

          ctx.fillStyle = classicInvert ? '#ffffff' : '#000000';
          ctx.font = `bold ${p.bannerFontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          chars.forEach((char, i) => {
            ctx.fillText(char, width / 2, 24 + i * (p.bannerFontSize * 1.18));
          });
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    setLivePreviewUrl(dataUrl);
    return dataUrl;
  };

  // Re-render preview whenever form fields change
  useEffect(() => {
    const url = renderLivePreview();
    if (url && p.onApplyPreview) {
      p.onApplyPreview(url);
    }
  }, [
    activeTab,
    shelfTitle, shelfSubtitle, shelfOldPrice, shelfPrice, shelfDiscountBadge, shelfBarcode, shelfDate,
    campBadge, campMainText, campSubText, campTheme, campBorder,
    whLocation, whTitle, whQty, whWarning, whBarcode,
    p.bannerText, p.bannerFontSize, p.bannerType, p.bannerOrientation, classicInvert, classicBorder
  ]);

  const handlePrintClick = () => {
    const freshUrl = renderLivePreview();
    const urlToUse = freshUrl || livePreviewUrl;
    if (urlToUse && p.onApplyPreview) {
      p.onApplyPreview(urlToUse);
    }
    p.onGeneratePreview();
  };

  const handleSaveBannerDraft = async () => {
    const defaultTitle = activeTab === 'shelf' ? `Raf Etiketi - ${shelfTitle.slice(0, 15)}` :
      activeTab === 'campaign' ? `Kampanya - ${campMainText.slice(0, 15)}` :
      activeTab === 'warehouse' ? `Depo Etiketi - ${whTitle.slice(0, 15)}` :
      `Banner - ${(p.bannerText || 'Serbest').slice(0, 15)}`;

    if (p.activeDraft && p.activeDraft.id) {
      const isUpdate = confirm(`"${p.activeDraft.title}" taslağı düzenleniyor.\n\n[Tamam] = Taslağı Güncelle\n[İptal] = Yeni Taslak Olarak Kaydet`);
      if (isUpdate) {
        await historyStorage.updateDraft(p.activeDraft.id, {
          title: p.activeDraft.title,
          category: 'tools',
          previewDataUrl: livePreviewUrl || undefined,
          payload: {
            activeTab, shelfTitle, shelfSubtitle, shelfOldPrice, shelfPrice, shelfDiscountBadge, shelfBarcode, shelfDate,
            campBadge, campMainText, campSubText, campTheme, campBorder,
            whLocation, whTitle, whQty, whWarning, whBarcode,
            bannerText: p.bannerText, bannerFontSize: p.bannerFontSize, bannerType: p.bannerType, bannerOrientation: p.bannerOrientation, classicInvert, classicBorder
          }
        });
        alert(`"${p.activeDraft.title}" taslağı güncellendi!`);
        return;
      }
    }

    const title = prompt('Taslak için bir başlık girin:', p.activeDraft?.title || defaultTitle);
    if (!title || !title.trim()) return;

    await historyStorage.saveDraft({
      title: title.trim(),
      category: 'tools',
      previewDataUrl: livePreviewUrl || undefined,
      payload: {
        activeTab, shelfTitle, shelfSubtitle, shelfOldPrice, shelfPrice, shelfDiscountBadge, shelfBarcode, shelfDate,
        campBadge, campMainText, campSubText, campTheme, campBorder,
        whLocation, whTitle, whQty, whWarning, whBarcode,
        bannerText: p.bannerText, bannerFontSize: p.bannerFontSize, bannerType: p.bannerType, bannerOrientation: p.bannerOrientation, classicInvert, classicBorder
      }
    });
    alert(`"${title.trim()}" taslak olarak kaydedildi!`);
  };

  return (
    <motion.div key="banner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pb-20">
      {/* Active Draft Indicator Banner */}
      {p.activeDraft && (
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
              📌 Banner/Etiket Taslağı: "{p.activeDraft.title}"
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleSaveBannerDraft}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              Taslağı Güncelle
            </button>
            {p.onClearActiveDraft && (
              <button
                type="button"
                onClick={p.onClearActiveDraft}
                className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                title="Taslak Modundan Çık"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={p.onBack} className="rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 dark:text-slate-200 text-xs h-8">
          <X size={14} className="mr-1.5" /> {t('cancel')}
        </Button>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveBannerDraft}
            className="h-8 text-xs font-bold gap-1 rounded-lg border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50"
          >
            <Bookmark size={13} /> Taslak Kaydet
          </Button>
          <Button onClick={handlePrintClick} className="rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 text-white font-bold text-xs h-8 px-3.5 shadow-sm gap-1.5 shrink-0 cursor-pointer">
            <Printer size={13} /> Yazdır
          </Button>
        </div>
      </div>

      {/* Main Tabs for Banner & Shelf Modes */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        {/* CANLI TERMAL ÖNİZLEME PENCERESİ (ÜSTTE) */}
        {livePreviewUrl && (
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center overflow-hidden shadow-2xs space-y-2 mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 font-bold">
                <Eye size={13} className="text-teal-600 dark:text-teal-400" /> Baskı Önizlemesi
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[9px] flex items-center gap-1 font-bold">
                <Check size={11} /> Hazır
              </span>
            </div>

            {/* Minimalist Ruler Dimension Badge - Single Line Without Roll Label */}
            {(() => {
              const h = canvasRef.current?.height || 280;
              return <RulerDimensionBadge widthPx={384} heightPx={h} label="Pankart Etiket Ölçüsü" hideRollLabel className="mb-0.5" />;
            })()}
            <div className="bg-white dark:bg-slate-950 p-2 rounded-lg max-h-[300px] overflow-y-auto w-full flex justify-center shadow-inner border border-slate-200 dark:border-slate-800">
              <img
                src={livePreviewUrl}
                alt="Live Banner Preview"
                className="max-w-full h-auto [image-rendering:pixelated] rounded shadow-xs bg-white"
              />
            </div>
          </div>
        )}

        {/* Collapsible Editor Trigger (ALTTADA) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsFormExpanded(!isFormExpanded)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                <SlidersHorizontal size={14} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isFormExpanded ? 'Şablon Değerlerini Gizle' : 'Şablon Değerlerini Düzenle'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
              <span>{isFormExpanded ? 'Kapat' : 'Aç & Değiştir'}</span>
              {isFormExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </button>
        </div>

        {/* Form Contents (Only shown when expanded) */}
        {isFormExpanded && (
          <div className="space-y-3 pt-1">
            {/* 1. RAF ETİKETİ DÜZENLEYİCİ */}
            <TabsContent value="shelf" className="space-y-3 pt-0 mt-0">
              <Card className="p-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-teal-600 dark:text-teal-400" />
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Market & Butik Raf Etiketi</Label>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Ürün Adı</Label>
                    <Input value={shelfTitle} onChange={e => setShelfTitle(e.target.value)} className="h-8 text-xs font-bold bg-slate-50 dark:bg-slate-800" />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Açıklama / Menşei / Gramaj</Label>
                    <Input value={shelfSubtitle} onChange={e => setShelfSubtitle(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Normal Fiyat</Label>
                      <Input value={shelfOldPrice} onChange={e => setShelfOldPrice(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800 font-mono" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-teal-600">İndirimli Fiyat</Label>
                      <Input value={shelfPrice} onChange={e => setShelfPrice(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800 font-bold font-mono text-teal-700 dark:text-teal-400" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">İndirim Rozeti</Label>
                      <Input value={shelfDiscountBadge} onChange={e => setShelfDiscountBadge(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800 font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Ürün Barkodu / EAN</Label>
                      <Input value={shelfBarcode} onChange={e => setShelfBarcode(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800 font-mono" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Dipnot / Tarih</Label>
                      <Input value={shelfDate} onChange={e => setShelfDate(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 2. KAMPANYA & VİTRİN DÜZENLEYİCİ */}
            <TabsContent value="campaign" className="space-y-3 pt-0 mt-0">
              <Card className="p-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-rose-600 dark:text-rose-400" />
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Vitrin & Kampanya Şeridi</Label>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Üst Rozet / Vurgu</Label>
                      <Input value={campBadge} onChange={e => setCampBadge(e.target.value)} className="h-8 text-xs font-bold bg-slate-50 dark:bg-slate-800" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Hızlı Rozetler</Label>
                      <Select onValueChange={(v: string | null) => { if (v) setCampBadge(v); }}>
                        <SelectTrigger className="h-8 text-xs bg-slate-50 dark:bg-slate-800">
                          <SelectValue placeholder="Seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="🔥 GÜNÜN FIRSATI">🔥 Günün Fırsatı</SelectItem>
                          <SelectItem value="⭐ BÜYÜK İNDİRİM">⭐ Büyük İndirim</SelectItem>
                          <SelectItem value="🏷️ 1 ALANA 1 BEDAVA">🏷️ 1 Alana 1 Bedava</SelectItem>
                          <SelectItem value="✨ YENİ SEZON">✨ Yeni Sezon</SelectItem>
                          <SelectItem value="🎁 NET %50 İNDİRİM">🎁 Net %50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Dev Başlık Metni</Label>
                    <Input value={campMainText} onChange={e => setCampMainText(e.target.value)} className="h-9 text-base font-black bg-slate-50 dark:bg-slate-800 uppercase" />
                  </div>

                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Alt Slogan / Detay</Label>
                    <Input value={campSubText} onChange={e => setCampSubText(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Görsel Tema</Label>
                      <div className="flex gap-1 mt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={campTheme === 'inverted' ? 'default' : 'outline'}
                          onClick={() => setCampTheme('inverted')}
                          className="flex-1 h-7 text-[10px] font-bold"
                        >
                          Siyah Zemin (Negatif)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={campTheme === 'white' ? 'default' : 'outline'}
                          onClick={() => setCampTheme('white')}
                          className="flex-1 h-7 text-[10px] font-bold"
                        >
                          Beyaz Zemin
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Çerçeve Stili</Label>
                      <Select value={campBorder} onValueChange={(v: string | null) => { if (v) setCampBorder(v as any); }}>
                        <SelectTrigger className="h-7 text-[11px] mt-1 bg-slate-50 dark:bg-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="double">Çift Çizgi Çerçeve</SelectItem>
                          <SelectItem value="dashed">Kesikli / Kupon Çizgisi</SelectItem>
                          <SelectItem value="solid">Düz Kalın Kutu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 3. DEPO & KOLİ DÜZENLEYİCİ */}
            <TabsContent value="warehouse" className="space-y-3 pt-0 mt-0">
              <Card className="p-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Package size={14} className="text-amber-600 dark:text-amber-400" />
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Depo, Raf & Koli Konum Etiketi</Label>
                </div>

                <div className="space-y-2">
                  <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Raf / Koridor / Lokasyon Kodu</Label>
                    <Input value={whLocation} onChange={e => setWhLocation(e.target.value)} className="h-8 text-xs font-bold bg-slate-50 dark:bg-slate-800 uppercase" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Ürün / Koli Tanımı</Label>
                      <Input value={whTitle} onChange={e => setWhTitle(e.target.value)} className="h-8 text-xs font-bold bg-slate-50 dark:bg-slate-800" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Miktar / Adet</Label>
                      <Input value={whQty} onChange={e => setWhQty(e.target.value)} className="h-8 text-xs font-bold bg-slate-50 dark:bg-slate-800 font-mono" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">İkaz / Yön Uyarısı</Label>
                      <Input value={whWarning} onChange={e => setWhWarning(e.target.value)} className="h-8 text-xs font-bold bg-slate-50 dark:bg-slate-800" />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Koli Takip Barkodu</Label>
                      <Input value={whBarcode} onChange={e => setWhBarcode(e.target.value)} className="h-8 text-xs bg-slate-50 dark:bg-slate-800 font-mono" />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* 4. KLASİK SERBEST BANNER */}
            <TabsContent value="classic" className="space-y-3 pt-0 mt-0">
              <Card className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 space-y-3">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-slate-500">Yazı Metni</Label>
                  <Input
                    value={p.bannerText}
                    onChange={e => p.setBannerText(e.target.value)}
                    placeholder="YAZI VEYA ETİKET METNİ GİRİN..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-sm font-bold text-center uppercase tracking-wider text-slate-900 dark:text-white rounded-lg h-10 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Punto</Label>
                      <span className="text-xs font-mono font-bold text-teal-600">{p.bannerFontSize}px</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => p.setBannerFontSize(prev => Math.max(12, prev - 4))}><Minus size={12}/></Button>
                      <Input type="number" value={p.bannerFontSize} onChange={e => p.setBannerFontSize(Number(e.target.value)||48)} className="flex-1 text-center font-bold h-7 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg" />
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg" onClick={() => p.setBannerFontSize(prev => Math.min(300, prev + 4))}><Plus size={12}/></Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Yazı Yönü</Label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 gap-1">
                      <button
                        type="button"
                        onClick={() => p.setBannerOrientation('horizontal')}
                        className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${p.bannerOrientation === 'horizontal' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        <AlignHorizontalJustifyCenter size={12} /> Yatay
                      </button>
                      <button
                        type="button"
                        onClick={() => p.setBannerOrientation('vertical')}
                        className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${p.bannerOrientation === 'vertical' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        <AlignVerticalJustifyCenter size={12} /> Dikey
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Baskı Türü</Label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => p.setBannerType('banner')}
                        className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${p.bannerType === 'banner' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        <Columns size={12} /> Banner
                      </button>
                      <button
                        type="button"
                        onClick={() => p.setBannerType('etiket')}
                        className={`flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${p.bannerType === 'etiket' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                      >
                        <Tag size={12} /> Etiket
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase">Zemin Modu</Label>
                    <div className="flex gap-1 mt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={classicInvert ? 'default' : 'outline'}
                        onClick={() => setClassicInvert(!classicInvert)}
                        className="w-full h-7 text-[10px] font-bold"
                      >
                        {classicInvert ? 'Negatif (Siyah Zemin)' : 'Klasik (Beyaz Zemin)'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </div>
        )}
      </Tabs>

      {/* Alt Sabit Kapsül Gezinme Menüsü (Barkod/Klonlama/Sıralı Menüsü Stili) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('shelf')}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'shelf'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Raf Etiketi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaign')}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'campaign'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Kampanya</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouse')}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'warehouse'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Koli</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('classic')}
          className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'classic'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Serbest Metin</span>
        </button>
      </div>
    </motion.div>
  );
}
