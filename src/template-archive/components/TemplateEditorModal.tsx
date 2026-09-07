import React, { useState, useEffect, useRef } from 'react';
import { ThermalTemplate, ThermalPaperStyle } from '../types';
import { ThermalTemplateRenderer } from './ThermalTemplateRenderer';
import { captureElementToDataUrl } from '../../utils/dom-capture';
import {
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
  const [formData, setFormData] = useState<Record<string, any>>(() => (template?.defaultData ? { ...template.defaultData } : {}));
  const [selectedWidthMm, setSelectedWidthMm] = useState<number>(template?.recommendedWidthMm || initialWidthMm || 57);
  const [customWidthMm, setCustomWidthMm] = useState<number>(template?.recommendedWidthMm || initialWidthMm || 57);
  const [isCustomWidth, setIsCustomWidth] = useState<boolean>(false);
  const [heightMode, setHeightMode] = useState<'auto' | 'fixed'>(template?.heightMm ? 'fixed' : 'auto');
  const [fixedHeightMm, setFixedHeightMm] = useState<number>(template?.heightMm || 50);
  const [paperStyle, setPaperStyle] = useState<ThermalPaperStyle>(initialPaperStyle);
  const [zoomScale, setZoomScale] = useState<number>(0.92);
  const [copies, setCopies] = useState<number>(1);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>(template ? `${template.title} (Özelleştirilmiş)` : '');
  
  // Alt Menü Sekmeleri: Önizleme, Alanlar, Ölçü, Ayarlar
  const [activeTab, setActiveTab] = useState<'preview' | 'fields' | 'dimensions' | 'advanced'>('preview');

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportCaptureRef = useRef<HTMLDivElement | null>(null);

  const effectiveWidth = isCustomWidth ? customWidthMm : selectedWidthMm;
  const effectiveHeight = heightMode === 'fixed' ? fixedHeightMm : undefined;

  // Akıllı ve ferah tam ekrana sığdırma ölçeği hesabı (Çok küçültmeden, ekrana tam ve büyük sığdırma)
  const calculateAutoFitScale = (targetWidth: number, targetHeight?: number) => {
    if (typeof window === 'undefined') return 1.0;
    const isMobile = window.innerWidth < 768;
    
    // Sahne için ayrılan net genişlik ve yükseklik
    const availWidth = isMobile
      ? Math.max(280, window.innerWidth - 32)
      : Math.min(840, window.innerWidth * 0.52);

    // Üst başlık (~52px), kağıt araç çubuğu (~42px), alt bant (~36px), alt menü (~68px)
    const availHeight = Math.max(320, window.innerHeight - 200);

    // ThermalTemplateRenderer içerisindeki kanonik piksel genişliği
    const canonicalWidthPx =
      targetWidth === 57
        ? 384
        : targetWidth === 80
        ? 576
        : targetWidth >= 100
        ? 800
        : Math.max(280, Math.round(((targetWidth / 57) * 384) / 8) * 8);

    // Tahmini şablon dikey oranı
    const estHeightPx = targetHeight ? (targetHeight / targetWidth) * canonicalWidthPx : canonicalWidthPx * 1.15;

    const scaleW = availWidth / canonicalWidthPx;
    const scaleH = availHeight / estHeightPx;
    
    // Ekrana tam ve belirgin şekilde sığması için cömert %96 doluluk katsayısı
    const fit = Math.min(scaleW, scaleH) * 0.96;
    return Math.max(0.45, Math.min(2.5, parseFloat(fit.toFixed(2))));
  };

  // Şablon açıldığında durumu senkronize et
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
      setActiveTab('preview');
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

  // Form Alanları Paneli
  const renderFieldsTab = () => (
    <div className="space-y-4 max-w-xl mx-auto w-full">
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

  // Minimalist ve Sadeleştirilmiş Ölçü Paneli (Gereksiz detay ve kaydırma olmadan)
  const renderDimensionsTab = () => (
    <div className="space-y-4 max-w-lg mx-auto w-full">
      {/* 1. Kağıt Genişliği */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Kağıt Genişliği (En)
          </label>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {effectiveWidth} mm
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { width: 57, label: '57 mm', desc: 'Standart' },
            { width: 80, label: '80 mm', desc: 'Geniş' },
            { width: 100, label: '100 mm', desc: 'Kargo 10x15' },
            { width: 150, label: '150 mm', desc: 'Endüstriyel' }
          ].map((item) => {
            const isSelected = !isCustomWidth && selectedWidthMm === item.width;
            return (
              <button
                key={item.width}
                type="button"
                onClick={() => {
                  setIsCustomWidth(false);
                  setSelectedWidthMm(item.width);
                  setCustomWidthMm(item.width);
                  setZoomScale(calculateAutoFitScale(item.width, effectiveHeight));
                }}
                className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Özel Genişlik Girişi */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mt-2">
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Özel Genişlik:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="30"
              max="200"
              value={customWidthMm}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 57;
                setCustomWidthMm(val);
                setIsCustomWidth(true);
                setZoomScale(calculateAutoFitScale(val, effectiveHeight));
              }}
              className="w-16 px-2 py-1 text-xs text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-xs font-mono text-slate-400">mm</span>
          </div>
        </div>
      </div>

      {/* 2. Kağıt Uzunluğu (Boy) */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Uzunluk / Boyut
          </label>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {heightMode === 'auto' ? 'Otomatik Rulo' : `${fixedHeightMm} mm`}
          </span>
        </div>

        {/* Rulo vs Sabit Boyut Segmented Control */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              setHeightMode('auto');
              setZoomScale(calculateAutoFitScale(effectiveWidth, undefined));
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              heightMode === 'auto'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Otomatik Rulo
          </button>
          <button
            type="button"
            onClick={() => {
              setHeightMode('fixed');
              setZoomScale(calculateAutoFitScale(effectiveWidth, fixedHeightMm));
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              heightMode === 'fixed'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sabit Boyut
          </button>
        </div>

        {/* Sabit Boy Seçiliyse Kompakt Presetler */}
        {heightMode === 'fixed' && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-in fade-in duration-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sabit Yükseklik:</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={fixedHeightMm}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 50;
                    setFixedHeightMm(val);
                    setZoomScale(calculateAutoFitScale(effectiveWidth, val));
                  }}
                  className="w-16 px-2 py-1 text-xs text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-xs font-mono text-slate-400">mm</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[30, 40, 50, 75, 100, 150].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => {
                    setFixedHeightMm(h);
                    setZoomScale(calculateAutoFitScale(effectiveWidth, h));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    fixedHeightMm === h
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {h} mm
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Ayarlar Paneli (Kopya Sayısı ve Özel Kayıt)
  const renderAdvancedTab = () => (
    <div className="space-y-4 max-w-lg mx-auto w-full">
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
          Yazdırırken tarayıcının veya sistemin yazdırma penceresinde kenar boşluklarını (Margins) <strong>&quot;Yok / None&quot;</strong> olarak seçiniz.
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

  // Canlı Önizleme Sahnesi: Tam ekran fit sığdırma ve ferah görüntüleme
  const renderPreviewStage = () => (
    <div className="flex-1 bg-slate-100/80 dark:bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-between overflow-hidden relative w-full h-full pb-20">
      {/* Üst Kağıt & Büyütme Araç Çubuğu */}
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex items-center justify-between mb-2 text-xs flex-wrap gap-1 shrink-0">
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
          <span className="font-mono font-bold text-[10px] w-8 text-center text-slate-700 dark:text-slate-300">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            title="Yakınlaştır"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Merkeze Oturan Termal Etiket Sahnesi */}
      <div className="flex-1 flex items-center justify-center p-2 w-full overflow-hidden min-h-0">
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

      {/* Alt Bilgi Bandı */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800/90 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between mt-2 shrink-0">
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
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col h-full w-full overflow-hidden select-none animate-in fade-in duration-150">
      
      {/* 1. Üst Başlık Çubuğu: Geri Butonu, Başlık (En fazla 2 satır, 57mm kalktı), Sağda Tek Ana Yazdır */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0 transition-colors"
            title="Geri Dön"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center font-bold shrink-0">
            <Printer size={16} />
          </div>

          {/* İsim Kısmı: En fazla 2 satır, tek satıra sığarsa tek satır, 57mm yazısı kaldırıldı */}
          <div className="min-w-0 flex-1 pr-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm md:text-base leading-snug line-clamp-2 break-words">
              {template.title}
            </h2>
          </div>
        </div>

        {/* Sağ Üst Aksiyonlar: Favori, PNG İndir, TEK ANA YAZDIR BUTONU */}
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

          {/* Tek Ana Yazdır Butonu */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Yazdır</span>
          </button>
        </div>
      </div>

      {/* 2. Ana İçerik Alanı: Mobilde tam ekran sekme değişimi, Masaüstünde çift kolon canlı düzenleme */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* MOBİL İÇERİK: Seçili alt menü sekmesini tam ekran ferah gösterir */}
        <div className="flex-1 flex flex-col md:hidden overflow-hidden">
          {activeTab === 'preview' && renderPreviewStage()}
          {activeTab === 'fields' && (
            <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 pb-24">
              {renderFieldsTab()}
            </div>
          )}
          {activeTab === 'dimensions' && (
            <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 pb-24">
              {renderDimensionsTab()}
            </div>
          )}
          {activeTab === 'advanced' && (
            <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 pb-24">
              {renderAdvancedTab()}
            </div>
          )}
        </div>

        {/* MASAÜSTÜ İÇERİK: Önizleme sekmesinde tam sahne, Alanlar/Ölçü/Ayarlar sekmesinde canlı sol önizleme + sağ form */}
        <div className="hidden md:flex flex-1 flex-row overflow-hidden w-full">
          {activeTab === 'preview' ? (
            <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
              {renderPreviewStage()}
            </div>
          ) : (
            <>
              {/* Sol: Canlı Önizleme Sahnesi */}
              <div className="flex-1 border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                {renderPreviewStage()}
              </div>

              {/* Sağ: Aktif Sekme Formu */}
              <div className="w-[420px] lg:w-[460px] bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden p-5 overflow-y-auto pb-24">
                {activeTab === 'fields' && renderFieldsTab()}
                {activeTab === 'dimensions' && renderDimensionsTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. ALT MENÜ: Diğer sayfalardaki minimalist yuvarlak floating alt menü */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <Eye size={15} />
          <span>Önizleme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'fields'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <Edit3 size={15} />
          <span>Alanlar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dimensions')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'dimensions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <Layers size={15} />
          <span>Ölçü</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'advanced'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
        >
          <Settings2 size={15} />
          <span>Ayarlar</span>
        </button>
      </div>

      {/* Yazdırma ve Dışa Aktarma İçin Gizli Yüksek Çözünürlüklü Şablon */}
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
