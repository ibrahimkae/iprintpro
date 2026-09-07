import { logger } from './logger';

const PROFILES_KEY = 'iprint_device_profiles_v1';

export interface DeviceProfile {
  /** Stable key: BLE deviceId (or normalized name as fallback) */
  id: string;
  deviceName: string;
  protocol: 'auto' | 'luckjingle' | 'escpos';
  channelUuid: string | null;
  darkness: number;
  isExtraDark: boolean;
  pageWidth: number;
  printDelay: number;
  updatedAt: number;
}

export function getDeviceProfiles(): DeviceProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? (JSON.parse(raw) as DeviceProfile[]) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: DeviceProfile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles.slice(0, 20)));
  } catch (e) {
    logger.warn('Device profile storage failed', e);
  }
}

/**
 * Stable profile id. Web Bluetooth deviceId is stable per origin+device,
 * but can be unavailable — fall back to a normalized name.
 */
export function makeProfileId(deviceId: string | null, deviceName: string | null): string {
  if (deviceId) return `id:${deviceId}`;
  const name = (deviceName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `name:${name || 'unknown'}`;
}

export function findDeviceProfile(id: string): DeviceProfile | null {
  return getDeviceProfiles().find(p => p.id === id) ?? null;
}

export function upsertDeviceProfile(profile: Omit<DeviceProfile, 'updatedAt'>): void {
  const profiles = getDeviceProfiles();
  const existing = profiles.findIndex(p => p.id === profile.id);
  const next: DeviceProfile = { ...profile, updatedAt: Date.now() };
  if (existing >= 0) profiles[existing] = next;
  else profiles.unshift(next);
  saveProfiles(profiles);
  logger.info(`Cihaz profili kaydedildi: ${profile.deviceName}`);
}

export function deleteDeviceProfile(id: string): void {
  saveProfiles(getDeviceProfiles().filter(p => p.id !== id));
}
