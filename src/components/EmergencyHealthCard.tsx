import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, 
  Phone, 
  AlertTriangle, 
  Printer, 
  Sparkles, 
  QrCode, 
  Check, 
  Download, 
  ShieldAlert,
  Droplet,
  Car,
  Copy,
  RefreshCw,
  Eye,
  Activity,
  ShieldCheck,
  BadgeAlert,
  User,
  Barcode,
  Layers,
  ZoomIn,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import QRCode from 'qrcode';

export interface EmergencyHealthCardProps {
  pageWidth: number;
  onPrintImage: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => Promise<void>;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export type HealthCardLayout = 'compact-large' | 'blood-focus' | 'medical-full' | 'vehicle-sticker';
export type BarcodeType = 'qr-large' | 'code128-barcode' | 'none';

export interface BloodTypeInfo {
  type: string;
  badge: string;
  spelling: string;
  giveTo: string;
  takeFrom: string;
}

const BLOOD_TYPES_INFO: BloodTypeInfo[] = [
  { type: 'A Rh(+)', badge: 'A+', spelling: 'A Pozitif', giveTo: 'A+, AB+', takeFrom: 'A+, A-, 0+, 0-' },
  { type: 'A Rh(-)', badge: 'A-', spelling: 'A Negatif', giveTo: 'A+, A-, AB+, AB-', takeFrom: 'A-, 0-' },
  { type: 'B Rh(+)', badge: 'B+', spelling: 'B Pozitif', giveTo: 'B+, AB+', takeFrom: 'B+, B-, 0+, 0-' },
  { type: 'B Rh(-)', badge: 'B-', spelling: 'B Negatif', giveTo: 'B+, B-, AB+, AB-', takeFrom: 'B-, 0-' },
  { type: 'AB Rh(+)', badge: 'AB+', spelling: 'AB Pozitif (Genel Alıcı)', giveTo: 'AB+', takeFrom: 'TÜMÜNDEN ALIR' },
  { type: 'AB Rh(-)', badge: 'AB-', spelling: 'AB Negatif', giveTo: 'AB+, AB-', takeFrom: 'AB-, A-, B-, 0-' },
  { type: '0 Rh(+)', badge: '0+', spelling: 'Sıfır Pozitif', giveTo: '0+, A+, B+, AB+', takeFrom: '0+, 0-' },
  { type: '0 Rh(-)', badge: '0-', spelling: 'Sıfır Negatif (Genel Verici)', giveTo: 'TÜMÜNE VERİR', takeFrom: 'Sadece 0-' },
  { type: 'Bilinmiyor', badge: '?', spelling: 'Bilinmiyor', giveTo: 'Test Edilmeli', takeFrom: 'Test Edilmeli' }
];

export const EmergencyHealthCard: React.FC<EmergencyHealthCardProps> = ({
  pageWidth,
  onPrintImage,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}) => {
  // Layout mode designed specifically for 57mm thermal paper
  const [layoutMode, setLayoutMode] = useState<HealthCardLayout>('compact-large');
  const [barcodeType, setBarcodeType] = useState<BarcodeType>('qr-large');
  const [fontScale, setFontScale] = useState<'standard' | 'extra-large'>('extra-large');
  
  // Personal Info
  const [fullName, setFullName] = useState('AHMET YILMAZ');
  const [bloodType, setBloodType] = useState('A Rh(+)');
  const [birthYear, setBirthYear] = useState('1990');
  const [tcNo, setTcNo] = useState('12345678901');
  const [vehiclePlate, setVehiclePlate] = useState('34 ABC 789');

  // Emergency Contact 1 (Primary)
  const [contact1Name, setContact1Name] = useState('Zeynep Yılmaz');
  const [contact1Relation, setContact1Relation] = useState('Eşi');
  const [contact1Phone, setContact1Phone] = useState('0532 555 1234');

  // Emergency Contact 2 (Secondary)
  const [contact2Name, setContact2Name] = useState('Mehmet Yılmaz');
  const [contact2Relation, setContact2Relation] = useState('Kardeşi');
  const [contact2Phone, setContact2Phone] = useState('0542 444 5678');

  // Medical Alert Info
  const [allergies, setAllergies] = useState('PENİSİLİN, ASPİRİN');
  const [chronicDiseases, setChronicDiseases] = useState('Tip 1 Diyabet');
  const [regularMedications, setRegularMedications] = useState('İnsülin');
  const [donorStatus, setDonorStatus] = useState('Organ Bağışçısıdır');

  // Toggles
  const [showCompatibility, setShowCompatibility] = useState<boolean>(true);
  const [showCutGuide, setShowCutGuide] = useState<boolean>(true);
  const [cardSerial, setCardSerial] = useState<string>('ICE-57-89410');

  // Capsule Navigation & Accordion State
  const [activeBottomTab, setActiveBottomTab] = useState<'preview' | 'edit' | 'types'>('preview');
  const [expandedSection, setExpandedSection] = useState<'info' | 'contacts' | 'medical' | 'settings'>('info');

  // Canvas & Preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const regenerateSerial = () => {
    const r = Math.floor(10000 + Math.random() * 90000);
    setCardSerial(`ICE-57-${r}`);
  };

