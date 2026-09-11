import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Printer,
  Plus,
  Minus,
  X,
  Trash2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Type,
  QrCode,
  Barcode,
  Sparkles,
  Camera,
  Upload,
  Layers,
  Wrench,
  Sliders,
  Check,
  Phone,
  RefreshCw,
  Download,
  Save,
  Grid,
  FileText,
  Eye,
  SlidersHorizontal,
  FolderOpen,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import {
  AssemblyManualData,
  AssemblyStepBlock,
  HardwareItem,
  INITIAL_ASSEMBLY_MANUAL,
  ASSEMBLY_HARDWARE_ICONS,
  BUILTIN_TABLE_LINEART_SVG,
  svgToDataUrl
} from '../lib/assembly-presets';
import { renderAssemblyManualToCanvas } from '../lib/assembly-manual-renderer';
import { convertToAssemblyLineArt, LineArtOptions, DEFAULT_LINE_ART_OPTIONS } from '../lib/assembly-line-art-filter';
import { RulerDimensionBadge } from './RulerDimensionBadge';
import { LineArtTouchUpCanvasModal } from './LineArtTouchUpCanvasModal';

const CANVAS_STORAGE_KEY = 'iprint_assembly_manual_canvas_size';

export interface SavedAssemblyCanvasSize {
  widthPx: number;
  heightPx: number;
  isAutoHeight: boolean;
}

const getInitialCanvasSize = (): SavedAssemblyCanvasSize => {
  try {
    const raw = localStorage.getItem(CANVAS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.widthPx === 'number') {
        return {
          widthPx: Math.max(80, parsed.widthPx),
          heightPx: Math.max(80, parsed.heightPx || 1200),
          isAutoHeight: Boolean(parsed.isAutoHeight)
        };
      }
    }
  } catch {
    // fallback
  }
  return {
    widthPx: 800, // 10.0 cm (100mm)
    heightPx: 1200, // 15.0 cm (10x15cm standart kılavuz / kargo etiketi)
    isAutoHeight: false
  };
};

