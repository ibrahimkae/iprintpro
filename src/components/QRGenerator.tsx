import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import bwipjs from 'bwip-js';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { logger } from '../lib/logger';
import { historyStorage } from '../lib/history-storage';
import {
  QrCode,
  Barcode,
  Camera,
  Layers,
  Sparkles,
  Wifi,
  Globe,
  Phone,
  Mail,
  User,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  Upload,
  VideoOff,
  Plus,
  Play,
  Printer,
  FileCode,
  AlertCircle,
  Package,
  Boxes,
  MapPin,
  Hash,
  RotateCw,
  Tag,
  DollarSign,
  Truck,
  Shirt,
  Maximize2,
  Bookmark,
  X,
  Ruler,
  ChevronDown,
  ChevronUp,
  Square,
  CheckSquare,
  RectangleHorizontal,
  Lock
} from 'lucide-react';
import { calculateLabelDimensions } from '../lib/dimension-utils';
import { RulerDimensionBadge } from './RulerDimensionBadge';
import { playChiptunePreview, CHIPTUNE_PRESETS } from '../lib/chiptune-engine';
import { barcodeArchiveStorage, BarcodeArchiveRecord } from '../lib/barcode-archive-storage';
import { renderArchiveLabel } from '../lib/barcode-archive-renderer';
import { BarcodeArchiveManager } from './BarcodeArchiveManager';

interface QRGeneratorProps {
  onGenerate: (img: string) => void;
  onDirectPrint?: (img: string) => void;
  onBatchPrint?: (images: string[]) => void;
  activeDraft?: { id: string; title: string; category: string } | null;
  onClearActiveDraft?: () => void;
}

export type BarcodeDesignStyle = 'minimal_square' | 'minimal_wide' | 'standard' | 'shelf' | 'price' | 'shipping' | 'apparel' | 'pure';

