import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  RotateCw,
  Sparkles,
  Printer,
  Upload,
  Image as ImageIcon,
  Compass,
  Calendar,
  Clock,
  Tag,
  Heart,
  Smile,
  Film,
  Sliders,
  Download,
  RefreshCw,
  Check,
  X,
  Eraser,
  PenTool,
  Zap,
  Volume2,
  VolumeX,
  Timer,
  Eye,
  Scissors,
  Layers,
  Sun,
  Contrast as ContrastIcon,
  HelpCircle,
  Copy,
  ChevronRight,
  ZoomIn,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { processImage, DitheringType } from '../lib/image-processing';

export interface PolaroidGeneratorProps {
  initialImage?: string | null;
  pageWidth: number;
  onPrintImage: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => Promise<void>;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export type PolaroidFrameStyle = 
  | 'classic-600'      // Klasik Beyaz Polaroid 600
  | 'vintage-tape'     // Washi Bant & Vintage Eskitilmiş Çerçeve
  | 'dark-onyx'        // Siyah Çerçeve Polaroid (Dark Edition)
  | 'sprocket-35mm'    // 35mm Sinema Film Şeridi (Perfore Delikli)
  | 'photobooth-strip' // 3'lü Nostaljik Foto Kabin Şeridi
  | 'scrapbook-heart'  // Romantik Hatıra Defteri & Damgalı
  | 'minimal-clean';   // Modern Kenarlıksız İnce Çerçeve

export type PhotoPreset = 'custom' | 'portrait' | 'landscape' | 'vintage' | 'sketch' | 'newspaper' | 'high-contrast';

// Web Audio API Shutter & Beep Sound Synthesizer (Sıfır bağımlılık / 100% Çevrimdışı)
function playCameraAudio(type: 'shutter' | 'beep' | 'countdown') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'countdown') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'shutter') {
      // White noise burst + click
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(ctx.currentTime + 0.12);
    }
  } catch (err) {
    console.debug('Audio not available:', err);
  }
}

