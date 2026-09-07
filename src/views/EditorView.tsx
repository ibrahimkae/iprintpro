import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  X, Code, FileCode, Minus, Plus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Underline, Bold, Italic, Strikethrough,
  Calendar, CheckSquare, Hash, Copy, Check, Save,
  Bookmark, Trash2, Eye, Scissors, Ruler, FileText, Tag, ShoppingCart, ListChecks,
  Edit2, Sparkles, CornerDownLeft, RotateCcw, RotateCw, Printer, RefreshCw,
  ChevronDown, ChevronUp, MoveVertical, List, ListOrdered, Indent, Outdent, Type
} from 'lucide-react';

// Profesyonel Hazır HTML Şablonları
export const PRESET_HTML_TEMPLATES = [
  {
    id: 'basit',
    label: 'Basit',
    sampleText: 'BAŞLIK ALANI\nBuraya detaylı metin veya açıklamanızı yazabilirsiniz.',
    html: `<html>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 10px;">
  <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0; border-bottom: 2px solid #000; padding-bottom: 6px;">{{BASLIK}}</h2>
  <p style="font-size: 13px; margin: 8px 0; line-height: 1.5; color: #111;">{{METIN}}</p>
  <div style="margin-top: 12px; border-top: 1px dashed #000; padding-top: 6px; font-size: 10px; color: #444;">{{TARIH}} - {{SAAT}}</div>
</body>
</html>`
  },
  {
    id: 'tablo',
    label: 'Tablo',
    sampleText: 'ÜRÜN ADİSYONU\n1x Izgara Köfte - 150 TL\n1x Ayran - 20 TL',
    html: `<html>
<body style="font-family: monospace; padding: 6px;">
  <h3 style="text-align: center; font-size: 16px; margin: 0 0 8px 0; border-bottom: 2px solid #000; padding-bottom: 4px;">{{BASLIK}}</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin: 6px 0;">
    <thead>
      <tr style="border-bottom: 1.5px solid #000; text-align: left;">
        <th style="padding: 4px 0;">AÇIKLAMA</th>
        <th style="padding: 4px 0; text-align: right;">TUTAR</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px dashed #888;">
        <td style="padding: 6px 0;">{{METIN}}</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold;">170.00 ₺</td>
      </tr>
    </tbody>
  </table>
  <div style="border-top: 2px double #000; margin-top: 6px; padding-top: 4px; text-align: right; font-weight: bold; font-size: 12px;">GENEL TOPLAM: 170.00 ₺</div>
  <div style="text-align: center; margin-top: 10px; font-size: 10px;">{{TARIH}} {{SAAT}}</div>
</body>
</html>`
  },
  {
    id: 'kutu',
    label: 'Kutu',
    sampleText: 'ÖNEMLİ BİLGİ\nLütfen teslimat fişini ürün teslimine kadar saklayınız.',
    html: `<html>
<body style="font-family: monospace; padding: 4px;">
  <div style="border: 2px solid #000; border-radius: 8px; padding: 12px; text-align: center;">
    <h2 style="margin: 0 0 8px 0; font-size: 18px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 6px;">{{BASLIK}}</h2>
    <div style="margin: 10px 0; font-size: 13px; line-height: 1.4;">{{METIN}}</div>
    <div style="border-top: 1px dashed #000; margin-top: 10px; padding-top: 6px; font-size: 10px; font-weight: bold;">TARIH: {{TARIH}} {{SAAT}}</div>
  </div>
</body>
</html>`
  },
  {
    id: 'fis',
    label: 'Fiş',
    sampleText: 'MÜŞTERİ BİLGİ FİŞİ\n1x Espresso - 50 TL\n1x Su - 15 TL',
    html: `<html>
<body style="font-family: monospace; text-align: center; padding: 6px;">
  <div style="font-size: 18px; font-weight: bold; letter-spacing: 1px;">{{BASLIK}}</div>
  <div style="font-size: 10px; margin-top: 2px; color: #333;">SATIŞ VE İŞLEM FİŞİ</div>
  <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin: 8px 0; text-align: left; font-size: 12px; line-height: 1.4;">{{METIN}}</div>
  <div style="font-size: 10px; margin-top: 6px;">Tarih: {{TARIH}} | Saat: {{SAAT}}</div>
  <div style="font-size: 11px; font-weight: bold; margin-top: 10px; border-top: 1px solid #000; padding-top: 4px;">*** TEŞEKKÜR EDERİZ ***</div>
</body>
</html>`
  },
  {
    id: 'etiket',
    label: 'Etiket',
    sampleText: 'KOLİ ETİKETİ\nModel: X200 / Beden: XL',
    html: `<html>
<body style="font-family: monospace; padding: 4px;">
  <div style="border: 2px dashed #000; border-radius: 4px; padding: 10px; text-align: center;">
    <div style="font-size: 20px; font-weight: bold; letter-spacing: 1px;">{{BASLIK}}</div>
    <div style="border-top: 1.5px solid #000; border-bottom: 1.5px solid #000; margin: 8px 0; padding: 6px 0; font-size: 13px;">{{METIN}}</div>
    <div style="font-size: 10px; font-weight: bold; text-align: right;">STK: {{TARIH}}</div>
  </div>
</body>
</html>`
  },
  {
    id: 'kart',
    label: 'Kart',
    sampleText: 'İLETİŞİM KART\nAhmet Yılmaz\nGSM: 0532 000 00 00',
    html: `<html>
<body style="font-family: sans-serif; padding: 6px;">
  <div style="border: 1px solid #000; padding: 10px; border-radius: 6px;">
    <div style="font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 4px;">{{BASLIK}}</div>
    <div style="font-size: 12px; line-height: 1.5; padding: 4px 0;">{{METIN}}</div>
    <div style="text-align: right; font-size: 10px; margin-top: 8px; font-style: italic;">{{TARIH}} {{SAAT}}</div>
  </div>
</body>
</html>`
  }
];

