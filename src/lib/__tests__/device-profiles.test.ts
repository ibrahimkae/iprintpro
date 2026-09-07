import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDeviceProfiles, findDeviceProfile, upsertDeviceProfile,
  deleteDeviceProfile, makeProfileId
} from '../device-profiles';

function installLocalStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k)
  });
}

const profile = (overrides = {}) => ({
  id: 'id:AA:BB',
  deviceName: 'GB03',
  protocol: 'luckjingle' as const,
  channelUuid: '0000ff02',
  darkness: 60,
  isExtraDark: false,
  pageWidth: 384,
  printDelay: 18,
  ...overrides
});

describe('device profiles', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installLocalStorage();
  });

  it('upsert then find returns identical settings', () => {
    upsertDeviceProfile(profile());
    const found = findDeviceProfile('id:AA:BB');
    expect(found?.darkness).toBe(60);
    expect(found?.pageWidth).toBe(384);
  });

  it('second upsert with same id updates instead of duplicating', () => {
    upsertDeviceProfile(profile({ darkness: 10 }));
    upsertDeviceProfile(profile({ darkness: 90 }));
    expect(getDeviceProfiles().length).toBe(1);
    expect(findDeviceProfile('id:AA:BB')?.darkness).toBe(90);
  });

  it('makeProfileId prefers deviceId and normalizes names', () => {
    expect(makeProfileId('XYZ', 'GB03')).toBe('id:XYZ');
    expect(makeProfileId(null, 'My GB-03!')).toBe('name:mygb03');
    expect(makeProfileId(null, null)).toBe('name:unknown');
  });

  it('delete removes the entry', () => {
    upsertDeviceProfile(profile());
    deleteDeviceProfile('id:AA:BB');
    expect(findDeviceProfile('id:AA:BB')).toBeNull();
  });
});
