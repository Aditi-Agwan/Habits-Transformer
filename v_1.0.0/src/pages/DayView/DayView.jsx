import { useState } from 'react';
import { score }             from '../../lib/scoring.js';
import { weightsFor }        from '../../lib/storage.js';
import { TODAY, pretty, addDays, diffDays, weekOf } from '../../lib/dates.js';
import { CATS }              from '../../lib/constants.js';
import { boom }              from '../../lib/boom.js';
import Card                  from '../../components/Card/Card.jsx';
import Ring                  from '../../components/Ring/Ring.jsx';
import VersusHero            from '../../components/VersusHero/VersusHero.jsx';
import { Court, BreakdownRow } from '../../components/Court/Court.jsx';
import LogForm               from '../../components/LogForm/LogForm.jsx';
import './DayView.css';

export default function DayView({ st, me, cursor, setCursor, update, lockedMe, requestUnlock }) {
  const wk    = weekOf(cursor, st.start);
  const W     = weightsFor(st, wk);
  const eA    = st.entries.a[cursor];
  const eB    = st.entries.b[cursor];
  const sA    = score(eA, W);
  const sB    = score(eB, W);
  const mine  = me === 'a' ? sA : sB;
  const dayNo = diffDays(cursor, st.start) + 1;
  const [flash, setFlash] = useState(0);

  const change = v => {
    const before = score(me === 'a' ? eA : eB, W).total;
    update(me, cursor, v);
    const after = score(v, W).total;
    if (before < 100 && after >= 100) {
      boom({ count: 260, power: 1.5, spread: 2.8 });
      setTimeout(() => boom({ x: innerWidth * 0.18, y: innerHeight * 0.7, angle: -Math.PI / 2.6, count: 90 }), 220);
      setTimeout(() => boom({ x: innerWidth * 0.82, y: innerHeight * 0.7, angle: -Math.PI + Math.PI / 2.6, count: 90 }), 380);
      setFlash(f => f + 1);
    } else if (before < 80 && after >= 80) {
      boom({ count: 140 });
    }
  };

  return (
    <div className="view" key={cursor}>
      <div className="datestrip rise">
        <button className="arrow" onClick={() => setCursor(addDays(cursor, -1))} aria-label="Previous day">‹</button>
        <button className="arrow" onClick={() => setCursor(addDays(cursor, 1))} disabled={cursor >= TODAY} aria-label="Next day">›</button>
        <div className="dt">
          {cursor === TODAY ? 'Today' : pretty(cursor)}
          <small>
            {cursor === TODAY ? pretty(cursor) : ''}
            {dayNo >= 1 && dayNo <= 30 ? ` · Day ${dayNo} of 30` : ''}
          </small>
        </div>
        {cursor !== TODAY && (
          <button className="today-btn" onClick={() => setCursor(TODAY)}>Back to today</button>
        )}
        <div className="strip-score">
          <Ring val={mine.total} max={100} size={92} tone={me === 'a' ? '#FF7A4D' : '#4FC3E8'} label="your score" />
        </div>
      </div>

      <VersusHero names={st.names} sA={sA} sB={sB} />

      <div className="grid2">
        <Card title={`${st.names[me]} — log the day`} delay={90} note={<span>Week {wk} weights<br />Scores save as you type</span>}>
          {lockedMe
            ? (
              <div className="lockpanel">
                <span className="big" aria-hidden="true">🔒</span>
                <p><b>{st.names[me]}</b>'s scorecard is PIN-locked.<br />Only they can put points on this board.</p>
                <button className="btn gold" onClick={requestUnlock}>Unlock to log</button>
              </div>
            )
            : <LogForm entry={me === 'a' ? eA : eB} weights={W} tone={me === 'a' ? 'pa' : 'pb'} onChange={change} />}
        </Card>

        <div>
          <Card title="Head to head" note={pretty(cursor)} delay={150}>
            {(!eA && !eB)
              ? (
                <div className="empty">
                  <span className="e-ico">🏸</span>
                  Nothing logged for this day yet.<br />
                  Fill in the left panel to put a score on the board.
                </div>
              )
              : <Court names={st.names} sA={sA} sB={sB} weights={W} />}
          </Card>

          <Card title="Where the points went" delay={210}>
            {[['a', sA, eA], ['b', sB, eB]].map(([p, s, e]) => (
              <BreakdownRow key={p} player={p} name={st.names[p]} s={s} e={e} weights={W} />
            ))}
            <div className="golden">
              <b>Never let one bad day become a bad week.</b> A 32 you wrote honestly is worth more than a 72 you talked yourself into.
            </div>
          </Card>
        </div>
      </div>

      {flash > 0 && (
        <div className="flash" key={flash} aria-hidden="true">
          <span className="fword">Perfect Day</span>
        </div>
      )}
    </div>
  );
}
