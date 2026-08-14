import { score }        from '../../lib/scoring.js';
import { weightsFor }   from '../../lib/storage.js';
import { TODAY, pretty, addDays, weekOf } from '../../lib/dates.js';
import { LEVELS }       from '../../lib/constants.js';
import { levelFor }     from '../../lib/scoring.js';
import Card             from '../../components/Card/Card.jsx';
import { Num }          from '../../components/Ring/Ring.jsx';
import './ChallengeView.css';

function Level({ p, name, pts, tone, glow }) {
  const lv   = levelFor(pts);
  const next = LEVELS[LEVELS.indexOf(lv) + 1];
  const span = next ? next.min - lv.min : 1;
  const pct  = next ? Math.min(100, (pts - lv.min) / span * 100) : 100;

  return (
    <div className="lvl">
      <div className="lvl-top">
        <span className="lvl-name" style={{ color: tone }}>{name}</span>
        <span className="lvl-pts"><Num v={pts} /></span>
        <span className="lvl-tier">{lv.icon} {lv.name}</span>
      </div>
      <div className="lvl-bar">
        <i style={{ width: pct + '%', background: `linear-gradient(90deg,${glow},${tone})` }} />
        <div className="lvl-marks" aria-hidden="true">
          {[20, 40, 60, 80].map(m => <i key={m} style={{ left: m + '%' }} />)}
        </div>
      </div>
      <div className="lvl-next">
        {next ? `${next.min - pts} points to ${next.icon} ${next.name}` : 'Top level reached 👑'}
      </div>
    </div>
  );
}

export default function ChallengeView({ st }) {
  const days   = Array.from({ length: 30 }, (_, i) => addDays(st.start, i));
  const totals = { a: 0, b: 0 };

  const cells = days.map((k, i) => {
    const W  = weightsFor(st, weekOf(k, st.start));
    const a  = score(st.entries.a[k], W);
    const b  = score(st.entries.b[k], W);
    totals.a += a.total;
    totals.b += b.total;
    return { k, i, a: a.total, b: b.total, hasA: !!st.entries.a[k], hasB: !!st.entries.b[k] };
  });

  return (
    <div className="view">
      <div className="datestrip rise">
        <div className="dt">
          The full 30
          <small>{pretty(st.start)} — {pretty(addDays(st.start, 29))}</small>
        </div>
        <div className="strip-score">
          <div>
            <span className="eyebrow">Combined points</span>
            <div><span className="combined-pts num">{totals.a + totals.b}</span></div>
          </div>
        </div>
      </div>

      <Card title="Every day on the board" delay={60}
            note={<span><span className="a-tx">■</span> {st.names.a} &nbsp; <span className="b-tx">■</span> {st.names.b}</span>}>
        <div className="dgrid">
          {cells.map(c => (
            <div
              key={c.k}
              className={`dcell${c.k === TODAY ? ' today' : ''}`}
              style={{ '--d': (c.i * 26) + 'ms' }}
              title={`${pretty(c.k)} — ${st.names.a} ${c.hasA ? c.a : '—'}, ${st.names.b} ${c.hasB ? c.b : '—'}`}
            >
              <div className="dbars">
                <div className={`dbar${c.hasA ? ' a' : ''}`} style={{ height: Math.max(2, c.a / 100 * 38) + 'px' }} />
                <div className={`dbar${c.hasB ? ' b' : ''}`} style={{ height: Math.max(2, c.b / 100 * 38) + 'px' }} />
              </div>
              <div className="dn">{c.i + 1}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Levels" note="Points across all 30 days" delay={140}>
        <Level p="a" name={st.names.a} pts={totals.a} tone="#FF7A4D" glow="#b23a14" />
        <Level p="b" name={st.names.b} pts={totals.b} tone="#4FC3E8" glow="#0e6a8c" />
        <hr className="rule" />
        <div className="lvl-ladder">
          {LEVELS.map(l => (
            <div key={l.name} className="li">
              <span className="m">{l.min}+</span> {l.icon} {l.name}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
