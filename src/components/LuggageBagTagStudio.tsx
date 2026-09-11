import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Luggage,
  Phone,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Check,
  Printer,
  Download,
  Copy,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  ArrowLeft,
  Square,
  Plane,
  Tag
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import QRCode from 'qrcode';

export interface LuggageBagTagStudioProps {
  pageWidth: number;
  onPrintImage: (dataUrl: string, title: string, widthMm?: number) => void;
  onDirectPrint?: (dataUrl: string, title: string, widthMm?: number) => Promise<void>;
  onPreviewAndPrint?: (dataUrl: string, title: string, widthMm?: number) => void;
  onBack?: () => void;
}

export type TagTemplateType =
  | 'square-compact'    // 1:1 Tam Kare Kompakt (Büyük Okunaklı Yazı & Hızlı QR)
  | 'wide-travel'       // Standart & Geniş Seyahat Bagaj Kartı (Zengin Detaylı)
  | 'flight-iata'       // Havacılık & Uçuş IATA Bagaj Kartı
  | 'foldable-loop'     // Bavul Sapına Asılabilir / Katlanabilir Şerit
  | 'smart-whatsapp'    // Geriye dönük uyumluluk
  | 'executive-laptop'  // Geriye dönük uyumluluk
  | 'backpack-student'  // Geriye dönük uyumluluk
  | 'pet-carrier';      // Geriye dönük uyumluluk

export type LanguageMode = 'tr-en' | 'tr' | 'en' | 'de' | 'fr' | 'es';

interface CountryPhoneCode {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  formatPlaceholder: string;
}