export const PolaroidGenerator: React.FC<PolaroidGeneratorProps> = ({
  initialImage,
  pageWidth,
  onPrintImage,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}) => {
  // Input mode: 'camera' | 'upload' | 'draw'
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'style'>('camera');
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]); // For photobooth 3-strip
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5 | 10>(0);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [cameraMirror, setCameraMirror] = useState<boolean>(true);

  // Polaroid Frame & Style
  const [frameStyle, setFrameStyle] = useState<PolaroidFrameStyle>('classic-600');
  const [preset, setPreset] = useState<PhotoPreset>('portrait');
  const [dithering, setDithering] = useState<DitheringType>('atkinson');
  const [fontStyle, setFontStyle] = useState<'handwriting' | 'typewriter' | 'serif' | 'sans'>('handwriting');
  
  // Texts & Metadata
  const [caption, setCaption] = useState('Anı Notu • Özel Gün ✨');
  const [locationName, setLocationName] = useState('İstanbul, TR');
  const [dateTimeStr, setDateTimeStr] = useState('');
  const [selectedStamp, setSelectedStamp] = useState<string>('POLAROID ORIGINAL');
  const [showLocation, setShowLocation] = useState<boolean>(true);
  const [showDate, setShowDate] = useState<boolean>(true);
  const [showStamp, setShowStamp] = useState<boolean>(true);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Image adjustments
  const [brightness, setBrightness] = useState<number>(5);
  const [contrast, setContrast] = useState<number>(20);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [mirror, setMirror] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [invert, setInvert] = useState<boolean>(false);

  // Handwritten signature / drawing overlay
  const [showSignaturePad, setShowSignaturePad] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Main render canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Auto-set initial date/time string
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ' • ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setDateTimeStr(formatted);
  }, []);

  // Update source if initialImage prop changes
  useEffect(() => {
    if (initialImage) {
      setSourceImage(initialImage);
      setActiveTab('style');
    }
  }, [initialImage]);

  // Apply Preset Values
  const applyPreset = (presetName: PhotoPreset) => {
    setPreset(presetName);
    switch (presetName) {
      case 'portrait':
        setDithering('atkinson');
        setBrightness(8);
        setContrast(18);
        setInvert(false);
        break;
      case 'landscape':
        setDithering('floyd-steinberg');
        setBrightness(0);
        setContrast(32);
        setInvert(false);
        break;
      case 'vintage':
        setDithering('bayer');
        setBrightness(5);
        setContrast(22);
        setInvert(false);
        break;
      case 'sketch':
        setDithering('sketch');
        setBrightness(15);
        setContrast(40);
        setInvert(false);
        break;
      case 'newspaper':
        setDithering('dot-matrix');
        setBrightness(0);
        setContrast(25);
        setInvert(false);
        break;
      case 'high-contrast':
        setDithering('threshold');
        setBrightness(0);
        setContrast(45);
        setInvert(false);
        break;
      default:
        break;
    }
  };

  // ---------------- CAMERA CONTROLS ---------------- //
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        const videoEl = videoRef.current;
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          if (videoEl.srcObject === stream) {
            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              playPromise.catch((playErr: unknown) => {
                // Ignore AbortError and interrupt errors caused by tab switches or rapid camera flips
                const errName = (playErr as { name?: string })?.name;
                const errMsg = (playErr as { message?: string })?.message || '';
                if (errName !== 'AbortError' && !errMsg.includes('interrupted')) {
                  console.warn('Camera video play note:', playErr);
                }
              });
            }
          }
        };
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera access failed:', err);
      const errMsg = err instanceof Error ? err.message : 'Kamera başlatılamadı';
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
        setCameraError('Kamera erişim izni verilmedi. Lütfen tarayıcı ayarlarından kameraya izin verin.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('Kamera cihazı bulunamadı. Lütfen bağlı bir kamera olduğundan emin olun.');
      } else {
        setCameraError('Kamera açılamadı: ' + errMsg);
      }
      setIsCameraActive(false);
    }
  }, [cameraFacing]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore pause failure
      }
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
    setIsCameraActive(false);
  }, []);

  // Manage camera on tab change
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  // Flip Front/Back Camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    setCameraMirror(nextFacing === 'user');
  };

  // Trigger Shutter / Snap Instant Photo
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Flash animation & audio
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 220);
    if (soundEnabled) playCameraAudio('shutter');

    const snapCanvas = document.createElement('canvas');
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    snapCanvas.width = vw;
    snapCanvas.height = vh;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return;

    // Apply mirror if user camera
    if (cameraMirror) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, vw, vh);
    const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.92);

    if (frameStyle === 'photobooth-strip' && sourceImage && secondaryImages.length < 2) {
      // Append to 3-strip
      setSecondaryImages(prev => [...prev, dataUrl]);
    } else {
      setSourceImage(dataUrl);
      setSecondaryImages([]);
    }

    setActiveTab('style');
  };

  // Countdown timer before snapshot
  const triggerShutterWithTimer = () => {
    if (timerDuration === 0) {
      takeSnapshot();
      return;
    }

    setIsCountingDown(true);
    let count = timerDuration;
    setCountdownValue(count);
    if (soundEnabled) playCameraAudio('countdown');

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownValue(count);
        if (soundEnabled) playCameraAudio('countdown');
      } else {
        clearInterval(interval);
        setIsCountingDown(false);
        takeSnapshot();
      }
    }, 1000);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSourceImage(evt.target.result as string);
          setActiveTab('style');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Demo sample photo for instant testing
  const loadDemoPhoto = () => {
    // Generate an elegant monochrome vintage portrait scene on canvas
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 600;
    demoCanvas.height = 600;
    const dCtx = demoCanvas.getContext('2d');
    if (dCtx) {
      // Vintage gradient background
      const grad = dCtx.createRadialGradient(300, 300, 50, 300, 300, 350);
      grad.addColorStop(0, '#f8fafc');
      grad.addColorStop(0.6, '#cbd5e1');
      grad.addColorStop(1, '#475569');
      dCtx.fillStyle = grad;
      dCtx.fillRect(0, 0, 600, 600);

      // Draw coffee cup & sunglasses silhouette scene
      dCtx.fillStyle = '#1e293b';
      // Cup
      dCtx.beginPath();
      dCtx.arc(300, 320, 110, 0, Math.PI);
      dCtx.fill();
      // Cup handle
      dCtx.lineWidth = 18;
      dCtx.strokeStyle = '#1e293b';
      dCtx.beginPath();
      dCtx.arc(410, 340, 45, -Math.PI / 2, Math.PI / 2);
      dCtx.stroke();
      // Plate
      dCtx.beginPath();
      dCtx.ellipse(300, 440, 190, 35, 0, 0, Math.PI * 2);
      dCtx.fill();
      // Steam
      dCtx.lineWidth = 6;
      dCtx.strokeStyle = '#64748b';
      dCtx.beginPath();
      dCtx.moveTo(270, 200);
      dCtx.bezierCurveTo(250, 150, 290, 110, 270, 70);
      dCtx.moveTo(330, 200);
      dCtx.bezierCurveTo(350, 150, 310, 110, 330, 70);
      dCtx.stroke();

      // Text badge
      dCtx.fillStyle = '#0f172a';
      dCtx.font = 'bold 24px Georgia, serif';
      dCtx.textAlign = 'center';
      dCtx.fillText('☕ VINTAGE CAFÉ • EST. 2026', 300, 530);

      setSourceImage(demoCanvas.toDataURL('image/jpeg', 0.9));
      setActiveTab('style');
    }
  };

  // Get current GPS location via browser API
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setLocationName(`📍 ${lat}° K, ${lng}° D`);
        setIsGettingLocation(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setLocationName('İstanbul, TR');
        setIsGettingLocation(false);
      },
      { timeout: 6000 }
    );
  };

  // ---------------- SIGNATURE PAD CONTROLS ---------------- //
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'));
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData(null);
  };

  // ---------------- POLAROID CANVAS RENDER ENGINE ---------------- //
  const renderPolaroid = useCallback(() => {
    if (!sourceImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const targetW = pageWidth || 384;
      const is80mm = targetW > 450;
      
      // Calculate Frame Dimensions Based on Selected Style
      let sideMargin = is80mm ? 24 : 16;
      let topMargin = is80mm ? 24 : 16;
      let bottomMargin = is80mm ? 130 : 105;
      let photoAspect = 0.95; // Polaroid standard aspect ratio (almost square)

      if (frameStyle === 'sprocket-35mm') {
        topMargin = is80mm ? 36 : 28;
        bottomMargin = is80mm ? 90 : 75;
        photoAspect = 0.8;
      } else if (frameStyle === 'photobooth-strip') {
        sideMargin = is80mm ? 18 : 12;
        topMargin = is80mm ? 18 : 12;
        bottomMargin = is80mm ? 80 : 65;
      } else if (frameStyle === 'minimal-clean') {
        sideMargin = 8;
        topMargin = 8;
        bottomMargin = is80mm ? 75 : 60;
      }

      const photoW = targetW - (sideMargin * 2);
      let photoH = Math.round(photoW * photoAspect);

      let totalH = topMargin + photoH + bottomMargin;

      // Handle 3-Strip Photobooth layout height
      if (frameStyle === 'photobooth-strip') {
        const singleStripH = Math.round(photoW * 0.65);
        const stripGap = 8;
        const totalStripPhotos = 3;
        photoH = (singleStripH * totalStripPhotos) + (stripGap * (totalStripPhotos - 1));
        totalH = topMargin + photoH + bottomMargin;
      }

      canvas.width = targetW;
      canvas.height = totalH;

      // 1. Draw Outer Frame Background
      if (frameStyle === 'dark-onyx') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, targetW, totalH);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, totalH);
      }

      // 2. Draw Frame Border / Accents
      if (frameStyle === 'classic-600') {
        // Classic Double Outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, targetW - 4, totalH - 4);
      } else if (frameStyle === 'vintage-tape') {
        // Vintage double dotted border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(3, 3, targetW - 6, totalH - 6);

        // Draw Washi Tape Pattern on Top Center
        const tapeW = Math.round(targetW * 0.35);
        const tapeH = 14;
        const tapeX = (targetW - tapeW) / 2;
        const tapeY = 0;

        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(tapeX, tapeY, tapeW, tapeH);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(tapeX, tapeY, tapeW, tapeH);
        
        // Tape diagonal stripes
        ctx.beginPath();
        for (let tx = tapeX + 4; tx < tapeX + tapeW; tx += 8) {
          ctx.moveTo(tx, tapeY);
          ctx.lineTo(tx - 6, tapeY + tapeH);
        }
        ctx.stroke();
      } else if (frameStyle === 'sprocket-35mm') {
        // Film border with 35mm perfore holes
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetW, topMargin);
        ctx.fillRect(0, totalH - bottomMargin, targetW, bottomMargin);

        // Draw Top & Bottom Perforations (White sprocket rectangles)
        ctx.fillStyle = '#FFFFFF';
        const holeW = 10;
        const holeH = 6;
        const holeSpacing = 16;
        for (let hx = 12; hx < targetW - 12; hx += holeSpacing) {
          // Top sprocket hole
          ctx.fillRect(hx, 8, holeW, holeH);
          // Bottom sprocket hole
          ctx.fillRect(hx, totalH - 14, holeW, holeH);
        }
      } else if (frameStyle === 'scrapbook-heart') {
        // Decorative scalloped / corner bracket borders
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, targetW - 8, totalH - 8);

        // Corner decorative brackets
        const bSize = 14;
        ctx.lineWidth = 3;
        // Top-left
        ctx.strokeRect(6, 6, bSize, bSize);
        // Top-right
        ctx.strokeRect(targetW - 6 - bSize, 6, bSize, bSize);
        // Bottom-left
        ctx.strokeRect(6, totalH - 6 - bSize, bSize, bSize);
        // Bottom-right
        ctx.strokeRect(targetW - 6 - bSize, totalH - 6 - bSize, bSize, bSize);
      }

      // 3. Render Photo(s) with Dithering onto Offscreen Canvas
      const renderProcessedPhoto = (
        sourceImg: HTMLImageElement,
        targetWidth: number,
        targetHeight: number
      ): HTMLCanvasElement => {
        const photoCanvas = document.createElement('canvas');
        photoCanvas.width = targetWidth;
        photoCanvas.height = targetHeight;
        const pCtx = photoCanvas.getContext('2d');
        if (!pCtx) return photoCanvas;

        // Apply transformations (Rotation, Mirror, Zoom)
        pCtx.save();
        pCtx.translate(targetWidth / 2, targetHeight / 2);

        if (rotation !== 0) {
          pCtx.rotate((rotation * Math.PI) / 180);
        }
        if (mirror) {
          pCtx.scale(-1, 1);
        }
        if (zoom !== 1) {
          pCtx.scale(zoom, zoom);
        }

        // Draw original image scaled & cropped to target area
        const imgAspect = sourceImg.width / sourceImg.height;
        const targetAspect = targetWidth / targetHeight;
        let sx = 0, sy = 0, sw = sourceImg.width, sh = sourceImg.height;

        if (imgAspect > targetAspect) {
          sw = sourceImg.height * targetAspect;
          sx = (sourceImg.width - sw) / 2;
        } else {
          sh = sourceImg.width / targetAspect;
          sy = (sourceImg.height - sh) / 2;
        }

        pCtx.drawImage(sourceImg, sx, sy, sw, sh, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
        pCtx.restore();

        // Apply Dithering Engine
        const processedBitmap = processImage(
          pCtx,
          targetWidth,
          targetHeight,
          dithering,
          { brightness, contrast, invert },
          { msbFirst: true }
        );

        // Put processed bitmap pixels back
        const ditheredImageData = pCtx.createImageData(targetWidth, targetHeight);
        const data = ditheredImageData.data;
        const bytesPerRow = Math.ceil(targetWidth / 8);

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const byteIndex = y * bytesPerRow + Math.floor(x / 8);
            const bitIndex = 7 - (x % 8);
            const isBlack = (processedBitmap[byteIndex] & (1 << bitIndex)) !== 0;
            const pixelIndex = (y * targetWidth + x) * 4;
            const val = isBlack ? 0 : 255;
            data[pixelIndex] = val;
            data[pixelIndex + 1] = val;
            data[pixelIndex + 2] = val;
            data[pixelIndex + 3] = 255;
          }
        }
        pCtx.putImageData(ditheredImageData, 0, 0);
        return photoCanvas;
      };

      if (frameStyle === 'photobooth-strip') {
        // Draw 3 Photobooth Photos in vertical strip
        const singleStripH = Math.round(photoW * 0.65);
        const stripGap = 8;

        const p1 = renderProcessedPhoto(img, photoW, singleStripH);
        ctx.drawImage(p1, sideMargin, topMargin);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(sideMargin, topMargin, photoW, singleStripH);

        // Photo 2
        const y2 = topMargin + singleStripH + stripGap;
        ctx.drawImage(p1, sideMargin, y2);
        ctx.strokeRect(sideMargin, y2, photoW, singleStripH);

        // Photo 3
        const y3 = y2 + singleStripH + stripGap;
        ctx.drawImage(p1, sideMargin, y3);
        ctx.strokeRect(sideMargin, y3, photoW, singleStripH);
      } else {
        // Single Standard Photo
        const processedPhotoCanvas = renderProcessedPhoto(img, photoW, photoH);
        ctx.drawImage(processedPhotoCanvas, sideMargin, topMargin);

        // Inner Photo Border
        ctx.lineWidth = frameStyle === 'dark-onyx' ? 2 : 1;
        ctx.strokeStyle = frameStyle === 'dark-onyx' ? '#334155' : '#000000';
        ctx.strokeRect(sideMargin, topMargin, photoW, photoH);
      }

      // 4. Draw Typography & Captions in Bottom Area
      let textY = topMargin + photoH + (is80mm ? 30 : 24);
      const isDarkFrame = frameStyle === 'dark-onyx';

      // Font Mapping
      let fontFace = 'Georgia, serif';
      if (fontStyle === 'handwriting') {
        fontFace = '"Caveat", "Comic Sans MS", "Brush Script MT", cursive, sans-serif';
      } else if (fontStyle === 'typewriter') {
        fontFace = '"Courier New", Courier, monospace';
      } else if (fontStyle === 'sans') {
        fontFace = 'Inter, system-ui, -apple-system, sans-serif';
      }

      // Main Caption Note
      if (caption) {
        ctx.fillStyle = isDarkFrame ? '#FFFFFF' : '#000000';
        ctx.font = `bold ${is80mm ? 17 : 14}px ${fontFace}`;
        ctx.textAlign = 'center';
        ctx.fillText(caption, targetW / 2, textY);
        textY += is80mm ? 22 : 18;
      }

      // Metadata Line (Date & Location)
      const metaParts: string[] = [];
      if (showDate && dateTimeStr) metaParts.push(dateTimeStr);
      if (showLocation && locationName) metaParts.push(locationName);

      if (metaParts.length > 0) {
        ctx.fillStyle = isDarkFrame ? '#cbd5e1' : '#333333';
        ctx.font = `${is80mm ? 12 : 10}px ${fontStyle === 'typewriter' ? '"Courier New", monospace' : fontFace}`;
        ctx.textAlign = 'center';
        ctx.fillText(metaParts.join(' • '), targetW / 2, textY);
        textY += is80mm ? 18 : 15;
      }

      // Stamp / Brand Badge / Decorative Tag
      if (showStamp && selectedStamp) {
        ctx.fillStyle = isDarkFrame ? '#94a3b8' : '#555555';
        ctx.font = `bold ${is80mm ? 10 : 8}px "Courier New", monospace`;
        ctx.textAlign = 'center';

        const stampFormatted = `★ ${selectedStamp.toUpperCase()} ★`;
        ctx.fillText(stampFormatted, targetW / 2, textY + (is80mm ? 8 : 6));
      }

      // 5. Draw Signature / Drawing Overlay if present
      if (signatureData) {
        const sigImg = new Image();
        sigImg.onload = () => {
          // Draw signature right over bottom text area
          const sigW = Math.min(targetW - 40, 200);
          const sigH = 45;
          const sigX = (targetW - sigW) / 2;
          const sigY = topMargin + photoH + 10;
          ctx.drawImage(sigImg, sigX, sigY, sigW, sigH);

          const finalDataUrl = canvas.toDataURL('image/png');
          setPreviewUrl(finalDataUrl);
        };
        sigImg.src = signatureData;
        return;
      }

      const dataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(dataUrl);
    };
    img.src = sourceImage;
  }, [
    sourceImage,
    pageWidth,
    frameStyle,
    dithering,
    fontStyle,
    caption,
    locationName,
    dateTimeStr,
    selectedStamp,
    showLocation,
    showDate,
    showStamp,
    brightness,
    contrast,
    rotation,
    mirror,
    zoom,
    invert,
    signatureData
  ]);

  // Trigger render on state changes
  useEffect(() => {
    renderPolaroid();
  }, [renderPolaroid]);

  // ---------------- PRINT & EXPORT HANDLERS ---------------- //
  const handlePrint = async (direct: boolean = false) => {
    if (!previewUrl) return;
    setIsPrinting(true);
    try {
      if (direct && onDirectPrint) {
        await onDirectPrint(previewUrl, `Polaroid - ${caption || 'Anı Kartı'}`);
      } else if (onPreviewAndPrint) {
        onPreviewAndPrint(previewUrl, `Polaroid - ${caption || 'Anı Kartı'}`);
      } else {
        onPrintImage(previewUrl, `Polaroid - ${caption || 'Anı Kartı'}`);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `Polaroid_${Date.now()}.png`;
    a.click();
  };

  const handleCopyImage = async () => {
    if (!previewUrl) return;
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy error:', err);
    }
  };

  const frameOptions: { id: PolaroidFrameStyle; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'classic-600', label: 'Klasik', icon: Camera },
    { id: 'vintage-tape', label: 'Bant', icon: Tag },
    { id: 'dark-onyx', label: 'Onyx', icon: Sparkles },
    { id: 'sprocket-35mm', label: 'Film', icon: Film },
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

        {/* Right: Layout Switcher Options (Expanding on active) & Fixed Print Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick Layout Mode Pill Group (Expanding Buttons) */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 gap-0.5">
            {frameOptions.map((opt) => {
              const isSelected = frameStyle === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFrameStyle(opt.id)}
                  title={opt.label}
                  className={`flex items-center gap-1.5 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap ${
                    isSelected
                      ? 'bg-amber-600 text-white px-2.5 shadow-xs'
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

          {/* Fixed Print Button */}
          <Button
            size="sm"
            onClick={() => handlePrint(true)}
            disabled={!previewUrl || isPrinting}
            className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isPrinting ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span className="hidden sm:inline">Yazdırılıyor...</span>
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

      {/* Grid Layout: Left Studio Controls / Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Active Tab Controls */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TAB 1: LIVE CAMERA STUDIO */}
          {activeTab === 'camera' && (
            <Card className="p-4 space-y-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Canlı Kamera Vizörü
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs"
                    title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                  >
                    {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
                  <button
                    onClick={toggleCameraFacing}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs flex items-center gap-1 font-semibold"
                    title="Ön / Arka Kamera Geçişi"
                  >
                    <RefreshCw size={14} />
                    <span className="text-[10px]">{cameraFacing === 'user' ? 'Ön Kamera' : 'Arka Kamera'}</span>
                  </button>
                </div>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-inner flex items-center justify-center">
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraMirror ? 'scale-x-[-1]' : ''}`}
                />

                {/* Camera Flash Overlay */}
                <AnimatePresence>
                  {isFlashActive && (
                    <motion.div
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 bg-white pointer-events-none z-30"
                    />
                  )}
                </AnimatePresence>

                {/* Countdown Overlay */}
                <AnimatePresence>
                  {isCountingDown && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20"
                    >
                      <span className="text-7xl font-black text-amber-400 drop-shadow-lg font-mono">
                        {countdownValue}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Viewfinder Reticle & Grid */}
                <div className="absolute inset-0 pointer-events-none border border-white/20 m-4 rounded-xl flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-amber-400/60 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  </div>
                  {/* Corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/70" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/70" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/70" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/70" />
                </div>

                {/* Error Message if Camera Failed */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                    <CameraOff size={36} className="text-rose-400" />
                    <p className="text-xs font-semibold text-rose-200 leading-relaxed max-w-xs">
                      {cameraError}
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={startCamera} size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs font-bold">
                        Tekrar Dene
                      </Button>
                      <Button onClick={() => setActiveTab('upload')} size="sm" variant="outline" className="text-xs">
                        Dosya Yükle
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shutter & Quick Camera Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {/* Timer Selection */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <Timer size={14} className="text-slate-500 ml-1" />
                  {[0, 3, 5, 10].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimerDuration(t as any)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        timerDuration === t
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {t === 0 ? 'Hemen' : `${t}s`}
                    </button>
                  ))}
                </div>

                {/* Main Shutter Button */}
                <button
                  onClick={triggerShutterWithTimer}
                  disabled={!isCameraActive || isCountingDown}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-1 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-full border-2 border-white/80 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white shadow-inner flex items-center justify-center text-amber-600">
                      <Zap size={20} className="fill-amber-600" />
                    </div>
                  </div>
                </button>

                {/* Mirror Toggle */}
                <button
                  onClick={() => setCameraMirror(!cameraMirror)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    cameraMirror
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                  title="Aynalama (Yatay Çevir)"
                >
                  <FlipHorizontal size={15} />
                  <span className="text-[10px]">Ayna</span>
                </button>
              </div>
            </Card>
          )}

          {/* TAB 2: UPLOAD / GALLERY */}
          {activeTab === 'upload' && (
            <Card className="p-4 space-y-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Fotoğraf Yükle veya Seç
                  </h3>
                </div>

                <Button
                  onClick={loadDemoPhoto}
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50"
                >
                  <Sparkles size={13} className="mr-1" />
                  Örnek Retro Fotoğrafı Yükle
                </Button>
              </div>

              {/* Upload Dropzone */}
              <label className="border-2 border-dashed border-amber-300 dark:border-amber-800 hover:border-amber-500 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer bg-amber-50/30 dark:bg-amber-950/10 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center shadow-xs">
                  <Upload size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Cihazınızdan Fotoğraf Seçin
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG, JPG, WEBP formatları desteklenir (Polaroid oranına otomatik uyarlanır)
                  </p>
                </div>
                <span className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs">
                  Dosya Gözat
                </span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>

              {sourceImage && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <img
                      src={sourceImage}
                      alt="Thumbnail"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Seçili Fotoğraf</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Check size={11} /> Hazır ve yüklendi
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab('style')}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                  >
                    Düzenlemeye Geç <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* TAB 3: FRAME, DITHER & METADATA CONTROLS */}
          <Card className="p-4 space-y-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            {/* Frame Style Picker */}
            <div>
              <div className="flex items-center justify-between pb-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Film size={15} className="text-amber-500" />
                  1. Polaroid Çerçeve Stili
                </Label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'classic-600', name: 'Klasik 600', desc: 'Beyaz Orijinal' },
                  { id: 'vintage-tape', name: 'Washi Bant', desc: 'Vintage Çerçeve' },
                  { id: 'dark-onyx', name: 'Siyah Koyu', desc: 'Dark Edition' },
                  { id: 'sprocket-35mm', name: '35mm Film', desc: 'Sinema Delikli' },
                  { id: 'photobooth-strip', name: 'Foto Kabin', desc: '3 Dikey Kare' },
                  { id: 'scrapbook-heart', name: 'Romantik', desc: 'Damgalı Defter' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrameStyle(f.id as PolaroidFrameStyle)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      frameStyle === f.id
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                      {f.name}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-1">
                      {f.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets & Dithering */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-orange-500" />
                  2. Termal Fotoğraf Filtresi & Dither
                </Label>
              </div>

              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'portrait', label: '📸 Portre & Selfie' },
                  { id: 'landscape', label: '🌄 Manzara' },
                  { id: 'vintage', label: '☕ Nostalji Bayer' },
                  { id: 'sketch', label: '✏️ Karakalem' },
                  { id: 'newspaper', label: '📰 Gazete Nokta' },
                  { id: 'high-contrast', label: '⚡ Net Eşik' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id as PhotoPreset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      preset === p.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Detailed Dither & Font Selection */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Dithering Motoru
                  </Label>
                  <select
                    value={dithering}
                    onChange={(e) => {
                      setDithering(e.target.value as DitheringType);
                      setPreset('custom');
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="atkinson">✨ Atkinson (En İyi Foto Dither)</option>
                    <option value="floyd-steinberg">Floyd-Steinberg (Yumuşak Ton)</option>
                    <option value="bayer">Bayer Matrisi (Retro TV)</option>
                    <option value="jarvis-judice-ninke">Jarvis Judice Ninke</option>
                    <option value="dot-matrix">Nokta Matrisi (Halftone)</option>
                    <option value="sketch">Karakalem Çizim</option>
                    <option value="threshold">Siyah-Beyaz Sert Eşik</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Yazı Tipi & Karakter
                  </Label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value as any)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                  >
                    <option value="handwriting">✒️ Orijinal El Yazısı (Cursive)</option>
                    <option value="typewriter">📟 Daktilo (Monospace)</option>
                    <option value="serif">📜 Retro Kitap (Serif)</option>
                    <option value="sans">📱 Modern Minimal (Sans)</option>
                  </select>
                </div>
              </div>

              {/* Slider Adjustments */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Sun size={11} /> Parlaklık</span>
                    <span>{brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={brightness}
                    onChange={(e) => {
                      setBrightness(Number(e.target.value));
                      setPreset('custom');
                    }}
                    className="w-full mt-1 accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><ContrastIcon size={11} /> Kontrast</span>
                    <span>{contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="60"
                    value={contrast}
                    onChange={(e) => {
                      setContrast(Number(e.target.value));
                      setPreset('custom');
                    }}
                    className="w-full mt-1 accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><ZoomIn size={11} /> Yakınlaştır</span>
                    <span>{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full mt-1 accent-amber-600"
                  />
                </div>

                {/* Transform Buttons */}
                <div className="flex items-end gap-1.5">
                  <button
                    onClick={() => setRotation((prev) => ((prev + 90) % 360) as any)}
                    className="flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                    title="90° Döndür"
                  >
                    <RotateCw size={13} /> {rotation}°
                  </button>
                  <button
                    onClick={() => setMirror(!mirror)}
                    className={`h-8 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center ${
                      mirror
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700'
                    }`}
                    title="Aynala"
                  >
                    <FlipHorizontal size={13} />
                  </button>
                  <button
                    onClick={() => setInvert(!invert)}
                    className={`h-8 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center ${
                      invert
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-700'
                    }`}
                    title="Negatif Çevir"
                  >
                    Inv
                  </button>
                </div>
              </div>
            </div>

            {/* Captions, GPS & Stamps */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag size={15} className="text-amber-500" />
                3. Polaroid Notu, Tarih & Damga
              </Label>

              <div>
                <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Fotoğraf Notu / Başlık
                </Label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                  placeholder="Anı notu, özel gün veya mesaj..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Konum / Şehir
                    </Label>
                    <button
                      onClick={handleFetchLocation}
                      disabled={isGettingLocation}
                      className="text-[10px] text-amber-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Compass size={11} /> {isGettingLocation ? 'Alınıyor...' : 'GPS Çek'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
                    placeholder="İstanbul, TR"
                  />
                </div>

                <div>
                  <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Tarih & Saat Damgası
                  </Label>
                  <input
                    type="text"
                    value={dateTimeStr}
                    onChange={(e) => setDateTimeStr(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
                    placeholder="Tarih girin..."
                  />
                </div>
              </div>

              {/* Stamp Selection */}
              <div>
                <Label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Retro Damga & Çıkartma Metni
                </Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    'POLAROID ORIGINAL',
                    'MEMORIES • 2026',
                    'COFFEE & CHILL ☕',
                    'SPECIAL MOMENT ✨',
                    'LOVE & PEACE ❤️',
                    'TRAVEL VIBES ✈️'
                  ].map((stamp) => (
                    <button
                      key={stamp}
                      onClick={() => setSelectedStamp(stamp)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                        selectedStamp === stamp
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {stamp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Signature Pad Toggle */}
              <div className="pt-2">
                <button
                  onClick={() => setShowSignaturePad(!showSignaturePad)}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <PenTool size={13} />
                  {showSignaturePad ? 'İmza Padini Kapat' : '✍️ Polaroid Altına Gerçek İmza / Çizim Ekle'}
                </button>

                {showSignaturePad && (
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Aşağıdaki kutuya parmağınızla veya fareyle imzanızı / minik bir kalp çizin:
                    </p>
                    <div className="relative border border-slate-300 dark:border-slate-600 bg-white rounded-lg overflow-hidden h-24 flex items-center justify-center">
                      <canvas
                        ref={signatureCanvasRef}
                        width={300}
                        height={96}
                        onMouseDown={startDrawing}
                        onMouseUp={stopDrawing}
                        onMouseMove={draw}
                        onTouchStart={startDrawing}
                        onTouchEnd={stopDrawing}
                        onTouchMove={draw}
                        className="w-full h-full cursor-crosshair touch-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={clearSignature}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] font-bold"
                      >
                        <Eraser size={11} className="mr-1" /> Temizle
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Live Polaroid Canvas Preview & Print Actions */}
        <div className="lg:col-span-5 space-y-4 sticky top-4">
          <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-amber-500" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Önizleme
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
                  {pageWidth > 450 ? '80mm' : '58mm'}
                </span>
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={!previewUrl}
                  title="PNG İndir"
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Download size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleCopyImage}
                  disabled={!previewUrl}
                  title={copySuccess ? "Kopyalandı" : "Panoya Kopyala"}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {copySuccess ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {/* Hidden master canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Visual Screen Preview */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-950 p-4 flex justify-center items-center min-h-[380px] shadow-inner">
              {previewUrl ? (
                <div className="relative group">
                  <img
                    src={previewUrl}
                    alt="Polaroid Önizleme"
                    className="max-w-full h-auto object-contain rounded-md shadow-2xl border border-slate-400 dark:border-slate-700 transition-transform group-hover:scale-[1.01]"
                  />
                  {/* Subtle paper reflection effect */}
                  <div className="absolute inset-0 pointer-events-none rounded-md bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
                </div>
              ) : (
                <div className="text-center space-y-2 p-6">
                  <Camera size={36} className="mx-auto text-slate-400 animate-pulse" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Lütfen bir fotoğraf çekin veya galeriden yükleyin.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'camera'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Camera size={14} />
          <span>Kamera</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Upload size={14} />
          <span>Galeri</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('style')}
          disabled={!sourceImage}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
            activeTab === 'style'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders size={14} />
          <span>Ayar</span>
        </button>
      </div>
    </div>
  );
};
