/**
 * WebUSB and Web Serial Drivers for Zebra ZD220 / ZD230 / ZPL & USB Thermal Printers
 */
import { logger } from './logger';
import {
  buildZplLabel,
  buildTsplLabel,
  buildZplCalibrateCommand,
  buildZplFeedToGapCommand,
  buildTsplCalibrateCommand,
  buildTsplFeedToGapCommand,
  ZplPrintOptions
} from './zpl';

// Common Vendor IDs for Thermal & Zebra Label Printers
export const KNOWN_USB_VENDORS = [
  { vendorId: 0x0A5F, name: 'Zebra Technologies (ZD220, ZD230, ZD420, GK420, ZT)' },
  { vendorId: 0x0416, name: 'Winbond / Xprinter / Generic POS' },
  { vendorId: 0x0483, name: 'STMicroelectronics / Gprinter / TSPL' },
  { vendorId: 0x04B8, name: 'Seiko Epson / ESC/POS' },
  { vendorId: 0x1504, name: 'Citizen Systems' },
  { vendorId: 0x0FE6, name: 'ICS Advent' },
  { vendorId: 0x20D1, name: 'Custom Engineering' },
  { vendorId: 0x1FC9, name: 'NXP Semiconductors (Thermal Controller)' },
  { vendorId: 0x1A86, name: 'WCH QinHeng (CH340 USB Serial)' },
  { vendorId: 0x10C4, name: 'Silicon Labs (CP210x USB Serial)' },
  { vendorId: 0x0403, name: 'FTDI USB Serial' }
];

export type UsbConnectionType = 'webusb' | 'webserial' | 'system_driver';

export interface UsbPrinterStatus {
  isConnected: boolean;
  type: UsbConnectionType | null;
  deviceName: string | null;
  protocol: 'zpl' | 'tspl' | 'escpos';
  vendorId?: number;
  productId?: number;
}

export class UsbPrinterService {
  private usbDevice: any = null; // USBDevice (WebUSB)
  private serialPort: any = null; // SerialPort (Web Serial)
  private serialWriter: any = null;
  private connectionType: UsbConnectionType | null = null;
  private deviceName: string | null = null;
  private protocol: 'zpl' | 'tspl' | 'escpos' = 'zpl';
  private endpointNumber: number = 1;
  private interfaceNumber: number = 0;

  get isConnected(): boolean {
    if (this.connectionType === 'webusb') {
      return Boolean(this.usbDevice && this.usbDevice.opened);
    }
    if (this.connectionType === 'webserial') {
      return Boolean(this.serialPort && this.serialPort.writable);
    }
    return false;
  }

  get status(): UsbPrinterStatus {
    return {
      isConnected: this.isConnected,
      type: this.connectionType,
      deviceName: this.deviceName || (this.isConnected ? 'Zebra / USB Termal Yazıcı' : null),
      protocol: this.protocol,
      vendorId: this.usbDevice?.vendorId,
      productId: this.usbDevice?.productId
    };
  }

  getDeviceName(): string | null {
    return this.deviceName;
  }

  getConnectionType(): UsbConnectionType | null {
    return this.connectionType;
  }

  setProtocol(proto: 'zpl' | 'tspl' | 'escpos') {
    this.protocol = proto;
    logger.info(`USB Yazıcı protokolü ayarlandı: ${proto.toUpperCase()}`);
  }

  getProtocol(): 'zpl' | 'tspl' | 'escpos' {
    return this.protocol;
  }

