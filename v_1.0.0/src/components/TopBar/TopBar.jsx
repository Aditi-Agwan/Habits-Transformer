import { useRef, useLayoutEffect, useState } from 'react';
import { pad } from '../../lib/dates.js';
import { TABS } from '../../lib/constants.js';
import './TopBar.css';

export default function TopBar({ names, dayNo, myStreak, me, tab, onPickMe, onGoTab, isLocked }) {
  const tabRefs = useRef({});
  const tabsRef = useRef(null);
  const [ink, setInk] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el   = tabRefs.current[tab];
    const zone = tabsRef.current;
    if (!el || !zone) return;
    const measure = () => setInk({ left: el.offsetLeft, width: el.offsetWidth });
    measure();
    addEventListener('resize', measure);
    return () => removeEventListener('resize', measure);
  }, [tab]);

  return (
    <header className="topbar">
      <div className="topbar-in">
        <h1 className="brand">
          <span className="brand-badge" aria-hidden="true">🏸</span>
          <span>
            <span className="brand-name">Project <b>100</b></span>
            <span className="brand-sub">The Arena</span>
          </span>
        </h1>

        <span className="daychip">
          {dayNo >= 1 && dayNo <= 30
            ? `DAY ${pad(dayNo)} / 30`
            : dayNo < 1 ? 'NOT STARTED' : 'COMPLETE'}
        </span>

        {myStreak > 0 && (
          <span className="streakchip" title={`Current streak: ${myStreak} days`}>
            <span className="fl">🔥</span>{myStreak}
          </span>
        )}

        <div className="who">
          <span className="who-label">Logging as</span>
          <div className="pillbox">
            <button className={`pill${me === 'a' ? ' on-a' : ''}`} onClick={() => onPickMe('a')}>
              {names.a}
              {isLocked && isLocked('a') && <span className="pill-lock" aria-label="locked">🔒</span>}
            </button>
            <button className={`pill${me === 'b' ? ' on-b' : ''}`} onClick={() => onPickMe('b')}>
              {names.b}
              {isLocked && isLocked('b') && <span className="pill-lock" aria-label="locked">🔒</span>}
            </button>
          </div>
        </div>
      </div>

      <nav className="tabs" ref={tabsRef}>
        {TABS.map(([k, l, ic]) => (
          <button
            key={k}
            ref={el => { tabRefs.current[k] = el; }}
            className={`tab${tab === k ? ' on' : ''}`}
            onClick={() => onGoTab(k)}
          >
            <span className="ticon" aria-hidden="true">{ic}</span>{l}
          </button>
        ))}
        <span
          className="tab-ink"
          style={{ left: ink.left, width: ink.width }}
          aria-hidden="true"
        />
      </nav>
    </header>
  );
}