export interface AssemblyManualStudioProps {
  initialData?: Partial<AssemblyManualData>;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => Promise<void>;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export const AssemblyManualStudio: React.FC<AssemblyManualStudioProps> = ({
  initialData,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}) => {
  // Tuval Ölçüsü (cm / px / Rulo - LocalStorage Korumalı)
  const [canvasSize, setCanvasSize] = useState<SavedAssemblyCanvasSize>(() => getInitialCanvasSize());
  const [showCanvasSizePanel, setShowCanvasSizePanel] = useState<boolean>(false);

  // Manuel Verisi
  const [manual, setManual] = useState<AssemblyManualData>(() => ({
    ...INITIAL_ASSEMBLY_MANUAL,
    ...initialData,
    paperWidthPreset: initialData?.paperWidthPreset || getInitialCanvasSize().widthPx,
    paperHeightPreset: initialData?.paperHeightPreset || getInitialCanvasSize().heightPx,
    isAutoHeight: initialData?.isAutoHeight !== undefined ? initialData.isAutoHeight : getInitialCanvasSize().isAutoHeight,
    id: `manual-${Date.now()}`
  }));

  // Canlı Önizleme Canvas Verisi
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [canvasHeightPx, setCanvasHeightPx] = useState<number>(600);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  // Görsel Çizgisel Filtreleme Modal / Ayarları
  const [filterModalBlockId, setFilterModalBlockId] = useState<string | null>(null);
  const [filterRawImage, setFilterRawImage] = useState<string | null>(null);
  const [filterOpts, setFilterOpts] = useState<LineArtOptions>(DEFAULT_LINE_ART_OPTIONS);
  const [filterPreviewUrl, setFilterPreviewUrl] = useState<string>('');
  const [isProcessingFilter, setIsProcessingFilter] = useState<boolean>(false);

  // Canlı Kamera Yakalama State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraTargetBlockId, setCameraTargetBlockId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Dosya Yükleme Ref'leri & Zoom State
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const hardwareImageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadTargetBlockId, setUploadTargetBlockId] = useState<string | null>(null);
  const [hardwareUploadTarget, setHardwareUploadTarget] = useState<{ blockId: string; itemId: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Tuval Ölçüsü Güncelleme ve LocalStorage'a Otomatik Kaydetme
  const updateCanvasSize = (newWidthPx: number, newHeightPx: number, newIsAuto: boolean) => {
    const updated: SavedAssemblyCanvasSize = {
      widthPx: Math.max(80, Math.round(newWidthPx)),
      heightPx: Math.max(80, Math.round(newHeightPx)),
      isAutoHeight: newIsAuto
    };
    setCanvasSize(updated);
    setManual(prev => ({
      ...prev,
      paperWidthPreset: updated.widthPx,
      paperHeightPreset: updated.heightPx,
      isAutoHeight: updated.isAutoHeight
    }));
    try {
      localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Canlı Canvas Önizleme Güncelleme (Boyut & Rulo/Sabit Sayfa Adaptasyonu)
  useEffect(() => {
    let isSubscribed = true;
    const updatePreview = async () => {
      setIsRendering(true);
      try {
        const canvas = await renderAssemblyManualToCanvas(
          manual,
          canvasSize.widthPx,
          canvasSize.heightPx,
          canvasSize.isAutoHeight
        );
        if (isSubscribed) {
          setPreviewDataUrl(canvas.toDataURL('image/png'));
          setCanvasHeightPx(canvas.height);
        }
      } catch (err) {
        console.error('Render hatası:', err);
      } finally {
        if (isSubscribed) setIsRendering(false);
      }
    };

    const timer = setTimeout(updatePreview, 120);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [manual, canvasSize]);

  // Çizgisel Şema Filtre Önizleme Güncelleme
  useEffect(() => {
    if (!filterRawImage) return;
    let isSubscribed = true;
    const processFilter = async () => {
      setIsProcessingFilter(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = filterRawImage;
        await new Promise((res) => { img.onload = res; });
        const resultUrl = await convertToAssemblyLineArt(img, filterOpts);
        if (isSubscribed) {
          setFilterPreviewUrl(resultUrl);
        }
      } catch (err) {
        console.error('Filtre hatası:', err);
      } finally {
        if (isSubscribed) setIsProcessingFilter(false);
      }
    };

    const timer = setTimeout(processFilter, 150);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [filterRawImage, filterOpts]);

  // Blok Ekleme Fonksiyonları
  const addImageBlock = () => {
    const newBlock: AssemblyStepBlock = {
      id: `blk-img-${Date.now()}`,
      type: 'image',
      imageHeight: 260,
      imageDataUrl: svgToDataUrl(BUILTIN_TABLE_LINEART_SVG),
      filterMode: 'line_art',
      badgeText: `ŞEKİL ${manual.blocks.filter(b => b.type === 'image').length + 1}: MONTAJ`,
      hasBorder: true,
      borderStyle: 'solid'
    };
    setManual(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const addTextBlock = () => {
    const textCount = manual.blocks.filter(b => b.type === 'text').length + 1;
    const newBlock: AssemblyStepBlock = {
      id: `blk-txt-${Date.now()}`,
      type: 'text',
      stepNumber: `${textCount}. ADIM`,
      stepTitle: 'Montaj Adımı Başlığı',
      stepDescription: 'Bu adımda uygulanacak parça montaj detaylarını ve vida talimatlarını buraya yazınız.',
      tipText: ''
    };
    setManual(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const addHardwareGridBlock = () => {
    const newBlock: AssemblyStepBlock = {
      id: `blk-hw-${Date.now()}`,
      type: 'hardware_grid',
      hardwareItems: [
        {
          id: `hw-${Date.now()}-1`,
          code: 'A',
          name: 'M6x30 Alyan Vida',
          count: '8 Adet',
          iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_hex
        },
        {
          id: `hw-${Date.now()}-2`,
          code: 'B',
          name: 'Alyan Anahtarı',
          count: '1 Adet',
          iconSvg: ASSEMBLY_HARDWARE_ICONS.allen_key
        }
      ]
    };
    setManual(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const addQrBlock = () => {
    const newBlock: AssemblyStepBlock = {
      id: `blk-qr-${Date.now()}`,
      type: 'qr_block',
      qrTitle: '📱 VİDEO KURULUM KILAVUZU',
      qrUrl: 'https://youtube.com',
      qrSubtitle: 'Kameranızla okutarak adım adım videolu kurulumu izleyebilirsiniz.'
    };
    setManual(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const addBarcodeBlock = () => {
    const newBlock: AssemblyStepBlock = {
      id: `blk-bc-${Date.now()}`,
      type: 'barcode',
      barcodeTitle: 'ÜRÜN / STOK BARKODU',
      barcodeText: '8691234567890',
      barcodeType: 'code128'
    };
    setManual(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
  };

  const removeBlock = (id: string) => {
    setManual(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= manual.blocks.length) return;
    const newBlocks = [...manual.blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIdx, 0, moved);
    setManual(prev => ({ ...prev, blocks: newBlocks }));
  };

  const updateBlock = (id: string, partial: Partial<AssemblyStepBlock>) => {
    setManual(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => (b.id === id ? { ...b, ...partial } : b))
    }));
  };

  // Donanım Eşyası Ekleme / Güncelleme / Silme
  const addHardwareItemToBlock = (blockId: string) => {
    const block = manual.blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'hardware_grid') return;
    const items = block.hardwareItems || [];
    const nextLetter = String.fromCharCode(65 + (items.length % 26));
    const newItem: HardwareItem = {
      id: `hw-${Date.now()}`,
      code: nextLetter,
      name: 'Yeni Montaj Parçası',
      count: '4 Adet',
      iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_wood
    };
    updateBlock(blockId, { hardwareItems: [...items, newItem] });
  };

  const updateHardwareItem = (blockId: string, itemId: string, partial: Partial<HardwareItem>) => {
    const block = manual.blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'hardware_grid') return;
    const updated = (block.hardwareItems || []).map(item =>
      item.id === itemId ? { ...item, ...partial } : item
    );
    updateBlock(blockId, { hardwareItems: updated });
  };

  const removeHardwareItem = (blockId: string, itemId: string) => {
    const block = manual.blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'hardware_grid') return;
    const updated = (block.hardwareItems || []).filter(item => item.id !== itemId);
    updateBlock(blockId, { hardwareItems: updated });
  };

  // Görsel Yükleme İşlemi (Dosya veya Galeri)
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFilterRawImage(dataUrl);
      setFilterModalBlockId(blockId);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Logo Yükleme
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setManual(prev => ({ ...prev, logoDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Donanım Parça Görseli Yükleme
  const handleUploadHardwareImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hardwareUploadTarget) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateHardwareItem(hardwareUploadTarget.blockId, hardwareUploadTarget.itemId, {
        dataUrl,
        iconSvg: undefined
      });
      setHardwareUploadTarget(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Kamera Başlatma
  const startCamera = async (blockId: string) => {
    setCameraTargetBlockId(blockId);
    setIsCameraActive(true);
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = stream;
        v.onloadedmetadata = () => {
          if (v.srcObject === stream) {
            v.play().catch(() => {});
          }
        };
      }
    } catch (err) {
      console.error('Kamera açılamadı:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraTargetBlockId(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const c = document.createElement('canvas');
    c.width = video.videoWidth || 640;
    c.height = video.videoHeight || 480;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, c.width, c.height);
      const snapUrl = c.toDataURL('image/png');
      stopCamera();
      if (cameraTargetBlockId) {
        setFilterRawImage(snapUrl);
        setFilterModalBlockId(cameraTargetBlockId);
      }
    }
  };

  // Çizgisel Filtre Uygulama & Bloğa Kaydetme
  const applyFilterToBlock = () => {
    if (!filterModalBlockId || !filterPreviewUrl) return;
    updateBlock(filterModalBlockId, {
      imageDataUrl: filterPreviewUrl,
      filterMode: filterOpts.mode
    });
    setFilterModalBlockId(null);
    setFilterRawImage(null);
  };

  // Yazdırma İşlemi
  const handlePrint = async () => {
    if (!previewDataUrl) return;
    const widthMm = Math.round(canvasSize.widthPx / 8);
    if (onDirectPrint) {
      await onDirectPrint(previewDataUrl, manual.title, widthMm);
    } else if (onPreviewAndPrint) {
      onPreviewAndPrint(previewDataUrl, manual.title, widthMm);
    }
  };

  // PNG İndirme
  const handleDownloadPng = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `kurulum-semasi-${manual.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  // Şablonu LocalStorage'a Kaydetme
  const handleSaveDraft = () => {
    try {
      localStorage.setItem('iprint_saved_assembly_manual', JSON.stringify(manual));
      alert('Kurulum şeması taslağı başarıyla kaydedildi!');
    } catch {
      alert('Kayıt başarısız oldu.');
    }
  };

  const handleLoadDraft = () => {
    try {
      const raw = localStorage.getItem('iprint_saved_assembly_manual');
      if (raw) {
        setManual(JSON.parse(raw));
        alert('Kayıtlı kurulum şeması yüklendi!');
      } else {
        alert('Kayıtlı taslak bulunamadı.');
      }
    } catch {
      alert('Yükleme başarısız.');
    }
  };

  const manualQuickPresets = [
    { id: '10x15', label: '10×15', w: 800, h: 1200, auto: false, icon: FileText },
    { id: '10x10', label: '10×10', w: 800, h: 800, auto: false, icon: Grid },
    { id: 'roll-80', label: '80mm', w: 576, h: 800, auto: true, icon: Layers },
    { id: 'roll-58', label: '58mm', w: 384, h: 600, auto: true, icon: Sliders },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* 1. Header Bar: Compact, Responsive & Minimalist */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs">
        {/* Left: Back Button */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              title="Geri"
              className="rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-2.5 cursor-pointer shrink-0"
            >
              <ArrowLeft size={14} className="mr-1" /> Geri
            </Button>
          )}
        </div>

        {/* Right: Quick Preset Switcher (Expanding on active) & Fixed Print Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick Preset Pill Group (Expanding Buttons) */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 gap-0.5">
            {manualQuickPresets.map((opt) => {
              const isSelected =
                canvasSize.widthPx === opt.w &&
                (opt.auto ? canvasSize.isAutoHeight : !canvasSize.isAutoHeight && canvasSize.heightPx === opt.h);
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateCanvasSize(opt.w, opt.h, opt.auto)}
                  title={opt.label}
                  className={`flex items-center gap-1.5 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap ${
                    isSelected
                      ? 'bg-teal-600 text-white px-2.5 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 px-2'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  {isSelected && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      {opt.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Draft Actions Dropdown / Buttons */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              title="Taslak Kaydet"
              className="h-8 px-2 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <Save size={13} className="mr-1 text-slate-500" /> Kaydet
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDraft}
              title="Taslak Yükle"
              className="h-8 px-2 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <FolderOpen size={13} className="mr-1 text-slate-500" /> Taslak
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPng}
              title="PNG İndir"
              className="h-8 px-2 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <Download size={13} className="mr-1 text-slate-500" /> PNG
            </Button>
          </div>

          {/* Fixed Print Button */}
          <Button
            size="sm"
            onClick={handlePrint}
            disabled={isRendering || !previewDataUrl}
            className="h-8 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isRendering ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span className="hidden sm:inline">Hazırlanıyor...</span>
              </>
            ) : (
              <>
                <Printer size={14} />
                <span>Yazdır</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobil Görünüm Sekmesi */}
      <div className="flex sm:hidden p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'editor'
              ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'preview'
              ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Önizleme
        </button>
      </div>

      {/* Ana Çift Kolonlu Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SOL KOLON: Blok Düzenleyici & Şablon Ayarları */}
        <div className={`lg:col-span-7 space-y-4 ${activeTab === 'preview' ? 'hidden sm:block' : 'block'}`}>
          {/* Tuval Ölçüsü Seçim ve Ayar Alanı (Kolaj Tasarımı ile Birebir Uyumlu) */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowCanvasSizePanel(prev => !prev)}
              className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border shadow-2xs ${
                showCanvasSizePanel
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
              title="Tuval Ölçüsünü Değiştir"
            >
              <div className="flex items-center gap-1.5">
                <Sliders size={14} className={showCanvasSizePanel ? 'text-white' : 'text-teal-600'} />
                <span className={`text-[11px] uppercase tracking-wider font-extrabold ${showCanvasSizePanel ? 'text-teal-100' : 'text-slate-600 dark:text-slate-300'}`}>
                  Tuval / Kağıt Ölçüsü:
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-black text-xs ${showCanvasSizePanel ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`}>
                  {(canvasSize.widthPx / 80).toFixed(1).replace(/\.0$/, '')} cm × {canvasSize.isAutoHeight ? 'Otomatik Boy' : `${(canvasSize.heightPx / 80).toFixed(1).replace(/\.0$/, '')} cm`}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${showCanvasSizePanel ? 'bg-teal-700/80 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {canvasSize.isAutoHeight ? 'Rulo Kağıt' : 'Sabit Sayfa'}
                </span>
              </div>
            </button>

            {/* Açılır / Kapanır Tuval Ölçüsü Ayarlama Paneli */}
            <AnimatePresence>
              {showCanvasSizePanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 text-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders size={13} className="text-teal-600" /> Tuval Ölçüsü Ayarla (cm)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCanvasSizePanel(false)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Genişlik (En) - cm */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                        <span>Genişlik (En)</span>
                        <span className="text-teal-600 dark:text-teal-400 font-mono font-extrabold">
                          {(canvasSize.widthPx / 80).toFixed(1).replace(/\.0$/, '')} cm
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => updateCanvasSize(canvasSize.widthPx - 40, canvasSize.heightPx, canvasSize.isAutoHeight)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                          title="-0.5 cm"
                        >
                          <Minus size={12} />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1 font-mono">
                          <input
                            type="number"
                            step="0.1"
                            value={(canvasSize.widthPx / 80).toFixed(1).replace(/\.0$/, '')}
                            onChange={(e) => {
                              const cm = parseFloat(e.target.value) || 1;
                              updateCanvasSize(Math.max(80, Math.round(cm * 80)), canvasSize.heightPx, canvasSize.isAutoHeight);
                            }}
                            className="w-16 text-center bg-transparent text-xs font-bold text-teal-700 dark:text-teal-400 focus:outline-none border-b border-teal-500/50"
                          />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">cm</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateCanvasSize(canvasSize.widthPx + 40, canvasSize.heightPx, canvasSize.isAutoHeight)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                          title="+0.5 cm"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Yükseklik (Boy) - cm */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                        <span>Yükseklik (Boy)</span>
                        <div className="flex items-center gap-1">
                          {canvasSize.isAutoHeight ? (
                            <span className="text-amber-600 dark:text-amber-400 font-mono font-extrabold text-[10px]">Otomatik Boy</span>
                          ) : (
                            <span className="text-teal-600 dark:text-teal-400 font-mono font-extrabold">
                              {(canvasSize.heightPx / 80).toFixed(1).replace(/\.0$/, '')} cm
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={canvasSize.isAutoHeight}
                          onClick={() => updateCanvasSize(canvasSize.widthPx, canvasSize.heightPx - 40, false)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer disabled:opacity-30"
                          title="-0.5 cm"
                        >
                          <Minus size={12} />
                        </button>
                        <div className="flex-1 flex items-center justify-center gap-1 font-mono">
                          <input
                            type="number"
                            step="0.1"
                            disabled={canvasSize.isAutoHeight}
                            value={canvasSize.isAutoHeight ? '' : (canvasSize.heightPx / 80).toFixed(1).replace(/\.0$/, '')}
                            placeholder={canvasSize.isAutoHeight ? 'Otomatik' : ''}
                            onChange={(e) => {
                              const cm = parseFloat(e.target.value) || 1;
                              updateCanvasSize(canvasSize.widthPx, Math.max(80, Math.round(cm * 80)), false);
                            }}
                            className="w-16 text-center bg-transparent text-xs font-bold text-teal-700 dark:text-teal-400 focus:outline-none border-b border-teal-500/50 disabled:opacity-40"
                          />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">cm</span>
                        </div>
                        <button
                          type="button"
                          disabled={canvasSize.isAutoHeight}
                          onClick={() => updateCanvasSize(canvasSize.widthPx, canvasSize.heightPx + 40, false)}
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer disabled:opacity-30"
                          title="+0.5 cm"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rulo / Sabit Sayfa Modu Geçiş Seçimi */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col pr-2">
                      <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                        {canvasSize.isAutoHeight ? 'Sürekli Rulo Modu (Dinamik Uzunluk)' : 'Sabit Kağıt / Etiket Modu (10x15cm vb.)'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {canvasSize.isAutoHeight
                          ? 'İçeriğin tamamı çizilir, kağıt bittiği yerde kesilir.'
                          : 'Kılavuz içeriği tam olarak girilen kağıt boyutuna sığacak şekilde otomatik uyarlanır.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCanvasSize(canvasSize.widthPx, canvasSize.heightPx, !canvasSize.isAutoHeight)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                        canvasSize.isAutoHeight
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-teal-600 text-white shadow-2xs'
                      }`}
                    >
                      {canvasSize.isAutoHeight ? 'Rulo Kağıt' : 'Sabit Sayfa'}
                    </button>
                  </div>

                  {/* Standart Hazır Kısayollar (cm Cinsinden) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      Hızlı Ölçü Seçenekleri:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: '10 × 15 cm (Standart Kılavuz)', w: 800, h: 1200, auto: false },
                        { label: '10 × 10 cm (Kare Etiket)', w: 800, h: 800, auto: false },
                        { label: '7.2 × 10 cm (80mm Kılavuz)', w: 576, h: 800, auto: false },
                        { label: '10 cm Rulo (100mm)', w: 800, h: 1200, auto: true },
                        { label: '7.2 cm Rulo (80mm)', w: 576, h: 800, auto: true },
                        { label: '4.8 cm Rulo (58mm)', w: 384, h: 600, auto: true },
                        { label: '15 × 21 cm (A5 Boyut)', w: 1200, h: 1680, auto: false },
                      ].map((preset, idx) => {
                        const isSelected =
                          canvasSize.widthPx === preset.w &&
                          (preset.auto
                            ? canvasSize.isAutoHeight
                            : !canvasSize.isAutoHeight && canvasSize.heightPx === preset.h);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => updateCanvasSize(preset.w, preset.h, preset.auto)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? 'bg-teal-600 text-white font-black shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 1. Üst Başlık & Logo Ayarları */}
          <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText size={14} className="text-teal-600" /> Ürün & Mağaza Bilgileri
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                {(canvasSize.widthPx / 80).toFixed(1).replace(/\.0$/, '')} cm
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-bold text-slate-500">Ürün Adı / Şema Başlığı</Label>
                <Input
                  value={manual.title}
                  onChange={(e) => setManual(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="örn: LUNA ÇALIŞMA MASASI"
                  className="h-8 text-xs font-bold mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-500">Model / Ölçü Bilgisi</Label>
                <Input
                  value={manual.subTitle || ''}
                  onChange={(e) => setManual(prev => ({ ...prev, subTitle: e.target.value }))}
                  placeholder="örn: Model LN-705 • 120x60x75 cm"
                  className="h-8 text-xs font-bold mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-500">Mağaza / Marka Logosu (Metin)</Label>
                <Input
                  value={manual.logoText || ''}
                  onChange={(e) => setManual(prev => ({ ...prev, logoText: e.target.value }))}
                  placeholder="örn: DEKO MOBİLYA"
                  className="h-8 text-xs font-bold mt-1"
                />
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-500">WhatsApp / Müşteri Destek</Label>
                <Input
                  value={manual.supportPhone || ''}
                  onChange={(e) => setManual(prev => ({ ...prev, supportPhone: e.target.value }))}
                  placeholder="örn: WhatsApp Destek: 0532 999 88 77"
                  className="h-8 text-xs font-bold mt-1"
                />
              </div>
            </div>

            {/* Logo Yükleme */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-slate-500 font-medium">Özel Logo Görseli:</span>
              <div className="flex items-center gap-2">
                {manual.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setManual(prev => ({ ...prev, logoDataUrl: undefined }))}
                    className="text-[10px] text-red-500 hover:underline font-bold"
                  >
                    Logoyu Kaldır
                  </button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="h-7 px-2.5 text-[10px] font-bold rounded-lg"
                >
                  <Upload size={12} className="mr-1" /> Logo Yükle
                </Button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  className="hidden"
                />
              </div>
            </div>
          </Card>

          {/* 2. Dinamik Blok Listesi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Şablon Blokları ({manual.blocks.length})
              </span>
              <span className="text-[11px] text-slate-400">İstediğiniz sırayla ekleyin & taşıyın</span>
            </div>

            <AnimatePresence initial={false}>
              {manual.blocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  {/* Blok Üst Başlığı & Kontrolleri */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-700 dark:text-slate-300">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {block.type === 'image' && <><ImageIcon size={14} className="text-blue-500" /> Kurulum Şeması / Çizim Kutusu</>}
                        {block.type === 'text' && <><Type size={14} className="text-emerald-500" /> Adım & Açıklama Metni</>}
                        {block.type === 'hardware_grid' && <><Wrench size={14} className="text-amber-500" /> Donanım & Vida Paketi (2'li/4'lü Grid)</>}
                        {block.type === 'qr_block' && <><QrCode size={14} className="text-purple-500" /> Videolu Kurulum QR Kodu</>}
                        {block.type === 'barcode' && <><Barcode size={14} className="text-cyan-500" /> Ürün & Stok Barkodu</>}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveBlock(index, 'up')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={index === manual.blocks.length - 1}
                        onClick={() => moveBlock(index, 'down')}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="p-1 rounded text-red-400 hover:text-red-600 ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* === BLOK İÇERİĞİ: GÖRSEL KUTUSU === */}
                  {block.type === 'image' && (
                    <div className="space-y-3">
                      {/* Yükseklik Ayarı Slider'ı */}
                      <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal size={13} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                            Kutu Yüksekliği: {block.imageHeight || 260}px
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[
                            { h: 180, label: 'Kompakt' },
                            { h: 260, label: 'Standart' },
                            { h: 360, label: 'Geniş' }
                          ].map(opt => (
                            <button
                              key={opt.h}
                              type="button"
                              onClick={() => updateBlock(block.id, { imageHeight: opt.h })}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                block.imageHeight === opt.h
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Görsel Yükleme / Çizgisel Filtre Butonları */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadTargetBlockId(block.id);
                            imageInputRef.current?.click();
                          }}
                          className="h-8 px-2.5 text-xs font-bold rounded-xl"
                        >
                          <Upload size={13} className="mr-1.5 text-blue-500" /> Galeriden / Dosyadan Seç
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startCamera(block.id)}
                          className="h-8 px-2.5 text-xs font-bold rounded-xl"
                        >
                          <Camera size={13} className="mr-1.5 text-emerald-500" /> Fotoğraf Çek
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateBlock(block.id, {
                              imageDataUrl: svgToDataUrl(BUILTIN_TABLE_LINEART_SVG),
                              filterMode: 'line_art'
                            });
                          }}
                          className="h-8 px-2.5 text-xs font-bold rounded-xl text-teal-600 dark:text-teal-400"
                        >
                          <Sparkles size={13} className="mr-1.5" /> Hazır Masa Çizimi
                        </Button>
                      </div>

                      {/* Rozet Metni & Çerçeve */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">Köşe Rozeti / Şekil Başlığı</Label>
                          <Input
                            value={block.badgeText || ''}
                            onChange={(e) => updateBlock(block.id, { badgeText: e.target.value })}
                            placeholder="örn: ŞEKİL 1: AYAK MONTAJI"
                            className="h-7 text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={block.hasBorder !== false}
                              onChange={(e) => updateBlock(block.id, { hasBorder: e.target.checked })}
                              className="rounded accent-blue-600"
                            />
                            Kutucuk Çerçevesi
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === BLOK İÇERİĞİ: METİN KUTUSU === */}
                  {block.type === 'text' && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">Adım No / Rozet</Label>
                          <Input
                            value={block.stepNumber || ''}
                            onChange={(e) => updateBlock(block.id, { stepNumber: e.target.value })}
                            placeholder="örn: 1. ADIM"
                            className="h-8 text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-[10px] font-bold text-slate-500">Adım Başlığı</Label>
                          <Input
                            value={block.stepTitle || ''}
                            onChange={(e) => updateBlock(block.id, { stepTitle: e.target.value })}
                            placeholder="örn: Ayakların Gövdeye Sabitlenmesi"
                            className="h-8 text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">Montaj Açıklaması / Talimatı</Label>
                        <textarea
                          rows={2}
                          value={block.stepDescription || ''}
                          onChange={(e) => updateBlock(block.id, { stepDescription: e.target.value })}
                          placeholder="Montaj adımlarını detaylıca yazınız..."
                          className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 mt-0.5"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          ⚠️ Dikkat & İpucu Kutusu (Opsiyonel)
                        </Label>
                        <Input
                          value={block.tipText || ''}
                          onChange={(e) => updateBlock(block.id, { tipText: e.target.value })}
                          placeholder="örn: Vidaları tüm ayaklar oturana kadar sıkmayınız."
                          className="h-7 text-xs font-medium mt-0.5 bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* === BLOK İÇERİĞİ: DONANIM & VİDA PAKETİ (2'Lİ / 4'LÜ GRİD) === */}
                  {block.type === 'hardware_grid' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500">
                          🔩 Vida & Parça Listesi (Yan Yana Grid Düzen)
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addHardwareItemToBlock(block.id)}
                          className="h-7 px-2.5 text-[10px] font-bold rounded-lg text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                        >
                          <Plus size={12} className="mr-1" /> Yeni Parça Ekle
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(block.hardwareItems || []).map((item) => (
                          <div
                            key={item.id}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-2.5 relative shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => removeHardwareItem(block.id, item.id)}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={13} />
                            </button>

                            <div className="flex items-start gap-2.5 pr-7">
                              {/* Canlı İkon / Fotoğraf Önizleme Kutusu */}
                              <div className="w-14 h-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-1 flex items-center justify-center shrink-0 relative overflow-hidden group">
                                {item.dataUrl ? (
                                  <img src={item.dataUrl} alt={item.name} className="w-full h-full object-contain" />
                                ) : item.iconSvg ? (
                                  <div
                                    className="w-full h-full flex items-center justify-center text-slate-900 dark:text-white"
                                    dangerouslySetInnerHTML={{ __html: item.iconSvg }}
                                  />
                                ) : (
                                  <Wrench size={20} className="text-slate-300" />
                                )}
                              </div>

                              <div className="flex-1 space-y-1.5">
                                <div className="flex gap-1.5">
                                  <div className="w-14">
                                    <Label className="text-[9px] font-bold text-slate-500">Kod</Label>
                                    <Input
                                      value={item.code}
                                      onChange={(e) => updateHardwareItem(block.id, item.id, { code: e.target.value })}
                                      className="h-6 text-xs font-black text-center mt-0.5 p-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-[9px] font-bold text-slate-500">Miktar</Label>
                                    <Input
                                      value={item.count}
                                      onChange={(e) => updateHardwareItem(block.id, item.id, { count: e.target.value })}
                                      className="h-6 text-xs font-bold mt-0.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-[9px] font-bold text-slate-500">Parça Adı</Label>
                                  <Input
                                    value={item.name}
                                    onChange={(e) => updateHardwareItem(block.id, item.id, { name: e.target.value })}
                                    className="h-6 text-xs font-bold mt-0.5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* İkon Kütüphanesi & Özel Resim Yükleme */}
                            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400">Vektörel İkon Seçin:</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHardwareUploadTarget({ blockId: block.id, itemId: item.id });
                                    hardwareImageInputRef.current?.click();
                                  }}
                                  className="text-[9px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Upload size={10} /> 📷 Özel Fotoğraf Yükle
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-1">
                                {[
                                  { id: 'screw_wood', icon: ASSEMBLY_HARDWARE_ICONS.screw_wood, name: 'Vida' },
                                  { id: 'screw_hex', icon: ASSEMBLY_HARDWARE_ICONS.screw_hex, name: 'Alyan' },
                                  { id: 'allen_key', icon: ASSEMBLY_HARDWARE_ICONS.allen_key, name: 'Anahtar' },
                                  { id: 'dowel_wood', icon: ASSEMBLY_HARDWARE_ICONS.dowel_wood, name: 'Dübel' },
                                  { id: 'minifix_cam', icon: ASSEMBLY_HARDWARE_ICONS.minifix_cam, name: 'Minifix' },
                                  { id: 'furniture_leg', icon: ASSEMBLY_HARDWARE_ICONS.furniture_leg, name: 'Pabuç Ayak' },
                                  { id: 'bracket_l', icon: ASSEMBLY_HARDWARE_ICONS.bracket_l, name: 'L Gönye' },
                                  { id: 'screwdriver', icon: ASSEMBLY_HARDWARE_ICONS.screwdriver, name: 'Tornavida' },
                                  { id: 'hinge_door', icon: ASSEMBLY_HARDWARE_ICONS.hinge_door, name: 'Menteşe' },
                                  { id: 'nut_washer', icon: ASSEMBLY_HARDWARE_ICONS.nut_washer, name: 'Somun/Pul' }
                                ].map(ic => {
                                  const isSelected = !item.dataUrl && item.iconSvg === ic.icon;
                                  return (
                                    <button
                                      key={ic.id}
                                      type="button"
                                      onClick={() => updateHardwareItem(block.id, item.id, { iconSvg: ic.icon, dataUrl: undefined })}
                                      className={`p-1 rounded-md border transition-all ${
                                        isSelected
                                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-500'
                                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-400'
                                      }`}
                                      title={ic.name}
                                    >
                                      <div
                                        className="w-4 h-4 text-slate-800 dark:text-slate-100 flex items-center justify-center"
                                        dangerouslySetInnerHTML={{ __html: ic.icon }}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* === BLOK İÇERİĞİ: QR KOD KUTUSU === */}
                  {block.type === 'qr_block' && (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">QR Başlığı</Label>
                          <Input
                            value={block.qrTitle || ''}
                            onChange={(e) => updateBlock(block.id, { qrTitle: e.target.value })}
                            placeholder="örn: 📱 VİDEOLU KURULUM KILAVUZU"
                            className="h-8 text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">Video Linki / URL</Label>
                          <Input
                            value={block.qrUrl || ''}
                            onChange={(e) => updateBlock(block.id, { qrUrl: e.target.value })}
                            placeholder="https://youtube.com/..."
                            className="h-8 text-xs font-bold mt-0.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] font-bold text-slate-500">QR Açıklaması</Label>
                        <Input
                          value={block.qrSubtitle || ''}
                          onChange={(e) => updateBlock(block.id, { qrSubtitle: e.target.value })}
                          placeholder="Kameranızla okutarak montaj videosunu adım adım izleyebilirsiniz."
                          className="h-7 text-xs font-medium mt-0.5"
                        />
                      </div>
                    </div>
                  )}

                  {/* Barkod Bloğu Editörü */}
                  {block.type === 'barcode' && (
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">Barkod Başlığı</Label>
                          <Input
                            value={block.barcodeTitle || ''}
                            onChange={(e) => updateBlock(block.id, { barcodeTitle: e.target.value })}
                            placeholder="örn: ÜRÜN / STOK BARKODU"
                            className="h-8 text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">Barkod Değeri / Kodu</Label>
                          <Input
                            value={block.barcodeText || ''}
                            onChange={(e) => updateBlock(block.id, { barcodeText: e.target.value })}
                            placeholder="örn: 8691234567890"
                            className="h-8 text-xs font-bold mt-0.5"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] font-bold text-slate-500">Barkod Formatı</Label>
                          <select
                            value={block.barcodeType || 'code128'}
                            onChange={(e) => updateBlock(block.id, { barcodeType: e.target.value as any })}
                            className="w-full h-8 text-xs font-bold mt-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-slate-800 dark:text-slate-200"
                          >
                            <option value="code128">Code 128 (Genel Barkod)</option>
                            <option value="ean13">EAN-13 (Ürün Barkodu - 13 Hane)</option>
                            <option value="qrcode">QR Kod</option>
                            <option value="upca">UPC-A</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 3. Blok Ekleme Menüsü (+ Butonları) */}
            <div className="p-3.5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center space-y-2.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                + Şablona Yeni Blok Ekleyin:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  onClick={addImageBlock}
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800"
                >
                  <ImageIcon size={13} className="mr-1.5" /> + Görsel / Çizim Kutusu
                </Button>

                <Button
                  type="button"
                  onClick={addTextBlock}
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800"
                >
                  <Type size={13} className="mr-1.5" /> + Adım & Metin Kutusu
                </Button>

                <Button
                  type="button"
                  onClick={addHardwareGridBlock}
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800"
                >
                  <Wrench size={13} className="mr-1.5" /> + 2'li Vida/Parça Listesi
                </Button>

                <Button
                  type="button"
                  onClick={addQrBlock}
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800"
                >
                  <QrCode size={13} className="mr-1.5" /> + Video QR Kodu
                </Button>

                <Button
                  type="button"
                  onClick={addBarcodeBlock}
                  className="h-8 px-3 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800"
                >
                  <Barcode size={13} className="mr-1.5" /> + Stok Barkodu
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: Canlı Termal Baskı Kılavuz Önizlemesi */}
        <div className={`lg:col-span-5 space-y-3 ${activeTab === 'editor' ? 'hidden sm:block' : 'block'}`}>
          <div className="sticky top-4 space-y-3">
            <Card className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Eye size={14} className="text-teal-600" /> Baskı Önizlemesi
                </span>
                <RulerDimensionBadge widthPx={canvasSize.widthPx} heightPx={canvasHeightPx} />
              </div>

              {/* Kağıt Genişliği ve Zoom Kontrolleri */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                {/* Hızlı Tuval Ölçüsü Seçimi */}
                <button
                  type="button"
                  onClick={() => setShowCanvasSizePanel(prev => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
                  title="Tuval Ölçülerini Ayarla"
                >
                  <Sliders size={11} className="text-teal-600" />
                  <span>{(canvasSize.widthPx / 80).toFixed(1).replace(/\.0$/, '')} × {canvasSize.isAutoHeight ? 'Oto' : `${(canvasSize.heightPx / 80).toFixed(1).replace(/\.0$/, '')}`} cm</span>
                </button>

                {/* Yakınlaştırma (Zoom) */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-0.5">Yakınlaştır:</span>
                  {[
                    { z: 0.75, lbl: '%75' },
                    { z: 1.0, lbl: '%100' },
                    { z: 1.25, lbl: '%125' }
                  ].map(zm => (
                    <button
                      key={zm.z}
                      type="button"
                      onClick={() => setPreviewZoom(zm.z)}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        previewZoom === zm.z
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {zm.lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Termal Kağıt Görünümü (Keskin Köşeli & Net Önizleme) */}
              <div className="bg-slate-100/80 dark:bg-slate-950 p-3 sm:p-4 rounded-xl flex items-center justify-center overflow-auto max-h-[640px] border border-slate-200 dark:border-slate-800">
                {previewDataUrl ? (
                  <div
                    className="bg-white text-black shadow-xl rounded-none p-0 transition-transform duration-200 border border-slate-300 dark:border-slate-700 select-none [image-rendering:pixelated]"
                    style={{
                      transform: `scale(${previewZoom})`,
                      transformOrigin: 'top center'
                    }}
                  >
                    <img
                      src={previewDataUrl}
                      alt="Kılavuz Önizleme"
                      className="w-full h-auto block rounded-none"
                      style={{ maxWidth: `${canvasSize.widthPx}px` }}
                    />
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Kılavuz oluşturuluyor...
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* GİZLİ DOSYA YÜKLEME INPUTLARI */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (uploadTargetBlockId) handleUploadImage(e, uploadTargetBlockId);
        }}
        className="hidden"
      />

      <input
        ref={hardwareImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadHardwareImage}
        className="hidden"
      />

      {/* CANLI KAMERA MODALI */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                📷 Ürün / Parça Fotoğrafı Çek
              </span>
              <button onClick={stopCamera} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>
            <div className="aspect-4/3 bg-black rounded-xl overflow-hidden relative">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button variant="outline" onClick={stopCamera} className="text-xs font-bold">
                İptal
              </Button>
              <Button onClick={capturePhoto} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black">
                📸 Fotoğrafı Yakala & Çizgiye Çevir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ÇİZGİSEL ŞEMA FİLTRELEME & ELLE SİLME DÜZENLEYİCİ MODALI */}
      {filterRawImage && filterModalBlockId && (
        <LineArtTouchUpCanvasModal
          rawImageDataUrl={filterRawImage}
          initialOptions={filterOpts}
          onClose={() => {
            setFilterRawImage(null);
            setFilterModalBlockId(null);
          }}
          onSave={(finalDataUrl, savedOpts) => {
            if (filterModalBlockId) {
              updateBlock(filterModalBlockId, { imageDataUrl: finalDataUrl });
            }
            setFilterOpts(savedOpts);
            setFilterRawImage(null);
            setFilterModalBlockId(null);
          }}
        />
      )}

      {/* HAZIR ŞABLON SEÇİM MODALI */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="text-teal-600" size={20} />
                <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Hazır Montaj Kılavuzu Şablonları
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Düzenlemek istediğiniz hazır mobilya / ürün montaj şablonunu seçiniz:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {[
                {
                  id: 'table',
                  title: '📐 Çalışma Masası',
                  subtitle: 'LUNA-120 • 120x60x75cm',
                  desc: '4 Parça hırdavat, ayak montajı, pabuç ve QR video kılavuzu',
                  badge: 'Varsayılan',
                  load: () => setManual({ ...INITIAL_ASSEMBLY_MANUAL, id: `manual-${Date.now()}` })
                },
                {
                  id: 'wardrobe',
                  title: '🚪 2 Kapaklı Gardırop',
                  subtitle: 'GDR-200 • 80x50x180cm',
                  desc: 'Menteşe, kulp, raf kavelası, arkalık çivisi ve gövde kurulumu',
                  badge: 'Çok Satan',
                  load: () => setManual({
                    id: `manual-${Date.now()}`,
                    title: '2 KAPAKLI GARDIROP KURULUM KILAVUZU',
                    subTitle: 'Model: GDR-200 • Ölçü: 80x50x180 cm',
                    logoText: 'DEKO MOBİLYA A.Ş.',
                    paperWidthPreset: 576,
                    supportPhone: 'WhatsApp Destek: 0532 999 88 77',
                    showFooterLogo: true,
                    footerNote: 'Montaj öncesi tüm minifiks ve kapak menteşelerini kontrol ediniz.',
                    blocks: [
                      {
                        id: 'blk-hw',
                        type: 'hardware_grid',
                        hardwareItems: [
                          { id: 'h1', code: 'A', name: 'Minifiks Mil & Gövde', count: '12 Takım', iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_hex },
                          { id: 'h2', code: 'B', name: 'Tas Menteşe 35mm', count: '4 Adet', iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_wood },
                          { id: 'h3', code: 'C', name: 'Ahşap Kavela 8x30', count: '16 Adet', iconSvg: ASSEMBLY_HARDWARE_ICONS.dowel_wood },
                          { id: 'h4', code: 'D', name: 'Metal Kulp + Vida', count: '2 Takım', iconSvg: ASSEMBLY_HARDWARE_ICONS.allen_key }
                        ]
                      },
                      {
                        id: 'blk-s1',
                        type: 'text',
                        stepNumber: '1. ADIM',
                        stepTitle: 'Yan Paneller Ve Alt/Üst Tabla Birleşimi',
                        stepDescription: 'Yan panellere (A) minifiks millerini sıkınız. Ahşap kavelaları (C) deliklere oturtup alt ve üst tablayı sıkıca birleştiriniz.',
                        tipText: 'Minifiks gövdelerini ok yönü mile bakacak şekilde çeviriniz.'
                      },
                      {
                        id: 'blk-img1',
                        type: 'image',
                        imageHeight: 260,
                        imageDataUrl: svgToDataUrl(BUILTIN_TABLE_LINEART_SVG),
                        filterMode: 'line_art',
                        badgeText: 'ŞEKİL 1: GÖVDE KURULUM ŞEMASI',
                        hasBorder: true
                      },
                      {
                        id: 'blk-s2',
                        type: 'text',
                        stepNumber: '2. ADIM',
                        stepTitle: 'Kapak Menteşeleri Ve Kulp Montajı',
                        stepDescription: 'Kapak yuvalarına 35mm tas menteşeleri (B) vidalayarak sabitleyiniz. Kulpları (D) vidaları ile kapak ön yüzüne sıkınız.',
                        tipText: 'Menteşe ayar vidaları ile kapak aralığını teraziye alınız.'
                      },
                      {
                        id: 'blk-bc',
                        type: 'barcode',
                        barcodeTitle: 'ÜRÜN BARKODU & SERİ NO',
                        barcodeText: '8690000123456',
                        barcodeType: 'code128'
                      }
                    ]
                  })
                },
                {
                  id: 'tv_unit',
                  title: '📺 TV Ünitesi & Konsol',
                  subtitle: 'TVU-150 • 150x35x45cm',
                  desc: 'Düşer kapak, makas mekanizması, TV kablo kanalı ve ayaklar',
                  badge: 'Popüler',
                  load: () => setManual({
                    id: `manual-${Date.now()}`,
                    title: 'TV ÜNİTESİ & KONSOL MONTAJ KILAVUZU',
                    subTitle: 'Model: TVU-150 • Ölçü: 150x35x45 cm',
                    logoText: 'LİNE AŞ. MOBİLYA',
                    paperWidthPreset: 576,
                    supportPhone: 'Destek Hattı: 0850 123 45 67',
                    showFooterLogo: true,
                    footerNote: 'TV ünitesini duvara sabitleme aparatları kutu içeriğine dahildir.',
                    blocks: [
                      {
                        id: 'blk-hw-tv',
                        type: 'hardware_grid',
                        hardwareItems: [
                          { id: 'h1', code: 'A', name: 'Kabin Vidası 3.5x18', count: '24 Adet', iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_wood },
                          { id: 'h2', code: 'B', name: 'Düşer Kapak Makası', count: '2 Takım', iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_hex },
                          { id: 'h3', code: 'C', name: 'Ahşap Konik Ayak', count: '5 Adet', iconSvg: ASSEMBLY_HARDWARE_ICONS.furniture_leg }
                        ]
                      },
                      {
                        id: 'blk-s1-tv',
                        type: 'text',
                        stepNumber: '1. ADIM',
                        stepTitle: 'Orta Dikme Ve Düşer Kapak Montajı',
                        stepDescription: 'Orta bölücü dikmeleri alt tablanın üzerindeki kılavuz deliklere vidalayınız. Kapak makaslarını (B) yan panellere tutturunuz.',
                        tipText: '5. orta ayağı mutlaka sarkma önleyici olarak monte ediniz.'
                      },
                      {
                        id: 'blk-qr-tv',
                        type: 'qr_block',
                        qrTitle: '📱 DUVARA SABİTLEME VİDEOSU',
                        qrUrl: 'https://youtube.com',
                        qrSubtitle: 'Devrilme emniyeti için duvara sabitleme adımını videodan izleyebilirsiniz.'
                      }
                    ]
                  })
                },
                {
                  id: 'nightstand',
                  title: '🛏️ Komodin / Sehpa',
                  subtitle: 'KMD-40 • 45x40x50cm',
                  desc: 'Çekmece rayı, klapa birleşimi ve pratik hızlı montaj',
                  badge: 'Kompakt',
                  load: () => setManual({
                    id: `manual-${Date.now()}`,
                    title: 'ÇEKMECELİ KOMODİN KURULUM KILAVUZU',
                    subTitle: 'Model: KMD-40 • Ölçü: 45x40x50 cm',
                    logoText: 'MINI DESIGN',
                    paperWidthPreset: 384,
                    supportPhone: 'WhatsApp: 0530 111 22 33',
                    showFooterLogo: true,
                    footerNote: 'Çekmece raylarını sağ ve sol yönüne dikkat ederek vidalayınız.',
                    blocks: [
                      {
                        id: 'blk-hw-kmd',
                        type: 'hardware_grid',
                        hardwareItems: [
                          { id: 'h1', code: 'A', name: 'Bilyalı Çekmece Rayı', count: '1 Takım', iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_wood },
                          { id: 'h2', code: 'B', name: 'Minifiks Vida Seti', count: '8 Takım', iconSvg: ASSEMBLY_HARDWARE_ICONS.screw_hex }
                        ]
                      },
                      {
                        id: 'blk-s1-kmd',
                        type: 'text',
                        stepNumber: '1. ADIM',
                        stepTitle: 'Çekmece Kasası & Ray Tutucular',
                        stepDescription: 'Çekmece yanlarını minifiks (B) ile birleştirip taban kontrasını kanala geçiriniz. Rayları (A) vidalayınız.',
                        tipText: 'Rayları ok yönü öne gelecek şekilde sıfırlayınız.'
                      }
                    ]
                  })
                },
                {
                  id: 'empty',
                  title: '✨ Sıfırdan Boş Kılavuz',
                  subtitle: 'Özel Tasarım',
                  desc: 'Tüm blokları temizleyip kendi özel montaj şemanızı oluşturun',
                  badge: 'Özel',
                  load: () => setManual({
                    id: `manual-${Date.now()}`,
                    title: 'ÖZEL ÜRÜN KURULUM KILAVUZU',
                    subTitle: 'Model / Ölçü Bilgisi',
                    logoText: 'MARKA ADINIZ',
                    paperWidthPreset: 576,
                    supportPhone: 'Destek Hattı: 05xx xxx xx xx',
                    showFooterLogo: true,
                    footerNote: 'Lütfen montaja başlamadan önce parçaları kontrol ediniz.',
                    blocks: [
                      {
                        id: 'blk-empty-text',
                        type: 'text',
                        stepNumber: '1. ADIM',
                        stepTitle: 'İlk Montaj Adımı Başlığı',
                        stepDescription: 'Buraya adım açıklamasını yazabilirsiniz.',
                        tipText: 'İpucu notunuzu ekleyin.'
                      }
                    ]
                  })
                }
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    p.load();
                    setIsPresetModalOpen(false);
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300">
                      {p.title}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{p.subtitle}</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeTab === 'editor'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Kılavuz Düzenleme"
        >
          <Wrench size={15} className="shrink-0" />
          {activeTab === 'editor' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Düzenle</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsPresetModalOpen(true)}
          className="h-9 w-9 rounded-full text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center cursor-pointer shrink-0"
          title="Hazır Şablonlar"
        >
          <Sparkles size={15} className="shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeTab === 'preview'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Baskı Önizleme"
        >
          <Eye size={15} className="shrink-0" />
          {activeTab === 'preview' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Önizleme</span>
          )}
        </button>
      </div>
    </div>
  );
};
