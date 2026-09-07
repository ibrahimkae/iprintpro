import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { printer as singletonPrinter } from '../lib/printer-instance';
import { usbPrinter, UsbConnectionType } from '../lib/usb-printer';
import { logger } from '../lib/logger';
import { DeviceProfile, findDeviceProfile, makeProfileId } from '../lib/device-profiles';

export type ActiveConnectionKind = 'bluetooth' | 'usb' | 'serial' | 'system' | 'none';

export interface LastConnectedDevice {
  id: string;
  name: string;
  type: 'bluetooth' | 'usb' | 'serial';
  timestamp: number;
}

export interface PrinterConnectionDetails {
  protocol: string;
  isLuckJingle: boolean;
  deviceId: string | null;
  batteryLevel: number | null;
  characteristicUuid: string | null;
}

interface PrinterContextValue {
  // General status
  isConnected: boolean;
  activeKind: ActiveConnectionKind;
  deviceName: string | null;
  batteryLevel: number | null;
  activeProfile: DeviceProfile | null;
  connectionDetails: PrinterConnectionDetails;

  // Auto-connect & Known Devices
  autoConnectEnabled: boolean;
  setAutoConnectEnabled: (enabled: boolean) => void;
  lastConnectedDevice: LastConnectedDevice | null;
  isAutoConnecting: boolean;
  pairedDevices: Array<{ deviceId: string; name?: string }>;
  refreshPairedDevices: () => Promise<void>;
  connectDirect: (deviceId?: string, name?: string, userInitiated?: boolean) => Promise<boolean>;

  // Media & Gap tracking settings
  mediaType: 'gap' | 'continuous' | 'blackmark';
  setMediaType: (m: 'gap' | 'continuous' | 'blackmark') => void;
  gapMm: number;
  setGapMm: (g: number) => void;
  calibrateSensor: () => Promise<void>;
  feedToNextGap: () => Promise<void>;

  // Bluetooth actions
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBattery: () => Promise<void>;

  // USB / Zebra actions
  isUsbConnected: boolean;
  usbConnectionType: UsbConnectionType | null;
  connectUsb: (type?: 'webusb' | 'webserial', baudRate?: number) => Promise<boolean>;
  disconnectUsb: () => Promise<void>;
  usbProtocol: 'zpl' | 'tspl' | 'escpos';
  setUsbProtocol: (p: 'zpl' | 'tspl' | 'escpos') => void;
}

const PrinterContext = createContext<PrinterContextValue | null>(null);

const STORAGE_KEY_AUTOCONNECT = 'iprint_autoconnect_enabled';
const STORAGE_KEY_LAST_DEVICE = 'iprint_last_device';

export function usePrinter(): PrinterContextValue {
  const ctx = useContext(PrinterContext);
  if (!ctx) throw new Error('usePrinter must be used inside <PrinterProvider>');
  return ctx;
}

