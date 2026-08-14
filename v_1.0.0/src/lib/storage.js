import { TODAY } from './dates.js';
import { addDays } from './dates.js';
import { score } from './scoring.js';
import { BASE_W } from './constants.js';

export const KEY = 'project100:state';
export const ME  = 'project100:me';

export const hasClaude =
  typeof window !== 'undefined' &&
  window.storage &&
  typeof window.storage.get === 'function';

export const store = {
  async get(k, shared) {
    if (hasClaude) {
      try { const r = await window.storage.get(k, shared); return r ? JSON.parse(r.value) : null; }
      catch (e) { return null; }
    }
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }
    catch (e) { return null; }
  },
  async set(k, val, shared) {
    if (hasClaude) {
      try { await window.storage.set(k, JSON.stringify(val), shared); } catch (e) {}
      return;
    }
    try { localStorage.setItem(k, JSON.stringify(val)); } catch (e) {}
  },
};

export const freshState = () => ({
  v: 1,
  names: { a: 'Player A', b: 'Player B' },
  start: TODAY,
  weights: {},
  entries: { a: {}, b: {} },
});

export const weightsFor = (st, w) => ({ ...BASE_W, ...(st.weights[w] || {}) });

export function streakFor(entries) {
  let n = 0, k = TODAY;
  if (!entries[k]) k = addDays(TODAY, -1);
  while (entries[k] && score(entries[k], BASE_W).total > 0) { n++; k = addDays(k, -1); }
  return n;
}
