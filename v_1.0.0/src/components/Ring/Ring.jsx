import { useState, useEffect, useRef, useMemo } from 'react';
import { REDUCED } from '../../lib/constants.js';
import './Ring.css';

function useCountUp(target, dur) {
  const [v, setV] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current, to = target;
    prev.current = target;
    if (from === to) return;
    if (REDUCED) { setV(to); return; }
    let raf;
    const t0 = performance.now(), D = dur || 650;
    const step = t => {
      const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return v;
}

export function Num({ v, dur, style, className }) {
  const n = useCountUp(v, dur);
  return <span className={`num ${className || ''}`} style={style}>{n}</span>;
}

export default function Ring({ val, max, size, tone, label }) {
  const S   = size || 96;
  const R   = (S - 10) / 2;
  const C   = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, val / max));

  const [pulse, setPulse] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 520);
    return () => clearTimeout(t);
  }, [val]);

  const id = useMemo(() => 'rg' + Math.random().toString(36).slice(2, 8), []);

  return (
    <div
      className={`ring-wrap${pulse ? ' ring-pulse' : ''}`}
      style={{ width: S, height: S }}
      role="img"
      aria-label={`${label || 'score'}: ${val} of ${max}`}
    >
      <svg width={S} height={S}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={tone} />
            <stop offset="100%" stopColor="#F5C445" />
          </linearGradient>
        </defs>
        <circle className="ring-track" cx={S / 2} cy={S / 2} r={R} />
        <circle
          className="ring-val"
          cx={S / 2} cy={S / 2} r={R}
          stroke={`url(#${id})`}
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 6px ${tone}66)` }}
        />
      </svg>
      <div className="ring-center">
        <div>
          <div className="rv" style={{ color: tone }}><Num v={val} /></div>
          <div className="rl">{label || `of ${max}`}</div>
        </div>
      </div>
    </div>
  );
}
