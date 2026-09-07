/**
 * Tek kaynak API adresi.
 * - VITE_API_URL verilmişse onu kullan (üretim: Cloud Run vb.)
 * - localhost'ta çalışırken geliştirme sunucusu :3001
 * - Diğer hostlarda (AI Studio preview domain) aynı origin — göreceli yol,
 *   böylece mixed-content ve yanlış-host sorunları oluşmaz.
 */
export function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof location !== 'undefined') {
    const h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]') return 'http://localhost:3001';
  }
  return '';
}

export const API_BASE = resolveApiBase();
