import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pencil, Eraser, PaintBucket, Minus, Square, Circle, Type,
  RotateCcw, RotateCw, Trash2, Upload, Printer, Download, Grid, Sparkles,
  ArrowLeft, Check, ZoomIn, ZoomOut, Maximize2,
  FlipHorizontal, FlipVertical, RefreshCw, Sliders,
  ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight,
  Layers, Palette, Eye, HelpCircle, ChevronDown, Menu, X
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { renderBitmapText } from '../lib/bitmap-fonts';
import { processImage, DitheringType } from '../lib/image-processing';

export interface PixelCanvasStudioProps {
  pageWidth?: number; // 384 or 576
  onPrintImage: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export type ToolType =
  | 'pencil'
  | 'eraser'
  | 'dither'
  | 'fill'
  | 'line'
  | 'rect'
  | 'rectOutline'
  | 'circle'
  | 'circleOutline'
  | 'text';

export type BrushSize = 1 | 2 | 3 | 4 | 6 | 8 | 12;
export type BrushShape = 'square' | 'round';

export interface CanvasPreset {
  id: string;
  name: string;
  category: 'Önerilen Kare' | 'Klasik Retro' | 'Kart & Etiket' | 'Geniş Rulo';
  width: number;
  height: number;
  desc: string;
  recommendedZoom: number;
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { id: 'sq-100', name: '100x100', category: 'Önerilen Kare', width: 100, height: 100, desc: 'Standart Kare', recommendedZoom: 450 },
  { id: 'sq-64', name: '64x64', category: 'Önerilen Kare', width: 64, height: 64, desc: 'Rozet / Avatar', recommendedZoom: 600 },
  { id: 'sq-32', name: '32x32', category: 'Klasik Retro', width: 32, height: 32, desc: 'Mini Sprite', recommendedZoom: 1000 },
  { id: 'sq-16', name: '16x16', category: 'Klasik Retro', width: 16, height: 16, desc: 'Mikro İkon', recommendedZoom: 1200 },
  { id: 'sq-48', name: '48x48', category: 'Klasik Retro', width: 48, height: 48, desc: 'Piksel Damga', recommendedZoom: 700 },
  { id: 'sq-80', name: '80x80', category: 'Önerilen Kare', width: 80, height: 80, desc: 'Orta Kare', recommendedZoom: 500 },
  { id: 'sq-128', name: '128x128', category: 'Önerilen Kare', width: 128, height: 128, desc: 'Büyük Kare', recommendedZoom: 350 },
  { id: 'rect-150-100', name: '150x100', category: 'Kart & Etiket', width: 150, height: 100, desc: 'Yatay Kart', recommendedZoom: 350 },
  { id: 'rect-100-150', name: '100x150', category: 'Kart & Etiket', width: 100, height: 150, desc: 'Dikey Kart', recommendedZoom: 350 },
  { id: 'full-384', name: '384x384', category: 'Geniş Rulo', width: 384, height: 384, desc: '58mm Termal Rulo', recommendedZoom: 125 },
  { id: 'full-576', name: '576x576', category: 'Geniş Rulo', width: 576, height: 576, desc: '80mm Tam Rulo', recommendedZoom: 100 },
];

export function PixelCanvasStudio({ pageWidth = 384, onPrintImage, onBack }: PixelCanvasStudioProps) {
  // Canvas Resolution State (Default to 32x32 as requested)
  const [canvasWidth, setCanvasWidth] = useState<number>(32);
  const [canvasHeight, setCanvasHeight] = useState<number>(32);

  // Mobile / Desktop Expandable Tools & Dimension Floating Panels
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState<boolean>(false);

  // Custom Dimension Form
  const [customW, setCustomW] = useState<string>('32');
  const [customH, setCustomH] = useState<string>('32');
  const [preserveContentOnResize, setPreserveContentOnResize] = useState<boolean>(true);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState<boolean>(false);

  // Tools & Brushes
  const [activeTool, setActiveTool] = useState<ToolType>('pencil');
  const [brushSize, setBrushSize] = useState<BrushSize>(1);
  const [brushShape, setBrushShape] = useState<BrushShape>('square');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1000); // Zoom level
  const zoomLevelRef = useRef<number>(1000);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  // Micro Typography
  const [stampText, setStampText] = useState<string>('TERMİK');
  const [fontType, setFontType] = useState<'5x7' | '7x9'>('5x7');
  const [textScale, setTextScale] = useState<number>(1);
  const [textInverted, setTextInverted] = useState<boolean>(false);