// HTML'i Metne (Canlı Önizleme & Textarea Senkronizasyonu) dönüştürücü
export function parseHtmlToText(html: string, currentText: string = ''): string {
  if (!html || !html.trim()) return '';

  const now = new Date();
  const formattedDate = now.toLocaleDateString('tr-TR');
  const formattedTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  let processedHtml = html;

  const lines = currentText ? currentText.trim().split('\n') : [];
  const firstLine = lines[0] || '';
  const bodyLines = lines.length > 1 ? lines.slice(1).join('\n') : '';

  if (/{{BASLIK}}|{{baslik}}|{{TITLE}}|{{title}}|{{METIN}}|{{metin}}|{{TEXT}}|{{text}}/i.test(html)) {
    const titleVal = firstLine || 'Başlık';
    const bodyVal = bodyLines || (lines[0] ? '' : 'Açıklama / Metin');
    processedHtml = html
      .replace(/{{BASLIK}}|{{baslik}}|{{TITLE}}|{{title}}/gi, titleVal)
      .replace(/{{METIN}}|{{metin}}|{{TEXT}}|{{text}}/gi, bodyVal.replace(/\n/g, '<br>'))
      .replace(/{{TARIH}}|{{tarih}}|{{DATE}}|{{date}}/gi, formattedDate)
      .replace(/{{SAAT}}|{{saat}}|{{TIME}}|{{time}}/gi, formattedTime);
  } else {
    processedHtml = html
      .replace(/{{TARIH}}|{{tarih}}|{{DATE}}|{{date}}/gi, formattedDate)
      .replace(/{{SAAT}}|{{saat}}|{{TIME}}|{{time}}/gi, formattedTime);
  }

  return processedHtml
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, (match) => {
      let tableText = '';
      const rows = match.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
      rows.forEach((row) => {
        const cells = row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
        const rowContent = cells.map(cell => cell.replace(/<[^>]*>/g, '').trim()).filter(Boolean);
        if (rowContent.length > 0) {
          tableText += rowContent.join(' | ') + '\n';
        }
      });
      return tableText;
    })
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n────────────────────────\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<b>|<\/b>|<strong>|<\/strong>/gi, '')
    .replace(/<small[^>]*>|<\/small>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Metni HTML Koduna dönüştürücü (Anlık Çift Yönlü Senkronizasyon)
export function convertTextToHtml(text: string): string {
  if (!text || !text.trim()) {
    return '';
  }
  
  if (/<[a-z][\s\S]*>/i.test(text)) {
    if (/<html>[\s\S]*<\/html>/i.test(text)) return text;
    return `<html>\n<body>\n${text}\n</body>\n</html>`;
  }

  const lines = text.trim().split('\n');
  const firstLine = lines[0] || '';
  const bodyLines = lines.slice(1).join('<br>');

  if (lines.length === 1) {
    return `<html>
<body style="font-family: monospace; text-align: center; padding: 8px;">
  <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 4px;">${firstLine}</h2>
  <div style="font-size: 10px; margin-top: 8px; color: #444;">{{TARIH}} {{SAAT}}</div>
</body>
</html>`;
  }

  return `<html>
<body style="font-family: monospace; text-align: center; padding: 8px;">
  <h2 style="margin: 0 0 6px 0; font-size: 18px; font-weight: bold; border-bottom: 2px solid #000; padding-bottom: 4px;">${firstLine}</h2>
  <p style="margin: 8px 0; font-size: 13px; line-height: 1.4;">${bodyLines}</p>
  <div style="font-size: 10px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 4px; color: #444;">{{TARIH}} {{SAAT}}</div>
</body>
</html>`;
}
import { logger } from '../lib/logger';
import { historyStorage } from '../lib/history-storage';
import { customTextTemplatesStorage, CustomTextTemplate } from '../lib/custom-text-templates';
import { SavedDraftItem } from '../types';

// Önizlemeli ve Termal Baskıya Uygun Zengin Font Seçenekleri
export const FONT_OPTIONS = [
  { value: 'Outfit', label: 'Outfit', category: 'Modern Sans', style: { fontFamily: 'Outfit, sans-serif' } },
  { value: 'Inter', label: 'Inter', category: 'Sade & Net', style: { fontFamily: 'Inter, sans-serif' } },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', category: 'Fiş / Kod', style: { fontFamily: 'JetBrains Mono, monospace' } },
  { value: 'Courier New', label: 'Courier New', category: 'Daktilo Fişi', style: { fontFamily: 'Courier New, monospace' } },
  { value: 'VT323', label: 'VT323', category: 'Retro Dijital', style: { fontFamily: 'VT323, monospace', fontSize: '15px' } },
  { value: 'serif', label: 'Serif / Georgia', category: 'Klasik Kitap', style: { fontFamily: 'serif' } },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Lüks Başlık', style: { fontFamily: 'Playfair Display, serif' } },
  { value: 'Cinzel', label: 'Cinzel', category: 'Antik & Asil', style: { fontFamily: 'Cinzel, serif' } },
  { value: 'Caveat, cursive', label: 'Caveat', category: 'El Yazısı / Not', style: { fontFamily: 'Caveat, cursive', fontSize: '15px' } },
  { value: 'Comfortaa', label: 'Comfortaa', category: 'Yuvarlak & Şık', style: { fontFamily: 'Comfortaa, cursive' } },
  { value: 'Impact', label: 'Impact', category: 'Kalın Manşet', style: { fontFamily: 'Impact, sans-serif' } },
  { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'Net Sans', style: { fontFamily: 'Trebuchet MS, sans-serif' } },
];

export interface EditorViewProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  setSelectedText: (s: string) => void;
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  alignment: 'left' | 'center' | 'right' | 'justify';
  setAlignment: (a: 'left' | 'center' | 'right' | 'justify') => void;
  isBold: boolean;
  setIsBold: React.Dispatch<React.SetStateAction<boolean>>;
  isItalic: boolean;
  setIsItalic: React.Dispatch<React.SetStateAction<boolean>>;
  isUnderline: boolean;
  setIsUnderline: React.Dispatch<React.SetStateAction<boolean>>;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  customFonts: { name: string; url: string }[];
  handleFontUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showHtmlEditor: boolean;
  setShowHtmlEditor: React.Dispatch<React.SetStateAction<boolean>>;
  htmlTemplate: string;
  setHtmlTemplate: React.Dispatch<React.SetStateAction<string>>;
  pageWidth: number;
  lineHeight?: number;
  setLineHeight?: React.Dispatch<React.SetStateAction<number>>;
  onGeneratePreview: () => void;
  onBack: () => void;
  activeDraft?: { id: string; title: string; category: string } | null;
  onClearActiveDraft?: () => void;
}

// Varsayılan Hızlı Metin Şablonları
const DEFAULT_TEXT_TEMPLATES = [
  {
    id: 'tpl-todo',
    name: 'Yapılacaklar Listesi',
    icon: ListChecks,
    content: '📋 GÜNLÜK HEDEFLER & GÖREVLER\n────────────────────────────\n[ ] E-postaları kontrol et ve yanıtla\n[ ] Termal yazıcı test çıktılarını al\n[ ] Kargo paketlerini hazırla\n[ ] Gün sonu kapanış kontrolleri\n────────────────────────────\n✨ Küçük adımlar büyük sonuçlar doğurur.'
  },
  {
    id: 'tpl-shipping',
    name: 'Kargo & Adres Etiketi',
    icon: Tag,
    content: '════════════════════════════\n     KARGO TESLİMAT ETİKETİ\n════════════════════════════\nALICI : Ahmet Yılmaz\nTEL   : +90 (532) 123 45 67\nADRES : Atatürk Mah. İstiklal Cad.\n        No: 42 D: 5 Kadıköy / İST\n────────────────────────────\nNOT   : KIRILACAK EŞYA ⚠️\n════════════════════════════'
  },
  {
    id: 'tpl-market',
    name: 'Haftalık Market Listesi',
    icon: ShoppingCart,
    content: '🛒 MARKET & MUTFAK LİSTESİ\n────────────────────────────\n[ ] Süt & Peynir\n[ ] Ekmek & Yumurta\n[ ] Termal Rulo Kağıt\n[ ] Çay & Kahve\n[ ] Meyve / Sebze (Muz, Domates)\n[ ] Temizlik Malzemeleri\n────────────────────────────\nToplam Tahmini: _____ ₺'
  },
  {
    id: 'tpl-meeting',
    name: 'Toplantı & Görüşme Notu',
    icon: FileText,
    content: '📅 TOPLANTI NOTLARI\nTarih: ' + new Date().toLocaleDateString('tr-TR') + '\nKonu :\nKatılımcılar:\n────────────────────────────\nALINAN KARARLAR:\n1.\n2.\n3.\n────────────────────────────\nGÖREV DAĞILIMI & AKSİYON:\n[ ] '
  },
  {
    id: 'tpl-receipt-simple',
    name: 'Basit Satış & Fiş Formatı',
    icon: Hash,
    content: '       GURME KAHVE & FIRIN\n    Tel: 0216 123 45 67\n────────────────────────────\n1x Filtre Kahve ......... 90.00 ₺\n1x Kruvasan ............ 120.00 ₺\n1x Su ................... 20.00 ₺\n────────────────────────────\nTOPLAM TUTAR            230.00 ₺\nKDV DAHİLDİR\n────────────────────────────\nTeşekkür Eder, İyi Günler Dileriz!'
  }
];

