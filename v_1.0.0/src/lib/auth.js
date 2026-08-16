/* ── PIN locks — per-player, per-device ──
   Only a salted PBKDF2 hash is ever stored; the PIN itself never
   touches disk. Unlocks live in sessionStorage, so closing the tab
   locks everyone again.
   NOTE: this is an honour lock for a friendly competition — the data
   itself is still client-side, it does not pretend to be server-grade
   security. */

export const AUTHKEY   = 'project100:auth';
export const UNLOCKKEY = 'project100:unlocked';
export const PBKDF2_ITER = 120000;

export const canCrypto =
  typeof crypto !== 'undefined' && !!crypto.subtle && !!crypto.getRandomValues;

export const toHex   = b => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
export const fromHex = h => new Uint8Array((h.match(/../g) || []).map(x => parseInt(x, 16)));

export async function hashPin(pin, saltHex, iter) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex), iterations: iter, hash: 'SHA-256' }, key, 256);
  return toHex(new Uint8Array(bits));
}

export const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

export const loadAuth = () => {
  try { return JSON.parse(localStorage.getItem(AUTHKEY)) || {}; } catch (e) { return {}; }
};
export const persistAuth = a => {
  try { localStorage.setItem(AUTHKEY, JSON.stringify(a)); } catch (e) {}
};
export const loadUnlocked = () => {
  try { return JSON.parse(sessionStorage.getItem(UNLOCKKEY)) || {}; } catch (e) { return {}; }
};
export const persistUnlocked = u => {
  try { sessionStorage.setItem(UNLOCKKEY, JSON.stringify(u)); } catch (e) {}
};
