import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Sparkles,
  Eraser,
  Edit3,
  RotateCcw,
  RotateCw,
  Trash2,
  Check,
  X,
  SlidersHorizontal,
  Contrast,
  Layers,
  Square
} from 'lucide-react';
import { convertToAssemblyLineArt, LineArtOptions, DEFAULT_LINE_ART_OPTIONS } from '../lib/assembly-line-art-filter';

interface LineArtTouchUpCanvasModalProps {
  rawImageDataUrl: string;
  initialOptions?: Partial<LineArtOptions>;
  onSave: (finalDataUrl: string, options: LineArtOptions) => void;
  onClose: () => void;
}

export const LineArtTouchUpCanvasModal: React.FC<LineArtTouchUpCanvasModalProps> = ({
  rawImageDataUrl,
  initialOptions,
  onSave,
  onClose
}) => {
  const [opts, setOpts] = useState<LineArtOptions>({
    ...DEFAULT_LINE_ART_OPTIONS,
    ...initialOptions
  });

  const [activeTool, setActiveTool] = useState<'eraser' | 'pen' | 'box_clear'>('eraser');
  const [brushSize, setBrushSize] = useState<number>(16);
  const [isProcessingFilter, setIsProcessingFilter] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Undo / Redo Stacks
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxStartRef = useRef<{ x: number; y: number } | null>(null);
  const [boxPreview, setBoxPreview] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Filtreyi Çalıştır ve Canvas'a Yükle
  useEffect(() => {
    let isSubscribed = true;
    const processFilter = async () => {
      setIsProcessingFilter(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = rawImageDataUrl;
        await new Promise((res) => { img.onload = res; });

        const filteredUrl = await convertToAssemblyLineArt(img, opts);
        if (!isSubscribed) return;

        const filteredImg = new Image();
        filteredImg.src = filteredUrl;
        await new Promise((res) => { filteredImg.onload = res; });

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = filteredImg.width;
          canvas.height = filteredImg.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.fillStyle = opts.invert ? '#000000' : '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(filteredImg, 0, 0);

            // Başlangıç Undo Durumu Kaydet
            const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setHistory([initialData]);
            setHistoryIdx(0);
          }
        }
      } catch (err) {
        console.error('Line art filtre hatası:', err);
      } finally {
        if (isSubscribed) setIsProcessingFilter(false);
      }
    };

    processFilter();
    return () => {
      isSubscribed = false;
    };
  }, [rawImageDataUrl, opts.mode, opts.thickness, opts.detailLevel, opts.noiseThreshold, opts.despeckleLevel, opts.contrastBoost, opts.invert, opts.removeBg, opts.smoothEdges]);

  // Canvas Durumunu Undo Stack'e Ekle
  const saveStateToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(currentImgData);

    // Maksimum 20 undo adımı
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIdx <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIdx = historyIdx - 1;
    ctx.putImageData(history[targetIdx], 0, 0);
    setHistoryIdx(targetIdx);
  };

  const redo = () => {
    if (historyIdx >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIdx = historyIdx + 1;
    ctx.putImageData(history[targetIdx], 0, 0);
    setHistoryIdx(targetIdx);
  };

  // Canvas Koordinat Hesaplama
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY)
    };
  };

  // Çizim & Silme İşlemleri
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);

    if (activeTool === 'box_clear') {
      boxStartRef.current = coords;
      setBoxPreview({ x: coords.x, y: coords.y, w: 0, h: 0 });
    } else {
      drawOrEraseAt(coords.x, coords.y);
    }
  };

  const handleMoveDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);

    if (activeTool === 'box_clear' && boxStartRef.current) {
      const sx = boxStartRef.current.x;
      const sy = boxStartRef.current.y;
      setBoxPreview({
        x: Math.min(sx, coords.x),
        y: Math.min(sy, coords.y),
        w: Math.abs(coords.x - sx),
        h: Math.abs(coords.y - sy)
      });
    } else {
      drawOrEraseAt(coords.x, coords.y);
    }
  };

  const handleEndDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activeTool === 'box_clear' && boxPreview) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = opts.invert ? '#000000' : '#FFFFFF';
          ctx.fillRect(boxPreview.x, boxPreview.y, boxPreview.w, boxPreview.h);
        }
      }
      setBoxPreview(null);
      boxStartRef.current = null;
    }

    saveStateToHistory();
  };

  const drawOrEraseAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);

    if (activeTool === 'eraser') {
      // Silgi: Beyaz zemin ise beyaz basar, invert ise siyah basar
      ctx.fillStyle = opts.invert ? '#000000' : '#FFFFFF';
    } else if (activeTool === 'pen') {
      // Kalem: Siyah çizgi çizer
      ctx.fillStyle = opts.invert ? '#FFFFFF' : '#000000';
    }

    ctx.fill();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const finalDataUrl = canvas.toDataURL('image/png');
    onSave(finalDataUrl, opts);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-3 sm:p-5 space-y-3.5 shadow-2xl my-auto">
        {/* Modal Başlık */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-teal-600" />
              Çizgisel Kurulum Şeması & Elle Silme Düzenleyicisi
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Görseldeki parazitleri slider ile temizleyin veya dokunarak elle silin.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Araç Çubuğu (Tool Bar & Eraser Sizes) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          {/* Çizim / Silme Araçları */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTool === 'eraser'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Eraser size={14} /> Silgi (Elle Sil)
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTool === 'pen'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Edit3 size={14} /> Siyah Kalem
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('box_clear')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTool === 'box_clear'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Square size={14} /> Kutucuk Sil
            </button>
          </div>

          {/* Boyut Ayarı */}
          {activeTool !== 'box_clear' && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 mr-1">Boyut:</span>
              {[
                { sz: 8, lbl: 'İnce' },
                { sz: 16, lbl: 'Orta' },
                { sz: 32, lbl: 'Geniş' },
                { sz: 50, lbl: 'Büyük' }
              ].map(b => (
                <button
                  key={b.sz}
                  type="button"
                  onClick={() => setBrushSize(b.sz)}
                  className={`px-2 py-1 text-[10px] font-bold rounded ${
                    brushSize === b.sz
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {b.lbl}
                </button>
              ))}
            </div>
          )}

          {/* Geri Al / İleri Al */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={undo}
              disabled={historyIdx <= 0}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              title="Geri Al"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyIdx >= history.length - 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40"
              title="Yeniden Yap"
            >
              <RotateCw size={14} />
            </button>
          </div>
        </div>

        {/* Ana Çizim Alanı (Interactive Canvas) */}
        <div className="relative bg-slate-100 dark:bg-slate-950 rounded-xl p-3 flex items-center justify-center overflow-auto max-h-[360px] sm:max-h-[440px] border border-slate-200 dark:border-slate-800 touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStartDraw}
            onMouseMove={handleMoveDraw}
            onMouseUp={handleEndDraw}
            onTouchStart={handleStartDraw}
            onTouchMove={handleMoveDraw}
            onTouchEnd={handleEndDraw}
            className="cursor-crosshair bg-white shadow-md rounded border border-slate-300 max-w-full h-auto block"
          />

          {/* Box Clear Seçim Çerçevesi */}
          {boxPreview && (
            <div
              className="absolute border-2 border-dashed border-red-500 bg-red-500/20 pointer-events-none"
              style={{
                left: `${boxPreview.x}px`,
                top: `${boxPreview.y}px`,
                width: `${boxPreview.w}px`,
                height: `${boxPreview.h}px`
              }}
            />
          )}

          {isProcessingFilter && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-xs font-bold text-teal-600 gap-2">
              <Sparkles className="animate-spin" size={18} /> Çizgisel Filtre İşleniyor...
            </div>
          )}
        </div>

        {/* Filtre Modları & AI Arka Plan Temizleme */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 mr-1 flex items-center gap-1">
              <Sparkles size={13} /> Çizim Modu:
            </span>
            {[
              { id: 'ikea_cad', label: '📐 IKEA / CAD Vektör Çizim' },
              { id: 'line_art', label: '✍️ Siyah-Beyaz Kontur' },
              { id: 'high_contrast', label: '⚡ Yüksek Kontrast' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpts(prev => ({ ...prev, mode: m.id as any }))}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  opts.mode === m.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpts(prev => ({ ...prev, removeBg: !prev.removeBg }))}
              className={`px-3 py-1 text-[11px] font-black rounded-lg border transition-all flex items-center gap-1.5 ${
                opts.removeBg
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
              title="Görsel çizime çevrilmeden önce yapay zeka ile arka planı temizler"
            >
              <Layers size={13} />
              {opts.removeBg ? '✓ AI Arka Plan Temiz Açık' : '✨ AI Arka Planı Temizle'}
            </button>
          </div>
        </div>

        {/* Slider Ayarları (Threshold / Eşik & Despeckle / Parazit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                🎚️ Eşik (Threshold / Arka Plan Temizliği): {opts.noiseThreshold}
              </Label>
              <span className="text-[10px] text-slate-400">Yüksek = Temiz zemin</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={opts.noiseThreshold}
              onChange={(e) => setOpts(prev => ({ ...prev, noiseThreshold: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                ✨ Nokta Parazit Temizleyici (Despeckle): {opts.despeckleLevel}
              </Label>
              <span className="text-[10px] text-slate-400">Noktaları Otomatik Sil</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={opts.despeckleLevel}
              onChange={(e) => setOpts(prev => ({ ...prev, despeckleLevel: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>

          {/* Çizgi Kalınlığı & Detay Seviyesi */}
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">Çizgi Kalınlığı:</span>
              {[
                { id: 'thin', label: 'İnce (1px)' },
                { id: 'medium', label: 'Standart (2px)' },
                { id: 'thick', label: 'Kalın (3px)' }
              ].map(th => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setOpts(prev => ({ ...prev, thickness: th.id as any }))}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                    opts.thickness === th.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpts(prev => ({ ...prev, invert: !prev.invert }))}
              className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <Contrast size={12} /> {opts.invert ? 'Normal (Beyaz Zemin)' : 'Tersine Çevir (Siyah Zemin)'}
            </button>
          </div>
        </div>

        {/* Modal Alt Butonlar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} className="text-xs font-bold h-9">
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessingFilter}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black h-9 px-5 shadow-sm"
          >
            <Check size={15} className="mr-1.5" /> Düzeltilmiş Çizimi Kılavuza Aktar
          </Button>
        </div>
      </div>
    </div>
  );
};