const COUNTRY_CODES: CountryPhoneCode[] = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', dialCode: '+90', formatPlaceholder: '532 123 4567' },
  { code: 'US', name: 'USA / Canada', flag: '🇺🇸', dialCode: '+1', formatPlaceholder: '555 123 4567' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', dialCode: '+49', formatPlaceholder: '151 12345678' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', formatPlaceholder: '7911 123456' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', formatPlaceholder: '6 12 34 56 78' },
  { code: 'NL', name: 'Nederland', flag: '🇳🇱', dialCode: '+31', formatPlaceholder: '6 12345678' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', dialCode: '+39', formatPlaceholder: '340 1234567' },
  { code: 'ES', name: 'España', flag: '🇪🇸', dialCode: '+34', formatPlaceholder: '612 34 56 78' },
  { code: 'AE', name: 'UAE / Dubai', flag: '🇦🇪', dialCode: '+971', formatPlaceholder: '50 123 4567' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', formatPlaceholder: '50 123 4567' },
  { code: 'AZ', name: 'Azərbaycan', flag: '🇦🇿', dialCode: '+994', formatPlaceholder: '50 123 4567' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7', formatPlaceholder: '912 345-67-89' }
];

const MULTI_LANG_HEADINGS: Record<LanguageMode, { primary: string; sub: string; lostMsg: string }> = {
  'tr-en': {
    primary: 'BENİ KAYBETTİYSENİZ LÜTFEN ARAYIN',
    sub: 'IF LOST PLEASE CONTACT OWNER IMMEDIATELY',
    lostMsg: 'Kayıp Eşya / Lost & Found'
  },
  'tr': {
    primary: 'BENİ KAYBETTİYSENİZ LÜTFEN ARAYIN',
    sub: 'LÜTFEN EN KISA SÜREDE SAHİBİNE ULAŞTIRINIZ',
    lostMsg: 'Kayıp Eşya İletişim Kartı'
  },
  'en': {
    primary: 'IF LOST PLEASE CONTACT OWNER',
    sub: 'REWARD OFFERED FOR SAFE RETURN',
    lostMsg: 'Luggage Lost & Found Contact'
  },
  'de': {
    primary: 'WENN GEFUNDEN, BITTE MELDEN',
    sub: 'BELOHNUNG FÜR RÜCKGABE GARANTIERT',
    lostMsg: 'Gepäck Kontaktkarte'
  },
  'fr': {
    primary: 'SI TROUVÉ, VEUILLEZ CONTACTER',
    sub: 'RÉCOMPENSE POUR LE RETOUR',
    lostMsg: 'Carte de Contact Bagage'
  },
  'es': {
    primary: 'SI ME ENCUENTRA, POR FAVOR LLAME',
    sub: 'RECOMPENSA GARANTIZADA AL ENTREGAR',
    lostMsg: 'Tarjeta de Contacto de Equipaje'
  }
};

export const LuggageBagTagStudio: React.FC<LuggageBagTagStudioProps> = ({
  pageWidth,
  onPrintImage,
  onDirectPrint,
  onPreviewAndPrint,
  onBack
}) => {
  // Active Tag Template - Default: 'square-compact' (Tam Kare 1:1)
  const [templateType, setTemplateType] = useState<TagTemplateType>('square-compact');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('tr-en');
  const [qrActionType, setQrActionType] = useState<'whatsapp' | 'call' | 'vcard'>('whatsapp');

  // Form Fields
  const [fullName, setFullName] = useState('Emre Öztürk');
  const [countryIndex, setCountryIndex] = useState<number>(0); // TR +90
  const [phoneNumber, setPhoneNumber] = useState('532 987 6543');
  const [altContact, setAltContact] = useState('emre.ozturk@email.com');
  const [customHeading, setCustomHeading] = useState('');
  const [customLostMessage, setCustomLostMessage] = useState('Merhaba! Bavulunuzu/çantanızı buldum. Teslim etmek için yazıyorum.');
  
  // Travel Specific Fields
  const [flightNo, setFlightNo] = useState('TK 1983');
  const [destinationRoute, setDestinationRoute] = useState('IST ➔ LHR (Londra)');
  const [hotelOrAddress, setHotelOrAddress] = useState('Hilton London Paddington, UK');
  const [rewardOfferText, setRewardOfferText] = useState('💰 Bulana Nakit Teşekkür Ödülü Verilecektir');
  const [securityTagId, setSecurityTagId] = useState('LUG-TR-84920');

  // Collapsible Accordion State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Bottom Navigation Tab Mode ('preview' | 'edit' | 'types')
  const [activeBottomTab, setActiveBottomTab] = useState<'preview' | 'edit' | 'types'>('preview');

  // Options
  const [showRewardBanner, setShowRewardBanner] = useState<boolean>(false);
  const [showFlightInfo, setShowFlightInfo] = useState<boolean>(true);
  const [showPunchHoleGuide, setShowPunchHoleGuide] = useState<boolean>(false);
  const [showCutLines, setShowCutLines] = useState<boolean>(false);
  const [showQrHintText, setShowQrHintText] = useState<boolean>(true);

  // Canvas & Preview State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Generate Unique Random Luggage ID
  const regenerateTagId = () => {
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const prefixes = ['LUG', 'BAG', 'FLY', 'TRV', 'AIR'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    setSecurityTagId(`${p}-TR-${randomHex}`);
  };

  // Helper to format clean international phone for WhatsApp (e.g. 905329876543)
  const getFullInternationalNumber = useCallback(() => {
    const country = COUNTRY_CODES[countryIndex] || COUNTRY_CODES[0];
    const rawDial = country.dialCode.replace('+', '');
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    // If user typed 0 at start in TR, strip it
    const normalizedDigits = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    return `${rawDial}${normalizedDigits}`;
  }, [countryIndex, phoneNumber]);

  // Compute Active QR Code String
  const computeQrString = useCallback(() => {
    const fullPhone = getFullInternationalNumber();

    if (qrActionType === 'whatsapp') {
      const defaultText = customLostMessage || `Merhaba, ${fullName} adına kayıtlı çantayı (${securityTagId}) buldum.`;
      const encodedMsg = encodeURIComponent(defaultText);
      return `https://wa.me/${fullPhone}?text=${encodedMsg}`;
    } else if (qrActionType === 'call') {
      return `tel:+${fullPhone}`;
    } else {
      // vCard Contact Card (MECARD / VCARD format)
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${fullName}\nTEL;TYPE=CELL:+${fullPhone}\nEMAIL:${altContact}\nNOTE:Bag ID: ${securityTagId}\nEND:VCARD`;
    }
  }, [qrActionType, getFullInternationalNumber, customLostMessage, fullName, securityTagId, altContact]);

  // ---------------- CANVAS RENDER ENGINE ---------------- //
  const renderTagCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetW = pageWidth || 384; // 384 for 58mm, 576 for 80mm
    const is80mm = targetW > 450;
    const ratio = is80mm ? 1.4 : 1.0;

    // Normalizing template alias
    const isSquare = templateType === 'square-compact' || templateType === 'smart-whatsapp' || templateType === 'backpack-student';
    const isLoop = templateType === 'foldable-loop';
    const isIata = templateType === 'flight-iata';

    // Dynamically calculate canvas height based on template and options
    let calculatedH = targetW; // Default 1:1 Square
    if (isSquare) {
      calculatedH = targetW; // Tam Kare (384x384 veya 576x576)
    } else if (isLoop) {
      calculatedH = is80mm ? 940 : 700;
    } else if (isIata) {
      calculatedH = is80mm ? 780 : 560;
    } else {
      // Wide Travel (Standart Geniş Kart)
      calculatedH = is80mm ? 750 : 530;
    }

    canvas.width = targetW;
    canvas.height = calculatedH;

    // 1. Crisp White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, calculatedH);

    // 2. Outer Border (Solid & Clean)
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(4, 4, targetW - 8, calculatedH - 8);

    // Inner hairline border
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, targetW - 14, calculatedH - 14);

    let currentY = 10;

    // 3. Punch Hole / Hanging Guide Circle (Optional)
    if (showPunchHoleGuide || isLoop) {
      const holeRadius = is80mm ? 12 : 9;
      const holeCenterX = targetW / 2;
      const holeCenterY = currentY + holeRadius + 3;

      ctx.save();
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(holeCenterX, holeCenterY, holeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs inside circle
      ctx.beginPath();
      ctx.moveTo(holeCenterX - holeRadius - 3, holeCenterY);
      ctx.lineTo(holeCenterX + holeRadius + 3, holeCenterY);
      ctx.moveTo(holeCenterX, holeCenterY - holeRadius - 3);
      ctx.lineTo(holeCenterX, holeCenterY + holeRadius + 3);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(8 * ratio)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('○ ASMA DELİĞİ (PUNCH HOLE) ○', targetW / 2, holeCenterY + holeRadius + 11);

      currentY = holeCenterY + holeRadius + 15;
    }

    const headings = MULTI_LANG_HEADINGS[languageMode] || MULTI_LANG_HEADINGS['tr-en'];
    const selectedCountry = COUNTRY_CODES[countryIndex] || COUNTRY_CODES[0];
    const formattedDisplayPhone = `${selectedCountry.dialCode} ${phoneNumber}`;
    const qrString = computeQrString();

    // ==========================================
    // TEMPLATE 1: TAM KARE KOMPAKT (1:1 SQUARE)
    // ==========================================
    if (isSquare) {
      // 1. Top Attention Header Banner (Inverted Black Box)
      const bannerH = is80mm ? 44 : 32;
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, currentY, targetW - 16, bannerH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(13.5 * ratio)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`🚨 KAYIP ÇANTA • LOST BAG 🚨`, targetW / 2, currentY + (is80mm ? 27 : 21));

      currentY += bannerH + 8;

      // 2. Passenger Name (Large & High Contrast)
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(9.5 * ratio)}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('SAHİBİ / OWNER:', 14, currentY + 8);

      ctx.font = `900 ${Math.round(17 * ratio)}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(fullName.toUpperCase().substring(0, 24), 14, currentY + (is80mm ? 32 : 25));

      currentY += (is80mm ? 38 : 30);

      // 3. Phone & WhatsApp Highlight Inverted Box
      const phoneBoxH = is80mm ? 38 : 28;
      ctx.fillStyle = '#000000';
      ctx.fillRect(10, currentY, targetW - 20, phoneBoxH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(14 * ratio)}px "Courier New", monospace, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`📞 ${formattedDisplayPhone}`, targetW / 2, currentY + (is80mm ? 25 : 19));

      currentY += phoneBoxH + 8;

      // 4. Large Centered QR Code
      const remainingSpace = calculatedH - currentY - (is80mm ? 48 : 38);
      const qrSize = Math.min(remainingSpace, is80mm ? 190 : 135);
      const qrX = (targetW - qrSize) / 2;
      const qrY = currentY;

      const offscreenQr = document.createElement('canvas');
      await QRCode.toCanvas(offscreenQr, qrString, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      ctx.drawImage(offscreenQr, qrX, qrY, qrSize, qrSize);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2);

      currentY = qrY + qrSize + (is80mm ? 14 : 10);

      // 5. Scan Action Label Under QR
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${Math.round(11 * ratio)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💬 TARA ➔ WHATSAPP AÇILIR', targetW / 2, currentY);

      // 6. Security ID Footer
      ctx.font = `bold ${Math.round(8.5 * ratio)}px "Courier New", monospace`;
      ctx.fillText(`ID: [ ${securityTagId} ]`, targetW / 2, calculatedH - 9);

    } else if (isIata) {
      // ==========================================
      // TEMPLATE 2: UÇUŞ & IATA HAVACILIK STANDARDI
      // ==========================================
      const bannerH = is80mm ? 52 : 38;
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, currentY, targetW - 16, bannerH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(14 * ratio)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`✈️ BAGGAGE CLAIM / IATA TAG`, targetW / 2, currentY + (is80mm ? 24 : 17));

      ctx.font = `bold ${Math.round(9.5 * ratio)}px "Courier New", monospace`;
      ctx.fillText(`FLIGHT: ${flightNo || 'TK 1983'} • ID: ${securityTagId}`, targetW / 2, currentY + (is80mm ? 42 : 30));

      currentY += bannerH + 10;

      // Route Box
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(10, currentY, targetW - 20, is80mm ? 36 : 28);
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${Math.round(13 * ratio)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(destinationRoute || 'IST ➔ LHR (LONDON)', targetW / 2, currentY + (is80mm ? 23 : 18));

      currentY += (is80mm ? 36 : 28) + 10;

      // Passenger Name & Phone Box
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(9.5 * ratio)}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('PASSENGER / YOLCU:', 14, currentY + 8);
      ctx.font = `900 ${Math.round(16 * ratio)}px system-ui, sans-serif`;
      ctx.fillText(fullName.toUpperCase(), 14, currentY + (is80mm ? 30 : 24));

      currentY += (is80mm ? 36 : 28);

      ctx.font = `bold ${Math.round(9.5 * ratio)}px system-ui, sans-serif`;
      ctx.fillText('TEL & WHATSAPP:', 14, currentY + 8);
      ctx.font = `900 ${Math.round(15 * ratio)}px "Courier New", monospace`;
      ctx.fillText(formattedDisplayPhone, 14, currentY + (is80mm ? 29 : 23));

      currentY += (is80mm ? 36 : 28) + 8;

      // QR Code
      const qrSize = is80mm ? 190 : 145;
      const qrX = (targetW - qrSize) / 2;
      const offscreenQr = document.createElement('canvas');
      await QRCode.toCanvas(offscreenQr, qrString, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      ctx.drawImage(offscreenQr, qrX, currentY, qrSize, qrSize);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 1, currentY - 1, qrSize + 2, qrSize + 2);

      currentY += qrSize + (is80mm ? 16 : 12);

      ctx.font = `900 ${Math.round(11 * ratio)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💬 SCAN FOR IMMEDIATE OWNER CONTACT', targetW / 2, currentY);

      ctx.font = `bold ${Math.round(8.5 * ratio)}px "Courier New", monospace`;
      ctx.fillText(`PNR SECURITY: [ ${securityTagId} ]`, targetW / 2, calculatedH - 9);

    } else {
      // ==========================================
      // TEMPLATE 3: GENİŞ SEYAHAT KARTI (WIDE TRAVEL)
      // ==========================================
      const bannerH = is80mm ? 58 : 42;
      ctx.fillStyle = '#000000';
      ctx.fillRect(8, currentY, targetW - 16, bannerH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.round(13.5 * ratio)}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      const mainTitle = customHeading || headings.primary;
      ctx.fillText(`🚨 ${mainTitle} 🚨`, targetW / 2, currentY + (is80mm ? 24 : 17));

      ctx.font = `bold ${Math.round(9.5 * ratio)}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(headings.sub, targetW / 2, currentY + (is80mm ? 44 : 31));

      currentY += bannerH + 10;

      // Passenger Box
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('YOLCU / ÇANTA SAHİBİ (NAME):', 14, currentY + 8);

      currentY += 12;
      ctx.lineWidth = 2;
      ctx.strokeRect(10, currentY, targetW - 20, is80mm ? 36 : 28);
      ctx.font = `900 ${Math.round(16 * ratio)}px system-ui, sans-serif`;
      ctx.fillText(fullName.toUpperCase(), 18, currentY + (is80mm ? 24 : 19));

      currentY += (is80mm ? 36 : 28) + 8;

      // Phone / WhatsApp Box (Highlighted)
      ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
      ctx.fillText('TELEFON & WHATSAPP:', 14, currentY + 8);

      currentY += 12;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(10, currentY, targetW - 20, is80mm ? 38 : 30);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(10, currentY, targetW - 20, is80mm ? 38 : 30);

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${Math.round(15 * ratio)}px "Courier New", monospace`;
      ctx.fillText(`📞 ${formattedDisplayPhone}`, 18, currentY + (is80mm ? 25 : 20));

      currentY += (is80mm ? 38 : 30) + 8;

      // Optional Extra line (Destination / Alt Contact)
      if (showFlightInfo && (flightNo || destinationRoute)) {
        ctx.lineWidth = 1;
        ctx.strokeRect(10, currentY, targetW - 20, is80mm ? 26 : 20);
        ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
        const extraText = `✈️ ${[flightNo, destinationRoute].filter(Boolean).join(' • ')}`;
        ctx.fillText(extraText.substring(0, 36), 16, currentY + (is80mm ? 17 : 14));
        currentY += (is80mm ? 26 : 20) + 8;
      } else if (altContact) {
        ctx.lineWidth = 1;
        ctx.strokeRect(10, currentY, targetW - 20, is80mm ? 26 : 20);
        ctx.font = `bold ${Math.round(10 * ratio)}px system-ui, sans-serif`;
        ctx.fillText(`✉️ ${altContact}`.substring(0, 36), 16, currentY + (is80mm ? 17 : 14));
        currentY += (is80mm ? 26 : 20) + 8;
      }

      // QR Code
      const qrSize = is80mm ? 190 : 145;
      const qrX = (targetW - qrSize) / 2;
      const offscreenQr = document.createElement('canvas');
      await QRCode.toCanvas(offscreenQr, qrString, {
        width: qrSize,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' }
      });
      ctx.drawImage(offscreenQr, qrX, currentY, qrSize, qrSize);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(qrX - 1, currentY - 1, qrSize + 2, qrSize + 2);

      currentY += qrSize + (is80mm ? 14 : 10);

      // Scan label
      ctx.fillStyle = '#000000';
      ctx.font = `900 ${Math.round(11.5 * ratio)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('💬 KAMERAYLA TARA: DOĞRUDAN MESAJ AT', targetW / 2, currentY);

      // Footer
      ctx.font = `bold ${Math.round(8.5 * ratio)}px "Courier New", monospace`;
      ctx.fillText(`SECURITY TAG ID: [ ${securityTagId} ]`, targetW / 2, calculatedH - 9);
    }

    // Cut line if loop
    if (isLoop || showCutLines) {
      ctx.save();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, calculatedH - 24);
      ctx.lineTo(targetW - 10, calculatedH - 24);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(7.5 * ratio)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('✂ --- BURADAN KESİN VEYA ŞEFFAF KILIFA KATLAYIN --- ✂', targetW / 2, calculatedH - 10);
    }

    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);
  }, [
    pageWidth,
    templateType,
    languageMode,
    qrActionType,
    fullName,
    countryIndex,
    phoneNumber,
    altContact,
    customHeading,
    flightNo,
    destinationRoute,
    hotelOrAddress,
    rewardOfferText,
    securityTagId,
    showRewardBanner,
    showFlightInfo,
    showPunchHoleGuide,
    showCutLines,
    showQrHintText,
    computeQrString
  ]);

  // Re-render canvas whenever relevant state changes
  useEffect(() => {
    renderTagCanvas();
  }, [renderTagCanvas]);

  // ---------------- PRINT & EXPORT HANDLERS ---------------- //
  const handlePrint = async (direct: boolean = false) => {
    if (!previewUrl) return;
    setIsPrinting(true);
    try {
      const title = `Bavul Etiketi - ${fullName || 'Kayıp Eşya'}`;
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
    a.download = `LuggageTag_${fullName.replace(/\s+/g, '_')}_${Date.now()}.png`;
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

  const activeQrUrl = computeQrString();

  const layoutOptions: { id: TagTemplateType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'square-compact', label: 'Tam Kare 1:1', icon: Square },
    { id: 'wide-travel', label: 'Geniş Kart', icon: Luggage },
    { id: 'flight-iata', label: 'Uçuş IATA', icon: Plane },
    { id: 'foldable-loop', label: 'Sap Askı', icon: Tag },
  ];

  return (
    <div className="space-y-4 w-full max-w-5xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* 1. Header Bar: Compact, Responsive & Minimalist */}
      <div className="w-full flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:px-3 rounded-2xl shadow-xs overflow-hidden">
        {/* Left: Back Button Only */}
        <div className="flex items-center gap-2 shrink-0">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              size="sm"
              title="Geri Dön"
              className="rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-2.5 cursor-pointer shrink-0 shadow-xs"
            >
              <ArrowLeft size={14} className="mr-1" /> Geri
            </Button>
          )}
        </div>

        {/* Right: Layout Switcher Options & Print Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Quick Layout Mode Pill Group */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 gap-0.5">
            {layoutOptions.map((opt) => {
              const isSelected = templateType === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTemplateType(opt.id)}
                  title={opt.label}
                  className={`flex items-center gap-1 h-7 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-sky-600 text-white px-2 sm:px-2.5 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60 px-1.5 sm:px-2'
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className={isSelected ? 'inline text-[11px]' : 'hidden sm:inline text-[11px]'}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Fixed Print Button */}
          <Button
            size="sm"
            onClick={() => handlePrint(true)}
            disabled={isPrinting || !previewUrl}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
          >
            {isPrinting ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Printer size={14} />
            )}
            <span>Yazdır</span>
          </Button>
        </div>
      </div>

      {/* View Content based on activeBottomTab */}
      <div>
        {/* TAB 1: CANLI ÖNİZLEME (PREVIEW MODE) */}
        {activeBottomTab === 'preview' && (
          <motion.div
            key="tab-preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-xl mx-auto space-y-3"
          >
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 flex-nowrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye size={15} className="text-sky-600 dark:text-sky-400 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
                    Baskı Önizleme
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 whitespace-nowrap">
                    {pageWidth > 450 ? '80mm (576px)' : '58mm (384px)'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {templateType === 'square-compact' || templateType === 'smart-whatsapp' ? '1:1 Tam Kare' : templateType === 'wide-travel' ? 'Geniş Kart' : templateType === 'flight-iata' ? 'Uçuş IATA' : 'Katlamalı'}
                  </span>
                </div>
              </div>

              {/* Thermal Canvas / Image container */}
              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-x-auto min-h-[340px] shadow-inner">
                {previewUrl ? (
                  <div className="relative shadow-xl rounded-sm overflow-hidden bg-white max-w-[310px] transition-all hover:scale-[1.01]">
                    <img
                      src={previewUrl}
                      alt="Luggage Tag Preview"
                      className="w-full h-auto block select-none"
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Önizleme yükleniyor...
                  </div>
                )}
              </div>

              {/* Quick Action Print Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => handlePrint(true)}
                  disabled={isPrinting || !previewUrl}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Printer size={16} />
                  Hemen Yazdır
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handlePrint(false)}
                    variant="outline"
                    className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 h-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Eye size={13} className="mr-1" />
                    Önizle & Ayarla
                  </Button>

                  <Button
                    onClick={handleDownloadPNG}
                    variant="outline"
                    className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 h-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Download size={13} className="mr-1" />
                    PNG İndir
                  </Button>

                  <Button
                    onClick={handleCopyImage}
                    variant="outline"
                    className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 h-9 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {copySuccess ? (
                      <>
                        <Check size={13} className="mr-1 text-emerald-500" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="mr-1" />
                        Kopyala
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Minimalist Tip */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-sky-500 shrink-0" />
                <span>Baskıyı şeffaf kılıfa koyabilir veya bagaja doğrudan yapıştırabilirsiniz.</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* TAB 2: DÜZENLEME (FORM EDIT MODE) */}
        {activeBottomTab === 'edit' && (
          <motion.div
            key="tab-edit"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-2xl mx-auto space-y-3"
          >
            {/* Primary Contact & Phone Details */}
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sliders size={15} className="text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    İletişim & QR Kod Bilgileri
                  </span>
                </div>

                {/* Compact Language Selector */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                  {[
                    { id: 'tr-en', label: 'TR+EN' },
                    { id: 'tr', label: 'TR' },
                    { id: 'en', label: 'EN' },
                    { id: 'de', label: 'DE' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguageMode(l.id as LanguageMode)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        languageMode === l.id
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Yolcu / Çanta Sahibi Adı Soyadı
                </Label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 font-bold text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Country Code & Phone Input */}
              <div>
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Uluslararası Telefon Numarası
                </Label>
                <div className="flex gap-2">
                  <select
                    value={countryIndex}
                    onChange={(e) => setCountryIndex(Number(e.target.value))}
                    className="w-36 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    {COUNTRY_CODES.map((c, idx) => (
                      <option key={c.code} value={idx}>
                        {c.flag} {c.code} ({c.dialCode})
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={COUNTRY_CODES[countryIndex]?.formatPlaceholder || '532 123 4567'}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Check size={11} className="text-emerald-500" />
                  Format: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">+{getFullInternationalNumber()}</span>
                </p>
              </div>

              {/* QR Action Type Pills */}
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  QR Kod Tarandığında Gerçekleşecek Eylem:
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: '💬 WhatsApp Mesajı', desc: 'Sohbet açar' },
                    { id: 'call', label: '📞 Doğrudan Arama', desc: 'Numarayı arar' },
                    { id: 'vcard', label: '🪪 Dijital Kartvizit', desc: 'Kişi kaydeder' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQrActionType(q.id as any)}
                      className={`p-2.5 rounded-xl text-left cursor-pointer transition-all border ${
                        qrActionType === q.id
                          ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 font-bold ring-1 ring-sky-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{q.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* WhatsApp Pre-filled message (only if whatsapp selected) */}
              {qrActionType === 'whatsapp' && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Önceden Doldurulmuş WhatsApp Mesajı:
                    </span>
                    <a
                      href={activeQrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                    >
                      Test Et <ExternalLink size={11} />
                    </a>
                  </div>
                  <input
                    type="text"
                    value={customLostMessage}
                    onChange={(e) => setCustomLostMessage(e.target.value)}
                    placeholder="Mesaj metni..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}
            </Card>

            {/* Optional Collapsible Accordion: Seyahat & Ekstra Seçenekler */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={15} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Seyahat, Uçuş, Ödül & Çizgi Detayları
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">(Opsiyonel)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {isAdvancedOpen ? 'Gizle' : 'Genişlet'}
                  </span>
                  {isAdvancedOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isAdvancedOpen && (
                <div className="p-3.5 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Uçuş No / PNR (İsteğe Bağlı)
                      </Label>
                      <input
                        type="text"
                        value={flightNo}
                        onChange={(e) => setFlightNo(e.target.value)}
                        placeholder="Örn: TK 1983 / PNR: X8J9"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                        Hedef Şehir / Rota / Otel
                      </Label>
                      <input
                        type="text"
                        value={destinationRoute}
                        onChange={(e) => setDestinationRoute(e.target.value)}
                        placeholder="Örn: IST ➔ LHR (Londra)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      İkinci İletişim / E-Posta / Instagram
                    </Label>
                    <input
                      type="text"
                      value={altContact}
                      onChange={(e) => setAltContact(e.target.value)}
                      placeholder="Örn: emre.ozturk@email.com / @emre_tr"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ödül & Teşekkür Notu (Kayıp Önleme Teşviki)
                    </Label>
                    <input
                      type="text"
                      value={rewardOfferText}
                      onChange={(e) => setRewardOfferText(e.target.value)}
                      placeholder="Örn: 💰 Bulana Nakit Teşekkür Ödülü Verilecektir / Reward Offered"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs"
                    />
                  </div>

                  {/* Print Line Options */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPunchHoleGuide}
                        onChange={(e) => setShowPunchHoleGuide(e.target.checked)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>Asma Delik Kılavuzu</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showRewardBanner}
                        onChange={(e) => setShowRewardBanner(e.target.checked)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>Ödül Vaadi Şeridi</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCutLines}
                        onChange={(e) => setShowCutLines(e.target.checked)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>Kesme / Katlama Çizgisi</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showQrHintText}
                        onChange={(e) => setShowQrHintText(e.target.checked)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span>QR Tarama İpucu</span>
                    </label>
                  </div>
                </div>
              )}
            </Card>

            {/* Bottom Proceed Button */}
            <Button
              type="button"
              onClick={() => setActiveBottomTab('preview')}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Eye size={15} />
              Önizleme & Yazdır
            </Button>
          </motion.div>
        )}

        {/* TAB 3: ETİKET TİPİ (TEMPLATE SELECTION MODE) */}
        {activeBottomTab === 'types' && (
          <motion.div
            key="tab-types"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-2xl mx-auto space-y-3"
          >
            <Card className="p-4 space-y-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Luggage size={16} className="text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Bavul & Çanta Şablon Tipi Seçin
                  </span>
                </div>
                <button
                  type="button"
                  onClick={regenerateTagId}
                  className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900"
                >
                  <RefreshCw size={11} /> ID: {securityTagId}
                </button>
              </div>

              {/* 4 Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'square-compact', title: '⬛ 1:1 Tam Kare Kompakt', desc: '384x384px - Dev okunaklı yazı fontları, büyük telefon ve hızlı WhatsApp QR kod. Sıfır boşluk.', badge: 'Önerilen & Popüler' },
                  { id: 'wide-travel', title: '📄 Geniş Seyahat Kartı', desc: '384x530px - Standart dikey etiket formatı, detaylı seyahat rotası ve büyük QR kod.', badge: 'Klasik Bagaj' },
                  { id: 'flight-iata', title: '✈️ Uçuş & IATA Standart', desc: 'Havalimanı ve uçak seyahatleri için uçuş no, rota ve PNR güvenlik formatı.', badge: 'Havacılık' },
                  { id: 'foldable-loop', title: '🏷️ Sap Asma Kartı (Loop)', desc: 'Bavul sapına takılan delikli kılavuzlu ve çift yönlü katlanabilir şablon.', badge: 'Asılabilir' }
                ].map((t) => {
                  const isSelected = templateType === t.id || (t.id === 'square-compact' && templateType === 'smart-whatsapp') || (t.id === 'wide-travel' && templateType === 'executive-laptop');
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateType(t.id as TagTemplateType)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 ring-1 ring-sky-500 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {t.title}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveBottomTab('edit')}
                  className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 h-10"
                >
                  <Sliders size={14} className="mr-1.5 text-sky-500" />
                  Bilgileri Düzenle
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveBottomTab('preview')}
                  className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold h-10 shadow-xs"
                >
                  <Eye size={14} className="mr-1.5" />
                  Önizlemeyi Gör
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Offscreen Canvas for Rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ALT SABİT KAPSÜL GEZİNME MENÜSÜ (Floating Bottom Capsule Navigation Menu) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 select-none max-w-[calc(100vw-1.5rem)]">
        <button
          type="button"
          onClick={() => setActiveBottomTab('preview')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeBottomTab === 'preview'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Baskı Önizleme"
        >
          <Eye size={15} className="shrink-0" />
          {activeBottomTab === 'preview' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Önizleme</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomTab('edit')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeBottomTab === 'edit'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Etiket Bilgileri"
        >
          <Sliders size={15} className="shrink-0" />
          {activeBottomTab === 'edit' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Düzenleme</span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveBottomTab('types')}
          className={`h-9 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0 ${
            activeBottomTab === 'types'
              ? 'px-3.5 bg-teal-600 text-white shadow-md shadow-teal-600/25 gap-1.5'
              : 'w-9 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Etiket Şablon Tipi"
        >
          <Luggage size={15} className="shrink-0" />
          {activeBottomTab === 'types' && (
            <span className="whitespace-nowrap animate-in fade-in duration-200">Etiket Tipi</span>
          )}
        </button>
      </div>
    </div>
  );
};
