import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

const DEVICE_KEY = 'dm_device_id';

export function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export async function isDeviceBanned(deviceId: string) {
  const { data, error } = await supabase.rpc('is_device_banned', { p_device_id: deviceId });
  if (error) throw error;
  return data as boolean;
}

export async function logDeviceEvent(event: { userId?: string; deviceId?: string; fingerprint?: any; eventType?: string }) {
  const { userId, deviceId, fingerprint, eventType = 'unknown' } = event;
  const { error } = await supabase.from('device_logs').insert([{
    user_id: userId ?? null,
    device_id: deviceId ?? getOrCreateDeviceId(),
    fingerprint: fingerprint ?? null,
    event: eventType
  }]);
  if (error) throw error;
  return true;
}

export async function rejectIfDeviceBannedOrThrow() {
  const id = getOrCreateDeviceId();
  const banned = await isDeviceBanned(id);
  if (banned) {
    throw new Error('Device is banned');
  }
  return false;
}
