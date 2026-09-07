import { PrinterService } from './printer';

/**
 * App-wide singleton. Both PrinterProvider and legacy call sites
 * reference this exact instance so connection state stays coherent.
 */
export const printer = new PrinterService();
