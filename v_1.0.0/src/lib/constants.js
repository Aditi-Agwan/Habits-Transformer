export const CATS = [
  { key: 'wakeup',   label: 'Wakeup',   icon: '🌅', base: 10, tone: '#F5C445' },
  { key: 'workout',  label: 'Workout',  icon: '💪', base: 25, tone: '#EF5B2A' },
  { key: 'work',     label: 'Work',     icon: '💼', base: 25, tone: '#22A0CC' },
  { key: 'personal', label: 'Personal', icon: '🌱', base: 25, tone: '#7BC96F' },
  { key: 'sleep',    label: 'Sleep',    icon: '😴', base: 15, tone: '#B78CF0' },
];

export const BASE_W = { wakeup: 10, workout: 25, work: 25, personal: 25, sleep: 15 };

export const TIERS = [
  { v: 0,  t: 'Rest day'   },
  { v: 8,  t: '10–20 min'  },
  { v: 12, t: '20–30 min'  },
  { v: 17, t: '30–45 min'  },
  { v: 20, t: '45–60 min'  },
  { v: 22, t: '60+ min'    },
];

export const LEVELS = [
  { min: 0,    name: 'Getting Started', icon: '🌱' },
  { min: 501,  name: 'Building',        icon: '🌿' },
  { min: 1001, name: 'Consistent',      icon: '💪' },
  { min: 1501, name: 'Strong',          icon: '🔥' },
  { min: 2001, name: 'Disciplined',     icon: '🏆' },
  { min: 2501, name: 'Level Up',        icon: '👑' },
];

export const TABS = [
  ['day',   'Today',   '⚔️'],
  ['week',  'Week',    '📊'],
  ['run',   '30 Days', '🗓️'],
  ['setup', 'Setup',   '⚙️'],
];

export const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;