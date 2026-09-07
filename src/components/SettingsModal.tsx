import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, 
  X, 
  ArrowLeft, 
  Minus, 
  Plus, 
  Layout, 
  Zap, 
  Clock, 
  Check,
  Cpu,
  Layers,
  Sliders
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PrinterService } from '../lib/printer';
import { DitheringType } from '../lib/image-processing';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: PrinterService;
  prePrintFeed: number;
  setPrePrintFeed: React.Dispatch<React.SetStateAction<number>>;
  postPrintFeed: number;
  setPostPrintFeed: React.Dispatch<React.SetStateAction<number>>;
  printDelay: number;
  setPrintDelay: React.Dispatch<React.SetStateAction<number>>;
  darkness: number;
  setDarkness: React.Dispatch<React.SetStateAction<number>>;
  pageWidth: number;
  setPageWidth: React.Dispatch<React.SetStateAction<number>>;
  pageHeight: number;
  setPageHeight: React.Dispatch<React.SetStateAction<number>>;
  dithering: DitheringType;
  setDithering: React.Dispatch<React.SetStateAction<DitheringType>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  printer,
  prePrintFeed,
  setPrePrintFeed,
  postPrintFeed,
  setPostPrintFeed,
  printDelay,
  setPrintDelay,
  darkness,
  setDarkness,
  pageWidth,
  setPageWidth,
  pageHeight,
  setPageHeight,
  dithering,
  setDithering,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[96vh] flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Settings2 size={16} />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 leading-tight">
                    Yazıcı Çıktı & Donanım Ayarları
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    Koyuluk, kağıt payları, boyut standartları ve termal protokol
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                  title="Kapat"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Settings Body - 2 Column Compact Grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                {/* 1. Termal Baskı Koyuluğu (Darkness) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" />
                      <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Termal Baskı Koyuluğu</Label>
                    </div>
                    <span className="text-[11px] font-black font-mono bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-amber-800">
                      %{darkness}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer" 
                      onClick={() => setDarkness(p => Math.max(0, p - 5))}
                    >
                      <Minus size={12}/>
                    </Button>
                    <Slider 
                      value={[darkness]} 
                      onValueChange={(v) => Array.isArray(v) && setDarkness(v[0])} 
                      min={0} 
                      max={100} 
                      step={5} 
                      className="flex-1" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer" 
                      onClick={() => setDarkness(p => Math.min(100, p + 5))}
                    >
                      <Plus size={12}/>
                    </Button>
                  </div>

                  {/* Hazır Koyuluk Seviyeleri */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setDarkness(35)}
                      className={`text-[10px] py-1 rounded-md font-bold transition-all cursor-pointer ${
                        darkness <= 40
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Hafif (%35)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDarkness(60)}
                      className={`text-[10px] py-1 rounded-md font-bold transition-all cursor-pointer ${
                        darkness > 40 && darkness <= 75
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Normal (%60)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDarkness(90)}
                      className={`text-[10px] py-1 rounded-md font-bold transition-all cursor-pointer ${
                        darkness > 75
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Derin Siyah (%90)
                    </button>
                  </div>
                </div>

                {/* 2. Kağıt Boşluk & Yırtma Payı */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sliders size={14} className="text-teal-600 dark:text-teal-400" />
                      <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Kağıt Boşluğu & Yırtma Payı</Label>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      Ön: {prePrintFeed}mm | Son: {postPrintFeed}mm
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {/* Çıktı Başı */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-16 shrink-0">Başlangıç:</span>
                      <Slider 
                        value={[prePrintFeed]} 
                        onValueChange={(v) => Array.isArray(v) && setPrePrintFeed(v[0])} 
                        min={0} 
                        max={30} 
                        step={1} 
                        className="flex-1" 
                      />
                      <span className="text-[10px] font-mono font-bold w-10 text-right text-teal-700 dark:text-teal-300">
                        {prePrintFeed} mm
                      </span>
                    </div>

                    {/* Yırtma Payı */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-16 shrink-0">Yırtma Payı:</span>
                      <Slider 
                        value={[postPrintFeed]} 
                        onValueChange={(v) => Array.isArray(v) && setPostPrintFeed(v[0])} 
                        min={0} 
                        max={50} 
                        step={1} 
                        className="flex-1" 
                      />
                      <span className="text-[10px] font-mono font-bold w-10 text-right text-teal-700 dark:text-teal-300">
                        {postPrintFeed} mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Sayfa Boyutu & Hazır Standartlar */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layout size={14} className="text-indigo-600 dark:text-indigo-400" />
                      <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Sayfa Boyutu & Hazır Standartlar</Label>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {pageWidth}px × {pageHeight === 0 ? 'Sonsuz' : `${pageHeight}px`}
                    </span>
                  </div>

                  {/* 6 Adet Eşit Hizalı Buton Izgarası */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                    {[
                      { name: '57mm Mini (GB03)', w: 384, h: 0 },
                      { name: '80mm POS Fiş', w: 576, h: 0 },
                      { name: '10x10cm Kare', w: 800, h: 800 },
                      { name: '10x15cm Kargo', w: 800, h: 1200 },
                      { name: '15x10cm Yatay', w: 1200, h: 800 },
                      { name: '104mm Zebra', w: 832, h: 0 }
                    ].map((preset) => {
                      const isActive = pageWidth === preset.w && pageHeight === preset.h;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setPageWidth(preset.w);
                            setPageHeight(preset.h);
                          }}
                          className={`h-7 px-1.5 text-[10px] font-bold rounded-lg transition-all truncate border flex items-center justify-center cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-750'
                          }`}
                          title={preset.name}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Özel Piksel Girişi */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Genişlik:</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded cursor-pointer" onClick={() => setPageWidth(p => Math.max(128, p - 8))}><Minus size={10}/></Button>
                      <Input 
                        type="number" 
                        value={pageWidth} 
                        onChange={e => {
                          const val = Number(e.target.value) || 384;
                          setPageWidth(Math.ceil(val / 8) * 8);
                        }} 
                        className="h-5 p-0 text-center font-bold text-xs border-none bg-transparent dark:text-white" 
                      />
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded cursor-pointer" onClick={() => setPageWidth(p => p + 8)}><Plus size={10}/></Button>
                      <span className="text-[9px] text-slate-400 font-mono">px</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Uzunluk:</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded cursor-pointer" onClick={() => setPageHeight(p => Math.max(0, p - 10))}><Minus size={10}/></Button>
                      <Input 
                        type="number" 
                        value={pageHeight} 
                        onChange={e => setPageHeight(Number(e.target.value)||0)} 
                        className="h-5 p-0 text-center font-bold text-xs border-none bg-transparent dark:text-white" 
                      />
                      <Button variant="ghost" size="icon" className="h-5 w-5 rounded cursor-pointer" onClick={() => setPageHeight(p => p + 10)}><Plus size={10}/></Button>
                      <span className="text-[9px] text-slate-400 font-mono">{pageHeight === 0 ? '(0=Sonsuz)' : 'px'}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Yazıcı Protokolü */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={14} className="text-purple-600 dark:text-purple-400" />
                      <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Yazıcı Protokolü</Label>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                      {printer.getUserProtocolSetting() === 'auto' ? 'Otomatik' : printer.getUserProtocolSetting() === 'luckjingle' ? 'LuckJingle (GB Serisi)' : 'ESC/POS'}
                    </span>
                  </div>
                  <Select value={printer.getUserProtocolSetting()} onValueChange={(val: any) => printer.setProtocol(val)}>
                    <SelectTrigger className="rounded-lg h-8 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-lg dark:bg-slate-950 dark:border-slate-800">
                      <SelectItem value="auto" className="text-xs font-medium dark:text-slate-200">Otomatik Algıla (Önerilen)</SelectItem>
                      <SelectItem value="luckjingle" className="text-xs font-bold text-purple-600 dark:text-purple-400">LuckJingle / iPrint (GB01/02/03/C15)</SelectItem>
                      <SelectItem value="escpos" className="text-xs font-medium dark:text-slate-200">Standart ESC/POS (MTP / POS Termal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 5. Dithering (Noktalama Algoritması) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
                      <Label className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Dithering (Netlik)</Label>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Gecikme: {printDelay}ms
                    </span>
                  </div>
                  <Select value={dithering} onValueChange={(v: any) => setDithering(v)}>
                    <SelectTrigger className="rounded-lg h-8 text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-lg dark:bg-slate-950 dark:border-slate-800">
                      <SelectItem value="floyd-steinberg" className="text-xs font-medium dark:text-slate-200">Floyd-Steinberg (Yüksek Kalite & Fotoğraf)</SelectItem>
                      <SelectItem value="atkinson" className="text-xs font-medium dark:text-slate-200">Atkinson (Retro & Keskin Kontrast)</SelectItem>
                      <SelectItem value="stucki" className="text-xs font-medium dark:text-slate-200">Stucki (Detaylı Tonlama)</SelectItem>
                      <SelectItem value="bayer" className="text-xs font-medium dark:text-slate-200">Bayer (Düzenli Matris)</SelectItem>
                      <SelectItem value="jarvis-judice-ninke" className="text-xs font-medium dark:text-slate-200">Jarvis-Judice-Ninke (Pürüzsüz)</SelectItem>
                      <SelectItem value="fast-print" className="text-xs font-bold text-teal-600 dark:text-teal-400">Hızlı Baskı (Basit Eşikleme)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 hidden sm:block">
                Tüm ayarlar anında cihaz profilinize kaydedilir.
              </div>
              <Button 
                onClick={onClose} 
                className="w-full sm:w-auto px-6 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer ml-auto"
              >
                <Check size={14} /> Kaydet & Kapat
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
