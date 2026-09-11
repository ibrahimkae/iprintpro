import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Key,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Printer,
  Sparkles,
  ArrowLeft,
  Info,
  Sliders,
  FolderLock,
  Gift,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  WifiOff,
  Wifi,
  Coins,
  Edit3,
  Download
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import QRCode from 'qrcode';
import {
  generateColdWallet,
  formatInChunks,
  CryptoCoin,
  BtcAddressType,
  PaperWalletLayout,
  GeneratedWallet
} from '../utils/crypto-wallet';

export interface CryptoPaperWalletStudioProps {
  pageWidth: number; // in dots (e.g. 384 or 576)
  onPrintImage?: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export const CryptoPaperWalletStudio: React.FC<CryptoPaperWalletStudioProps> = ({
  pageWidth,
  onPrintImage,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}) => {
  // Config state
  const [coin, setCoin] = useState<CryptoCoin>('BTC');
  const [btcType, setBtcType] = useState<BtcAddressType>('segwit');
  const [layout, setLayout] = useState<PaperWalletLayout>('foldable');
  const [seedWordCount, setSeedWordCount] = useState<12 | 24>(12);
  const [walletLabel, setWalletLabel] = useState('SOĞUK KASA YEDEĞİ #1');
  const [giftAmount, setGiftAmount] = useState('0.005 BTC');
  const [giftRecipient, setGiftRecipient] = useState('Sevgili Kardeşim');

  // Security toggles
  const [maskPrivateKeyOnScreen, setMaskPrivateKeyOnScreen] = useState(true);
  const [printPublicOnly, setPrintPublicOnly] = useState(false);
  const [includeSealBorders, setIncludeSealBorders] = useState(true);
  const [includeVerificationHash, setIncludeVerificationHash] = useState(true);
  const [isManualInput, setIsManualInput] = useState(false);

  // Manual import inputs
  const [manualPublicAddress, setManualPublicAddress] = useState('');
  const [manualPrivateKey, setManualPrivateKey] = useState('');

  // Generated wallet data
  const [wallet, setWallet] = useState<GeneratedWallet>(() =>
    generateColdWallet('BTC', 'segwit', 12)
  );

  // Offline network detection
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : false
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  // Paper width selection
  const [paperWidthMm, setPaperWidthMm] = useState<58 | 80>(
    pageWidth > 450 ? 80 : 58
  );

  // Modern 3-Capsule Navigation: 'preview' (Önizleme & Yazdır), 'edit' (Cüzdan & Anahtarlar), 'template' (Şablon & Güvenlik)
  const [activeMainTab, setActiveMainTab] = useState<'preview' | 'edit' | 'template'>('preview');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Regenerate when coin or types change (unless in manual input mode)
  const handleGenerateNew = () => {
    const newWallet = generateColdWallet(coin, btcType, seedWordCount);
    setWallet(newWallet);
  };

  useEffect(() => {
    if (!isManualInput) {
      handleGenerateNew();
    }
  }, [coin, btcType, seedWordCount, isManualInput]);

  // If manual input changes
  useEffect(() => {
    if (isManualInput) {
      setWallet((prev) => ({
        ...prev,
        coin,
        publicAddress: manualPublicAddress || prev.publicAddress,
        privateKey: manualPrivateKey || prev.privateKey,
        privateKeyWif: manualPrivateKey || prev.privateKeyWif
      }));
    }
  }, [manualPublicAddress, manualPrivateKey, isManualInput, coin]);

  // -------------------------------------------------------------------------
  // RENDER CANVAS LOGIC (PIXEL PERFECT FOR 58mm / 80mm THERMAL PRINTERS)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetWidth = paperWidthMm === 80 ? 576 : 384;
    const is80mm = paperWidthMm === 80;

    // Helper: Draw helper text with wrapping
    const drawWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      font: string,
      color = '#000000',
      align: CanvasTextAlign = 'center'
    ): number => {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;

      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
      return currentY + lineHeight;
    };