export function PrinterProvider({ children }: { children: React.ReactNode }) {
  const [isBleConnected, setIsBleConnected] = useState(false);
  const [isUsbConnectedState, setIsUsbConnectedState] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [activeProfile, setActiveProfile] = useState<DeviceProfile | null>(null);
  const [usbProtocol, setUsbProtocolState] = useState<'zpl' | 'tspl' | 'escpos'>('zpl');
  const [mediaType, setMediaType] = useState<'gap' | 'continuous' | 'blackmark'>('gap');
  const [gapMm, setGapMm] = useState<number>(3);
  const [isAutoConnecting, setIsAutoConnecting] = useState<boolean>(false);
  const [pairedDevices, setPairedDevices] = useState<Array<{ deviceId: string; name?: string }>>([]);

  const [autoConnectEnabled, setAutoConnectEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTOCONNECT);
      return stored !== null ? stored === 'true' : true; // varsayılan açık
    } catch {
      return true;
    }
  });

  const [lastConnectedDevice, setLastConnectedDevice] = useState<LastConnectedDevice | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAST_DEVICE);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAutoConnectEnabled = useCallback((enabled: boolean) => {
    setAutoConnectEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_AUTOCONNECT, String(enabled));
    } catch {}
  }, []);

  const saveLastDevice = useCallback((id: string, name: string, type: 'bluetooth' | 'usb' | 'serial') => {
    const dev: LastConnectedDevice = { id, name, type, timestamp: Date.now() };
    setLastConnectedDevice(dev);
    try {
      localStorage.setItem(STORAGE_KEY_LAST_DEVICE, JSON.stringify(dev));
    } catch {}
  }, []);
  
  const printer = singletonPrinter;

  const isConnected = isBleConnected || isUsbConnectedState;

  const activeKind: ActiveConnectionKind = isBleConnected
    ? 'bluetooth'
    : isUsbConnectedState
    ? (usbPrinter.getConnectionType() === 'webserial' ? 'serial' : 'usb')
    : 'none';

  const deviceName: string | null = isBleConnected
    ? printer.getDeviceName()
    : isUsbConnectedState
    ? usbPrinter.getDeviceName()
    : null;

  const connectionDetails: PrinterConnectionDetails = useMemo(() => {
    return {
      protocol: isBleConnected ? printer.getProtocol() : isUsbConnectedState ? usbProtocol : 'none',
      isLuckJingle: isBleConnected ? printer.isLuckJingle() : false,
      deviceId: isBleConnected ? printer.getDeviceId() : null,
      batteryLevel: batteryLevel,
      characteristicUuid: isBleConnected ? printer.characteristicUuid : null
    };
  }, [isBleConnected, isUsbConnectedState, usbProtocol, batteryLevel, printer]);

  const refreshPairedDevices = useCallback(async () => {
    try {
      const devs = await printer.getPairedDevices();
      setPairedDevices(devs);
    } catch (e) {
      logger.debug('Paired devices refresh failed', e);
    }
  }, [printer]);

  const calibrateSensor = useCallback(async () => {
    if (isUsbConnectedState) {
      await usbPrinter.calibrateSensor();
    } else {
      logger.info('Bluetooth sensör kalibrasyonu tetiklendi.');
    }
  }, [isUsbConnectedState]);

  const feedToNextGap = useCallback(async () => {
    if (isUsbConnectedState) {
      await usbPrinter.feedToNextGap();
    } else {
      logger.info('Bluetooth sonraki etikete ilerletildi.');
    }
  }, [isUsbConnectedState]);

  // Bluetooth connect (Chooser dialog)
  const connect = useCallback(async () => {
    try {
      await printer.initialize();
      const success = await printer.connect();
      setIsBleConnected(Boolean(success));
      if (success) {
        printer.setBatteryCallback((level) => setBatteryLevel(level));
        await printer.getBatteryLevel().then(setBatteryLevel).catch(() => {});

        const devId = printer.getDeviceId() || 'bt-printer';
        const devName = printer.getDeviceName() || 'Bluetooth Yazıcı';
        saveLastDevice(devId, devName, 'bluetooth');

        const profileId = makeProfileId(devId, devName);
        setActiveProfile(findDeviceProfile(profileId));
        refreshPairedDevices();
      }
    } catch (error: any) {
      const msg = error?.message || String(error);
      const cancelled =
        error?.name === 'NotFoundError' ||
        msg.includes('User cancelled') ||
        msg.includes('cancelled') ||
        msg.includes('requestDevice');
      if (cancelled) {
        logger.info('Bluetooth aygıt seçimi kullanıcı tarafından iptal edildi.');
        return;
      }
      logger.error('Bağlantı hatası:', error);
      throw error;
    }
  }, [printer, saveLastDevice, refreshPairedDevices]);

  // Direct connect (using saved device ID or specific ID)
  const connectDirect = useCallback(async (targetDeviceId?: string, targetName?: string, userInitiated: boolean = false): Promise<boolean> => {
    const devId = targetDeviceId || lastConnectedDevice?.id;
    const name = targetName || lastConnectedDevice?.name;
    if (!devId && !userInitiated) return false;

    setIsAutoConnecting(true);
    try {
      await printer.initialize();
      let success = false;
      if (devId) {
        success = await printer.connectToDevice(devId, name, userInitiated);
      } else if (userInitiated) {
        success = await printer.connect();
      }

      setIsBleConnected(Boolean(success));
      if (success) {
        printer.setBatteryCallback((level) => setBatteryLevel(level));
        await printer.getBatteryLevel().then(setBatteryLevel).catch(() => {});

        const activeId = printer.getDeviceId() || devId || 'bt-printer';
        const activeName = printer.getDeviceName() || name || 'Bluetooth Yazıcı';
        saveLastDevice(activeId, activeName, 'bluetooth');
        const profileId = makeProfileId(activeId, activeName);
        setActiveProfile(findDeviceProfile(profileId));
        logger.info(`Doğrudan/Otomatik Bluetooth bağlantısı kuruldu: ${activeName} (${activeId})`);
        refreshPairedDevices();
      }
      return Boolean(success);
    } catch (err: any) {
      logger.debug('connectDirect error', err?.message || err);
      if (userInitiated) {
        // Son çare chooser dene
        try {
          const fbSuccess = await printer.connect();
          setIsBleConnected(Boolean(fbSuccess));
          if (fbSuccess) {
            refreshPairedDevices();
            return true;
          }
        } catch {}
      }
      return false;
    } finally {
      setIsAutoConnecting(false);
    }
  }, [lastConnectedDevice, printer, saveLastDevice, refreshPairedDevices]);

  // Sayfa açıldığında otomatik bağlanmayı dene
  useEffect(() => {
    let cancelled = false;
    async function tryAutoConnect() {
      if (!autoConnectEnabled || isConnected || !lastConnectedDevice || lastConnectedDevice.type !== 'bluetooth') {
        return;
      }
      try {
        await refreshPairedDevices();
        if (cancelled) return;
        logger.info(`Otomatik bağlantı deneniyor (${lastConnectedDevice.name})...`);
        await connectDirect(lastConnectedDevice.id, lastConnectedDevice.name);
      } catch {
        // Otomatik bağlanma sessizce geçilir
      }
    }

    const timer = setTimeout(() => {
      tryAutoConnect();
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [autoConnectEnabled, lastConnectedDevice, connectDirect, refreshPairedDevices]);

  // Bluetooth disconnect
  const disconnect = useCallback(() => {
    printer.disconnect();
    setIsBleConnected(false);
    setBatteryLevel(null);
  }, [printer]);

  // USB Connect
  const connectUsb = useCallback(async (type: 'webusb' | 'webserial' = 'webusb', baudRate: number = 9600): Promise<boolean> => {
    try {
      let success = false;
      if (type === 'webusb') {
        success = await usbPrinter.connectWebUsb();
      } else {
        success = await usbPrinter.connectWebSerial(baudRate);
      }
      setIsUsbConnectedState(Boolean(success));
      if (success) {
        setUsbProtocolState(usbPrinter.getProtocol());
        const dName = usbPrinter.getDeviceName() || (type === 'webusb' ? 'Zebra USB Yazıcı' : 'Seri COM Yazıcı');
        saveLastDevice(type, dName, type === 'webusb' ? 'usb' : 'serial');
        logger.info(`USB/Zebra Yazıcı bağlandı: ${dName}`);
      }
      return success;
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (err.name === 'NotFoundError' || msg.includes('cancel') || msg.includes('iptal')) {
        return false;
      }
      logger.error('USB Bağlantı hatası', err);
      throw err;
    }
  }, [saveLastDevice]);

  // USB Disconnect
  const disconnectUsb = useCallback(async () => {
    await usbPrinter.disconnect();
    setIsUsbConnectedState(false);
  }, []);

  const setUsbProtocol = useCallback((proto: 'zpl' | 'tspl' | 'escpos') => {
    usbPrinter.setProtocol(proto);
    setUsbProtocolState(proto);
  }, []);

  const refreshBattery = useCallback(async () => {
    if (isBleConnected) {
      const level = await printer.getBatteryLevel();
      setBatteryLevel(level);
    }
  }, [isBleConnected, printer]);

  const value = useMemo<PrinterContextValue>(
    () => ({
      isConnected,
      activeKind,
      deviceName,
      batteryLevel,
      activeProfile,
      connectionDetails,
      autoConnectEnabled,
      setAutoConnectEnabled,
      lastConnectedDevice,
      isAutoConnecting,
      pairedDevices,
      refreshPairedDevices,
      connectDirect,
      mediaType,
      setMediaType,
      gapMm,
      setGapMm,
      calibrateSensor,
      feedToNextGap,
      connect,
      disconnect,
      refreshBattery,
      isUsbConnected: isUsbConnectedState,
      usbConnectionType: usbPrinter.getConnectionType(),
      connectUsb,
      disconnectUsb,
      usbProtocol,
      setUsbProtocol
    }),
    [
      isConnected,
      activeKind,
      deviceName,
      batteryLevel,
      activeProfile,
      connectionDetails,
      autoConnectEnabled,
      setAutoConnectEnabled,
      lastConnectedDevice,
      isAutoConnecting,
      pairedDevices,
      refreshPairedDevices,
      connectDirect,
      mediaType,
      setMediaType,
      gapMm,
      setGapMm,
      calibrateSensor,
      feedToNextGap,
      connect,
      disconnect,
      refreshBattery,
      isUsbConnectedState,
      connectUsb,
      disconnectUsb,
      usbProtocol,
      setUsbProtocol
    ]
  );

  return <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>;
}