  /**
   * Helper: check if running inside an iframe
   */
  static isInsideIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }

  /**
   * Helper: open app in a new top-level tab to grant full WebUSB / Web Serial permissions
   */
  static openInStandaloneTab(): void {
    try {
      window.open(window.location.href, '_blank');
    } catch (e) {
      logger.error('Sekme açma hatası', e);
    }
  }

  /**
   * Connect via WebUSB (Direct USB Transfer without COM port / driver lock)
   */
  async connectWebUsb(): Promise<boolean> {
    if (!('usb' in navigator)) {
      throw new Error('Tarayıcınız WebUSB teknolojisini desteklemiyor. Lütfen Google Chrome veya Microsoft Edge kullanın.');
    }

    try {
      logger.info('WebUSB yazıcı aranıyor...');
      // Filter by known printer vendor IDs + open filter for any device selected by user
      const filters = KNOWN_USB_VENDORS.map(v => ({ vendorId: v.vendorId }));
      
      let device: any;
      try {
        device = await (navigator as any).usb.requestDevice({ filters });
      } catch (err: any) {
        if (err.name === 'SecurityError' || err.message?.includes('permissions policy') || err.message?.includes('disallowed')) {
          throw new Error('Tarayıcı Güvenlik Kısıtlaması (Iframe/Sandbox): WebUSB doğrudan erişimi engellendi. Lütfen uygulamayı "Ayrı Sekmede Aç" butonuna basarak yeni sekmede açın veya "Sistem Sürücüsü ile Yazdır" seçeneğini kullanın.');
        }
        // If filtered request was empty or user cancelled, try open request
        if (err.name !== 'NotFoundError') {
          device = await (navigator as any).usb.requestDevice({ filters: [] });
        } else {
          throw err;
        }
      }

      if (!device) return false;

      logger.info(`Seçilen USB Cihaz: ${device.productName || 'Bilinmeyen USB'} (VID: 0x${device.vendorId.toString(16)})`);
      await device.open();

      // Select configuration
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      // Find printer interface & OUT endpoint
      let outEndpoint: any = null;
      let claimedInterface = 0;

      for (const iface of device.configuration.interfaces) {
        for (const alt of iface.alternates) {
          // Class 7 is Printer class, or vendor specific class 255
          const isPrinterClass = alt.interfaceClass === 7 || alt.interfaceClass === 255 || alt.interfaceClass === 0;
          for (const ep of alt.endpoints) {
            if (ep.direction === 'out') {
              outEndpoint = ep;
              claimedInterface = iface.interfaceNumber;
              break;
            }
          }
          if (outEndpoint) break;
        }
        if (outEndpoint) break;
      }

      if (!outEndpoint) {
        // Fallback: claim interface 0 and use endpoint 1 or 2
        claimedInterface = 0;
        outEndpoint = { endpointNumber: 1 };
      }

      try {
        await device.claimInterface(claimedInterface);
      } catch (claimErr: any) {
        logger.warn('Interface claim uyarısı, devam ediliyor:', claimErr.message);
      }

      this.usbDevice = device;
      this.interfaceNumber = claimedInterface;
      this.endpointNumber = outEndpoint.endpointNumber;
      this.connectionType = 'webusb';
      this.deviceName = device.productName || `Zebra USB (0x${device.vendorId.toString(16)})`;

      // Auto-detect protocol: If Zebra VID (0x0A5F) -> ZPL, else if Xprinter/ST -> TSPL/ZPL
      if (device.vendorId === 0x0A5F || (device.productName && device.productName.toLowerCase().includes('zebra'))) {
        this.protocol = 'zpl';
      }

      logger.info(`WebUSB Yazıcı Başarıyla Bağlandı! Arayüz: ${this.interfaceNumber}, Endpoint: ${this.endpointNumber}`);
      return true;
    } catch (err: any) {
      if (err.name === 'NotFoundError' || err.message?.includes('No device selected')) {
        logger.info('USB aygıt seçimi iptal edildi.');
        return false;
      }
      if (err.name === 'SecurityError' || err.message?.includes('permissions policy') || err.message?.includes('disallowed')) {
        throw new Error('Tarayıcı Güvenlik Kısıtlaması (Iframe/Sandbox): WebUSB doğrudan erişimi engellendi. Lütfen uygulamayı "Ayrı Sekmede Aç" butonuna basarak yeni sekmede açın veya "Sistem Sürücüsü ile Yazdır" seçeneğini kullanın.');
      }
      logger.error('WebUSB bağlantı hatası', err);
      throw err;
    }
  }

  /**
   * Connect via Web Serial (Virtual COM Port / Zebra CDC ACM Driver)
   */
  async connectWebSerial(baudRate: number = 9600): Promise<boolean> {
    if (!('serial' in navigator)) {
      throw new Error('Tarayıcınız Web Serial API desteklemiyor. Lütfen Google Chrome veya Microsoft Edge kullanın.');
    }

    try {
      logger.info('Web Serial COM port aranıyor...');
      let port: any;
      try {
        port = await (navigator as any).serial.requestPort();
      } catch (err: any) {
        if (err.name === 'SecurityError' || err.message?.includes('permissions policy') || err.message?.includes('disallowed')) {
          throw new Error('Tarayıcı Güvenlik Kısıtlaması: Seri (COM) Port erişimi engellendi. Lütfen uygulamayı "Ayrı Sekmede Aç" ile açın.');
        }
        throw err;
      }

      if (!port) return false;

      await port.open({
        baudRate: baudRate, // Zebra ZD220 standard 9600 or 115200
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this.serialPort = port;
      this.serialWriter = port.writable.getWriter();
      this.connectionType = 'webserial';
      const info = port.getInfo ? port.getInfo() : {};
      this.deviceName = info.usbVendorId 
        ? `Zebra COM Port (VID: 0x${info.usbVendorId.toString(16)})`
        : 'Zebra Seri Port (Kablolu)';

      logger.info(`Web Serial Port Açıldı: ${this.deviceName} @ ${baudRate} baud`);
      return true;
    } catch (err: any) {
      if (err.name === 'NotFoundError' || err.message?.includes('No port selected')) {
        logger.info('Seri port seçimi iptal edildi.');
        return false;
      }
      if (err.name === 'SecurityError' || err.message?.includes('permissions policy') || err.message?.includes('disallowed')) {
        throw new Error('Tarayıcı Güvenlik Kısıtlaması: Seri (COM) Port erişimi engellendi. Lütfen uygulamayı "Ayrı Sekmede Aç" ile açın.');
      }
      logger.error('Web Serial bağlantı hatası', err);
      throw err;
    }
  }

  /**
   * Disconnect any active USB / Serial connection
   */
  async disconnect(): Promise<void> {
    try {
      if (this.serialWriter) {
        await this.serialWriter.releaseLock();
        this.serialWriter = null;
      }
      if (this.serialPort) {
        await this.serialPort.close();
        this.serialPort = null;
      }
      if (this.usbDevice) {
        try {
          await this.usbDevice.releaseInterface(this.interfaceNumber);
          await this.usbDevice.close();
        } catch (_) {}
        this.usbDevice = null;
      }
    } catch (e) {
      logger.warn('USB Kapatma hatası', e);
    } finally {
      this.connectionType = null;
      this.deviceName = null;
      logger.info('USB / Seri yazıcı bağlantısı kesildi.');
    }
  }

  /**
   * Transmit raw binary chunks to connected USB or Serial printer with backpressure flow control
   */
  async sendRaw(data: Uint8Array, chunkSize: number = 1024): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kablolu USB veya Seri yazıcı bağlı değil.');
    }

    if (this.connectionType === 'webusb' && this.usbDevice) {
      for (let offset = 0; offset < data.length; offset += chunkSize) {
        const slice = data.subarray(offset, Math.min(offset + chunkSize, data.length));
        await this.usbDevice.transferOut(this.endpointNumber, slice);
        // Micro throttle to prevent USB controller buffer overflow on large 15x10cm bitmaps
        if (data.length > 4096) {
          await new Promise(r => setTimeout(r, 4));
        }
      }
      logger.info(`WebUSB ${data.length} bayt veri iletildi.`);
    } else if (this.connectionType === 'webserial' && this.serialWriter) {
      for (let offset = 0; offset < data.length; offset += chunkSize) {
        const slice = data.subarray(offset, Math.min(offset + chunkSize, data.length));
        await this.serialWriter.write(slice);
        await new Promise(r => setTimeout(r, 5));
      }
      logger.info(`Web Serial ${data.length} bayt veri iletildi.`);
    }
  }

  /**
   * Prints bitmap data directly to Zebra ZD220 (using ZPL) or TSPL/ESC-POS
   */
  /**
   * Prints bitmap data directly to Zebra ZD220 (using ZPL) or TSPL/ESC-POS
   * Fully respects Gapped / Die-Cut label sensing, continuous rolls, and tear-off alignment.
   */
  async printBitmap(
    bitmap: Uint8Array,
    widthDots: number,
    heightDots: number,
    options: {
      protocol?: 'zpl' | 'tspl' | 'escpos';
      darkness?: number;
      widthMm?: number;
      heightMm?: number;
      mediaType?: 'gap' | 'continuous' | 'blackmark';
      gapMm?: number;
      directThermal?: boolean;
    } = {}
  ): Promise<void> {
    const proto = options.protocol || this.protocol;

    if (proto === 'zpl') {
      logger.info(`Zebra ZPL baskısı hazırlanıyor (${widthDots}x${heightDots} dot, Medya: ${options.mediaType || 'gap'})...`);
      const zplCode = buildZplLabel(bitmap, widthDots, heightDots, {
        darkness: options.darkness ?? 15,
        labelWidthMm: options.widthMm,
        labelHeightMm: options.heightMm,
        mediaType: options.mediaType ?? 'gap',
        gapMm: options.gapMm ?? 3,
        directThermal: options.directThermal !== false,
        mediaHandling: 'tear'
      });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(zplCode);
      await this.sendRaw(bytes);
    } else if (proto === 'tspl') {
      logger.info(`TSPL etiket baskısı hazırlanıyor (${options.widthMm || 100}x${options.heightMm || 100}mm)...`);
      const tsplBytes = buildTsplLabel(
        bitmap,
        widthDots,
        heightDots,
        options.widthMm || 100,
        options.heightMm || 100,
        {
          gapMm: options.gapMm ?? 2,
          mediaType: options.mediaType ?? 'gap',
          darkness: options.darkness
        }
      );
      await this.sendRaw(tsplBytes);
    } else {
      // ESC/POS GS v 0
      logger.info(`ESC/POS USB raster baskısı hazırlanıyor...`);
      const xL = (widthDots / 8) % 256;
      const xH = Math.floor((widthDots / 8) / 256);
      const yL = heightDots % 256;
      const yH = Math.floor(heightDots / 256);
      const header = new Uint8Array([0x1B, 0x40, 0x1D, 0x76, 0x30, 0, xL, xH, yL, yH]);
      const footer = new Uint8Array([0x1B, 0x64, 3]);
      const combined = new Uint8Array(header.length + bitmap.length + footer.length);
      combined.set(header, 0);
      combined.set(bitmap, header.length);
      combined.set(footer, header.length + bitmap.length);
      await this.sendRaw(combined);
    }
  }

  /**
   * Triggers hardware gap sensor auto-calibration on connected printer.
   * For Zebra: Sends ~JC (Set Media Sensor Calibration) + ^JUS
   * For TSPL: Sends GAPDETECT + HOME
   */
  async calibrateSensor(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Yazıcı bağlı değil. Lütfen önce USB veya Seri bağlantı kurun.');
    }

    if (this.protocol === 'zpl') {
      logger.info('Zebra ZD220 Boşluk Sensör Kalibrasyonu (~JC) başlatılıyor...');
      const cmd = buildZplCalibrateCommand();
      const encoder = new TextEncoder();
      await this.sendRaw(encoder.encode(cmd));
      logger.info('Zebra kalibrasyon komutu iletildi. Yazıcı 2-3 etiket ilerleyip boşlukları kaydedecek.');
    } else if (this.protocol === 'tspl') {
      logger.info('TSPL Boşluk Sensör Kalibrasyonu (GAPDETECT) başlatılıyor...');
      const bytes = buildTsplCalibrateCommand();
      await this.sendRaw(bytes);
    } else {
      logger.info('ESC/POS kalibrasyon komutu.');
    }
  }

  /**
   * Feeds paper to align exactly at the start of the next label gap (Form Feed).
   */
  async feedToNextGap(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Yazıcı bağlı değil.');
    }

    if (this.protocol === 'zpl') {
      logger.info('Zebra sonraki etiket boşluğuna ilerletiliyor (Form Feed)...');
      const cmd = buildZplFeedToGapCommand();
      const encoder = new TextEncoder();
      await this.sendRaw(encoder.encode(cmd));
    } else if (this.protocol === 'tspl') {
      logger.info('TSPL sonraki etiket boşluğuna ilerletiliyor...');
      const bytes = buildTsplFeedToGapCommand();
      await this.sendRaw(bytes);
    } else {
      // ESC/POS feed 3 lines
      await this.sendRaw(new Uint8Array([0x1B, 0x64, 4]));
    }
  }

  /**
   * System Thermal Driver Print (Bypasses WebUSB for installed Windows/macOS Zebra driver)
   * Perfectly renders 10x10cm, 10x15cm, 15x10cm or custom label directly in print spooler.
   */
  static printViaSystemDriver(
    canvasOrImgSrc: HTMLCanvasElement | string,
    widthMm: number = 100,
    heightMm: number = 100,
    labelTitle: string = 'Zebra ZD220 Etiket'
  ): void {
    const imgSrc = typeof canvasOrImgSrc === 'string' ? canvasOrImgSrc : canvasOrImgSrc.toDataURL('image/png');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${labelTitle}</title>
          <style>
            @page {
              size: ${widthMm}mm ${heightMm > 0 ? `${heightMm}mm` : 'auto'};
              margin: 0mm;
            }
            @media print {
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .label-image {
                width: 100% !important;
                height: auto !important;
                display: block !important;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: pixelated;
              }
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: #ffffff;
            }
            .label-image {
              max-width: 100%;
              height: auto;
              image-rendering: pixelated;
            }
          </style>
        </head>
        <body>
          <img src="${imgSrc}" class="label-image" />
        </body>
      </html>
    `;

    // Use Hidden Iframe directly (bypasses all popup blockers, works inside iframes and deployed web apps)
    try {
      const existingIframe = document.getElementById('iprint-system-print-iframe');
      if (existingIframe) {
        existingIframe.remove();
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'iprint-system-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = '0';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        const triggerPrint = () => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (err) {
            logger.error('Iframe yazdırma tetikleme hatası', err);
          } finally {
            setTimeout(() => {
              try { iframe.remove(); } catch {}
            }, 5000);
          }
        };

        const imgEl = doc.querySelector('img');
        if (imgEl && !imgEl.complete) {
          imgEl.onload = () => setTimeout(triggerPrint, 150);
          imgEl.onerror = () => triggerPrint();
        } else {
          setTimeout(triggerPrint, 250);
        }
      }
    } catch (err) {
      logger.error('Sistem sürücüsü yazdırma hatası', err);
      // Fallback to window.open if iframe creation was blocked
      try {
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 300);
        }
      } catch (popupErr) {
        logger.error('Popup fallback de başarısız', popupErr);
      }
    }
  }

  /**
   * Export / Download ZPL File (.zpl) for offline batch spooling or Zebra Setup Utilities
   */
  static downloadZplFile(
    bitmap: Uint8Array,
    widthDots: number,
    heightDots: number,
    filename: string = 'zebra_etiket_10x10.zpl',
    options?: { darkness?: number; widthMm?: number; heightMm?: number }
  ): void {
    const zpl = buildZplLabel(bitmap, widthDots, heightDots, options);
    const blob = new Blob([zpl], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logger.info(`ZPL dosyası indirildi: ${filename}`);
  }
}

export const usbPrinter = new UsbPrinterService();
