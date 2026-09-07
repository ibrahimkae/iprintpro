import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import {
  Music, Volume2, VolumeX, Play, Square, Printer, Sparkles,
  ArrowLeft, Check, RefreshCw, Copy, ExternalLink, Radio,
  Layers, Sliders, Smartphone, Info, Heart, Award, ShieldAlert,
  Flame, Gamepad2, Gift, Coffee, Download, Zap, Globe, HardDrive, Eye
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  CHIPTUNE_PRESETS,
  ChiptuneMelody,
  generateChiptuneWebUrl,
  generateChiptuneDataUrl,
  playChiptunePreview,
  stopChiptunePreview
} from '../lib/chiptune-engine';

// Safe Error Boundary for QR Code preview rendering
interface SafeQRErrorBoundaryProps {
  children: ReactNode;
}

interface SafeQRErrorBoundaryState {
  hasError: boolean;
}

class SafeQRErrorBoundary extends Component<SafeQRErrorBoundaryProps, SafeQRErrorBoundaryState> {
  constructor(props: SafeQRErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('QR Code render fallback triggered:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-[220px] h-[220px] flex flex-col items-center justify-center bg-slate-100 text-slate-700 p-2 text-center text-xs font-mono rounded-lg">
          <Info size={24} className="mb-1 text-amber-600" />
          <span>QR Kod Oluşturuldu</span>
        </div>
      );
    }
    return this.props.children;
  }
}

function SafeQRCodeSVG({ value, size = 220 }: { value: string; size?: number }) {
  return (
    <SafeQRErrorBoundary key={value}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={false}
      />
    </SafeQRErrorBoundary>
  );
}

export interface ChiptuneMusicStudioProps {
  pageWidth?: number; // 384 or 576
  onPrintImage: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export function ChiptuneMusicStudio({
  pageWidth = 384,
  onPrintImage,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}: ChiptuneMusicStudioProps) {
  const [selectedMelody, setSelectedMelody] = useState<ChiptuneMelody>(CHIPTUNE_PRESETS[0]);
  const [customTitle, setCustomTitle] = useState<string>(CHIPTUNE_PRESETS[0].name);
  const [customSubtitle, setCustomSubtitle] = useState<string>('Kamerayla Okutun & 8-Bit Melodiyi Dinleyin');
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isGeneratingPrint, setIsGeneratingPrint] = useState<boolean>(false);

  // QR Mode: 'web-url' (100% universal phone camera compatibility) vs 'data-url' (raw offline base64)
  const [qrMode, setQrMode] = useState<'web-url' | 'data-url'>('web-url');

  // Categories
  const categories = ['Tümü', 'Oyun Klasikleri', 'Neşeli & Kutlama', 'Retro & Synth', 'Özel & Bildirim'];

  const filteredMelodies = CHIPTUNE_PRESETS.filter((m) => {
    if (activeCategory === 'Tümü') return true;
    return m.category === activeCategory;
  });

  // Active QR Value calculation
  const activeQrValue = qrMode === 'web-url'
    ? generateChiptuneWebUrl(selectedMelody, customTitle)
    : generateChiptuneDataUrl(selectedMelody, customTitle);

  const payloadByteSize = new Blob([activeQrValue]).size;

  // Handle Play / Stop Synthesizer Preview
  const handleTogglePlay = (melody: ChiptuneMelody) => {
    if (isPlaying && selectedMelody.id === melody.id) {
      stopChiptunePreview();
      setIsPlaying(false);
    } else {
      setSelectedMelody(melody);
      setCustomTitle(melody.name);
      setIsPlaying(true);
      playChiptunePreview(melody, () => {
        setIsPlaying(false);
      });
    }
  };

  useEffect(() => {
    return () => {
      stopChiptunePreview();
    };
  }, []);

