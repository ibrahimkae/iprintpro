/**
 * Bluetooth and ESC/POS Utilities for Thermal Printers
 */
import { logger } from './logger';
import { BleClient, BleDevice, BleService, BleCharacteristic } from '@capacitor-community/bluetooth-le';

export const PRINTER_SERVICES = [
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-41aa-8956-7278572031d7',
  'e7e11101-4966-4a5a-a209-00e6057030d9',
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ff01-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb'
];

export class PrinterService {
  private device: BleDevice | null = null;
  private services: BleService[] = [];
  private writeCharacteristic: { uuid: string; service: string; properties: { write?: boolean; writeWithoutResponse?: boolean } } | null = null;
  private notifyCharacteristic: { uuid: string; service: string } | null = null;
  private writeQueue: Promise<void> = Promise.resolve();
  private isReconnecting: boolean = false;
  private customDelay: number | null = null;
  private isCancelled: boolean = false;
  private onBatteryLevelChange: ((level: number) => void) | null = null;

  private PROTOCOLS = {
    LUCK_JINGLE: new Uint8Array([0x51, 0x78]),
    PHOMEMO: new Uint8Array([0x10, 0xFF, 0xFE, 0x01]),
    PERIPAGE: new Uint8Array([0x10, 0xFF, 0xFE, 0x01]),
    STANDARD: new Uint8Array([0x1B, 0x40])
  };

