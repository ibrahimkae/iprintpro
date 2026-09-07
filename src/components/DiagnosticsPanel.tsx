import React, { useState } from 'react';
import { PrinterService } from '../lib/printer';
import { usbPrinter } from '../lib/usb-printer';
import { Bug, Send, Zap, Activity, RefreshCw, Battery, ChevronDown, Minus, Plus, Settings2, Trash2, Usb, Cpu, Printer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { logger } from '../lib/logger';

interface DiagnosticsPanelProps {
  printer: PrinterService;
  isConnected: boolean;
  onSwitchChannel: () => void;
  feedAmount: number;
  setFeedAmount: (val: number) => void;
  onAdvancePaper: (amount: number) => void;
  isExtraDark: boolean;
  setIsExtraDark: (val: boolean) => void;
  onTestDarkness: () => void;
}

export function DiagnosticsPanel({ 
  printer, 
  isConnected, 
  onSwitchChannel, 
  feedAmount, 
  setFeedAmount, 
  onAdvancePaper,
  isExtraDark,
  setIsExtraDark,
  onTestDarkness
}: DiagnosticsPanelProps) {
  const [rawHex, setRawHex] = useState('');
  const [rawZpl, setRawZpl] = useState('^XA^FO50,50^ADN,36,20^FDZebra ZD220 Test^FS^XZ');

  const handleProbe = async (type: 'LUCK_JINGLE' | 'PHOMEMO' | 'STANDARD') => {
    if (!isConnected) {
      logger.warn('Connect to printer first!');
      return;
    }
    await printer.probeProtocol(type);
  };

  const handleSendRaw = async () => {
    if (!isConnected || !rawHex) return;
    await printer.sendRawHex(rawHex.replace(/\s/g, ''));
  };

  const handleSendZpl = async () => {
    if (!rawZpl) return;
    try {
      if (usbPrinter.isConnected) {
        const encoder = new TextEncoder();
        await usbPrinter.sendRaw(encoder.encode(rawZpl + '\n'));
        logger.info('ZPL komutu USB üzerinden başarıyla gönderildi.');
      } else {
        logger.warn('Kablolu USB veya Seri Zebra yazıcı bağlı değil.');
        alert('Lütfen önce Zebra ZD220 USB bağlantısını kurun.');
      }
    } catch (e: any) {
      logger.error('ZPL Gönderim Hatası', e);
      alert(`Hata: ${e?.message || e}`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Bug className="text-purple-600 dark:text-purple-400" size={18} />
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Gelişmiş Tanılama Araçları</h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-100 dark:border-purple-900/40 space-y-2.5">
            <div className="flex items-center justify-between">
               <p className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5"><Activity size={13}/> Kağıt Sür</p>
               <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-800">{feedAmount} Nokta</span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-purple-800 overflow-hidden px-2 h-9">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-400" onClick={() => setFeedAmount(Math.max(1, feedAmount - 10))}><Minus size={12}/></Button>
                <input title="Kağıt Sürme Miktarı" aria-label="Kağıt Sürme Nokta Sayısı" type="number" value={feedAmount} onChange={e => setFeedAmount(Number(e.target.value)||50)} className="flex-1 w-0 text-center text-xs font-bold bg-transparent border-none focus:outline-none dark:text-white" />
                <Button variant="ghost" size="icon" className="h-6 w-6 text-purple-400" onClick={() => setFeedAmount(feedAmount + 10)}><Plus size={12}/></Button>
              </div>
              <Button onClick={() => onAdvancePaper(feedAmount)} className="bg-purple-600 hover:bg-purple-700 rounded-lg h-9 shadow-sm flex-1 font-bold text-xs gap-1.5 transition-transform active:scale-95 text-white">
                <Send size={13}/> Sür
              </Button>
            </div>
          </div>

          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">iPrint (GB03) Özel Komutlar</p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                if (!isConnected) return;
                logger.info('iPrint: Pil Durumu Sorgulanıyor...');
                await printer.sendData(PrinterService.createLuckJinglePacket(0xA3, 0x00));
              }}
              className="text-[10px] h-8 rounded-lg border-purple-100 dark:border-slate-800 hover:bg-purple-50 font-bold"
            >
              <Battery size={13} className="mr-1 text-purple-500" /> Pil Durumu
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onTestDarkness}
              className={`text-[10px] h-8 rounded-lg border-orange-100 dark:border-slate-800 font-bold transition-all ${isExtraDark ? 'bg-orange-600 text-white border-orange-500' : 'hover:bg-orange-50 text-slate-700 dark:text-slate-200'}`}
            >
              <Zap size={13} className={`mr-1 ${isExtraDark ? 'text-white' : 'text-orange-500'}`} /> {isExtraDark ? 'Ekstra Koyu AKTİF' : 'Ekstra Koyu TEST'}
            </Button>
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-2.5 rounded-lg border border-orange-100 dark:border-slate-700 h-8">
               <Label className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase">Koyu Mod</Label>
               <input 
                 type="checkbox" 
                 checked={isExtraDark} 
                 onChange={(e) => setIsExtraDark(e.target.checked)}
                 className="w-3.5 h-3.5 accent-orange-600"
               />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                 if (!isConnected) return;
                 await printer.testPrint();
              }}
              className="text-[10px] h-8 rounded-lg border-teal-100 dark:border-slate-800 hover:bg-teal-50 font-bold"
            >
              <Activity size={13} className="mr-1 text-teal-500" /> Kendi Sınama
            </Button>
            <Button 
               variant="outline" 
               size="sm" 
               onClick={onSwitchChannel}
               className="text-[10px] h-8 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-50 font-bold col-span-2"
             >
                <RefreshCw size={12} className="mr-1 text-slate-400" /> Kanal Değiştir
              </Button>
          </div>
        </div>

        {/* Zebra & USB Termal Tanılama */}
        <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <Usb size={14} /> Zebra ZD220 (USB / ZPL) Tanılama
            </p>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              usbPrinter.isConnected
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {usbPrinter.isConnected ? 'USB Bağlı' : 'Bağlı Değil'}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Ham ZPL Kodu Gönder</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawZpl}
                onChange={(e) => setRawZpl(e.target.value)}
                placeholder="^XA^FO50,50^FDTest^FS^XZ"
                className="flex-1 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 dark:text-white"
              />
              <Button size="sm" onClick={handleSendZpl} className="bg-teal-600 hover:bg-teal-700 rounded-lg h-8 px-3 text-white">
                <Send size={13} />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diğer Protokol Taramaları</p>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleProbe('PHOMEMO')}
              className="text-[10px] h-8 rounded-lg border-blue-100 dark:border-slate-800 hover:bg-blue-50"
            >
              Phomemo/Peripage
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleProbe('STANDARD')}
              className="text-[10px] h-8 rounded-lg border-green-100 dark:border-slate-800 hover:bg-green-50"
            >
              Standart ESC/POS
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ham Komut Gönder (HEX)</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={rawHex}
              onChange={(e) => setRawHex(e.target.value)}
              placeholder="Örn: 1B 40 0A"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 dark:text-white"
            />
            <Button size="sm" onClick={handleSendRaw} className="bg-purple-600 hover:bg-purple-700 rounded-lg h-8 px-3 text-white">
              <Send size={13} />
            </Button>
          </div>
          <p className="text-[9px] text-slate-400">
            * Boşluklu veya bitişik hex kodları girebilirsiniz.
          </p>
        </div>

        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-100 dark:border-amber-900/40">
          <div className="flex gap-2">
            <Activity size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>İpucu:</strong> GB03 modelleri genellikle <strong>Luck Jingle</strong>, Zebra ZD220 modelleri ise <strong>ZPL (Kablolu USB)</strong> protokolünü kullanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
