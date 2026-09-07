import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  X, FileText, ChevronUp, ChevronDown, Trash2, Minus, Plus, RotateCw, Check
} from 'lucide-react';

export interface DocumentViewProps {
  pdfFiles: File[];
  setPdfFiles: React.Dispatch<React.SetStateAction<File[]>>;
  activePdfIndex: number;
  setActivePdfIndex: (i: number) => void;
  handlePdfSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  movePdf: (index: number, direction: 'up' | 'down') => void;
  printAllFiles: boolean;
  setPrintAllFiles: (v: boolean) => void;
  startPdfCrop: () => Promise<void>;
  savedCrops: { id: string; name: string; crops: any[] }[];
  activeProfileId: string | null;
  applySavedProfile: (id: string) => void;
  printCopies: number;
  setPrintCopies: (n: number) => void;
  pdfScale: number;
  setPdfScale: (n: number) => void;
  pdfPageRange: string;
  setPdfPageRange: (s: string) => void;
  pdfRotation: number;
  setPdfRotation: (fn: (r: number) => number) => void;
  onGeneratePreview: () => void;
  onBack: () => void;
}

export function DocumentView(p: DocumentViewProps) {
  const { t } = useTranslation();
  return (
    <motion.div key="document" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={p.onBack} className="rounded-lg bg-white dark:bg-slate-900 shadow-xs border border-slate-200 dark:border-slate-800 dark:text-slate-200 text-xs h-8"><X size={14} className="mr-1.5" /> {t('cancel')}</Button>
        <Button onClick={p.onGeneratePreview} disabled={p.pdfFiles.length === 0} className="rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 text-white shadow-xs font-bold text-xs h-8 px-4">{t('print_preview')}</Button>
      </div>

      {p.pdfFiles.length === 0 ? (
        <Card className="p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 flex flex-col items-center justify-center min-h-[220px] transition-all hover:bg-white dark:hover:bg-slate-900 overflow-hidden">
          <div className="relative group cursor-pointer text-center">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl inline-block mb-3 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors">
              <FileText size={48} className="text-slate-400 dark:text-slate-600 group-hover:text-teal-500" />
            </div>
            <p className="font-bold text-slate-600 dark:text-slate-300 text-xs uppercase tracking-tight">PDF veya Metin Belgesi Seç</p>
            <input type="file" accept=".pdf,.txt" onChange={p.handlePdfSelect} title="Dosya Seç" className="absolute inset-0 opacity-0 cursor-pointer"/>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Belge Listesi ({p.pdfFiles.length})</Label>
            <div className="relative">
              <Button variant="outline" size="sm" className="h-7 rounded-lg bg-teal-50 text-teal-600 border-teal-200 font-bold text-xs">+ Ekle</Button>
              <input type="file" accept=".pdf,.txt" onChange={p.handlePdfSelect} title="Dosya Ekle" className="absolute inset-0 opacity-0 cursor-pointer"/>
            </div>
          </div>

          <ScrollArea className="h-36 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2">
            <div className="space-y-1.5">
              {p.pdfFiles.map((file, idx) => (
                <div key={idx} onClick={() => p.setActivePdfIndex(idx)} className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${p.activePdfIndex === idx ? 'bg-white dark:bg-slate-800 border-teal-300 shadow-xs ring-1 ring-teal-200 dark:ring-teal-800' : 'bg-transparent border-transparent hover:bg-white/50'}`}>
                  <div className={`p-1.5 rounded-md ${p.activePdfIndex === idx ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}><FileText size={14} /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p><p className="text-[9px] text-slate-400">{(file.size/1024).toFixed(1)} KB</p></div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-teal-600" onClick={(e) => { e.stopPropagation(); p.movePdf(idx, 'up'); }} disabled={idx === 0}><ChevronUp size={12}/></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-teal-600" onClick={(e) => { e.stopPropagation(); p.movePdf(idx, 'down'); }} disabled={idx === p.pdfFiles.length - 1}><ChevronDown size={12}/></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={(e) => { e.stopPropagation(); p.setPdfFiles(prev => prev.filter((_, i) => i !== idx)); if(p.activePdfIndex >= idx) p.setActivePdfIndex(Math.max(0, p.activePdfIndex - 1)); }}><Trash2 size={12}/></Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-600 uppercase">Yazdırma Sırası</span>
                <div className="flex items-center gap-1 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/30" onClick={() => p.setPrintAllFiles(!p.printAllFiles)}>
                   <div className={`w-3 h-3 rounded-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center ${p.printAllFiles ? 'bg-teal-500 border-teal-500' : 'bg-white dark:bg-slate-900'}`}>{p.printAllFiles && <Check size={8} className="text-white" />}</div>
                   <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400">Kuyruğu Yazdır</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => void p.startPdfCrop()} className="h-7 rounded-lg border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold px-3 text-xs gap-1.5">✂️ Sayfayı Kırp</Button>
            </div>

            {p.savedCrops.length > 0 && (
              <div className="space-y-1.5">
                 <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kırpma Otomasyonu (Profil Seç)</Label>
                 <div className="flex gap-1.5 flex-wrap">
                    {p.savedCrops.map(profile => (
                      <Button
                        key={profile.id}
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await p.startPdfCrop();
                          p.applySavedProfile(profile.id);
                        }}
                        className={`h-7 rounded-lg border-dashed text-[10px] font-bold ${p.activeProfileId === profile.id ? 'bg-teal-50 border-teal-500 text-teal-600 dark:bg-teal-900/20' : 'bg-slate-50 dark:bg-slate-900 dark:border-slate-800 text-slate-600'}`}
                      >
                        {profile.name}
                      </Button>
                    ))}
                 </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kopya Sayısı</Label>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md dark:text-slate-300" onClick={()=>p.setPrintCopies(Math.max(1, p.printCopies-1))}><Minus size={12}/></Button>
                    <Input type="number" value={p.printCopies} onChange={e=>p.setPrintCopies(Math.max(1, parseInt(e.target.value)||1))} className="flex-1 border-none bg-transparent text-center font-bold h-7 p-0 text-xs dark:text-white" />
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md dark:text-slate-300" onClick={()=>p.setPrintCopies(p.printCopies+1)}><Plus size={12}/></Button>
                  </div>
               </div>
               <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ölçeklenme (%)</Label>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md dark:text-slate-300" onClick={()=>p.setPdfScale(Math.max(0.1, +(p.pdfScale-0.1).toFixed(1)))}><Minus size={12}/></Button>
                    <span className="flex-1 text-center font-bold text-xs dark:text-white">%{Math.round(p.pdfScale*100)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md dark:text-slate-300" onClick={()=>p.setPdfScale(Math.min(5, +(p.pdfScale+0.1).toFixed(1)))}><Plus size={12}/></Button>
                  </div>
               </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sayfa Aralığı / Döndürme</Label>
                <span className="text-[9.5px] font-medium text-slate-400">1-5, 8 veya hepsi</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={p.pdfPageRange} onChange={e=>p.setPdfPageRange(e.target.value)} placeholder="Örn: 1-5, 8 veya hepsi" className="rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white border-slate-200 dark:border-slate-700 font-bold h-9 text-xs flex-1" />
                <Button variant="outline" title="Sayfayı Döndür (90°)" onClick={()=>p.setPdfRotation(r => (r + 90) % 360)} className="rounded-lg h-9 px-3 border-slate-200 dark:border-slate-700 dark:text-slate-300 shrink-0"><RotateCw size={14} /></Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
