import { describe, it, expect } from 'vitest';
import { PrinterService } from '../printer';

describe('crc8 (CRC-8/SMBUS, poly 0x07)', () => {
  it('matches the standard check vector "123456789" -> 0xF4', () => {
    const data = new TextEncoder().encode('123456789');
    expect(PrinterService.crc8(data)).toBe(0xf4);
  });

  it('returns 0 for empty input', () => {
    expect(PrinterService.crc8(new Uint8Array([]))).toBe(0);
  });

  it('is order-sensitive', () => {
    expect(PrinterService.crc8(new Uint8Array([0x01, 0x02]))).not.toBe(
      PrinterService.crc8(new Uint8Array([0x02, 0x01]))
    );
  });
});

describe('createLuckJinglePacket', () => {
  it('builds the exact wire frame for a feed command', () => {
    // cmd 0xA1 (feed), arg 0x00, payload = 16-bit dots little endian (240 = 0x00F0)
    const packet = PrinterService.createLuckJinglePacket(
      0xa1,
      0x00,
      new Uint8Array([0xf0, 0x00])
    );

    expect(Array.from(packet)).toEqual([
      0x51, 0x78, // magic
      0xa1, 0x00, // cmd, arg
      0x02, 0x00, // payload length LE
      0xf0, 0x00, // payload
      PrinterService.crc8(new Uint8Array([0xf0, 0x00])), // crc over payload only
      0xff // tail
    ]);
    expect(packet.length).toBe(10);
  });

  it('handles empty payloads (header + tail only)', () => {
    const packet = PrinterService.createLuckJinglePacket(0xa3, 0x00); // battery query
    expect(packet.length).toBe(8);
    expect(Array.from(packet.slice(0, 6))).toEqual([0x51, 0x78, 0xa3, 0x00, 0x00, 0x00]);
    expect(packet.at(-1)).toBe(0xff);
  });

  it('encodes lengths above 255 correctly (little endian)', () => {
    const payload = new Uint8Array(300).fill(0xaa);
    const packet = PrinterService.createLuckJinglePacket(0xa2, 0x00, payload);
    expect(packet[4]).toBe(300 & 0xff); // 0x2C
    expect(packet[5]).toBe(300 >> 8); // 0x01
    expect(packet.length).toBe(8 + 300);
  });
});

describe('feedLuckJingle / bitmapCommand', () => {
  it('clamps feed dots into the 16-bit range', () => {
    const over = PrinterService.feedLuckJingle(70000);
    expect(over[6] | (over[7] << 8)).toBeLessThanOrEqual(65535);
    const under = PrinterService.feedLuckJingle(0);
    expect(under[6] | (under[7] << 8)).toBeGreaterThanOrEqual(1);
  });

  it('wraps raw data in the LuckJingle image command without ESC/POS header', () => {
    const data = new Uint8Array([0xff, 0x00]);
    const cmd = PrinterService.bitmapCommand(16, 1, data, true);
    expect(cmd[0]).toBe(0x51);
    expect(cmd[2]).toBe(0x01); // image cmd id
  });

  it('produces GS v 0 framing for ESC/POS with correct dimensions', () => {
    const bpl = 48; // 384px wide
    const rows = 2;
    const data = new Uint8Array(bpl * rows);
    const cmd = PrinterService.bitmapCommand(384, rows, data, false);
    expect(Array.from(cmd.slice(0, 8))).toEqual([0x1d, 0x76, 0x30, 0x00, bpl, 0x00, rows, 0x00]);
    expect(cmd.length).toBe(8 + data.length);
  });
});
