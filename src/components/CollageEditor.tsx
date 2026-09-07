import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import {
  Type,
  Image as ImageIcon,
  FileText,
  Trash2,
  PrinterCheck,
  Bold,
  Italic,
  Underline,
  RotateCw,
  Lock,
  Unlock,
  Plus,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  EyeOff,
  Copy,
  FlipHorizontal,
  Move,
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Sparkles, Loader2, Check } from 'lucide-react';

import { Bookmark } from 'lucide-react';
import { historyStorage } from '../lib/history-storage';
import { calculateLabelDimensions } from '../lib/dimension-utils';
import { RulerDimensionBadge } from './RulerDimensionBadge';

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
}

interface CollageEditorProps {
  pageWidth: number;
  onPreview: (dataUrl: string) => void;
  activeDraft?: { id: string; title: string; category: string; payload?: any } | null;
  onClearActiveDraft?: () => void;
  onWidthChange?: (newWidth: number) => void;
  onBack?: () => void;
}

interface LayerItem {
  id: string;
  name: string;
  type: 'text' | 'image' | 'pdf';
  visible: boolean;
  locked: boolean;
  fabricObj: fabric.Object;
}

const FONT_LIST = ['Outfit', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Impact'];

export const CollageEditor: React.FC<CollageEditorProps> = ({ 
  pageWidth, 
  onPreview,
  activeDraft,
  onClearActiveDraft,
  onWidthChange,
  onBack
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [localWidth, setLocalWidth] = useState<number>(pageWidth);
  const [canvasHeight, setCanvasHeight] = useState<number>(600);
  const [showCanvasSizePanel, setShowCanvasSizePanel] = useState<boolean>(false);

  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<LayerItem | null>(null);
  const [activeTab, setActiveTab] = useState<'layers' | 'props'>('layers');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  // Sync with prop when pageWidth changes from outside
  useEffect(() => {
    setLocalWidth(pageWidth);
  }, [pageWidth]);

  const handleWidthChange = (w: number) => {
    const validW = Math.max(80, Math.min(2400, w));
    setLocalWidth(validW);
    if (onWidthChange) {
      onWidthChange(validW);
    }
  };

  // Text properties panel
  const [textValue, setTextValue] = useState('');
  const [textSize, setTextSize] = useState(32);
  const [textFont, setTextFont] = useState('Outfit');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showFloatingTextBar, setShowFloatingTextBar] = useState<boolean>(true);

  // Object size controls
  const [objW, setObjW] = useState(0);
  const [objH, setObjH] = useState(0);
  const [objX, setObjX] = useState(0);
  const [objY, setObjY] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [keepAspect, setKeepAspect] = useState(true);

  const layerCountRef = useRef(0);
  const layersRef = useRef<LayerItem[]>([]);
  layersRef.current = layers;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(360);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const fitScale = Math.min(1, Math.max(0.2, (containerWidth - 12) / localWidth));

  useEffect(() => {
    if (!canvasRef.current) return;
    const fc = new fabric.Canvas(canvasRef.current, {
      width: localWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    });

    fc.on('selection:created', (e) => updateSelectedLayer(fc, e.selected?.[0]));
    fc.on('selection:updated', (e) => updateSelectedLayer(fc, e.selected?.[0]));
    fc.on('selection:cleared', () => { 
      setSelectedLayer(null); 
      setShowFloatingTextBar(false);
    });
    fc.on('object:modified', (e) => syncObjProps(e.target));
    fc.on('text:changed', (e) => {
      if (e.target && (e.target as any).type === 'i-text') {
        setTextValue((e.target as fabric.IText).text || '');
      }
    });

    setCanvas(fc);
    return () => { fc.dispose(); };
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.setWidth(localWidth);
      canvas.setHeight(canvasHeight);
      canvas.renderAll();
    }
  }, [localWidth, canvasHeight, canvas]);

  const updateSelectedLayer = (fc: fabric.Canvas, obj?: fabric.Object) => {
    if (!obj) { 
      setSelectedLayer(null); 
      setShowFloatingTextBar(false);
      return; 
    }
    const found = layersRef.current.find(l => l.fabricObj === obj);
    if (found) {
      setSelectedLayer(found);
      setActiveTab('props');
      syncObjProps(obj);
      if (found.type === 'text' || obj.type === 'i-text') {
        setShowFloatingTextBar(true);
        const t = obj as fabric.IText;
        setTextValue(t.text || '');
        setTextSize(t.fontSize || 32);
        setTextFont(t.fontFamily || 'Outfit');
        setTextAlign((t.textAlign as any) || 'center');
        setIsBold(t.fontWeight === 'bold');
        setIsItalic(t.fontStyle === 'italic');
        setIsUnderline(t.underline || false);
      }
    } else if (obj.type === 'i-text') {
      setShowFloatingTextBar(true);
      const t = obj as fabric.IText;
      setTextValue(t.text || '');
      setTextSize(t.fontSize || 32);
      setTextFont(t.fontFamily || 'Outfit');
      setTextAlign((t.textAlign as any) || 'center');
      setIsBold(t.fontWeight === 'bold');
      setIsItalic(t.fontStyle === 'italic');
      setIsUnderline(t.underline || false);
    }
  };

  const syncObjProps = (obj?: fabric.Object) => {
    if (!obj) return;
    setObjW(Math.round(obj.getScaledWidth()));
    setObjH(Math.round(obj.getScaledHeight()));
    setObjX(Math.round(obj.left || 0));
    setObjY(Math.round(obj.top || 0));
    setIsLocked(!!(obj as any).lockMovementX);
  };

  const addLayer = (fabricObj: fabric.Object, name: string, type: 'text' | 'image' | 'pdf') => {
    if (!canvas) return;
    layerCountRef.current++;
    const layer: LayerItem = {
      id: `${type}-${layerCountRef.current}`,
      name: `${name} ${layerCountRef.current}`,
      type,
      visible: true,
      locked: false,
      fabricObj,
    };
    canvas.add(fabricObj);
    canvas.setActiveObject(fabricObj);
    canvas.renderAll();
    setLayers(prev => {
      const updated = [...prev, layer];
      layersRef.current = updated;
      return updated;
    });
    setSelectedLayer(layer);
    setActiveTab('props');
    if (type === 'text') {
      setShowFloatingTextBar(true);
      const t = fabricObj as fabric.IText;
      setTextValue(t.text || '');
      setTextSize(t.fontSize || 32);
      setTextFont(t.fontFamily || 'Outfit');
      setTextAlign((t.textAlign as any) || 'center');
      setIsBold(t.fontWeight === 'bold');
      setIsItalic(t.fontStyle === 'italic');
      setIsUnderline(t.underline || false);
    }
  };

  const addText = () => {
    const t = new fabric.IText('Yeni Metin', {
      left: 20, top: 40,
      fontFamily: 'Outfit',
      fill: '#000000',
      fontSize: 32,
      textAlign: 'center',
      width: localWidth - 40,
    });
    addLayer(t, 'Metin', 'text');
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      fabric.Image.fromURL(dataUrl, (img) => {
        if (img.width && img.width > localWidth) img.scaleToWidth(localWidth - 20);
        img.set({ left: 10, top: 10 });
        addLayer(img, 'Görsel', 'image');
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ 
        data: arrayBuffer
      });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const vp = page.getViewport({ scale: 2 });
      const tmp = document.createElement('canvas');
      const ctx = tmp.getContext('2d')!;
      tmp.width = vp.width; tmp.height = vp.height;
      await (page as any).render({ canvasContext: ctx, viewport: vp }).promise;
      fabric.Image.fromURL(tmp.toDataURL(), (img) => {
        if (img.width && img.width > localWidth) img.scaleToWidth(localWidth - 20);
        img.set({ left: 10, top: 10 });
        addLayer(img, 'PDF', 'pdf');
      });
    } catch (err) { alert('PDF yüklenemedi: ' + err); }
    e.target.value = '';
  };

  const applyTextProp = (key: string, value: any) => {
    if (!canvas || !selectedLayer) return;
    const obj = selectedLayer.fabricObj as fabric.IText;
    if (obj.type !== 'i-text') return;
    obj.set(key as any, value);
    canvas.renderAll();
  };

  const applyObjSize = (w: number, h: number) => {
    if (!canvas || !selectedLayer) return;
    const obj = selectedLayer.fabricObj;
    const curW = obj.getScaledWidth();
    const curH = obj.getScaledHeight();
    const scaleX = (obj.scaleX || 1) * (w / curW);
    const scaleY = keepAspect ? (obj.scaleY || 1) * (w / curW) : (obj.scaleY || 1) * (h / curH);
    obj.set({ scaleX, scaleY });
    canvas.renderAll();
    syncObjProps(obj);
  };

  const applyObjPos = (x: number, y: number) => {
    if (!canvas || !selectedLayer) return;
    selectedLayer.fabricObj.set({ left: x, top: y });
    canvas.renderAll();
  };

  const deleteLayer = (layer: LayerItem) => {
    if (!canvas) return;
    canvas.remove(layer.fabricObj);
    canvas.renderAll();
    setLayers(prev => {
      const updated = prev.filter(l => l.id !== layer.id);
      layersRef.current = updated;
      return updated;
    });
    if (selectedLayer?.id === layer.id) {
      setSelectedLayer(null);
      setShowFloatingTextBar(false);
    }
  };

  const toggleVisibility = (layer: LayerItem) => {
    layer.fabricObj.set('visible', !layer.fabricObj.visible);
    canvas?.renderAll();
    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l));
  };

  const toggleLayerLock = (layer: LayerItem) => {
    const locked = !layer.locked;
    layer.fabricObj.set({
      lockMovementX: locked, lockMovementY: locked,
      lockScalingX: locked, lockScalingY: locked,
      lockRotation: locked,
      selectable: !locked,
    });
    canvas?.renderAll();
    setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, locked } : l));
    if (selectedLayer?.id === layer.id) setIsLocked(locked);
  };

  const bringForward = (layer: LayerItem) => {
    canvas?.bringForward(layer.fabricObj);
    canvas?.renderAll();
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === layer.id);
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const sendBackward = (layer: LayerItem) => {
    canvas?.sendBackwards(layer.fabricObj);
    canvas?.renderAll();
    setLayers(prev => {
      const idx = prev.findIndex(l => l.id === layer.id);
      if (idx <= 0) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      return arr;
    });
  };

  const rotateObj = (layer: LayerItem) => {
    layer.fabricObj.rotate(((layer.fabricObj.angle || 0) + 90) % 360);
    canvas?.renderAll();
  };

  const duplicateLayer = (layer: LayerItem) => {
    layer.fabricObj.clone((cloned: fabric.Object) => {
      cloned.set({ left: (layer.fabricObj.left || 0) + 20, top: (layer.fabricObj.top || 0) + 20 });
      addLayer(cloned, layer.name + ' (Kopya)', layer.type);
    });
  };

  const handlePreview = () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    onPreview(canvas.toDataURL({ format: 'png', quality: 1 }));
  };

  const layerTypeIcon = (type: string) => {
    if (type === 'text') return <Type size={12} />;
    if (type === 'pdf') return <FileText size={12} />;
    return <ImageIcon size={12} />;
  };

  const layerTypeBg = (type: string) => {
    if (type === 'text') return 'bg-purple-100 text-purple-600';
    if (type === 'pdf') return 'bg-red-100 text-red-600';
    return 'bg-teal-100 text-teal-600';
  };

  const handleSaveCollageDraft = async () => {
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
    const jsonState = canvas.toJSON();

    if (activeDraft && activeDraft.id) {
      const isUpdate = confirm(`"${activeDraft.title}" taslağı düzenleniyor.\n\n[Tamam] = Taslağı Güncelle\n[İptal] = Yeni Taslak Olarak Kaydet`);
      if (isUpdate) {
        await historyStorage.updateDraft(activeDraft.id, {
          title: activeDraft.title,
          category: 'collage',
          previewDataUrl: dataUrl,
          payload: {
            jsonState,
            canvasHeight,
            pageWidth: localWidth
          }
        });
        alert(`"${activeDraft.title}" taslağı güncellendi!`);
        return;
      }
    }

    const title = prompt('Taslak için bir başlık girin:', activeDraft?.title || `Kolaj Tasarımı (${new Date().toLocaleDateString('tr-TR')})`);
    if (!title || !title.trim()) return;

    await historyStorage.saveDraft({
      title: title.trim(),
      category: 'collage',
      previewDataUrl: dataUrl,
      payload: {
        jsonState,
        canvasHeight,
        pageWidth: localWidth
      }
    });
    alert(`"${title.trim()}" taslak olarak kaydedildi!`);
  };

  return (
    <div className="flex flex-col h-full space-y-2 p-1 pb-24">
      {/* Üst İşlem Çubuğu (İptal - Sol, Taslak Kaydet - Sağa Yaslı, Beyaz Buton) */}
      <div className="flex items-center justify-between w-full mb-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
        >
          <X size={14} />
          <span>İptal</span>
        </button>

        <button
          type="button"
          onClick={handleSaveCollageDraft}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
          title="Tasarımı Taslak Olarak Kaydet"
        >
          <Bookmark size={14} className="text-amber-500 fill-amber-500/20" />
          <span>Taslak Kaydet</span>
        </button>
      </div>

      {/* Active Draft Indicator Banner */}
      {activeDraft && (
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
              📌 Kolaj Taslağı: "{activeDraft.title}"
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleSaveCollageDraft}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              Taslağı Güncelle
            </button>
            {onClearActiveDraft && (
              <button
                type="button"
                onClick={onClearActiveDraft}
                className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                title="Taslak Modundan Çık"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* İptal Butonunun Altındaki Tuval Ölçüsü Alanı (Genişletilmiş: Yazı Sol Tarafta, Ölçü Sağa Yaslı) */}
      <div className="flex items-center w-full px-0.5">
        <button
          type="button"
          onClick={() => setShowCanvasSizePanel(prev => !prev)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border shadow-2xs ${
            showCanvasSizePanel
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
          title="Tuval Ölçüsünü Değiştir"
        >
          <span className={`text-[10px] uppercase tracking-wider font-bold ${showCanvasSizePanel ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>Tuval Ölçüsü:</span>
          <span className={`font-mono font-bold ${showCanvasSizePanel ? 'text-white' : 'text-teal-700 dark:text-teal-400'}`}>
            {(localWidth / 80).toFixed(1).replace(/\.0$/, '')} cm × {(canvasHeight / 80).toFixed(1).replace(/\.0$/, '')} cm
          </span>
        </button>
      </div>

      {/* Tuval Ölçüsü Ayarlama Paneli (cm cinsinden - Açılır / Kapanır - Tema Uyumlu) */}
      <AnimatePresence>
        {showCanvasSizePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-900 dark:text-white p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-2.5 text-xs overflow-hidden mb-1"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tuval Ölçüsü Ayarla (cm)</span>
              <button
                type="button"
                onClick={() => setShowCanvasSizePanel(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Genişlik (En) - cm */}
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  <span>Genişlik (En)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold">{(localWidth / 80).toFixed(1).replace(/\.0$/, '')} cm</span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleWidthChange(Math.max(80, localWidth - 40))}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                    title="-0.5 cm"
                  >
                    <Minus size={12} />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1 font-mono">
                    <input
                      type="number"
                      step="0.1"
                      value={(localWidth / 80).toFixed(1).replace(/\.0$/, '')}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 1;
                        handleWidthChange(Math.max(80, Math.round(cm * 80)));
                      }}
                      className="w-14 text-center bg-transparent text-xs font-bold text-teal-700 dark:text-teal-400 focus:outline-none border-b border-teal-500/50"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">cm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWidthChange(localWidth + 40)}
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
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold">{(canvasHeight / 80).toFixed(1).replace(/\.0$/, '')} cm</span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCanvasHeight(h => Math.max(40, h - 40))}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                    title="-0.5 cm"
                  >
                    <Minus size={12} />
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1 font-mono">
                    <input
                      type="number"
                      step="0.1"
                      value={(canvasHeight / 80).toFixed(1).replace(/\.0$/, '')}
                      onChange={(e) => {
                        const cm = parseFloat(e.target.value) || 1;
                        setCanvasHeight(Math.max(40, Math.round(cm * 80)));
                      }}
                      className="w-14 text-center bg-transparent text-xs font-bold text-teal-700 dark:text-teal-400 focus:outline-none border-b border-teal-500/50"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">cm</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCanvasHeight(h => h + 40)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                    title="+0.5 cm"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Standart Hazır Genişlik Kısayolları (cm Cinsinden) */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold shrink-0">Hızlı En Seçeneği:</span>
              {[
                { label: '4.8 cm', w: 384 },
                { label: '7.2 cm', w: 576 },
                { label: '10 cm', w: 800 },
                { label: '15 cm', w: 1200 },
              ].map((preset) => (
                <button
                  key={preset.w}
                  type="button"
                  onClick={() => handleWidthChange(preset.w)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all shrink-0 cursor-pointer ${
                    localWidth === preset.w
                      ? 'bg-teal-600 text-white font-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {/* Canvas - responsive auto-scaled container */}
        <div ref={containerRef} className="w-full overflow-hidden rounded-xl">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-2.5 shadow-2xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col items-center gap-1.5">
            <div
              className="flex justify-center overflow-hidden w-full transition-all duration-150"
              style={{
                height: Math.round(canvasHeight * fitScale) + 4,
              }}
            >
              <div
                style={{
                  width: localWidth,
                  height: canvasHeight,
                  transform: `scale(${fitScale})`,
                  transformOrigin: 'top center',
                }}
              >
                <canvas ref={canvasRef} className="shadow-xs rounded-md [image-rendering:pixelated]" />
              </div>
            </div>
          </div>
        </div>

        {/* Metin Seçildiğinde Alt Menünün Yerine Açılan Hızlı Metin Düzenleme Kutucuğu (Aşağı Kaydırarak Kapatılabilir) */}
        <AnimatePresence>
          {selectedLayer && selectedLayer.type === 'text' && showFloatingTextBar && (
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.6 }}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 35 || info.velocity.y > 150) {
                  setShowFloatingTextBar(false);
                }
              }}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95vw] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-purple-500/50 dark:border-purple-500/40 shadow-2xl p-2 sm:p-2.5 space-y-1.5 text-slate-800 dark:text-slate-100 touch-none"
            >
              {/* Sürüklenebilir Tutma Çizgisi */}
              <div className="w-8 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto -mt-0.5 mb-1 cursor-grab active:cursor-grabbing shrink-0" />

              {/* Üst Satır: Hızlı Metin Düzenleme Girişi + Font Boyutu + Kapat */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={textValue}
                    onChange={(e) => {
                      setTextValue(e.target.value);
                      applyTextProp('text', e.target.value);
                    }}
                    placeholder="Metin içeriği..."
                    className="w-full h-8 px-2.5 text-[16px] sm:text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
                  />
                </div>

                {/* Font Boyutu Kontrolü */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg h-7 px-1 shrink-0 font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      const v = Math.max(8, textSize - 2);
                      setTextSize(v);
                      applyTextProp('fontSize', v);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
                    title="Fontu Küçült"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-teal-700 dark:text-teal-400 select-none">
                    {textSize}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const v = Math.min(200, textSize + 2);
                      setTextSize(v);
                      applyTextProp('fontSize', v);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white rounded cursor-pointer"
                    title="Fontu Büyüt"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Kapat Butonu */}
                <button
                  type="button"
                  onClick={() => setShowFloatingTextBar(false)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer shrink-0 transition-colors"
                  title="Düzenleme Kutusunu Gizle"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Alt Satır: Font Ailesi + B/I/U + Hizalama + Katman Aksiyonları */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                {/* Font Ailesi */}
                <div className="shrink-0 w-24 sm:w-28">
                  <Select
                    value={textFont}
                    onValueChange={(v) => {
                      if (v) {
                        setTextFont(v);
                        applyTextProp('fontFamily', v);
                      }
                    }}
                  >
                    <SelectTrigger className="h-7 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 border-0 dark:text-slate-200 px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                      {FONT_LIST.map((f) => (
                        <SelectItem key={f} value={f} className="text-xs font-medium dark:text-slate-200">
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* B, I, U */}
                <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const v = !isBold;
                      setIsBold(v);
                      applyTextProp('fontWeight', v ? 'bold' : 'normal');
                    }}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
                      isBold
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Kalın"
                  >
                    <Bold size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const v = !isItalic;
                      setIsItalic(v);
                      applyTextProp('fontStyle', v ? 'italic' : 'normal');
                    }}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
                      isItalic
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="İtalik"
                  >
                    <Italic size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const v = !isUnderline;
                      setIsUnderline(v);
                      applyTextProp('underline', v);
                    }}
                    className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
                      isUnderline
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Altı Çizili"
                  >
                    <Underline size={11} />
                  </button>
                </div>

                {/* Hizalama */}
                <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg shrink-0">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => {
                        setTextAlign(align);
                        applyTextProp('textAlign', align);
                      }}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer ${
                        textAlign === align
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={align === 'left' ? 'Sola Hizala' : align === 'center' ? 'Ortala' : 'Sağa Hizala'}
                    >
                      {align === 'left' ? <AlignLeft size={11} /> : align === 'center' ? <AlignCenter size={11} /> : <AlignRight size={11} />}
                    </button>
                  ))}
                </div>

                {/* Katman Aksiyonları */}
                <div className="flex items-center gap-0.5 shrink-0 pl-1 border-l border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => rotateObj(selectedLayer)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="90° Döndür"
                  >
                    <RotateCw size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateLayer(selectedLayer)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="Kopyala"
                  >
                    <Copy size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLayer(selectedLayer)}
                    className="w-6 h-6 rounded flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                    title="Metni Sil"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alt Sabit Kapsül Gezinme Menüsü (Metin düzenlenirken gizlenir, kapanınca yerine geri gelir) */}
        <AnimatePresence>
          {!(selectedLayer && selectedLayer.type === 'text' && showFloatingTextBar) && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1.5 sm:gap-2 whitespace-nowrap max-w-[95vw] overflow-x-auto no-scrollbar"
            >
              <button
                type="button"
                onClick={addText}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-95 shrink-0"
              >
                <Type size={14} />
                <span>Metin</span>
              </button>

              <div className="relative shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 shrink-0 pointer-events-none"
                >
                  <ImageIcon size={14} />
                  <span>Görsel</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={addImage}
                  title="Görsel Ekle"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 shrink-0 pointer-events-none"
                >
                  <FileText size={14} />
                  <span>PDF</span>
                </button>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={addPdf}
                  title="PDF Ekle"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Panel - compact */}
        <div className="w-full space-y-1.5 overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-0.5 gap-0.5 border border-slate-200 dark:border-slate-800">
            <button onClick={() => setActiveTab('layers')} className={`flex-1 text-[10px] font-bold h-7 rounded-md flex items-center justify-center gap-1.5 transition-all ${activeTab === 'layers' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}>
              <Layers size={12} /> Katmanlar
            </button>
            <button onClick={() => setActiveTab('props')} className={`flex-1 text-[10px] font-bold h-7 rounded-md flex items-center justify-center gap-1.5 transition-all ${activeTab === 'props' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}>
              <Move size={12} /> Özellikler
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'layers' && (
              <motion.div key="layers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <ScrollArea className="h-[110px]">
                    {layers.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-24 text-slate-300 dark:text-slate-700">
                        <Layers size={20} className="mb-1 opacity-50" />
                        <p className="text-[10px] font-bold uppercase opacity-70">Henüz katman yok</p>
                      </div>
                    )}
                    {[...layers].reverse().map((layer) => (
                      <div
                        key={layer.id}
                        onClick={() => { canvas?.setActiveObject(layer.fabricObj); canvas?.renderAll(); updateSelectedLayer(canvas!, layer.fabricObj); }}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedLayer?.id === layer.id ? 'bg-teal-50/80 dark:bg-teal-950/30 border-l-2 border-l-teal-500' : ''}`}
                      >
                        <div className={`p-1.5 rounded-md flex-shrink-0 ${layerTypeBg(layer.type)}`}>
                          {layerTypeIcon(layer.type)}
                        </div>
                        <span className={`flex-1 text-[11px] font-bold truncate transition-colors ${selectedLayer?.id === layer.id ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>{layer.name}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); toggleVisibility(layer); }} className="p-1 px-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {layer.visible ? <Eye size={12} className="text-slate-400 dark:text-slate-500" /> : <EyeOff size={12} className="text-slate-300 dark:text-slate-600" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer); }} className="p-1 px-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {layer.locked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-slate-400 dark:text-slate-500" />}
                          </button>
                          <button title="Katmanı Sil" onClick={(e) => { e.stopPropagation(); deleteLayer(layer); }} className="p-1 px-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={12} className="text-red-400 dark:text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                {selectedLayer && (
                  <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-2.5 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Katman İşlemleri</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => bringForward(selectedLayer)} className="h-8 text-[10px] rounded-lg font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" title="Öne Al">
                        <ArrowUp size={13} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendBackward(selectedLayer)} className="h-8 text-[10px] rounded-lg font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" title="Arkaya At">
                        <ArrowDown size={13} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rotateObj(selectedLayer)} className="h-8 text-[10px] rounded-lg font-bold dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" title="Döndür">
                        <RotateCw size={13} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => duplicateLayer(selectedLayer)} className="h-8 text-[10px] rounded-lg col-span-2 font-bold gap-1.5 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        <Copy size={13} /> KOPYALA
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteLayer(selectedLayer)} className="h-8 text-[10px] rounded-lg font-bold gap-1.5">
                        <Trash2 size={13} /> SİL
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'props' && selectedLayer && (
              <motion.div key="props" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-2">
                {/* Position & Size */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Konum & Boyut</span>
                    <button onClick={() => setKeepAspect(p => !p)} className={`text-[9px] font-bold px-2 py-0.5 rounded-md transition-all ${keepAspect ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                       {keepAspect ? 'ORAN KİLİTLİ' : 'ORAN SERBEST'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'X (px)', val: objX, set: (v: number) => { setObjX(v); applyObjPos(v, objY); } },
                      { label: 'Y (px)', val: objY, set: (v: number) => { setObjY(v); applyObjPos(objX, v); } },
                      { label: 'En (px)', val: objW, set: (v: number) => { setObjW(v); applyObjSize(v, objH); } },
                      { label: 'Boy (px)', val: objH, set: (v: number) => { setObjH(v); applyObjSize(objW, v); } },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="space-y-1">
                        <Label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{label}</Label>
                        <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                          <button title="Azalt" onClick={() => set(val - 1)} className="px-2 py-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"><Minus size={11} /></button>
                          <input title={label} aria-label={label} type="number" value={val} onChange={e => set(Number(e.target.value))} className="flex-1 w-0 text-center text-[11px] font-bold bg-transparent border-none focus:outline-none dark:text-white" />
                          <button title="Artır" onClick={() => set(val + 1)} className="px-2 py-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"><Plus size={11} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold text-center border-t border-slate-100 dark:border-slate-800 pt-1.5 tracking-wider">
                    {(objW / 3.78).toFixed(1)}MM × {(objH / 3.78).toFixed(1)}MM
                  </div>
                </div>

                {/* Text props */}
                {selectedLayer.type === 'text' && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Metin Özellikleri</span>
                    <textarea
                      title="Metin İçeriği"
                      aria-label="Metin Katmanı İçeriği"
                      value={textValue}
                      onChange={(e) => { setTextValue(e.target.value); applyTextProp('text', e.target.value); }}
                      className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 resize-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400 bg-slate-50 dark:bg-slate-950 dark:text-white font-medium"
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Font Boyutu</Label>
                          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 mt-1">
                            <button title="Azalt" onClick={() => { const v = Math.max(8, textSize - 1); setTextSize(v); applyTextProp('fontSize', v); }} className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"><Minus size={11} /></button>
                            <input title="Font Boyutu" aria-label="Font Boyutu" type="number" value={textSize} onChange={e => { const v = Number(e.target.value) || 32; setTextSize(v); applyTextProp('fontSize', v); }} className="flex-1 text-center text-xs font-bold bg-transparent border-none focus:outline-none dark:text-white" />
                            <button title="Artır" onClick={() => { const v = textSize + 1; setTextSize(v); applyTextProp('fontSize', v); }} className="px-2 py-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"><Plus size={11} /></button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Font Ailesi</Label>
                          <Select value={textFont} onValueChange={(v) => { if (v) { setTextFont(v); applyTextProp('fontFamily', v); } }}>
                            <SelectTrigger className="h-8 text-xs font-bold rounded-lg mt-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 dark:text-slate-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-800">{FONT_LIST.map(f => <SelectItem key={f} value={f} className="text-xs font-medium dark:text-slate-200">{f}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {[
                        { icon: <Bold size={13} />, label: 'Kalın', active: isBold, action: () => { const v = !isBold; setIsBold(v); applyTextProp('fontWeight', v ? 'bold' : 'normal'); } },
                        { icon: <Italic size={13} />, label: 'İtalik', active: isItalic, action: () => { const v = !isItalic; setIsItalic(v); applyTextProp('fontStyle', v ? 'italic' : 'normal'); } },
                        { icon: <Underline size={13} />, label: 'Altı Çizili', active: isUnderline, action: () => { const v = !isUnderline; setIsUnderline(v); applyTextProp('underline', v); } },
                      ].map(({ icon, label, active, action }) => (
                        <button key={label} onClick={action} title={label} className={`h-8 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-750'}`}>
                          {icon}
                        </button>
                      ))}
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button key={align} onClick={() => { setTextAlign(align); applyTextProp('textAlign', align); }} className={`flex-1 h-8 rounded-md flex items-center justify-center transition-all ${textAlign === align ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs' : 'text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                          {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Background removal for images */}
                {selectedLayer.type === 'image' && (
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3 space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Akıllı Görsel İşleme</span>
                    <Button 
                      onClick={async () => {
                        const img = selectedLayer.fabricObj as fabric.Image;
                        const src = img.getSrc();
                        setIsRemovingBg(true);
                        try {
                          const { removeBackground } = await import('../lib/background-removal');
                          const res = await removeBackground(src);
                          img.setSrc(res, () => {
                             canvas?.renderAll();
                             setIsRemovingBg(false);
                          });
                        } catch(e) { setIsRemovingBg(false); }
                      }} 
                      disabled={isRemovingBg}
                      className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-bold text-xs gap-2 shadow-xs transition-all active:scale-95 text-white"
                    >
                      {isRemovingBg ? <Loader2 size={15} className="animate-spin"/> : <Sparkles size={15} className="fill-white"/>}
                      {isRemovingBg ? 'YAPAY ZEKA TEMİZLİYOR...' : 'ARKAPLANI SİL'}
                    </Button>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center font-bold tracking-tight italic">AI teknolojisi ile sadece nesneyi bırakır</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'props' && !selectedLayer && (
              <motion.div key="noprops" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 text-center border-dashed">
                <div className="bg-slate-50 dark:bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border border-slate-200 dark:border-slate-800">
                  <Move size={24} className="text-slate-300 dark:text-slate-700" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider leading-relaxed">Düzenlemek için<br/>bir katman seçin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Print Button - compact */}
      <Button onClick={handlePreview} className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-black dark:hover:bg-teal-700 text-white rounded-lg h-9 text-xs font-bold shadow-xs transition-all active:scale-95 gap-2 mt-1">
        <PrinterCheck size={15} /> ÖNİZLE & YAZDIR
      </Button>
    </div>
  );
};
