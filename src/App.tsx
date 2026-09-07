import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Printer, 
  Bluetooth, 
  BluetoothOff, 
  Languages, 
  FileText, 
  Type, 
  Image as ImageIcon, 
  Tag, 
  Globe, 
  Settings2, 
  X, 
  Plus, 
  Minus, 
  Smartphone, 
  Contrast, 
  Layout, 
  Bug, 
  Monitor, 
  Battery, 
  Share2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Contrast as ContrastIcon,
  Layers,
  PrinterCheck,
  Zap,
  Maximize2,
  Lock,
  Unlock,
  Move,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Terminal,
  Code,
  Eye,
  FileCode,
  ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { Progress } from './components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { ScrollArea } from './components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog';
import { useTranslation } from 'react-i18next';
import './i18n';
import { PrinterService } from './lib/printer';
import { printer } from './lib/printer-instance';
import { processImage, rotateCanvas, DitheringType } from './lib/image-processing';
import { parsePageRanges } from './lib/utils';
import { logger } from './lib/logger';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { fabric } from 'fabric';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
import Cropper from 'react-easy-crop';
import { DebugConsole } from './components/DebugConsole';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import ArchitectWorkspace from './components/ArchitectWorkspace';
import { CollageEditor } from './components/CollageEditor';
import { QRGenerator } from './components/QRGenerator';
import { TemplateLibrary } from './components/TemplateLibrary';
import { PrintHistoryModal } from './components/PrintHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { historyStorage } from './lib/history-storage';
import { upsertDeviceProfile, makeProfileId } from './lib/device-profiles';
import { PrinterProvider, usePrinter } from './context/PrinterContext';
import { EditorView } from './views/EditorView';
import { DocumentView } from './views/DocumentView';
import { BannerView } from './views/BannerView';
import { VariableFormDialog } from './components/VariableFormDialog';
import { extractVariables, resolveTemplate, VariableDef, type ResolvedBlock } from './lib/template-variables';
import { renderBlocks, renderProDesigned } from './lib/canvas-blocks';
import { ModeWizard } from './components/ModeWizard';
import { SmartHomeGrid } from './components/SmartHomeGrid';
import { MODES, getMode, setMode as saveMode, type ModeStorage } from './lib/business-modes';
import type { BusinessMode } from './lib/business-modes';
import { installPack, getInstalledTemplates } from './lib/mode-packs';
import { BatchView } from './views/BatchView';
import { PRO_TEMPLATES, PRO_EXAMPLES, type ProTemplate } from './lib/pro-templates';
import { PRO_CUSTOM_RENDERERS } from './lib/pro-renderers';
import { ProLiveDialog } from './components/ProLiveDialog';
import { PosView } from './views/PosView';
import { AppointmentView } from './views/AppointmentView';
import { ServiceView, type ServiceTicket } from './views/ServiceView';
import { WarehouseView } from './views/WarehouseView';
import { OrdersView } from './views/OrdersView';
import { TemplateStoreView } from './views/TemplateStoreView';
import { API_BASE } from './lib/api-base';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthDialog } from './components/AuthDialog';
import { ProWall } from './components/ProWall';
import { can, fetchEntitlements, FREE_LIMITS, type Entitlements } from './lib/entitlements';
import { Sparkles, Loader2, Save, Languages as OcrIcon, QrCode, Library, History as HistoryIcon, SlidersHorizontal, Sun, Columns, Rows, AlignHorizontalJustifyCenter, AlignVerticalJustifyCenter, User, Usb, Cpu, Download, MonitorCheck, Menu } from 'lucide-react';
import { ConnectionDialog } from './components/ConnectionDialog';
import { NavigationDrawer } from './components/NavigationDrawer';
import { RetroChiptunePlayerDialog } from './components/RetroChiptunePlayerDialog';
import { LABEL_DIMENSION_PRESETS, LabelDimensionPreset } from './lib/zpl';
import { UsbPrinterService, usbPrinter } from './lib/usb-printer';

// pdfjs worker configured via local Vite asset import above