    // Async canvas builder
    const renderWalletCanvas = async () => {
      // Calculate dynamic height based on layout
      let estHeight = 700;
      if (layout === 'foldable') estHeight = is80mm ? 860 : 790;
      else if (layout === 'seed_card') estHeight = (wallet.mnemonicWords?.length || 12) === 24 ? 920 : 780;
      else if (layout === 'gift_card') estHeight = 840;
      else if (layout === 'vault_certificate') estHeight = 880;

      if (printPublicOnly && layout !== 'seed_card') {
        estHeight -= is80mm ? 320 : 280;
      }

      canvas.width = targetWidth;
      canvas.height = estHeight;

      // Clean white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, estHeight);

      // Frame & Outer border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(6, 6, targetWidth - 12, estHeight - 12);

      let curY = 24;

      // -------------------------------------------------------------
      // HEADER: BADGE & TITLE
      // -------------------------------------------------------------
      // Top header banner box
      ctx.fillStyle = '#000000';
      ctx.fillRect(12, curY, targetWidth - 24, 34);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      const headerTitle =
        layout === 'seed_card'
          ? '🔑 BIP-39 KURTARMA TOHUM KARTI'
          : layout === 'gift_card'
          ? '🎁 KRİPTO HEDİYE & BAHŞİŞ ÇEKİ'
          : layout === 'vault_certificate'
          ? '🏦 SOĞUK KASA DEPOLAMA SERTİFİKASI'
          : '🛡️ KRİPTO SOĞUK KAĞIT CÜZDAN';

      ctx.fillText(headerTitle, targetWidth / 2, curY + 22);
      curY += 46;

      // Sub-header info: Coin & Label
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${wallet.coinName} (${wallet.symbol})`, targetWidth / 2, curY);
      curY += 18;

      if (walletLabel) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(`Etiket: ${walletLabel}`, targetWidth / 2, curY);
        curY += 16;
      }

      ctx.font = '9px monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText(`Tarih: ${wallet.createdAt} | Seri: ${wallet.vaultSerial}`, targetWidth / 2, curY);
      curY += 16;

      // Top divider
      ctx.setLineDash([4, 2]);
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(16, curY);
      ctx.lineTo(targetWidth - 16, curY);
      ctx.stroke();
      ctx.setLineDash([]);
      curY += 14;

      // -------------------------------------------------------------
      // LAYOUT SPECIFIC RENDERING
      // -------------------------------------------------------------

      if (layout === 'seed_card') {
        // --- 12 / 24 WORD SEED CARD ---
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GİZLİ KURTARMA CÜMLESİ (MNEMONIC SEED)', targetWidth / 2, curY);
        curY += 14;

        ctx.font = 'italic 9px sans-serif';
        ctx.fillStyle = '#444444';
        ctx.fillText('Bu 12/24 kelimeyi sırasıyla güvenli donanım cüzdanına girin.', targetWidth / 2, curY);
        curY += 16;

        const words = wallet.mnemonicWords || [];
        const cols = is80mm ? 3 : 2;
        const colWidth = (targetWidth - 32) / cols;
        const rowHeight = 28;
        const startX = 16;

        for (let i = 0; i < words.length; i++) {
          const colIndex = i % cols;
          const rowIndex = Math.floor(i / cols);
          const bx = startX + colIndex * colWidth;
          const by = curY + rowIndex * rowHeight;

          // Box border
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 2, by + 2, colWidth - 4, rowHeight - 4);

          // Word number tag
          ctx.fillStyle = '#000000';
          ctx.fillRect(bx + 3, by + 3, 24, rowHeight - 6);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText((i + 1).toString().padStart(2, '0'), bx + 15, by + 18);

          // Word text
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(words[i], bx + 32, by + 18);
        }

        const totalRows = Math.ceil(words.length / cols);
        curY += totalRows * rowHeight + 14;

        // Public address verification section
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(16, curY);
        ctx.lineTo(targetWidth - 16, curY);
        ctx.stroke();
        ctx.setLineDash([]);
        curY += 16;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HESAP / YOL DOĞRULAMA (WATCH-ONLY)', targetWidth / 2, curY);
        curY += 14;

        // Generate QR code for public address
        const qrCanvas = document.createElement('canvas');
        await QRCode.toCanvas(qrCanvas, wallet.publicAddress, {
          width: is80mm ? 130 : 110,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
        const qrX = (targetWidth - qrCanvas.width) / 2;
        ctx.drawImage(qrCanvas, qrX, curY);
        curY += qrCanvas.height + 10;

        ctx.font = '9px monospace';
        ctx.fillStyle = '#000000';
        curY = drawWrappedText(
          formatInChunks(wallet.publicAddress, is80mm ? 6 : 4),
          targetWidth / 2,
          curY,
          targetWidth - 32,
          12,
          'bold 9px monospace'
        );

        if (wallet.derivationPath) {
          ctx.font = '8px sans-serif';
          ctx.fillStyle = '#555555';
          ctx.fillText(`Türetme Yolu: ${wallet.derivationPath}`, targetWidth / 2, curY);
          curY += 14;
        }
      } else if (layout === 'gift_card') {
        // --- CRYPTO GIFT & TIP CERTIFICATE ---
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Kime: ${giftRecipient}`, targetWidth / 2, curY);
        curY += 16;

