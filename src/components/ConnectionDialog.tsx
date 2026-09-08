import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { usePrinter } from '../context/PrinterContext';
import { UsbPrinterService } from '../lib/usb-printer';
import { PrinterService } from '../lib/printer';
import { LABEL_DIMENSION_PRESETS, LabelDimensionPreset } from '../lib/zpl';
import {
  Printer,
  Bluetooth,
  Usb,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Settings2,
  Monitor,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Battery,
  Radio,
  PowerOff,
  Activity
} from 'lucide-react';

interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPageWidth: number;
  currentPageHeight: number;
  onSelectDimensionPreset: (preset: LabelDimensionPreset) => void;
  onDirectSystemPrint?: () => void;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  open,
  onOpenChange,
  currentPageWidth,
  onSelectDimensionPreset,
  onDirectSystemPrint
}) => {
  const {
    isConnected,
    activeKind,
    deviceName,
    batteryLevel,
    connect: connectBluetooth,
    disconnect: disconnectBluetooth,
    isUsbConnected,
    connectUsb,
    disconnectUsb,
    usbProtocol,
    setUsbProtocol,
    mediaType,
    setMediaType,
    gapMm,
    setGapMm,
    calibrateSensor,
    feedToNextGap,
    autoConnectEnabled,
    setAutoConnectEnabled,
    lastConnectedDevice,
    isAutoConnecting,
    pairedDevices,
    connectDirect,
    connectionDetails
  } = usePrinter();

  const [activeTab, setActiveTab] = useState<'bluetooth' | 'zebra' | 'sizes'>('bluetooth');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [showAdvancedUsb, setShowAdvancedUsb] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isIframe = UsbPrinterService.isInsideIframe();
  const btSupport = PrinterService.checkBluetoothSupport();

  const handleCalibrateSensor = async () => {
    setErrorMessage(null);
    setIsCalibrating(true);
    try {
      await calibrateSensor();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Kalibrasyon komutu gönderilemedi.');
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleFeedNextGap = async () => {
    setErrorMessage(null);
    setIsFeeding(true);
    try {
      await feedToNextGap();
    } catch (err: any) {
      setErrorMessage(err?.message || 'İlerleme komutu gönderilemedi.');
    } finally {
      setIsFeeding(false);
    }
  };

  const handleConnectUsbDirect = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    try {
      const ok = await connectUsb('webusb');
      if (ok) {
        onOpenChange(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'USB Bağlantısı kurulamadı.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectSerialCom = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    try {
      const ok = await connectUsb('webserial', baudRate);
      if (ok) {
        onOpenChange(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Seri (COM) Port bağlantısı kurulamadı.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectBle = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    try {
      await connectBluetooth();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Bluetooth bağlantısı kurulamadı.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDirectBleConnect = async (devId?: string, devName?: string) => {
    setErrorMessage(null);
    setIsConnecting(true);
    try {
      const ok = await connectDirect(devId, devName, true);
      if (ok) {
        onOpenChange(false);
      } else {
        setErrorMessage('Cihaza bağlanılamadı. Bluetooth açık ve cihaz eşleşme modunda mı?');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Bağlantı hatası.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-3 rounded-2xl p-4 sm:p-5 shadow-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 pr-10">
          <DialogTitle className="font-extrabold flex items-center justify-between text-base text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-2">
              <Printer className="text-teal-600 dark:text-teal-400" size={19} />
              <span>Yazıcı Bağlantısı</span>
            </div>
            {isIframe && (
              <button
                onClick={() => UsbPrinterService.openInStandaloneTab()}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                title="WebUSB için ayrı sekmede aç"
              >
                <ExternalLink size={12} /> Ayrı Sekme
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* 1. AKTİF DURUM KARTI (Minimalist & Net) */}
        <div
          className={`p-3 rounded-xl border transition-all ${
            isConnected
              ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-200 dark:ring-emerald-900/50' : 'bg-slate-400'
                  }`}
                />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{isConnected ? deviceName || 'Termal Yazıcı Bağlı' : 'Bağlı Yazıcı Yok'}</span>
                  {isConnected && <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>
                    {activeKind === 'bluetooth'
                      ? 'Bluetooth LE'
                      : activeKind === 'usb'
                      ? `Zebra USB (${usbProtocol.toUpperCase()})`
                      : activeKind === 'serial'
                      ? `Seri COM (${usbProtocol.toUpperCase()})`
                      : 'Bağlantı bekleniyor'}
                  </span>
                  {batteryLevel !== null && (
                    <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.2 rounded">
                      <Battery size={10} /> %{batteryLevel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isUsbConnected) disconnectUsb();
                  else disconnectBluetooth();
                }}
                className="h-7 text-xs px-2.5 font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/50 rounded-lg gap-1"
              >
                <PowerOff size={11} />
                <span>Kopar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Hata Bildirimi & Kısıtlamasız Alternatif */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 space-y-2 font-medium">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="flex-1 leading-snug">{errorMessage}</span>
            </div>
            {onDirectSystemPrint && (
              <div className="pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-rose-600 dark:text-rose-400">
                  Kısıtlamasız yazdırma alternatifi:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onDirectSystemPrint();
                    onOpenChange(false);
                  }}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Monitor size={13} />
                  <span>Sistem Sürücüsü ile Yazdır</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. OTOMATİK BAĞLANMA AYARI (Checkbox/Switch) */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Radio size={14} className={autoConnectEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'} />
            <label htmlFor="autoconnect-check" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Kapsama alanındaysa otomatik bağlan
            </label>
          </div>
          <input
            id="autoconnect-check"
            type="checkbox"
            checked={autoConnectEnabled}
            onChange={(e) => setAutoConnectEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 cursor-pointer accent-teal-600"
          />
        </div>

        {/* 3. SEKME GEÇİŞLERİ */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid grid-cols-3 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <TabsTrigger
              value="bluetooth"
              className="text-xs font-bold gap-1.5 rounded-lg py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"
            >
              <Bluetooth size={13} />
              <span>Bluetooth</span>
            </TabsTrigger>
            <TabsTrigger
              value="zebra"
              className="text-xs font-bold gap-1.5 rounded-lg py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400"
            >
              <Usb size={13} />
              <span>Zebra / USB</span>
            </TabsTrigger>
            <TabsTrigger
              value="sizes"
              className="text-xs font-bold gap-1.5 rounded-lg py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400"
            >
              <Layers size={13} />
              <span>Ölçüler</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BLUETOOTH (Minimal & Uygulama İçi Detaylı) */}
          <TabsContent value="bluetooth" className="space-y-3 pt-2">
            {/* Ortam Teşhisi ve Destek Uyarısı (Web sitelerine deploy edildiğinde veya HTTP durumunda) */}
            {!btSupport.supported && (
              <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  <span>Bluetooth Ortam Uyarısı</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  {btSupport.errorMessage}
                </p>
                {!btSupport.isSecureContext && typeof window !== 'undefined' && window.location.protocol === 'http:' && (
                  <div className="pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        window.location.href = window.location.href.replace('http:', 'https:');
                      }}
                      className="h-6 text-[10px] font-bold border-amber-400 text-amber-900 dark:text-amber-100 hover:bg-amber-100"
                    >
                      HTTPS ile Yeniden Yükle
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isIframe && btSupport.supported && (
              <div className="p-2.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between gap-2">
                <div className="text-[11px]">
                  <span>Çerçeve (Iframe) içi çalışıyor. İzin penceresi açılmazsa ayrı sekmede açın.</span>
                </div>
                <button
                  type="button"
                  onClick={() => UsbPrinterService.openInStandaloneTab()}
                  className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={10} /> Sekmede Aç
                </button>
              </div>
            )}

            {/* Mobil & Web Bluetooth İpuçları Rehberi */}
            <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/70 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-300 text-[11px]">
                <Activity size={13} className="shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>Mobil & Web Bağlantı İpuçları</span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                • <strong>Android:</strong> Bluetooth taramasının yazıcıları görebilmesi için telefonunuzun <strong>Konum (GPS)</strong> servisinin açık olması gerekir.<br />
                • <strong>Yazıcı Durumu:</strong> Cihazınızın açık ve eşleşmeye hazır olduğunu (mavi LED yanıp sönüyor) kontrol edin.<br />
                • <strong>Kısıtlamasız Yazdırma:</strong> Tarayıcı güvenlik engellerine takılmadan yazdırmak için &quot;Zebra / USB &gt; Sistem Sürücüsü&quot;nü kullanabilirsiniz.
              </p>
            </div>

            {/* Ana Bluetooth Bağlan Butonu */}
            <Button
              onClick={handleConnectBle}
              disabled={isConnecting || isAutoConnecting}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs gap-2"
            >
              <Bluetooth size={16} className={isConnecting ? 'animate-pulse' : ''} />
              <span>{isConnecting ? 'Aranıyor...' : 'Bluetooth Yazıcı Ara ve Bağlan'}</span>
            </Button>

            {/* Son Bağlanılan Cihaz & Hızlı Tekrar Bağlan */}
            {lastConnectedDevice && lastConnectedDevice.type === 'bluetooth' && !isConnected && (
              <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bluetooth size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {lastConnectedDevice.name}
                    </p>
                    <p className="text-[10px] text-slate-500">Son kullanılan cihaz</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isConnecting || isAutoConnecting}
                  onClick={() => handleDirectBleConnect(lastConnectedDevice.id, lastConnectedDevice.name)}
                  className="h-7 text-xs font-bold border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg gap-1"
                >
                  <RefreshCw size={11} className={isAutoConnecting ? 'animate-spin' : ''} />
                  <span>Yeniden Bağlan</span>
                </Button>
              </div>
            )}

            {/* Tarayıcıda Kayıtlı / İzin Verilmiş Diğer Cihazlar Listesi */}
            {pairedDevices.length > 0 && !isConnected && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kayıtlı Cihazlar</p>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {pairedDevices.map((d) => (
                    <button
                      key={d.deviceId}
                      onClick={() => handleDirectBleConnect(d.deviceId, d.name)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-left flex items-center justify-between hover:border-indigo-400 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Bluetooth size={12} className="text-indigo-500" />
                        {d.name || 'Bluetooth Yazıcı'}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Bağlan →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Uygulama İçi Bluetooth Durum / Tanı Kartı */}
            {isConnected && activeKind === 'bluetooth' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Activity size={12} className="text-indigo-600" />
                  <span>Uygulama İçi Cihaz Bilgisi</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Protokol:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {connectionDetails.isLuckJingle ? 'iPrint / LuckJingle (LSB)' : 'Standart ESC/POS (MSB)'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] text-slate-400 block">Pil Seviyesi:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {batteryLevel !== null ? `%${batteryLevel}` : 'Algılanıyor / Sabit Güç'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: ZEBRA & USB (Minimal & Açılır Gelişmiş Ayarlar) */}
          <TabsContent value="zebra" className="space-y-3 pt-2">
            {/* 2 Ana Buton: WebUSB & Sistem Sürücüsü */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleConnectUsbDirect}
                disabled={isConnecting}
                className="h-10 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
              >
                <Usb size={15} />
                <span>WebUSB ile Bağlan</span>
              </Button>

              {onDirectSystemPrint ? (
                <Button
                  onClick={() => {
                    onDirectSystemPrint();
                    onOpenChange(false);
                  }}
                  variant="outline"
                  className="h-10 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs rounded-xl shadow-xs gap-1.5"
                >
                  <Monitor size={15} />
                  <span>Sistem Sürücüsü</span>
                </Button>
              ) : (
                <Button
                  onClick={handleConnectSerialCom}
                  disabled={isConnecting}
                  variant="outline"
                  className="h-10 border-slate-200 dark:border-slate-800 font-bold text-xs rounded-xl shadow-xs gap-1.5"
                >
                  <Cpu size={15} className="text-teal-600" />
                  <span>Seri COM Port</span>
                </Button>
              )}
            </div>

            {/* Açılır / Kapanır Gelişmiş USB & Sensör Ayarları */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedUsb(!showAdvancedUsb)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Settings2 size={14} className="text-teal-600" />
                  <span>Gelişmiş Ayarlar (Sensör & Port)</span>
                </span>
                {showAdvancedUsb ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showAdvancedUsb && (
                <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Protokol</Label>
                      <Select value={usbProtocol} onValueChange={(v) => setUsbProtocol(v as any)}>
                        <SelectTrigger className="h-8 text-xs font-bold bg-white dark:bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zpl">Zebra ZPL II</SelectItem>
                          <SelectItem value="tspl">TSPL (TSC/Xprinter)</SelectItem>
                          <SelectItem value="escpos">ESC/POS (Fiş)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Baud Hızı (COM)</Label>
                      <Select value={String(baudRate)} onValueChange={(v) => v && setBaudRate(Number(v))}>
                        <SelectTrigger className="h-8 text-xs font-bold bg-white dark:bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9600">9600 Baud</SelectItem>
                          <SelectItem value="19200">19200 Baud</SelectItem>
                          <SelectItem value="38400">38400 Baud</SelectItem>
                          <SelectItem value="115200">115200 Baud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Etiket Türü</Label>
                      <Select value={mediaType} onValueChange={(v: any) => setMediaType(v)}>
                        <SelectTrigger className="h-8 text-xs font-bold bg-white dark:bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gap">🏷️ Boşluklu (Gap)</SelectItem>
                          <SelectItem value="continuous">📜 Sürekli Rulo</SelectItem>
                          <SelectItem value="blackmark">⬛ Siyah Çizgili</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Boşluk Payı</Label>
                      <Select value={String(gapMm)} onValueChange={(v) => v && setGapMm(Number(v))}>
                        <SelectTrigger className="h-8 text-xs font-bold bg-white dark:bg-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 mm</SelectItem>
                          <SelectItem value="3">3 mm (Standart)</SelectItem>
                          <SelectItem value="4">4 mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Kalibrasyon & Hizalama */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-850">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCalibrateSensor}
                      disabled={isCalibrating || !isUsbConnected}
                      className="h-8 text-[11px] font-bold rounded-lg gap-1"
                    >
                      <RefreshCw size={12} className={isCalibrating ? 'animate-spin' : ''} />
                      <span>{isCalibrating ? 'Kalibre...' : 'Sensörü Kalibre Et'}</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleFeedNextGap}
                      disabled={isFeeding || !isUsbConnected}
                      className="h-8 text-[11px] font-bold rounded-lg gap-1"
                    >
                      <Sparkles size={12} />
                      <span>{isFeeding ? 'Hizalanıyor...' : 'Sonraki Etiket'}</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 3: ÖLÇÜ PRESETLERİ */}
          <TabsContent value="sizes" className="space-y-2 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {LABEL_DIMENSION_PRESETS.map((p) => {
                const isCurrent = currentPageWidth === p.widthDots;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectDimensionPreset(p);
                      onOpenChange(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-900 dark:text-teal-200 ring-1 ring-teal-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold">{p.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {p.widthDots}x{p.heightDots || '∞'} px
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-lg text-xs font-bold">
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
