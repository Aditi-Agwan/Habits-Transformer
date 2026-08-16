import { useState, useEffect, useRef, useCallback } from 'react';
import { TODAY, diffDays }          from './lib/dates.js';
import { REDUCED }                  from './lib/constants.js';
import { KEY, ME, store, freshState, streakFor } from './lib/storage.js';
import { hashPin, newSalt, PBKDF2_ITER,
         loadAuth, persistAuth,
         loadUnlocked, persistUnlocked } from './lib/auth.js';
import { boom }                     from './lib/boom.js';
import Sky                          from './components/Sky/Sky.jsx';
import ConfettiLayer                from './components/ConfettiLayer/ConfettiLayer.jsx';
import TopBar                       from './components/TopBar/TopBar.jsx';
import PinModal                     from './components/PinModal/PinModal.jsx';
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

  /* ── PIN locks ── */
  const [auth,      setAuth]      = useState(loadAuth);
  const [unlocked,  setUnlocked]  = useState(loadUnlocked);
  const [lockModal, setLockModal] = useState(null);   // {mode, p, after}

  const isLocked = p => !!auth[p] && !unlocked[p];
  const verifyFor = p => async pin => {
    const rec = auth[p];
    if (!rec) return true;
    return (await hashPin(pin, rec.salt, rec.iter || PBKDF2_ITER)) === rec.hash;
  };
  const saveFor = p => async newPin => {
    if (newPin == null) {                              // remove the lock
      const a = { ...auth }; delete a[p];
      setAuth(a); persistAuth(a);
      const u = { ...unlocked }; delete u[p];
      setUnlocked(u); persistUnlocked(u);
      return;
    }
    const salt = newSalt();
    const rec  = { salt, iter: PBKDF2_ITER, hash: await hashPin(newPin, salt, PBKDF2_ITER) };
    const a = { ...auth, [p]: rec };
    setAuth(a); persistAuth(a);
    const u = { ...unlocked, [p]: true };              // setting your own PIN leaves you unlocked
    setUnlocked(u); persistUnlocked(u);
  };
  const openLock   = (p, mode, after) => setLockModal({ p, mode, after });
  const finishLock = () => {
    const m = lockModal;
    if (!m) return;
    if (m.mode === 'unlock') {
      const u = { ...unlocked, [m.p]: true };
      setUnlocked(u); persistUnlocked(u);
    }
    setLockModal(null);
    if (m.after) m.after();
    boom({ count: m.mode === 'unlock' ? 70 : 50 });
  };

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

  const pickMe = p => {
    if (p !== me && isLocked(p)) {
      openLock(p, 'unlock', () => { setMe(p); store.set(ME, p, false); });
      return;
    }
    setMe(p); store.set(ME, p, false);
  };
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
        isLocked={isLocked}
      />

      <main className="wrap">
        {tab === 'day'   && <DayView key="day" st={st} me={me} cursor={cursor} setCursor={setCursor} update={update}
                                     lockedMe={isLocked(me)} requestUnlock={() => openLock(me, 'unlock')} />}
        {tab === 'week'  && <WeekView key="week" st={st} setSt={setSt} me={me} />}
        {tab === 'run'   && <ChallengeView key="run" st={st} />}
        {tab === 'setup' && <SetupView key="setup" st={st} setSt={setSt} me={me} reload={setSt}
                                       auth={auth} isLocked={isLocked} openLock={openLock} />}
      </main>

      {lockModal && (
        <PinModal
          mode={lockModal.mode}
          name={st.names[lockModal.p]}
          verify={verifyFor(lockModal.p)}
          save={saveFor(lockModal.p)}
          onDone={finishLock}
          onClose={() => setLockModal(null)}
        />
      )}

      <div className={`toast${saved ? ' show' : ''}`} role="status">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7.5 5.5 11 12 3.5" />
        </svg>
        Saved
      </div>
    </>
  );
}
