import { REDUCED } from './constants.js';

export const boom = detail => {
  if (!REDUCED) window.dispatchEvent(new CustomEvent('p100:boom', { detail: detail || {} }));
};
