import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  History, 
  Settings2, 
  Bug, 
  Bluetooth, 
  Usb, 
  Printer, 
  Moon, 
  Sun, 
  Globe, 
  Terminal, 
  User, 
  Check, 
  Lock, 
  ChevronRight, 
  LogOut,
  Sparkles,
  Zap,
  Monitor
} from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenDiagnostics: () => void;
  onOpenConnection: () => void;
  onOpenAuth: () => void;
  isConnected: boolean;
  isUsbConnected: boolean;
  batteryLevel: number | null;
  authStatus: 'none' | 'guest' | 'authenticated';
  authEmail: string | null;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentLanguage: string;
  onToggleLanguage: () => void;
  showConsole: boolean;
  onToggleConsole: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenHistory,
  onOpenSettings,
  onOpenDiagnostics,
  onOpenConnection,
  onOpenAuth,
  isConnected,
  isUsbConnected,
  batteryLevel,
  authStatus,
  authEmail,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  currentLanguage,
  onToggleLanguage,
  showConsole,
  onToggleConsole,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Slide Drawer from Left */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-[300px] sm:w-[340px] max-w-[85vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-xs">
                  <Printer size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    iPrint Pro
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Hızlı Menü & Ayarlar
                  </p>
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

            {/* Drawer Content */}
            <ScrollArea className="flex-1 px-3 py-3 space-y-4">
              {/* Printer Quick Status Card */}
              <div 
                onClick={() => {
                  onClose();
                  onOpenConnection();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer mb-3 ${
                  (isConnected || isUsbConnected)
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      (isConnected || isUsbConnected)
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isUsbConnected ? <Usb size={16} /> : <Bluetooth size={16} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                        {isUsbConnected ? 'Zebra USB Yazıcı' : isConnected ? 'Bluetooth Yazıcı' : 'Yazıcı Bağlı Değil'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {(isConnected || isUsbConnected)
                          ? (batteryLevel !== null ? `Pil: %${batteryLevel} • Dokunun` : 'Bağlantıyı Yönet')
                          : 'Bağlanmak için dokunun'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-slate-400" />
                </div>
              </div>

              {/* SECTION: Quick Actions */}
              <div className="space-y-1 mb-4">
                <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  İşlemler & Araçlar
                </div>

                {/* Print History & Drafts */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenHistory();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      <History size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Yazdırma Geçmişi & Taslaklar</div>
                      <div className="text-[10px] text-slate-400">Kaydedilen taslaklar ve çıktılar</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenSettings();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                      <Settings2 size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Yazıcı & Çıktı Ayarları</div>
                      <div className="text-[10px] text-slate-400">Koyuluk, dithering, kağıt tipi</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
                </button>

                {/* Diagnostics */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenDiagnostics();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:purple-teal-400 group-hover:scale-105 transition-transform">
                      <Bug size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Yazıcı Tanılama & Test</div>
                      <div className="text-[10px] text-slate-400">Hız testi, karakter seti kontrolü</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-500 transition-colors" />
                </button>
              </div>

              {/* SECTION: Preferences */}
              <div className="space-y-1 mb-4">
                <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Görünüm & Sistem
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-500">
                      {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isDarkMode ? 'Karanlık Tema' : 'Aydınlık Tema'}
                      </div>
                      <div className="text-[10px] text-slate-400">Göz yormayan karanlık mod</div>
                    </div>
                  </div>
                  <Switch 
                    checked={isDarkMode} 
                    onCheckedChange={onToggleDarkMode} 
                  />
                </div>

                {/* Language Toggle */}
                <button
                  onClick={onToggleLanguage}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                      <Globe size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Uygulama Dili</div>
                      <div className="text-[10px] text-slate-400">Türkçe / English</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-black bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                    {currentLanguage.toUpperCase()}
                  </span>
                </button>

                {/* Debug Console */}
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <Terminal size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Hata Konsolu</div>
                      <div className="text-[10px] text-slate-400">Canlı log ve BLE bildirimleri</div>
                    </div>
                  </div>
                  <Switch 
                    checked={showConsole} 
                    onCheckedChange={onToggleConsole} 
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Drawer Footer: User Account */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
              {authStatus === 'authenticated' ? (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                      <Check size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {authEmail}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Pro Lisans Aktif
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="h-7 px-2 text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg shrink-0"
                    title="Çıkış Yap"
                  >
                    <LogOut size={13} />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full h-9 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-2 shadow-xs cursor-pointer"
                >
                  <User size={14} />
                  <span>{authStatus === 'guest' ? 'Misafir • Giriş Yap' : 'Giriş Yap / Ücretsiz Kayıt'}</span>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