        // Big Amount Banner Box
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, curY, targetWidth - 40, 44);

        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#000000';
        ctx.fillText(giftAmount || '0.005 BTC', targetWidth / 2, curY + 28);
        curY += 56;

        // Deposit QR (Public)
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('YATIRMA / BAKİYE SORGULAMA ADRESİ', targetWidth / 2, curY);
        curY += 12;

        const qrCanvas = document.createElement('canvas');
        await QRCode.toCanvas(qrCanvas, wallet.publicAddress, {
          width: is80mm ? 140 : 120,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
        ctx.drawImage(qrCanvas, (targetWidth - qrCanvas.width) / 2, curY);
        curY += qrCanvas.height + 10;

        ctx.font = '9px monospace';
        curY = drawWrappedText(
          formatInChunks(wallet.publicAddress, is80mm ? 6 : 4),
          targetWidth / 2,
          curY,
          targetWidth - 32,
          12,
          'bold 9px monospace'
        );

        curY += 8;

        // How to redeem instructions
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(16, curY, targetWidth - 32, 60);
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(16, curY, targetWidth - 32, 60);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('💡 Bakiyeyi Nasıl Cüzdanınıza Aktarırsınız?', 22, curY + 14);
        ctx.font = '8px sans-serif';
        ctx.fillText('1. Trust Wallet, MetaMask veya Exodus uygulamasını açın.', 22, curY + 28);
        ctx.fillText('2. "Cüzdanı İçe Aktar / Özel Anahtar Tara" seçeneğine tıklayın.', 22, curY + 40);
        ctx.fillText('3. Aşağıdaki gizli harcama QR kodunu okutarak bakiyeyi çekin.', 22, curY + 52);
        curY += 72;

        if (!printPublicOnly) {
          // Fold line
          ctx.setLineDash([5, 3]);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(12, curY);
          ctx.lineTo(targetWidth - 12, curY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✂️ GİZLİ HARCAMA ALANI (BURADAN KATLAYIP KAPATIN) ✂️', targetWidth / 2, curY - 4);
          curY += 16;

          // Private key section
          const privKeyCanvas = document.createElement('canvas');
          const privData = wallet.privateKeyWif || wallet.privateKey;
          await QRCode.toCanvas(privKeyCanvas, privData, {
            width: is80mm ? 120 : 100,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          ctx.drawImage(privKeyCanvas, (targetWidth - privKeyCanvas.width) / 2, curY);
          curY += privKeyCanvas.height + 8;

          ctx.font = 'bold 8px monospace';
          curY = drawWrappedText(
            formatInChunks(privData, is80mm ? 6 : 4),
            targetWidth / 2,
            curY,
            targetWidth - 32,
            11,
            'bold 8px monospace'
          );
        }
      } else if (layout === 'vault_certificate') {
        // --- EXECUTIVE VAULT CERTIFICATE ---
        // Double QR Side-by-side or stacked
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GENEL HESAP ADRESİ (RECEIVE ONLY)', targetWidth / 2, curY);
        curY += 12;

        const pubCanvas = document.createElement('canvas');
        await QRCode.toCanvas(pubCanvas, wallet.publicAddress, {
          width: is80mm ? 130 : 110,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
        ctx.drawImage(pubCanvas, (targetWidth - pubCanvas.width) / 2, curY);
        curY += pubCanvas.height + 8;

        ctx.font = '9px monospace';
        curY = drawWrappedText(
          formatInChunks(wallet.publicAddress, is80mm ? 6 : 4),
          targetWidth / 2,
          curY,
          targetWidth - 32,
          12,
          'bold 9px monospace'
        );

        curY += 8;

        if (!printPublicOnly) {
          // Security seal bar
          ctx.fillStyle = '#000000';
          ctx.fillRect(16, curY, targetWidth - 32, 22);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔒 GİZLİ HARCAMA ANAHTARI (PRIVATE SPEND KEY)', targetWidth / 2, curY + 15);
          curY += 30;

          const privCanvas = document.createElement('canvas');
          const privData = wallet.privateKeyWif || wallet.privateKey;
          await QRCode.toCanvas(privCanvas, privData, {
            width: is80mm ? 130 : 110,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          ctx.drawImage(privCanvas, (targetWidth - privCanvas.width) / 2, curY);
          curY += privCanvas.height + 8;

          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#000000';
          curY = drawWrappedText(
            formatInChunks(privData, is80mm ? 6 : 4),
            targetWidth / 2,
            curY,
            targetWidth - 32,
            11,
            'bold 8px monospace'
          );

          curY += 12;
        }

        // Dual Signature Boxes
        const sigBoxWidth = (targetWidth - 44) / 2;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // Sig 1
        ctx.strokeRect(18, curY, sigBoxWidth, 42);
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Kasa Sorumlusu 1 (İmza)', 18 + sigBoxWidth / 2, curY + 12);

        // Sig 2
        ctx.strokeRect(26 + sigBoxWidth, curY, sigBoxWidth, 42);
        ctx.fillText('Kasa Sorumlusu 2 (İmza / Mühür)', 26 + sigBoxWidth + sigBoxWidth / 2, curY + 12);
        curY += 50;
      } else {
        // --- 1. DEFAULT: FOLDABLE PRIVACY VAULT WALLET ---
        // SECTION 1: PUBLIC ADDRESS (TOP HALF)
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GENEL ADRES (YATIRMA / BAKIYE SORGULA)', targetWidth / 2, curY);
        curY += 12;

        const pubQrCanvas = document.createElement('canvas');
        await QRCode.toCanvas(pubQrCanvas, wallet.publicAddress, {
          width: is80mm ? 150 : 130,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
        const pubX = (targetWidth - pubQrCanvas.width) / 2;
        ctx.drawImage(pubQrCanvas, pubX, curY);
        curY += pubQrCanvas.height + 10;

        ctx.font = '9px monospace';
        ctx.fillStyle = '#000000';
        curY = drawWrappedText(
          formatInChunks(wallet.publicAddress, is80mm ? 6 : 4),
          targetWidth / 2,
          curY,
          targetWidth - 32,
          12,
          'bold 9px monospace'
        );

        ctx.font = '8px sans-serif';
        ctx.fillStyle = '#555555';
        ctx.fillText('Bu adresi para transferi ve bağış almak için paylaşabilirsiniz.', targetWidth / 2, curY);
        curY += 16;

        if (!printPublicOnly) {
          // SECTION 2: FOLD & SEAL LINE
          curY += 4;
          ctx.setLineDash([6, 3]);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(12, curY);
          ctx.lineTo(targetWidth - 12, curY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.fillText('✂️ ---------------- GİZLİLİK KATLAMA ÇİZGİSİ ---------------- ✂️', targetWidth / 2, curY - 5);
          ctx.font = 'italic 8px sans-serif';
          ctx.fillText('Buradan arkaya katlayarak yapışkanlı bant ile mühürleyin.', targetWidth / 2, curY + 12);
          curY += 24;

          // SECTION 3: PRIVATE KEY (BOTTOM HALF)
          // Security Alert Warning Box
          ctx.fillStyle = '#000000';
          ctx.fillRect(16, curY, targetWidth - 32, 22);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ GİZLİ HARCAMA ANAHTARI (PRIVATE KEY) - KİMSEYLE PAYLAŞMAYIN', targetWidth / 2, curY + 15);
          curY += 28;

          const privQrCanvas = document.createElement('canvas');
          const privateData = wallet.privateKeyWif || wallet.privateKey;
          await QRCode.toCanvas(privQrCanvas, privateData, {
            width: is80mm ? 140 : 120,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          const privX = (targetWidth - privQrCanvas.width) / 2;
          ctx.drawImage(privQrCanvas, privX, curY);
          curY += privQrCanvas.height + 10;

          ctx.font = '8px monospace';
          ctx.fillStyle = '#000000';
          curY = drawWrappedText(
            formatInChunks(privateData, is80mm ? 6 : 4),
            targetWidth / 2,
            curY,
            targetWidth - 32,
            11,
            'bold 8px monospace'
          );

          if (includeSealBorders) {
            // Scratch / Seal guidance box
            ctx.strokeStyle = '#666666';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(20, curY, targetWidth - 40, 24);
            ctx.setLineDash([]);
            ctx.font = 'italic 8px sans-serif';
            ctx.fillStyle = '#555555';
            ctx.fillText('🔒 Kazı-Kazan / Güvenlik Mühür Bandı Alanı', targetWidth / 2, curY + 16);
            curY += 30;
          }
        }
      }

      // -------------------------------------------------------------
      // FOOTER: CHECKSUM & AIR-GAP GUARANTEE
      // -------------------------------------------------------------
      if (includeVerificationHash) {
        ctx.setLineDash([1, 1]);
        ctx.strokeStyle = '#CCCCCC';
        ctx.beginPath();
        ctx.moveTo(20, curY);
        ctx.lineTo(targetWidth - 20, curY);
        ctx.stroke();
        ctx.setLineDash([]);
        curY += 12;

        ctx.font = '8px monospace';
        ctx.fillStyle = '#777777';
        ctx.textAlign = 'center';
        ctx.fillText(
          `Doğrulama SHA-256: [${wallet.checksum}] | 100% Çevrimdışı İstemci Üretimi`,
          targetWidth / 2,
          curY
        );
        curY += 12;
      }
    };

    renderWalletCanvas();
  }, [
    wallet,
    layout,
    paperWidthMm,
    walletLabel,
    giftAmount,
    giftRecipient,
    printPublicOnly,
    includeSealBorders,
    includeVerificationHash
  ]);

  // -------------------------------------------------------------------------
  // PRINT ACTION HANDLERS
  // -------------------------------------------------------------------------
  const handlePrint = (isDirect = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const docTitle = `Kripto_Cuzdan_${wallet.symbol}_${wallet.vaultSerial}`;

    if (isDirect && onDirectPrint) {
      onDirectPrint(dataUrl, docTitle, paperWidthMm);
    } else if (onPreviewAndPrint) {
      onPreviewAndPrint(dataUrl, docTitle, paperWidthMm);
    } else if (onPrintImage) {
      onPrintImage(dataUrl, docTitle, paperWidthMm);
    }
  };

  const handleCopy = (text: string, isKey = false) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  const cryptoLayoutOptions: { id: PaperWalletLayout; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'foldable', label: 'Kasa', icon: FolderLock },
    { id: 'gift_card', label: 'Hediye', icon: Gift },
    { id: 'seed_card', label: 'Tohum', icon: Key },
    { id: 'vault_certificate', label: 'Sertifika', icon: FileCheck },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-24 animate-in fade-in duration-300">
      {/* 1. Header Bar: Compact & Minimalist */}
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
            {cryptoLayoutOptions.map((opt) => {
              const isSelected = layout === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayout(opt.id)}
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
            className="h-8 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Printer size={14} />
            <span>Yazdır</span>
          </Button>
        </div>
      </div>

      {/* TAB 1: PREVIEW & DIRECT PRINT */}
      {activeMainTab === 'preview' && (
        <div className="space-y-4">
          {/* Quick 1-Click Layout Format Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'foldable', name: '🛡️ Katlanabilir Kasa' },
              { id: 'seed_card', name: '🔑 Tohum Kartı' },
              { id: 'gift_card', name: '🎁 Hediye Çeki' },
              { id: 'vault_certificate', name: '🏦 Kasa Sertifikası' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setLayout(t.id as PaperWalletLayout)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  layout === t.id
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Centered Live Thermal Receipt Preview */}
          <Card className="p-4 rounded-3xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="flex flex-wrap items-center justify-between w-full max-w-md px-1 gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                <QrCode size={14} className="text-amber-500" />
                <span>Termal Kağıt Önizlemesi ({paperWidthMm}mm / {coin})</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateNew}
                  className="h-7 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 rounded-lg gap-1"
                >
                  <RefreshCw size={12} />
                  Yeni Üret
                </Button>
              </div>
            </div>

            <div className="w-full overflow-x-auto flex justify-center py-2">
              <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 max-w-full">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto object-contain block mx-auto rounded"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: EDIT WALLET & KEYS */}
      {activeMainTab === 'edit' && (
        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kripto Varlık & Format Seçimi
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateNew}
                className="h-8 text-xs gap-1.5 rounded-xl border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300"
              >
                <RefreshCw size={13} />
                🎲 Yeni Cüzdan Üret (CSPRNG)
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Coin Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kripto Para Birimi
                </Label>
                <Select value={coin} onValueChange={(val) => setCoin(val as CryptoCoin)}>
                  <SelectTrigger className="h-9 rounded-xl text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">⟠ Ethereum & EVM (ETH, USDT, BNB)</SelectItem>
                    <SelectItem value="SOL">◎ Solana (SOL)</SelectItem>
                    <SelectItem value="DOGE">Ð Dogecoin (DOGE)</SelectItem>
                    <SelectItem value="LTC">Ł Litecoin (LTC)</SelectItem>
                    <SelectItem value="BIP39">🔑 BIP-39 Kurtarma Cümlesi (12/24 Kelime)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub-options for Bitcoin or BIP-39 */}
            {coin === 'BTC' && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bitcoin Adres Formatı
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={btcType === 'segwit' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBtcType('segwit')}
                    className="h-8 text-[11px] rounded-xl"
                  >
                    Native SegWit (bc1q)
                  </Button>
                  <Button
                    type="button"
                    variant={btcType === 'legacy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBtcType('legacy')}
                    className="h-8 text-[11px] rounded-xl"
                  >
                    Legacy (1...)
                  </Button>
                  <Button
                    type="button"
                    variant={btcType === 'taproot' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBtcType('taproot')}
                    className="h-8 text-[11px] rounded-xl"
                  >
                    Taproot (bc1p)
                  </Button>
                </div>
              </div>
            )}

            {coin === 'BIP39' && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kelime Uzunluğu
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={seedWordCount === 12 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeedWordCount(12)}
                    className="h-8 text-xs rounded-xl"
                  >
                    12 Kelimelik Standart Tohum
                  </Button>
                  <Button
                    type="button"
                    variant={seedWordCount === 24 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeedWordCount(24)}
                    className="h-8 text-xs rounded-xl"
                  >
                    24 Kelimelik Yüksek Güvenlik
                  </Button>
                </div>
              </div>
            )}

            {/* Custom Label & Gift options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cüzdan Başlığı / Etiket
                </Label>
                <Input
                  value={walletLabel}
                  onChange={(e) => setWalletLabel(e.target.value)}
                  placeholder="Örn: Ledger Ana Yedek #1"
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              {layout === 'gift_card' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Hediye Miktarı / Bakiye
                  </Label>
                  <Input
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                    placeholder="Örn: 0.005 BTC veya 100 USDT"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Generated Keys & Verification Data */}
          <Card className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Üretilen Anahtarlar & Doğrulama
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMaskPrivateKeyOnScreen(!maskPrivateKeyOnScreen)}
                className="h-7 text-xs gap-1 text-slate-500"
              >
                {maskPrivateKeyOnScreen ? <Eye size={13} /> : <EyeOff size={13} />}
                {maskPrivateKeyOnScreen ? 'Gizliyi Göster' : 'Gizle'}
              </Button>
            </div>

            {/* Public Address Block */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Genel Yatırma Adresi (Public / Receive):
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(wallet.publicAddress, false)}
                  className="h-6 text-[10px] px-2 text-slate-500"
                >
                  <Copy size={11} className="mr-1" />
                  {copiedAddr ? 'Kopyalandı!' : 'Kopyala'}
                </Button>
              </div>
              <div className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all select-all">
                {wallet.publicAddress}
              </div>
            </div>

            {/* Private Key / Mnemonic Block */}
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Lock size={12} />
                  {coin === 'BIP39'
                    ? 'Gizli Kurtarma Kelimeleri (Mnemonic):'
                    : 'Gizli Harcama Anahtarı (Private Key / WIF):'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(wallet.privateKeyWif || wallet.privateKey, true)}
                  className="h-6 text-[10px] px-2 text-amber-700 dark:text-amber-300"
                >
                  <Copy size={11} className="mr-1" />
                  {copiedKey ? 'Kopyalandı!' : 'Kopyala'}
                </Button>
              </div>
              <div className="font-mono text-xs font-bold text-amber-950 dark:text-amber-100 break-all select-all">
                {maskPrivateKeyOnScreen ? (
                  <span className="tracking-widest">
                    •••• •••• •••• •••• •••• •••• •••• ••••
                  </span>
                ) : (
                  wallet.privateKeyWif || wallet.privateKey
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: TEMPLATE & SECURITY */}
      {activeMainTab === 'template' && (
        <div className="space-y-4">
          <Card className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-amber-500" />
              1. Şablon & Kağıt Ayarları
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'foldable', name: '🛡️ Katlanabilir Kasa', desc: 'Gizli anahtar katlama çizgisiyle arkada kalır' },
                { id: 'seed_card', name: '🔑 Tohum Kartı', desc: '12/24 BIP39 kelime ızgarası' },
                { id: 'gift_card', name: '🎁 Hediye Çeki', desc: 'Kripto bahşiş & hediye kuponu' },
                { id: 'vault_certificate', name: '🏦 Kasa Sertifikası', desc: 'Çift QR resmi depolama belgesi' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setLayout(t.id as PaperWalletLayout)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    layout === t.id
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{t.desc}</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kağıt Rulo Genişliği
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={paperWidthMm === 58 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaperWidthMm(58)}
                    className="h-9 text-xs rounded-xl"
                  >
                    58 mm (384px)
                  </Button>
                  <Button
                    type="button"
                    variant={paperWidthMm === 80 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaperWidthMm(80)}
                    className="h-9 text-xs rounded-xl"
                  >
                    80 mm (576px)
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Options Toggles */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printPublicOnly}
                  onChange={(e) => setPrintPublicOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                />
                <span className="font-medium">
                  Yalnızca Genel Adresi Bas (Watch-Only / Bağış ve Bakiye Yükleme Fişi)
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSealBorders}
                  onChange={(e) => setIncludeSealBorders(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700"
                />
                <span className="font-medium">
                  Katlama ve Güvenlik Mühür Kılavuzu Çizgilerini Ekle
                </span>
              </label>
            </div>
          </Card>

          {/* Offline Air-Gap Security Card */}
          <Card className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
              <h4 className="font-bold text-xs">Sıfır Ağ İletimi & Kriptografik Güvenlik</h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tüm özel anahtarlar tarayıcınızın donanımsal rastgele sayı üreticisi (<code>window.crypto.getRandomValues</code>) ile tamamen yerel ve çevrimdışı üretilir. Hiçbir sunucuya veri gönderilmez.
            </p>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300 space-y-1">
              <div className="font-semibold text-amber-300">📌 Termal Kağıt Cüzdan Saklama Tavsiyeleri:</div>
              <div>• Termal kağıdı direkt güneş ışığından ve yüksek ısı kaynaklarından koruyunuz.</div>
              <div>• Uzun vadeli saklama için kağıdı opak bir soğuk kasa zarfında veya laminasyon kılıfında muhafaza edin.</div>
            </div>
          </Card>
        </div>
      )}

      {/* FLOATING BOTTOM CAPSULE NAVIGATION BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveMainTab('preview')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeMainTab === 'preview'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Baskı Önizleme"
        >
          <Eye size={15} className="shrink-0" />
          {activeMainTab === 'preview' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Önizleme</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('edit')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeMainTab === 'edit'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Cüzdan Bilgileri"
        >
          <Edit3 size={15} className="shrink-0" />
          {activeMainTab === 'edit' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Cüzdan</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('template')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeMainTab === 'template'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Güvenlik & Şablon"
        >
          <ShieldCheck size={15} className="shrink-0" />
          {activeMainTab === 'template' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Güvenlik</span>
          )}
        </button>
      </div>
    </div>
  );
};
