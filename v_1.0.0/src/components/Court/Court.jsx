import { CATS } from '../../lib/constants.js';
import './Court.css';

export function Court({ names, sA, sB, weights }) {
  return (
    <div className="court">
      {CATS.map(c => {
        const w = weights[c.key] ?? c.base;
        const a = sA.weighted[c.key];
        const b = sB.weighted[c.key];
        return (
          <div className="rally" key={c.key}>
            <div className="side l">
              <span className="sc">{a}</span>
              <div className="track">
                <div className="fill a" style={{ width: (w ? a / w * 100 : 0) + '%' }} />
              </div>
            </div>
            <div className="mid">
              <span className="n">{c.label}</span>
              <span className="cap">{w} pts{w !== c.base ? ' ▲' : ''}</span>
            </div>
            <div className="side r">
              <span className="sc">{b}</span>
              <div className="track">
                <div className="fill b" style={{ width: (w ? b / w * 100 : 0) + '%' }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function BreakdownRow({ player, name, s, e, weights }) {
  const isA = player === 'a';
  return (
    <div className="breakdown-row">
      <div className="breakdown-header">
        <span className={`breakdown-player-name ${isA ? 'a-tx' : 'b-tx'}`}>{name}</span>
        <span className="breakdown-total num">
          {s.total}<span className="breakdown-total-dim">/100</span>
        </span>
      </div>
      {!e
        ? <div className="breakdown-not-logged">Not logged.</div>
        : <>
            <div className="split">
              {Object.keys(weights).map(key => {
                const w = weights[key];
                const v = s.weighted[key] || 0;
                return (
                  <div key={key} className="seg" style={{ flex: w }}>
                    <i style={{
                      width: (w ? v / w * 100 : 0) + '%',
                      background: isA
                        ? 'linear-gradient(90deg,var(--pa-deep),var(--pa-mark))'
                        : 'linear-gradient(90deg,var(--pb-mark),var(--pb-deep))',
                    }} />
                  </div>
                );
              })}
            </div>
            {e.workout?.activity && (
              <div className="breakdown-activity">💪 {e.workout.activity}</div>
            )}
            {e.note && (
              <div className="breakdown-note">"{e.note}"</div>
            )}
          </>}
    </div>
  );
}
