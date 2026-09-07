import React, { useState, useEffect, useRef } from 'react';
import { ThermalTemplate, ThermalPaperStyle } from '../types';
import { ThermalTemplateRenderer } from './ThermalTemplateRenderer';
import { STANDARD_DIMENSIONS } from '../data/dimensions';
import { captureElementToDataUrl } from '../../utils/dom-capture';
import {
  X,
  Printer,
  Download,
  Save,
  RotateCcw,
  Sliders,
  Layers,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Check,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Settings2,
  ChevronLeft,
  Heart,
  Maximize
} from 'lucide-react';

interface TemplateEditorModalProps {
  template: ThermalTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAsCustom: (template: ThermalTemplate, customTitle: string, customData: Record<string, any>) => void;
  onPrintDirect?: (dataUrl: string, title: string, widthMm?: number) => void;
  initialWidthMm?: number;
  initialPaperStyle?: ThermalPaperStyle;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  template,
  isOpen,
  onClose,
  onSaveAsCustom,
  onPrintDirect,
  initialWidthMm = 57,
  initialPaperStyle = 'standard',
  isFavorite = false,
  onToggleFavorite
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => template?.defaultData ? { ...template.defaultData } : {});
  const [selectedWidthMm, setSelectedWidthMm] = useState<number>(template?.recommendedWidthMm || initialWidthMm || 57);
  const [customWidthMm, setCustomWidthMm] = useState<number>(template?.recommendedWidthMm || initialWidthMm || 57);
  const [isCustomWidth, setIsCustomWidth] = useState<boolean>(false);
  const [heightMode, setHeightMode] = useState<'auto' | 'fixed'>(template?.heightMm ? 'fixed' : 'auto');
  const [fixedHeightMm, setFixedHeightMm] = useState<number>(template?.heightMm || 50);
  const [paperStyle, setPaperStyle] = useState<ThermalPaperStyle>(initialPaperStyle);
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [copies, setCopies] = useState<number>(1);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>(template ? `${template.title} (Özelleştirilmiş)` : '');
  
  // Mobile / Desktop active tabs
  const [activeTab, setActiveTab] = useState<'fields' | 'dimensions' | 'advanced'>('fields');
  // For mobile view switch
  const [mobileView, setMobileView] = useState<'preview' | 'fields' | 'dimensions' | 'advanced'>('preview');

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportCaptureRef = useRef<HTMLDivElement | null>(null);

  const effectiveWidth = isCustomWidth ? customWidthMm : selectedWidthMm;
  const effectiveHeight = heightMode === 'fixed' ? fixedHeightMm : undefined;

  // Akıllı tam ekrana sığdırma ölçeği hesabı
  const calculateAutoFitScale = (targetWidth: number, targetHeight?: number) => {
    if (typeof window === 'undefined') return 0.85;
    const isMobile = window.innerWidth < 768;
    const availWidth = isMobile ? Math.max(260, window.innerWidth - 48) : 520;
    const availHeight = isMobile ? Math.max(220, window.innerHeight * 0.42) : 520;

    // Termal piksel genişliği tahmini (1mm ~ 8 dots)
    const estWidthPx = targetWidth * 7.6;
    const estHeightPx = (targetHeight || 65) * 7.6;

    const scaleW = availWidth / estWidthPx;
    const scaleH = availHeight / estHeightPx;
    const fit = Math.min(scaleW, scaleH, 1.0);
    return Math.max(0.35, parseFloat(fit.toFixed(2)));
  };

  // Synchronize state faithfully when template opens
  useEffect(() => {
    if (template && isOpen) {
      setFormData({ ...template.defaultData });
      const targetWidth = initialWidthMm || template.recommendedWidthMm || 57;
      setSelectedWidthMm(targetWidth);
      setCustomWidthMm(targetWidth);
      setIsCustomWidth(false);
      setPaperStyle(initialPaperStyle);
      
      const targetHeight = template.heightMm;
      if (targetHeight) {
        setHeightMode('fixed');
        setFixedHeightMm(targetHeight);
      } else {
        setHeightMode('auto');
      }

      setZoomScale(calculateAutoFitScale(targetWidth, targetHeight));
      setCustomTitle(`${template.title} (Özelleştirilmiş)`);
      setMobileView('preview');
      setActiveTab('fields');
    }
  }, [template, isOpen, initialWidthMm, initialPaperStyle]);

  if (!isOpen || !template) return null;

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    setFormData({ ...template.defaultData });
  };

  const handleFitToScreen = () => {
    setZoomScale(calculateAutoFitScale(effectiveWidth, effectiveHeight));
  };

  const handlePrint = async () => {
    const targetElement = exportCaptureRef.current || previewRef.current;
    if (onPrintDirect && targetElement) {
      try {
        setIsExporting(true);
        const dataUrl = await captureElementToDataUrl(targetElement, {
          scale: 1,
          backgroundColor: paperStyle === 'invert' ? '#050505' : '#ffffff'
        });
        onPrintDirect(dataUrl, template.title, effectiveWidth);
      } catch (err) {
        console.error('Thermal print capture failed, fallback to window.print:', err);
        window.print();
      } finally {
        setIsExporting(false);
      }
    } else {
      window.print();
    }
  };

  const handleExportPNG = async () => {
    const targetElement = exportCaptureRef.current || previewRef.current;
    if (!targetElement) return;
    try {
      setIsExporting(true);
      const dataUrl = await captureElementToDataUrl(targetElement, {
        scale: 2,
        backgroundColor: paperStyle === 'invert' ? '#050505' : '#ffffff'
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${template.id}_${effectiveWidth}mm.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export PNG failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveCustom = () => {
    onSaveAsCustom(template, customTitle, formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Responsive Form Fields View
  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
          <Sliders size={13} className="text-indigo-600 dark:text-indigo-400" />
          <span>Şablon Alanları</span>
        </span>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
        >
          <RotateCcw size={12} /> Varsayılana Dön
        </button>
      </div>

      {template.fields.map((field) => {
        const value = formData[field.key] ?? field.defaultValue;

        return (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {field.label}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-[16px] sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium transition-colors"
              />
            )}

            {field.type === 'barcode' && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder="Örn: 8690123456789"
                  className="w-full px-3 py-2 text-[16px] sm:text-xs rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold transition-colors"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Değer değiştikçe barkod otomatik güncellenir.</p>
              </div>
            )}

            {field.type === 'qrcode' && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-[16px] sm:text-xs rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/30 text-teal-950 dark:text-teal-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono transition-colors"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Canlı QR Kod bağlantı veya metni.</p>
              </div>
            )}

            {field.type === 'textarea' && (
              <textarea
                rows={3}
                value={value || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-[16px] sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed transition-colors"
              />
            )}

            {field.type === 'select' && (
              <select
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-[16px] sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold transition-colors"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'checkbox' && (
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 select-none">Etikette bu sembolleri göster</span>
              </label>
            )}
          </div>
        );
      })}
    </div>
  );

  // Responsive Dimensions Tab
  const renderDimensionsTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Standart Ölçü Şablonları</span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Hızlı Seçim</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
          Şablon seçilen kağıt genişliğine göre otomatik uyarlanır.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {STANDARD_DIMENSIONS.map((dim) => {
            const isSelected = !isCustomWidth && selectedWidthMm === dim.widthMm && (
              (dim.heightMm && heightMode === 'fixed' && fixedHeightMm === dim.heightMm) ||
              (!dim.heightMm && heightMode === 'auto')
            );

            return (
              <button
                key={dim.id}
                type="button"
                onClick={() => {
                  setIsCustomWidth(false);
                  setSelectedWidthMm(dim.widthMm);
                  setCustomWidthMm(dim.widthMm);
                  if (dim.heightMm) {
                    setHeightMode('fixed');
                    setFixedHeightMm(dim.heightMm);
                  } else {
                    setHeightMode('auto');
                  }
                  setZoomScale(calculateAutoFitScale(dim.widthMm, dim.heightMm));
                }}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">{dim.name}</span>
                  <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {dim.badge}
                  </span>
                </div>
                <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {dim.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Width Slider */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Sliders size={14} className="text-indigo-600 dark:text-indigo-400" />
            Genişlik (En) Ayarı
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="30"
              max="180"
              value={customWidthMm}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 57;
                setCustomWidthMm(val);
                setIsCustomWidth(true);
              }}
              className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
            />
            <span className="font-mono text-xs text-slate-500">mm</span>
          </div>
        </div>

        <input
          type="range"
          min="35"
          max="180"
          step="1"
          value={customWidthMm}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setCustomWidthMm(val);
            setIsCustomWidth(true);
          }}
          className="w-full accent-indigo-600 cursor-pointer"
        />

        <div className="flex items-center gap-1.5">
          {[57, 80, 100, 150].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                setCustomWidthMm(w);
                setSelectedWidthMm(w);
                setIsCustomWidth(false);
                setZoomScale(calculateAutoFitScale(w, effectiveHeight));
              }}
              className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                effectiveWidth === w
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {w} mm
            </button>
          ))}
        </div>
      </div>

      {/* Height / Uzunluk Kontrolü */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-600 dark:text-indigo-400" />
            Uzunluk Davranışı
          </label>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            {heightMode === 'auto' ? 'Kompakt Rulo' : `${fixedHeightMm} mm`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setHeightMode('auto');
              setZoomScale(calculateAutoFitScale(effectiveWidth, undefined));
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              heightMode === 'auto'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Minimize2 size={13} />
              Otomatik Rulo
            </span>
            <span className="text-[9px] opacity-80 font-normal">Boşluksuz</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHeightMode('fixed');
              setZoomScale(calculateAutoFitScale(effectiveWidth, fixedHeightMm));
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              heightMode === 'fixed'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Maximize2 size={13} />
              Sabit Boy
            </span>
            <span className="text-[9px] opacity-80 font-normal">{fixedHeightMm} mm</span>
          </button>
        </div>

        {heightMode === 'fixed' && (
          <div className="pt-2 space-y-2.5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Sabit Uzunluk:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="20"
                  max="250"
                  value={fixedHeightMm}
                  onChange={(e) => setFixedHeightMm(parseInt(e.target.value, 10) || 50)}
                  className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                />
                <span className="font-mono text-xs text-slate-500">mm</span>
              </div>
            </div>

            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={fixedHeightMm}
              onChange={(e) => setFixedHeightMm(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex items-center gap-1">
              {[30, 50, 75, 100, 150].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setFixedHeightMm(h)}
                  className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                    fixedHeightMm === h
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Responsive Advanced / Print Settings Tab
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
          Baskı Adedi
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kopya Sayısı:</label>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setCopies((c) => Math.max(1, c - 1))}
              className="px-3.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer text-sm"
            >
              -
            </button>
            <span className="px-4 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white">{copies}</span>
            <button
              type="button"
              onClick={() => setCopies((c) => c + 1)}
              className="px-3.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold cursor-pointer text-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl text-xs space-y-1.5 text-indigo-900 dark:text-indigo-200">
        <div className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
          <Sparkles size={14} />
          Termal Yazıcı İpucu:
        </div>
        <p className="leading-relaxed text-[11px] opacity-90">
          Yazdırırken tarayıcının veya sistemin yazdırma penceresinde kenar boşluklarını (Margins) <strong>"Yok / None"</strong> olarak seçiniz.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Özel Şablon Başlığı</label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-3 py-2 text-[16px] sm:text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={handleSaveCustom}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {isSavedNotice ? <Check size={15} className="text-emerald-500" /> : <Save size={15} />}
          {isSavedNotice ? 'Koleksiyonunuza Kaydedildi!' : 'Özel Olarak Kaydet'}
        </button>
      </div>
    </div>
  );

  // Live Stage Component (Önizleme alanı - Sayfaya tam sığar, asla taşma yapmaz)
  const renderPreviewStage = () => (
    <div className="flex-1 bg-slate-100/80 dark:bg-slate-950 p-2 sm:p-3.5 flex flex-col items-center justify-between overflow-hidden relative w-full h-full">
      {/* Top Floating Toolbar */}
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex items-center justify-between mb-2 text-xs flex-wrap gap-1">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-400 mr-0.5">Kağıt:</span>
          {(['standard', 'vintage', 'dither', 'invert'] as ThermalPaperStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setPaperStyle(style)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                paperStyle === style
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {style === 'standard' && 'Beyaz'}
              {style === 'vintage' && 'Kraft'}
              {style === 'dither' && 'Matris'}
              {style === 'invert' && 'Siyah'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-1.5">
          <button
            type="button"
            onClick={handleFitToScreen}
            className="px-1.5 py-1 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
            title="Ekrana Tam Sığdır"
          >
            <Maximize size={12} />
            <span>Sığdır</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(0.3, parseFloat((z - 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            title="Uzaklaştır"
          >
            <ZoomOut size={13} />
          </button>
          <span className="font-mono font-bold text-[10px] w-7 text-center text-slate-700 dark:text-slate-300">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(2.0, parseFloat((z + 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            title="Yakınlaştır"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Centered Rendered Label Stage (Container'a tam sığan dinamik alan) */}
      <div className="flex-1 flex items-center justify-center p-2 w-full overflow-hidden max-h-[58vh] md:max-h-[66vh]">
        <div
          ref={previewRef}
          className="transform transition-transform duration-150 origin-center drop-shadow-xl my-auto flex items-center justify-center max-w-full max-h-full"
        >
          <ThermalTemplateRenderer
            id="printable-thermal-label"
            template={template}
            data={formData}
            widthMm={effectiveWidth}
            heightMm={effectiveHeight}
            paperStyle={paperStyle}
            scale={zoomScale}
          />
        </div>
      </div>

      {/* Bottom Info Banner */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-[11px] text-slate-800 dark:text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{effectiveWidth} mm {effectiveHeight ? `× ${effectiveHeight} mm` : '(Rulo)'}</span>
        </div>
        <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 font-mono">
          <span>203 DPI Termal</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs overflow-hidden">
      
      {/* Container: Full Screen on Mobile (100dvh), Sleek Clean Window on Desktop */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full h-[100dvh] md:h-[90vh] md:max-w-6xl md:rounded-3xl shadow-2xl border-0 md:border md:border-slate-200 dark:md:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Bar: Ferah, Tam Başlık ve Tek Ana Aksiyon */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
              title="Kapat"
            >
              <ChevronLeft size={22} className="md:hidden" />
              <X size={18} className="hidden md:block" />
            </button>

            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center font-bold shrink-0">
              <Printer size={16} />
            </div>

            {/* Başlık: Taşmadan, kesilmeden (... kalmadan) tam görünür */}
            <div className="min-w-0 flex-1 pr-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm md:text-base leading-snug break-words">
                  {template.title}
                </h2>
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0">
                  {effectiveWidth}mm{effectiveHeight ? `×${effectiveHeight}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Header Actions - TEK ANA YAZDIR BUTONU BURADA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(template.id)}
                className={`p-2 rounded-xl border transition-all active:scale-125 cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500'
                }`}
                title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="PNG İndir"
            >
              <Download size={15} />
              <span className="hidden sm:inline">{isExporting ? '...' : 'PNG'}</span>
            </button>

            {/* TEK ANA YAZDIR BUTONU (Kullanıcı isteği: hem altta hem üstte çift buton olmasın) */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Printer size={15} />
              <span>Yazdır</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (Kompakt ve Temiz Tab Bar) */}
        <div className="flex md:hidden bg-slate-100/90 dark:bg-slate-950 p-1 border-b border-slate-200 dark:border-slate-800 gap-1 shrink-0 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'preview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye size={13} />
            <span>Önizleme</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView('fields')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'fields'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Edit3 size={13} />
            <span>Alanlar</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView('dimensions')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'dimensions'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers size={13} />
            <span>Ölçü</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileView('advanced')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'advanced'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings2 size={13} />
            <span>Ayarlar</span>
          </button>
        </div>

        {/* Modal Main Area: Responsive Layout (Mobile: Tab Based, Desktop: Split Screen) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* MOBILE CONTENT CONTAINER */}
          <div className="flex-1 flex flex-col md:hidden overflow-hidden">
            {mobileView === 'preview' && renderPreviewStage()}
            {mobileView === 'fields' && (
              <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 pb-12">
                {renderFieldsTab()}
              </div>
            )}
            {mobileView === 'dimensions' && (
              <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 pb-12">
                {renderDimensionsTab()}
              </div>
            )}
            {mobileView === 'advanced' && (
              <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 pb-12">
                {renderAdvancedTab()}
              </div>
            )}
          </div>

          {/* DESKTOP CONTENT CONTAINER: Left Stage + Right Bento Form */}
          <div className="hidden md:flex flex-1 flex-row overflow-hidden w-full">
            {/* LEFT: Live Stage */}
            <div className="flex-1 border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
              {renderPreviewStage()}
            </div>

            {/* RIGHT: Bento Settings Panel */}
            <div className="w-[400px] lg:w-[440px] bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2.5 bg-slate-50/70 dark:bg-slate-950/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('fields')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'fields'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Sliders size={14} />
                  Alanlar
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dimensions')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dimensions'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Layers size={14} />
                  Ölçü
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('advanced')}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'advanced'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Settings2 size={14} />
                  Ayarlar
                </button>
              </div>

              {/* Tab Body */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
                {activeTab === 'fields' && renderFieldsTab()}
                {activeTab === 'dimensions' && renderDimensionsTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
              </div>

              {/* Desktop Bottom Footer: Sadece ikincil aksiyonlar (Kaydet & Kapat) - Yazdır butonu üstte tek */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  {isSavedNotice ? <Check size={14} className="text-emerald-500" /> : <Save size={14} />}
                  <span>{isSavedNotice ? 'Kaydedildi' : 'Şablonu Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Persistent Offscreen Master Print Target */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          overflow: 'hidden',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999
        }}
      >
        <div ref={exportCaptureRef}>
          <ThermalTemplateRenderer
            template={template}
            data={formData}
            widthMm={effectiveWidth}
            heightMm={effectiveHeight}
            paperStyle={paperStyle}
            scale={1}
          />
        </div>
      </div>
    </div>
  );
};



