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
  Share2,
  Heart
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
  const [zoomScale, setZoomScale] = useState<number>(template?.recommendedWidthMm && template.recommendedWidthMm >= 100 ? 0.85 : 1.05);
  const [copies, setCopies] = useState<number>(1);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>(template ? `${template.title} (Özelleştirilmiş)` : '');
  
  // Mobile / Desktop active tabs
  const [activeTab, setActiveTab] = useState<'preview' | 'fields' | 'dimensions' | 'advanced'>('fields');
  // For mobile quick tab toggle
  const [mobileView, setMobileView] = useState<'preview' | 'fields' | 'dimensions' | 'advanced'>('preview');

  const previewRef = useRef<HTMLDivElement | null>(null);
  const exportCaptureRef = useRef<HTMLDivElement | null>(null);

  // Synchronize state faithfully when template opens
  useEffect(() => {
    if (template && isOpen) {
      setFormData({ ...template.defaultData });
      const targetWidth = initialWidthMm || template.recommendedWidthMm || 57;
      setSelectedWidthMm(targetWidth);
      setCustomWidthMm(targetWidth);
      setIsCustomWidth(false);
      setPaperStyle(initialPaperStyle);
      
      if (template.heightMm) {
        setHeightMode('fixed');
        setFixedHeightMm(template.heightMm);
      } else {
        setHeightMode('auto');
      }

      if (targetWidth <= 57) {
        setZoomScale(1.0);
      } else if (targetWidth <= 80) {
        setZoomScale(0.75);
      } else if (targetWidth <= 100) {
        setZoomScale(0.50);
      } else {
        setZoomScale(0.38);
      }
      setCustomTitle(`${template.title} (Özelleştirilmiş)`);
      // Default to preview tab on mobile so user sees the card first, or fields if desired
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

  const effectiveWidth = isCustomWidth ? customWidthMm : selectedWidthMm;
  const effectiveHeight = heightMode === 'fixed' ? fixedHeightMm : undefined;

  // Responsive Form Fields View
  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1 border-b border-[#2A2A2A]">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
          Metin ve Barkod Düzenleme
        </span>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw size={12} /> Varsayılana Dön
        </button>
      </div>

      {template.fields.map((field) => {
        const value = formData[field.key] ?? field.defaultValue;

        return (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              {field.label}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={value || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            )}

            {field.type === 'barcode' && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder="Örn: 8690123456789"
                  className="w-full px-3 py-2.5 sm:py-2 text-xs rounded-xl border border-blue-500/40 bg-blue-950/20 text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
                <p className="text-[10px] text-gray-500">Değer değiştiğinde barkod anında güncellenir.</p>
              </div>
            )}

            {field.type === 'qrcode' && (
              <div className="space-y-1">
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 sm:py-2 text-xs rounded-xl border border-indigo-500/40 bg-indigo-950/20 text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-gray-500">Canlı QR Kod bağlantı URL veya metni.</p>
              </div>
            )}

            {field.type === 'textarea' && (
              <textarea
                rows={3}
                value={value || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono leading-relaxed"
              />
            )}

            {field.type === 'select' && (
              <select
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#222] text-white">
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
                  className="w-4 h-4 rounded bg-[#222] border-[#2A2A2A] text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-300 select-none">Etikette bu sembolleri göster</span>
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
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Standart Ölçü Şablonları</span>
          <span className="text-[10px] text-blue-400 font-normal">Hızlı Seçim</span>
        </h3>
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          Şablon seçilen genişlik ve yüksekliğe otomatik uyarlanır.
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
                }}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                    : 'border-[#2A2A2A] bg-[#222] hover:border-[#3A3A3A] text-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs">{dim.name}</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#181818] text-gray-400'
                  }`}>
                    {dim.badge}
                  </span>
                </div>
                <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {dim.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Width Slider */}
      <div className="p-3.5 bg-[#222] rounded-2xl border border-[#2A2A2A] space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <Sliders size={14} className="text-blue-400" />
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
              className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-black border border-[#333] rounded text-white"
            />
            <span className="font-mono text-xs text-gray-400">mm</span>
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
          className="w-full accent-blue-600 cursor-pointer"
        />

        <div className="flex items-center gap-1.5">
          {[57, 80, 100, 150].map((w) => (
            <button
              key={w}
              onClick={() => {
                setCustomWidthMm(w);
                setSelectedWidthMm(w);
                setIsCustomWidth(false);
              }}
              className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                effectiveWidth === w
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#181818] text-gray-400 border-[#2A2A2A] hover:text-white'
              }`}
            >
              {w} mm
            </button>
          ))}
        </div>
      </div>

      {/* Height / Uzunluk Kontrolü */}
      <div className="p-3.5 bg-[#222] rounded-2xl border border-[#2A2A2A] space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
            <Layers size={14} className="text-blue-400" />
            Uzunluk & Boyut Davranışı
          </label>
          <span className="text-[10px] text-gray-400 font-mono">
            {heightMode === 'auto' ? 'Kompakt Rulo' : `${fixedHeightMm} mm`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setHeightMode('auto')}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              heightMode === 'auto'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:bg-[#252525]'
            }`}
          >
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Minimize2 size={13} />
              Otomatik Kompakt
            </span>
            <span className="text-[9px] opacity-80 font-normal">Boşluksuz</span>
          </button>

          <button
            onClick={() => setHeightMode('fixed')}
            className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              heightMode === 'fixed'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:bg-[#252525]'
            }`}
          >
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Maximize2 size={13} />
              Manuel Sabit Boy
            </span>
            <span className="text-[9px] opacity-80 font-normal">{fixedHeightMm} mm</span>
          </button>
        </div>

        {heightMode === 'fixed' && (
          <div className="pt-2 space-y-2.5 border-t border-[#2A2A2A]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium">Sabit Uzunluk:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="20"
                  max="250"
                  value={fixedHeightMm}
                  onChange={(e) => setFixedHeightMm(parseInt(e.target.value, 10) || 50)}
                  className="w-14 px-1.5 py-0.5 text-xs text-center font-mono font-bold bg-black border border-[#333] rounded text-white"
                />
                <span className="font-mono text-xs text-gray-400">mm</span>
              </div>
            </div>

            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={fixedHeightMm}
              onChange={(e) => setFixedHeightMm(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex items-center gap-1">
              {[30, 50, 75, 100, 150, 200].map((h) => (
                <button
                  key={h}
                  onClick={() => setFixedHeightMm(h)}
                  className={`flex-1 py-1 rounded-md text-[9px] font-mono font-bold border transition-colors cursor-pointer ${
                    fixedHeightMm === h
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-[#181818] text-gray-400 border-[#2A2A2A] hover:text-white'
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
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide mb-2">
          Baskı Ayarları & Adet
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 font-medium">Kopya Sayısı:</label>
          <div className="flex items-center border border-[#2A2A2A] rounded-xl overflow-hidden bg-[#222]">
            <button
              onClick={() => setCopies((c) => Math.max(1, c - 1))}
              className="px-3.5 py-2 text-gray-300 hover:bg-[#333] font-bold cursor-pointer text-sm"
            >
              -
            </button>
            <span className="px-4 py-2 text-xs font-mono font-bold text-white">{copies}</span>
            <button
              onClick={() => setCopies((c) => c + 1)}
              className="px-3.5 py-2 text-gray-300 hover:bg-[#333] font-bold cursor-pointer text-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="p-3.5 bg-blue-950/30 border border-blue-800/40 rounded-2xl text-xs space-y-1.5 text-blue-200">
        <div className="font-bold flex items-center gap-1.5 text-blue-400">
          <Sparkles size={14} />
          Termal Yazıcı Baskı İpucu:
        </div>
        <p className="leading-relaxed text-[11px] opacity-90">
          Yazdır butonuna bastığınızda tarayıcınızın Yazdırma penceresinde kağıt boyutunu <strong>{effectiveWidth}mm ({effectiveHeight ? `${effectiveHeight}mm` : 'Rulo'})</strong> olarak seçip kenar boşluklarını (Margins) <strong>"Yok / None"</strong> olarak ayarlayınız.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-300">Özel Şablon Adı</label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-[#2A2A2A] bg-[#222] text-white font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="pt-2">
        <button
          onClick={handleSaveCustom}
          className="w-full py-2.5 rounded-xl bg-[#252525] hover:bg-[#333] border border-[#2A2A2A] text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {isSavedNotice ? <Check size={15} className="text-emerald-400" /> : <Save size={15} />}
          {isSavedNotice ? 'Koleksiyona Kaydedildi!' : 'Bu Şablonu Özel Olarak Kaydet'}
        </button>
      </div>
    </div>
  );

  // Live Stage Component (used for both desktop and mobile preview tab)
  const renderPreviewStage = () => (
    <div className="flex-1 bg-[#101010] p-2.5 sm:p-4 flex flex-col items-center justify-between overflow-hidden relative w-full h-full">
      {/* Top Floating Toolbar */}
      <div className="w-full max-w-lg bg-[#1C1C1C]/90 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-2xl border border-[#2A2A2A] shadow-md flex items-center justify-between mb-2 text-xs flex-wrap gap-1.5">
        <div className="flex items-center gap-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 mr-0.5">Kağıt:</span>
          {(['standard', 'vintage', 'dither', 'invert'] as ThermalPaperStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setPaperStyle(style)}
              className={`px-2 py-0.5 sm:py-1 rounded-lg text-[9.5px] sm:text-[10px] font-bold uppercase transition-all cursor-pointer ${
                paperStyle === style
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white hover:bg-[#252525]'
              }`}
            >
              {style === 'standard' && 'Beyaz'}
              {style === 'vintage' && 'Kraft'}
              {style === 'dither' && 'Matris'}
              {style === 'invert' && 'Siyah'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 border-l border-[#2A2A2A] pl-2">
          <button
            onClick={() => setZoomScale((z) => Math.max(0.4, parseFloat((z - 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-[#252525] text-gray-400 hover:text-white cursor-pointer"
            title="Uzaklaştır"
          >
            <ZoomOut size={13} />
          </button>
          <span className="font-mono font-bold text-[9.5px] sm:text-[10px] w-8 text-center text-gray-200">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((z) => Math.min(2.0, parseFloat((z + 0.1).toFixed(2))))}
            className="p-1 rounded hover:bg-[#252525] text-gray-400 hover:text-white cursor-pointer"
            title="Yakınlaştır"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Centered Rendered Label Stage */}
      <div className="flex-1 flex items-center justify-center p-2 w-full overflow-auto max-h-full">
        <div
          ref={previewRef}
          className="transform transition-transform duration-150 origin-center drop-shadow-2xl my-auto flex items-center justify-center max-w-full"
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
      <div className="w-full max-w-md bg-[#1C1C1C]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#2A2A2A] text-center text-xs text-gray-400 flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 font-mono font-semibold text-[10px] sm:text-[11px] text-gray-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {effectiveWidth} mm {effectiveHeight ? `× ${effectiveHeight} mm` : '(Kompakt Rulo)'}
        </div>
        <div className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1 font-mono">
          <span>203 DPI ESC/POS</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 bg-black/85 backdrop-blur-sm overflow-hidden">
      
      {/* Container: Full Screen on Mobile (100dvh), Sleek Window on Desktop */}
      <div className="bg-[#181818] text-white w-full h-[100dvh] md:h-[92vh] md:max-w-6xl md:rounded-3xl shadow-2xl border-0 md:border md:border-[#2A2A2A] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header Bar (Native Mobile & Desktop App Bar) */}
        <div className="px-3 sm:px-5 py-3 sm:py-3.5 bg-[#1C1C1C] border-b border-[#2A2A2A] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl text-gray-300 hover:text-white hover:bg-[#2A2A2A] md:hidden cursor-pointer shrink-0"
              title="Geri Dön"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
              <Printer size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-bold text-white text-sm sm:text-base leading-tight py-0.5 truncate max-w-[200px] sm:max-w-sm md:max-w-md">
                  {template.title}
                </h2>
                <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 font-mono text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">
                  {effectiveWidth}mm{effectiveHeight ? `×${effectiveHeight}` : ''}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate hidden sm:block leading-normal">
                Dinamik Termal Şablon Editörü & Canlı Önizleme
              </p>
            </div>
          </div>

          {/* Top Right Desktop Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(template.id)}
                className={`p-2 rounded-xl border transition-all active:scale-125 cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                    : 'bg-[#252525] hover:bg-[#333] border-[#2A2A2A] text-gray-300 hover:text-rose-400'
                }`}
                title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              >
                <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}

            <button
              onClick={handleSaveCustom}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-[#252525] hover:bg-[#333] border border-[#2A2A2A] text-gray-200 text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSavedNotice ? <Check size={14} className="text-emerald-400" /> : <Save size={14} />}
              <span>{isSavedNotice ? 'Kaydedildi' : 'Kaydet'}</span>
            </button>

            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="hidden sm:flex px-3 py-1.5 rounded-xl bg-[#252525] hover:bg-[#333] border border-[#2A2A2A] text-gray-200 text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>{isExporting ? '...' : 'PNG'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Termal Yazdır</span>
              <span className="sm:hidden">Yazdır</span>
            </button>

            <button
              onClick={onClose}
              className="hidden md:block p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-[#252525] transition-colors ml-1 cursor-pointer"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Segmented Control (iOS/Android Native Style Pill Bar) */}
        <div className="flex md:hidden bg-[#161616] p-1.5 border-b border-[#2A2A2A] gap-1 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#202020]'
            }`}
          >
            <Eye size={13} />
            <span>Önizleme</span>
          </button>

          <button
            onClick={() => setMobileView('fields')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'fields'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#202020]'
            }`}
          >
            <Edit3 size={13} />
            <span>Alanlar</span>
          </button>

          <button
            onClick={() => setMobileView('dimensions')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'dimensions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#202020]'
            }`}
          >
            <Layers size={13} />
            <span>Ölçü</span>
          </button>

          <button
            onClick={() => setMobileView('advanced')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              mobileView === 'advanced'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-[#202020]'
            }`}
          >
            <Settings2 size={13} />
            <span>Baskı</span>
          </button>
        </div>

        {/* Modal Main Area: Responsive Layout (Mobile: Tab Based, Desktop: Split Screen) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* MOBILE CONTENT CONTAINER */}
          <div className="flex-1 flex flex-col md:hidden overflow-hidden">
            {mobileView === 'preview' && renderPreviewStage()}
            {mobileView === 'fields' && (
              <div className="flex-1 p-4 overflow-y-auto bg-[#181818] pb-24">
                {renderFieldsTab()}
              </div>
            )}
            {mobileView === 'dimensions' && (
              <div className="flex-1 p-4 overflow-y-auto bg-[#181818] pb-24">
                {renderDimensionsTab()}
              </div>
            )}
            {mobileView === 'advanced' && (
              <div className="flex-1 p-4 overflow-y-auto bg-[#181818] pb-24">
                {renderAdvancedTab()}
              </div>
            )}
          </div>

          {/* DESKTOP CONTENT CONTAINER: Left Stage + Right Bento Form */}
          <div className="hidden md:flex flex-1 flex-row overflow-hidden w-full">
            {/* LEFT: Live Stage */}
            <div className="flex-1 border-r border-[#2A2A2A] overflow-hidden flex flex-col">
              {renderPreviewStage()}
            </div>

            {/* RIGHT: Bento Settings Panel */}
            <div className="w-[420px] lg:w-[460px] bg-[#181818] flex flex-col h-full overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b border-[#2A2A2A] px-4 pt-3 bg-[#1A1A1A]">
                <button
                  onClick={() => setActiveTab('fields')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'fields'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sliders size={14} />
                  Alanlar & Metinler
                </button>

                <button
                  onClick={() => setActiveTab('dimensions')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'dimensions'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Layers size={14} />
                  Boyut & Rulo
                </button>

                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'advanced'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Printer size={14} />
                  Baskı Ayarı
                </button>
              </div>

              {/* Tab Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {activeTab === 'fields' && renderFieldsTab()}
                {activeTab === 'dimensions' && renderDimensionsTab()}
                {activeTab === 'advanced' && renderAdvancedTab()}
              </div>

              {/* Desktop Bottom Footer Actions inside panel */}
              <div className="p-4 bg-[#1E1E1E] border-t border-[#2A2A2A] flex items-center justify-between gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Kapat
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPNG}
                    disabled={isExporting}
                    className="px-3 py-2 text-xs font-bold text-gray-300 bg-[#252525] border border-[#2A2A2A] rounded-xl hover:bg-[#333] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    PNG Kaydet
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                  >
                    <Printer size={14} />
                    Doğrudan Yazdır
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* MOBILE STICKY BOTTOM ACTION DOCK (Fixed at bottom for easy thumb reach) */}
        <div className="md:hidden bg-[#1A1A1A]/95 backdrop-blur-md border-t border-[#2A2A2A] px-3 py-2.5 flex items-center justify-between gap-2 shrink-0 z-30 pb-[calc(0.65rem+env(safe-area-inset-bottom))]">
          {mobileView === 'preview' ? (
            <button
              onClick={() => setMobileView('fields')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#252525] active:bg-[#333] border border-[#333] text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={14} className="text-blue-400" />
              <span>Alanları Düzenle</span>
            </button>
          ) : (
            <button
              onClick={() => setMobileView('preview')}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#252525] active:bg-[#333] border border-[#333] text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} className="text-emerald-400" />
              <span>Önizlemeye Dön</span>
            </button>
          )}

          <button
            onClick={handleExportPNG}
            disabled={isExporting}
            className="p-2.5 rounded-xl bg-[#252525] active:bg-[#333] border border-[#333] text-gray-200 text-xs font-bold flex items-center justify-center cursor-pointer"
            title="PNG İndir"
          >
            <Download size={16} />
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-blue-600 active:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <Printer size={15} />
            <span>Termal Yazdır</span>
          </button>
        </div>

      </div>

      {/* Persistent Offscreen Master Print Target (Ensures 1:1 crisp capture at true dot resolution without offscreen displacement) */}
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