export const QRGenerator: React.FC<QRGeneratorProps> = ({ 
  onGenerate, 
  onDirectPrint, 
  onBatchPrint,
  activeDraft,
  onClearActiveDraft
}) => {
  // Main Tab
  const [activeTab, setActiveTab] = useState<'create' | 'scan' | 'batch' | 'archive'>('create');
  // Collapsible configuration state (defaults to closed)
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Archive Matching State for Scanner
  const [scannedArchive, setScannedArchive] = useState<BarcodeArchiveRecord | null>(null);
  const [isEmbeddedScan, setIsEmbeddedScan] = useState(false);
  const [archiveInitialCode, setArchiveInitialCode] = useState<string | null>(null);

  // Mode & Values
  const [codeKind, setCodeKind] = useState<'qr' | 'barcode'>('barcode');
  const [value, setValue] = useState('8690123456789');
  const [barcodeType, setBarcodeType] = useState('ean13');

  // Orientation & Layout Controls
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical');
  const [barcodeRotation, setBarcodeRotation] = useState<0 | 90 | 270>(0);
  const [designStyle, setDesignStyle] = useState<BarcodeDesignStyle>('minimal_square');
  const [labelWidthPreset, setLabelWidthPreset] = useState<number>(384);

  // Customization & Label Elements
  const [topHeader, setTopHeader] = useState('PREMIUM ÜRÜN ETİKETİ');
  const [subFooter, setSubFooter] = useState('Raf: A-12 / Parti: 2026-AUG');
  const [priceTag, setPriceTag] = useState('149.90 ₺');
  const [extraTag, setExtraTag] = useState('BEDEN: M / 38');
  const [borderStyle, setBorderStyle] = useState<'none' | 'box' | 'dashed' | 'badge'>('box');
  const [qrLevel, setQrLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [barcodeHeight, setBarcodeHeight] = useState(16);
  const [includeText, setIncludeText] = useState(true);

  // Preset Dialog / Sub-modes for QR
  const [qrPreset, setQrPreset] = useState<'url' | 'wifi' | 'vcard' | 'tel' | 'mail' | 'wa' | 'text'>('url');
  
  // Wi-Fi Preset Fields
  const [wifiSsid, setWifiSsid] = useState('iPrint_Guest_WiFi');
  const [wifiPass, setWifiPass] = useState('12345678');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

  // vCard Preset Fields
  const [vcardName, setVcardName] = useState('Ahmet Yılmaz');
  const [vcardPhone, setVcardPhone] = useState('+90 532 111 22 33');
  const [vcardEmail, setVcardEmail] = useState('ahmet@ornek.com');
  const [vcardCompany, setVcardCompany] = useState('İşletme / Butik');

  // WhatsApp / Tel Fields
  const [waPhone, setWaPhone] = useState('905321112233');
  const [waMsg, setWaMsg] = useState('Merhaba, ürünleriniz hakkında bilgi almak istiyorum.');
  const [telNumber, setTelNumber] = useState('0850 000 00 00');
  const [mailTo, setMailTo] = useState('siparis@firma.com');

  // Batch / Serial State
  const [batchPrefix, setBatchPrefix] = useState('STK-');
  const [batchStart, setBatchStart] = useState(1001);
  const [batchCount, setBatchCount] = useState(8);
  const [batchSuffix, setBatchSuffix] = useState('');
  const [batchItems, setBatchItems] = useState<string[]>([]);
  const [selectedBatchItem, setSelectedBatchItem] = useState<string>('STK-1001');

  // Camera & Image Scan State
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{ text: string; format: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isPlayingScanSound, setIsPlayingScanSound] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Play chiptune chime or melody upon scan
  const playScanCelebration = (scannedText: string) => {
    // If text contains a data: URL chiptune or standard scan, play an engaging 8-bit chiptune
    try {
      let melody = CHIPTUNE_PRESETS[0];
      if (scannedText.includes('Tetris') || scannedText.includes('tetris')) melody = CHIPTUNE_PRESETS[1];
      else if (scannedText.includes('Zelda') || scannedText.includes('zelda')) melody = CHIPTUNE_PRESETS[2];
      else if (scannedText.includes('Pac-Man') || scannedText.includes('pacman')) melody = CHIPTUNE_PRESETS[3];
      else if (scannedText.includes('Birthday') || scannedText.includes('Doğdun')) melody = CHIPTUNE_PRESETS[4];
      else if (scannedText.includes('Cyber') || scannedText.includes('Victory')) melody = CHIPTUNE_PRESETS[5];
      else {
        // Play victory/fanfare chiptune
        melody = CHIPTUNE_PRESETS[5] || CHIPTUNE_PRESETS[0];
      }

      setIsPlayingScanSound(true);
      playChiptunePreview(melody, () => {
        setIsPlayingScanSound(false);
      });
    } catch {
      // Audio fallback
    }
  };
  
  // Preview Canvases
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const batchCanvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeRenderError, setBarcodeRenderError] = useState<string | null>(null);

  // Copied feedback & Live Canvas Preview State
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Handle Design Style selection and pre-populate preset fields
  const handleSelectDesignStyle = (styleId: BarcodeDesignStyle) => {
    setDesignStyle(styleId);
    if (styleId === 'shelf') {
      if (!topHeader || topHeader === 'PREMIUM ÜRÜN ETİKETİ') setTopHeader('RAF LOKASYON: A-14/02');
      if (!subFooter || subFooter === 'Raf: A-12 / Parti: 2026-AUG') setSubFooter('ÜRÜN / PARTİ: 2026-AUG-88');
      if (!priceTag) setPriceTag('149.90 ₺');
    } else if (styleId === 'price') {
      if (!topHeader || topHeader === 'PREMIUM ÜRÜN ETİKETİ') setTopHeader('MAĞAZA VİTRİN ETİKETİ');
      if (!priceTag) setPriceTag('199.90 ₺');
      if (!subFooter) setSubFooter('KDV DAHİLDİR • FİYAT DEĞİŞİKLİK TARİHİ: 2026');
    } else if (styleId === 'shipping') {
      if (!topHeader || topHeader === 'PREMIUM ÜRÜN ETİKETİ') setTopHeader('📦 KARGO & SEVKİYAT FİŞİ');
      if (!extraTag) setExtraTag('Ahmet Yılmaz (0532 111 22 33)');
      if (!subFooter) setSubFooter('Kadıköy / İstanbul (Hızlı Teslimat)');
      if (!priceTag) setPriceTag('249.90 ₺');
    } else if (styleId === 'apparel') {
      if (!topHeader || topHeader === 'PREMIUM ÜRÜN ETİKETİ') setTopHeader('BOUTIQUE COLLECTION');
      if (!extraTag) setExtraTag('BEDEN: M (38) • %100 PAMUK');
      if (!priceTag) setPriceTag('389.00 ₺');
    } else if (styleId === 'standard') {
      if (!topHeader) setTopHeader('PREMIUM ÜRÜN ETİKETİ');
      if (!subFooter) setSubFooter('Raf: A-12 / Parti: 2026-AUG');
      if (!priceTag) setPriceTag('149.90 ₺');
    }
  };

  // Handle Orientation change and synchronize paper width preset
  const handleSelectOrientation = (orient: 'vertical' | 'horizontal') => {
    setOrientation(orient);
    if (orient === 'horizontal') {
      if (labelWidthPreset === 800) {
        setLabelWidthPreset(1200); // 15x10cm Yatay
      }
    } else if (orient === 'vertical') {
      if (labelWidthPreset === 1200) {
        setLabelWidthPreset(800); // 10x15cm Dikey
      }
    }
  };

  // Update QR value when preset fields change
  useEffect(() => {
    if (codeKind !== 'qr') return;
    if (qrPreset === 'wifi') {
      const wifiStr = `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPass};;`;
      setValue(wifiStr);
    } else if (qrPreset === 'vcard') {
      const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardCompany}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      setValue(vcard);
    } else if (qrPreset === 'wa') {
      const cleanPhone = waPhone.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(waMsg);
      setValue(`https://wa.me/${cleanPhone}?text=${encodedMsg}`);
    } else if (qrPreset === 'tel') {
      setValue(`tel:${telNumber.replace(/\s+/g, '')}`);
    } else if (qrPreset === 'mail') {
      setValue(`mailto:${mailTo}`);
    }
  }, [qrPreset, wifiSsid, wifiPass, wifiType, vcardName, vcardPhone, vcardEmail, vcardCompany, waPhone, waMsg, telNumber, mailTo, codeKind]);

  // Generate batch items
  useEffect(() => {
    const items: string[] = [];
    const count = Math.min(100, Math.max(1, batchCount));
    for (let i = 0; i < count; i++) {
      items.push(`${batchPrefix}${batchStart + i}${batchSuffix}`);
    }
    setBatchItems(items);
    if (items.length > 0 && (!selectedBatchItem || !items.includes(selectedBatchItem))) {
      setSelectedBatchItem(items[0]);
    }
  }, [batchPrefix, batchStart, batchCount, batchSuffix]);

  // Handle barcode format changes & provide valid default samples
  const handleBarcodeTypeChange = (newType: string) => {
    setBarcodeType(newType);
    setBarcodeRenderError(null);

    const val = value.trim();
    if (newType === 'ean13') {
      if (!/^\d{12,13}$/.test(val)) {
        setValue('8690123456789');
      }
    } else if (newType === 'ean8') {
      if (!/^\d{7,8}$/.test(val)) {
        setValue('86901234');
      }
    } else if (newType === 'upca') {
      if (!/^\d{11,12}$/.test(val)) {
        setValue('012345678905');
      }
    } else if (newType === 'itf14') {
      if (!/^\d{13,14}$/.test(val)) {
        setValue('18690123456786');
      }
    } else if (newType === 'code39') {
      if (/[^0-9A-Z\-\.\ \$\/\+\%]/i.test(val)) {
        setValue('CODE-39');
      }
    } else if (newType === 'code128') {
      if (!val) setValue('ITEM-99081');
    }
  };

  // Draw Live Preview for Barcode in Create Tab with Rotation support
  useEffect(() => {
    if (codeKind === 'barcode' && barcodeCanvasRef.current) {
      const canvas = barcodeCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      try {
        const cleanVal = (value || '8690123456789').trim();
        const effectiveBcid = (barcodeType === 'ean13' && !/^\d{12,13}$/.test(cleanVal)) ? 'code128' : barcodeType;
        
        const tempCanvas = document.createElement('canvas');
        bwipjs.toCanvas(tempCanvas, {
          bcid: effectiveBcid,
          text: cleanVal,
          scale: 2.8,
          height: barcodeHeight,
          includetext: includeText,
          textsize: 13,
          textxalign: 'center',
          textgaps: 1,
          paddingwidth: 2
        });

        if (barcodeRotation === 0) {
          canvas.width = tempCanvas.width;
          canvas.height = tempCanvas.height;
          ctx?.drawImage(tempCanvas, 0, 0);
        } else {
          // Rotated 90 or 270 degrees
          canvas.width = tempCanvas.height;
          canvas.height = tempCanvas.width;
          if (ctx) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((barcodeRotation * Math.PI) / 180);
            ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
            ctx.restore();
          }
        }
        setBarcodeRenderError(null);
      } catch (e: any) {
        setBarcodeRenderError(e?.message || 'Geçersiz barkod içeriği');
      }
    }
  }, [value, barcodeType, codeKind, barcodeHeight, includeText, barcodeRotation, activeTab]);

  // Draw Live Preview for Selected Batch Item
  useEffect(() => {
    if (activeTab === 'batch' && batchCanvasRef.current && selectedBatchItem) {
      const canvas = batchCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      try {
        bwipjs.toCanvas(canvas, {
          bcid: barcodeType === 'ean13' && !/^\d{12,13}$/.test(selectedBatchItem) ? 'code128' : barcodeType,
          text: selectedBatchItem,
          scale: 2.2,
          height: barcodeHeight,
          includetext: true,
          textsize: 10,
          textxalign: 'center',
          paddingwidth: 2
        });
      } catch (e) {
        try {
          bwipjs.toCanvas(canvas, {
            bcid: 'code128',
            text: selectedBatchItem,
            scale: 2.2,
            height: barcodeHeight,
            includetext: true,
            textsize: 10,
            textxalign: 'center',
            paddingwidth: 2
          });
        } catch (_) {}
      }
    }
  }, [selectedBatchItem, barcodeType, barcodeHeight, activeTab]);

  // Cleanup Scanner on Unmount or Tab Change
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const handleDetectedCode = (detectedText: string, format: string) => {
    setScannedResult({ text: detectedText, format });
    stopCameraScanner();
    playScanCelebration(detectedText);

    // İçerik Arşivi eşleşme kontrolü
    const match = barcodeArchiveStorage.parseScannedText(detectedText);
    if (match.record) {
      setScannedArchive(match.record);
      setIsEmbeddedScan(match.isEmbedded);
      logger.info(`İçerik Arşivi eşleşti: ${match.record.title}`);
    } else {
      setScannedArchive(null);
      setIsEmbeddedScan(false);
    }
    logger.info(`Barkod/QR okundu: ${detectedText} (${format})`);
  };

  const startCameraScanner = async () => {
    setScanError(null);
    setScannedResult(null);
    setScannedArchive(null);
    setIsEmbeddedScan(false);
    setIsScanning(true);

    try {
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }
      const reader = codeReaderRef.current;
      
      const videoDevices = await reader.listVideoInputDevices();
      if (!videoDevices || videoDevices.length === 0) {
        throw new Error('Kamera cihazı bulunamadı veya izin verilmedi.');
      }

      const backCam = videoDevices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('arka') || 
        d.label.toLowerCase().includes('environment')
      ) || videoDevices[0];

      if (videoRef.current) {
        reader.decodeFromVideoDevice(backCam.deviceId, videoRef.current, (result, err) => {
          if (result) {
            const detectedText = result.getText();
            const format = result.getBarcodeFormat() ? String(result.getBarcodeFormat()) : 'Bilinmeyen Format';
            handleDetectedCode(detectedText, format);
          }
        });
      }
    } catch (err: any) {
      setScanError(err?.message || 'Kamera başlatılamadı.');
      setIsScanning(false);
      logger.error('Scanner error', err);
    }
  };

  const stopCameraScanner = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch {
        // ignore reset error
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleImageUploadScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setScannedResult(null);
    setScannedArchive(null);
    setIsEmbeddedScan(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imgUrl = event.target?.result as string;
      try {
        if (!codeReaderRef.current) {
          codeReaderRef.current = new BrowserMultiFormatReader();
        }
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await codeReaderRef.current!.decodeFromImageElement(img);
            if (result) {
              const detectedText = result.getText();
              const format = result.getBarcodeFormat() ? String(result.getBarcodeFormat()) : 'Algılanan Kod';
              handleDetectedCode(detectedText, format);
            }
          } catch (decodeErr: any) {
            setScanError('Görselde net bir barkod veya QR kod bulunamadı. Lütfen daha net bir fotoğraf yükleyin.');
          }
        };
        img.src = imgUrl;
      } catch (err: any) {
        setScanError('Görsel işlenemedi.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const applyScannedToCreate = () => {
    if (!scannedResult) return;
    const text = scannedResult.text;
    setValue(text);
    if (/^\d{8,14}$/.test(text.trim())) {
      setCodeKind('barcode');
      handleBarcodeTypeChange(text.length === 13 ? 'ean13' : 'code128');
    } else {
      setCodeKind('qr');
      setQrPreset('text');
    }
    setActiveTab('create');
  };

  const handleCreateArchiveFromScanned = () => {
    if (!scannedResult) return;
    setArchiveInitialCode(scannedResult.text);
    setActiveTab('archive');
  };

  const handlePrintScannedArchive = async (forceShowItems?: boolean) => {
    if (!scannedArchive) return;
    const showItems = forceShowItems !== undefined ? forceShowItems : !scannedArchive.hideItemsOnLabel;
    const dataUrl = await renderArchiveLabel(scannedArchive, {
      width: labelWidthPreset <= 400 ? 384 : 576,
      showItemsList: showItems
    });
    if (dataUrl) {
      if (onDirectPrint) {
        onDirectPrint(dataUrl);
      } else {
        onGenerate(dataUrl);
      }
    }
  };

  const handleSaveEmbeddedToLocal = () => {
    if (!scannedArchive) return;
    barcodeArchiveStorage.save(scannedArchive);
    setIsEmbeddedScan(false);
    alert(`"${scannedArchive.title}" yerel arşivinize başarıyla kaydedildi!`);
  };

  const handleToggleScannedItem = (itemId: string) => {
    if (!scannedArchive) return;
    barcodeArchiveStorage.toggleItemChecked(scannedArchive.id, itemId);
    setScannedArchive({
      ...scannedArchive,
      items: scannedArchive.items.map(it => (it.id === itemId ? { ...it, checked: !it.checked } : it))
    });
  };

  // Compile final print canvas with Zero-Shift Math and High-Precision Layouts
  const buildFinalCanvas = async (targetValue: string, customKind?: 'qr' | 'barcode'): Promise<string | null> => {
    const cleanVal = (targetValue || '8690123456789').trim();
    const effectiveKind = customKind || codeKind;
    const isVerticalLayout = orientation === 'vertical';

    // Base target width in pixels
    const width = labelWidthPreset || 384;
    const scaleFactor = width / 384;
    const pad = Math.round(12 * scaleFactor);

    // Generate code element on a high-res buffer canvas
    let codeCanvas = document.createElement('canvas');
    if (effectiveKind === 'qr') {
      try {
        bwipjs.toCanvas(codeCanvas, {
          bcid: 'qrcode',
          text: cleanVal,
          scale: Math.max(3, Math.round(4 * scaleFactor)),
          paddingwidth: 1,
          paddingheight: 1
        });
      } catch (e) {
        logger.error('QR build error', e);
        return null;
      }
    } else {
      try {
        const effectiveBcid = (barcodeType === 'ean13' && !/^\d{12,13}$/.test(cleanVal)) ? 'code128' : barcodeType;
        bwipjs.toCanvas(codeCanvas, {
          bcid: effectiveBcid,
          text: cleanVal,
          scale: Math.max(2, Math.round(3.0 * scaleFactor)),
          height: Math.round(barcodeHeight * scaleFactor),
          includetext: includeText,
          textsize: Math.round(13 * scaleFactor),
          textxalign: 'center',
          textgaps: 1,
          paddingwidth: 2
        });
      } catch (err) {
        logger.error('Barcode build error', err);
        return null;
      }
    }

    // Apply Barcode Rotation if needed (90 or 270 degrees)
    if (effectiveKind === 'barcode' && barcodeRotation !== 0) {
      const rotCanvas = document.createElement('canvas');
      rotCanvas.width = codeCanvas.height;
      rotCanvas.height = codeCanvas.width;
      const rotCtx = rotCanvas.getContext('2d');
      if (rotCtx) {
        rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
        rotCtx.rotate((barcodeRotation * Math.PI) / 180);
        rotCtx.drawImage(codeCanvas, -codeCanvas.width / 2, -codeCanvas.height / 2);
        codeCanvas = rotCanvas;
      }
    }

    // Calculate Dynamic Canvas Height according to layout style and paper presets
    let canvasHeight = 0;
    if (labelWidthPreset === 800) {
      canvasHeight = 1200; // 10x15 cm Dikey
    } else if (labelWidthPreset === 1200) {
      canvasHeight = 800; // 15x10 cm Yatay
    } else if (designStyle === 'minimal_square') {
      canvasHeight = width; // Tam Kare (1:1 Aspect Ratio)
    } else if (designStyle === 'minimal_wide') {
      canvasHeight = Math.round(width * 0.56); // Geniş Kompakt (Yatay/Düşük Yükseklik)
    } else if (designStyle === 'pure') {
      canvasHeight = codeCanvas.height + pad * 2;
    } else if (designStyle === 'shelf') {
      canvasHeight = Math.round((isVerticalLayout ? 280 : 220) * scaleFactor);
    } else if (designStyle === 'price') {
      canvasHeight = Math.round((isVerticalLayout ? 300 : 240) * scaleFactor);
    } else if (designStyle === 'apparel') {
      canvasHeight = Math.round((isVerticalLayout ? 360 : 280) * scaleFactor);
    } else if (designStyle === 'shipping') {
      canvasHeight = Math.round((isVerticalLayout ? 380 : 300) * scaleFactor);
    } else {
      // standard layout
      let h = pad * 2 + 10;
      if (topHeader) h += Math.round(36 * scaleFactor);
      h += codeCanvas.height + Math.round(16 * scaleFactor);
      if (subFooter) h += Math.round(24 * scaleFactor);
      if (priceTag) h += Math.round(36 * scaleFactor);
      canvasHeight = Math.max(isVerticalLayout ? Math.round(320 * scaleFactor) : Math.round(220 * scaleFactor), h);
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = canvasHeight;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return null;

    // Solid Thermal White Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, canvasHeight);

    // Helper text wrapper
    const drawWrapped = (txt: string, x: number, startY: number, maxW: number, lineH: number, align: CanvasTextAlign = 'center') => {
      ctx.textAlign = align;
      const words = txt.split(' ');
      let line = '';
      let y = startY;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && n > 0) {
          ctx.fillText(line.trim(), x, y);
          line = words[n] + ' ';
          y += lineH;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, y);
      return y;
    };

    // Draw Frames
    if (borderStyle === 'box') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, Math.round(2.5 * scaleFactor));
      ctx.strokeRect(pad / 2, pad / 2, width - pad, canvasHeight - pad);
    } else if (borderStyle === 'dashed') {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, Math.round(2 * scaleFactor));
      ctx.setLineDash([Math.round(6 * scaleFactor), Math.round(4 * scaleFactor)]);
      ctx.strokeRect(pad / 2, pad / 2, width - pad, canvasHeight - pad);
      ctx.setLineDash([]);
    } else if (borderStyle === 'badge') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(pad / 2, pad / 2, width - pad, Math.round(32 * scaleFactor));
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, Math.round(2.5 * scaleFactor));
      ctx.strokeRect(pad / 2, pad / 2, width - pad, canvasHeight - pad);
    }

    // DRAW BY DESIGN STYLE (Sıfır kayma, 90/270 rotasyon hassas ölçekleme)
    if (designStyle === 'minimal_square') {
      // 1. MİNİMALİST TAM KARE (1:1) BARKOD / QR TASARIMI
      let y = pad + Math.round(4 * scaleFactor);
      if (topHeader) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(17 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(topHeader, width / 2, y + Math.round(14 * scaleFactor));
        y += Math.round(22 * scaleFactor);

        // İnce net ayırıcı çizgi
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, Math.round(1.5 * scaleFactor));
        ctx.beginPath();
        ctx.moveTo(pad + Math.round(4 * scaleFactor), y);
        ctx.lineTo(width - pad - Math.round(4 * scaleFactor), y);
        ctx.stroke();
        y += Math.round(8 * scaleFactor);
      }

      // Merkez Barkod / QR (Sıfır boşluk, maksimum okunaklı alan)
      const bottomReservedH = Math.round((priceTag || subFooter ? 52 : 16) * scaleFactor);
      const maxW = width - pad * 2 - Math.round(8 * scaleFactor);
      const maxH = canvasHeight - y - bottomReservedH;
      const drawScale = Math.min(1.2, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      const dy = y + Math.max(0, Math.round((maxH - dh) / 2));
      ctx.drawImage(codeCanvas, dx, dy, dw, dh);

      // Alt Bilgi & Fiyat Bölümü (Büyük, ultra net fontlar)
      const bottomY = canvasHeight - pad - Math.round(8 * scaleFactor);
      if (subFooter && priceTag) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(12 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(subFooter, pad + Math.round(6 * scaleFactor), bottomY);

        ctx.font = `900 ${Math.round(22 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(priceTag, width - pad - Math.round(6 * scaleFactor), bottomY);
      } else if (priceTag) {
        ctx.fillStyle = '#000000';
        ctx.font = `900 ${Math.round(24 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(priceTag, width / 2, bottomY);
      } else if (subFooter) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(13 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(subFooter, width / 2, bottomY);
      }

    } else if (designStyle === 'minimal_wide') {
      // 2. MİNİMALİST GENİŞ KOMPAKT BARKOD / QR TASARIMI
      let y = pad + Math.round(4 * scaleFactor);

      // Üst Başlık Satırı (Sol: Başlık, Sağ: Fiyat)
      const headerH = Math.round(22 * scaleFactor);
      if (topHeader || priceTag) {
        if (topHeader) {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.round(16 * scaleFactor)}px sans-serif`;
          ctx.textAlign = priceTag ? 'left' : 'center';
          ctx.fillText(topHeader, priceTag ? pad + Math.round(4 * scaleFactor) : width / 2, y + Math.round(14 * scaleFactor));
        }
        if (priceTag) {
          ctx.fillStyle = '#000000';
          ctx.font = `900 ${Math.round(20 * scaleFactor)}px sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText(priceTag, width - pad - Math.round(4 * scaleFactor), y + Math.round(14 * scaleFactor));
        }
        y += headerH + Math.round(4 * scaleFactor);

        // Ayırıcı çizgi
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(1, Math.round(1.5 * scaleFactor));
        ctx.beginPath();
        ctx.moveTo(pad + Math.round(2 * scaleFactor), y);
        ctx.lineTo(width - pad - Math.round(2 * scaleFactor), y);
        ctx.stroke();
        y += Math.round(6 * scaleFactor);
      }

      // Geniş Barkod (Tam genişliğe yayılan, gereksiz boşluksuz)
      const bottomH = subFooter || extraTag ? Math.round(20 * scaleFactor) : 0;
      const maxW = width - pad * 2 - Math.round(4 * scaleFactor);
      const maxH = canvasHeight - y - bottomH - pad;
      const drawScale = Math.min(1.2, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      const dy = y + Math.max(0, Math.round((maxH - dh) / 2));
      ctx.drawImage(codeCanvas, dx, dy, dw, dh);

      // Alt Satır (Sol: Alt Not, Sağ: Ek Bilgi)
      if (subFooter || extraTag) {
        const footY = canvasHeight - pad - Math.round(2 * scaleFactor);
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(11 * scaleFactor)}px sans-serif`;
        if (subFooter) {
          ctx.textAlign = 'left';
          ctx.fillText(subFooter, pad + Math.round(4 * scaleFactor), footY);
        }
        if (extraTag) {
          ctx.textAlign = 'right';
          ctx.fillText(extraTag, width - pad - Math.round(4 * scaleFactor), footY);
        }
      }

    } else if (designStyle === 'pure') {
      const maxW = width - pad * 2;
      const maxH = canvasHeight - pad * 2;
      const drawScale = Math.min(1, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      const dy = Math.round((canvasHeight - dh) / 2);
      ctx.drawImage(codeCanvas, dx, dy, dw, dh);

    } else if (designStyle === 'shelf') {
      // RAF & LOKASYON ETİKETİ
      let y = pad + 4;
      // Lokasyon Rozeti (Siyah Kutu)
      ctx.fillStyle = '#000000';
      const badgeH = Math.round(34 * scaleFactor);
      ctx.fillRect(pad, y, width - pad * 2, badgeH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(15 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(topHeader || 'RAF LOKASYON: A-14/02', width / 2, y + badgeH / 2);

      y += badgeH + Math.round(10 * scaleFactor);
      ctx.textBaseline = 'alphabetic';

      // Barkod Çizimi (maxW ve maxH çift sınırlandırması ile taşmaz)
      const maxW = width - pad * 2 - Math.round(16 * scaleFactor);
      const maxH = Math.max(40, canvasHeight - y - Math.round(40 * scaleFactor));
      const drawScale = Math.min(1, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      ctx.drawImage(codeCanvas, dx, y, dw, dh);
      y += dh + Math.round(14 * scaleFactor);

      // Alt Detay Çizgisi ve Notlar
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
      y += Math.round(14 * scaleFactor);

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(11 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(subFooter || 'ÜRÜN / PARTİ: 2026-AUG-88', pad + 4, y);

      if (priceTag) {
        ctx.textAlign = 'right';
        ctx.fillText(priceTag, width - pad - 4, y);
      }

    } else if (designStyle === 'price') {
      // VİTRİN & FİYAT ETİKETİ
      let y = pad + 4;
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(13 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(topHeader || 'MAĞAZA VİTRİN ETİKETİ', width / 2, y + Math.round(12 * scaleFactor));
      y += Math.round(22 * scaleFactor);

      // Büyük Fiyat Kutusu
      const priceBoxH = Math.round(50 * scaleFactor);
      ctx.fillStyle = '#000000';
      ctx.fillRect(pad + Math.round(10 * scaleFactor), y, width - (pad + Math.round(10 * scaleFactor)) * 2, priceBoxH);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(26 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(priceTag || '199.90 ₺', width / 2, y + priceBoxH / 2);
      ctx.textBaseline = 'alphabetic';
      y += priceBoxH + Math.round(14 * scaleFactor);

      // Barkod
      const maxW = width - pad * 2 - Math.round(20 * scaleFactor);
      const maxH = Math.max(40, canvasHeight - y - Math.round(30 * scaleFactor));
      const drawScale = Math.min(1, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      ctx.drawImage(codeCanvas, dx, y, dw, dh);
      y += dh + Math.round(14 * scaleFactor);

      // Alt Not / KDV
      ctx.fillStyle = '#000000';
      ctx.font = `${Math.round(10 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(subFooter || 'KDV DAHİLDİR • FİYAT DEĞİŞİKLİK TARİHİ: 2026', width / 2, y);

    } else if (designStyle === 'apparel') {
      // TEKSTİL & ASKI ETİKETİ
      let y = pad + 4;
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(14 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(topHeader || 'BOUTIQUE COLLECTION', width / 2, y + Math.round(12 * scaleFactor));
      y += Math.round(22 * scaleFactor);

      // Beden ve Tip Çerçevesi
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(1.5 * scaleFactor));
      const badgeH = Math.round(26 * scaleFactor);
      ctx.strokeRect(pad + Math.round(20 * scaleFactor), y, width - (pad + Math.round(20 * scaleFactor)) * 2, badgeH);
      ctx.font = `bold ${Math.round(12 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(extraTag || 'BEDEN: M (38) • %100 PAMUK', width / 2, y + Math.round(18 * scaleFactor));
      y += badgeH + Math.round(14 * scaleFactor);

      // Barkod
      const maxW = width - pad * 2 - Math.round(10 * scaleFactor);
      const maxH = Math.max(40, canvasHeight - y - Math.round(36 * scaleFactor));
      const drawScale = Math.min(1, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      ctx.drawImage(codeCanvas, dx, y, dw, dh);
      y += dh + Math.round(16 * scaleFactor);

      // Fiyat Alanı
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(18 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(priceTag || '389.00 ₺', width / 2, y);

    } else if (designStyle === 'shipping') {
      // KARGO & TESLİMAT ETİKETİ
      let y = pad + 4;
      ctx.fillStyle = '#000000';
      ctx.fillRect(pad, y, width - pad * 2, Math.round(28 * scaleFactor));
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.round(13 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(topHeader || '📦 KARGO & SEVKİYAT FİŞİ', width / 2, y + Math.round(19 * scaleFactor));
      y += Math.round(36 * scaleFactor);

      // Alıcı Bilgi Çerçevesi
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, y, width - pad * 2, Math.round(52 * scaleFactor));
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(11 * scaleFactor)}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(`ALICI: ${extraTag || 'Ahmet Yılmaz (0532 111 22 33)'}`, pad + 6, y + Math.round(16 * scaleFactor));
      ctx.font = `${Math.round(10 * scaleFactor)}px sans-serif`;
      ctx.fillText(`ADRES: ${subFooter || 'Kadıköy / İstanbul (Hızlı Teslimat)'}`, pad + 6, y + Math.round(34 * scaleFactor));
      y += Math.round(62 * scaleFactor);

      // Takip Barkodu
      const maxW = width - pad * 2 - Math.round(6 * scaleFactor);
      const maxH = Math.max(40, canvasHeight - y - Math.round(30 * scaleFactor));
      const drawScale = Math.min(1, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      ctx.drawImage(codeCanvas, dx, y, dw, dh);
      y += dh + Math.round(14 * scaleFactor);

      if (priceTag) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(12 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`KAPIDA ÖDEME: ${priceTag}`, width / 2, y);
      }

    } else {
      // STANDART DİKEY / YATAY ETİKET
      let y = pad + 4;
      if (topHeader) {
        if (borderStyle === 'badge') {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(12 * scaleFactor)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(topHeader, width / 2, pad / 2 + Math.round(16 * scaleFactor));
          ctx.textBaseline = 'alphabetic';
          y += Math.round(30 * scaleFactor);
        } else {
          ctx.fillStyle = '#000000';
          ctx.font = `bold ${Math.round(14 * scaleFactor)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(topHeader, width / 2, y + Math.round(10 * scaleFactor));
          y += Math.round(26 * scaleFactor);
        }
      } else if (borderStyle === 'badge') {
        y += Math.round(20 * scaleFactor);
      }

      // Code drawing with exact centering and double constraint (maxW & maxH)
      const maxW = width - pad * 2 - Math.round(12 * scaleFactor);
      const maxH = Math.max(40, canvasHeight - y - Math.round(30 * scaleFactor));
      const drawScale = Math.min(1, maxW / codeCanvas.width, maxH / codeCanvas.height);
      const dw = Math.round(codeCanvas.width * drawScale);
      const dh = Math.round(codeCanvas.height * drawScale);
      const dx = Math.round((width - dw) / 2);
      ctx.drawImage(codeCanvas, dx, y, dw, dh);
      y += dh + Math.round(12 * scaleFactor);

      if (subFooter) {
        ctx.fillStyle = '#000000';
        ctx.font = `${Math.round(11 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(subFooter, width / 2, y);
        y += Math.round(18 * scaleFactor);
      }

      if (priceTag) {
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.round(18 * scaleFactor)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(priceTag, width / 2, y);
      }
    }

    return finalCanvas.toDataURL('image/png');
  };

  // Live Canvas Preview Generator for real-time UI updates
  useEffect(() => {
    let isMounted = true;
    const updatePreview = async () => {
      if (activeTab !== 'create') return;
      const url = await buildFinalCanvas(value);
      if (isMounted && url) {
        setPreviewDataUrl(url);
      }
    };
    updatePreview();
    return () => {
      isMounted = false;
    };
  }, [
    value,
    codeKind,
    barcodeType,
    orientation,
    barcodeRotation,
    designStyle,
    labelWidthPreset,
    topHeader,
    subFooter,
    priceTag,
    extraTag,
    borderStyle,
    qrLevel,
    barcodeHeight,
    includeText,
    activeTab
  ]);

  const handleExportSingle = async () => {
    const dataUrl = await buildFinalCanvas(value);
    if (dataUrl) {
      onGenerate(dataUrl);
    }
  };

  const handleDirectPrintSingle = async () => {
    const dataUrl = await buildFinalCanvas(value);
    if (dataUrl) {
      if (onDirectPrint) {
        onDirectPrint(dataUrl);
      } else {
        onGenerate(dataUrl);
      }
    }
  };

  const handleExportBatchItem = async (itemVal: string) => {
    const dataUrl = await buildFinalCanvas(itemVal, 'barcode');
    if (dataUrl) {
      if (onDirectPrint) {
        onDirectPrint(dataUrl);
      } else {
        onGenerate(dataUrl);
      }
    }
  };

  const handlePrintAllBatch = async () => {
    const images: string[] = [];
    for (const item of batchItems) {
      const dataUrl = await buildFinalCanvas(item, 'barcode');
      if (dataUrl) images.push(dataUrl);
    }
    if (images.length > 0) {
      if (onBatchPrint) {
        onBatchPrint(images);
      } else if (onDirectPrint) {
        onDirectPrint(images[0]);
      } else {
        onGenerate(images[0]);
      }
    }
  };

  const handleCopyText = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyBatchPreset = (preset: 'stock' | 'box' | 'shelf' | 'num' | 'ean') => {
    if (preset === 'stock') {
      setBatchPrefix('STK-');
      setBatchStart(1001);
      setBatchCount(10);
      setBatchSuffix('');
      setBarcodeType('code128');
    } else if (preset === 'box') {
      setBatchPrefix('KOL-');
      setBatchStart(1);
      setBatchCount(12);
      setBatchSuffix('-TR');
      setBarcodeType('code128');
    } else if (preset === 'shelf') {
      setBatchPrefix('RAF-A');
      setBatchStart(10);
      setBatchCount(10);
      setBatchSuffix('');
      setBarcodeType('code128');
    } else if (preset === 'num') {
      setBatchPrefix('');
      setBatchStart(10001);
      setBatchCount(15);
      setBatchSuffix('');
      setBarcodeType('code128');
    } else if (preset === 'ean') {
      setBatchPrefix('8690000000');
      setBatchStart(10);
      setBatchCount(8);
      setBatchSuffix('');
      setBarcodeType('code128');
    }
  };

  const handleSaveQRDraft = async () => {
    const defaultTitle = codeKind === 'qr' ? `QR Kod (${value.slice(0, 12)})` : `Barkod (${barcodeType}) - ${value.slice(0, 12)}`;

    if (activeDraft && activeDraft.id) {
      const isUpdate = confirm(`"${activeDraft.title}" taslağı düzenleniyor.\n\n[Tamam] = Taslağı Güncelle\n[İptal] = Yeni Taslak Olarak Kaydet`);
      if (isUpdate) {
        await historyStorage.updateDraft(activeDraft.id, {
          title: activeDraft.title,
          category: 'tools',
          previewDataUrl: previewDataUrl || undefined,
          payload: {
            codeKind, value, barcodeType, orientation, barcodeRotation, designStyle,
            labelWidthPreset, topHeader, subFooter, priceTag, extraTag, borderStyle,
            qrLevel, barcodeHeight, includeText
          }
        });
        alert(`"${activeDraft.title}" taslağı güncellendi!`);
        return;
      }
    }

    const title = prompt('Taslak için bir başlık girin:', activeDraft?.title || defaultTitle);
    if (!title || !title.trim()) return;

    await historyStorage.saveDraft({
      title: title.trim(),
      category: 'tools',
      previewDataUrl: previewDataUrl || undefined,
      payload: {
        codeKind, value, barcodeType, orientation, barcodeRotation, designStyle,
        labelWidthPreset, topHeader, subFooter, priceTag, extraTag, borderStyle,
        qrLevel, barcodeHeight, includeText
      }
    });
    alert(`"${title.trim()}" taslak olarak kaydedildi!`);
  };

  return (
    <div className="space-y-2.5 pb-2 max-w-4xl mx-auto w-full">
      <Card className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs rounded-xl space-y-2.5">
      {/* Active Draft Banner */}
      {activeDraft && (
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
              📌 Barkod/QR Taslağı: "{activeDraft.title}"
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleSaveQRDraft}
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
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        {/* Üst Sekme Seçici - Kompakt & Tam Sığan Izgara */}
        <TabsList className="grid grid-cols-4 w-full h-8 sm:h-9 p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2">
          <TabsTrigger value="create" className="text-[11px] sm:text-xs font-bold gap-1 px-1 sm:px-2 py-1 cursor-pointer truncate">
            <Barcode size={13} className="shrink-0" />
            <span className="truncate">Oluştur</span>
          </TabsTrigger>
          <TabsTrigger value="scan" className="text-[11px] sm:text-xs font-bold gap-1 px-1 sm:px-2 py-1 cursor-pointer truncate">
            <Camera size={13} className="shrink-0" />
            <span className="truncate">Tara</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="text-[11px] sm:text-xs font-bold gap-1 px-1 sm:px-2 py-1 cursor-pointer truncate">
            <Layers size={13} className="shrink-0" />
            <span className="truncate">Sıralı</span>
          </TabsTrigger>
          <TabsTrigger value="archive" className="text-[11px] sm:text-xs font-bold gap-1 px-1 sm:px-2 py-1 cursor-pointer truncate">
            <Boxes size={13} className="shrink-0" />
            <span className="truncate">Arşiv</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. OLUŞTURUCU TAB */}
        <TabsContent value="create" className="space-y-2.5 pt-0">
          {/* Canlı Görsel Önizleme Kartı (EN BAŞTA) */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex flex-col items-center justify-center">
            <div className="w-full max-w-[360px] flex flex-col items-center">
              {/* Tek Satır Canlı Önizleme & Ölçü Başlığı */}
              {(() => {
                const h = orientation === 'vertical' ? (labelWidthPreset === 800 ? 1200 : 400) : (labelWidthPreset === 800 ? 800 : 300);
                const wCm = labelWidthPreset <= 400 ? '5.7' : labelWidthPreset <= 600 ? '8.0' : labelWidthPreset === 800 ? '10.0' : '15.0';
                const hCm = (h / 80).toFixed(2).replace(/\.?0+$/, '');
                return (
                  <div className="w-full bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center justify-between font-mono border border-slate-200 dark:border-slate-700/80 shadow-2xs select-none mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Eye size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {orientation === 'vertical' ? 'Dikey Önizleme' : 'Yatay Önizleme'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ruler size={11} className="text-amber-500 shrink-0" />
                      <span className="text-[10px] uppercase font-bold text-slate-400">Ölçü:</span>
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                        {wCm}cm × {hCm}cm
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Termal Kağıt Görünümü */}
              {previewDataUrl ? (
                <div className="p-1.5 bg-slate-200 dark:bg-slate-900 rounded-none shadow-2xs border border-slate-300 dark:border-slate-700 flex items-center justify-center w-full overflow-hidden">
                  <img
                    src={previewDataUrl}
                    alt="Canlı Termal Etiket Önizleme"
                    className="max-w-full object-contain rounded-none shadow-xs border border-slate-300 dark:border-slate-800 bg-white transition-all duration-200"
                    style={{
                      maxHeight: orientation === 'vertical' ? '230px' : '160px'
                    }}
                  />
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
                  <RefreshCw size={16} className="animate-spin text-teal-600" />
                  <span>Canlı Etiket Oluşturuluyor...</span>
                </div>
              )}
            </div>
          </div>

          {/* Aksiyon Butonları (Önizlemenin hemen altında - Tek ve Tam Genişlik) */}
          <div className="pt-0.5">
            <Button
              onClick={handleDirectPrintSingle}
              className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-9 font-bold text-xs shadow-2xs cursor-pointer"
            >
              <Printer size={14} /> Baskı Önizle & Yazdır
            </Button>
          </div>

          {/* DÜZENLEME KISMI - AÇILIR KAPANIR AKORDİYON MENÜ (Varsayılan olarak KAPALI) */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Sliders size={14} />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Barkod & QR Ayarlarını Düzenle
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {codeKind === 'barcode' ? `${barcodeType.toUpperCase()} Barkod` : '2D QR Kod'} • {designStyle.toUpperCase()} • {orientation === 'vertical' ? 'Dikey' : 'Yatay'} ({labelWidthPreset === 384 ? '57mm' : labelWidthPreset === 576 ? '80mm' : labelWidthPreset === 800 ? '10x15' : '15x10'})
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  {isConfigOpen ? 'Menüyü Kapat' : 'Düzenle'}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${isConfigOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Açılır Kapanır Düzenleme İçeriği */}
            {isConfigOpen && (
              <div className="space-y-3 pt-3 animate-in fade-in-50 duration-200">
          {/* Kod Türü ve Oryantasyon Çubuğu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Kod Türü (QR vs Barkod) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Button
                type="button"
                variant={codeKind === 'barcode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCodeKind('barcode');
                  handleBarcodeTypeChange('ean13');
                }}
                className="gap-1.5 text-xs font-bold h-8 rounded-md"
              >
                <Barcode size={14} /> 1D / 2D Barkod
              </Button>
              <Button
                type="button"
                variant={codeKind === 'qr' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCodeKind('qr');
                  if (!value.startsWith('http')) setValue('https://iprint.pro');
                }}
                className="gap-1.5 text-xs font-bold h-8 rounded-md"
              >
                <QrCode size={14} /> 2D QR Kod
              </Button>
            </div>

            {/* Yönlendirme (Dikey vs. Yatay) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Button
                type="button"
                variant={orientation === 'vertical' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSelectOrientation('vertical')}
                className="gap-1.5 text-xs font-bold h-8 rounded-md"
              >
                ↕️ Dikey (Portrait)
              </Button>
              <Button
                type="button"
                variant={orientation === 'horizontal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSelectOrientation('horizontal')}
                className="gap-1.5 text-xs font-bold h-8 rounded-md"
              >
                ↔️ Yatay (Landscape)
              </Button>
            </div>
          </div>

          {/* Dikey / Yatay Özel Tasarım Stilleri */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Sparkles size={12} className="text-teal-600" /> Barkod Tasarım Stili (Minimalist & Okunaklı)
              </Label>
              <span className="text-[9px] font-semibold text-teal-600 dark:text-teal-400">Canlı Önizlemeli</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {[
                { id: 'minimal_square', label: 'Kare (1:1)', icon: Square, desc: 'Kompakt' },
                { id: 'minimal_wide', label: 'Geniş', icon: RectangleHorizontal, desc: 'Yatay' },
                { id: 'standard', label: 'Standart', icon: Tag, desc: 'Dengeli' },
                { id: 'shelf', label: 'Raf/Depo', icon: MapPin, desc: 'Lokasyon' },
                { id: 'price', label: 'Fiyat', icon: DollarSign, desc: 'Mağaza' },
                { id: 'shipping', label: 'Kargo', icon: Truck, desc: 'Lojistik' },
                { id: 'apparel', label: 'Tekstil', icon: Shirt, desc: 'Bedenli' },
                { id: 'pure', label: 'Saf Kod', icon: Maximize2, desc: 'Kırpılmış' }
              ].map(st => {
                const Icon = st.icon;
                const isSelected = designStyle === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSelectDesignStyle(st.id as BarcodeDesignStyle)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-bold shadow-xs ring-1 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
                    <span className="text-[10px] mt-1 truncate max-w-full">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QR Kod Hızlı Şablonları */}
          {codeKind === 'qr' && (
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'url', label: 'Web Link', icon: Globe },
                { id: 'wifi', label: 'Wi-Fi Giriş', icon: Wifi },
                { id: 'wa', label: 'WhatsApp', icon: MessageSquare },
                { id: 'vcard', label: 'Kartvizit', icon: User },
                { id: 'tel', label: 'Telefon', icon: Phone },
                { id: 'mail', label: 'E-Posta', icon: Mail },
                { id: 'text', label: 'Düz Metin', icon: Sparkles }
              ].map(p => {
                const Icon = p.icon;
                const isSelected = qrPreset === p.id;
                return (
                  <Button
                    key={p.id}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setQrPreset(p.id as any)}
                    className="h-7 text-[11px] px-2.5 rounded-lg whitespace-nowrap font-medium gap-1 shrink-0"
                  >
                    <Icon size={12} /> {p.label}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Düz Giriş / URL / Barkod Değeri */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label className="text-[11px] uppercase font-bold text-slate-500">
                {codeKind === 'qr' ? 'QR İçeriği / URL / Metin' : 'Barkod Kodu (Veri)'}
              </Label>
              <Button variant="ghost" size="sm" onClick={handleCopyText} className="h-5 text-[10px] px-1.5 text-slate-500">
                {copied ? <Check size={11} className="text-emerald-500 mr-1" /> : <Copy size={11} className="mr-1" />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </Button>
            </div>
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setBarcodeRenderError(null);
              }}
              placeholder={codeKind === 'qr' ? 'https://... veya metin girin' : 'Örn: 8690123456789 veya ITEM-100'}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs h-9 font-mono font-medium"
            />
            {barcodeRenderError && (
              <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
                <AlertCircle size={12} />
                <span>{barcodeRenderError} (Standardına uygun veri giriniz)</span>
              </div>
            )}
          </div>

          {/* 1D Barkod Formatı, Yükseklik ve Rotasyon Açısı */}
          {codeKind === 'barcode' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Barkod Standardı</Label>
                <Select value={barcodeType} onValueChange={(v) => v && handleBarcodeTypeChange(v)}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs h-8 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="ean13">EAN-13 (13 Haneli Perakende)</SelectItem>
                    <SelectItem value="code128">Code 128 (Harf + Rakam)</SelectItem>
                    <SelectItem value="ean8">EAN-8 (8 Haneli Kompakt)</SelectItem>
                    <SelectItem value="upca">UPC-A (12 Haneli)</SelectItem>
                    <SelectItem value="itf14">ITF-14 (Koli / Lojistik)</SelectItem>
                    <SelectItem value="code39">Code 39 (Klasik Endüstriyel)</SelectItem>
                    <SelectItem value="datamatrix">DataMatrix (2D Kare)</SelectItem>
                    <SelectItem value="pdf417">PDF417 (Belge & Kimlik)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Barkod Açısı (Döndürme)</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={barcodeRotation === 0 ? 'default' : 'outline'}
                    onClick={() => setBarcodeRotation(0)}
                    className="flex-1 h-8 text-[10px] font-bold px-1 rounded-lg"
                  >
                    0° Düz
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={barcodeRotation === 90 ? 'default' : 'outline'}
                    onClick={() => setBarcodeRotation(90)}
                    className="flex-1 h-8 text-[10px] font-bold px-1 rounded-lg"
                    title="Dikeye tam oturan 90 derece dikey barkod"
                  >
                    90° Dikey
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={barcodeRotation === 270 ? 'default' : 'outline'}
                    onClick={() => setBarcodeRotation(270)}
                    className="flex-1 h-8 text-[10px] font-bold px-1 rounded-lg"
                  >
                    270° Ters
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500">Barkod Yüksekliği</Label>
                <Select value={String(barcodeHeight)} onValueChange={(v) => v && setBarcodeHeight(Number(v))}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs h-8 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="10">İnce (10mm)</SelectItem>
                    <SelectItem value="16">Standart (16mm)</SelectItem>
                    <SelectItem value="24">Geniş (24mm)</SelectItem>
                    <SelectItem value="32">Büyük (32mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Gelişmiş Etiket & Çerçeve / Başlık Özelleştirici */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-teal-600 dark:text-teal-400" />
                <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">Etiket Metin ve Alanları</Label>
              </div>
              {/* Boyut Seçici */}
              <div className="flex items-center gap-1">
                {[
                  { w: 384, l: '57mm', orient: 'vertical' },
                  { w: 576, l: '80mm', orient: 'vertical' },
                  { w: 800, l: '10x15', orient: 'vertical' },
                  { w: 1200, l: '15x10', orient: 'horizontal' }
                ].map(b => (
                  <button
                    key={b.w}
                    type="button"
                    onClick={() => {
                      setLabelWidthPreset(b.w);
                      if (b.orient) handleSelectOrientation(b.orient as 'vertical' | 'horizontal');
                    }}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all ${
                      labelWidthPreset === b.w
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {b.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <Label className="text-[10px] text-slate-500 font-bold">Üst Başlık / Ürün Adı</Label>
                <Input
                  value={topHeader}
                  onChange={e => setTopHeader(e.target.value)}
                  placeholder="Örn: Butik Kahve No:4"
                  className="h-7 text-[11px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 font-bold">Ek Bilgi / Beden / Alıcı</Label>
                <Input
                  value={extraTag}
                  onChange={e => setExtraTag(e.target.value)}
                  placeholder="Örn: BEDEN: L / ALICI: Deniz K."
                  className="h-7 text-[11px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 font-bold">Alt Not / Parti / Adres</Label>
                <Input
                  value={subFooter}
                  onChange={e => setSubFooter(e.target.value)}
                  placeholder="Örn: Raf A-12 / Parti: 08"
                  className="h-7 text-[11px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500 font-bold">Fiyat / Vurgu</Label>
                <Input
                  value={priceTag}
                  onChange={e => setPriceTag(e.target.value)}
                  placeholder="Örn: 249.90 ₺"
                  className="h-7 text-[11px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-bold text-slate-500">Kenarlık:</Label>
                <div className="flex gap-1">
                  {[
                    { id: 'none', label: 'Yok' },
                    { id: 'box', label: 'Kutu' },
                    { id: 'dashed', label: 'Kesikli' },
                    { id: 'badge', label: 'Rozet' }
                  ].map(b => (
                    <Button
                      key={b.id}
                      type="button"
                      size="sm"
                      variant={borderStyle === b.id ? 'default' : 'outline'}
                      onClick={() => setBorderStyle(b.id as any)}
                      className="h-6 text-[9px] px-2 rounded-md font-bold"
                    >
                      {b.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-bold text-slate-500">Metin Göster:</Label>
                <Button
                  type="button"
                  size="sm"
                  variant={includeText ? 'default' : 'outline'}
                  onClick={() => setIncludeText(!includeText)}
                  className="h-6 text-[9px] px-2 rounded-md font-bold"
                >
                  {includeText ? 'Açık' : 'Kapalı'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </TabsContent>

  {/* 2. TARA & KLONLA TAB */}
  <TabsContent value="scan" className="space-y-3.5 pt-2">
          <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2">
              <Camera size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Kamera veya Görselden Barkod / QR Oku & Klonla
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Fiziksel ürün, ambalaj veya fatura üzerindeki barkodu kamerayla okutarak anında termal etikete dönüştürün.
            </p>
          </div>

          {/* Kamera Canlı Akış Penceresi */}
          {isScanning ? (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-indigo-500 shadow-md">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-dashed border-red-500/80 m-6 rounded-lg pointer-events-none animate-pulse flex items-center justify-center">
                <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold">Kodu Kırmızı Alana Hizalayın</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={stopCameraScanner}
                className="absolute top-2 right-2 h-7 text-xs px-2 gap-1 rounded-md font-bold shadow"
              >
                <VideoOff size={13} /> Kapat
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={startCameraScanner}
                className="h-20 flex flex-col gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                <Camera size={22} />
                <span className="text-xs font-bold">Kamerayı Aç</span>
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-xs font-bold"
                >
                  <Upload size={22} className="text-slate-500" />
                  <span>Fotoğraf Yükle</span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadScan}
                  title="Görsel Yükle"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {scanError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 font-medium">
              {scanError}
            </div>
          )}

          {/* Tarama Sonucu Kartı */}
          {scannedResult && (
            <div className="space-y-2.5">
              {/* Eğer İçerik Arşivi eşleştiyse özel koli kartı */}
              {scannedArchive ? (
                <Card className="p-3.5 bg-teal-50/90 dark:bg-teal-950/50 border-2 border-teal-500/70 dark:border-teal-600 rounded-xl space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                      <Boxes size={15} className="text-teal-600" />
                      İçerik Arşivi Bulundu
                    </span>
                    <div className="flex items-center gap-1.5">
                      {scannedArchive.hideItemsOnLabel && (
                        <span className="text-[9.5px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Barcode size={10} /> Sade Barkod
                        </span>
                      )}
                      <span className="text-[10px] bg-teal-200 dark:bg-teal-900 px-2 py-0.5 rounded font-bold text-teal-900 dark:text-teal-200">
                        {scannedArchive.category}
                      </span>
                      {isEmbeddedScan && (
                        <span className="text-[9.5px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                          Evrensel QR
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Koli Başlığı ve Lokasyon */}
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-teal-200 dark:border-teal-800 space-y-1">
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                      {scannedArchive.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Kod: {scannedArchive.code}</span>
                      {scannedArchive.location && (
                        <span className="flex items-center gap-0.5 text-teal-700 dark:text-teal-300 font-sans font-bold">
                          <MapPin size={10} /> {scannedArchive.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* İçerik Maddeleri Listesi (Canlı Sayım / Checkbox) */}
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-teal-200 dark:border-teal-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                      <span>İçindekiler Listesi ({scannedArchive.items.length} Kalem)</span>
                      <span>
                        {scannedArchive.items.filter(i => i.checked).length}/{scannedArchive.items.length} Hazır
                      </span>
                    </div>

                    {scannedArchive.items.length === 0 ? (
                      <p className="text-[10.5px] text-slate-400 italic">İçerik maddesi tanımlanmamış.</p>
                    ) : (
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                        {scannedArchive.items.map(it => (
                          <div
                            key={it.id}
                            onClick={() => handleToggleScannedItem(it.id)}
                            className="flex items-center justify-between p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs border border-transparent hover:border-slate-200 select-none transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              {it.checked ? (
                                <CheckSquare size={13} className="text-teal-600 shrink-0" />
                              ) : (
                                <Square size={13} className="text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`truncate font-medium ${
                                  it.checked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 line-through'
                                }`}
                              >
                                {it.name}
                              </span>
                            </div>
                            {it.quantity && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold shrink-0 ml-1">
                                {it.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {scannedArchive.note && (
                      <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        Not: {scannedArchive.note}
                      </p>
                    )}
                  </div>

                  {/* Arşiv Aksiyon Butonları */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handlePrintScannedArchive()}
                      className="h-9 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Printer size={13} />
                      {scannedArchive.hideItemsOnLabel ? 'Sade Barkod Yazdır' : 'İçerikli Barkod Yazdır'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setArchiveInitialCode(scannedArchive.code);
                        setActiveTab('archive');
                      }}
                      className="h-9 bg-white dark:bg-slate-900 border-teal-300 dark:border-teal-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg gap-1.5 cursor-pointer"
                    >
                      <Boxes size={13} className="text-teal-600" /> Arşivde Düzenle
                    </Button>
                  </div>

                  {isEmbeddedScan && (
                    <Button
                      onClick={handleSaveEmbeddedToLocal}
                      className="w-full h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg gap-1 cursor-pointer"
                    >
                      <Check size={12} /> Bu Evrensel Arşivi Yerel Kayıtlarıma Ekle
                    </Button>
                  )}
                </Card>
              ) : null}

              {/* Standart Tarama Sonucu Kartı */}
              <Card className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <Check size={13} className="text-emerald-600" /> Kod Başarıyla Okundu
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded font-mono font-bold text-emerald-900 dark:text-emerald-200">
                      {scannedResult.format}
                    </span>
                    <span className="text-[9.5px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      🎵 8-Bit Chiptune
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold break-all text-slate-800 dark:text-slate-100">
                  {scannedResult.text}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={applyScannedToCreate}
                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} /> Kodu Klonla / Düzenle
                  </Button>

                  {!scannedArchive && (
                    <Button
                      onClick={handleCreateArchiveFromScanned}
                      className="h-9 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Boxes size={13} /> Bu Koda İçerik Listesi Tanımla
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => playScanCelebration(scannedResult.text)}
                    className="h-9 text-xs font-bold border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 col-span-1 sm:col-span-2"
                  >
                    🎵 Melodiyi Tekrar Çal
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* 3. SERİ & SIRALI BARKOD TAB */}
        <TabsContent value="batch" className="space-y-3 pt-2">
          <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Sıralı / Seri Barkod Üreteci (Batch Generator)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Stok, depo, koli ve numara takibi için ardışık seri barkodları tek hamlede üretip toplu veya tekli yazdırın.
            </p>
          </div>

          {/* Hızlı Şablonlar */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyBatchPreset('stock')}
              className="h-6 text-[10px] px-2 rounded-md font-bold bg-white dark:bg-slate-900 gap-1 shrink-0"
            >
              <Package size={11} className="text-amber-600" /> Stok (STK-1001..)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyBatchPreset('box')}
              className="h-6 text-[10px] px-2 rounded-md font-bold bg-white dark:bg-slate-900 gap-1 shrink-0"
            >
              <Boxes size={11} className="text-teal-600" /> Koli (KOL-001..)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyBatchPreset('shelf')}
              className="h-6 text-[10px] px-2 rounded-md font-bold bg-white dark:bg-slate-900 gap-1 shrink-0"
            >
              <MapPin size={11} className="text-indigo-600" /> Raf (RAF-A10..)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyBatchPreset('num')}
              className="h-6 text-[10px] px-2 rounded-md font-bold bg-white dark:bg-slate-900 gap-1 shrink-0"
            >
              <Hash size={11} className="text-rose-600" /> Numaratör
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px] font-bold text-slate-500">Önek (Prefix)</Label>
              <Input value={batchPrefix} onChange={e => setBatchPrefix(e.target.value)} className="h-8 text-xs font-mono" />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-slate-500">Başlangıç No</Label>
              <Input type="number" value={batchStart} onChange={e => setBatchStart(Number(e.target.value) || 1)} className="h-8 text-xs font-mono" />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-slate-500">Üretim Adedi</Label>
              <Input type="number" min={1} max={100} value={batchCount} onChange={e => setBatchCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} className="h-8 text-xs font-mono" />
            </div>
            <div>
              <Label className="text-[10px] font-bold text-slate-500">Sonek (Suffix)</Label>
              <Input value={batchSuffix} onChange={e => setBatchSuffix(e.target.value)} className="h-8 text-xs font-mono" />
            </div>
          </div>

          {/* Seçilen Seri Elemanı Canlı Önizleme */}
          {selectedBatchItem && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl flex flex-col items-center">
              <div className="w-full max-w-[280px]">
                <div className="text-[9px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1"><Eye size={11} /> Seçilen Seri Önizlemesi</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{selectedBatchItem}</span>
                </div>
                <div className="w-full bg-white text-black p-3 rounded-none border-2 border-black shadow-xs flex flex-col items-center justify-center">
                  <canvas ref={batchCanvasRef} className="max-w-full" />
                </div>
              </div>
            </div>
          )}

          {/* Üretilen Seri Listesi */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Seri Listesi ({batchItems.length} Adet)
              </Label>
              <span className="text-[10px] text-slate-400">Önizlemek için tıklayın</span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {batchItems.map((item, idx) => {
                const isSelected = selectedBatchItem === item;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedBatchItem(item)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 w-5 h-5 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportBatchItem(item);
                      }}
                      className="h-6 text-[10px] px-2 font-bold bg-white dark:bg-slate-900"
                    >
                      <Printer size={10} className="mr-1 text-teal-600" /> Yazdır
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Toplu Yazdırma Aksiyon Butonları */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              onClick={handlePrintAllBatch}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-9 font-bold text-xs shadow-sm col-span-2 sm:col-span-1"
            >
              <Printer size={14} /> Tüm Seriyi Toplu Yazdır ({batchItems.length} Adet)
            </Button>
            <Button
              onClick={() => handleExportBatchItem(selectedBatchItem || batchItems[0])}
              variant="outline"
              className="gap-1.5 rounded-lg h-9 font-bold text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1"
            >
              <Eye size={14} /> Seçileni Önizle & Yazdır
            </Button>
          </div>
        </TabsContent>

        {/* 4. İÇERİK ARŞİVİ & KOLİ YÖNETİMİ TAB */}
        <TabsContent value="archive" className="space-y-3 pt-1">
          <BarcodeArchiveManager
            onDirectPrint={onDirectPrint}
            onGenerate={onGenerate}
            initialCodeToCreate={archiveInitialCode}
            onClearInitialCode={() => setArchiveInitialCode(null)}
            onSwitchToScan={() => setActiveTab('scan')}
          />
        </TabsContent>
      </Tabs>
    </Card>

    {/* Alt Sabit Kapsül Gezinme Menüsü - Tam Sığan Kompakt Tasarım */}
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[96vw]">
      <button
        type="button"
        onClick={() => setActiveTab('create')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'create'
            ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Barcode size={14} className="shrink-0" />
        <span>Oluştur</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('scan')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'scan'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Camera size={14} className="shrink-0" />
        <span>Tara</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('batch')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'batch'
            ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Layers size={14} className="shrink-0" />
        <span>Sıralı</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('archive')}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'archive'
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Boxes size={14} className="shrink-0" />
        <span>Arşiv</span>
      </button>
    </div>
  </div>
  );
};