  static crc8(data: Uint8Array): number {
    let crc = 0;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 0x80) {
          crc = ((crc << 1) ^ 0x07) & 0xFF;
        } else {
          crc = (crc << 1) & 0xFF;
        }
      }
    }
    return crc;
  }

  static createLuckJinglePacket(cmd: number, arg: number, data: Uint8Array = new Uint8Array(0)): Uint8Array {
    const len = data.length;
    const packet = new Uint8Array(8 + len);
    packet[0] = 0x51;
    packet[1] = 0x78;
    packet[2] = cmd;
    packet[3] = arg;
    packet[4] = len & 0xFF;
    packet[5] = (len >> 8) & 0xFF;
    
    if (len > 0) {
      packet.set(data, 6);
    }
    
    packet[6 + len] = PrinterService.crc8(data);
    packet[7 + len] = 0xFF;
    
    return packet;
  }

  async initialize(): Promise<void> {
    await BleClient.initialize();
    logger.info('Bluetooth LE initialized');
  }

  /**
   * Tarayıcıda önceden izin verilmiş Bluetooth cihazlarını listeler (Web Bluetooth getDevices)
   */
  async getPairedDevices(): Promise<Array<{ deviceId: string; name?: string }>> {
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).bluetooth && typeof (navigator as any).bluetooth.getDevices === 'function') {
        const devs: any[] = await (navigator as any).bluetooth.getDevices();
        return devs.map(d => ({ deviceId: d.id, name: d.name || 'Bluetooth Termal Yazıcı' }));
      }
    } catch (e) {
      logger.debug('getPairedDevices error or not supported', e);
    }
    return [];
  }

  /**
   * Belirtilen bir Bluetooth Device ID ile doğrudan bağlantı kurar (Web Bluetooth getDevices ve BleClient desteğiyle)
   */
  async connectToDevice(deviceId: string, name?: string, fallbackToChooser: boolean = false): Promise<boolean> {
    try {
      logger.info(`Connecting directly to device ${deviceId} (${name || 'Unknown'})...`);

      // 1. Web Bluetooth getDevices kontrolü: Eğer tarayıcıda izinli cihaz varsa GATT bağlantısını hazırla
      let webBtDevice: any = null;
      if (typeof navigator !== 'undefined' && (navigator as any).bluetooth && typeof (navigator as any).bluetooth.getDevices === 'function') {
        try {
          const knownDevices: any[] = await (navigator as any).bluetooth.getDevices();
          webBtDevice = knownDevices.find(d => d.id === deviceId || (name && d.name === name));
          if (webBtDevice && !webBtDevice.gatt?.connected) {
            logger.info(`Web Bluetooth izinli cihaz bulundu: ${webBtDevice.name || webBtDevice.id}`);
            try {
              await webBtDevice.gatt?.connect();
            } catch (gattErr) {
              logger.debug('Direct GATT connect attempt warning:', gattErr);
            }
          }
        } catch (getDevErr) {
          logger.debug('getDevices query warning:', getDevErr);
        }
      }

      this.device = { deviceId: webBtDevice?.id || deviceId, name: webBtDevice?.name || name || 'Bluetooth Yazıcı' };

      await BleClient.connect(this.device.deviceId, (_dId) => {
        logger.warn('Device disconnected');
        this.handleDisconnection();
      });

      this.services = await BleClient.getServices(this.device.deviceId);
      logger.info(`Found ${this.services.length} services (direct connect)`);

      const found = this.findCharacteristics();
      if (found) {
        try {
          const nc = this.notifyCharacteristic;
          const wc = this.writeCharacteristic;
          const sameChannel = nc && wc && nc.uuid.toLowerCase() === wc.uuid.toLowerCase();
          if (nc && !sameChannel) {
            await BleClient.startNotifications(
              this.device.deviceId,
              nc.service,
              nc.uuid,
              (value: DataView) => this.handleNotifyValue(value)
            );
            logger.info('Printer notify channel subscribed (direct connect)');
          }
        } catch { /* opsiyonel pil */ }
        return true;
      }
      return false;
    } catch (error: any) {
      logger.warn('Direct connect to device failed:', error?.message || error);
      
      // Eğer kullanıcı açıkça bağlanmak istediğinde doğrudan bağlantı tarayıcı izninden dolayı reddedildiyse ve fallback istenmişse chooser aç
      if (fallbackToChooser) {
        logger.info('Direct connect failed, opening Bluetooth chooser fallback...');
        return await this.connect();
      }
      return false;
    }
  }

  async connect(): Promise<boolean> {
    try {
      logger.info('Requesting Bluetooth device...');
      
      this.device = await BleClient.requestDevice({
        optionalServices: [...PRINTER_SERVICES, '0000180f-0000-1000-8000-00805f9b34fb']
      });

      if (!this.device) {
        logger.info('Bluetooth aygıtı seçilmedi');
        return false;
      }
      
      logger.info(`Device selected: ${this.device.name || this.device.deviceId || 'Unknown'}`);
      
      await BleClient.connect(this.device.deviceId, (_deviceId) => {
        logger.warn('Device disconnected');
        this.handleDisconnection();
      });
      
      logger.info('GATT Server connected');
      
      this.services = await BleClient.getServices(this.device.deviceId);
      logger.info(`Found ${this.services.length} services`);
      
      const found = this.findCharacteristics();
      if (found) {
        try {
          // Pil yüzdesi: bildirim kanalı YAZMA kanalından FARKLIyse dinle.
          // Birçok GB03 firmware'i tek karakteristik kullanır (FF02 write+notify);
          // bu durumda bildirim oturumu baskı verisini sessizce yok sayıyor!
          const nc = this.notifyCharacteristic;
          const wc = this.writeCharacteristic;
          const sameChannel = nc && wc && nc.uuid.toLowerCase() === wc.uuid.toLowerCase();
          if (nc && !sameChannel) {
            await BleClient.startNotifications(
              this.device!.deviceId,
              nc.service,
              nc.uuid,
              (value: DataView) => this.handleNotifyValue(value)
            );
            logger.info('Printer notify channel subscribed');
          } else if (sameChannel) {
            logger.info('Notify==write kanalı; pil aboneliği atlandı (baskı güvenliği)');
          }
        } catch { /* pil opsiyonel */ }
      }
      return found;
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const errName = error?.name || '';
      
      // Check if cancellation or dialog dismissed
      if (
        errName === 'NotFoundError' ||
        errMsg.includes('User cancelled') ||
        errMsg.includes('cancelled') ||
        errMsg.includes('User cancel') ||
        errMsg.includes('requestDevice() chooser') ||
        errMsg.includes('No device selected')
      ) {
        logger.info('Bluetooth cihaz seçimi iptal edildi.');
        return false;
      }

      logger.error('Connection failed', errMsg);
      return false;
    }
  }

  private findCharacteristics(): boolean {
    for (const service of this.services) {
      for (const char of service.characteristics) {
        const props = char.properties;
        if (props.write || props.writeWithoutResponse) {
          if (!this.writeCharacteristic) {
            this.writeCharacteristic = {
              uuid: char.uuid,
              service: service.uuid,
              properties: props
            };
            logger.info(`Write char found: ${char.uuid.slice(4, 8)}`);
          }
        }
        
        if (props.notify || props.indicate) {
          if (!this.notifyCharacteristic) {
            this.notifyCharacteristic = {
              uuid: char.uuid,
              service: service.uuid
            };
            logger.info(`Notify char found: ${char.uuid.slice(4, 8)}`);
          }
        }
      }
    }

    if (!this.writeCharacteristic) {
      logger.error('No writable characteristic found');
      return false;
    }

    logger.info(`Active Channel: ${this.writeCharacteristic.uuid.slice(4, 8)}`);
    return true;
  }

  private async handleDisconnection() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    
    logger.info('Attempting to reconnect in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      if (this.device) {
        await BleClient.connect(this.device.deviceId, (deviceId) => {
          this.handleDisconnection();
        });
        this.services = await BleClient.getServices(this.device.deviceId);
        this.findCharacteristics();
        logger.info('Reconnected successfully');
      }
    } catch (e) {
      logger.error('Reconnection failed');
    } finally {
      this.isReconnecting = false;
    }
  }

  async getBatteryLevel(): Promise<number | null> {
    if (!this.device) return null;
    try {
      const value = await BleClient.read(
        this.device.deviceId,
        '0000180f-0000-1000-8000-00805f9b34fb',
        '00002a19-0000-1000-8000-00805f9b34fb'
      );
      const level = value.getUint8(0);
      logger.debug(`Battery level read: ${level}%`);
      return level;
    } catch (e) {
      return null;
    }
  }

  setBatteryCallback(cb: (level: number) => void) {
    this.onBatteryLevelChange = cb;
  }

  async disconnect() {
    if (this.device) {
      try {
        await BleClient.disconnect(this.device.deviceId);
      } catch (e) {}
    }
    this.device = null;
    this.services = [];
    this.writeCharacteristic = null;
    this.notifyCharacteristic = null;
    this.writeQueue = Promise.resolve();
    logger.info('Device disconnected manually');
  }

  // ── Protokol / besleme yardımcıları (App katmanı bu API'ye bağımlı) ──
  private protocol: 'auto' | 'luckjingle' | 'escpos' = 'auto';

  getUserProtocolSetting(): 'auto' | 'luckjingle' | 'escpos' {
    return this.protocol;
  }

  setProtocol(p: 'auto' | 'luckjingle' | 'escpos') {
    this.protocol = p;
    logger.info(`Printer protocol explicitly set to: ${p}`);
  }

  getProtocol(): 'luckjingle' | 'escpos' {
    if (this.protocol !== 'auto') return this.protocol;
    const name = (this.device?.name || '').toLowerCase();
    if (
      name.includes('gb') || name.includes('iprint') || name.includes('cat') ||
      name.includes('walk') || name.includes('fun') || name.includes('c9') ||
      name.includes('c15') || name.includes('c19') || name.includes('c23') ||
      name.includes('mx') || name.includes('x5') || name.includes('x6') ||
      name.includes('y11') || name.includes('ble') || name.includes('printer') || name === ''
    ) return 'luckjingle';
    if (name.includes('pos') || name.includes('mpt') || name.includes('receipt') || name.includes('esc')) return 'escpos';
    return 'luckjingle';
  }

  isLuckJingle(): boolean {
    return this.getProtocol() === 'luckjingle';
  }

  async feedPaper(mm: number = 25) {
    const dots = Math.max(20, Math.round(mm * 8));
    if (this.isLuckJingle()) {
      let remaining = dots;
      while (remaining > 0) {
        const chunk = Math.min(240, remaining);
        await this.sendData(PrinterService.feedLuckJingle(chunk), 15);
        remaining -= chunk;
      }
      await this.sendData(new Uint8Array([0x51, 0x78, 0xBE, 0x00, 0x01, 0x00, 0x00, 0x00, 0xFF]), 0);
      await new Promise(r => setTimeout(r, 100));
    } else {
      let remaining = dots;
      while (remaining > 0) {
        const chunk = Math.min(240, remaining);
        await this.sendData(new Uint8Array([0x1B, 0x4A, chunk]), 15);
        remaining -= chunk;
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }

  get isConnected() {
    return !!this.writeCharacteristic && !!this.device;
  }

  getDeviceId(): string | null {
    return this.device?.deviceId ?? null;
  }

  /** LuckJingle 0xA3 yanıtını (yüzde veya mV) parse edip pil callback'ini tetikler. */
  private handleNotifyValue(value: DataView): void {
    try {
      if (value.byteLength >= 9 && value.getUint8(0) === 0x51 && value.getUint8(1) === 0x78 && value.getUint8(2) === 0xA3) {
        const len = value.getUint8(4) | (value.getUint8(5) << 8);
        if (len < 1) return;
        const raw = value.getUint8(6) | (len >= 2 ? value.getUint8(7) << 8 : 0);
        let percent: number;
        if (len >= 2 && raw > 200) percent = Math.round(((raw - 3300) / (4150 - 3300)) * 100);
        else percent = raw;
        percent = Math.max(0, Math.min(100, percent));
        logger.debug(`Battery (notify): ${percent}%`);
        this.onBatteryLevelChange?.(percent);
      }
    } catch { /* bildirim ayrıştırma opsiyonel */ }
  }

  getDeviceName() {
    return this.device?.name || null;
  }

  get characteristicUuid() {
    return this.writeCharacteristic?.uuid || null;
  }

  switchCharacteristic() {
    if (!this.services || this.services.length === 0) {
      logger.warn('No services found to switch');
      return null;
    }

    const writableChars: { uuid: string; service: string; properties: any }[] = [];
    for (const service of this.services) {
      for (const char of service.characteristics) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          writableChars.push({
            uuid: char.uuid,
            service: service.uuid,
            properties: char.properties
          });
        }
      }
    }

    if (writableChars.length <= 1) {
      logger.info('Only one writable characteristic available');
      return this.writeCharacteristic;
    }

    const currentIndex = writableChars.findIndex(c => c.uuid === this.writeCharacteristic?.uuid);
    const nextIndex = (currentIndex + 1) % writableChars.length;
    this.writeCharacteristic = writableChars[nextIndex];
    
    logger.info(`Switched to characteristic: ${this.writeCharacteristic.uuid.slice(4, 8)}`);
    return this.writeCharacteristic;
  }

  async probeProtocol(type: 'LUCK_JINGLE' | 'PHOMEMO' | 'STANDARD') {
    logger.info(`Probing protocol: ${type}`);
    const sequence = this.PROTOCOLS[type];
    await this.sendData(sequence, 50);
    
    if (type === 'LUCK_JINGLE') {
      await this.sendData(new Uint8Array([0x1B, 0x4A, 0x40]), 50);
    } else if (type === 'STANDARD') {
      await this.sendData(new Uint8Array([0x1B, 0x64, 0x03]), 50);
    }
    
    logger.info(`${type} probe sequence sent.`);
  }

  async sendRawHex(hex: string) {
    try {
      const bytes = hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      if (bytes.length === 0) return;
      logger.info(`Sending raw hex: ${hex}`);
      await this.sendData(new Uint8Array(bytes));
    } catch (e: any) {
      logger.error('Invalid hex sequence', e.message);
    }
  }

  setCustomDelay(ms: number | null) {
    this.customDelay = ms;
    logger.info(`Custom write delay set to: ${ms === null ? 'Auto' : ms + 'ms'}`);
  }

  cancelPrint() {
    this.isCancelled = true;
    logger.warn('Print job cancellation requested');
  }

  async sendData(data: Uint8Array, delayMs: number = 30, onProgress?: (sent: number, total: number) => void) {
    if (!this.writeCharacteristic || !this.device) {
      if (this.device) {
        logger.warn('GATT disconnected, attempting auto-recovery...');
        try { await this.connect(); } catch (e) {}
      }
      if (!this.writeCharacteristic) {
        logger.error('Cannot send data: Printer not ready');
        return;
      }
    }

    if (data.length > 100) {
      this.isCancelled = false;
    }

    const isGBDevice = this.device?.name?.includes('GB') || this.device?.name?.includes('MTP');
    const effectiveChunkSize = isGBDevice ? 256 : 20;
    
    let effectiveDelay = delayMs;
    if (this.customDelay !== null) {
      effectiveDelay = this.customDelay;
    }

    const deviceId = this.device!.deviceId;
    const service = this.writeCharacteristic!.service;
    const charUuid = this.writeCharacteristic!.uuid;
    const withResponse = this.writeCharacteristic!.properties.write || false;

    this.writeQueue = this.writeQueue.then(async () => {
      try {
        for (let i = 0; i < data.length; i += effectiveChunkSize) {
          if (this.isCancelled) {
            logger.warn('Print job cancelled during transmission');
            break;
          }

          if (!this.writeCharacteristic || !this.device) break;
          
          const chunk = data.slice(i, i + effectiveChunkSize);
          let retries = 3;
          
          while (retries >= 0) {
            try {
              // Try writeWithoutResponse first (more reliable on Android)
              try {
                await BleClient.writeWithoutResponse(deviceId, service, charUuid, new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength));
              } catch {
                // Fallback to write with response
                await BleClient.write(deviceId, service, charUuid, new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength));
              }
              
              if (onProgress) {
                onProgress(i + chunk.length, data.length);
              }

              if (effectiveDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, effectiveDelay));
              }
              break; 
            } catch (error: any) {
              const errMsg = error.message || String(error);
              logger.warn(`Write attempt failed: ${errMsg}, retries left: ${retries}`);
              if (errMsg.includes('disconnected') || errMsg.includes('GATT')) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              retries--;
              if (retries < 0) {
                logger.error(`Write failed after all retries: ${errMsg}`);
                throw error;
              }
            }
          }
        }
      } catch (error: any) {
        logger.error('Write failed', error.message || error);
      }
    });

    return this.writeQueue;
  }

  async wake() {
    this.isCancelled = false; // yeni iş: iptal bayrağını temizle
    logger.info('Sending multi-protocol wake-up sequence...');
    await this.sendData(new Uint8Array([0x00, 0x00, 0x00, 0x00]), 50);
    
    const isGB = this.device?.name?.includes('GB');
    if (isGB) {
      await this.sendData(PrinterService.createLuckJinglePacket(0xA8, 0x00));
      await this.sendData(PrinterService.createLuckJinglePacket(0xA3, 0x00));
    } else {
      await this.sendData(new Uint8Array([0x1B, 0x40]), 50);
    }
    
    logger.info('Wake-up sequences completed.');
  }

  async testPrint() {
    if (!this.isConnected) {
      logger.warn('Test print aborted: Not connected');
      return;
    }
    
    logger.info('Starting test print...');
    await this.wake();
    
    const isGB = this.device?.name?.includes('GB');
    
    if (isGB) {
      logger.info('Using Luck Jingle (iPrint) protocol for test print');
      
      const power = new Uint8Array([0x2E, 0xE0]);
      await this.sendData(PrinterService.createLuckJinglePacket(0xA2, 0x00, power));
      await this.sendData(new Uint8Array([0x51, 0x78, 0xA4, 0x00, 0x01, 0x00, 0x33, 0x99, 0xFF]));
      await this.sendData(new Uint8Array([0x51, 0x78, 0xBE, 0x00, 0x01, 0x00, 0x01, 0x07, 0xFF]));
      
      const lineData = new Uint8Array(48).fill(0xAA);
      for (let i = 0; i < 10; i++) {
        await this.sendData(PrinterService.createLuckJinglePacket(0xA2, 0x00, lineData));
        await this.sendData(new Uint8Array([0x51, 0x78, 0xBD, 0x00, 0x01, 0x00, 0x19, 0x07, 0xFF]));
      }
      
      await this.sendData(new Uint8Array([0x51, 0x78, 0xA1, 0x00, 0x02, 0x00, 0x30, 0x00, 0xF9, 0xFF]));
    } else {
      const encoder = new TextEncoder();
      const testText = encoder.encode('\r\n--- iPrint Pro Test ---\r\nStatus: Connected\r\nTime: ' + new Date().toLocaleTimeString() + '\r\n\r\n\r\n\r\n\r\n');
      await this.sendData(PrinterService.init());
      await this.sendData(testText);
    }
    
    logger.info('Test print commands sent to queue');
  }

  static init() {
    return new Uint8Array([0x1B, 0x40]);
  }

  static printAndFeed(n: number = 3) {
    return new Uint8Array([0x1B, 0x64, n]);
  }

  static feedLuckJingle(dots: number = 240): Uint8Array {
    const d = Math.max(1, Math.min(65535, Math.round(dots)));
    return PrinterService.createLuckJinglePacket(0xA1, 0x00, new Uint8Array([d & 0xFF, (d >> 8) & 0xFF]));
  }

  static setIntensity(level: number) {
    const val = Math.floor(0x1A + (level / 100) * (0x5F - 0x1A));
    const power = new Uint8Array([val >> 8, val & 0xFF]);
    return PrinterService.createLuckJinglePacket(0xA2, 0x00, power);
  }

  static setQuality(type: 'normal' | 'draft' | 'fine') {
    const val = type === 'draft' ? 0x11 : type === 'fine' ? 0x55 : 0x33;
    return new Uint8Array([0x51, 0x78, 0xA4, 0x00, 0x01, 0x00, val, 0x00, 0xFF]);
  }

  static setTextStyle(bold: boolean, italic: boolean, underline: boolean) {
    let style = 0;
    if (bold) style |= 0x08;
    if (underline) style |= 0x80;
    return new Uint8Array([0x1B, 0x21, style]);
  }

  static bitmapCommand(width: number, height: number, data: Uint8Array, isLuckJingle: boolean = false) {
    if (isLuckJingle) {
      return PrinterService.createLuckJinglePacket(0x01, 0x00, data);
    }

    const xL = (width / 8) % 256;
    const xH = Math.floor((width / 8) / 256);
    const yL = height % 256;
    const yH = Math.floor(height / 256);

    const header = new Uint8Array([0x1D, 0x76, 0x30, 0, xL, xH, yL, yH]);
    const combined = new Uint8Array(header.length + data.length);
    combined.set(header);
    combined.set(data, header.length);
    return combined;
  }
}