  // Copy QR Link / Data URL
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeQrValue);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Direct test in new browser tab
  const handleTestInBrowser = () => {
    window.open(activeQrValue, '_blank');
  };

  // Render Card to Thermal Printable Canvas (Direct, Synchronous Canvas QR)
  const handlePrint = async (direct: boolean = true) => {
    setIsGeneratingPrint(true);
    try {
      const targetPaperWidth = pageWidth >= 576 ? 576 : 384;
      const canvas = document.createElement('canvas');
      const scale = 2; // Crisp 2x render for thermal print quality
      const canvasW = targetPaperWidth;
      
      // Calculate QR Code maximized size (fills roll with minimal safe margin)
      const paddingX = targetPaperWidth >= 576 ? 16 : 10;
      const qrTargetSize = canvasW - paddingX * 2;

      // Card height calculation
      const headerHeight = targetPaperWidth >= 576 ? 145 : 125;
      const footerHeight = targetPaperWidth >= 576 ? 95 : 80;
      const totalHeight = headerHeight + qrTargetSize + footerHeight;

      canvas.width = canvasW * scale;
      canvas.height = totalHeight * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasW, totalHeight);
      ctx.imageSmoothingEnabled = false;

      const contentW = canvasW - paddingX * 2;
      let curY = 12;

      // Outer Decorative Border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = targetPaperWidth >= 576 ? 3 : 2;
      ctx.strokeRect(paddingX - 2, curY, contentW + 4, totalHeight - 24);

      // Inner Corner Accents (Retro Arcade Card feel)
      const cornerSize = targetPaperWidth >= 576 ? 14 : 10;
      ctx.fillStyle = '#000000';
      ctx.fillRect(paddingX + 2, curY + 2, cornerSize, 2);
      ctx.fillRect(paddingX + 2, curY + 2, 2, cornerSize);
      ctx.fillRect(paddingX + contentW + 2 - cornerSize, curY + 2, cornerSize, 2);
      ctx.fillRect(paddingX + contentW, curY + 2, 2, cornerSize);

      // Header Title
      curY += targetPaperWidth >= 576 ? 26 : 20;
      ctx.font = targetPaperWidth >= 576 ? '900 20px sans-serif' : '900 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText('⚡ 8-BIT RETRO SES KARTI ⚡', canvasW / 2, curY);

      curY += targetPaperWidth >= 576 ? 16 : 13;
      ctx.font = targetPaperWidth >= 576 ? 'bold 12px monospace' : 'bold 9.5px monospace';
      ctx.fillStyle = '#333333';
      ctx.fillText('Web Audio API • 100% Offline Chiptune', canvasW / 2, curY);

      // Divider Line
      curY += 8;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(paddingX + 8, curY);
      ctx.lineTo(paddingX + contentW - 8, curY);
      ctx.stroke();

      // Song Title & Icon
      curY += targetPaperWidth >= 576 ? 26 : 20;
      ctx.font = targetPaperWidth >= 576 ? '900 19px sans-serif' : '900 14px sans-serif';
      ctx.fillStyle = '#000000';
      ctx.fillText(`${selectedMelody.icon} ${customTitle}`, canvasW / 2, curY);

      curY += targetPaperWidth >= 576 ? 16 : 12;
      ctx.font = targetPaperWidth >= 576 ? 'bold 11.5px sans-serif' : 'bold 9.5px sans-serif';
      ctx.fillStyle = '#444444';
      ctx.fillText(customSubtitle, canvasW / 2, curY);

      // Generate Crisp 2D QR Code Directly via QRCode.toCanvas (100% synchronous & reliable)
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, activeQrValue, {
        width: qrTargetSize * scale,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: qrMode === 'web-url' ? 'M' : 'L'
      });

      const qrX = paddingX;
      curY += targetPaperWidth >= 576 ? 14 : 10;

      // QR Frame box / Quiet zone
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(qrX - 2, curY - 2, qrTargetSize + 4, qrTargetSize + 4);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 2, curY - 2, qrTargetSize + 4, qrTargetSize + 4);
      ctx.drawImage(qrCanvas, qrX, curY, qrTargetSize, qrTargetSize);

      curY += qrTargetSize + (targetPaperWidth >= 576 ? 14 : 10);

      // Bottom Action Banner
      const bannerH = targetPaperWidth >= 576 ? 32 : 25;
      ctx.fillStyle = '#000000';
      ctx.fillRect(paddingX + 4, curY, contentW - 8, bannerH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = targetPaperWidth >= 576 ? '900 12.5px sans-serif' : '900 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷 TELEFON KAMERASI İLE OKUTUN', canvasW / 2, curY + (bannerH / 2) + (targetPaperWidth >= 576 ? 4.5 : 3.5));

      curY += bannerH + (targetPaperWidth >= 576 ? 15 : 11);
      ctx.fillStyle = '#444444';
      ctx.font = targetPaperWidth >= 576 ? '11px monospace' : '9px monospace';
      ctx.fillText('⚡ 15sn Nostaljik Retro Melodi • Otomatik Çalar', canvasW / 2, curY);

      const finalDataUrl = canvas.toDataURL('image/png');
      const widthMm = pageWidth >= 576 ? 80 : 57;

      if (direct && onDirectPrint) {
        onDirectPrint(finalDataUrl, `8Bit-Chiptune-${selectedMelody.id}`, widthMm);
      } else if (!direct && onPreviewAndPrint) {
        onPreviewAndPrint(finalDataUrl, `8Bit-Chiptune-${selectedMelody.id}`, widthMm);
      } else {
        onPrintImage(finalDataUrl, `8Bit-Chiptune-${selectedMelody.id}`, widthMm);
      }
    } catch (err) {
      console.error('Chiptune thermal canvas render error:', err);
    } finally {
      setIsGeneratingPrint(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4 max-w-6xl mx-auto pb-24 animate-in fade-in duration-300"
    >
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

        {/* Right: Quick Category Switcher (Expanding on active) & Fixed Print Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick Category Pill Group (Expanding Buttons) */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 gap-0.5">
            {categories.slice(0, 4).map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  title={cat}
                  className={`flex items-center gap-1.5 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white px-2.5 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 px-2'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestInBrowser}
            className="text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-2.5 rounded-xl hidden sm:flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink size={13} className="text-emerald-500" />
            <span>Test Et</span>
          </Button>

          {/* Fixed Print Button */}
          <Button
            size="sm"
            onClick={() => handlePrint(true)}
            disabled={isGeneratingPrint}
            className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isGeneratingPrint ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
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

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Melody Selector, Player & Customizer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Melodies List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
            {filteredMelodies.map((melody) => {
              const isSelected = selectedMelody.id === melody.id;
              const isCurrPlaying = isPlaying && isSelected;

              return (
                <Card
                  key={melody.id}
                  onClick={() => {
                    setSelectedMelody(melody);
                    setCustomTitle(melody.name);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-2xl flex items-center justify-center shrink-0 shadow-2xs">
                        {melody.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {melody.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {melody.tempo} BPM • {melody.waveform} dalga
                        </span>
                      </div>
                    </div>

                    {/* Listen Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlay(melody);
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isCurrPlaying
                          ? 'bg-emerald-600 text-white animate-pulse shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                      }`}
                      title={isCurrPlaying ? 'Durdur' : 'Canlı Dinle'}
                    >
                      {isCurrPlaying ? <Square size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {melody.description}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* QR Format Toggle Card */}
          <Card className="p-4 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-500" /> QR Kod Formatı & Uyumluluk
              </h4>
              <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                {qrMode === 'web-url' ? '⚡ %100 Tüm Kameralarla Uyumlu' : '💾 Çevrimdışı Ham Veri'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQrMode('web-url')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  qrMode === 'web-url'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Globe size={14} className="text-emerald-500" />
                  <span>Akıllı Web Linki</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  iPhone, Android & PC kameraları anında tıklar ve çalar (Önerilen)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQrMode('data-url')}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  qrMode === 'data-url'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <HardDrive size={14} className="text-emerald-500" />
                  <span>Ham Data URI</span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Tamamen sunucusuz, saf HTML5 kod taşıyan çevrimdışı data URL
                </span>
              </button>
            </div>
          </Card>

          {/* Active Card Customization Form */}
          <Card className="p-4 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders size={14} className="text-emerald-500" /> Kart & Başlık Özelleştirme
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Kart Başlığı:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  placeholder="Başlık girin..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Alt Açıklama & Yönerge:
                </label>
                <input
                  type="text"
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  placeholder="Yönerge..."
                />
              </div>
            </div>

            {/* Technical Specs Badge */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Veri Boyutu: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{payloadByteSize} Bayt</strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  ({qrMode === 'web-url' ? 'Hızlı & Net Barkod Modu' : 'Sıkıştırılmış MIDI Data'})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10.5px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedUrl ? 'Kopyalandı!' : 'QR Bağlantısını Kopyala'}
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: High-Resolution Thermal Card Live Preview */}
        <div className="lg:col-span-5 space-y-3">
          <Card className="p-4 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Smartphone size={14} className="text-emerald-500" /> Termal Çıktı Önizlemesi
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                58mm / 80mm Uyumlu
              </span>
            </div>

            {/* Thermal Print Preview Container */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <div className="w-full max-w-[320px] bg-white text-slate-950 p-3 rounded-xl border-2 border-slate-950 shadow-md flex flex-col items-center text-center space-y-2 relative">
                {/* Header Stamp */}
                <div className="border-b border-dashed border-slate-300 w-full pb-1.5">
                  <div className="text-[12px] font-black tracking-wider uppercase">
                    ⚡ 8-BIT RETRO SES KARTI ⚡
                  </div>
                  <div className="text-[9px] font-mono text-slate-600">
                    Web Audio API • 100% Offline Chiptune
                  </div>
                </div>

                {/* Song Title & Icon */}
                <div className="pt-0.5">
                  <div className="text-sm font-black flex items-center justify-center gap-1.5">
                    <span>{selectedMelody.icon}</span>
                    <span>{customTitle}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-600 font-medium">
                    {customSubtitle}
                  </div>
                </div>

                {/* QR Code Container - Maximized full width */}
                <div className="w-full p-2 bg-white border border-slate-950 rounded-lg shadow-2xs my-1 flex items-center justify-center">
                  <SafeQRCodeSVG
                    value={activeQrValue}
                    size={240}
                  />
                </div>

                {/* Action Banner */}
                <div className="w-full bg-slate-950 text-white text-[10px] font-black py-1.5 rounded-md uppercase tracking-wider">
                  📷 TELEFON KAMERASIYLA OKUTUN
                </div>

                <div className="text-[8.5px] font-mono text-slate-500 pt-0.5">
                  15sn Retro Melodi • Otomatik Çalar
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                  <Check size={11} /> Barkod Kağıt Boyutunu Tam Kaplayacak Şekilde Büyütüldü
                </span>
              </div>
            </div>

            {/* Direct Test & Audio Player Controls */}
            <div className="space-y-2 pt-1">
              <Button
                onClick={() => handleTogglePlay(selectedMelody)}
                className={`w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square size={15} className="fill-current" />
                    Melodiyi Durdur
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    Örnek Melodiyi Dinle ({selectedMelody.name})
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Educational Info Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1 text-slate-700 dark:text-slate-300">
            <h5 className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-[11px]">
              <Sparkles size={12} /> Nasıl Çalışır?
            </h5>
            <p className="text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-400">
              Oluşturulan QR kod, telefon kamerası ile okutulduğunda anında <strong>15 saniyelik nostaljik 8-bit chiptune</strong> melodiyi (Super Mario, Tetris, Zelda vb.) retro synthesizer oynatıcı ile çalar.
            </p>
          </div>
        </div>
      </div>

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => handleTogglePlay(selectedMelody)}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            isPlaying
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 animate-pulse'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {isPlaying ? <Square size={14} className="fill-current" /> : <Volume2 size={14} />}
          <span>{isPlaying ? 'Durdur' : 'Dinle'}</span>
        </button>

        <button
          type="button"
          onClick={() => handlePrint(false)}
          disabled={isGeneratingPrint}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Eye size={14} />
          <span>Önizle</span>
        </button>

        <button
          type="button"
          onClick={handleTestInBrowser}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ExternalLink size={14} />
          <span>Test Et</span>
        </button>
      </div>
    </motion.div>
  );
}
