import { useState }   from 'react';
import { score }      from '../../lib/scoring.js';
import { TODAY, weekOf, diffDays } from '../../lib/dates.js';
import { weightsFor, freshState, hasClaude } from '../../lib/storage.js';
import { canCrypto }  from '../../lib/auth.js';
import { boom }       from '../../lib/boom.js';
import Card           from '../../components/Card/Card.jsx';
import './SetupView.css';

export default function SetupView({ st, setSt, me, reload, auth, isLocked, openLock }) {
  const [io,  setIo]  = useState('');
  const [msg, setMsg] = useState('');

  const csv = () => {
    const rows = [['Date','Day','Week','Player','Wakeup','Workout','Work','Personal','Sleep','Total','Activity','Note']];
    ['a','b'].forEach(p => {
      Object.keys(st.entries[p]).sort().forEach(k => {
        const wk = weekOf(k, st.start);
        const W  = weightsFor(st, wk);
        const s  = score(st.entries[p][k], W);
        const e  = st.entries[p][k];
        rows.push([
          k, diffDays(k, st.start) + 1, wk, st.names[p],
          s.weighted.wakeup, s.weighted.workout, s.weighted.work, s.weighted.personal, s.weighted.sleep, s.total,
          (e.workout && e.workout.activity) || '',
          (e.note || '').replace(/"/g, "'"),
        ]);
      });
    });
    const text = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
    a.download = `project-100-${TODAY}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setMsg('Downloaded project-100-' + TODAY + '.csv');
  };

  const exportJson = () => {
    setIo(JSON.stringify(st));
    setMsg('Copy the text below and send it over.');
  };

  const importJson = () => {
    try {
      const inc = JSON.parse(io);
      if (!inc.entries) throw new Error('no entries');
      setSt(s => {
        const merged = { a: { ...s.entries.a }, b: { ...s.entries.b } };
        ['a','b'].forEach(p => {
          Object.keys(inc.entries[p] || {}).forEach(k => {
            if (p !== me || !merged[p][k]) merged[p][k] = inc.entries[p][k];
          });
        });
        return { ...s, entries: merged, weights: { ...inc.weights, ...s.weights } };
      });
      setMsg('Merged. Their days are in; yours were left alone.');
      setIo('');
      boom({ count: 80 });
    } catch (e) {
      setMsg('That text is not a valid export. Paste the whole thing, including the braces.');
    }
  };

  return (
    <div className="view">
      <div className="datestrip rise">
        <div className="dt">Setup<small>Names, dates &amp; data</small></div>
      </div>

      <div className="grid2">
        <Card title="The two of you" delay={60}>
          <div className="field">
            <span className="eyebrow label-a">Player A {isLocked('a') && '🔒'}</span>
            <input className="txt" value={st.names.a} maxLength="18" disabled={isLocked('a')}
                   title={isLocked('a') ? 'Unlock this player to rename them' : undefined}
                   onChange={e => setSt(s => ({ ...s, names: { ...s.names, a: e.target.value } }))} />
          </div>
          <div className="field">
            <span className="eyebrow label-b">Player B {isLocked('b') && '🔒'}</span>
            <input className="txt" value={st.names.b} maxLength="18" disabled={isLocked('b')}
                   title={isLocked('b') ? 'Unlock this player to rename them' : undefined}
                   onChange={e => setSt(s => ({ ...s, names: { ...s.names, b: e.target.value } }))} />
          </div>
          <div className="field">
            <span className="eyebrow">Day 1 of the challenge</span>
            <input className="txt" type="date" value={st.start}
                   onChange={e => e.target.value && setSt(s => ({ ...s, start: e.target.value }))} />
          </div>
          <p className="setup-hint">
            Day 1 sets the week boundaries, so change it before you start logging rather than halfway through.
          </p>
        </Card>

        <Card title="Sharing scores" delay={120}>
          <p className="sharing-text">
            {hasClaude
              ? "Both of you are writing to the same shared record, so scores show up on each other's screen without any exporting."
              : 'This copy saves to this browser only. To compare, one of you exports and the other pastes it in — Sunday is a good rhythm for that.'}
          </p>
          <div className="sharing-actions">
            <button className="btn gold" onClick={csv}>Download scores (CSV)</button>
            <button className="btn" onClick={exportJson}>Export my data</button>
            <button className="btn" onClick={importJson} disabled={!io.trim()}>Merge pasted data</button>
          </div>
          <textarea className="txt" rows="6" value={io}
                    onChange={e => { setIo(e.target.value); setMsg(''); }}
                    placeholder="Export drops your data here. Or paste your friend's export and hit merge." />
          {msg && <p className="setup-msg">{msg}</p>}
        </Card>
      </div>

      <Card title="Player locks" delay={150}
            note={<span>PINs live on this device only<br />Closing the tab locks everyone again</span>}>
        {!canCrypto
          ? (
            <p className="locks-text">
              PIN locks need a secure context (https or localhost) — open the app over https to use them.
            </p>
          )
          : (
            <>
              <p className="locks-text">
                Lock a scorecard so only its owner can log points on this device. Fair warning for the honest:
                this is a friendly-competition lock, not bank security — the data itself still lives in this browser.
              </p>
              {['a', 'b'].map(p => (
                <div className="lockrow" key={p}>
                  <span className={`ln ${p === 'a' ? 'label-a' : 'label-b'}`}>{st.names[p]}</span>
                  <span className={`lstat${auth[p] ? ' on' : ''}`}>
                    {auth[p] ? (isLocked(p) ? '🔒 Locked' : '🔓 PIN set — unlocked here') : 'No PIN'}
                  </span>
                  {!auth[p] && <button className="btn gold" onClick={() => openLock(p, 'set')}>Set PIN</button>}
                  {auth[p] && isLocked(p) && <button className="btn" onClick={() => openLock(p, 'unlock')}>Unlock</button>}
                  {auth[p] && !isLocked(p) && (
                    <>
                      <button className="btn" onClick={() => openLock(p, 'change')}>Change PIN</button>
                      <button className="btn danger" onClick={() => openLock(p, 'remove')}>Remove</button>
                    </>
                  )}
                </div>
              ))}
            </>
          )}
      </Card>

      <Card title="Start over" delay={210}>
        <p className="danger-text">
          Wipes every logged day for both players. Download the CSV first if you want to keep the record.
        </p>
        <button className="btn danger" onClick={() => {
          if (confirm('Erase all 30 days for both players?')) { reload(freshState()); }
        }}>
          Erase everything
        </button>
      </Card>
    </div>
  );
}