export function EditorView(p: EditorViewProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active Tool Bar Tab: tools | text_templates | drafts
  const [activeToolTab, setActiveToolTab] = useState<'tools' | 'text_templates' | 'drafts'>('tools');
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Line Height State (WYSIWYG thermal printer spacing)
  const [localLineHeight, setLocalLineHeight] = useState<number>(1.35);
  const activeLineHeight = p.lineHeight !== undefined ? p.lineHeight : localLineHeight;
  const setLineHeight = (val: number) => {
    if (p.setLineHeight) {
      p.setLineHeight(val);
    } else {
      setLocalLineHeight(val);
    }
  };

  // Strikethrough style state
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  // Floating Bottom Dock & Panel State ('font' | 'paragraph' | 'tools' | null)
  const [activeBottomMenu, setActiveBottomMenu] = useState<'font' | 'paragraph' | 'tools' | null>(null);

  // Açılır/kapanır alt araçlar paneli - Varsayılan olarak KAPALI
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  // Undo / Redo History State
  const [historyStack, setHistoryStack] = useState<string[]>([p.text]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);

  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistoryStack(prev => {
      const currentHead = prev[historyIndex];
      if (p.text === currentHead) return prev;
      const nextStack = prev.slice(0, historyIndex + 1);
      nextStack.push(p.text);
      if (nextStack.length > 50) {
        nextStack.shift();
      } else {
        setHistoryIndex(nextStack.length - 1);
      }
      return nextStack;
    });
  }, [p.text]);

  const handleUndo = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      isUndoRedoAction.current = true;
      setHistoryIndex(prevIdx);
      p.setText(historyStack[prevIdx]);
    }
  };

  const handleRedo = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      isUndoRedoAction.current = true;
      setHistoryIndex(nextIdx);
      p.setText(historyStack[nextIdx]);
    }
  };

  // Drafts State
  const [savedDrafts, setSavedDrafts] = useState<SavedDraftItem[]>(() => 
    historyStorage.getDrafts().filter(d => d.category === 'editor')
  );

  // Custom Text Templates State
  const [customTemplates, setCustomTemplates] = useState<CustomTextTemplate[]>(() => 
    customTextTemplatesStorage.getTemplates()
  );
  const [showCustomTplModal, setShowCustomTplModal] = useState(false);
  const [editingTplId, setEditingTplId] = useState<string | null>(null);
  const [tplFormName, setTplFormName] = useState('');
  const [tplFormContent, setTplFormContent] = useState('');

  const refreshDrafts = () => {
    setSavedDrafts(historyStorage.getDrafts().filter(d => d.category === 'editor'));
  };

  const refreshCustomTemplates = () => {
    setCustomTemplates(customTextTemplatesStorage.getTemplates());
  };

  useEffect(() => {
    refreshDrafts();
  }, [p.activeDraft]);

  // HTML şablonu değiştiğinde metin kutusunu anında güncelle
  const handleHtmlTemplateChange = (newHtml: string) => {
    p.setHtmlTemplate(newHtml);
    if (!newHtml.trim()) {
      p.setText('');
      return;
    }
    const parsedText = parseHtmlToText(newHtml, p.text);
    p.setText(parsedText);
  };

  // Hazır HTML Şablonu seçildiğinde
  const handlePresetSelect = (presetObj: typeof PRESET_HTML_TEMPLATES[0]) => {
    p.setHtmlTemplate(presetObj.html);
    if (!p.text || !p.text.trim()) {
      p.setText(presetObj.sampleText);
    } else {
      const parsedText = parseHtmlToText(presetObj.html, p.text);
      if (parsedText) {
        p.setText(parsedText);
      }
    }
  };

  // Metin kutusu değiştiğinde HTML kodunu senkronize et
  const handleMainTextChange = (newText: string) => {
    p.setText(newText);
    if (!newText.trim()) {
      p.setHtmlTemplate('');
      return;
    }
    // HTML şablonu yoksa veya standart şablon kullanılıyorsa anında HTML senkronize et
    if (!p.htmlTemplate || !/{{BASLIK}}|{{baslik}}|{{METIN}}|{{metin}}/i.test(p.htmlTemplate)) {
      const updatedHtml = convertTextToHtml(newText);
      if (updatedHtml !== p.htmlTemplate) {
        p.setHtmlTemplate(updatedHtml);
      }
    }
  };

  // Save drafts to historyStorage
  const saveCurrentDraft = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!p.text.trim()) {
      alert('Kaydedilecek bir metin yazın.');
      return;
    }

    if (p.activeDraft && p.activeDraft.id) {
      const isUpdate = confirm(`"${p.activeDraft.title}" isimli taslak düzenleniyor.\n\n[Tamam] = Taslağı Güncelle (Üzerine Yaz)\n[İptal] = Yeni Taslak Olarak Kaydet`);
      if (isUpdate) {
        await historyStorage.updateDraft(p.activeDraft.id, {
          title: p.activeDraft.title,
          category: 'editor',
          payload: {
            text: p.text,
            fontSize: p.fontSize,
            fontFamily: p.fontFamily,
            alignment: p.alignment,
            isBold: p.isBold,
            isItalic: p.isItalic,
            isUnderline: p.isUnderline
          }
        });
        alert(`"${p.activeDraft.title}" taslağı başarıyla güncellendi!`);
        refreshDrafts();
        return;
      }
    }

    const defaultTitle = p.text.split('\n')[0]?.slice(0, 25) || 'Metin Taslağı';
    const name = prompt('Taslak için bir başlık girin:', p.activeDraft?.title || defaultTitle);
    if (name && name.trim()) {
      await historyStorage.saveDraft({
        title: name.trim(),
        category: 'editor',
        payload: {
          text: p.text,
          fontSize: p.fontSize,
          fontFamily: p.fontFamily,
          alignment: p.alignment,
          isBold: p.isBold,
          isItalic: p.isItalic,
          isUnderline: p.isUnderline
        }
      });
      alert(`"${name.trim()}" taslak olarak kaydedildi!`);
      refreshDrafts();
    }
  };

  const deleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await historyStorage.deleteDraft(id);
    refreshDrafts();
  };

  const loadDraft = (d: SavedDraftItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (d.payload?.text) p.setText(d.payload.text);
    if (d.payload?.fontSize) p.setFontSize(d.payload.fontSize);
    if (d.payload?.fontFamily) p.setFontFamily(d.payload.fontFamily);
    if (d.payload?.alignment) p.setAlignment(d.payload.alignment);
    if (d.payload?.isBold !== undefined) p.setIsBold(d.payload.isBold);
    if (d.payload?.isItalic !== undefined) p.setIsItalic(d.payload.isItalic);
    if (d.payload?.isUnderline !== undefined) p.setIsUnderline(d.payload.isUnderline);
    logger.info(`Taslak yüklendi: ${d.title}`);
  };

  // Helper to insert text at current cursor position without jumping scroll
  const insertTextAtCursor = (insertion: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const textarea = textareaRef.current;
    if (!textarea) {
      p.setText(prev => (prev ? prev + '\n' + insertion : insertion));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = p.text;
    const currentScrollTop = textarea.scrollTop;

    const newText = currentText.substring(0, start) + insertion + currentText.substring(end);
    p.setText(newText);

    // Keep cursor and scroll steady without scrolling the window
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.scrollTop = currentScrollTop;
        const newPos = start + insertion.length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  // Text Transformations (with stable scroll and Turkish locale support)
  const transformText = (type: 'upper' | 'lower' | 'title' | 'trim', e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!p.text) return;

    const textarea = textareaRef.current;
    const currentScrollTop = textarea ? textarea.scrollTop : 0;
    const start = textarea ? textarea.selectionStart : 0;
    const end = textarea ? textarea.selectionEnd : 0;

    let newText = p.text;
    if (type === 'upper') {
      newText = p.text.toLocaleUpperCase('tr-TR');
    } else if (type === 'lower') {
      newText = p.text.toLocaleLowerCase('tr-TR');
    } else if (type === 'title') {
      newText = p.text.replace(/(?:^|\s|\n)(\p{L})/gu, match => match.toLocaleUpperCase('tr-TR'));
    } else if (type === 'trim') {
      newText = p.text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }

    p.setText(newText);

    // Focus without jumping page scroll
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus({ preventScroll: true });
        textareaRef.current.scrollTop = currentScrollTop;
        textareaRef.current.setSelectionRange(start, end);
      }
    });
  };

  // Paragraf Madde İşaretli Liste (•) Ekle / Kaldır
  const toggleBulletList = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = p.text.substring(start, end);

    if (selected && selected.includes('\n')) {
      const lines = selected.split('\n');
      const allBulleted = lines.every(l => l.trim().startsWith('• ') || l.trim() === '');
      const newLines = lines.map(l => {
        if (!l.trim()) return l;
        return allBulleted ? l.replace(/^(\s*)•\s*/, '$1') : (l.startsWith('• ') ? l : `• ${l}`);
      });
      insertTextAtCursor(newLines.join('\n'));
    } else {
      const lines = p.text.split('\n');
      let charCount = 0;
      let lineIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const nextCount = charCount + lines[i].length + 1;
        if (start >= charCount && start <= nextCount) {
          lineIndex = i;
          break;
        }
        charCount = nextCount;
      }
      const curLine = lines[lineIndex] || '';
      if (curLine.trim().startsWith('• ')) {
        lines[lineIndex] = curLine.replace(/^(\s*)•\s*/, '$1');
      } else {
        lines[lineIndex] = `• ${curLine}`;
      }
      p.setText(lines.join('\n'));
    }
  };

  // Paragraf Numaralı Liste (1., 2., 3.) Ekle / Kaldır
  const toggleNumberedList = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = p.text.substring(start, end);

    if (selected && selected.includes('\n')) {
      const lines = selected.split('\n');
      const allNumbered = lines.every(l => /^\s*\d+\.\s+/.test(l) || l.trim() === '');
      let num = 1;
      const newLines = lines.map(l => {
        if (!l.trim()) return l;
        if (allNumbered) {
          return l.replace(/^\s*\d+\.\s*/, '');
        } else {
          return `${num++}. ${l.replace(/^\s*(\d+\.\s*|•\s*|\[ \]\s*)?/, '')}`;
        }
      });
      insertTextAtCursor(newLines.join('\n'));
    } else {
      const lines = p.text.split('\n');
      let num = 1;
      const allNumbered = lines.every(l => /^\s*\d+\.\s+/.test(l) || l.trim() === '');
      const newLines = lines.map(l => {
        if (!l.trim()) return l;
        if (allNumbered) {
          return l.replace(/^\s*\d+\.\s*/, '');
        } else {
          return `${num++}. ${l.replace(/^\s*(\d+\.\s*|•\s*|\[ \]\s*)?/, '')}`;
        }
      });
      p.setText(newLines.join('\n'));
    }
  };

  // Paragraf Kontrol Listesi ([ ]) Ekle / Kaldır
  const toggleChecklist = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = p.text.substring(start, end);

    if (selected && selected.includes('\n')) {
      const lines = selected.split('\n');
      const allChecked = lines.every(l => l.trim().startsWith('[ ] ') || l.trim() === '');
      const newLines = lines.map(l => {
        if (!l.trim()) return l;
        return allChecked ? l.replace(/^(\s*)\[\s*\]\s*/, '$1') : (l.startsWith('[ ] ') ? l : `[ ] ${l}`);
      });
      insertTextAtCursor(newLines.join('\n'));
    } else {
      insertTextAtCursor('[ ] ');
    }
  };

  // Paragraf Başı Girintisi (4 boşluk ekle / kaldır)
  const handleIndent = (add: boolean, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = p.text.substring(start, end);

    if (selected) {
      const lines = selected.split('\n');
      const newLines = lines.map(l => {
        if (add) return `    ${l}`;
        return l.replace(/^(\s{1,4}|\t)/, '');
      });
      insertTextAtCursor(newLines.join('\n'));
    } else {
      if (add) {
        insertTextAtCursor('    ');
      } else {
        const lines = p.text.split('\n');
        const newText = lines.map(l => l.replace(/^(\s{1,4}|\t)/, '')).join('\n');
        p.setText(newText);
      }
    }
  };

  // Paragraf Boşlukları Düzenleme
  const handleParagraphSpacing = (mode: 'add' | 'remove', e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!p.text) return;
    if (mode === 'add') {
      const lines = p.text.split('\n');
      const spaced = lines.join('\n\n').replace(/\n{3,}/g, '\n\n');
      p.setText(spaced);
    } else {
      const compact = p.text.replace(/\n\s*\n+/g, '\n');
      p.setText(compact);
    }
  };

  // Custom Template Management
  const openNewCustomTemplateModal = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setEditingTplId(null);
    setTplFormName('');
    setTplFormContent(p.text || '');
    setShowCustomTplModal(true);
  };

  const openEditCustomTemplateModal = (tpl: CustomTextTemplate, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTplId(tpl.id);
    setTplFormName(tpl.name);
    setTplFormContent(tpl.content);
    setShowCustomTplModal(true);
  };

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplFormName.trim() || !tplFormContent.trim()) {
      alert('Lütfen şablon adı ve içeriğini doldurun.');
      return;
    }

    if (editingTplId) {
      customTextTemplatesStorage.updateTemplate(editingTplId, tplFormName.trim(), tplFormContent);
    } else {
      customTextTemplatesStorage.addTemplate(tplFormName.trim(), tplFormContent);
    }

    refreshCustomTemplates();
    setShowCustomTplModal(false);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Bu metin şablonunu silmek istediğinize emin misiniz?')) {
      customTextTemplatesStorage.deleteTemplate(id);
      refreshCustomTemplates();
    }
  };

  // Auto-expand textarea height dynamically so text is never trapped in a scroll box
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(100, textarea.scrollHeight)}px`;
    }
  }, [p.text, p.fontSize, p.fontFamily, p.isBold, p.isItalic, p.alignment, p.pageWidth]);

  // Metrics calculation
  const charCount = p.text.length;
  const wordCount = p.text.trim() ? p.text.trim().split(/\s+/).length : 0;
  const lineCount = p.text ? p.text.split('\n').length : 1;
  // Estimated thermal paper length (approx ~3.8mm per line at standard font)
  const estPaperHeightMm = Math.max(25, Math.round(lineCount * (p.fontSize * 0.38) + 18));
  const rollWidthMm = p.pageWidth <= 384 ? 57 : p.pageWidth <= 576 ? 80 : 104;

  const textAreaStyle: React.CSSProperties = {
    fontSize: `${p.fontSize}px`,
    textAlign: p.alignment === 'justify' ? 'left' : p.alignment,
    fontWeight: p.isBold ? 'bold' : 'normal',
    fontStyle: p.isItalic ? 'italic' : 'normal',
    textDecoration: [
      p.isUnderline ? 'underline' : '',
      isStrikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' ') || 'none',
    fontFamily: p.fontFamily,
    lineHeight: activeLineHeight
  };

  return (
    <motion.div key="editor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 pb-24">
      {/* Active Draft Indicator Banner */}
      {p.activeDraft && (
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="font-bold text-amber-900 dark:text-amber-200 truncate">
              📌 Metin Taslağı: "{p.activeDraft.title}"
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={saveCurrentDraft}
              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              Taslağı Güncelle
            </button>
            {p.onClearActiveDraft && (
              <button
                type="button"
                onClick={p.onClearActiveDraft}
                className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                title="Taslak Modundan Çık"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={p.onBack} 
          className="rounded-lg text-xs h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
        >
          <X size={14} className="mr-1" /> {t('cancel')}
        </Button>
        <div className="flex gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              const nextState = !p.showHtmlEditor;
              p.setShowHtmlEditor(nextState);
              if (nextState) {
                if (p.htmlTemplate) {
                  handleHtmlTemplateChange(p.htmlTemplate);
                } else if (p.text) {
                  p.setHtmlTemplate(convertTextToHtml(p.text));
                }
              }
            }}
            className={`h-8 w-8 rounded-lg ${p.showHtmlEditor ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200' : 'text-slate-500 border-slate-200 dark:border-slate-800'}`}
            title="HTML Şablon Motoru"
          >
            <Code size={14}/>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              setShowClearConfirm(true);
            }}
            className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Sayfa İçeriğini Temizle"
          >
            <Trash2 size={14} />
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              p.onGeneratePreview();
            }}
            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 h-8 shadow-xs gap-1 cursor-pointer"
          >
            <Printer size={13} /> Yazdır
          </Button>
        </div>
      </div>

      {/* HTML Editor Panel (When toggled) */}
      {p.showHtmlEditor && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <FileCode size={13} className="text-indigo-600 dark:text-indigo-400"/>
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">HTML Şablon Motoru</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded-md ml-1 flex items-center gap-1">
              <RefreshCw size={9} className="animate-spin text-emerald-600" /> Anlık Senkronize
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={() => p.setShowHtmlEditor(false)} className="ml-auto h-5 w-5 rounded-md p-0"><X size={10}/></Button>
          </div>
          <textarea
            value={p.htmlTemplate}
            onChange={(e) => handleHtmlTemplateChange(e.target.value)}
            className="w-full h-28 text-[11px] p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 dark:bg-slate-900 dark:text-slate-200 font-mono resize-none leading-tight"
            placeholder="Full HTML desteklenir - {{BASLIK}}, {{METIN}}, {{TARIH}}, {{SAAT}} değişkenleri"
          />
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex flex-wrap gap-1">
              {PRESET_HTML_TEMPLATES.map((tpl) => (
                <Button
                  key={tpl.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(tpl)}
                  className="text-[9px] h-6 px-2.5 rounded-md font-semibold bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer"
                >
                  {tpl.label}
                </Button>
              ))}
            </div>
            <span className="text-[9px] text-indigo-500 font-mono">Değişkenler: &#123;&#123;BASLIK&#125;&#125;, &#123;&#123;METIN&#125;&#125;, &#123;&#123;TARIH&#125;&#125;, &#123;&#123;SAAT&#125;&#125;</span>
          </div>
        </div>
      )}

      {/* Main Thermal Canvas Text Area Card */}
      <div className="flex flex-col items-center">
        <Card
          className="rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 w-full overflow-hidden transition-all relative"
          style={{ maxWidth: `${Math.min(p.pageWidth, window.innerWidth - 32)}px` }}
        >
          {/* Taslak Kaydet, Geri/İleri Al ve Canlı Ölçü Şeridi (Üst Şerit) */}
          <div className="bg-slate-100 dark:bg-slate-800/90 px-3 pb-1.5 pt-1.5 -mt-[18px] ml-0 mb-0 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono select-none">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={saveCurrentDraft}
                className="h-6.5 px-2.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200/80 dark:border-purple-800/80 rounded-md gap-1 cursor-pointer shadow-2xs"
              >
                <Save size={11} /> Taslak Kaydet
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="h-6.5 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200/80 dark:border-slate-700/80 rounded-md gap-1 cursor-pointer"
                title="Geri Al"
              >
                <RotateCcw size={11} /> Geri
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= historyStack.length - 1}
                className="h-6.5 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 disabled:opacity-30 border border-slate-200/80 dark:border-slate-700/80 rounded-md gap-1 cursor-pointer"
                title="İleri Al"
              >
                <RotateCw size={11} /> İleri
              </Button>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
              <span>{rollWidthMm} × {estPaperHeightMm} mm</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={p.text}
            onChange={(e) => handleMainTextChange(e.target.value)}
            onSelect={(e) => {
              const target = e.target as HTMLTextAreaElement;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              if (start !== end) {
                p.setSelectedText(p.text.substring(start, end));
              }
            }}
            placeholder={t('editor.placeholder') || 'Yazdırmak istediğiniz metni buraya yazın veya şablon seçin...'}
            className="w-full bg-transparent border-none focus:ring-0 resize-none px-3.5 py-2.5 dark:text-slate-100 dark:placeholder:text-slate-600 text-xs leading-relaxed overflow-hidden block"
            style={{ ...textAreaStyle, minHeight: '100px', overflowY: 'hidden' }}
          />

          {/* Hizalanmış Kopyala & Durum Metre Çubuğu (Alt Şerit - Üst şerit ile simetrik ve hizalı) */}
          <div className="bg-slate-50 dark:bg-slate-800/70 px-3 py-1.5 mt-0 -mb-[18px] border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-mono select-none">
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <span>{charCount}</span> <span className="text-[10px] text-slate-400 font-normal">Krk</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <span>{wordCount}</span> <span className="text-[10px] text-slate-400 font-normal">Kelime</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                <span>{lineCount}</span> <span className="text-[10px] text-slate-400 font-normal">Satır</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(p.text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="h-6.5 px-2.5 text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md gap-1 cursor-pointer shadow-2xs"
              >
                {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 FLOATING TOOL PANELS & BOTTOM CAPSULE DOCK (PIXEL CANVAS STYLE) */}
      {/* ========================================================================= */}

      {/* Floating Tool Panels with AnimatePresence */}
      <AnimatePresence>
        {activeBottomMenu && (
          <>
            {/* Soft Backdrop to close when clicking outside without blurring background text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 pointer-events-auto"
              onClick={() => setActiveBottomMenu(null)}
            />

            {/* Floating In-Place Panel Container - Same compact size matching font menu */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className="fixed bottom-14 sm:bottom-15 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] z-50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3 max-h-[295px] overflow-y-auto space-y-2.5"
            >
              {/* 1. FONT & YAZI BİÇİMİ MENÜSÜ */}
              {activeBottomMenu === 'font' && (
                <div className="space-y-2.5">
                  {/* Panel Başlığı */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <Type size={14} className="text-teal-600" />
                      <span>Font & Yazı Biçimi</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveBottomMenu(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Kapat"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Font Ailesi */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                        Font Ailesi
                      </Label>
                      <label className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-0.5">
                        <span>+ Özel Font</span>
                        <input type="file" accept=".ttf,.woff,.woff2" onChange={p.handleFontUpload} className="hidden" />
                      </label>
                    </div>
                    <Select value={p.fontFamily} onValueChange={(v) => v && p.setFontFamily(v)}>
                      <SelectTrigger className="w-full rounded-lg font-bold h-8 text-xs bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Font Seçin" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg max-h-72">
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value} className="py-2 cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-3">
                              <span style={f.style} className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                {f.label}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans shrink-0 font-normal">
                                {f.category}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        {p.customFonts.map(f => (
                          <SelectItem key={f.name} value={f.name} className="py-2 cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-3">
                              <span style={{ fontFamily: f.name }} className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                {f.name}
                              </span>
                              <span className="text-[10px] text-teal-500/80 font-sans shrink-0 font-normal">
                                Özel Yüklenen
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Boyutu */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Yazı Boyutu</Label>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded font-mono">
                        {p.fontSize}px
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => p.setFontSize(prev => Math.max(10, prev - 1))}
                        className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                        title="Küçült (-1px)"
                      >
                        <Minus size={13} />
                      </Button>
                      <Input
                        type="number"
                        value={p.fontSize}
                        onChange={e => p.setFontSize(Number(e.target.value) || 24)}
                        className="h-8 text-center text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-16 shrink-0"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => p.setFontSize(prev => Math.min(180, prev + 1))}
                        className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                        title="Büyüt (+1px)"
                      >
                        <Plus size={13} />
                      </Button>
                      <div className="flex-1 px-1 flex items-center">
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={p.fontSize}
                          onChange={(e) => p.setFontSize(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                          title={`Boyut: ${p.fontSize}px`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Karakter Stilleri */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Karakter Biçimi</Label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <Button
                        type="button"
                        variant={p.isBold ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setIsBold(!p.isBold)}
                        className={`h-8 rounded-lg font-bold cursor-pointer ${p.isBold ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="Kalın"
                      >
                        <Bold size={13} className="mr-1" /> Kalın
                      </Button>
                      <Button
                        type="button"
                        variant={p.isItalic ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setIsItalic(!p.isItalic)}
                        className={`h-8 rounded-lg italic cursor-pointer ${p.isItalic ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="İtalik"
                      >
                        <Italic size={13} className="mr-1" /> İtalik
                      </Button>
                      <Button
                        type="button"
                        variant={p.isUnderline ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setIsUnderline(!p.isUnderline)}
                        className={`h-8 rounded-lg cursor-pointer ${p.isUnderline ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="Altı Çizili"
                      >
                        <Underline size={13} className="mr-1" /> Altı Çizili
                      </Button>
                      <Button
                        type="button"
                        variant={isStrikethrough ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsStrikethrough(!isStrikethrough)}
                        className={`h-8 rounded-lg cursor-pointer ${isStrikethrough ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="Üstü Çizili"
                      >
                        <Strikethrough size={13} className="mr-1" /> Üstü Çizili
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. PARAGRAF & HİZALAMA MENÜSÜ - Font Menüsü ile Aynı Boyut ve Kompakt Düzen */}
              {activeBottomMenu === 'paragraph' && (
                <div className="space-y-2">
                  {/* Panel Başlığı */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <AlignLeft size={14} className="text-teal-600" />
                      <span>Paragraf & Hizalama</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveBottomMenu(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Kapat"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* 1. Satır: Hizalama Butonları */}
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Metin Hizalama</Label>
                    <div className="grid grid-cols-4 gap-1">
                      <Button
                        type="button"
                        variant={p.alignment === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setAlignment('left')}
                        className={`h-7.5 text-xs rounded-lg cursor-pointer ${p.alignment === 'left' ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="Sola Yasla"
                      >
                        <AlignLeft size={13} className="mr-1" /> Sola
                      </Button>
                      <Button
                        type="button"
                        variant={p.alignment === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setAlignment('center')}
                        className={`h-7.5 text-xs rounded-lg cursor-pointer ${p.alignment === 'center' ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="Ortala"
                      >
                        <AlignCenter size={13} className="mr-1" /> Orta
                      </Button>
                      <Button
                        type="button"
                        variant={p.alignment === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setAlignment('right')}
                        className={`h-7.5 text-xs rounded-lg cursor-pointer ${p.alignment === 'right' ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="Sağa Yasla"
                      >
                        <AlignRight size={13} className="mr-1" /> Sağa
                      </Button>
                      <Button
                        type="button"
                        variant={p.alignment === 'justify' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => p.setAlignment('justify')}
                        className={`h-7.5 text-xs rounded-lg cursor-pointer ${p.alignment === 'justify' ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                        title="İki Yana Yasla"
                      >
                        <AlignJustify size={13} className="mr-1" /> Yay
                      </Button>
                    </div>
                  </div>

                  {/* 2. Satır: Satır Aralığı & Harf Dönüşümü (Kompakt 2 Sütun) */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {/* Satır Aralığı */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                          <MoveVertical size={11} className="text-slate-500" /> Aralık
                        </Label>
                        <span className="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400">{activeLineHeight}x</span>
                      </div>
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                        {[
                          { label: '1.15', val: 1.15, title: 'Sıkışık' },
                          { label: '1.35', val: 1.35, title: 'Normal' },
                          { label: '1.6', val: 1.6, title: 'Rahat' },
                          { label: '1.9', val: 1.9, title: 'Geniş' }
                        ].map(lh => (
                          <button
                            key={lh.val}
                            type="button"
                            onClick={() => setLineHeight(lh.val)}
                            title={lh.title}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all text-center cursor-pointer ${
                              activeLineHeight === lh.val
                                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            {lh.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Harf Dönüşümü */}
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-slate-500">Harf Dönüşümü</Label>
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => transformText('upper', e)}
                          className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer p-0"
                          title="Tümünü BÜYÜK yap"
                        >
                          ABC
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => transformText('lower', e)}
                          className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer p-0"
                          title="Tümünü küçük yap"
                        >
                          abc
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => transformText('title', e)}
                          className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer p-0"
                          title="Baş Harf Büyüt"
                        >
                          Abc
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Satır: Paragraf & Liste Biçimleri (Kompakt) */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-4 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleBulletList}
                        className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-1 cursor-pointer"
                        title="Madde İşaretli Liste"
                      >
                        <List size={12} className="mr-1 text-slate-600 dark:text-slate-400" /> Madde
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleNumberedList}
                        className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-1 cursor-pointer"
                        title="Sıralı Liste"
                      >
                        <ListOrdered size={12} className="mr-1 text-slate-600 dark:text-slate-400" /> Sıralı
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleIndent(true, e)}
                        className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-1 cursor-pointer"
                        title="Girinti Ekle"
                      >
                        <Indent size={12} className="mr-1 text-slate-600 dark:text-slate-400" /> Girinti
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleIndent(false, e)}
                        className="h-7 text-[10px] font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 px-1 cursor-pointer"
                        title="Girintiyi Kaldır"
                      >
                        <Outdent size={12} className="mr-1 text-slate-600 dark:text-slate-400" /> Kaldır
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-0.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleChecklist}
                        className="h-6.5 text-[9px] px-1 font-bold rounded-md bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer truncate"
                        title="Onay Kutusu Ekle"
                      >
                        [✓] Kontrol
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleParagraphSpacing('add', e)}
                        className="h-6.5 text-[9px] px-1 font-bold rounded-md bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer truncate"
                        title="Paragraf Boşluğu Ekle"
                      >
                        + Boşluk
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleParagraphSpacing('remove', e)}
                        className="h-6.5 text-[9px] px-1 font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer truncate"
                        title="Boşlukları Temizle"
                      >
                        Boşluk Sil
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ARAÇLAR, ŞABLONLAR & TASLAKLAR MENÜSÜ - Font Menüsü ile Aynı Boyut ve Kompakt Düzen */}
              {activeBottomMenu === 'tools' && (
                <div className="space-y-2">
                  {/* Panel Başlığı */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <Sparkles size={14} className="text-teal-600" />
                      <span>Hızlı Araçlar, Şablonlar & Taslaklar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveBottomMenu(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title="Kapat"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Sub Tab Bar: ⚡ Hızlı Ekle | 📝 Şablonlar | 📂 Taslaklarım */}
                  <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('tools')}
                      className={`py-1 text-[10.5px] font-bold rounded-md transition-all text-center cursor-pointer ${activeToolTab === 'tools' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      ⚡ Hızlı Ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('text_templates')}
                      className={`py-1 text-[10.5px] font-bold rounded-md transition-all text-center cursor-pointer ${activeToolTab === 'text_templates' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      📝 Şablonlar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveToolTab('drafts')}
                      className={`py-1 text-[10.5px] font-bold rounded-md transition-all text-center cursor-pointer ${activeToolTab === 'drafts' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      📂 Taslak ({savedDrafts.length})
                    </button>
                  </div>

                  {/* 1. HIZLI EKLE TABI */}
                  {activeToolTab === 'tools' && (
                    <div className="space-y-1.5 pt-0.5">
                      {/* Tarih, Görev, Fiş, Fatura Toplam */}
                      <div className="space-y-0.5">
                        <Label className="text-[9px] font-bold uppercase text-slate-500">Hızlı Metin Öğeleri</Label>
                        <div className="grid grid-cols-4 gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              const now = new Date();
                              const dStr = `Tarih: ${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}\n`;
                              insertTextAtCursor(dStr, e);
                            }}
                            className="h-7 text-[9.5px] px-1 font-bold rounded-lg bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-400 cursor-pointer truncate"
                            title="Tarih & Saat Ekle"
                          >
                            <Calendar size={11} className="mr-0.5 text-teal-600 shrink-0" /> Tarih/Saat
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('[ ] Görev Kalemi\n', e)}
                            className="h-7 text-[9.5px] px-1 font-bold rounded-lg bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer truncate"
                            title="[ ] Görev Kalemi Ekle"
                          >
                            <CheckSquare size={11} className="mr-0.5 text-indigo-600 shrink-0" /> [ ] Görev
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('Ürün Adı ............ 0.00 ₺\n', e)}
                            className="h-7 text-[9.5px] px-1 font-bold rounded-lg bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer truncate"
                            title="Fiş Satırı Ekle"
                          >
                            <Hash size={11} className="mr-0.5 text-amber-600 shrink-0" /> Fiş Satırı
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('TOPLAM TUTAR ........ 0.00 ₺\n', e)}
                            className="h-7 text-[9.5px] px-1 font-bold rounded-lg bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer truncate"
                            title="Toplam Tutar Satırı Ekle"
                          >
                            <ShoppingCart size={11} className="mr-0.5 text-emerald-600 shrink-0" /> Toplam
                          </Button>
                        </div>
                      </div>

                      {/* Ayırıcı Çizgiler */}
                      <div className="space-y-0.5">
                        <Label className="text-[9px] font-bold uppercase text-slate-500">Ayırıcı Çizgiler</Label>
                        <div className="grid grid-cols-4 gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('──────', e)}
                            className="h-6.5 text-[9.5px] px-1 rounded-lg font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-400 cursor-pointer"
                            title="Düz Çizgi"
                          >
                            ──────
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('══════', e)}
                            className="h-6.5 text-[9.5px] px-1 rounded-lg font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400 cursor-pointer"
                            title="Çift Çizgi"
                          >
                            ══════
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('- - - ', e)}
                            className="h-6.5 text-[9.5px] px-1 rounded-lg font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 cursor-pointer"
                            title="Kesikli Çizgi"
                          >
                            - - -
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('• • • ', e)}
                            className="h-6.5 text-[9.5px] px-1 rounded-lg font-mono font-bold bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-400 cursor-pointer"
                            title="Noktalı Çizgi"
                          >
                            • • •
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('────────────────────────\n', e)}
                            className="h-6 text-[9px] px-1 rounded-md font-mono cursor-pointer truncate"
                          >
                            ── Tam Satır
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('════════════════════════\n', e)}
                            className="h-6 text-[9px] px-1 rounded-md font-mono cursor-pointer truncate"
                          >
                            ══ Çift Satır
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => insertTextAtCursor('┌────────────────────────┐\n│      BAŞLIK ALANI      │\n└────────────────────────┘\n', e)}
                            className="h-6 text-[9px] px-1 rounded-md font-mono font-bold cursor-pointer truncate"
                          >
                            [ ║ Kutu Başlık ║ ]
                          </Button>
                        </div>
                      </div>

                      {/* Hızlı Harf & Boşluk Temizleme */}
                      <div className="space-y-0.5 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-1">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => transformText('trim', e)} 
                            className="h-6.5 text-[9.5px] border border-slate-200 dark:border-slate-700 font-bold cursor-pointer"
                          >
                            Boşlukları Temizle
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowClearConfirm(true)} 
                            className="h-6.5 text-[9.5px] border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold cursor-pointer"
                          >
                            <Trash2 size={11} className="mr-1" /> Tümünü Temizle
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. METİN ŞABLONLARI TABI */}
                  {activeToolTab === 'text_templates' && (
                    <div className="space-y-1.5 pt-0.5 max-h-[180px] overflow-y-auto pr-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-bold uppercase text-slate-500">Metin Şablonları</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={openNewCustomTemplateModal}
                          className="h-5.5 text-[9px] px-2 font-bold text-teal-600 border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 rounded-md gap-1 cursor-pointer"
                        >
                          <Plus size={10} /> Özel Ekle
                        </Button>
                      </div>

                      {/* Hazır Sistem Şablonları */}
                      <div className="space-y-1">
                        <div className="grid grid-cols-1 gap-1">
                          {DEFAULT_TEXT_TEMPLATES.map((tpl) => {
                            const Icon = tpl.icon;
                            return (
                              <div
                                key={tpl.id}
                                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5 hover:border-teal-300 dark:hover:border-teal-700 transition-all"
                              >
                                <div className="flex items-center gap-1.5 overflow-hidden">
                                  <div className="p-1 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 shrink-0">
                                    <Icon size={12} />
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 truncate">{tpl.name}</span>
                                    <span className="text-[8.5px] text-slate-400 truncate">{tpl.content.split('\n')[0]}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (p.text.trim()) {
                                        insertTextAtCursor(`\n\n${tpl.content}\n`, e);
                                      } else {
                                        p.setText(tpl.content);
                                      }
                                    }}
                                    className="h-5.5 px-2 text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                  >
                                    Ekle
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Kişisel Şablonlar */}
                      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[9px] font-bold uppercase text-slate-400">
                          Kişisel Şablonlarım ({customTemplates.length})
                        </span>

                        {customTemplates.length === 0 ? (
                          <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-[9.5px] text-slate-500">Henüz özel metin şablonu eklenmedi.</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {customTemplates.map((tpl) => (
                              <div
                                key={tpl.id}
                                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5"
                              >
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-[10.5px] font-bold text-slate-800 dark:text-slate-200 truncate">{tpl.name}</span>
                                  <span className="text-[8.5px] text-slate-400 truncate">{tpl.content.slice(0, 35)}...</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (p.text.trim()) {
                                        insertTextAtCursor(`\n\n${tpl.content}\n`, e);
                                      } else {
                                        p.setText(tpl.content);
                                      }
                                    }}
                                    className="h-5.5 px-2 text-[9px] font-bold text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                  >
                                    Ekle
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => openEditCustomTemplateModal(tpl, e)}
                                    className="h-5.5 w-5.5 text-slate-500 hover:text-slate-800 rounded-md cursor-pointer"
                                    title="Düzenle"
                                  >
                                    <Edit2 size={10} />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => handleDeleteCustomTemplate(tpl.id, e)}
                                    className="h-5.5 w-5.5 text-red-400 hover:text-red-600 rounded-md cursor-pointer"
                                    title="Sil"
                                  >
                                    <Trash2 size={10} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. TASLAKLARIM TABI */}
                  {activeToolTab === 'drafts' && (
                    <div className="space-y-1.5 pt-0.5 max-h-[180px] overflow-y-auto pr-0.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9.5px] font-bold uppercase text-slate-500">Kayıtlı Taslaklarınız</Label>
                        <Button type="button" size="sm" variant="ghost" onClick={saveCurrentDraft} className="h-5.5 text-[9.5px] px-2 text-teal-600 font-bold cursor-pointer">
                          <Plus size={10} className="mr-1" /> Yeni Kaydet
                        </Button>
                      </div>

                      {savedDrafts.length === 0 ? (
                        <div className="text-center py-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                          <Bookmark size={18} className="mx-auto text-slate-400 mb-1" />
                          <p className="text-[10px] text-slate-500">Henüz kayıtlı taslak bulunmuyor.</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {savedDrafts.map((draft) => (
                            <div
                              key={draft.id}
                              onClick={(e) => loadDraft(draft, e)}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all group"
                            >
                              <div className="flex flex-col overflow-hidden mr-2">
                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{draft.title}</span>
                                <span className="text-[8.5px] text-slate-400 truncate">{draft.payload?.text?.slice(0, 35) || ''}...</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => deleteDraft(draft.id, e)}
                                  className="h-5.5 w-5.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                >
                                  <Trash2 size={11} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🧭 FLOATING BOTTOM CAPSULE NAVIGATION BAR (PIXEL CANVAS STYLE) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full border border-slate-200/90 dark:border-slate-800/90 shadow-xl flex items-center gap-1 sm:gap-1.5 whitespace-nowrap max-w-[calc(100vw-1.5rem)] select-none">
        {/* Font Butonu */}
        <button
          type="button"
          onClick={() => setActiveBottomMenu((prev) => (prev === 'font' ? null : 'font'))}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            activeBottomMenu === 'font'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Font Ailesi, Boyut & Biçimlendirme"
        >
          <Type size={14} className={activeBottomMenu === 'font' ? 'text-white' : 'text-teal-600 dark:text-teal-400'} />
          <span>Font</span>
        </button>

        {/* Paragraf Butonu */}
        <button
          type="button"
          onClick={() => setActiveBottomMenu((prev) => (prev === 'paragraph' ? null : 'paragraph'))}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            activeBottomMenu === 'paragraph'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Hizalama, Satır Aralığı & Paragraf Düzeni"
        >
          <AlignLeft size={14} className={activeBottomMenu === 'paragraph' ? 'text-white' : 'text-teal-600 dark:text-teal-400'} />
          <span>Paragraf</span>
        </button>

        {/* Araçlar Butonu */}
        <button
          type="button"
          onClick={() => setActiveBottomMenu((prev) => (prev === 'tools' ? null : 'tools'))}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            activeBottomMenu === 'tools'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Hızlı Araçlar, Şablonlar & Taslaklar"
        >
          <Sparkles size={14} className={activeBottomMenu === 'tools' ? 'text-white' : 'text-teal-600 dark:text-teal-400'} />
          <span>Araçlar</span>
          {savedDrafts.length > 0 && (
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeBottomMenu === 'tools'
                  ? 'bg-white/25 text-white'
                  : 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300'
              }`}
            >
              {savedDrafts.length}
            </span>
          )}
        </button>
      </div>

      {/* Özel Şablon Ekleme / Düzenleme Modalı */}
      {showCustomTplModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                {editingTplId ? 'Metin Şablonunu Düzenle' : 'Yeni Metin Şablonu Oluştur'}
              </span>
              <button
                type="button"
                onClick={() => setShowCustomTplModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomTemplate} className="space-y-2.5">
              <div>
                <Label className="text-[10px] font-bold text-slate-500">Şablon Başlığı</Label>
                <Input
                  value={tplFormName}
                  onChange={(e) => setTplFormName(e.target.value)}
                  placeholder="Örn: Garanti Notu, İade Şablonu..."
                  className="h-8 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-[10px] font-bold text-slate-500">Şablon İçeriği</Label>
                <textarea
                  value={tplFormContent}
                  onChange={(e) => setTplFormContent(e.target.value)}
                  placeholder="Şablon metnini buraya yazın..."
                  className="w-full h-28 text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-mono resize-none leading-relaxed mt-1"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomTplModal(false)}
                  className="h-8 text-xs rounded-lg"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sayfa İçeriğini Temizle Onay Modalı */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 bg-red-100 dark:bg-red-950/80 rounded-xl shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Sayfa Temizlensin mi?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Düzenleyicideki tüm metin ve içerikler silinecektir. Dilerseniz sonradan <span className="font-bold text-slate-700 dark:text-slate-300">Geri</span> butonuyla kurtarabilirsiniz.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowClearConfirm(false)}
                className="h-8 text-xs font-semibold rounded-lg cursor-pointer"
              >
                İptal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  p.setText('');
                  setShowClearConfirm(false);
                }}
                className="h-8 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Evet, Temizle
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