  // Hover Coordinates & Active Cursor
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  // Print Setup Modal
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printLayoutMode, setPrintLayoutMode] = useState<'auto-scale' | 'bordered' | 'native-center' | 'full-width'>('auto-scale');
  const [printTitle, setPrintTitle] = useState<string>('');

  // Image Import Modal & Live 1-Bit Preview
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importedImageSrc, setImportedImageSrc] = useState<string | null>(null);
  const [importDither, setImportDither] = useState<DitheringType>('atkinson');
  const [importInvert, setImportInvert] = useState<boolean>(false);
  const [importBrightness, setImportBrightness] = useState<number>(0);
  const [importContrast, setImportContrast] = useState<number>(0);
  const [importFitMode, setImportFitMode] = useState<'contain' | 'cover' | 'custom'>('contain');
  const [importCropZoom, setImportCropZoom] = useState<number>(1);
  const [importCropPanX, setImportCropPanX] = useState<number>(0);
  const [importCropPanY, setImportCropPanY] = useState<number>(0);
  const [importPreviewUrl, setImportPreviewUrl] = useState<string | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Canvas Refs & Buffers
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Undo / Redo Stacks (ImageData buffers)
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize or get contexts
  const getContexts = useCallback(() => {
    if (!displayCanvasRef.current) return null;
    const displayCanvas = displayCanvasRef.current;
    const displayCtx = displayCanvas.getContext('2d');

    if (!bufferCanvasRef.current) {
      bufferCanvasRef.current = document.createElement('canvas');
    }
    const bufferCanvas = bufferCanvasRef.current;
    if (bufferCanvas.width !== canvasWidth || bufferCanvas.height !== canvasHeight) {
      bufferCanvas.width = canvasWidth;
      bufferCanvas.height = canvasHeight;
      const bufCtx = bufferCanvas.getContext('2d');
      if (bufCtx) {
        bufCtx.fillStyle = '#FFFFFF';
        bufCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }
    const bufCtx = bufferCanvas.getContext('2d');

    return { displayCanvas, displayCtx, bufferCanvas, bufCtx };
  }, [canvasWidth, canvasHeight]);

  // Save current canvas state into history
  const saveHistory = useCallback(() => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const imgData = ctxs.bufCtx.getImageData(0, 0, canvasWidth, canvasHeight);

    // Slice off future redo steps
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(imgData);
    if (newHistory.length > 40) newHistory.shift(); // 40 steps undo buffer

    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [getContexts, canvasWidth, canvasHeight]);

  // Redraw clean pixel buffer to display canvas
  const renderDisplay = useCallback(() => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.displayCtx || !ctxs.bufferCanvas) return;
    const { displayCtx, bufferCanvas, displayCanvas } = ctxs;

    displayCanvas.width = canvasWidth;
    displayCanvas.height = canvasHeight;

    displayCtx.imageSmoothingEnabled = false;
    displayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    displayCtx.drawImage(bufferCanvas, 0, 0);
  }, [getContexts, canvasWidth, canvasHeight]);

  // Initial Canvas Setup or Dimension Change
  useEffect(() => {
    const ctxs = getContexts();
    if (ctxs && ctxs.bufCtx) {
      ctxs.bufCtx.fillStyle = '#FFFFFF';
      ctxs.bufCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveHistory();
      renderDisplay();
    }
  }, [canvasWidth, canvasHeight, getContexts, renderDisplay, saveHistory]);

  // Apply Dimension Change (with option to preserve existing content)
  const applyNewDimensions = (newW: number, newH: number, preserve: boolean = true, zoomPreset?: number) => {
    const safeW = Math.max(8, Math.min(1024, Math.round(newW)));
    const safeH = Math.max(8, Math.min(1536, Math.round(newH)));

    const ctxs = getContexts();
    let oldImgData: ImageData | null = null;
    const oldW = canvasWidth;
    const oldH = canvasHeight;

    if (preserve && ctxs && ctxs.bufCtx) {
      oldImgData = ctxs.bufCtx.getImageData(0, 0, oldW, oldH);
    }

    setCanvasWidth(safeW);
    setCanvasHeight(safeH);
    setCustomW(String(safeW));
    setCustomH(String(safeH));

    // Choose comfortable zoom
    if (zoomPreset) {
      setZoomLevel(zoomPreset);
    } else {
      if (safeW <= 16) setZoomLevel(1200);
      else if (safeW <= 32) setZoomLevel(1000);
      else if (safeW <= 48) setZoomLevel(800);
      else if (safeW <= 64) setZoomLevel(700);
      else if (safeW <= 100) setZoomLevel(550);
      else if (safeW <= 128) setZoomLevel(450);
      else if (safeW <= 200) setZoomLevel(300);
      else setZoomLevel(150);
    }

    setTimeout(() => {
      if (!bufferCanvasRef.current) return;
      const buf = bufferCanvasRef.current;
      buf.width = safeW;
      buf.height = safeH;
      const bCtx = buf.getContext('2d');
      if (!bCtx) return;

      bCtx.fillStyle = '#FFFFFF';
      bCtx.fillRect(0, 0, safeW, safeH);

      if (preserve && oldImgData) {
        const tempC = document.createElement('canvas');
        tempC.width = oldW;
        tempC.height = oldH;
        const tCtx = tempC.getContext('2d');
        if (tCtx) {
          tCtx.putImageData(oldImgData, 0, 0);
          bCtx.drawImage(tempC, 0, 0);
        }
      }

      historyRef.current = [];
      historyIndexRef.current = -1;
      saveHistory();
      renderDisplay();
      setIsDimensionsOpen(false);
    }, 50);
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const ctxs = getContexts();
      if (ctxs && ctxs.bufCtx) {
        ctxs.bufCtx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
        renderDisplay();
      }
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const ctxs = getContexts();
      if (ctxs && ctxs.bufCtx) {
        ctxs.bufCtx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
        renderDisplay();
      }
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    ctxs.bufCtx.fillStyle = '#FFFFFF';
    ctxs.bufCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    saveHistory();
    renderDisplay();
  };

  // Fill Canvas with Black
  const handleFillAll = () => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    ctxs.bufCtx.fillStyle = '#000000';
    ctxs.bufCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    saveHistory();
    renderDisplay();
  };

  // Transform Actions: Invert, Flip H, Flip V, Rotate 90, Shift
  const handleInvertColors = () => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const imgData = ctxs.bufCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const isBlack = imgData.data[i] < 128;
      const newVal = isBlack ? 255 : 0;
      imgData.data[i] = newVal;
      imgData.data[i + 1] = newVal;
      imgData.data[i + 2] = newVal;
    }
    ctxs.bufCtx.putImageData(imgData, 0, 0);
    saveHistory();
    renderDisplay();
  };

  const handleFlipHorizontal = () => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(ctxs.bufferCanvas, 0, 0);

    ctxs.bufCtx.save();
    ctxs.bufCtx.translate(canvasWidth, 0);
    ctxs.bufCtx.scale(-1, 1);
    ctxs.bufCtx.drawImage(tempCanvas, 0, 0);
    ctxs.bufCtx.restore();

    saveHistory();
    renderDisplay();
  };

  const handleFlipVertical = () => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(ctxs.bufferCanvas, 0, 0);

    ctxs.bufCtx.save();
    ctxs.bufCtx.translate(0, canvasHeight);
    ctxs.bufCtx.scale(1, -1);
    ctxs.bufCtx.drawImage(tempCanvas, 0, 0);
    ctxs.bufCtx.restore();

    saveHistory();
    renderDisplay();
  };

  const handleRotate90 = () => {
    // For squares or any size, rotate 90 clockwise
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(ctxs.bufferCanvas, 0, 0);

    // If width != height, swap
    if (canvasWidth !== canvasHeight) {
      const newW = canvasHeight;
      const newH = canvasWidth;
      setCanvasWidth(newW);
      setCanvasHeight(newH);
      setCustomW(String(newW));
      setCustomH(String(newH));
      ctxs.bufferCanvas.width = newW;
      ctxs.bufferCanvas.height = newH;
    }

    ctxs.bufCtx.save();
    ctxs.bufCtx.fillStyle = '#FFFFFF';
    ctxs.bufCtx.fillRect(0, 0, ctxs.bufferCanvas.width, ctxs.bufferCanvas.height);
    ctxs.bufCtx.translate(ctxs.bufferCanvas.width / 2, ctxs.bufferCanvas.height / 2);
    ctxs.bufCtx.rotate((90 * Math.PI) / 180);
    ctxs.bufCtx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    ctxs.bufCtx.restore();

    saveHistory();
    renderDisplay();
  };

  const handleShift = (dx: number, dy: number) => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const imgData = ctxs.bufCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.putImageData(imgData, 0, 0);

    ctxs.bufCtx.fillStyle = '#FFFFFF';
    ctxs.bufCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctxs.bufCtx.drawImage(tempCanvas, dx, dy);

    saveHistory();
    renderDisplay();
  };

  // Smooth animated zoom interpolation
  const animateZoom = useCallback((targetZoom: number) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    const startZoom = zoomLevelRef.current;
    if (startZoom === targetZoom) return;
    const startTime = performance.now();
    const duration = 280; // ms smooth animation

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startZoom + (targetZoom - startZoom) * ease);
      setZoomLevel(current);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setZoomLevel(targetZoom);
      }
    };
    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  // Fit to screen calculation (Maximizes canvas cleanly within viewport)
  const handleFitToScreen = useCallback((animate = true) => {
    if (!stageContainerRef.current) return;
    const { clientWidth, clientHeight } = stageContainerRef.current;
    if (clientWidth <= 0 || clientHeight <= 0) return;
    // Leave 28px padding for maximum drawing comfort
    const availableW = Math.max(120, clientWidth - 28);
    const availableH = Math.max(120, clientHeight - 28);

    const fitZoomW = (availableW / canvasWidth) * 100;
    const fitZoomH = (availableH / canvasHeight) * 100;
    const minZoom = Math.min(fitZoomW, fitZoomH);

    // Snap to nice round percentage (multiples of 10)
    const rounded = Math.max(50, Math.min(2500, Math.floor(minZoom / 10) * 10));
    if (animate) {
      animateZoom(rounded);
    } else {
      setZoomLevel(rounded);
    }
  }, [canvasWidth, canvasHeight, animateZoom]);

  // Auto-fit on initial render & dimension changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToScreen(true);
    }, 60);
    return () => clearTimeout(timer);
  }, [canvasWidth, canvasHeight, handleFitToScreen]);

  // Auto-fit on container resize (e.g. window resize / layout change)
  useEffect(() => {
    const container = stageContainerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      if (!isDrawingRef.current) {
        handleFitToScreen(false);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [handleFitToScreen]);

  // Web Mouse Wheel Zoom & Touch 2-Finger Pinch Zoom
  useEffect(() => {
    const container = stageContainerRef.current;
    if (!container) return;

    // Mouse Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomStep = e.deltaY < 0 ? 30 : -30;
      setZoomLevel((prev) => {
        return Math.max(50, Math.min(2500, prev + zoomStep));
      });
    };

    // 2-Finger Touch Pinch Zoom
    let initialPinchDist = 0;
    let initialZoom = 1000;
    let isPinching = false;

    const getTouchDist = (e: TouchEvent) => {
      if (e.touches.length < 2) return 0;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      return Math.hypot(dx, dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        isPinching = true;
        isDrawingRef.current = false;
        initialPinchDist = getTouchDist(e);
        initialZoom = zoomLevelRef.current;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching && initialPinchDist > 0) {
        e.preventDefault();
        const currentDist = getTouchDist(e);
        if (currentDist > 0) {
          const factor = currentDist / initialPinchDist;
          const newZoom = Math.max(50, Math.min(2500, Math.round((initialZoom * factor) / 10) * 10));
          setZoomLevel(newZoom);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        isPinching = false;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  // Get Precise Canvas Pixel Coordinates from Pointer
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!displayCanvasRef.current) return { x: 0, y: 0 };
    const rect = displayCanvasRef.current.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    return {
      x: Math.max(0, Math.min(canvasWidth - 1, x)),
      y: Math.max(0, Math.min(canvasHeight - 1, y))
    };
  };

  // Draw Pixel Block (Exact 1x1, 2x2, 3x3, 4x4 with Shape)
  const drawPixelBlock = (
    bufCtx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    size: number,
    shape: BrushShape,
    isDither: boolean = false
  ) => {
    const half = Math.floor(size / 2);
    const startX = x - half;
    const startY = y - half;

    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const px = startX + dx;
        const py = startY + dy;

        if (px < 0 || px >= canvasWidth || py < 0 || py >= canvasHeight) continue;

        // Shape test: Mathematical round pixel disc
        if (shape === 'round' && size >= 2) {
          const cx = (size - 1) / 2;
          const cy = (size - 1) / 2;
          const distSq = (dx - cx) ** 2 + (dy - cy) ** 2;
          const maxRadius = size === 2 ? 0.9 : size === 3 ? 1.35 : size / 2;
          if (distSq > maxRadius ** 2) continue;
        }

        // Dither test (50% checkerboard)
        if (isDither) {
          if ((px + py) % 2 !== 0) continue;
        }

        bufCtx.fillStyle = color;
        bufCtx.fillRect(px, py, 1, 1);
      }
    }
  };

  // Continuous Bresenham's Line Algorithm
  const drawLine = (
    bufCtx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    size: number,
    shape: BrushShape,
    isDither: boolean = false
  ) => {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let currX = x0;
    let currY = y0;

    while (true) {
      drawPixelBlock(bufCtx, currX, currY, color, size, shape, isDither);
      if (currX === x1 && currY === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currY += sy;
      }
    }
  };

  // 4-Way Flood Fill (Bucket)
  const floodFill = (bufCtx: CanvasRenderingContext2D, startX: number, startY: number, targetIsBlack: boolean) => {
    const imgData = bufCtx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imgData.data;

    const getIsBlack = (x: number, y: number) => {
      const idx = (y * canvasWidth + x) * 4;
      return data[idx] < 128;
    };

    const targetVal = targetIsBlack ? 1 : 0;
    const fillVal = targetIsBlack ? 0 : 1; // Flip

    if (targetVal === fillVal) return;
    const clickedIsBlack = getIsBlack(startX, startY);
    if (clickedIsBlack !== targetIsBlack) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Uint8Array(canvasWidth * canvasHeight);

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const pos = y * canvasWidth + x;
      if (visited[pos]) continue;
      visited[pos] = 1;

      if (getIsBlack(x, y) === clickedIsBlack) {
        const idx = pos * 4;
        const col = fillVal === 1 ? 0 : 255;
        data[idx] = col;
        data[idx + 1] = col;
        data[idx + 2] = col;
        data[idx + 3] = 255;

        if (x > 0) stack.push([x - 1, y]);
        if (x < canvasWidth - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < canvasHeight - 1) stack.push([x, y + 1]);
      }
    }

    bufCtx.putImageData(imgData, 0, 0);
  };

  // Stamp Bitmap Micro Text onto Canvas
  const stampMicroText = (bufCtx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!stampText.trim()) return;
    const { width, height, pixels } = renderBitmapText(stampText, textScale, fontType, textInverted);

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const val = pixels[r][c];
        const px = x + c;
        const py = y + r;
        if (px >= 0 && px < canvasWidth && py >= 0 && py < canvasHeight) {
          bufCtx.fillStyle = val === 1 ? '#000000' : '#FFFFFF';
          bufCtx.fillRect(px, py, 1, 1);
        }
      }
    }
  };

  // Shape Drawers (Compatible with both Buffer and Live Preview Display Contexts)
  const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    filled: boolean,
    size: number
  ) => {
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    if (filled) {
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    } else {
      // Outline with exact pixel thickness
      for (let t = 0; t < size; t++) {
        const curMinX = minX + t;
        const curMaxX = maxX - t;
        const curMinY = minY + t;
        const curMaxY = maxY - t;
        if (curMinX > curMaxX || curMinY > curMaxY) break;

        for (let x = curMinX; x <= curMaxX; x++) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, curMinY, 1, 1);
          ctx.fillRect(x, curMaxY, 1, 1);
        }
        for (let y = curMinY; y <= curMaxY; y++) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(curMinX, y, 1, 1);
          ctx.fillRect(curMaxX, y, 1, 1);
        }
      }
    }
  };

  const drawCircleShape = (
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    filled: boolean,
    size: number
  ) => {
    const radiusX = Math.abs(x1 - x0) / 2;
    const radiusY = Math.abs(y1 - y0) / 2;
    const centerX = Math.min(x0, x1) + radiusX;
    const centerY = Math.min(y0, y1) + radiusY;
    const rx = Math.max(0.5, radiusX);
    const ry = Math.max(0.5, radiusY);

    const minX = Math.floor(centerX - rx);
    const maxX = Math.ceil(centerX + rx);
    const minY = Math.floor(centerY - ry);
    const maxY = Math.ceil(centerY + ry);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;
        const normalizedDist = ((x + 0.5 - centerX) / rx) ** 2 + ((y + 0.5 - centerY) / ry) ** 2;

        if (filled) {
          if (normalizedDist <= 1.0) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, 1, 1);
          }
        } else {
          // Ring with thickness
          const innerRx = Math.max(0.1, rx - size);
          const innerRy = Math.max(0.1, ry - size);
          const innerNormDist = ((x + 0.5 - centerX) / innerRx) ** 2 + ((y + 0.5 - centerY) / innerRy) ** 2;
          if (normalizedDist <= 1.05 && innerNormDist >= 0.75) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  };

  // Pointer Event Handlers with Live Preview for Geometric Shapes
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const { bufCtx } = ctxs;

    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    startPosRef.current = coords;

    if (activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'dither') {
      const color = activeTool === 'eraser' ? '#FFFFFF' : '#000000';
      const isDither = activeTool === 'dither';
      drawPixelBlock(bufCtx, coords.x, coords.y, color, brushSize, brushShape, isDither);
      renderDisplay();
    } else if (activeTool === 'fill') {
      const imgData = bufCtx.getImageData(coords.x, coords.y, 1, 1);
      const isBlack = imgData.data[0] < 128;
      floodFill(bufCtx, coords.x, coords.y, isBlack);
      saveHistory();
      renderDisplay();
      isDrawingRef.current = false;
    } else if (activeTool === 'text') {
      stampMicroText(bufCtx, coords.x, coords.y);
      saveHistory();
      renderDisplay();
      isDrawingRef.current = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setHoverCoord(coords);

    if (!isDrawingRef.current || !startPosRef.current) return;
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx || !ctxs.displayCtx || !ctxs.bufferCanvas || !ctxs.displayCanvas) return;
    const { bufCtx, displayCtx, bufferCanvas, displayCanvas } = ctxs;
    const start = startPosRef.current;

    if (activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'dither') {
      const color = activeTool === 'eraser' ? '#FFFFFF' : '#000000';
      const isDither = activeTool === 'dither';
      drawLine(bufCtx, start.x, start.y, coords.x, coords.y, color, brushSize, brushShape, isDither);
      startPosRef.current = coords;
      renderDisplay();
    } else if (
      activeTool === 'line' ||
      activeTool === 'rect' ||
      activeTool === 'rectOutline' ||
      activeTool === 'circle' ||
      activeTool === 'circleOutline'
    ) {
      // Live Overlay Preview on displayCanvas (Non-destructive to buffer)
      displayCanvas.width = canvasWidth;
      displayCanvas.height = canvasHeight;
      displayCtx.imageSmoothingEnabled = false;
      displayCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      displayCtx.drawImage(bufferCanvas, 0, 0);

      if (activeTool === 'line') {
        drawLine(displayCtx, start.x, start.y, coords.x, coords.y, '#000000', brushSize, brushShape, false);
      } else if (activeTool === 'rect') {
        drawRectangle(displayCtx, start.x, start.y, coords.x, coords.y, true, brushSize);
      } else if (activeTool === 'rectOutline') {
        drawRectangle(displayCtx, start.x, start.y, coords.x, coords.y, false, brushSize);
      } else if (activeTool === 'circle') {
        drawCircleShape(displayCtx, start.x, start.y, coords.x, coords.y, true, brushSize);
      } else if (activeTool === 'circleOutline') {
        drawCircleShape(displayCtx, start.x, start.y, coords.x, coords.y, false, brushSize);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    if (!isDrawingRef.current) return;
    const ctxs = getContexts();
    if (ctxs && ctxs.bufCtx && startPosRef.current) {
      const { bufCtx } = ctxs;
      const coords = getCanvasCoords(e);
      const start = startPosRef.current;

      if (activeTool === 'line') {
        drawLine(bufCtx, start.x, start.y, coords.x, coords.y, '#000000', brushSize, brushShape, false);
      } else if (activeTool === 'rect') {
        drawRectangle(bufCtx, start.x, start.y, coords.x, coords.y, true, brushSize);
      } else if (activeTool === 'rectOutline') {
        drawRectangle(bufCtx, start.x, start.y, coords.x, coords.y, false, brushSize);
      } else if (activeTool === 'circle') {
        drawCircleShape(bufCtx, start.x, start.y, coords.x, coords.y, true, brushSize);
      } else if (activeTool === 'circleOutline') {
        drawCircleShape(bufCtx, start.x, start.y, coords.x, coords.y, false, brushSize);
      }
      renderDisplay();
      saveHistory();
    }

    isDrawingRef.current = false;
    startPosRef.current = null;
  };

  // Generate 1-Bit Pixel Preview for Image Import (Real-time live rendering)
  const generate1BitBitmap = useCallback(() => {
    if (!loadedImageRef.current) return null;
    const img = loadedImageRef.current;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = canvasWidth;
    offCanvas.height = canvasHeight;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return null;

    offCtx.fillStyle = '#FFFFFF';
    offCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    const aspect = img.width / img.height;

    if (importFitMode === 'custom') {
      const baseScale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const scale = baseScale * importCropZoom;
      const targetW = img.width * scale;
      const targetH = img.height * scale;

      const baseOffsetX = (canvasWidth - targetW) / 2;
      const baseOffsetY = (canvasHeight - targetH) / 2;

      const panX = (importCropPanX / 100) * targetW;
      const panY = (importCropPanY / 100) * targetH;

      offCtx.drawImage(img, baseOffsetX + panX, baseOffsetY + panY, targetW, targetH);
    } else {
      let targetW = canvasWidth;
      let targetH = canvasWidth / aspect;

      if (importFitMode === 'contain') {
        if (targetH > canvasHeight) {
          targetH = canvasHeight;
          targetW = canvasHeight * aspect;
        }
      } else {
        // cover
        if (targetH < canvasHeight) {
          targetH = canvasHeight;
          targetW = canvasHeight * aspect;
        }
      }

      const offsetX = (canvasWidth - targetW) / 2;
      const offsetY = (canvasHeight - targetH) / 2;
      offCtx.drawImage(img, offsetX, offsetY, targetW, targetH);
    }

    // 1-Bit Dither Processing
    const bitmap = processImage(
      offCtx,
      canvasWidth,
      canvasHeight,
      importDither,
      { brightness: importBrightness, contrast: importContrast, invert: importInvert },
      { msbFirst: true }
    );

    // Render 1-Bit image to DataURL for instant live preview
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = canvasWidth;
    previewCanvas.height = canvasHeight;
    const pCtx = previewCanvas.getContext('2d');
    if (!pCtx) return null;

    const bytesPerRow = Math.ceil(canvasWidth / 8);
    const imgData = pCtx.createImageData(canvasWidth, canvasHeight);

    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const byteIndex = y * bytesPerRow + (x >> 3);
        const bitMask = 0x80 >> (x & 7);
        const isBlack = (bitmap[byteIndex] & bitMask) !== 0;
        const pixelIdx = (y * canvasWidth + x) * 4;
        const col = isBlack ? 0 : 255;
        imgData.data[pixelIdx] = col;
        imgData.data[pixelIdx + 1] = col;
        imgData.data[pixelIdx + 2] = col;
        imgData.data[pixelIdx + 3] = 255;
      }
    }
    pCtx.putImageData(imgData, 0, 0);

    return {
      previewUrl: previewCanvas.toDataURL('image/png'),
      imgData
    };
  }, [
    canvasWidth,
    canvasHeight,
    importDither,
    importInvert,
    importBrightness,
    importContrast,
    importFitMode,
    importCropZoom,
    importCropPanX,
    importCropPanY
  ]);

  // Update Live 1-Bit Preview whenever settings change
  useEffect(() => {
    if (!importedImageSrc) {
      setImportPreviewUrl(null);
      return;
    }
    const result = generate1BitBitmap();
    if (result) {
      setImportPreviewUrl(result.previewUrl);
    }
  }, [
    importedImageSrc,
    generate1BitBitmap,
    importDither,
    importInvert,
    importBrightness,
    importContrast,
    importFitMode,
    importCropZoom,
    importCropPanX,
    importCropPanY,
    canvasWidth,
    canvasHeight
  ]);

  // Image Upload & Import Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImportedImageSrc(src);
      const img = new Image();
      img.onload = () => {
        loadedImageRef.current = img;
        // Reset pan & zoom to center
        setImportCropZoom(1);
        setImportCropPanX(0);
        setImportCropPanY(0);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const applyImportedImageToCanvas = () => {
    const result = generate1BitBitmap();
    if (!result) return;

    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufCtx) return;
    const { bufCtx } = ctxs;

    bufCtx.putImageData(result.imgData, 0, 0);
    saveHistory();
    renderDisplay();
    setShowImportModal(false);
  };

  // Build Print Image with Smart Thermal Scaling & Centering
  const buildThermalPrintImage = (mode: 'auto-scale' | 'bordered' | 'native-center' | 'full-width'): string => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufferCanvas) return '';

    const targetPaperWidth = pageWidth >= 576 ? 576 : 384;
    const outCanvas = document.createElement('canvas');

    let scale = 1;
    let finalW = canvasWidth;
    let finalH = canvasHeight;

    if (mode === 'full-width') {
      scale = targetPaperWidth / canvasWidth;
      finalW = targetPaperWidth;
      finalH = Math.round(canvasHeight * scale);
    } else if (mode === 'auto-scale' || mode === 'bordered') {
      // Calculate integer scale so pixels remain 100% crisp squares
      const maxIntegerScale = Math.max(1, Math.floor((targetPaperWidth - (mode === 'bordered' ? 32 : 16)) / canvasWidth));
      scale = maxIntegerScale;
      finalW = canvasWidth * scale;
      finalH = canvasHeight * scale;
    } else {
      // native 1:1
      scale = 1;
      finalW = canvasWidth;
      finalH = canvasHeight;
    }

    const paddingX = Math.max(0, Math.floor((targetPaperWidth - finalW) / 2));
    const paddingY = 24; // Top & bottom margin for clean tear

    const totalHeight = finalH + paddingY * 2 + (printTitle.trim() ? 36 : 0);
    outCanvas.width = targetPaperWidth;
    outCanvas.height = totalHeight;

    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return '';

    outCtx.fillStyle = '#FFFFFF';
    outCtx.fillRect(0, 0, targetPaperWidth, totalHeight);
    outCtx.imageSmoothingEnabled = false;

    let startY = paddingY;

    // Draw optional title
    if (printTitle.trim()) {
      outCtx.fillStyle = '#000000';
      outCtx.font = 'bold 16px monospace';
      outCtx.textAlign = 'center';
      outCtx.fillText(printTitle.trim(), targetPaperWidth / 2, startY + 16);
      startY += 30;
    }

    // Draw border if requested
    if (mode === 'bordered') {
      outCtx.strokeStyle = '#000000';
      outCtx.lineWidth = 3;
      outCtx.strokeRect(paddingX - 6, startY - 6, finalW + 12, finalH + 12);
      outCtx.lineWidth = 1;
      outCtx.strokeRect(paddingX - 10, startY - 10, finalW + 20, finalH + 20);
    }

    // Draw the scaled artwork
    outCtx.drawImage(ctxs.bufferCanvas, paddingX, startY, finalW, finalH);

    return outCanvas.toDataURL('image/png');
  };

  // Direct Print & Composer Print
  const handlePrintClick = () => {
    // If it's a small canvas (<= 200px), open print modal to offer nice 3x scaling & sticker borders
    if (canvasWidth <= 200) {
      setShowPrintModal(true);
    } else {
      // Direct print full width
      const dataUrl = buildThermalPrintImage('auto-scale');
      const widthMm = pageWidth >= 576 ? 80 : 57;
      onPrintImage(dataUrl, `Piksel Çizim (${canvasWidth}x${canvasHeight})`, widthMm);
    }
  };

  const handleConfirmModalPrint = () => {
    const dataUrl = buildThermalPrintImage(printLayoutMode);
    const widthMm = pageWidth >= 576 ? 80 : 57;
    onPrintImage(dataUrl, `Piksel Çizim (${canvasWidth}x${canvasHeight})`, widthMm);
    setShowPrintModal(false);
  };

  // Download HD PNG
  const handleDownload = (scaleMultiplier: number = 1) => {
    const ctxs = getContexts();
    if (!ctxs || !ctxs.bufferCanvas) return;

    if (scaleMultiplier === 1) {
      const link = document.createElement('a');
      link.download = `pixel-canvas-${canvasWidth}x${canvasHeight}.png`;
      link.href = ctxs.bufferCanvas.toDataURL('image/png');
      link.click();
    } else {
      const hdCanvas = document.createElement('canvas');
      hdCanvas.width = canvasWidth * scaleMultiplier;
      hdCanvas.height = canvasHeight * scaleMultiplier;
      const hdCtx = hdCanvas.getContext('2d');
      if (hdCtx) {
        hdCtx.imageSmoothingEnabled = false;
        hdCtx.drawImage(ctxs.bufferCanvas, 0, 0, hdCanvas.width, hdCanvas.height);
        const link = document.createElement('a');
        link.download = `pixel-art-HD-${hdCanvas.width}x${hdCanvas.height}.png`;
        link.href = hdCanvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  // Mathematical Pixel Display Scale
  const pixelCellSize = zoomLevel / 100;
  const displayStyleWidth = Math.round(canvasWidth * pixelCellSize);
  const displayStyleHeight = Math.round(canvasHeight * pixelCellSize);

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

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick HD Download Button */}
          <button
            onClick={() => handleDownload(4)}
            className="h-8 px-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hidden sm:flex items-center gap-1 cursor-pointer"
            title="4x HD PNG İndir"
          >
            <Download size={13} />
            <span>4x HD</span>
          </button>

          {/* Fixed Print Button */}
          <Button
            size="sm"
            onClick={handlePrintClick}
            className="h-8 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Printer size={14} />
            <span>Yazdır</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Grid: Left Tools + Center Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Side: Desktop Expandable Tools Sidebar */}
        {isToolsOpen && (
          <Card className="hidden lg:block lg:col-span-3.5 p-3.5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-sm">
            {/* Drawing Tool Buttons */}
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Çizim Araçları
              </label>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'pencil', label: 'Kalem', icon: <Pencil size={15} /> },
                  { id: 'eraser', label: 'Silgi', icon: <Eraser size={15} /> },
                  { id: 'dither', label: 'Tonlama', icon: <Palette size={15} /> },
                  { id: 'fill', label: 'Kova', icon: <PaintBucket size={15} /> },
                  { id: 'line', label: 'Çizgi', icon: <Minus size={15} /> },
                  { id: 'rect', label: 'Dolu Kutu', icon: <Square size={15} className="fill-current" /> },
                  { id: 'rectOutline', label: 'Çerçeve', icon: <Square size={15} /> },
                  { id: 'circle', label: 'Daire', icon: <Circle size={15} className="fill-current" /> },
                  { id: 'circleOutline', label: 'Çember', icon: <Circle size={15} /> },
                  { id: 'text', label: 'Mikro Font', icon: <Type size={15} /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id as ToolType)}
                    className={`p-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      activeTool === t.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title={t.label}
                  >
                    {t.icon}
                    <span className="truncate text-[9.5px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Size & Shape */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Fırça Boyutu
                </label>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {brushSize}x{brushSize} px
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {([1, 2, 3, 4, 6, 8, 12] as BrushSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`py-1 rounded-lg text-[10.5px] font-black transition-all border cursor-pointer ${
                      brushSize === size
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {size}p
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-bold text-[10.5px]">Uç Tipi:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setBrushShape('square')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      brushShape === 'square'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Kare Blok
                  </button>
                  <button
                    onClick={() => setBrushShape('round')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      brushShape === 'round'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Yuvarlak
                  </button>
                </div>
              </div>
            </div>

            {/* Micro Typography Inspector */}
            {activeTool === 'text' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-indigo-900 dark:text-indigo-200">
                    Gömülü 1-Bit Mikro Font
                  </label>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    0 Anti-Alias
                  </span>
                </div>

                <input
                  type="text"
                  value={stampText}
                  onChange={(e) => setStampText(e.target.value)}
                  placeholder="Basılacak metin..."
                  className="w-full px-2.5 py-1 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[9.5px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                      Font Matrisi:
                    </label>
                    <div className="flex gap-1">
                      {(['5x7', '7x9'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFontType(f)}
                          className={`flex-1 py-0.5 rounded-lg text-[9.5px] font-bold border ${
                            fontType === f
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-900 text-indigo-700 border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                      Ölçek:
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <button
                          key={s}
                          onClick={() => setTextScale(s)}
                          className={`flex-1 py-0.5 rounded-lg text-[9.5px] font-bold ${
                            textScale === s
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 text-indigo-700 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={textInverted}
                    onChange={(e) => setTextInverted(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Ters Zemin (Siyah Kutu İçinde Beyaz Yazı)
                </label>
              </motion.div>
            )}

            {/* Transformation & Shift Tools */}
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Dönüştürme & Aynalama
              </label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={handleInvertColors}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="Renkleri Ters Çevir"
                >
                  <RefreshCw size={14} />
                  <span className="text-[9px]">Ters Çevir</span>
                </button>

                <button
                  onClick={handleFlipHorizontal}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="Yatay Aynala"
                >
                  <FlipHorizontal size={14} />
                  <span className="text-[9px]">Yatay</span>
                </button>

                <button
                  onClick={handleFlipVertical}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="Dikey Aynala"
                >
                  <FlipVertical size={14} />
                  <span className="text-[9px]">Dikey</span>
                </button>

                <button
                  onClick={handleRotate90}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="90° Sağa Döndür"
                >
                  <RotateCw size={14} />
                  <span className="text-[9px]">Döndür</span>
                </button>
              </div>

              {/* D-Pad Pixel Shift */}
              <div className="flex items-center justify-between mt-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-[10px] font-bold">
                <span className="text-slate-500">Piksel Kaydır:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShift(-1, 0)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Sola"
                  >
                    <ArrowLeftIcon size={12} />
                  </button>
                  <button
                    onClick={() => handleShift(0, -1)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Yukarı"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => handleShift(0, 1)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Aşağı"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => handleShift(1, 0)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Sağa"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Center & Right: High-Precision 1:1 Pixel Canvas Stage */}
        <div className={`space-y-2 ${isToolsOpen ? 'lg:col-span-8.5 col-span-12' : 'col-span-12'}`}>
          {/* Stage Controls Toolbar */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs font-bold">
            {/* Sol: Sığdır & Izgara & Geri & İleri & Temizle */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => handleFitToScreen(true)}
                className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1 sm:gap-1.5 transition-colors"
                title="Ekrana Tam Sığdır (Animasyonlu)"
              >
                <Maximize2 size={13} />
                <span>Sığdır</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 sm:px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  showGrid
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title="Piksel Izgarası"
              >
                <Grid size={13} />
                <span>Izgara</span>
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

              {/* Geri Al (Undo) */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 sm:px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 transition-colors"
                title="Geri Al"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline text-[11px]">Geri</span>
              </button>

              {/* İleri Al (Redo) */}
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 sm:px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1 transition-colors"
                title="İleri Al"
              >
                <RotateCw size={13} />
                <span className="hidden sm:inline text-[11px]">İleri</span>
              </button>

              {/* Temizle (Sil) */}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 sm:px-2 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 cursor-pointer flex items-center gap-1 transition-colors"
                title="Tuvali Temizle"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline text-[11px]">Temizle</span>
              </button>
            </div>

            {/* Sağ: Sadece Koordinat Bilgisi */}
            {hoverCoord ? (
              <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                [{hoverCoord.x}, {hoverCoord.y}]
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 font-normal hidden md:block">
                İki parmakla / tekerlekle yakınlaştırın
              </div>
            )}
          </div>

          {/* Precision Stage Viewport */}
          <div
            ref={stageContainerRef}
            className="p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 min-h-[480px] h-[calc(100vh-200px)] max-h-[820px] overflow-auto flex flex-col items-center justify-center relative select-none"
          >
            {/* The 1:1 Pixel Canvas Stage Container */}
            <div
              className="relative shadow-md border border-slate-300 dark:border-slate-700 bg-white transition-all duration-300 ease-out"
              style={{
                width: `${displayStyleWidth}px`,
                height: `${displayStyleHeight}px`,
                minWidth: `${displayStyleWidth}px`,
                minHeight: `${displayStyleHeight}px`,
                maxWidth: `${displayStyleWidth}px`,
                maxHeight: `${displayStyleHeight}px`,
                touchAction: 'none',
              }}
            >
              {/* Primary Pixel Canvas */}
              <canvas
                ref={displayCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={() => setHoverCoord(null)}
                className="w-full h-full cursor-crosshair block select-none"
                style={{
                  imageRendering: 'pixelated',
                  width: `${displayStyleWidth}px`,
                  height: `${displayStyleHeight}px`,
                }}
              />

              {/* Crisp Uniform Single-Type Pixel Grid (Tek Tip Siyah Çizgiler) */}
              {showGrid && pixelCellSize >= 2.5 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0, 0, 0, 0.28) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0, 0, 0, 0.28) 1px, transparent 1px)
                    `,
                    backgroundSize: `${pixelCellSize}px ${pixelCellSize}px`,
                  }}
                />
              )}

              {/* Active Hover Pixel Cursor Highlight Box */}
              {hoverCoord && (
                <div
                  className="absolute pointer-events-none border-2 border-indigo-500 bg-indigo-500/20 shadow-xs"
                  style={{
                    left: `${hoverCoord.x * pixelCellSize}px`,
                    top: `${hoverCoord.y * pixelCellSize}px`,
                    width: `${pixelCellSize * (activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'dither' ? brushSize : 1)}px`,
                    height: `${pixelCellSize * (activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'dither' ? brushSize : 1)}px`,
                    transform:
                      activeTool === 'pencil' || activeTool === 'eraser' || activeTool === 'dither'
                        ? `translate(-${Math.floor(brushSize / 2) * pixelCellSize}px, -${Math.floor(brushSize / 2) * pixelCellSize}px)`
                        : 'none',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Print Composer Modal for Discrete 100x100 Canvases */}
      <AnimatePresence>
        {showPrintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-base">
                  <Printer size={20} className="text-indigo-600" />
                  Termal Yazdırma & Sayfa Düzeni ({canvasWidth}x{canvasHeight}px)
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {canvasWidth}x{canvasHeight} ebatındaki piksel çiziminizin {pageWidth >= 576 ? '80mm' : '58mm'} termal kağıda nasıl basılacağını seçin:
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      id: 'auto-scale',
                      title: '🚀 Otomatik Büyüt & Ortala (Önerilen)',
                      desc: `${Math.floor((pageWidth >= 576 ? 576 : 384) / canvasWidth)}x Net Piksel Büyütme ile rulo merkezine yerleştirir.`,
                    },
                    {
                      id: 'bordered',
                      title: '🏷️ Retro Çerçeveli Sticker Formatı',
                      desc: 'Piksel çizimin etrafına şık 1-bit çerçeve ekler.',
                    },
                    {
                      id: 'native-center',
                      title: '📐 1:1 Doğal Boyut (Ortalanmış)',
                      desc: `Birebir ${canvasWidth}x${canvasHeight} piksel boyutunda kağıdın ortasına basar.`,
                    },
                    {
                      id: 'full-width',
                      title: '📜 Tam Ruloya Sığdır (Genişlet)',
                      desc: `Rulo genişliğine (${pageWidth >= 576 ? '576px' : '384px'}) tam yayar.`,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPrintLayoutMode(opt.id as any)}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        printLayoutMode === opt.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-black">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    İsteğe Bağlı Başlık / Not:
                  </label>
                  <input
                    type="text"
                    value={printTitle}
                    onChange={(e) => setPrintTitle(e.target.value)}
                    placeholder="Örn: Piksel Sanatı #1"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmModalPrint}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={15} /> Baskıyı Başlat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dimension & Presets Floating In-Place Panel */}
      <AnimatePresence>
        {isDimensionsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-auto sm:w-[420px] sm:left-1/2 sm:-translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 max-h-[65vh] overflow-y-auto space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-100">
                <Sliders size={14} className="text-indigo-600" />
                <span>Tuval Ebatı & Şablonlar</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDimensionsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Kapat"
              >
                <X size={15} />
              </button>
            </div>

            {/* Custom Dimensions Form (Open by default) */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Özel Piksel Ölçüsü
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-500 block mb-0.5">Genişlik (px)</span>
                  <input
                    type="number"
                    value={customW}
                    onChange={(e) => setCustomW(e.target.value)}
                    min={8}
                    max={1024}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-slate-500 block mb-0.5">Yükseklik (px)</span>
                  <input
                    type="number"
                    value={customH}
                    onChange={(e) => setCustomH(e.target.value)}
                    min={8}
                    max={1536}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preserveContentOnResize}
                    onChange={(e) => setPreserveContentOnResize(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Çizimi Koru
                </label>

                <button
                  type="button"
                  onClick={() => {
                    applyNewDimensions(
                      parseInt(customW) || 32,
                      parseInt(customH) || 32,
                      preserveContentOnResize
                    );
                    setIsDimensionsOpen(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Check size={13} /> Uygula
                </button>
              </div>
            </div>

            {/* Ready Presets Quick Accordion (Collapsed by default) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
              <button
                type="button"
                onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
                className="w-full flex items-center justify-between p-2.5 text-left text-[10.5px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span>Hızlı Ebatlar ({CANVAS_PRESETS.length})</span>
                  <span className="text-[9.5px] font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
                    {canvasWidth}x{canvasHeight}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${
                    isPresetsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isPresetsExpanded && (
                <div className="p-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5 animate-in fade-in duration-150">
                  {CANVAS_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        applyNewDimensions(preset.width, preset.height, preserveContentOnResize, preset.recommendedZoom);
                        setIsDimensionsOpen(false);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                        canvasWidth === preset.width && canvasHeight === preset.height
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-[11px] font-mono font-black">{preset.width}x{preset.height}</div>
                      <div className={`text-[9px] truncate ${canvasWidth === preset.width && canvasHeight === preset.height ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Import Modal with Live 1-Bit Pixel Preview & Custom Region Crop */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 max-w-lg w-full space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-black text-sm">
                  <Upload size={18} className="text-indigo-600" />
                  Görsel İçe Aktarma & 1-Bit Canlı Önizleme
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {/* Upload Picker */}
                <label className="block p-3.5 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 text-center cursor-pointer hover:bg-indigo-100/40 transition-colors">
                  <Upload size={20} className="mx-auto text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 block">
                    {importedImageSrc ? 'Farklı Görsel Değiştir' : 'Resim Seç (Galeri / Dosya)'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {importedImageSrc && (
                  <div className="space-y-3">
                    {/* Live 1-Bit Pixelated Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10.5px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Tuvale Aktarılacak Canlı 1-Bit Önizleme ({canvasWidth}x{canvasHeight}px)
                        </span>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                          {importFitMode === 'custom' ? 'Özel Bölge' : importFitMode === 'cover' ? 'Kırp/Doldur' : 'Sığdır'}
                        </span>
                      </div>

                      <div className="relative p-2 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center min-h-36 max-h-52 overflow-hidden select-none">
                        {importPreviewUrl ? (
                          <img
                            src={importPreviewUrl}
                            alt="1-Bit Preview"
                            style={{ imageRendering: 'pixelated' }}
                            className="max-h-44 max-w-full object-contain rounded shadow-xs"
                          />
                        ) : (
                          <div className="text-slate-400 text-xs font-bold">Önizleme oluşturuluyor...</div>
                        )}
                      </div>
                    </div>

                    {/* Mode & Dithering Controls */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Yerleşim Modu
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { id: 'contain', label: 'Sığdır' },
                            { id: 'cover', label: 'Doldur' },
                            { id: 'custom', label: 'Özel' },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => setImportFitMode(mode.id as any)}
                              className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                importFitMode === mode.id
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Pikselleme (Dither)
                        </label>
                        <select
                          value={importDither}
                          onChange={(e) => setImportDither(e.target.value as any)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                        >
                          <option value="atkinson">Atkinson (Net)</option>
                          <option value="floyd-steinberg">Floyd-Steinberg</option>
                          <option value="bayer">Bayer Matrix (Retro)</option>
                          <option value="threshold">Eşik (Keskin S/B)</option>
                        </select>
                      </div>
                    </div>

                    {/* Custom Region Zoom & Pan Controls (Active when 'custom' mode selected) */}
                    {importFitMode === 'custom' && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-200">
                            Özel Bölge Seçimi & Kırpma
                          </span>
                          <span className="text-[9.5px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                            {importCropZoom.toFixed(1)}x Yakınlaştırma
                          </span>
                        </div>

                        {/* Zoom Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                            <span>Yakınlaştırma (Zoom):</span>
                            <span>{importCropZoom.toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={4}
                            step={0.1}
                            value={importCropZoom}
                            onChange={(e) => setImportCropZoom(parseFloat(e.target.value))}
                            className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Pan X and Pan Y */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                              <span>Yatay Kaydır (X):</span>
                              <span>{importCropPanX}%</span>
                            </div>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              step={1}
                              value={importCropPanX}
                              onChange={(e) => setImportCropPanX(parseInt(e.target.value))}
                              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mb-0.5">
                              <span>Dikey Kaydır (Y):</span>
                              <span>{importCropPanY}%</span>
                            </div>
                            <input
                              type="range"
                              min={-50}
                              max={50}
                              step={1}
                              value={importCropPanY}
                              onChange={(e) => setImportCropPanY(parseInt(e.target.value))}
                              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Brightness / Contrast / Invert */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <div>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-500 mb-0.5">
                          <span>Parlaklık:</span>
                          <span>{importBrightness > 0 ? `+${importBrightness}` : importBrightness}</span>
                        </div>
                        <input
                          type="range"
                          min={-50}
                          max={50}
                          value={importBrightness}
                          onChange={(e) => setImportBrightness(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-500 mb-0.5">
                          <span>Kontrast:</span>
                          <span>{importContrast > 0 ? `+${importContrast}` : importContrast}</span>
                        </div>
                        <input
                          type="range"
                          min={-50}
                          max={50}
                          value={importContrast}
                          onChange={(e) => setImportContrast(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-0.5">
                      <input
                        type="checkbox"
                        checked={importInvert}
                        onChange={(e) => setImportInvert(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      Renkleri Ters Çevir (Invert)
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  İptal
                </button>
                <button
                  onClick={applyImportedImageToCanvas}
                  disabled={!importedImageSrc}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} /> Tuvale Aktar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Expandable In-Place Tools Floating Panel */}
      <AnimatePresence>
        {isToolsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed bottom-20 left-3 right-3 sm:left-auto sm:right-auto sm:w-96 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 max-h-[60vh] overflow-y-auto space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-slate-100">
                <Palette size={14} className="text-indigo-600" />
                <span>Çizim Araçları</span>
              </div>
              <button
                type="button"
                onClick={() => setIsToolsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Kapat"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawing Tool Buttons */}
            <div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'pencil', label: 'Kalem', icon: <Pencil size={15} /> },
                  { id: 'eraser', label: 'Silgi', icon: <Eraser size={15} /> },
                  { id: 'dither', label: 'Tonlama', icon: <Palette size={15} /> },
                  { id: 'fill', label: 'Kova', icon: <PaintBucket size={15} /> },
                  { id: 'line', label: 'Çizgi', icon: <Minus size={15} /> },
                  { id: 'rect', label: 'Dolu Kutu', icon: <Square size={15} className="fill-current" /> },
                  { id: 'rectOutline', label: 'Çerçeve', icon: <Square size={15} /> },
                  { id: 'circle', label: 'Daire', icon: <Circle size={15} className="fill-current" /> },
                  { id: 'circleOutline', label: 'Çember', icon: <Circle size={15} /> },
                  { id: 'text', label: 'Mikro Font', icon: <Type size={15} /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTool(t.id as ToolType);
                    }}
                    className={`p-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      activeTool === t.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title={t.label}
                  >
                    {t.icon}
                    <span className="truncate text-[9.5px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brush Size & Shape */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Fırça Boyutu
                </label>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {brushSize}x{brushSize} px
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {([1, 2, 3, 4, 6, 8, 12] as BrushSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`py-1 rounded-lg text-[10.5px] font-black transition-all border cursor-pointer ${
                      brushSize === size
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {size}p
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-bold text-[10.5px]">Uç Tipi:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setBrushShape('square')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      brushShape === 'square'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Kare Blok
                  </button>
                  <button
                    onClick={() => setBrushShape('round')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      brushShape === 'round'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Yuvarlak
                  </button>
                </div>
              </div>
            </div>

            {/* Micro Typography Inspector */}
            {activeTool === 'text' && (
              <div className="p-2.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-indigo-900 dark:text-indigo-200">
                    Gömülü 1-Bit Mikro Font
                  </label>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    0 Anti-Alias
                  </span>
                </div>

                <input
                  type="text"
                  value={stampText}
                  onChange={(e) => setStampText(e.target.value)}
                  placeholder="Basılacak metin..."
                  className="w-full px-2.5 py-1 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[9.5px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                      Font Matrisi:
                    </label>
                    <div className="flex gap-1">
                      {(['5x7', '7x9'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFontType(f)}
                          className={`flex-1 py-0.5 rounded-lg text-[9.5px] font-bold border ${
                            fontType === f
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-900 text-indigo-700 border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">
                      Ölçek:
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((s) => (
                        <button
                          key={s}
                          onClick={() => setTextScale(s)}
                          className={`flex-1 py-0.5 rounded-lg text-[9.5px] font-bold ${
                            textScale === s
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white dark:bg-slate-900 text-indigo-700 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-200 cursor-pointer pt-0.5">
                  <input
                    type="checkbox"
                    checked={textInverted}
                    onChange={(e) => setTextInverted(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  Ters Zemin (Siyah Kutu İçinde Beyaz)
                </label>
              </div>
            )}

            {/* Transformation & Shift Tools */}
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Dönüştürme & Aynalama
              </label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={handleInvertColors}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="Renkleri Ters Çevir"
                >
                  <RefreshCw size={14} />
                  <span className="text-[9px]">Ters Çevir</span>
                </button>

                <button
                  onClick={handleFlipHorizontal}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="Yatay Aynala"
                >
                  <FlipHorizontal size={14} />
                  <span className="text-[9px]">Yatay</span>
                </button>

                <button
                  onClick={handleFlipVertical}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="Dikey Aynala"
                >
                  <FlipVertical size={14} />
                  <span className="text-[9px]">Dikey</span>
                </button>

                <button
                  onClick={handleRotate90}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                  title="90° Sağa Döndür"
                >
                  <RotateCw size={14} />
                  <span className="text-[9px]">Döndür</span>
                </button>
              </div>

              {/* D-Pad Pixel Shift */}
              <div className="flex items-center justify-between mt-1.5 px-2 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 text-[10px] font-bold">
                <span className="text-slate-500">Piksel Kaydır:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShift(-1, 0)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Sola"
                  >
                    <ArrowLeftIcon size={12} />
                  </button>
                  <button
                    onClick={() => handleShift(0, -1)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Yukarı"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => handleShift(0, 1)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Aşağı"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    onClick={() => handleShift(1, 0)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    title="1px Sağa"
                  >
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)]">
        {/* Araçlar Butonu (Menüyü doğrudan tuval üzerinde genişletir) */}
        <button
          type="button"
          onClick={() => {
            setIsToolsOpen((prev) => !prev);
            setIsDimensionsOpen(false);
          }}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            isToolsOpen
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Çizim Araçlarını Aç / Kapat"
        >
          <Palette size={14} className={isToolsOpen ? 'text-white' : 'text-indigo-500'} />
          <span>Araçlar</span>
        </button>

        {/* Ebat & Şablon Butonu (Doğrudan tuval üzerinde minimalist floating panel açar) */}
        <button
          type="button"
          onClick={() => {
            setIsDimensionsOpen((prev) => !prev);
            setIsToolsOpen(false);
          }}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            isDimensionsOpen
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Tuval Ebatı & Şablon Seç"
        >
          <Sliders size={13} className={isDimensionsOpen ? 'text-white' : 'text-indigo-500'} />
          <span>Ebat</span>
        </button>

        {/* İçe Aktar Butonu */}
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all text-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          title="Görsel İçe Aktar & Rötuşla"
        >
          <Upload size={13} className="text-indigo-500" />
          <span>İçe Aktar</span>
        </button>
      </div>
    </motion.div>
  );
}