  // Helper to compute QR string
  const computeQrText = useCallback(() => {
    return `ACİL SAĞLIK KARTI (ICE)\nAd: ${fullName}\nKAN GRUBU: ${bloodType}\nDoğum: ${birthYear || '-'}\nTC: ${tcNo || '-'}\n1.YAKIN: ${contact1Name} (${contact1Relation}) ${contact1Phone}\n${contact2Phone ? `2.YAKIN: ${contact2Name} (${contact2Relation}) ${contact2Phone}\n` : ''}${allergies ? `ALERJİLER: ${allergies}\n` : ''}${chronicDiseases ? `KRONİK: ${chronicDiseases}\n` : ''}${regularMedications ? `İLAÇLAR: ${regularMedications}\n` : ''}${donorStatus ? `BAĞIŞ: ${donorStatus}` : ''}`;
  }, [fullName, bloodType, birthYear, tcNo, contact1Name, contact1Relation, contact1Phone, contact2Name, contact2Relation, contact2Phone, allergies, chronicDiseases, regularMedications, donorStatus]);

  // Code128 simple barcode renderer to canvas
  const drawCode128Barcode = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number) => {
    // Clean alphanumeric text
    const cleanText = text.replace(/[^0-9A-Za-z-]/g, '').toUpperCase() || 'ICE123456';
    
    // Draw pseudorandom deterministic barcode pattern with guard bars
    const barCount = 70;
    const barWidth = width / barCount;
    
    ctx.fillStyle = '#000000';
    // Start guards
    ctx.fillRect(x, y, barWidth * 2, height);
    ctx.fillRect(x + barWidth * 3, y, barWidth * 1.5, height);
    
    let hash = 0;
    for (let i = 0; i < cleanText.length; i++) {
      hash = (hash << 5) - hash + cleanText.charCodeAt(i);
      hash |= 0;
    }
    
    for (let i = 6; i < barCount - 6; i++) {
      const bit = ((hash >> (i % 31)) & 1) ^ (i % 3 === 0 ? 1 : 0);
      if (bit === 1 || i % 4 === 1) {
        ctx.fillRect(x + (i * barWidth), y, barWidth * 0.9, height);
      }
    }
    
    // End guards
    ctx.fillRect(x + width - (barWidth * 4.5), y, barWidth * 1.5, height);
    ctx.fillRect(x + width - (barWidth * 2), y, barWidth * 2, height);
    
    // Barcode text below
    ctx.font = `bold 10px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`* ${cleanText} *`, x + (width / 2), y + height + 12);
  };

  // ---------------- ULTRA-READABLE 57MM CANVAS RENDER ENGINE ---------------- //
  const renderHealthCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Target width: 384 for 57mm, 576 for 80mm
    const targetW = pageWidth || 384;
    const is80mm = targetW > 450;
    const ratio = is80mm ? 1.45 : 1.0;
    const fontMul = fontScale === 'extra-large' ? 1.12 : 1.0;

    const margin = Math.round(8 * ratio);
    const contentW = targetW - (margin * 2);

    // Calculate height dynamically based on layout
    let totalH = 560;
    if (layoutMode === 'compact-large') totalH = 580;
    else if (layoutMode === 'blood-focus') totalH = 520;
    else if (layoutMode === 'medical-full') totalH = 690;
    else if (layoutMode === 'vehicle-sticker') totalH = 560;

    if (barcodeType === 'qr-large') totalH += 100;
    if (barcodeType === 'code128-barcode') totalH += 30;
    if (is80mm) totalH = Math.round(totalH * ratio);

    canvas.width = targetW;
    canvas.height = totalH;

    // 1. Crisp White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, totalH);

    // 2. High-Impact Outer Border (Thick 3px + 1px Inner)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(3, 3, targetW - 6, totalH - 6);

    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, targetW - 12, totalH - 12);

    let y = 10;

    // 3. TOP EMERGENCY HEADER (Massive Solid Black Box)
    const headerH = Math.round(40 * ratio);
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, y, targetW - 16, headerH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `black ${Math.round(15 * ratio * fontMul)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText('🚨 ACİL SAĞLIK KARTI (ICE) 🚨', targetW / 2, y + Math.round(19 * ratio));

    ctx.font = `bold ${Math.round(9 * ratio)}px system-ui, sans-serif`;
    ctx.fillText('EMERGENCY MEDICAL IDENTIFICATION', targetW / 2, y + Math.round(33 * ratio));

    y += headerH + 8;

    // 4. 🩸 MASSIVE BLOOD TYPE CENTERPIECE (DEV KAN GRUBU BLOĞU)
    const bloodH = Math.round(76 * ratio);
    
    // Solid Black Badge for Blood Type
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin, y, contentW, bloodH);

    // Inverted Header inside Blood Box
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(11 * ratio)}px system-ui, sans-serif`;
    ctx.fillText('🩸 KAN GRUBU / BLOOD TYPE 🩸', targetW / 2, y + Math.round(18 * ratio));

    // GIANT BLOOD TYPE VALUE (Ultra Clear)
    ctx.font = `black ${Math.round(34 * ratio * fontMul)}px "Arial Black", system-ui, sans-serif`;
    ctx.fillText(bloodType, targetW / 2, y + Math.round(52 * ratio));

    // Spelling Sub-text (e.g. "A Pozitif")
    const foundBlood = BLOOD_TYPES_INFO.find(b => b.type === bloodType) || BLOOD_TYPES_INFO[0];
    ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
    ctx.fillText(`[ ${foundBlood.spelling.toUpperCase()} ]`, targetW / 2, y + Math.round(68 * ratio));

    y += bloodH + 6;

    // Blood Compatibility Strip (Optional)
    if (showCompatibility && (layoutMode === 'compact-large' || layoutMode === 'blood-focus' || layoutMode === 'medical-full')) {
      const compH = Math.round(22 * ratio);
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(margin, y, contentW, compH);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin, y, contentW, compH);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(8.5 * ratio)}px system-ui, sans-serif`;
      ctx.fillText(`⚡ Verir: ${foundBlood.giveTo} | Alır: ${foundBlood.takeFrom}`, targetW / 2, y + Math.round(15 * ratio));

      y += compH + 8;
    }

    // 5. 👤 LARGE PATIENT NAME & TC / BIRTH YEAR BOX
    const nameBoxH = Math.round(44 * ratio);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin, y, contentW, nameBoxH);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(9 * ratio)}px system-ui, sans-serif`;
    ctx.fillText('KİŞİ ADI SOYADI (PATIENT NAME):', margin + 8, y + Math.round(13 * ratio));

    // Full name in LARGE bold font
    ctx.font = `black ${Math.round(16 * ratio * fontMul)}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(fullName.toUpperCase().substring(0, 24), margin + 8, y + Math.round(33 * ratio));

    // Birth Year / TC on the right side
    if (birthYear || tcNo) {
      ctx.textAlign = 'right';
      ctx.font = `bold ${Math.round(10 * ratio)}px "Courier New", monospace`;
      if (birthYear) ctx.fillText(`D:${birthYear}`, targetW - margin - 8, y + Math.round(16 * ratio));
      if (tcNo) ctx.fillText(`TC:${tcNo.substring(0, 11)}`, targetW - margin - 8, y + Math.round(33 * ratio));
    }

    y += nameBoxH + 8;

    // Vehicle Specific Plate Section
    if (layoutMode === 'vehicle-sticker' && vehiclePlate) {
      const plateH = Math.round(34 * ratio);
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, y, contentW, plateH);
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `black ${Math.round(15 * ratio * fontMul)}px "Courier New", monospace`;
      ctx.fillText(`🚗 ARAÇ PLAKA: ${vehiclePlate.toUpperCase()}`, targetW / 2, y + Math.round(23 * ratio));
      y += plateH + 8;
    }

    // 6. ⚠️ HIGH PRIORITY ALLERGY & MEDICAL WARNING (If any)
    if (allergies && allergies.trim() !== '') {
      const allergyH = Math.round(36 * ratio);
      ctx.fillStyle = '#000000';
      ctx.fillRect(margin, y, contentW, allergyH);

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = `bold ${Math.round(9 * ratio)}px system-ui, sans-serif`;
      ctx.fillText('⚠️ KRİTİK ALERJİ UYARISI / ALLERGY ⚠️', targetW / 2, y + Math.round(13 * ratio));

      ctx.font = `black ${Math.round(13 * ratio * fontMul)}px system-ui, sans-serif`;
      ctx.fillText(allergies.toUpperCase().substring(0, 32), targetW / 2, y + Math.round(29 * ratio));

      y += allergyH + 8;
    }

    // Full Medical Details Section (If in medical-full mode)
    if (layoutMode === 'medical-full') {
      const medH = Math.round(58 * ratio);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin, y, contentW, medH);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.round(9 * ratio)}px system-ui, sans-serif`;
      ctx.fillText('TIBBİ BİLGİLER & DÜZENLİ İLAÇLAR:', margin + 8, y + Math.round(13 * ratio));

      let lineY = y + Math.round(28 * ratio);
      if (chronicDiseases) {
        ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
        ctx.fillText(`• Kronik: ${chronicDiseases.substring(0, 30)}`, margin + 8, lineY);
        lineY += Math.round(14 * ratio);
      }
      if (regularMedications) {
        ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
        ctx.fillText(`• İlaçlar: ${regularMedications.substring(0, 30)}`, margin + 8, lineY);
      }

      y += medH + 8;
    }

    // 7. 📞 GIANT ULTRA-READABLE EMERGENCY CONTACT NUMBER (1. ÖNCELİKLİ NUMARA)
    const contactBoxH = Math.round(52 * ratio);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin, y, contentW, contactBoxH);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(9.5 * ratio)}px system-ui, sans-serif`;
    ctx.fillText(`📞 ACİL ARANACAK YAKINI: ${contact1Name.toUpperCase()} (${contact1Relation.toUpperCase()})`, margin + 8, y + Math.round(15 * ratio));

    // HUGE DIGITS PHONE NUMBER
    ctx.font = `black ${Math.round(18 * ratio * fontMul)}px "Courier New", monospace`;
    ctx.fillText(contact1Phone, margin + 8, y + Math.round(38 * ratio));

    y += contactBoxH + 6;

    // Contact 2 (If available and not in minimal mode)
    if (contact2Phone && contact2Phone.trim() !== '' && layoutMode !== 'blood-focus') {
      const contact2H = Math.round(40 * ratio);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin, y, contentW, contact2H);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `bold ${Math.round(8.5 * ratio)}px system-ui, sans-serif`;
      ctx.fillText(`2. YEDEK İLETİŞİM: ${contact2Name} (${contact2Relation})`, margin + 8, y + Math.round(13 * ratio));

      ctx.font = `black ${Math.round(14 * ratio * fontMul)}px "Courier New", monospace`;
      ctx.fillText(contact2Phone, margin + 8, y + Math.round(30 * ratio));

      y += contact2H + 8;
    }

    // 8. 📱 LARGE HIGH-CONTRAST QR CODE OR CODE128 BARCODE
    if (barcodeType === 'qr-large') {
      // Big, clean 150-180px centered QR code
      const qrSize = Math.round(is80mm ? 200 : 155);
      const qrX = Math.round((targetW - qrSize) / 2);
      const qrY = y + 4;

      const offscreenQr = document.createElement('canvas');
      const qrString = computeQrText();
      await QRCode.toCanvas(offscreenQr, qrString, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Draw QR Code
      ctx.drawImage(offscreenQr, qrX, qrY, qrSize, qrSize);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4);

      y = qrY + qrSize + 8;

      // QR Instruction Label
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `black ${Math.round(9.5 * ratio)}px system-ui, sans-serif`;
      ctx.fillText('💬 KAMERAYLA TARATIN: TÜM SAĞLIK BİLGİLERİ AÇILIR', targetW / 2, y + 4);
      y += 18;

    } else if (barcodeType === 'code128-barcode') {
      const bcW = contentW - 20;
      const bcH = Math.round(45 * ratio);
      const bcX = margin + 10;
      const bcY = y + 4;

      drawCode128Barcode(ctx, tcNo || contact1Phone, bcX, bcY, bcW, bcH);
      y = bcY + bcH + 24;
    }

    // 9. 🚨 112 EMERGENCY RESCUE BANNER
    const rescueH = Math.round(28 * ratio);
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin, y, contentW, rescueH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `black ${Math.round(12 * ratio * fontMul)}px system-ui, sans-serif`;
    ctx.fillText('🚨 ACİL ÇAĞRI MERKEZİ: 112 🚨', targetW / 2, y + Math.round(19 * ratio));

    y += rescueH + 8;

    // 10. Serial ID & Cut Guide Footer
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(8 * ratio)}px "Courier New", monospace`;
    ctx.fillText(`KART ID: [ ${cardSerial} ] • 57mm iPrint ICE`, targetW / 2, y + 4);

    if (showCutGuide) {
      ctx.save();
      ctx.setLineDash([5, 3]);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(8, totalH - 18);
      ctx.lineTo(targetW - 8, totalH - 18);
      ctx.stroke();
      ctx.restore();

      ctx.font = `bold ${Math.round(7.5 * ratio)}px "Courier New", monospace`;
      ctx.fillText('✂ --- BURADAN KESİN VE CÜZDANDA TAŞIYIN --- ✂', targetW / 2, totalH - 6);
    }

    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);
  }, [
    pageWidth,
    layoutMode,
    barcodeType,
    fontScale,
    fullName,
    bloodType,
    birthYear,
    tcNo,
    vehiclePlate,
    contact1Name,
    contact1Relation,
    contact1Phone,
    contact2Name,
    contact2Relation,
    contact2Phone,
    allergies,
    chronicDiseases,
    regularMedications,
    donorStatus,
    showCompatibility,
    showCutGuide,
    cardSerial,
    computeQrText
  ]);

  useEffect(() => {
    renderHealthCard();
  }, [renderHealthCard]);

  // Print Handlers
  const handlePrint = async (direct: boolean = false) => {
    if (!previewUrl) return;
    setIsPrinting(true);
    try {
      const title = `Acil Sağlık Kartı (57mm) - ${fullName} (${bloodType})`;
      if (direct && onDirectPrint) {
        await onDirectPrint(previewUrl, title);
      } else if (onPreviewAndPrint) {
        onPreviewAndPrint(previewUrl, title);
      } else {
        onPrintImage(previewUrl, title);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPNG = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `Acil_Saglik_Karti_57mm_${fullName.replace(/\s+/g, '_')}_${bloodType.replace(/[^a-zA-Z0-9]/g, '')}.png`;
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

  const navTabs = [
    { id: 'preview', label: 'Önizleme', icon: Eye },
    { id: 'edit', label: 'Bilgiler', icon: FileText },
    { id: 'types', label: 'Şablon', icon: Droplet },
  ] as const;

  const layoutOptions: { id: HealthCardLayout; label: string; icon: React.ElementType }[] = [
    { id: 'compact-large', label: 'ICE', icon: Sparkles },
    { id: 'blood-focus', label: 'Kan', icon: HeartPulse },
    { id: 'medical-full', label: 'Medikal', icon: FileText },
    { id: 'vehicle-sticker', label: 'Kask', icon: Car }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* 1. Header Bar: Compact & Minimalist */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xs">
        {/* Left: Back Button */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
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
            {layoutOptions.map((opt) => {
              const isSelected = layoutMode === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLayoutMode(opt.id)}
                  title={opt.label}
                  className={`flex items-center gap-1.5 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer overflow-hidden whitespace-nowrap ${
                    isSelected
                      ? 'bg-red-600 text-white px-2.5 shadow-xs'
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
            type="button"
            onClick={() => handlePrint(true)}
            disabled={isPrinting || !previewUrl}
            className="h-8 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-xs gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
            title="Fişi Yazdır"
          >
            <Printer size={13} />
            <span>Yazdır</span>
          </Button>
        </div>
      </div>

      {/* Tab Contents with Animation */}
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAB 1: PREVIEW & PRINT (DEFAULT CLEAN VIEW)                               */}
        {/* ========================================================================= */}
        {activeBottomTab === 'preview' && (
          <motion.div
            key="tab-preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-xl mx-auto space-y-3"
          >
            {/* Live Receipt Preview Card */}
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 flex-nowrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye size={16} className="text-red-500 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                    Önizleme
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Kan: {bloodType}
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadPNG}
                    title="PNG Olarak İndir"
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyImage}
                    title={copySuccess ? "Kopyalandı" : "Panoya Kopyala"}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copySuccess ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              {/* Simulated Receipt Preview */}
              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-x-auto min-h-[360px]">
                {previewUrl ? (
                  <div className="relative shadow-lg rounded-sm overflow-hidden bg-white max-w-[320px] transition-all hover:scale-[1.01]">
                    <img
                      src={previewUrl}
                      alt="Acil Sağlık Kartı Önizleme"
                      className="w-full h-auto block select-none"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    Önizleme hazırlanıyor...
                  </div>
                )}
              </div>

              {/* Hidden Canvas */}
              <canvas ref={canvasRef} className="hidden" />
            </Card>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EDIT INFO (CLEAN ACCORDIONS)                                      */}
        {/* ========================================================================= */}
        {activeBottomTab === 'edit' && (
          <motion.div
            key="tab-edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-2xl mx-auto space-y-3"
          >
            {/* Section 1: Kişi & Kimlik Bilgileri */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'info' ? '' as any : 'info')}
                className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Kişi & Kimlik Bilgileri
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {fullName} • {bloodType} • {birthYear || 'Doğum yılı yok'}
                    </p>
                  </div>
                </div>
                {expandedSection === 'info' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection === 'info' && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Ad Soyad (Büyük Harflerle Basılır)
                    </Label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Örn: AHMET YILMAZ"
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-black text-sm uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Doğum Yılı</Label>
                      <input
                        type="text"
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="1990"
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono font-bold text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">TC Kimlik No (İsteğe Bağlı)</Label>
                      <input
                        type="text"
                        value={tcNo}
                        onChange={(e) => setTcNo(e.target.value)}
                        placeholder="12345678901"
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-sm"
                      />
                    </div>
                  </div>

                  {layoutMode === 'vehicle-sticker' && (
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Araç Plakası / Kask No
                      </Label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        placeholder="Örn: 34 ABC 789"
                        className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono font-bold text-sm uppercase"
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Section 2: Acil Durum Telefonları */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'contacts' ? '' as any : 'contacts')}
                className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Acil Durum İletişim Numaraları
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      1. Yakın: {contact1Name} ({contact1Phone || 'Girilmedi'})
                    </p>
                  </div>
                </div>
                {expandedSection === 'contacts' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection === 'contacts' && (
                <div className="p-4 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      1. Öncelikli Acil Durum Telefonu (Büyük Punto)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={contact1Name}
                        onChange={(e) => setContact1Name(e.target.value)}
                        placeholder="Yakın Adı (Örn: Zeynep)"
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={contact1Relation}
                        onChange={(e) => setContact1Relation(e.target.value)}
                        placeholder="Yakınlık (Eşi/Anne)"
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                      />
                      <input
                        type="tel"
                        value={contact1Phone}
                        onChange={(e) => setContact1Phone(e.target.value)}
                        placeholder="0532 555 1234"
                        className="px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/30 font-mono font-black text-sm text-emerald-700 dark:text-emerald-300"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <Label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      2. Yedek İletişim (İsteğe Bağlı):
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={contact2Name}
                        onChange={(e) => setContact2Name(e.target.value)}
                        placeholder="2. Yakın Adı"
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                      />
                      <input
                        type="text"
                        value={contact2Relation}
                        onChange={(e) => setContact2Relation(e.target.value)}
                        placeholder="Kardeşi vb."
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                      />
                      <input
                        type="tel"
                        value={contact2Phone}
                        onChange={(e) => setContact2Phone(e.target.value)}
                        placeholder="0542 444 5678"
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 3: Alerjiler & Tıbbi Uyarılar */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'medical' ? '' as any : 'medical')}
                className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Alerjiler & Tıbbi Uyarılar
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {allergies ? `Alerjiler: ${allergies}` : 'Alerji girilmedi'}
                    </p>
                  </div>
                </div>
                {expandedSection === 'medical' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection === 'medical' && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <Label className="text-xs font-bold text-red-600 dark:text-red-400">
                      Alerjiler (Penisilin, Arı Sokması, Aspirin vb.)
                    </Label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="Örn: PENİSİLİN, ASPİRİN (Yoksa boş bırakın)"
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 font-bold text-sm text-red-700 dark:text-red-300 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kronik Rahatsızlıklar
                      </Label>
                      <input
                        type="text"
                        value={chronicDiseases}
                        onChange={(e) => setChronicDiseases(e.target.value)}
                        placeholder="Örn: Tip 1 Diyabet, Astım"
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Düzenli İlaçlar
                      </Label>
                      <input
                        type="text"
                        value={regularMedications}
                        onChange={(e) => setRegularMedications(e.target.value)}
                        placeholder="Örn: İnsülin Kalemi"
                        className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Section 4: Ek Seçenekler & Çizgiler */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedSection(expandedSection === 'settings' ? '' as any : 'settings')}
                className="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Gelişmiş Baskı Seçenekleri
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Punto, kesme çizgileri ve seri no ayarları
                    </p>
                  </div>
                </div>
                {expandedSection === 'settings' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection === 'settings' && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCompatibility}
                        onChange={(e) => setShowCompatibility(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Kan Uyumluluk Şeridi</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCutGuide}
                        onChange={(e) => setShowCutGuide(e.target.checked)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span>Cüzdan Kesme Çizgisi</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500">Seri Numarası: {cardSerial}</span>
                    <button
                      type="button"
                      onClick={regenerateSerial}
                      className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Yenile
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TEMPLATES & BLOOD TYPE SELECTION                                   */}
        {/* ========================================================================= */}
        {activeBottomTab === 'types' && (
          <motion.div
            key="tab-types"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-2xl mx-auto space-y-4"
          >
            {/* 1. Blood Type Big Selection Grid */}
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Droplet size={15} className="text-red-500" />
                  Kan Grubu Seçimi (Baskıda Dev Punto Çıkar)
                </Label>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  Seçili: {bloodType}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {BLOOD_TYPES_INFO.slice(0, 8).map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => setBloodType(b.type)}
                    className={`py-2.5 px-2 rounded-xl font-bold text-xs cursor-pointer border transition-all flex flex-col items-center justify-center ${
                      bloodType === b.type
                        ? 'bg-red-600 text-white border-red-600 shadow-md scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg font-black">{b.badge}</span>
                    <span className="text-[10px] opacity-90">{b.type}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* 2. Layout Cards Grid */}
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <Layers size={15} className="text-red-500" />
                Kart Düzeni & Format Şablonları
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'compact-large', title: '⭐ Süper Net ICE', desc: 'Dev kan grubu, acil telefon ve taranabilir büyük QR kod. En popüler cüzdan kartı.', badge: 'Tavsiye Edilen' },
                  { id: 'blood-focus', title: '🩸 Kan & Acil Tel Odaklı', desc: 'Maksimum punto ile kan grubu ve 1. telefon numarası. Uzaktan okunabilirlik.', badge: 'Maks Punto' },
                  { id: 'medical-full', title: '📋 Tam Medikal Rapor', desc: 'Alerjiler, kronik hastalıklar, düzenli ilaçlar ve acil durum protokolü.', badge: 'Detaylı' },
                  { id: 'vehicle-sticker', title: '🚗 Araç & Kask Etiketi', desc: 'Motosiklet kaskı, araç camı veya bisiklet için araç plakası ve kan grubu.', badge: 'Etiket' }
                ].map((t) => {
                  const isSelected = layoutMode === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLayoutMode(t.id as HealthCardLayout)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-red-500 bg-red-50/80 dark:bg-red-950/40 ring-1 ring-red-500 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                          {t.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 3. Barcode / QR Option */}
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                <QrCode size={15} className="text-red-500" />
                Barkod & QR Kod Formatı
              </Label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBarcodeType('qr-large')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    barcodeType === 'qr-large'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 font-bold text-red-900 dark:text-red-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">📱 Dev QR Kod</div>
                  <div className="text-[10px] text-slate-500 mt-1">Telefon kamerasıyla anında tüm sağlık bilgilerini gösterir</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBarcodeType('code128-barcode')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    barcodeType === 'code128-barcode'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/40 font-bold text-red-900 dark:text-red-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">📊 Çizgi Barkod</div>
                  <div className="text-[10px] text-slate-500 mt-1">Klasik 1D çizgi barkod formatı</div>
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Capsule Navigation Menu */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)]">
        {navTabs.map((tab) => {
          const isActive = activeBottomTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveBottomTab(tab.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
