import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bug, X, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { PrinterService } from '../lib/printer';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose,
  printer,
  isConnected,
  onSwitchChannel,
  feedAmount,
  setFeedAmount,
  onAdvancePaper,
  isExtraDark,
  setIsExtraDark,
  onTestDarkness,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col"
        >
          {/* Header Bar */}
          <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Geri Dön"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <Bug size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                    Yazıcı Tanılama & Test Paneli
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Kağıt sürme, BLE hex testi, Zebra ZPL ve donanım kontrolü
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Kapat"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="max-w-2xl mx-auto pb-12">
              <DiagnosticsPanel 
                printer={printer} 
                isConnected={isConnected} 
                onSwitchChannel={onSwitchChannel}
                feedAmount={feedAmount}
                setFeedAmount={setFeedAmount}
                onAdvancePaper={onAdvancePaper}
                isExtraDark={isExtraDark}
                setIsExtraDark={setIsExtraDark}
                onTestDarkness={onTestDarkness}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
