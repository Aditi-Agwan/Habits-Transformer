import { useState, useEffect, useRef } from 'react';
import './PinModal.css';

/* Modes: 'unlock' | 'set' | 'change' | 'remove' */
export default function PinModal({ mode, name, verify, save, onDone, onClose }) {
  const [cur, setCur]       = useState('');
  const [nw, setNw]         = useState('');
  const [cf, setCf]         = useState('');
  const [err, setErr]       = useState('');
  const [shake, setShake]   = useState(0);
  const [busy, setBusy]     = useState(false);
  const [opened, setOpened] = useState(false);
  const firstRef = useRef(null);

  useEffect(() => { firstRef.current && firstRef.current.focus(); }, [shake]);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  const needCur = mode === 'unlock' || mode === 'change' || mode === 'remove';
  const needNew = mode === 'set'    || mode === 'change';
  const TITLES = {
    unlock: ['Unlock ' + name, 'Enter the PIN to log as ' + name + '.', 'Unlock'],
    set:    ['Lock ' + name,   'Pick a PIN (4+ characters). Only its fingerprint is stored — on this device, never sent anywhere.', 'Set PIN'],
    change: ['Change PIN',     'Enter ' + name + "'s current PIN, then the new one.", 'Change'],
    remove: ['Remove PIN',     'Enter ' + name + "'s current PIN to take the lock off.", 'Remove'],
  };
  const [title, sub, cta] = TITLES[mode];

  const fail = m => { setErr(m); setShake(s => s + 1); setBusy(false); };

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setErr('');
    try {
      if (needCur && !(await verify(cur))) return fail('Wrong PIN. Try again.');
      if (needNew) {
        if (nw.length < 4) return fail('PIN needs at least 4 characters.');
        if (nw !== cf)     return fail("Those two don't match.");
        await save(nw);
      }
      if (mode === 'remove') await save(null);
      setOpened(true);
      setTimeout(onDone, 420);            // let the lock spring open first
    } catch (ex) { fail('Something went wrong: ' + ((ex && ex.message) || ex)); }
  };

  return (
    <div className="veil" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form
        className={`modal${shake ? ' shake' : ''}`}
        key={shake}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={`lock-ico${opened ? ' open' : ''}`} aria-hidden="true">{opened ? '🔓' : '🔒'}</div>
        <h3>{title}</h3>
        <p className="m-sub">{sub}</p>

        {needCur && (
          <input
            ref={firstRef} className="pin" type="password" autoComplete="current-password"
            placeholder={mode === 'unlock' ? 'PIN' : 'Current PIN'}
            value={cur} onChange={e => { setCur(e.target.value); setErr(''); }}
          />
        )}
        {needNew && (
          <>
            <input
              ref={needCur ? null : firstRef} className="pin" type="password" autoComplete="new-password"
              placeholder="New PIN"
              value={nw} onChange={e => { setNw(e.target.value); setErr(''); }}
            />
            <input
              className="pin" type="password" autoComplete="new-password"
              placeholder="New PIN again"
              value={cf} onChange={e => { setCf(e.target.value); setErr(''); }}
            />
          </>
        )}

        <div className="m-err" role="alert">{err}</div>
        <div className="m-btns">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn gold" disabled={busy}>{busy ? 'Checking…' : cta}</button>
        </div>
      </form>
    </div>
  );
}
