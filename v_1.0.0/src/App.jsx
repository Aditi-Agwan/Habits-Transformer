import { useState, useEffect, useRef, useCallback } from 'react';
import { TODAY, diffDays }          from './lib/dates.js';
import { REDUCED }                  from './lib/constants.js';
import { KEY, ME, store, freshState, streakFor } from './lib/storage.js';
import Sky                          from './components/Sky/Sky.jsx';
import ConfettiLayer                from './components/ConfettiLayer/ConfettiLayer.jsx';
import TopBar                       from './components/TopBar/TopBar.jsx';
import DayView                      from './pages/DayView/DayView.jsx';
import WeekView                     from './pages/WeekView/WeekView.jsx';
import ChallengeView                from './pages/ChallengeView/ChallengeView.jsx';
import SetupView                    from './pages/SetupView/SetupView.jsx';
import './styles/globals.css';
import './App.css';

export default function App() {
  const [st,     setSt]     = useState(null);
  const [me,     setMe]     = useState('a');
  const [tab,    setTab]    = useState('day');
  const [cursor, setCursor] = useState(TODAY);
  const [saved,  setSaved]  = useState(false);
  const first = useRef(true);

  /* ── Load from storage on mount ── */
  useEffect(() => {
    (async () => {
      const s = await store.get(KEY, true);
      const m = await store.get(ME, false);
      setSt(s && s.entries ? { ...freshState(), ...s } : freshState());
      if (m === 'a' || m === 'b') setMe(m);
    })();
  }, []);

  /* ── Auto-save on state change ── */
  useEffect(() => {
    if (!st) return;
    if (first.current) { first.current = false; return; }
    const t = setTimeout(async () => {
      await store.set(KEY, st, true);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    }, 450);
    return () => clearTimeout(t);
  }, [st]);

  const pickMe = p => { setMe(p); store.set(ME, p, false); };
  const goTab  = k => {
    setTab(k);
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
  };
  const update = useCallback((player, date, entry) => {
    setSt(s => ({ ...s, entries: { ...s.entries, [player]: { ...s.entries[player], [date]: entry } } }));
  }, []);

  if (!st) return (
    <>
      <Sky />
      <div className="wrap loading-wrap">
        <div className="empty"><span className="e-ico">🏸</span>Loading your scores…</div>
      </div>
    </>
  );

  const dayNo     = diffDays(TODAY, st.start) + 1;
  const myStreak  = st.entries[me] ? streakFor(st.entries[me]) : 0;

  return (
    <>
      <Sky />
      <ConfettiLayer />

      <TopBar
        names={st.names}
        dayNo={dayNo}
        myStreak={myStreak}
        me={me}
        tab={tab}
        onPickMe={pickMe}
        onGoTab={goTab}
      />

      <main className="wrap">
        {tab === 'day'   && <DayView key="day" st={st} me={me} cursor={cursor} setCursor={setCursor} update={update} />}
        {tab === 'week'  && <WeekView key="week" st={st} setSt={setSt} me={me} />}
        {tab === 'run'   && <ChallengeView key="run" st={st} />}
        {tab === 'setup' && <SetupView key="setup" st={st} setSt={setSt} me={me} reload={setSt} />}
      </main>

      <div className={`toast${saved ? ' show' : ''}`} role="status">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7.5 5.5 11 12 3.5" />
        </svg>
        Saved
      </div>
    </>
  );
}
