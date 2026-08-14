import { CATS, BASE_W, LEVELS } from './constants.js';

export const emptyEntry = () => ({
  wakeup:   { onTime: false, noSnooze: false, noScroll: false },
  workout:  { tier: 0, extra: false, activity: '' },
  work:     { focus: 0, discipline: 0, learning: 0 },
  personal: { reading: 0, phone: 0, water: 0, food: 0, hobby: 0 },
  sleep:    { bed: false, enough: false, phoneAway: false, prep: false },
  note: '',
});

export function rawScores(e) {
  if (!e) return { wakeup: 0, workout: 0, work: 0, personal: 0, sleep: 0 };
  const w = e.wakeup || {}, wo = e.workout || {}, wk = e.work || {}, p = e.personal || {}, s = e.sleep || {};
  return {
    wakeup:   (w.onTime ? 7 : 0) + (w.noSnooze ? 2 : 0) + (w.noScroll ? 1 : 0),
    workout:  Math.min(25, (wo.tier || 0) + ((wo.tier || 0) > 0 && wo.extra ? 3 : 0)),
    work:     (wk.focus || 0) + (wk.discipline || 0) + (wk.learning || 0),
    personal: (p.reading || 0) + (p.phone || 0) + (p.water || 0) + (p.food || 0) + (p.hobby || 0),
    sleep:    (s.bed ? 7 : 0) + (s.enough ? 5 : 0) + (s.phoneAway ? 2 : 0) + (s.prep ? 1 : 0),
  };
}

export function score(e, weights) {
  const raw = rawScores(e);
  const weighted = {};
  let total = 0;
  for (const c of CATS) {
    const v = Math.round(raw[c.key] / c.base * (weights[c.key] ?? c.base));
    weighted[c.key] = v;
    total += v;
  }
  return { raw, weighted, total, logged: !!e };
}

export const levelFor = pts =>
  [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0];

export function weekStats(entries, dates, weights) {
  let total = 0, best = 0, bestDay = null, logged = 0, workout = 0, learning = 0, sleep = 0;
  const perDay = [], catTotals = {};
  CATS.forEach(c => { catTotals[c.key] = 0; });
  dates.forEach(k => {
    const e = entries[k];
    const s = score(e, weights);
    perDay.push({ date: k, ...s });
    if (!e) return;
    logged++; total += s.total;
    if (s.total > best) { best = s.total; bestDay = k; }
    CATS.forEach(c => { catTotals[c.key] += s.weighted[c.key]; });
    if (s.raw.workout > 0) workout++;
    if ((e.work && e.work.learning || 0) > 0) learning++;
    if (s.raw.sleep >= 12) sleep++;
  });
  return {
    total, best, bestDay, logged, workout, learning, sleep, perDay, catTotals,
    avg: logged ? Math.round(total / logged) : 0,
  };
}

// streakFor is defined in storage.js to avoid circular dep with dates.js