export default function App() {
  return (
    <AuthProvider>
      <PrinterProvider>
        <AppShell />
      </PrinterProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { t, i18n } = useTranslation();
  const {
    isConnected,
    activeKind,
    deviceName: printerDeviceName,
    batteryLevel,
    activeProfile,
    refreshBattery,
    connect: handleConnectBle,
    disconnect: handleDisconnectBle,
    isUsbConnected,
    connectUsb,
    disconnectUsb,
    usbProtocol,
    setUsbProtocol,
    mediaType,
    setMediaType,
    gapMm,
    setGapMm,
    calibrateSensor,
    feedToNextGap
  } = usePrinter();
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  const handleDisconnect = () => {
    if (isUsbConnected) {
      disconnectUsb();
    } else {
      handleDisconnectBle();
    }
  };

  const handleConnect = () => {
    setShowConnectionDialog(true);
  };
  const { status: authStatus, token, email: authEmail, apiBase: authApiBase, continueAsGuest, logout } = useAuth();
  const DEFAULT_FREE_ENTS: Entitlements = {
    plan: 'free', source: 'cache', checkedAt: 0,
    features: { batchUnlimited: false, marketplace: false, pos: false, service: false, warehouse: false, customBranding: false }
  };
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(() => {
    try {
      const a = JSON.parse(localStorage.getItem('iprint_auth_v1') || 'null');
      return !(a?.token) && localStorage.getItem('iprint_guest_v1') !== 'true';
    } catch { return true; }
  });
  const [proWallState, setProWallState] = useState<{ open: boolean; title: string }>({ open: false, title: '' });
  const [trialLoading, setTrialLoading] = useState(false);
  const pendingViewRef = useRef<string | null>(null);

  type FeatureKey = 'batchUnlimited' | 'marketplace' | 'pos' | 'service' | 'warehouse';
  const FEATURE_BY_VIEW: Record<string, { feature: FeatureKey; title: string }> = {
    orders: { feature: 'marketplace', title: 'Pazaryeri Modülü' },
    pos: { feature: 'pos', title: 'Adisyon / POS' },
    service: { feature: 'service', title: 'Teknik Servis' },
    warehouse: { feature: 'warehouse', title: 'Depo Araçları' }
  };

  useEffect(() => {
    let alive = true;
    if (authStatus !== 'authenticated' || !token) { setEntitlements(null); return; }
    fetchEntitlements(token)
      .then(e => { if (alive) setEntitlements(e); })
      .catch(() => {});
    return () => { alive = false; };
  }, [authStatus, token]);

  const viewAllowed = (view: string): boolean => {
    const gate = FEATURE_BY_VIEW[view];
    if (!gate) return true;
    if (authStatus === 'guest') return true; // Misafir deneme modu
    if (authStatus === 'authenticated') return can(gate.feature, entitlements ?? DEFAULT_FREE_ENTS);
    return false;
  };

  const navigate = (view: string) => {
    if (!viewAllowed(view)) {
      pendingViewRef.current = view;
      setProWallState({ open: true, title: FEATURE_BY_VIEW[view]?.title ?? 'Pro Özellik' });
      return;
    }
    setActiveView(view as typeof activeView);
  };

  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      await fetch(`${authApiBase}/billing/trial`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).then(async r => { if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Deneme başlatılamadı'); });
      const e = await fetchEntitlements(token!);
      setEntitlements(e);
      setProWallState({ open: false, title: '' });
      logger.info('14 günlük Pro deneme başladı');
    } catch (err: any) {
      logger.error('Deneme hatası', err?.message || String(err));
    } finally { setTrialLoading(false); }
  };
  const [activeView, setActiveView] = useState<'menu' | 'editor' | 'image' | 'document' | 'banner' | 'collage' | 'tools' | 'templates' | 'archive' | 'batch' | 'pos' | 'service' | 'warehouse' | 'appointments' | 'orders'>('menu');
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [printDelay, setPrintDelay] = useState(2);
  const [dithering, setDithering] = useState<DitheringType>('floyd-steinberg');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printProgress, setPrintProgress] = useState(0);
  const [printStatus, setPrintStatus] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [darkness, setDarkness] = useState(50); // 0-100 Scale
  const [isExtraDark, setIsExtraDark] = useState(false);
  const [pageWidth, setPageWidth] = useState(384); // 57mm is ~384px
  const [pageHeight, setPageHeight] = useState(0); // 0 for infinite
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedAreaPercentages, setCroppedAreaPercentages] = useState<any>(null);
  const [isFreeCrop, setIsFreeCrop] = useState(false);
  const [cropLocked, setCropLocked] = useState(true); // aspect ratio lock
  const [cropCustomW, setCropCustomW] = useState(384);
  const [cropCustomH, setCropCustomH] = useState(200);
  
  // Editor State
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [lineHeight, setLineHeight] = useState<number>(1.35);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('center');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontFamily, setFontFamily] = useState('Outfit');
  const [customFonts, setCustomFonts] = useState<{name: string, url: string}[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  // SPEC-01 değişken motoru state'leri
  const [variableDefs, setVariableDefs] = useState<VariableDef[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [showVariableForm, setShowVariableForm] = useState(false);
  const skipVariableFormRef = useRef(false); // form submit sonrası formu tekrar açmamak için
  // SPEC-02: İş Modu
  const [modeConfig, setModeConfig] = useState<ModeStorage | null>(() => getMode());
  // Active Draft State (Global across modules)
  const [activeDraft, setActiveDraft] = useState<{ id: string; title: string; category: string; payload?: any } | null>(null);

  // 8-Bit Chiptune Retro Player Dialog State (from QR code scan or ?play=chiptune URL)
  const [chiptunePlayerState, setChiptunePlayerState] = useState<{
    open: boolean;
    songId?: string;
    title?: string;
  }>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const p = new URLSearchParams(window.location.search);
        if (p.get('play') === 'chiptune') {
          return {
            open: true,
            songId: p.get('s') || p.get('song') || undefined,
            title: p.get('t') || p.get('title') || undefined
          };
        }
      }
    } catch {}
    return { open: false };
  });

  const handleLoadDraft = (draft: any) => {
    setActiveDraft(draft);
    logger.info(`Taslak yüklendi: ${draft.title} (${draft.category})`);

    if (draft.category === 'editor' || draft.category === 'text' || draft.payload?.text) {
      if (draft.payload?.text) setText(draft.payload.text);
      if (draft.payload?.fontSize) setFontSize(draft.payload.fontSize);
      if (draft.payload?.fontFamily) setFontFamily(draft.payload.fontFamily);
      if (draft.payload?.alignment) setAlignment(draft.payload.alignment);
      if (draft.payload?.isBold !== undefined) setIsBold(draft.payload.isBold);
      if (draft.payload?.isItalic !== undefined) setIsItalic(draft.payload.isItalic);
      if (draft.payload?.isUnderline !== undefined) setIsUnderline(draft.payload.isUnderline);
      if (draft.payload?.lineHeight) setLineHeight(draft.payload.lineHeight);
      if (draft.payload?.letterSpacing !== undefined) setLetterSpacing(draft.payload.letterSpacing);
      setActiveView('editor');
    } else if (draft.category === 'banner') {
      if (draft.payload?.bannerText) setBannerText(draft.payload.bannerText);
      if (draft.payload?.bannerFontSize) setBannerFontSize(draft.payload.bannerFontSize);
      setActiveView('banner');
    } else if (draft.category === 'tools' || draft.category === 'qr') {
      setActiveView('tools');
    } else if (draft.category === 'collage') {
      setActiveView('collage');
    } else if (draft.category === 'image') {
      if (draft.previewDataUrl) {
        setSelectedImage(draft.previewDataUrl);
      }
      setActiveView('image');
    } else {
      if (draft.payload?.text) {
        setText(draft.payload.text);
        setActiveView('editor');
      } else if (draft.previewDataUrl) {
        setPreviewImage(draft.previewDataUrl);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
          };
          img.src = draft.previewDataUrl;
        }
        setIsPreviewOpen(true);
      } else {
        setActiveView('editor');
      }
    }
  };
  const [showModeWizard, setShowModeWizard] = useState(() => getMode() === null);
  // Profesyonel şablon akışı (Şablonlar galerisinden)
  const [proTplState, setProTplState] = useState<{ tpl: ProTemplate; values: Record<string, string> | null } | null>(null);

  const handleSelectMode = (m: BusinessMode) => {
    saveMode(m);
    setModeConfig(getMode());
    setShowModeWizard(false);
    installPack(m);
    logger.info(`İş modu seçildi: ${m} (+şablon paketi yüklendi)`);
  };

  // SPEC-08 servis kayıtları (yerel; Faz B bulut senkronu ayrı)
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>(() => {
    try { return JSON.parse(localStorage.getItem('iprint_service_tickets_v1') || '[]'); } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem('iprint_service_tickets_v1', JSON.stringify(serviceTickets));
  }, [serviceTickets]);

  const handleCreateTicket = (t: Omit<ServiceTicket, 'id' | 'createdAt' | 'updatedAt'>): ServiceTicket => {
    const counter = Number(localStorage.getItem('iprint_srv_counter_v1') || '0') + 1;
    localStorage.setItem('iprint_srv_counter_v1', String(counter));
    const ticket: ServiceTicket = {
      ...t,
      id: `SRV-${String(counter).padStart(4, '0')}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setServiceTickets(prev => [ticket, ...prev].slice(0, 200)); // quota koruması
    return ticket;
  };

  const handleUpdateTicketStatus = (id: string, status: ServiceTicket['status']) => {
    setServiceTickets(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: Date.now() } : t));
  };

  // Ortak: blokları canvas'a basıp hatta gönder (POS/Randevu/Servis/Depo kullanır)
  const handlePrintBlocks = async (
    build: (ctx: CanvasRenderingContext2D, w: number) => number,
    widthPx: number,
    _label: string
  ) => {
    const isAnyConnected = isConnected || isUsbConnected || usbPrinter.isConnected;
    if (!isAnyConnected) { 
      logger.warn('Yazdırma: yazıcı bağlı değil'); 
      setShowConnectionDialog(true);
      return; 
    }
    setIsPrinting(true);
    setPrintProgress(0);
    try {
      if (usbPrinter.isConnected || isUsbConnected) {
        setPrintStatus(`1/3 USB (${usbProtocol.toUpperCase()}) hazırlanıyor (${_label})...`);
      } else {
        setPrintStatus(`1/5 Uyanıyor (${_label})...`);
        await printer.wake();
        setPrintStatus('2/5 Hazırlanıyor...');
      }
      const measurer = document.createElement('canvas').getContext('2d')!;
      measurer.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      const contentH = build(measurer, widthPx);
      const c = document.createElement('canvas');
      c.width = widthPx;
      c.height = Math.ceil(contentH) + 4;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      ctx.fillStyle = '#000000';
      build(ctx, widthPx);
      const bitmap = processImage(ctx, c.width, c.height, dithering, {
        brightness: imageBrightness, contrast: imageContrast, invert: imageInvert
      }, { msbFirst: !isUsbConnected && !printer.isLuckJingle() });
      setPrintStatus(`4/5 Gönderiliyor (${c.width}x${c.height}, ${bitmap.length}B)...`);
      await printBitmapJob(bitmap, c.width, c.height);
      setPrintStatus('5/5 Tamamlandı!');
    } catch (err: any) {
      const m = err?.message || String(err);
      logger.error('Baskı bloğu hatası', m);
      setPrintStatus(`HATA: ${m.slice(0, 120)}`);
      alert(`Yazdırma hatası: ${m}`);
    } finally {
      setTimeout(() => setIsPrinting(false), 600);
    }
  };

  // --- Sektör modülü yazdırma adaptörleri ---
  const printResolvedBlocks = async (blocks: ResolvedBlock[], label: string, small = false) => {
    await handlePrintBlocks(
      (ctx, w) => renderBlocks(ctx, w, blocks, {
        fontSize: small ? Math.max(12, Math.round(fontSize * 0.7)) : fontSize,
        fontFamily, bold: isBold
      }),
      pageWidth,
      label
    );
  };

  const linesToBlocks = (lines: string[]): ResolvedBlock[] =>
    lines.map(l => l.startsWith('BARCODE:')
      ? { kind: 'barcode', value: l.slice(8), symbology: 'CODE128' }
      : { kind: 'text', value: l });

  const handlePosPrint = async (blocks: ResolvedBlock[], widthPx: number, label: string) => {
    if (widthPx !== pageWidth) setPageWidth(widthPx);
    await printResolvedBlocks(blocks, label);
  };

  const handleServicePrint = async (ticket: ServiceTicket, compact: boolean) => {
    const statusTr: Record<string, string> = {
      received: 'Kabul', inspecting: 'İnceleme', awaiting_approval: 'Onay Bekliyor',
      repairing: 'Tamirde', ready: 'HAZIR', delivered: 'Teslim Edildi'
    };
    const lines = compact
      ? [`SERVİS KARTI`, ticket.id, ticket.customerName, `${ticket.deviceType} ${ticket.model ?? ''}`.trim(), statusTr[ticket.status] ?? ticket.status]
      : [
          `TEKNİK SERVİS KABUL`, ticket.id,
          `Müşteri: ${ticket.customerName}`, `Tel: ${ticket.phone}`,
          `Cihaz: ${ticket.deviceType} ${ticket.brand ?? ''} ${ticket.model ?? ''}`.trim(),
          `Arıza: ${ticket.issue}`,
          ticket.accessories ? `Aksesuar: ${ticket.accessories}` : '',
          `Tarih: ${new Date(ticket.createdAt).toLocaleDateString('tr-TR')}`,
          '', `Durum: ${statusTr[ticket.status] ?? ticket.status}`
        ].filter(Boolean);
    await printResolvedBlocks([...linesToBlocks(lines), { kind: 'barcode', value: ticket.id, symbology: 'CODE128' }], 'servis', compact);
  };

  const handleWarehousePrint = async (labels: string[][]) => {
    for (const lines of labels) {
      await printResolvedBlocks(linesToBlocks(lines), 'depo');
      await new Promise(r => setTimeout(r, 400));
    }
  };
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [pdfRotation, setPdfRotation] = useState(0);
  const [isCustomPageEnabled, setIsCustomPageEnabled] = useState(false);
  const [printQuality, setPrintQuality] = useState<'draft' | 'normal' | 'fine'>('normal');
  const [savedCrops, setSavedCrops] = useState<{id: string, name: string, crops: any[] }[]>(() => {
    const saved = localStorage.getItem('iprint_saved_crops_v3');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Standart (57mm)', crops: [{x:0, y:0, width:384, height:200, percent: {x:0, y:0, width:100, height:50}}] }
    ];
  });
  const [activeMultiCrops, setActiveMultiCrops] = useState<any[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // History and Preset States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [imageBrightness, setImageBrightness] = useState(0); // -100 to 100
  const [imageContrast, setImageContrast] = useState(0);     // -100 to 100
  const [imageInvert, setImageInvert] = useState(false);
  const [autoRotateWide, setAutoRotateWide] = useState(true);

  // Image State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // PDF State
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [activePdfIndex, setActivePdfIndex] = useState(0);
  const [printCopies, setPrintCopies] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [pdfPageRange, setPdfPageRange] = useState('1');
  const [isPdfCropping, setIsPdfCropping] = useState(false);

  // Banner State
  const [bannerText, setBannerText] = useState('');
  const [bannerOrientation, setBannerOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [bannerType, setBannerType] = useState<'banner' | 'etiket'>('banner');
  const [bannerFontSize, setBannerFontSize] = useState(48);
  const [printAllFiles, setPrintAllFiles] = useState(false);

  const [prePrintFeed, setPrePrintFeed] = useState(0); // mm to feed before print
  const [postPrintFeed, setPostPrintFeed] = useState(20); // mm — standart yırtma payı besleme
  const [feedAmount, setFeedAmount] = useState(120); // dots to feed manually
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [useArchitect, setUseArchitect] = useState(false);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const architectCanvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [multiCropLayout, setMultiCropLayout] = useState<'vertical' | 'horizontal' | 'grid'>('vertical');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('iprint_dark_mode') === 'true');
  const [showConsole, setShowConsole] = useState(() => localStorage.getItem('iprint_show_console') === 'true');

  const resetProject = () => {
    setSelectedImage(null);
    setActiveMultiCrops([]);
    setSelectedZoneId(null);
    setActiveProfileId(null);
    setIsCropping(false);
    logger.info('Proje temizlendi');
  };

  useEffect(() => {
    localStorage.setItem('iprint_dark_mode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('iprint_show_console', showConsole.toString());
  }, [showConsole]);

  // Restore remembered settings when a known printer connects
  useEffect(() => {
    if (!activeProfile) return;
    setDarkness(activeProfile.darkness);
    setIsExtraDark(activeProfile.isExtraDark);
    setPageWidth(activeProfile.pageWidth);
    setPrintDelay(activeProfile.printDelay);
    logger.info(`"${activeProfile.deviceName}" profili uygulandı (protokol: ${activeProfile.protocol})`);
  }, [activeProfile]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(newLang);
  };

  const handleSwitchChannel = () => {
    logger.info('Kanal değiştiriliyor...');
    printer.switchCharacteristic();
  };

  const handleAdvancePaper = async (amount: number = 25) => {
    if (!isConnected) {
      logger.warn('Kağıt sürme: Yazıcı bağlı değil');
      return;
    }
    try {
      const mm = amount <= 60 ? amount : Math.round(amount / 8);
      await printer.feedPaper(mm);
      logger.info(`Kağıt İlerletildi: ~${mm}mm`);
    } catch (err) {
      logger.error('Kağıt sürme hatası:', err);
    }
  };

  const onTestDarkness = async () => {
    if (!isConnected) {
      logger.warn('Yazıcıya bağlanın!');
      return;
    }
    
    logger.info('Koyuluk testi başlatılıyor...');
    if (printer.isLuckJingle()) {
      setIsExtraDark(true);
      await printer.wake();
      await printer.sendData(PrinterService.setIntensity(100), 20);
      logger.info('LuckJingle: Ekstra koyu mod aktif edildi.');
    } else {
      const encoder = new TextEncoder();
      await printer.sendData(PrinterService.setIntensity(100));
      await printer.sendData(encoder.encode('\r\n[KOYULUK TESTI - OK]\r\n'));
      await printer.feedPaper(15);
    }
  };



  useEffect(() => {
    if (useArchitect && selectedImage && architectCanvasRef.current) {
      const container = architectCanvasRef.current.parentElement;
      if (!container || container.clientWidth === 0) {
        logger.warn('Architect container not ready or zero-size, retrying...');
        return;
      }
      
      const fc = new fabric.Canvas(architectCanvasRef.current, {
        width: container.clientWidth,
        height: container.clientHeight,
        backgroundColor: '#0a0a0a',
        preserveObjectStacking: true
      });
      fabricRef.current = fc;

      fabric.Image.fromURL(selectedImage, (img) => {
        // Center and scale image to fit
        const scale = Math.min(fc.width! / img.width!, fc.height! / img.height!) * 0.9;
        img.scale(scale);
        img.set({
          left: (fc.width! - img.width! * scale) / 2,
          top: (fc.height! - img.height! * scale) / 2,
          selectable: false,
          hoverCursor: 'default'
        });
        fc.add(img);
        fc.sendToBack(img);

        // Add rectangles for activeMultiCrops
        activeMultiCrops.forEach((zone, idx) => {
          const rect = new fabric.Rect({
            left: img.left! + (zone.percent.x * img.getScaledWidth()) / 100,
            top: img.top! + (zone.percent.y * img.getScaledHeight()) / 100,
            width: (zone.percent.width * img.getScaledWidth()) / 100,
            height: (zone.percent.height * img.getScaledHeight()) / 100,
            angle: zone.rotation || 0,
            fill: 'rgba(16,185,129,0.2)',
            stroke: '#10b981',
            strokeWidth: 2,
            cornerColor: '#10b981',
            cornerSize: 8,
            transparentCorners: false,
            data: { id: zone.id }
          });
          fc.add(rect);
        });

        fc.renderAll();
      });

      const syncFromFabric = () => {
        const bgImg = fc.getObjects('image')[0] as fabric.Image;
        if (!bgImg) return;

        const updatedCrops = fc.getObjects('rect').map(r => {
          const rect = r as fabric.Rect;
          const imgW = bgImg.getScaledWidth();
          const imgH = bgImg.getScaledHeight();
          
          return {
            id: (rect as any).data?.id || Math.random().toString(36).substr(2, 9),
            rotation: rect.angle,
            percent: {
              x: ((rect.left! - bgImg.left!) / imgW) * 100,
              y: ((rect.top! - bgImg.top!) / imgH) * 100,
              width: (rect.getScaledWidth() / imgW) * 100,
              height: (rect.getScaledHeight() / imgH) * 100
            },
            // Fallback pixels for backward compatibility
            width: rect.getScaledWidth(),
            height: rect.getScaledHeight(),
            x: rect.left! - bgImg.left!,
            y: rect.top! - bgImg.top!
          };
        });
        setActiveMultiCrops(updatedCrops);
      };

      fc.on('object:modified', syncFromFabric);
      fc.on('object:added', syncFromFabric);
      fc.on('object:removed', syncFromFabric);

      return () => {
        // Critical: Fabric wraps the canvas in a .canvas-container div.
        // We must dispose and ensure the actual DOM nodes are handled before React's cleanup.
        logger.debug('Cleaning up Architect canvas...');
        try {
          fc.dispose();
        } catch (e) {
          logger.error('Fabric dispose error', e);
        }
        fabricRef.current = null;
      };
    }
  }, [useArchitect, selectedImage]);

  useEffect(() => {
    let interval: any;
    if (isConnected) {
      const pollBattery = async () => {
        await refreshBattery();
        if (batteryLevel === null) {
          try {
            // Send multiple status requests to increase response chance
            await printer.sendData(PrinterService.createLuckJinglePacket(0xA8, 0x00));
            await printer.sendData(PrinterService.createLuckJinglePacket(0xA3, 0x00));
          } catch {
            // Status probe is best-effort; printer may not support these commands
          }
        }
      };
      pollBattery();
      interval = setInterval(pollBattery, 30000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const addArchitectZone = () => {
    if (!fabricRef.current) return;
    const fc = fabricRef.current;
    const bgImg = fc.getObjects('image')[0] as fabric.Image;
    if (!bgImg) return;

    const rect = new fabric.Rect({
      left: bgImg.left! + bgImg.getScaledWidth() * 0.25,
      top: bgImg.top! + bgImg.getScaledHeight() * 0.25,
      width: bgImg.getScaledWidth() * 0.5,
      height: bgImg.getScaledHeight() * 0.2,
      fill: 'rgba(16,185,129,0.2)',
      stroke: '#10b981',
      strokeWidth: 2,
      cornerColor: '#10b981',
      cornerSize: 8,
      transparentCorners: false,
      data: { id: Math.random().toString(36).substr(2, 9) }
    });
    fc.add(rect);
    fc.setActiveObject(rect);
    fc.renderAll();
    
    // Trigger initial sync for the new zone
    const imgW = bgImg.getScaledWidth();
    const imgH = bgImg.getScaledHeight();
    const newZone = {
      id: (rect as any).data.id,
      rotation: 0,
      percent: {
        x: ((rect.left! - bgImg.left!) / imgW) * 100,
        y: ((rect.top! - bgImg.top!) / imgH) * 100,
        width: (rect.getScaledWidth() / imgW) * 100,
        height: (rect.getScaledHeight() / imgH) * 100
      },
      width: rect.getScaledWidth(),
      height: rect.getScaledHeight(),
      x: rect.left! - bgImg.left!,
      y: rect.top! - bgImg.top!
    };
    setActiveMultiCrops([...activeMultiCrops, newZone]);
  };



  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setIsCropping(false); // Changed: Don't start cropping automatically
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFiles(prev => [...prev, file]);
      e.target.value = '';
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPercentages(croppedArea);
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const applyCrop = async () => {
    if (!selectedImage) return;
    
    // If we have multi-crops, we'll join them all vertically
    const cropsToApply = activeMultiCrops.length > 0 
      ? activeMultiCrops 
      : (croppedAreaPixels ? [{ ...croppedAreaPixels, id: 'temp' }] : []);

    if (cropsToApply.length === 0) return;

    const img = new Image();
    img.src = selectedImage;
    await new Promise(resolve => img.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate total layout
    let totalHeight = 0;
    let maxWidth = 0;
    
    if (multiCropLayout === 'vertical') {
      totalHeight = cropsToApply.reduce((acc, c) => acc + c.height, 0);
      maxWidth = Math.max(...cropsToApply.map(c => c.width));
    } else if (multiCropLayout === 'horizontal') {
      totalHeight = Math.max(...cropsToApply.map(c => c.height));
      maxWidth = cropsToApply.reduce((acc, c) => acc + c.width, 0);
    } else {
      // Grid: 2 columns
      const rows = Math.ceil(cropsToApply.length / 2);
      maxWidth = Math.max(...cropsToApply.map(c => c.width)) * 2;
      totalHeight = rows * Math.max(...cropsToApply.map(c => c.height));
    }

    canvas.width = maxWidth;
    canvas.height = totalHeight;

    let currentX = 0;
    let currentY = 0;
    
    cropsToApply.forEach((zone, idx) => {
      // Calculate absolute pixels from normalized percentages if available, otherwise fallback to pixels
      const x = zone.percent ? (img.width * zone.percent.x) / 100 : zone.x;
      const y = zone.percent ? (img.height * zone.percent.y) / 100 : zone.y;
      const w = zone.percent ? (img.width * zone.percent.width) / 100 : zone.width;
      const h = zone.percent ? (img.height * zone.percent.height) / 100 : zone.height;
      const rotation = zone.rotation || 0;

      ctx.save();
      
      let targetX = 0;
      let targetY = 0;
      
      if (multiCropLayout === 'vertical') {
        targetX = (maxWidth - w) / 2;
        targetY = currentY;
        currentY += h;
      } else if (multiCropLayout === 'horizontal') {
        targetX = currentX;
        targetY = (totalHeight - h) / 2;
        currentX += w;
      } else {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cellW = maxWidth / 2;
        const cellH = totalHeight / Math.ceil(cropsToApply.length / 2);
        targetX = col * cellW + (cellW - w) / 2;
        targetY = row * cellH + (cellH - h) / 2;
      }

      // Draw rotated crop
      ctx.translate(targetX + w/2, targetY + h/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, x, y, w, h, -w/2, -h/2, w, h);
      ctx.restore();
    });
    
    if (isPdfCropping) {
      setSelectedImage(canvas.toDataURL());
      setActiveView('image');
      setIsPdfCropping(false);
    } else {
      setSelectedImage(canvas.toDataURL());
    }
    
    // Explicitly set these to ensure UI updates after DOM is stable
    setTimeout(() => {
      setIsCropping(false);
      setActiveMultiCrops([]);
      setSelectedZoneId(null);
      setUseArchitect(false); // Force exit architect mode on apply
      logger.info('Kırpma başarıyla uygulandı ve görsele aktarıldı');
    }, 100);
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;
    setIsRemovingBg(true);
    try {
      // Lazy-load the heavy ONNX model bundle only when actually needed
      const { removeBackground } = await import('./lib/background-removal');
      const result = await removeBackground(selectedImage);
      setSelectedImage(result);
      logger.info('Arkaplan başarıyla silindi');
    } catch (err) {
      logger.error('Arkaplan silme hatası');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleOCR = async () => {
    if (!selectedImage) return;
    setIsOcrLoading(true);
    try {
      // Lazy-load Tesseract (WASM + language data) only when actually needed
      const { performOCR } = await import('./lib/ocr');
      const text = await performOCR(selectedImage);
      setText(prev => prev + (prev ? '\n' : '') + text);
      setActiveView('editor');
      logger.info('OCR başarıyla tamamlandı, metin editöre eklendi');
    } catch (err) {
      logger.error('OCR hatası');
    } finally {
      setIsOcrLoading(false);
    }
  };

  const startPdfCrop = async () => {
    const activePdf = pdfFiles[activePdfIndex];
    if (!activePdf) return;
    try {
      if (activePdf.name.toLowerCase().endsWith('.txt') || activePdf.type === 'text/plain') {
        const txt = await activePdf.text();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.font = '14px monospace';
        const lines = txt.split('\n');
        const maxWidth = 760;
        const wrappedLines: string[] = [];
        
        lines.forEach(line => {
          let currentLine = '';
          const words = line.split(' ');
          words.forEach(word => {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            if (ctx.measureText(testLine).width > maxWidth) {
              wrappedLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          wrappedLines.push(currentLine);
        });
        
        canvas.width = 800;
        canvas.height = Math.max(300, wrappedLines.length * 22 + 60);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '14px monospace';
        ctx.textBaseline = 'top';
        wrappedLines.forEach((line, i) => {
          ctx.fillText(line, 20, 30 + i * 22);
        });
        setSelectedImage(canvas.toDataURL());
      } else {
        const arrayBuffer = await activePdf.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pages = parsePageRanges(pdfPageRange, pdf.numPages);
        const pageNum = pages[0] || 1;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 }); // High res for crop
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await (page as any).render({ canvasContext: ctx, viewport }).promise;
        setSelectedImage(canvas.toDataURL());
      }
      setIsPdfCropping(true);
      setIsCropping(true);
      setActiveView('image'); // Switch to image view to show the cropper
    } catch (err) {
      logger.error('PDF Crop Hatası: ' + err);
    }
  };

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fontName = file.name.split('.')[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const url = event.target?.result as string;
      const fontFace = new FontFace(fontName, `url(${url})`);
      try {
        await fontFace.load();
        (document as any).fonts.add(fontFace);
        setCustomFonts(prev => [...prev, { name: fontName, url }]);
        setFontFamily(fontName);
        logger.info(`Font yüklendi: ${fontName}`);
      } catch (err) {
        logger.error('Font yükleme hatası');
      }
    };
    reader.readAsDataURL(file);
  };

  const addCropZone = () => {
    if (!croppedAreaPixels || !croppedAreaPercentages) return;
    const newZone = {
      id: Math.random().toString(36).substr(2, 9),
      ...croppedAreaPixels,
      percent: croppedAreaPercentages // Precision storage
    };
    setActiveMultiCrops([...activeMultiCrops, newZone]);
  };

  const removeCropZone = (id: string) => {
    setActiveMultiCrops(activeMultiCrops.filter(z => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);
  };

  const updateCropZone = () => {
    if (!selectedZoneId || !croppedAreaPixels || !croppedAreaPercentages) return;
    setActiveMultiCrops(activeMultiCrops.map(z => 
      z.id === selectedZoneId ? { ...z, ...croppedAreaPixels, percent: croppedAreaPercentages } : z
    ));
    logger.info('Bölge güncellendi');
  };

  const saveCurrentCrop = () => {
    const list = activeMultiCrops.length > 0 ? activeMultiCrops : (croppedAreaPixels ? [croppedAreaPixels] : []);
    if (list.length === 0) {
      alert('Önce bir kırpma alanı belirleyin veya bölge ekleyin!');
      return;
    }

    const name = prompt('Bu kırpma profiline bir isim verin:', `Profil ${savedCrops.length + 1}`);
    if (name) {
      const newProfile = { 
        id: Date.now().toString(), 
        name, 
        crops: list.map(({id, ...rest}: any) => rest) 
      };
      const updated = [...savedCrops, newProfile];
      setSavedCrops(updated);
      localStorage.setItem('iprint_saved_crops_v3', JSON.stringify(updated));
      setActiveProfileId(newProfile.id);
    }
  };

  const applySavedProfile = (profileId: string) => {
    const profile = savedCrops.find(p => p.id === profileId);
    if (profile) {
      // Add profile crops to current session, preserving layout
      const profileCropsWithIds = profile.crops.map(c => ({
        ...c,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setActiveMultiCrops(profileCropsWithIds);
      setActiveProfileId(profileId);
      logger.info(`"${profile.name}" profili uygulandı`);
    }
  };

  const deleteSavedProfile = (id: string) => {
    const updated = savedCrops.filter(p => p.id !== id);
    setSavedCrops(updated);
    localStorage.setItem('iprint_saved_crops_v3', JSON.stringify(updated));
    if (activeProfileId === id) setActiveProfileId(null);
  };

  const movePdf = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...pdfFiles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    setPdfFiles(newFiles);
    setActivePdfIndex(targetIndex);
  };

  const rotateCurrentCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = oldWidth;
    tempCanvas.height = oldHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    tempCtx.drawImage(canvas, 0, 0);

    canvas.width = oldHeight;
    canvas.height = oldWidth;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(tempCanvas, -oldWidth / 2, -oldHeight / 2);
    ctx.restore();

    setPreviewImage(canvas.toDataURL('image/png'));
  };

  const generatePreview = async (silent: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error('Canvas bulunamadı!');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      logger.error('Canvas context alınamadı!');
      return;
    }

    logger.info(`Önizleme oluşturuluyor: ${activeView} (silent: ${silent})`);

    let height = 100;
    
    if (activeView === 'editor') {
      let textToRender = text;
      let renderMode: 'plain' | 'html' = 'plain';
      
      // Check if HTML template is being used
      if (showHtmlEditor && htmlTemplate && htmlTemplate.trim().length > 0) {
        renderMode = 'html';
        const now = new Date();
        const formattedDate = now.toLocaleDateString('tr-TR');
        const formattedTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        const lines = text.split('\n');
        const firstLine = lines[0] || 'Başlık';
        const bodyLines = lines.slice(1).join('<br>') || text.replace(/\n/g, '<br>');

        // Replace all variables in HTML template (case-insensitive for user friendliness)
        const processedHtml = htmlTemplate
          .replace(/{{BASLIK}}|{{baslik}}|{{TITLE}}|{{title}}/gi, firstLine)
          .replace(/{{METIN}}|{{metin}}|{{TEXT}}|{{text}}/gi, bodyLines)
          .replace(/{{TARIH}}|{{tarih}}|{{DATE}}|{{date}}/gi, formattedDate)
          .replace(/{{SAAT}}|{{saat}}|{{TIME}}|{{time}}/gi, formattedTime);
        
        // Extract plain text from HTML for canvas rendering
        // Handle tables by converting to multiline text with formatted columns
        textToRender = processedHtml
          .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (match) => {
            let tableText = '';
            // Extract rows
            const rows = match.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
            rows.forEach((row) => {
              const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
              const rowContent = cells.map(cell => cell.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
              if (rowContent.length > 0) {
                tableText += rowContent.join(' | ') + '\n';
              }
            });
            return tableText;
          })
          .replace(/<li[^>]*>/gi, '\n• ')
          .replace(/<div[^>]*>|<\/div>/gi, '\n')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<hr\s*\/?>/gi, '\n' + '─'.repeat(24) + '\n')
          .replace(/<p[^>]*>|<\/p>/gi, '\n')
          .replace(/<h[1-6][^>]*>/gi, '\n')
          .replace(/<\/h[1-6]>/gi, '\n')
          .replace(/<b>|<\/b>|<strong>|<\/strong>/gi, '')
          .replace(/<small[^>]*>|<\/small>/gi, '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/\n\s*\n/g, '\n')
          .trim();
      }
      
      // Değişken motoru: şablonda {Degisken} varsa önce form açılır (SPEC-01 §6.2)
      if (activeView === 'editor' && !skipVariableFormRef.current) {
        const defs = extractVariables(textToRender);
        if (defs.length > 0) {
          setVariableDefs(defs);
          setShowVariableForm(true);
          return;
        }
      }

      if (activeView === 'editor' && variableDefs.length > 0) {
        // Değişkenli çizim: blok tabanlı renderer (barkod/QR dahil)
        const resolved = resolveTemplate(textToRender, variableValues, variableDefs);
        const renderOpts = { fontSize, fontFamily, bold: isBold, align: alignment as any, padding: 12 };
        const measurer = document.createElement('canvas').getContext('2d')!;
        measurer.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
        const contentH = renderBlocks(measurer, pageWidth, resolved, renderOpts);
        height = pageHeight > 0 ? Math.max(pageHeight, contentH) : Math.ceil(contentH);
        canvas.width = pageWidth;
        canvas.height = height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, pageWidth, height);
        ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
        ctx.fillStyle = '#000000';
        renderBlocks(ctx, pageWidth, resolved, renderOpts);
        setPreviewImage(canvas.toDataURL());
        if (!silent) setIsPreviewOpen(true);
        skipVariableFormRef.current = false;
        return;
      }

      if (letterSpacing) {
        (ctx as any).letterSpacing = `${letterSpacing}px`;
      } else {
        (ctx as any).letterSpacing = '0px';
      }
      ctx.font = `${isBold ? 'bold ' : ''}${isItalic ? 'italic ' : ''}${isUnderline ? 'underline ' : ''}${fontSize}px ${fontFamily}`;
      const lines = textToRender.split('\n');
      const maxWidth = pageWidth - 20;
      const wrappedLines: string[] = [];
      lines.forEach(line => {
        let currentLine = '';
        const words = line.split(' ');
        words.forEach(word => {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          if (ctx.measureText(testLine).width > maxWidth) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        wrappedLines.push(currentLine);
      });

      const activeLineHeight = lineHeight || 1.35;
      const calculatedHeight = Math.ceil(wrappedLines.length * fontSize * activeLineHeight + 40);
      height = pageHeight > 0 ? Math.max(pageHeight, calculatedHeight) : calculatedHeight;
      canvas.width = pageWidth;
      canvas.height = height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, pageWidth, height);
      ctx.fillStyle = 'black';
      if (letterSpacing) {
        (ctx as any).letterSpacing = `${letterSpacing}px`;
      } else {
        (ctx as any).letterSpacing = '0px';
      }
      ctx.font = `${isBold ? 'bold ' : ''}${isItalic ? 'italic ' : ''}${isUnderline ? 'underline ' : ''}${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.textAlign = alignment === 'justify' ? 'left' : alignment;
      const padding = 12;
      const x = alignment === 'center' ? pageWidth / 2 : alignment === 'right' ? pageWidth - padding : padding;
      wrappedLines.forEach((line, i) => {
        const y = 20 + i * fontSize * activeLineHeight;
        if (alignment === 'justify' && i < wrappedLines.length - 1) {
          const words = line.split(' ');
          if (words.length > 1) {
            const totalWordsWidth = words.reduce((acc, word) => acc + ctx.measureText(word).width, 0);
            const spaceWidth = (pageWidth - 2 * padding - totalWordsWidth) / (words.length - 1);
            let currentX = padding;
            words.forEach((word) => {
              ctx.fillText(word, currentX, y);
              currentX += ctx.measureText(word).width + spaceWidth;
            });
          } else { ctx.fillText(line, padding, y); }
        } else { ctx.fillText(line, x, y); }
      });
      setPreviewImage(canvas.toDataURL());
      if (!silent) setIsPreviewOpen(true);
    } else if (activeView === 'image' && selectedImage) {
      const img = new Image();
      img.onload = () => {
        const cropsToPreview = activeMultiCrops.length > 0 ? activeMultiCrops : (croppedAreaPixels ? [croppedAreaPixels] : []);
        
        if (cropsToPreview.length > 0) {
          // Join all crops based on layout
          let totalH = 0;
          let totalW = 0;
          
          if (multiCropLayout === 'vertical') {
            totalH = cropsToPreview.reduce((acc, c) => acc + (c.percent ? (img.height * c.percent.height)/100 : c.height), 0);
            totalW = Math.max(...cropsToPreview.map(c => c.percent ? (img.width * c.percent.width)/100 : c.width));
          } else if (multiCropLayout === 'horizontal') {
            totalH = Math.max(...cropsToPreview.map(c => c.percent ? (img.height * c.percent.height)/100 : c.height));
            totalW = cropsToPreview.reduce((acc, c) => acc + (c.percent ? (img.width * c.percent.width)/100 : c.width), 0);
          } else {
            const rows = Math.ceil(cropsToPreview.length / 2);
            totalW = Math.max(...cropsToPreview.map(c => c.percent ? (img.width * c.percent.width)/100 : c.width)) * 2;
            totalH = rows * Math.max(...cropsToPreview.map(c => c.percent ? (img.height * c.percent.height)/100 : c.height));
          }
          
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (!tempCtx) return;
          tempCanvas.width = totalW;
          tempCanvas.height = totalH;
          tempCtx.fillStyle = 'white';
          tempCtx.fillRect(0, 0, totalW, totalH);
          
          let curX = 0, curY = 0;
          cropsToPreview.forEach((z, idx) => {
            const x = z.percent ? (img.width * z.percent.x) / 100 : z.x;
            const y = z.percent ? (img.height * z.percent.y) / 100 : z.y;
            const w = z.percent ? (img.width * z.percent.width) / 100 : z.width;
            const h = z.percent ? (img.height * z.percent.height) / 100 : z.height;
            const rot = z.rotation || 0;
            
            tempCtx.save();
            let tx = 0, ty = 0;
            if (multiCropLayout === 'vertical') {
              tx = (totalW - w) / 2; ty = curY; curY += h;
            } else if (multiCropLayout === 'horizontal') {
              tx = curX; ty = (totalH - h) / 2; curX += w;
            } else {
              const rows = Math.ceil(cropsToPreview.length / 2);
              const row = Math.floor(idx / 2);
              const col = idx % 2; 
              const cw = totalW / 2; 
              const ch = totalH / rows;
              tx = col * cw + (cw - w) / 2; ty = row * ch + (ch - h) / 2;
            }
            
            tempCtx.translate(tx + w/2, ty + h/2);
            tempCtx.rotate((rot * Math.PI) / 180);
            tempCtx.drawImage(img, x, y, w, h, -w/2, -h/2, w, h);
            tempCtx.restore();
          });
          
          const scale = pageWidth / totalW;
          canvas.width = pageWidth;
          canvas.height = Math.round(totalH * scale);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        } else {
          const scale = pageWidth / img.width;
          canvas.width = pageWidth;
          canvas.height = Math.round(img.height * scale);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        setPreviewImage(canvas.toDataURL());
        if (!silent) setIsPreviewOpen(true);
      };
      img.src = selectedImage;
    } else if (activeView === 'document' && pdfFiles.length > 0) {
      const activePdf = pdfFiles[activePdfIndex];
      if (!activePdf) return;
      try {
        if (activePdf.name.toLowerCase().endsWith('.txt') || activePdf.type === 'text/plain') {
          const txt = await activePdf.text();
          ctx.font = '13px monospace';
          const lines = txt.split('\n');
          const maxWidth = pageWidth - 20;
          const wrappedLines: string[] = [];
          
          lines.forEach(line => {
            let currentLine = '';
            const words = line.split(' ');
            words.forEach(word => {
              const testLine = currentLine ? currentLine + ' ' + word : word;
              if (ctx.measureText(testLine).width > maxWidth) {
                wrappedLines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            });
            wrappedLines.push(currentLine);
          });
          
          const calculatedHeight = Math.max(120, Math.ceil(wrappedLines.length * 18 + 40));
          height = pageHeight > 0 ? Math.max(pageHeight, calculatedHeight) : calculatedHeight;
          canvas.width = pageWidth;
          canvas.height = height;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, pageWidth, height);
          ctx.fillStyle = 'black';
          ctx.font = '13px monospace';
          ctx.textBaseline = 'top';
          wrappedLines.forEach((line, i) => {
            ctx.fillText(line, 10, 15 + i * 18);
          });
          setPreviewImage(canvas.toDataURL());
          if (!silent) setIsPreviewOpen(true);
        } else {
          const arrayBuffer = await activePdf.arrayBuffer();
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const pages = parsePageRanges(pdfPageRange, pdf.numPages);
          
          const pageCanvases: HTMLCanvasElement[] = [];
          let totalHeight = 0;
          
          for (const pageNum of pages) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1, rotation: pdfRotation });
            const scale = (pageWidth / viewport.width) * pdfScale;
            const scaledViewport = page.getViewport({ scale, rotation: pdfRotation });
            const pageH = Math.round(scaledViewport.height);
            
            const pCanvas = document.createElement('canvas');
            pCanvas.width = pageWidth;
            pCanvas.height = pageH;
            const pCtx = pCanvas.getContext('2d')!;
            pCtx.fillStyle = 'white';
            pCtx.fillRect(0, 0, pageWidth, pageH);
            await (page as any).render({ canvasContext: pCtx, viewport: scaledViewport }).promise;
            
            pageCanvases.push(pCanvas);
            totalHeight += pageH;
          }
          
          canvas.width = pageWidth;
          canvas.height = totalHeight || 100;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          let currentY = 0;
          for (const pCanvas of pageCanvases) {
            ctx.drawImage(pCanvas, 0, currentY);
            currentY += pCanvas.height;
          }
          
          setPreviewImage(canvas.toDataURL());
          if (!silent) setIsPreviewOpen(true);
        }
      } catch (err) {
        logger.error('PDF işleme hatası: ' + err);
        setPrintStatus('PDF Yüklenemedi! Dosya veya format sorunu olabilir.');
        setTimeout(() => setPrintStatus(''), 3000);
      }
    } else if (activeView === 'banner') {
      if (previewImage) {
        if (!silent) setIsPreviewOpen(true);
        return;
      }
      if (bannerText) {
        if (bannerType === 'etiket') {
        canvas.width = pageWidth;
        if (bannerOrientation === 'horizontal') {
          canvas.height = Math.max(80, bannerFontSize + 44);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Subtle border for label style
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

          ctx.font = `bold ${bannerFontSize}px sans-serif`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bannerText, pageWidth / 2, canvas.height / 2);
        } else {
          const chars = bannerText.split('');
          canvas.height = Math.max(100, chars.length * (bannerFontSize * 1.1) + 40);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

          ctx.font = `bold ${bannerFontSize}px sans-serif`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          chars.forEach((char, i) => {
            ctx.fillText(char, pageWidth / 2, 20 + i * (bannerFontSize * 1.1));
          });
        }
      } else {
        ctx.font = `bold ${bannerFontSize}px sans-serif`;
        if (bannerOrientation === 'horizontal') {
          const textWidth = ctx.measureText(bannerText).width;
          canvas.width = pageWidth;
          canvas.height = textWidth + 50;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.translate(pageWidth / 2, canvas.height / 2);
          ctx.rotate(Math.PI / 2);
          ctx.font = `bold ${bannerFontSize}px sans-serif`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(bannerText, 0, 0);
          ctx.restore();
        } else {
          const chars = bannerText.split('');
          canvas.width = pageWidth;
          canvas.height = chars.length * (bannerFontSize * 1.15) + 40;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = `bold ${bannerFontSize}px sans-serif`;
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          chars.forEach((char, i) => {
            ctx.fillText(char, pageWidth / 2, 20 + i * (bannerFontSize * 1.15));
          });
        }
      }
      setPreviewImage(canvas.toDataURL());
      if (!silent) setIsPreviewOpen(true);
      }
    }
  };

  // Auto-preview for banner
  useEffect(() => {
    if (activeView === 'banner' && bannerText && !previewImage) {
      const timer = setTimeout(() => generatePreview(true), 300);
      return () => clearTimeout(timer);
    }
  }, [bannerText, bannerType, bannerOrientation, bannerFontSize, activeView]);

  // Auto-preview for document
  useEffect(() => {
    if (activeView === 'document' && pdfFiles.length > 0) {
      const timer = setTimeout(() => generatePreview(true), 300);
      return () => clearTimeout(timer);
    }
  }, [activeView, pdfFiles, activePdfIndex, pdfScale, pdfRotation, pdfPageRange, pageWidth]);

  // Tek bitmap'i aktif protokole göre yazdırır (handlePrint + toplu baskı ortak kullanır)
      const printBitmapJob = async (bitmap: Uint8Array, w: number, h: number) => {
        // 1. USB / Zebra Doğrudan Yazdırma
        if (usbPrinter.isConnected || isUsbConnected) {
          logger.info(`[USB PRINT] ${w}x${h} dot, protokol: ${usbProtocol.toUpperCase()}, medya: ${mediaType}`);
          setPrintStatus(`USB (${usbProtocol.toUpperCase()}) aktarılıyor...`);
          await usbPrinter.printBitmap(bitmap, w, h, {
            protocol: usbProtocol,
            darkness: Math.round((darkness / 100) * 30),
            widthMm: Math.round(w / 8),
            heightMm: Math.round(h / 8),
            mediaType: mediaType,
            gapMm: gapMm
          });
          setPrintProgress(100);
          return;
        }

        // 2. Bluetooth Termal Yazdırma
        const isGB = printer.getDeviceName()?.includes('GB') || printer.isLuckJingle();
        if (isGB) {
          const minPower = 26;
          const maxPower = 95;
          const b = Math.floor(minPower + (darkness/100) * (maxPower - minPower));
          const power = [b, darkness > 80 ? 0xFF : (darkness > 50 ? 0xE0 : 0x00)];
          await printer.sendData(PrinterService.createLuckJinglePacket(0xA2, 0x00, new Uint8Array(power)), 0);
          const q = Math.floor(17 + (darkness/100) * 136);
          await printer.sendData(new Uint8Array([0x51, 0x78, 0xA4, 0x00, 0x01, 0x00, q, 0x99, 0xFF]), 0);
          await printer.sendData(new Uint8Array([0x51, 0x78, 0xBE, 0x00, 0x01, 0x00, 0x00, 0x00, 0xFF]), 0);
          const bpl = w / 8;
          const advanceFeedCmd = new Uint8Array([0x51, 0x78, 0xBD, 0x00, 0x01, 0x00, 0x19, 0x07, 0xFF]);
          
          // Batch 2 lines per packet to balance speed and BLE buffer stability
          for (let y = 0; y < h; y += 2) {
            if ((printer as any).isCancelled) break;
            const linesToProcess = Math.min(2, h - y);
            const linePackets: Uint8Array[] = [];
            
            for (let ly = 0; ly < linesToProcess; ly++) {
              const currentY = y + ly;
              const lineData = bitmap.slice(currentY * bpl, (currentY + 1) * bpl);
              const linePacket = PrinterService.createLuckJinglePacket(0xA2, 0x00, lineData);
              const combined = new Uint8Array(linePacket.length + advanceFeedCmd.length);
              combined.set(linePacket, 0);
              combined.set(advanceFeedCmd, linePacket.length);
              linePackets.push(combined);
            }
            
            const totalLen = linePackets.reduce((acc, p) => acc + p.length, 0);
            const batchCombined = new Uint8Array(totalLen);
            let offset = 0;
            for (const p of linePackets) {
              batchCombined.set(p, offset);
              offset += p.length;
            }
            
            const effectiveDelay = Math.max(12, printDelay || 0);
            await printer.sendData(batchCombined, effectiveDelay);
            if (y > 0 && y % 32 === 0) {
              await new Promise(r => setTimeout(r, 40)); // BLE tamponunu dinlendir
            }
            if (y % 8 === 0 || y >= h - 2) {
              setPrintProgress(Math.round(((y + linesToProcess) / h) * 100));
            }
          }

          // Çıktı Sonu Yırtma / Koparma Payı (Termal kafa ile bıçak arasındaki mesafe)
          // 1 mm ~= 8 dot (203 DPI)
          const targetMm = postPrintFeed !== undefined ? postPrintFeed : 25;
          const feedDots = Math.max(80, Math.round(targetMm * 8));
          if (feedDots > 0) {
            // Küçük adımlarla besleme yaparak motor stabilitesini koru
            const maxStep = 240;
            let remaining = feedDots;
            while (remaining > 0) {
              const chunk = Math.min(maxStep, remaining);
              await printer.sendData(PrinterService.feedLuckJingle(chunk), 15);
              remaining -= chunk;
            }
          }
          // LuckJingle Baskı Sonu Kapatma Paket & Tampon Dinlendirme
          await printer.sendData(new Uint8Array([0x51, 0x78, 0xBE, 0x00, 0x01, 0x00, 0x00, 0x00, 0xFF]), 0);
          await new Promise(r => setTimeout(r, 150));
        } else {
          await printer.sendData(PrinterService.init(), 0);
          // ESC/POS Termal Isıtma & Yoğunluk (ESC 7 - heating parameter)
          const heatTime = Math.min(255, Math.floor(70 + (darkness / 100) * 150));
          await printer.sendData(new Uint8Array([0x1B, 0x37, 7, heatTime, 10]), 0);
          const bpl = w / 8;
          const linesPerBatch = 16;
          const effectiveDelay = Math.max(8, printDelay || 0);
          
          for (let y = 0; y < h; y += linesPerBatch) {
            if ((printer as any).isCancelled) break;
            const currentBatchCount = Math.min(linesPerBatch, h - y);
            const batchData = bitmap.slice(y * bpl, (y + currentBatchCount) * bpl);
            
            const cmd = new Uint8Array(8 + batchData.length);
            const yL = currentBatchCount % 256;
            const yH = Math.floor(currentBatchCount / 256);
            cmd.set([0x1D, 0x76, 0x30, 0x00, bpl, 0x00, yL, yH]);
            cmd.set(batchData, 8);
            
            await printer.sendData(cmd, effectiveDelay);
            if (y > 0 && y % 96 === 0) {
              await new Promise(r => setTimeout(r, 45)); // Tampon dinlendirme
            }
            setPrintProgress(Math.round(((y + currentBatchCount) / h) * 100));
          }

          // Çıktı Sonu Yırtma / Koparma Payı (ESC/POS) - Tekil ve Adımlı Besleme
          const targetMm = postPrintFeed !== undefined ? postPrintFeed : 25;
          const postDots = Math.max(80, Math.round(targetMm * 8));
          if (postDots > 0) {
            let remaining = postDots;
            while (remaining > 0) {
              const chunk = Math.min(240, remaining);
              await printer.sendData(new Uint8Array([0x1B, 0x4A, chunk]), 15);
              remaining -= chunk;
            }
          }
          await new Promise(r => setTimeout(r, 150));
        }
      };

  // PROFESSIONAL template set (pro-templates.ts) + kurulu mod paketleri
  const batchTemplates = useMemo(() => {
    const out: { id: string; name: string; variables: VariableDef[]; text: string; defs: VariableDef[] }[] = [];
    const push = (id: string, name: string, text: string) => {
      const defs = extractVariables(text);
      if (defs.length > 0) out.push({ id, name, variables: defs, text, defs });
    };
    for (const t of PRO_TEMPLATES) push(t.id, t.title, t.text);
    if (modeConfig) {
      for (const t of getInstalledTemplates(modeConfig.mode)) {
        const text = Object.values(t.payload)
          .filter((v): v is string => typeof v === 'string' && v.includes('{'))
          .join('\n');
        push('pack-' + t.id, t.title, text);
      }
    }
    return out;
  }, [modeConfig]);

  const handleBatchPrint = async (templateId: string, rows: Record<string, string>[]) => {
    const tpl = batchTemplates.find(t => t.id === templateId);
    if (!tpl || !isConnected || rows.length === 0) {
      logger.warn('Toplu baskı: yazıcı bağlı değil veya şablon/satır yok');
      return;
    }
    setIsPrinting(true);
    setPrintProgress(0);
    try {
      await printer.wake();
      for (let i = 0; i < rows.length; i++) {
        setPrintStatus(`Toplu baskı ${i + 1}/${rows.length}`);
        setPrintProgress(Math.round((i / rows.length) * 100));
        const blocks = resolveTemplate(tpl.text, rows[i], tpl.defs);
        const measurer = document.createElement('canvas').getContext('2d')!;
        measurer.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
        const contentH = renderBlocks(measurer, pageWidth, blocks, { fontSize, fontFamily, bold: isBold });
        const c = document.createElement('canvas');
        c.width = pageWidth;
        c.height = Math.ceil(contentH) + 4;
        const ctx = c.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
        ctx.fillStyle = '#000000';
        renderBlocks(ctx, pageWidth, blocks, { fontSize, fontFamily, bold: isBold });
        const bitmap = processImage(ctx, c.width, c.height, dithering, {
          brightness: imageBrightness,
          contrast: imageContrast,
          invert: imageInvert
        }, { msbFirst: !printer.isLuckJingle() });
        await printBitmapJob(bitmap, c.width, c.height);
        await new Promise(r => setTimeout(r, 500));
      }
      setPrintStatus('Toplu baskı tamam!');
    } catch (e: any) {
      logger.error('Toplu baskı hatası', e?.message || String(e));
      setPrintStatus('Hata oluştu!');
    } finally {
      setTimeout(() => setIsPrinting(false), 800);
    }
  };

  const handleDirectPrintImage = async (dataUrl: string, title: string, widthMm?: number) => {
    const isAnyConnected = isConnected || isUsbConnected || usbPrinter.isConnected;
    if (!isAnyConnected) {
      logger.warn('Doğrudan kargo etiketi yazdırma: Yazıcı bağlı değil');
      setShowConnectionDialog(true);
      return;
    }

    const targetPx = (widthMm && widthMm <= 58) 
      ? 384 
      : (widthMm && widthMm <= 82) 
      ? 576 
      : (widthMm && widthMm >= 100) 
      ? 800 
      : (widthMm ? Math.round(((widthMm / 57) * 384) / 8) * 8 : pageWidth);
    setPageWidth(targetPx);

    setIsPrinting(true);
    setPrintProgress(0);
    setPrintStatus('1/5 Yazıcı hazırlanıyor...');

    try {
      if (usbPrinter.isConnected || isUsbConnected) {
        setPrintStatus(`1/4 USB (${usbProtocol.toUpperCase()}) bağlantısı aktif`);
      } else {
        setPrintStatus('1/5 Yazıcı uyandırılıyor...');
        await printer.wake();
        printer.setCustomDelay(printDelay);
        setPrintStatus('2/5 Uyandırma tamam');
        if (isConnected && prePrintFeed > 0) {
          await printer.feedPaper(prePrintFeed);
        }
      }

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Görsel rasterlaştırılamadı'));
        img.src = dataUrl;
      });

      const c = document.createElement('canvas');
      c.width = targetPx;
      c.height = Math.max(10, Math.round((img.height / img.width) * targetPx));
      const ctx = c.getContext('2d');
      if (!ctx) throw new Error('Canvas context alınamadı');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);

      let printCanvas = c;
      if (autoRotateWide && c.width > 800) {
        printCanvas = rotateCanvas(c, 90);
      }
      const printCtx = printCanvas.getContext('2d')!;
      const isLuck = !isUsbConnected && (printer.getDeviceName()?.includes('GB') || printer.isLuckJingle());
      const bitmap = processImage(printCtx, printCanvas.width, printCanvas.height, dithering, {
        brightness: imageBrightness,
        contrast: imageContrast,
        invert: imageInvert
      }, { msbFirst: !isLuck });

      setPrintStatus(`3/5 Bitmap hazır (${printCanvas.width}x${printCanvas.height})`);
      setPrintStatus('4/5 Yazıcıya aktarılıyor...');
      await printBitmapJob(bitmap, printCanvas.width, printCanvas.height);
      setPrintStatus('5/5 Yazdırma tamamlandı!');
      logger.info(`${title} başarıyla yazdırıldı (${printCanvas.width}x${printCanvas.height})`);

      try {
        await historyStorage.addHistory({
          title: title || 'Kargo Etiketi',
          type: 'orders' as any,
          previewDataUrl: c.toDataURL('image/jpeg', 0.85),
          width: c.width,
          height: c.height,
          copies: 1
        });
      } catch {
        // depolama hatası baskıyı engellemez
      }
    } catch (err: any) {
      const m = err?.message || String(err);
      logger.error('Kargo etiketi doğrudan yazdırma hatası', m);
      setPrintStatus(`HATA: ${m.slice(0, 120)}`);
      alert(`Yazdırma hatası: ${m}`);
    } finally {
      setTimeout(() => setIsPrinting(false), 800);
    }
  };

  const handlePrint = async () => {
    const canvas = canvasRef.current;
    const isAnyConnected = isConnected || isUsbConnected || usbPrinter.isConnected;
    if (!canvas) return;
    if (!isAnyConnected) {
      setShowConnectionDialog(true);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsPrinting(true);
    setPrintProgress(0);
    setPrintStatus('Hazırlanıyor...');
    
    try {
      if (usbPrinter.isConnected || isUsbConnected) {
        setPrintStatus(`1/4 USB (${usbProtocol.toUpperCase()}) bağlantısı hazır`);
      } else {
        setPrintStatus('1/5 Yazıcı uyanıyor...');
        logger.info(`[PRINT] bağlı=${isConnected} kanal=${printer.characteristicUuid} protokol=${printer.getProtocol()}`);
        await printer.wake();
        printer.setCustomDelay(printDelay);
        setPrintStatus('2/5 Uyandırma tamam');

        if (isConnected && prePrintFeed > 0) {
          setPrintStatus('Hazırlanıyor (Boşluk)...');
          await printer.feedPaper(prePrintFeed);
        }
      }
      const isLuck = !isUsbConnected && (printer.getDeviceName()?.includes('GB') || printer.isLuckJingle());

      // (printBitmapJob bileşen seviyesine taşındı)

      if (activeView === 'document' && pdfFiles.length > 0) {
        const filesToPrint = printAllFiles ? pdfFiles : [pdfFiles[activePdfIndex]];
        
        for (let fIdx = 0; fIdx < filesToPrint.length; fIdx++) {
          const activePdf = filesToPrint[fIdx];
          const isTxt = activePdf.name.toLowerCase().endsWith('.txt') || activePdf.type === 'text/plain';
          
          if (isTxt) {
            const txt = await activePdf.text();
            ctx.font = '13px monospace';
            const lines = txt.split('\n');
            const maxWidth = pageWidth - 20;
            const wrappedLines: string[] = [];
            
            lines.forEach(line => {
              let currentLine = '';
              const words = line.split(' ');
              words.forEach(word => {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                if (ctx.measureText(testLine).width > maxWidth) {
                  wrappedLines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              });
              wrappedLines.push(currentLine);
            });
            
            const calculatedHeight = Math.max(120, Math.ceil(wrappedLines.length * 18 + 40));
            const docHeight = pageHeight > 0 ? Math.max(pageHeight, calculatedHeight) : calculatedHeight;
            canvas.width = pageWidth;
            canvas.height = docHeight;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, pageWidth, docHeight);
            ctx.fillStyle = 'black';
            ctx.font = '13px monospace';
            ctx.textBaseline = 'top';
            wrappedLines.forEach((line, i) => {
              ctx.fillText(line, 10, 15 + i * 18);
            });
            const bitmap = processImage(ctx, canvas.width, canvas.height, dithering, {
              brightness: imageBrightness,
              contrast: imageContrast,
              invert: imageInvert
            }, { msbFirst: !isLuck });

            for (let c = 0; c < printCopies; c++) {
              setPrintStatus(`Belge ${fIdx+1}/${filesToPrint.length} [${c + 1}/${printCopies}]`);
              await printBitmapJob(bitmap, canvas.width, canvas.height);
              if (c < printCopies - 1 || fIdx !== filesToPrint.length - 1) {
                await new Promise(r => setTimeout(r, 1000));
              }
            }
          } else {
            const arrayBuffer = await activePdf.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            const finalPages = parsePageRanges(pdfPageRange, pdf.numPages);

            for (const pageNum of finalPages) {
              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1, rotation: pdfRotation });
              const scale = (pageWidth / viewport.width) * pdfScale;
              const scaledViewport = page.getViewport({ scale, rotation: pdfRotation });
              canvas.width = pageWidth;
              canvas.height = scaledViewport.height;
              await (page as any).render({ canvasContext: ctx, viewport: scaledViewport }).promise;
              const bitmap = processImage(ctx, canvas.width, canvas.height, dithering, {
                brightness: imageBrightness,
                contrast: imageContrast,
                invert: imageInvert
              }, { msbFirst: !isLuck });

              for (let c = 0; c < printCopies; c++) {
                setPrintStatus(`Belge ${fIdx+1}/${filesToPrint.length} - Sayfa ${pageNum} [${c + 1}/${printCopies}]`);
                await printBitmapJob(bitmap, canvas.width, canvas.height);
                if (c < printCopies - 1 || pageNum !== finalPages[finalPages.length-1] || fIdx !== filesToPrint.length-1) {
                  await new Promise(r => setTimeout(r, 1000));
                }
              }
            }
          }
        }
      } else {
        // Safety check: If canvas is empty or uninitialized but previewImage exists (e.g. from Chiptune, Orders, Templates), render previewImage into canvas
        if (previewImage && (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0)) {
          const img = new Image();
          await new Promise<void>((res) => {
            img.onload = () => {
              canvas.width = img.width || pageWidth;
              canvas.height = img.height || 200;
              const ctx2 = canvas.getContext('2d');
              if (ctx2) {
                ctx2.fillStyle = '#ffffff';
                ctx2.fillRect(0, 0, canvas.width, canvas.height);
                ctx2.drawImage(img, 0, 0);
              }
              res();
            };
            img.onerror = () => res();
            img.src = previewImage;
          });
        }

        // 10cm (800px) Rulo Genişlik Uyumluluğu ve Otomatik Dikey Döndürme:
        // Eğer baskı genişliği 800px'ten büyükse (örneğin 1200x800px gibi 15x10cm yatay tasarım),
        // 10cm'lik rulo yazıcı kafasına tam oturması ve dikey beslenmesi için 90° dikey çevrilir.
        let printCanvas = canvas;
        if (autoRotateWide && canvas.width > 800) {
          printCanvas = rotateCanvas(canvas, 90);
          logger.info(`[OTO-DİKEY BASKI] ${canvas.width}x${canvas.height} görsel, 10cm rulo için 90° dikey çevrildi -> ${printCanvas.width}x${printCanvas.height}`);
        }
        const printCtx = printCanvas.getContext('2d')!;
        const bitmap = processImage(printCtx, printCanvas.width, printCanvas.height, dithering, {
          brightness: imageBrightness,
          contrast: imageContrast,
          invert: imageInvert
        }, { msbFirst: !isLuck });
        setPrintStatus(`3/5 Bitmap hazır (${printCanvas.width}x${printCanvas.height})`);
        for (let c = 0; c < printCopies; c++) {
          setPrintStatus(printCopies > 1 ? `Yazdırılıyor: Kopya ${c + 1}/${printCopies}` : '4/5 Yazıcıya gönderiliyor...');
          await printBitmapJob(bitmap, printCanvas.width, printCanvas.height);
          if (c < printCopies - 1) await new Promise(r => setTimeout(r, 1000));
        }
      }

      // Save to print history
      try {
        let historyTitle = 'Termal Baskı';
        if (activeView === 'editor') historyTitle = text.split('\n')[0] || 'Metin Belgesi';
        else if (activeView === 'document') historyTitle = pdfFiles[activePdfIndex]?.name || 'PDF Belgesi';
        else if (activeView === 'banner') historyTitle = `Banner: ${bannerText}`;
        else if (activeView === 'image') historyTitle = 'Görsel Baskısı';
        else if (activeView === 'templates') historyTitle = 'Şablon Belgesi';
        else if (activeView === 'collage') historyTitle = 'Kolaj Tasarımı';
        else if (activeView === 'tools') historyTitle = 'QR / Barkod';

        await historyStorage.addHistory({
          title: historyTitle,
          type: activeView as any,
          previewDataUrl: canvas.toDataURL(),
          width: canvas.width,
          height: canvas.height,
          copies: printCopies
        });
      } catch (histErr) {
        logger.warn('Geçmiş kaydedilemedi', histErr);
      }

      // Remember this printer's settings for automatic restore next time
      try {
        upsertDeviceProfile({
          id: makeProfileId(printer.getDeviceId(), printer.getDeviceName()),
          deviceName: printer.getDeviceName() || 'Bilinmeyen Yazıcı',
          protocol: printer.getUserProtocolSetting(),
          channelUuid: printer.characteristicUuid,
          darkness,
          isExtraDark,
          pageWidth,
          printDelay
        });
      } catch { /* profile save is best-effort */ }

      setPrintStatus('Tamamlandı!');
      setTimeout(() => setIsPrinting(false), 1000);
    } catch (error: any) {
      const emsg = error?.message || String(error);
      logger.error('Print job failed', { message: emsg, view: activeView, protocol: printer.getProtocol() });
      setPrintStatus(`HATA: ${emsg.slice(0, 120)}`);
      setTimeout(() => setIsPrinting(false), 2000);
    }
    setIsPreviewOpen(false);
  };

  const handleCancelPrint = () => printer.cancelPrint();
  const openProTemplate = (t: ProTemplate) => setProTplState({ tpl: t, values: null });

  const submitProTemplate = (vals: Record<string, string>) => {
    if (!proTplState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    if (PRO_CUSTOM_RENDERERS[proTplState.tpl.id]) {
      PRO_CUSTOM_RENDERERS[proTplState.tpl.id]({ ctx, width: pageWidth, canvas, values: vals });
    } else {
      const defs = extractVariables(proTplState.tpl.text);
      const blocks = resolveTemplate(proTplState.tpl.text, vals, defs);
      const measurer = document.createElement('canvas').getContext('2d')!;
      measurer.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      const contentH = renderBlocks(measurer, pageWidth, blocks, { fontSize, fontFamily, bold: isBold });
      canvas.width = pageWidth;
      canvas.height = Math.ceil(contentH) + 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${isBold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      ctx.fillStyle = '#000000';
      renderProDesigned(ctx, pageWidth, proTplState.tpl.title.split(' (')[0], blocks, { fontSize, fontFamily, bold: isBold });
    }
    setPreviewImage(canvas.toDataURL());
    setIsPreviewOpen(true);
    setProTplState(null);
  };


  return (
    <div className={`min-h-screen flex flex-col md:flex-row max-w-6xl mx-auto relative font-outfit transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Hidden canvas used for all preview/print rendering — MUST stay in DOM */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <AnimatePresence>
        {isPrinting && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-10 md:w-80">
            <Card className="p-4 rounded-xl shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg"><Printer className="text-teal-600 dark:text-teal-400 animate-pulse" size={18} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{printStatus}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Yazdırma Sürüyor...</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCancelPrint} className="rounded-lg h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"><X size={18} /></Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>İlerleme</span><span>%{isNaN(printProgress) ? 0 : printProgress}</span></div>
                <Progress value={isNaN(printProgress) ? 0 : printProgress} className="h-1.5" />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 p-6 space-y-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => (isConnected || isUsbConnected) ? handleDisconnect() : setShowConnectionDialog(true)}
              title={(isConnected || isUsbConnected) ? 'Yazıcı Bağlı (Bağlantıyı kesmek için tıkla)' : 'Yazıcıya Bağlan (Zebra / BLE)'}
              className={`p-2 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                (isConnected || isUsbConnected) 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 animate-pulse' 
                  : 'bg-slate-200 hover:bg-teal-600 hover:text-white dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isUsbConnected ? <Usb size={20} /> : <Printer size={20} />}
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-white leading-tight">iPrint Pro</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  onClick={() => setShowConnectionDialog(true)}
                  className={`text-[10px] font-bold text-left transition-colors flex items-center gap-1 ${
                    (isConnected || isUsbConnected) 
                      ? 'text-emerald-600 dark:text-emerald-400 hover:underline' 
                      : 'text-teal-600 dark:text-teal-400 hover:underline'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${(isConnected || isUsbConnected) ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  {isUsbConnected ? (
                    <span className="flex items-center gap-1">
                      Zebra USB ({usbProtocol.toUpperCase()})
                    </span>
                  ) : isConnected ? (
                    <span className="flex items-center gap-1">
                      {printerDeviceName || 'BLE'} {batteryLevel !== null ? `(%${batteryLevel})` : ''}
                    </span>
                  ) : (
                    'Yazıcı Seç / Bağlan'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1.5">
          <Button variant={activeView === 'menu' ? 'default' : 'ghost'} onClick={() => setActiveView('menu')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><Layout size={18}/> {t('menu.home') || 'Ana Sayfa'}</Button>
          <Button variant={activeView === 'editor' ? 'default' : 'ghost'} onClick={() => setActiveView('editor')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><Type size={18}/> {t('menu.text')}</Button>
          <Button variant={activeView === 'image' ? 'default' : 'ghost'} onClick={() => setActiveView('image')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><ImageIcon size={18}/> {t('menu.image')}</Button>
          <Button variant={activeView === 'templates' ? 'default' : 'ghost'} onClick={() => setActiveView('templates')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><Library size={18}/> Şablonlar</Button>
          <Button variant={activeView === 'orders' ? 'default' : 'ghost'} onClick={() => setActiveView('orders')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><ShoppingCart size={18}/> Uygulamalar & Siparişler</Button>
          <Button variant={activeView === 'tools' ? 'default' : 'ghost'} onClick={() => setActiveView('tools')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><QrCode size={18}/> Araçlar</Button>
          <Button variant={activeView === 'document' ? 'default' : 'ghost'} onClick={() => setActiveView('document')} className="w-full justify-start gap-3 rounded-lg h-11 font-bold"><FileText size={18}/> {t('menu.document')}</Button>
          <Button variant="ghost" onClick={() => setShowHistoryModal(true)} className="w-full justify-start gap-3 rounded-lg h-11 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"><HistoryIcon size={18}/> Geçmiş & Taslaklar</Button>
        </nav>

        <div className="mt-auto space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => authStatus === 'authenticated' ? logout() : setShowAuthDialog(true)}
            className="w-full justify-start gap-2 rounded-lg h-9 text-xs font-bold"
          >
            {authStatus === 'authenticated'
              ? <>👤 {authEmail?.split('@')[0]} • Çıkış</>
              : authStatus === 'guest' ? '👤 Misafir • Giriş Yap' : '🔐 Giriş Yap / Kayıt'}
          </Button>
          <div className="flex items-center justify-between px-1">
            <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)} className="rounded-lg h-9 w-9">
               {isDarkMode ? <Zap size={18} className="text-amber-400 fill-amber-400" /> : <Monitor size={18} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowDiagnostics(!showDiagnostics)} className={`rounded-lg h-9 w-9 ${showDiagnostics ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'text-slate-400'}`} title="Tanılama"><Bug size={18}/></Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} className="rounded-lg h-9 w-9 text-slate-400"><Settings2 size={18}/></Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-sm md:max-w-none mx-auto w-full">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden p-3 sm:p-4 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => (isConnected || isUsbConnected) ? handleDisconnect() : setShowConnectionDialog(true)}
                title={(isConnected || isUsbConnected) ? 'Yazıcı Bağlı (Kopar)' : 'Yazıcıya Bağlan'}
                className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  (isConnected || isUsbConnected) 
                    ? 'bg-emerald-500 text-white shadow-xs animate-pulse ring-2 ring-emerald-400/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-teal-600'
                }`}
              >
                {isUsbConnected ? <Usb size={18} /> : <Printer size={18} />}
              </button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-slate-800 dark:text-white leading-none">iPrint Pro</h1>
                  {(isConnected || isUsbConnected) && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowConnectionDialog(true)}
                  className={`text-[10px] font-bold text-left transition-colors flex items-center gap-1 mt-0.5 ${
                    (isConnected || isUsbConnected) 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-teal-600 dark:text-teal-400'
                  }`}
                >
                  {isUsbConnected ? (
                    <span className="flex items-center gap-1">
                      Zebra USB • <span className="opacity-70 underline">Değiştir</span>
                    </span>
                  ) : isConnected ? (
                    <span className="flex items-center gap-1">
                      Bağlı {batteryLevel !== null ? `(%${batteryLevel})` : ''} • <span className="opacity-70 underline">Yönet</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5">
                      <Bluetooth size={10} /> Bağlan
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMenuDrawerOpen(true)} 
                title="Menü & Ayarlar" 
                className="rounded-xl h-9 w-9 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </header>

      <main className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeView === 'menu' && (
            <SmartHomeGrid
              mode={modeConfig ? MODES.find(m => m.id === modeConfig.mode) ?? null : null}
              onNavigate={navigate}
              onOpenHistory={() => setShowHistoryModal(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenWizard={() => setShowModeWizard(true)}
            />
          )}

          {activeView === 'batch' && (
            <BatchView
              variableTemplates={batchTemplates}
              maxRows={authStatus==='guest' || can('batchUnlimited', entitlements ?? DEFAULT_FREE_ENTS) ? 5000 : FREE_LIMITS.batchRows}
              onPrintBatch={handleBatchPrint}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'pos' && (
            <PosView
              pageWidth={pageWidth}
              onPrintBlocks={handlePosPrint}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'appointments' && (
            <AppointmentView
              businessAddress=""
              onPrintBlocks={handlePosPrint}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'service' && (
            <ServiceView
              tickets={serviceTickets}
              onCreateTicket={handleCreateTicket}
              onUpdateStatus={handleUpdateTicketStatus}
              onPrintTicket={handleServicePrint}
              onOpenTrack={(id) => logger.info(`Takip linki (backend sayfası Faz B sonrası): ${id}`)}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'warehouse' && (
            <WarehouseView
              pageWidth={pageWidth}
              onPrintBatchTexts={handleWarehousePrint}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'orders' && (
            <OrdersView
              apiBase={API_BASE}
              pageWidth={pageWidth}
              onPrintShippingLabel={(blocks, label) => printResolvedBlocks(blocks, label)}
              onPrintPackingSlip={(blocks, label) => printResolvedBlocks(blocks, label)}
              onDirectPrint={handleDirectPrintImage}
              onPreviewAndPrint={(dataUrl, title, widthMm) => {
                const targetPx = widthMm === 57 ? 384 : widthMm === 80 ? 576 : widthMm && widthMm >= 100 ? 800 : (widthMm ? Math.round((widthMm / 57) * 384 / 8) * 8 : pageWidth);
                setPageWidth(targetPx);
                setPreviewImage(dataUrl);
                setIsPreviewOpen(true);
                const canvas = canvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = targetPx;
                    canvas.height = Math.round((img.height / img.width) * targetPx);
                    if (ctx) {
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                    setPreviewImage(canvas.toDataURL());
                  };
                  img.src = dataUrl;
                }
                logger.info(`${title} önizleme ve baskı merkezine aktarıldı`);
              }}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'editor' && (
            <EditorView
              text={text}
              setText={setText}
              setSelectedText={setSelectedText}
              fontSize={fontSize}
              setFontSize={setFontSize}
              alignment={alignment}
              setAlignment={setAlignment}
              isBold={isBold}
              setIsBold={setIsBold}
              isItalic={isItalic}
              setIsItalic={setIsItalic}
              isUnderline={isUnderline}
              setIsUnderline={setIsUnderline}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              customFonts={customFonts}
              handleFontUpload={handleFontUpload}
              showHtmlEditor={showHtmlEditor}
              setShowHtmlEditor={setShowHtmlEditor}
              htmlTemplate={htmlTemplate}
              setHtmlTemplate={setHtmlTemplate}
              pageWidth={pageWidth}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              letterSpacing={letterSpacing}
              setLetterSpacing={setLetterSpacing}
              onGeneratePreview={() => generatePreview()}
              onBack={() => setActiveView('menu')}
              activeDraft={activeDraft}
              onClearActiveDraft={() => setActiveDraft(null)}
            />
          )}


          {activeView === 'image' && (
            <motion.div key="image" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" onClick={() => setActiveView('menu')} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs h-8"><X size={14} className="mr-1" /> {t('cancel')}</Button>
                <Button onClick={() => generatePreview()} disabled={!selectedImage} className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-8 px-4 shadow-xs">{t('print_preview')}</Button>
              </div>

              {isCropping ? (
                <div className="space-y-3">
                   <div className="relative h-[220px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-md">
                      <div className="absolute top-2 right-2 z-30 flex gap-1">
                        <Button variant="ghost" onClick={() => setUseArchitect(!useArchitect)} className={`h-6 rounded-md px-2 text-[9px] font-black border transition-all ${useArchitect ? 'bg-teal-500 text-white border-teal-400 shadow-sm' : 'bg-white/10 text-white/70 border-white/10'}`}>
                          {useArchitect ? 'MİMAR' : 'MİMARA'}
                        </Button>
                      </div>

                      {useArchitect ? (
                        <div className="w-full h-full flex justify-center items-center bg-slate-200 dark:bg-slate-950 overflow-hidden ring-2 ring-inset ring-slate-800/20">
                           <ArchitectWorkspace 
                             image={selectedImage!} 
                             crops={activeMultiCrops} 
                             onSync={setActiveMultiCrops} 
                             parentFabricRef={fabricRef}
                           />
                        </div>
                      ) : selectedZoneId ? (
                        <Cropper 
                          image={selectedImage!} 
                          crop={crop} 
                          zoom={zoom} 
                          aspect={isFreeCrop ? undefined : (() => {
                            const zone = activeMultiCrops.find(z => z.id === selectedZoneId);
                            if (!zone || !zone.width || !zone.height) return undefined;
                            return zone.width / zone.height;
                          })()} 
                          onCropChange={setCrop} 
                          onCropComplete={onCropComplete} 
                          onZoomChange={setZoom} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm">
                           <img 
                             src={selectedImage!} 
                             alt="Full Preview" 
                             className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                             style={{ pointerEvents: 'none' }}
                           />
                        </div>
                      )}
                      
                      {/* Ghost Frames Overlay (Only in simple mode) */}
                      {!useArchitect && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {activeMultiCrops.map((zone, idx) => {
                            if (!zone.percent) return null;
                            const isActive = zone.id === selectedZoneId;
                            return (
                              <div 
                                key={zone.id}
                                className={`absolute cursor-crosshair pointer-events-auto transition-all duration-200 rounded-sm ${isActive ? 'border-2 border-teal-500 bg-teal-500/10 shadow-lg z-20' : 'border border-dashed border-white/50 bg-white/5 z-10'}`}
                                style={{
                                  left: `${zone.percent.x}%`,
                                  top: `${zone.percent.y}%`,
                                  width: `${zone.percent.width}%`,
                                  height: `${zone.percent.height}%`,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedZoneId(zone.id);
                                  if (zone.percent) {
                                     setCrop({ x: zone.percent.x + zone.percent.width / 2 - 50, y: zone.percent.y + zone.percent.height / 2 - 50 });
                                     setZoom(Math.max(1, 100 / Math.max(zone.percent.width, zone.percent.height) * 0.8));
                                  }
                                }}
                              >
                                <div className={`absolute top-0 left-0 -translate-y-full flex items-center gap-1 px-1.5 py-0.5 rounded-t-sm text-[8px] font-bold shadow-sm ${isActive ? 'bg-teal-500 text-white' : 'bg-white/20 text-white/70'}`}>
                                  <Layers size={9}/> BÖLGE #{idx + 1}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                   </div>

                   <div className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800">
                     {/* Controls Grid */}
                     <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <Label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Serbest Kırpma</Label>
                          <Switch checked={isFreeCrop} onCheckedChange={setIsFreeCrop} />
                        </div>
                        {!isFreeCrop && (
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            <Label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Oran Kilidi</Label>
                            <Button variant="ghost" size="icon" onClick={() => setCropLocked(p => !p)} className={`h-6 w-6 rounded-md ${cropLocked ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}`}>
                              {cropLocked ? <Lock size={12} /> : <Unlock size={12} />}
                            </Button>
                          </div>
                        )}
                     </div>

                     {!isFreeCrop && (
                       <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-1">
                           <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Genişlik (px)</Label>
                           <Input type="number" value={cropCustomW} onChange={e => { const nw = Number(e.target.value) || 384; if (cropLocked) setCropCustomH(Math.round(nw * cropCustomH / cropCustomW)); setCropCustomW(nw); }} className="h-8 rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 font-bold text-center text-xs" />
                         </div>
                         <div className="space-y-1">
                           <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Yükseklik (px)</Label>
                           <Input type="number" value={cropCustomH} onChange={e => { const nh = Number(e.target.value) || 200; if (cropLocked) setCropCustomW(Math.round(nh * cropCustomW / cropCustomH)); setCropCustomH(nh); }} className="h-8 rounded-lg bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 font-bold text-center text-xs" />
                         </div>
                       </div>
                     )}

                      {/* Zoom */}
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Yakınlaştırma (Zoom)</Label>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg dark:bg-slate-900 dark:border-slate-800" onClick={() => setZoom(p => Math.max(1, +(p - 0.1).toFixed(1)))}><Minus size={12}/></Button>
                          <Input type="number" step="0.1" value={zoom} onChange={e => setZoom(Number(e.target.value)||1)} className="w-12 h-7 text-center text-xs font-bold p-0 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 dark:text-teal-400" />
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg dark:bg-slate-900 dark:border-slate-800" onClick={() => setZoom(p => Math.min(5, +(p + 0.1).toFixed(1)))}><Plus size={12}/></Button>
                        </div>
                      </div>

                      {/* Multi-Crop Architect */}
                       <div className="bg-teal-50/50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                         <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <Label className="text-[10px] font-bold text-slate-800 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5"><Layers size={13} className="text-teal-600"/> Bölgeler ({activeMultiCrops.length})</Label>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Switch checked={useArchitect} onCheckedChange={(v) => { setUseArchitect(v); if(v) setIsCropping(true); }} className="data-[state=checked]:bg-indigo-600 h-3.5 w-6" />
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase">Mimar Modu</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {activeMultiCrops.length > 0 && (
                                <Button size="sm" onClick={saveCurrentCrop} className="h-6 px-2 text-[9px] bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900/40 rounded-md font-bold hover:bg-amber-50 shadow-none"><Save size={11} className="mr-1"/> KAYDET</Button>
                              )}
                              {useArchitect ? (
                                <Button size="sm" onClick={addArchitectZone} className="h-6 text-[9px] bg-indigo-600 text-white rounded-md font-bold shadow-xs">+ YENİ ALAN</Button>
                              ) : (
                                selectedZoneId ? (
                                  <Button size="sm" onClick={updateCropZone} className="h-6 text-[9px] bg-emerald-600 text-white rounded-md font-bold shadow-xs">GÜNCELLE</Button>
                                ) : (
                                  <Button size="sm" onClick={addCropZone} className="h-6 text-[9px] bg-teal-600 text-white rounded-md font-bold shadow-xs">+ EKLE</Button>
                                )
                              )}
                            </div>
                         </div>
                         
                         <div className="flex bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                             <Button variant={multiCropLayout === 'vertical' ? 'default' : 'ghost'} size="sm" onClick={() => setMultiCropLayout('vertical')} className={`flex-1 h-7 rounded-md text-[10px] font-bold gap-1 ${multiCropLayout === 'vertical' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}><ChevronDown size={13}/> DIKEY</Button>
                             <Button variant={multiCropLayout === 'horizontal' ? 'default' : 'ghost'} size="sm" onClick={() => setMultiCropLayout('horizontal')} className={`flex-1 h-7 rounded-md text-[10px] font-bold gap-1 ${multiCropLayout === 'horizontal' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}><ChevronUp size={13} className="rotate-90"/> YATAY</Button>
                             <Button variant={multiCropLayout === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setMultiCropLayout('grid')} className={`flex-1 h-7 rounded-md text-[10px] font-bold gap-1 ${multiCropLayout === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}><Layout size={13}/> GRID</Button>
                         </div>
                         <ScrollArea className={activeMultiCrops.length > 0 ? "h-28 w-full" : "h-0"}>
                           <div className="space-y-1.5 pr-2">
                             {activeMultiCrops.map((zone, idx) => (
                               <div 
                                 key={zone.id} 
                                 onClick={() => {
                                   setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id);
                                   if (useArchitect && fabricRef.current) {
                                      const obj = fabricRef.current.getObjects('rect').find(o => (o as any).data?.id === zone.id);
                                      if (obj) { fabricRef.current.setActiveObject(obj); fabricRef.current.renderAll(); }
                                   } else if (zone.percent) {
                                      setCrop({ x: zone.percent.x + zone.percent.width / 2 - 50, y: zone.percent.y + zone.percent.height / 2 - 50 });
                                      setZoom(Math.max(1, 100 / Math.max(zone.percent.width, zone.percent.height) * 0.8));
                                      setIsCropping(true);
                                   }
                                 }}
                                 className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${selectedZoneId === zone.id ? 'bg-teal-600 border-teal-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                               >
                                 <div className="flex items-center gap-2">
                                   <span className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${selectedZoneId === zone.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>{idx + 1}</span>
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-bold uppercase tracking-tight">({Math.round(zone.width)}x{Math.round(zone.height)}px)</span>
                                      {zone.rotation && zone.rotation !== 0 && <span className="text-[8px] opacity-80">⟳ {Math.round(zone.rotation)}°</span>}
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-1">
                                   <Button variant="ghost" size="icon" className={`h-6 w-6 rounded-md ${selectedZoneId === zone.id ? 'text-white hover:bg-white/10' : 'text-red-400 hover:bg-red-50'}`} onClick={(e) => { e.stopPropagation(); 
                                      removeCropZone(zone.id);
                                      if (useArchitect && fabricRef.current) {
                                        const obj = fabricRef.current.getObjects('rect').find(o => (o as any).data?.id === zone.id);
                                        if (obj) { fabricRef.current.remove(obj); fabricRef.current.renderAll(); }
                                      }
                                   }}><Trash2 size={12}/></Button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </ScrollArea>
                         {activeMultiCrops.length === 0 && <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center italic py-1 font-medium">Henüz bir kesim bölgesi tanımlanmadı.</p>}
                       </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                        <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kayıtlı Multi-Profiller</Label><Button variant="ghost" size="sm" onClick={saveCurrentCrop} className="h-6 px-2.5 text-[9px] text-teal-700 bg-white dark:bg-slate-900 border border-teal-200 dark:border-slate-800 rounded-lg font-bold hover:bg-teal-50 shadow-xs">PROFİLİ KAYDET</Button></div>
                        <ScrollArea className="h-28 w-full">
                          <div className="grid grid-cols-1 gap-2 pr-2">
                            {savedCrops.map(sc => (
                              <div key={sc.id} onClick={() => { setActiveProfileId(sc.id); setActiveMultiCrops(sc.crops.map(c => ({...c, id: Math.random().toString(36).substr(2,9)}))); }} className={`group flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${activeProfileId === sc.id ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/30 shadow-xs' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">{sc.name}</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded">{sc.crops.length} BÖLGE</span>
                                    {sc.crops.length > 0 && <span className="text-[9px] text-slate-400 dark:text-slate-500">({sc.crops[0].width}px Genişlik)</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                   <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600 rounded-md" onClick={(e) => { e.stopPropagation(); deleteSavedProfile(sc.id); }}><Trash2 size={13}/></Button>
                                   <div className={`p-1 rounded-full ${activeProfileId === sc.id ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-transparent'}`}><Check size={10} /></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                   </div>
                   <div className="flex gap-2 mt-3">
                     <Button variant="outline" onClick={() => {
                        setIsCropping(false);
                        setSelectedImage(null);
                        setActiveView('menu');
                        logger.info('Kırpma iptal edildi');
                     }} className="flex-1 rounded-lg h-10 font-bold text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">İptal</Button>
                     <Button onClick={applyCrop} className="flex-1 rounded-lg h-10 bg-teal-600 hover:bg-teal-700 font-bold text-xs text-white shadow-sm">Onayla</Button>
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 backdrop-blur flex flex-col items-center justify-center min-h-[300px] transition-all shadow-xs relative">
                    {selectedImage ? (
                      <div className="text-center w-full space-y-3">
                         {/* Aligned Tools Toolbar (Sil, Metni Tanı, Arkaplan Sil) */}
                         <div className="grid grid-cols-3 gap-2 w-full">
                            <Button 
                              variant="outline" 
                              onClick={handleRemoveBackground} 
                              disabled={isRemovingBg}
                              className="rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9 px-2 font-bold text-[11px] gap-1.5 transition-all shadow-xs hover:bg-teal-50 dark:hover:bg-teal-950/30 text-slate-700 dark:text-slate-200"
                            >
                              {isRemovingBg ? <Loader2 size={13} className="animate-spin text-teal-600"/> : <Sparkles size={13} className="text-amber-500 fill-amber-500"/>}
                              <span className="truncate">{isRemovingBg ? 'Temizleniyor...' : 'Arkaplan Sil'}</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={handleOCR} 
                              disabled={isOcrLoading}
                              className="rounded-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-9 px-2 font-bold text-[11px] gap-1.5 transition-all shadow-xs hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-200"
                            >
                              {isOcrLoading ? <Loader2 size={13} className="animate-spin text-teal-600"/> : <OcrIcon size={13} className="text-blue-500"/>}
                              <span className="truncate">{isOcrLoading ? 'Okunuyor...' : 'Metni Tanı'}</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={resetProject} 
                              className="rounded-lg bg-white dark:bg-slate-800 border-red-200 dark:border-red-900/40 h-9 px-2 font-bold text-[11px] gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all shadow-xs"
                            >
                              <Trash2 size={13}/>
                              <span className="truncate">Sil</span>
                            </Button>
                         </div>

                         <div className="flex justify-center p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                            <img src={selectedImage} alt="Selected" className="max-h-[220px] rounded-md shadow-xs mx-auto object-contain" />
                         </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 animate-pulse">
                         <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl inline-block mb-3"><ImageIcon size={48} className="text-teal-500/50 dark:text-teal-400/50" /></div>
                         <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-tight">Görsel Seçin veya Panodan Yapıştırın</p>
                      </div>
                    )}
                    <div className="relative mt-3">
                      <Button variant="default" className="rounded-lg h-9 px-6 font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white shadow-xs transition-all hover:translate-y-[-1px] text-xs">
                        {selectedImage ? "Görseli Değiştir" : "Görsel Yükle / Seç"}
                      </Button>
                      <input type="file" accept="image/*" onChange={handleImageSelect} title="Görsel Seç" className="absolute inset-0 opacity-0 cursor-pointer"/>
                    </div>
                  </Card>

                  {selectedImage && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                         <Button onClick={() => { setCroppedAreaPixels(null); generatePreview(); }} className="flex flex-col h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 shadow-xs transition-all group p-2">
                            <Maximize2 size={20} className="mb-1.5 text-slate-400 group-hover:text-teal-600" />
                            <span className="text-[10px] font-bold uppercase">Tam Sayfa</span>
                         </Button>
                         <Button onClick={() => { setCropCustomW(384); setCropCustomH(200); setIsFreeCrop(false); setIsCropping(true); }} className="flex flex-col h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 shadow-xs transition-all group p-2">
                            <Layout size={20} className="mb-1.5 text-slate-400 group-hover:text-teal-600" />
                            <span className="text-[10px] font-bold uppercase">Standart</span>
                         </Button>
                         <Button onClick={() => { setIsFreeCrop(true); setIsCropping(true); }} className="flex flex-col h-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 shadow-xs transition-all group p-2">
                            <Zap size={20} className="mb-1.5 text-slate-400 group-hover:text-teal-600" />
                            <span className="text-[10px] font-bold uppercase">Özel (Multi)</span>
                         </Button>
                      </div>

                      {/* Image Fine-Tuning & Dithering Filter Card */}
                      <Card className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <SlidersHorizontal size={14} className="text-teal-600 dark:text-teal-400" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Görsel & Baskı İnce Ayarları</span>
                          </div>
                          {(imageBrightness !== 0 || imageContrast !== 0 || imageInvert) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => { setImageBrightness(0); setImageContrast(0); setImageInvert(false); }}
                              className="h-6 text-[10px] px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                              Sıfırla
                            </Button>
                          )}
                        </div>

                        {/* Dithering & Effect Mode */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raster / Noktalama Filtresi</Label>
                          <Select value={dithering} onValueChange={(val: any) => setDithering(val)}>
                            <SelectTrigger className="h-8 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                              <SelectValue placeholder="Filtre Seçin" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800 text-xs">
                              <SelectItem value="floyd-steinberg">Floyd-Steinberg (Varsayılan Fotoğraf)</SelectItem>
                              <SelectItem value="atkinson">Atkinson (Apple Classic Net Ton)</SelectItem>
                              <SelectItem value="stucki">Stucki (Yüksek Detay & Keskin)</SelectItem>
                              <SelectItem value="sketch">🎨 Karakalem & Eskiz (Çizim Modu)</SelectItem>
                              <SelectItem value="document-clean">📄 Belge & Makbuz Temizleyici</SelectItem>
                              <SelectItem value="threshold">Siyah / Beyaz Keskin Eşik</SelectItem>
                              <SelectItem value="bayer">Bayer Matrix (Retro Gazete)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Brightness Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1"><Sun size={12}/> Parlaklık</span>
                            <span className={imageBrightness !== 0 ? 'text-teal-600 dark:text-teal-400' : ''}>{imageBrightness > 0 ? `+${imageBrightness}` : imageBrightness}</span>
                          </div>
                          <Slider 
                            value={[imageBrightness]} 
                            min={-100} 
                            max={100} 
                            step={5} 
                            onValueChange={(val: any) => setImageBrightness(Array.isArray(val) ? val[0] : Number(val))}
                            className="py-1"
                          />
                        </div>

                        {/* Contrast Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                            <span className="flex items-center gap-1"><ContrastIcon size={12}/> Kontrast</span>
                            <span className={imageContrast !== 0 ? 'text-teal-600 dark:text-teal-400' : ''}>{imageContrast > 0 ? `+${imageContrast}` : imageContrast}</span>
                          </div>
                          <Slider 
                            value={[imageContrast]} 
                            min={-100} 
                            max={100} 
                            step={5} 
                            onValueChange={(val: any) => setImageContrast(Array.isArray(val) ? val[0] : Number(val))}
                            className="py-1"
                          />
                        </div>

                        {/* Invert Switch */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                          <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Negatif / Renkleri Ters Çevir</Label>
                          <Switch checked={imageInvert} onCheckedChange={setImageInvert} />
                        </div>

                        {/* 10cm Auto-Rotate Switch */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex flex-col">
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">10cm Otomatik Dikey Döndürme</Label>
                            <span className="text-[9.5px] text-slate-400">Yatay geniş görselleri (800px+) rulo için dikey besler</span>
                          </div>
                          <Switch checked={autoRotateWide} onCheckedChange={setAutoRotateWide} />
                        </div>
                      </Card>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'document' && (
            <DocumentView
              pdfFiles={pdfFiles}
              setPdfFiles={setPdfFiles}
              activePdfIndex={activePdfIndex}
              setActivePdfIndex={setActivePdfIndex}
              handlePdfSelect={handlePdfSelect}
              movePdf={movePdf}
              printAllFiles={printAllFiles}
              setPrintAllFiles={setPrintAllFiles}
              startPdfCrop={startPdfCrop}
              savedCrops={savedCrops}
              activeProfileId={activeProfileId}
              applySavedProfile={applySavedProfile}
              printCopies={printCopies}
              setPrintCopies={setPrintCopies}
              pdfScale={pdfScale}
              setPdfScale={setPdfScale}
              pdfPageRange={pdfPageRange}
              setPdfPageRange={setPdfPageRange}
              pdfRotation={pdfRotation}
              setPdfRotation={setPdfRotation}
              onGeneratePreview={() => generatePreview()}
              onBack={() => setActiveView('menu')}
            />
          )}

          {activeView === 'banner' && (
            <BannerView
              bannerText={bannerText}
              setBannerText={setBannerText}
              bannerType={bannerType}
              setBannerType={setBannerType}
              bannerOrientation={bannerOrientation}
              setBannerOrientation={setBannerOrientation}
              bannerFontSize={bannerFontSize}
              setBannerFontSize={setBannerFontSize}
              previewImage={previewImage}
              onApplyPreview={(dataUrl) => {
                setPreviewImage(dataUrl);
                const canvas = canvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  const imgObj = new Image();
                  imgObj.onload = () => {
                    canvas.width = imgObj.width;
                    canvas.height = imgObj.height;
                    ctx?.drawImage(imgObj, 0, 0);
                  };
                  imgObj.src = dataUrl;
                }
              }}
              onGeneratePreview={() => {
                setIsPreviewOpen(true);
              }}
              onBack={() => setActiveView('menu')}
              activeDraft={activeDraft}
              onClearActiveDraft={() => setActiveDraft(null)}
            />
          )}

          {activeView === 'collage' && (
            <motion.div key="collage" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <CollageEditor 
                pageWidth={pageWidth} 
                onWidthChange={(w) => setPageWidth(w)}
                activeDraft={activeDraft}
                onClearActiveDraft={() => setActiveDraft(null)}
                onBack={() => setActiveView('menu')}
                onPreview={(img) => { 
                  setPreviewImage(img); 
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const imageObj = new Image();
                    imageObj.onload = () => {
                      canvas.width = imageObj.width;
                      canvas.height = imageObj.height;
                      ctx?.drawImage(imageObj, 0, 0);
                      setIsPreviewOpen(true);
                    };
                    imageObj.src = img;
                  }
                }} 
              />
            </motion.div>
          )}

          {activeView === 'tools' && (
            <motion.div key="tools" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-2">
              <QRGenerator 
                onBack={() => setActiveView('menu')}
                activeDraft={activeDraft}
                onClearActiveDraft={() => setActiveDraft(null)}
                onGenerate={(img) => {
                  setSelectedImage(img);
                  setActiveView('image');
                  logger.info('QR/Barkod oluşturuldu ve görsele aktarıldı');
                }} 
                onDirectPrint={(img) => {
                  setPreviewImage(img);
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const imageObj = new Image();
                    imageObj.onload = () => {
                      canvas.width = imageObj.width;
                      canvas.height = imageObj.height;
                      ctx?.drawImage(imageObj, 0, 0);
                      setIsPreviewOpen(true);
                    };
                    imageObj.src = img;
                  } else {
                    setIsPreviewOpen(true);
                  }
                }}
                onBatchPrint={async (images) => {
                  if (images.length === 0) return;
                  // First preview/load the first image or initiate print
                  setPreviewImage(images[0]);
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const imageObj = new Image();
                    imageObj.onload = () => {
                      canvas.width = imageObj.width;
                      canvas.height = imageObj.height;
                      ctx?.drawImage(imageObj, 0, 0);
                      setIsPreviewOpen(true);
                    };
                    imageObj.src = images[0];
                  } else {
                    setIsPreviewOpen(true);
                  }
                  logger.info(`${images.length} adet seri barkod hazırlandı`);
                }}
              />
            </motion.div>
          )}

          {activeView === 'templates' && (
            <motion.div key="templates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setActiveView('menu')} className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs dark:text-slate-200 text-xs h-8"><X size={14} className="mr-1.5" /> {t('cancel')}</Button>
              </div>
              <TemplateLibrary 
                pageWidth={pageWidth}
                activeDraft={activeDraft}
                onClearActiveDraft={() => setActiveDraft(null)}
                onSelectDraft={handleLoadDraft}
                onNavigateStore={() => setActiveView('archive')}
                onSelectWidth={(w) => {
                  setPageWidth(w);
                  logger.info(`Sayfa genişliği ${w}px (${w === 1200 ? '15x10 cm' : w === 800 ? '10x15 cm' : w === 576 ? '80mm' : '57mm'}) olarak ayarlandı`);
                }}
                onOpenPro={openProTemplate}
                  onSelect={(template) => {
                  if (template.type === 'editor') {
                    setText(template.content);
                    setActiveView('editor');
                  } else if (template.type === 'tools') {
                    setActiveView('tools');
                  }
                  logger.info(`${template.name} şablonu seçildi`);
                }}
                onPreviewAndPrint={(dataUrl: string, title: string, widthMm?: number) => {
                  const targetPx = (widthMm && widthMm <= 58) 
                    ? 384 
                    : (widthMm && widthMm <= 82) 
                    ? 576 
                    : (widthMm && widthMm >= 100) 
                    ? 800 
                    : pageWidth;
                  setPageWidth(targetPx);
                  setPreviewImage(dataUrl);
                  setIsPreviewOpen(true);

                  const canvas = canvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    img.onload = () => {
                      canvas.width = targetPx;
                      canvas.height = Math.round((img.height / img.width) * targetPx);
                      if (ctx) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      }
                      setPreviewImage(canvas.toDataURL());
                    };
                    img.src = dataUrl;
                  }
                  logger.info(`${title} şablonu (${targetPx}px) önizleme ve baskıya hazırlandı`);
                }}
                onDirectPrint={(dataUrl: string, title: string, widthMm?: number) => {
                  handleDirectPrintImage(dataUrl, title, widthMm);
                }}
              />
            </motion.div>
          )}

          {activeView === 'archive' && (
            <motion.div key="archive" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <TemplateStoreView
                onBack={() => setActiveView('menu')}
                onSelectWidth={(w) => {
                  setPageWidth(w);
                  logger.info(`Rulo genişliği ${w}px olarak güncellendi`);
                }}
                onPreviewAndPrint={(dataUrl, title, widthMm) => {
                  const targetPx = widthMm === 57 ? 384 : widthMm === 80 ? 576 : widthMm && widthMm >= 100 ? 800 : (widthMm ? Math.round((widthMm / 57) * 384 / 8) * 8 : pageWidth);
                  setPageWidth(targetPx);
                  setPreviewImage(dataUrl);
                  setIsPreviewOpen(true);
                  
                  const canvas = canvasRef.current;
                  const img = new Image();
                  img.onload = () => {
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      canvas.width = targetPx;
                      canvas.height = Math.round((img.height / img.width) * targetPx);
                      if (ctx) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                      }
                      setPreviewImage(canvas.toDataURL());
                    }
                  };
                  img.src = dataUrl;
                  logger.info(`${title} termal şablonu (${targetPx}px / ${widthMm || 57}mm) önizleme ve baskıya hazırlandı`);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>

      {/* Fullscreen Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        printer={printer}
        isConnected={isConnected}
        onSwitchChannel={handleSwitchChannel}
        feedAmount={feedAmount}
        setFeedAmount={setFeedAmount}
        onAdvancePaper={handleAdvancePaper}
        isExtraDark={isExtraDark}
        setIsExtraDark={setIsExtraDark}
        onTestDarkness={onTestDarkness}
      />

      {/* Fullscreen Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        printer={printer}
        prePrintFeed={prePrintFeed}
        setPrePrintFeed={setPrePrintFeed}
        postPrintFeed={postPrintFeed}
        setPostPrintFeed={setPostPrintFeed}
        printDelay={printDelay}
        setPrintDelay={setPrintDelay}
        darkness={darkness}
        setDarkness={setDarkness}
        pageWidth={pageWidth}
        setPageWidth={setPageWidth}
        pageHeight={pageHeight}
        setPageHeight={setPageHeight}
        dithering={dithering}
        setDithering={setDithering}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-xs mx-2 sm:max-w-md rounded-2xl p-2 overflow-hidden border-none text-slate-800 dark:text-slate-100 shadow-2xl bg-white dark:bg-slate-950 max-h-[90vh] flex flex-col">
          <DialogHeader className="p-2.5 pb-2 pr-11 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 rounded-t-xl shrink-0">
            <DialogTitle className="flex items-center justify-between text-white font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <PrinterCheck className="text-teal-400" size={15} /> Önizleme & Baskı
              </span>
              <span className="text-[9.5px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-teal-300 border border-white/10 font-bold">
                {pageWidth === 384 ? '57mm (384px)' : pageWidth === 576 ? '80mm (576px)' : pageWidth === 800 ? '100mm (800px)' : `${pageWidth}px`}
              </span>
            </DialogTitle>
          </DialogHeader>
          {/* Scrollable preview area mimicking thermal paper */}
          <div className="bg-slate-100 dark:bg-black/50 p-2.5 rounded-xl flex-1 min-h-0">
            <div className="bg-white shadow-md rounded-lg overflow-y-auto flex justify-center max-h-[48vh] min-h-[140px] p-1.5 border border-slate-200">
              {previewImage ? (
                <div className="flex flex-col items-center w-full">
                  <img src={previewImage} alt="Preview" className="max-w-full h-auto object-contain [image-rendering:pixelated]" />
                </div>
              ) : <p className="text-slate-400 italic p-4 text-xs">Hazırlanıyor...</p>}
            </div>
          </div>

           <div className="p-3 space-y-2 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between gap-2">
               <Label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Döndür</Label>
               <Button
                 variant="outline"
                 size="icon"
                 className="h-7 w-7 rounded-lg dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                 onClick={() => {
                   if (activeView === 'archive' || activeView === 'templates' || (previewImage && activeView !== 'document')) {
                     rotateCurrentCanvas();
                   } else {
                     setPdfRotation((r) => (r + 90) % 360);
                     generatePreview();
                   }
                 }}
               >
                 <RotateCw size={12} />
               </Button>
             </div>
             <Select value={printQuality} onValueChange={(v:any)=>setPrintQuality(v)}>
               <SelectTrigger className="rounded-lg h-8 font-bold text-[10px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><SelectValue /></SelectTrigger>
               <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                 <SelectItem value="draft" className="dark:text-slate-200 text-[10px]">Taslak (Hızlı)</SelectItem>
                 <SelectItem value="normal" className="dark:text-slate-200 text-[10px]">Normal</SelectItem>
                 <SelectItem value="fine" className="dark:text-slate-200 text-[10px]">Kaliteli / Net</SelectItem>
               </SelectContent>
             </Select>

             {isUsbConnected && (
               <div className="flex items-center justify-between px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[10px]">
                 <div className="flex items-center gap-1 text-amber-900 dark:text-amber-200 font-semibold">
                   <span>{mediaType === 'gap' ? `🏷️ Boşluklu (${gapMm}mm)` : mediaType === 'continuous' ? '📜 Sürekli Rulo' : '⬛ Siyah Çizgi'}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <button
                     onClick={() => calibrateSensor()}
                     className="text-amber-800 dark:text-amber-300 underline font-bold hover:opacity-80"
                     title="Sensör Kalibrasyonu yap"
                   >
                     Kalibre Et
                   </button>
                   <span className="text-amber-400">|</span>
                   <button
                     onClick={() => feedToNextGap()}
                     className="text-amber-800 dark:text-amber-300 underline font-bold hover:opacity-80"
                     title="Sonraki etiket başına ilerlet"
                   >
                     Hizala
                   </button>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-2 gap-1.5 pt-1">
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => {
                   if (canvasRef.current) {
                     const ctx = canvasRef.current.getContext('2d');
                     if (ctx) {
                       const bitmap = processImage(ctx, canvasRef.current.width, canvasRef.current.height, dithering, {
                         brightness: imageBrightness, contrast: imageContrast, invert: imageInvert
                       });
                       UsbPrinterService.downloadZplFile(
                         bitmap,
                         canvasRef.current.width,
                         canvasRef.current.height,
                         'etiket_baski.zpl',
                         { darkness: Math.round((darkness / 100) * 30) }
                       );
                     }
                   }
                 }}
                 className="h-8 rounded-lg text-[10px] font-bold dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
               >
                 <Download size={11} className="mr-1 text-slate-500" /> ZPL İndir
               </Button>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => {
                   if (canvasRef.current) {
                     UsbPrinterService.printViaSystemDriver(
                       canvasRef.current,
                       Math.round(pageWidth / 8),
                       pageHeight > 0 ? Math.round(pageHeight / 8) : 0,
                       'iPrint Pro - Termal Çıktı'
                     );
                   }
                 }}
                 className="h-8 rounded-lg text-[10px] font-bold dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
               >
                 <MonitorCheck size={11} className="mr-1 text-slate-500" /> Sürücüden Yazdır
               </Button>
             </div>

             <Button 
               onClick={handlePrint} 
               className="w-full h-9 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-600/20"
             >
               {(isConnected || isUsbConnected) ? (
                 isUsbConnected ? 'USB ile Yazdır' : 'Bluetooth ile Yazdır'
               ) : 'YAZDIR / BAĞLAN'}
             </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Print History and Drafts Modal */}
      {/* SPEC-01: Değişken formu */}
      <VariableFormDialog
        open={showVariableForm}
        defs={variableDefs}
        initialValues={variableValues}
        onCancel={() => setShowVariableForm(false)}
        onSubmit={(vals) => {
          setVariableValues(vals);
          skipVariableFormRef.current = true;
          setShowVariableForm(false);
          void generatePreview();
        }}
      />

      {/* PROFESYONEL canlı önizlemeli şablon */}
      {proTplState && (
        <ProLiveDialog
          open
          title={proTplState.tpl.title}
          text={proTplState.tpl.text}
          templateId={proTplState.tpl.id}
          examples={{ ...(PRO_EXAMPLES[proTplState.tpl.id] ?? {}), ...(proTplState.values ?? {}) }}
          pageWidth={pageWidth}
          onClose={() => setProTplState(null)}
          onPrint={(vals) => {
            submitProTemplate(vals);
            setProTplState(null);
          }}
        />
      )}

      {/* SPEC-02: İş modu seçim sihirbazı */}
      <ModeWizard
        open={showModeWizard}
        onSelect={handleSelectMode}
        onSkip={() => setShowModeWizard(false)}
      />

      {/* Faz B: Giriş / Kayıt / Misafir */}
      <AuthDialog
        open={showAuthDialog && authStatus === 'none'}
        onSuccess={() => {
          setShowAuthDialog(false);
          if (pendingViewRef.current) { navigate(pendingViewRef.current); pendingViewRef.current = null; }
        }}
        onGuest={() => { continueAsGuest(); setShowAuthDialog(false); }}
        onClose={() => setShowAuthDialog(false)}
      />

      {/* Faz B: Pro duvarı */}
      {proWallState.open && (
        <ProWall
          featureTitle={proWallState.title}
          loadingTrial={trialLoading}
          onStartTrial={() => {
            if (authStatus !== 'authenticated') {
              pendingViewRef.current = pendingViewRef.current ?? '';
              setProWallState({ open: false, title: '' }); // duvarı kapat, diyalog öne gelsin
              setShowAuthDialog(true);
              return;
            }
            void handleStartTrial();
          }}
          onLater={() => setProWallState({ open: false, title: '' })}
        />
      )}

      <PrintHistoryModal
        isOpen={showHistoryModal}
        onOpenChange={setShowHistoryModal}
        onSelectDraft={handleLoadDraft}
        onSelectReprint={(dataUrl, title) => {
          setPreviewImage(dataUrl);
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              setIsPreviewOpen(true);
            };
            img.src = dataUrl;
          }
          logger.info(`Yeniden baskı için yüklendi: ${title}`);
        }}
      />

      {/* Zebra / Bluetooth / Ölçü Bağlantı Seçim Dialogu */}
      <ConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        currentPageWidth={pageWidth}
        currentPageHeight={pageHeight}
        onSelectDimensionPreset={(preset: LabelDimensionPreset) => {
          setPageWidth(preset.widthDots);
          setPageHeight(preset.heightDots);
          logger.info(`Etiket ölçüsü ayarlandı: ${preset.name} (${preset.widthDots}x${preset.heightDots} dot)`);
        }}
        onDirectSystemPrint={() => {
          if (canvasRef.current) {
            UsbPrinterService.printViaSystemDriver(
              canvasRef.current,
              Math.round(pageWidth / 8),
              pageHeight > 0 ? Math.round(pageHeight / 8) : 0,
              'iPrint Pro - Termal Çıktı'
            );
          }
        }}
      />

      {/* Hamburger Navigation Drawer */}
      <NavigationDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDiagnostics={() => setShowDiagnostics(true)}
        onOpenConnection={() => setShowConnectionDialog(true)}
        onOpenAuth={() => setShowAuthDialog(true)}
        isConnected={isConnected}
        isUsbConnected={isUsbConnected}
        batteryLevel={batteryLevel}
        authStatus={authStatus}
        authEmail={authEmail}
        onLogout={logout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentLanguage={i18n.language}
        onToggleLanguage={toggleLanguage}
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole(!showConsole)}
      />

      {showConsole && (
        <DebugConsole 
          onSwitchChannel={handleSwitchChannel} 
          activeView={activeView} 
          visible={showConsole} 
          onClose={() => setShowConsole(false)}
        />
      )}

      {/* 8-Bit Retro Chiptune Player Popup Dialog (QR Code Link Scanner Flow) */}
      {chiptunePlayerState.open && (
        <RetroChiptunePlayerDialog
          initialSongId={chiptunePlayerState.songId}
          initialTitle={chiptunePlayerState.title}
          onClose={() => setChiptunePlayerState({ open: false })}
        />
      )}
    </div>
  );
}

// Add these to global CSS or index.css for smooth animations
/*
@keyframes bounce-subtle {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -5px); }
}
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite ease-in-out;
}
*/
