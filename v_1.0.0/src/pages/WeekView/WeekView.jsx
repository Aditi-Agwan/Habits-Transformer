import { useState, useRef } from 'react';
import { score, weekStats } from '../../lib/scoring.js';
import { streakFor, weightsFor } from '../../lib/storage.js';
import { TODAY, pretty, weekOf, weekDates, fromKey, DOW, diffDays } from '../../lib/dates.js';
import { CATS, BASE_W } from '../../lib/constants.js';
import { boom }         from '../../lib/boom.js';
import Card             from '../../components/Card/Card.jsx';
import { Num }          from '../../components/Ring/Ring.jsx';
import './WeekView.css';

function Scoreboard({ name, s, tone, delay }) {
  return (
    <Card title={name} note={`${s.logged}/7 days logged`} delay={delay}>
      <div className="scoreboard-total">
        <Num v={s.total} className="scoreboard-big-num" style={{ color: tone, textShadow: `0 0 24px ${tone}55` }} />
        <span className="num scoreboard-denom">/700</span>
        <span className="eyebrow" style={{ marginLeft: 'auto' }}>Avg {s.avg}/100</span>
      </div>
      <div className="stats">
        <div className="stat"><div className="k">Best day</div>    <div className="v"><Num v={s.best} /><small>/100</small></div></div>
        <div className="stat"><div className="k">Workout days</div><div className="v"><Num v={s.workout} /><small>/7</small></div></div>
        <div className="stat"><div className="k">Learning days</div><div className="v"><Num v={s.learning} /><small>/7</small></div></div>
        <div className="stat"><div className="k">Good sleep</div>  <div className="v"><Num v={s.sleep} /><small>/7</small></div></div>
        <div className="stat"><div className="k">Streak</div>      <div className="v"><Num v={s.streak} /><small> days</small></div></div>
        <div className="stat"><div className="k">Days logged</div> <div className="v"><Num v={s.logged} /><small>/7</small></div></div>
      </div>
    </Card>
  );
}

export default function WeekView({ st, setSt, me }) {
  const curWeek = Math.min(5, Math.max(1, weekOf(TODAY, st.start)));
  const [wk, setWk]         = useState(curWeek);
  const [draft, setDraft]   = useState(null);
  const [tip, setTip]       = useState(null);
  const [copied, setCopied] = useState(false);
  const [tickKey, setTickKey] = useState(0);
  const chartRef = useRef(null);

  const W       = weightsFor(st, wk);
  const dates   = weekDates(wk, st.start);
  const A       = weekStats(st.entries.a, dates, W);
  const B       = weekStats(st.entries.b, dates, W);
  A.streak = streakFor(st.entries.a);
  B.streak = streakFor(st.entries.b);

  const nextWeek = wk + 1;
  const D        = draft || weightsFor(st, nextWeek);
  const spent    = CATS.reduce((s, c) => s + D[c.key], 0);

  const myStats = me === 'a' ? A : B;
  const weakest = CATS.reduce((w, c) => {
    const pct = myStats.logged ? myStats.catTotals[c.key] / (W[c.key] * myStats.logged) : 1;
    return pct < w.pct ? { key: c.key, label: c.label, pct } : w;
  }, { key: null, label: '', pct: 2 });

  const suggest = () => {
    const pcts = CATS
      .map(c => ({ key: c.key, pct: myStats.logged ? myStats.catTotals[c.key] / (W[c.key] * myStats.logged) : 1 }))
      .sort((x, y) => x.pct - y.pct);
    const n = { ...BASE_W };
    n[pcts[0].key] += 10;
    n[pcts[pcts.length - 1].key] -= 5;
    n[pcts[pcts.length - 2].key] -= 5;
    setDraft(n); setTickKey(k => k + 1);
  };

  const applyWeights = () => {
    setSt(s => ({ ...s, weights: { ...s.weights, [nextWeek]: { ...D } } }));
    setDraft(null);
    boom({ count: 90, y: innerHeight * 0.55 });
  };

  const bump = (key, delta) => {
    setDraft({ ...D, [key]: Math.max(0, D[key] + delta) });
    setTickKey(k => k + 1);
  };

  const sundayMsg =
`Week ${wk} — ${myStats.total}/700 🔥
Average: ${myStats.avg}/100
Best day: ${myStats.best}/100
Workout: ${myStats.workout}/7
Learning: ${myStats.learning}/7
Sleep: ${myStats.sleep}/7
Streak: ${myStats.streak} days

Week ${nextWeek}. Beat it. 😎`;

  const copyMsg = async () => {
    try {
      await navigator.clipboard.writeText(sundayMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) { /* fallback: textarea stays selectable */ }
  };

  const maxBar = 100;
  const showTip = (i, ev) => {
    const zone = chartRef.current; if (!zone) return;
    const zr = zone.getBoundingClientRect();
    const cr = ev.currentTarget.getBoundingClientRect();
    setTip({ i, x: cr.left + cr.width / 2 - zr.left, y: cr.top - zr.top + 6 });
  };

  const gapColor = A.total === B.total ? 'var(--ink)' : A.total > B.total ? 'var(--pa)' : 'var(--pb)';

  return (
    <div className="view">
      <div className="datestrip rise">
        <button className="arrow" onClick={() => { setWk(w => Math.max(1, w - 1)); setDraft(null); }} disabled={wk <= 1} aria-label="Previous week">‹</button>
        <button className="arrow" onClick={() => { setWk(w => Math.min(5, w + 1)); setDraft(null); }} disabled={wk >= 5} aria-label="Next week">›</button>
        <div className="dt">Week {wk}<small>{pretty(dates[0])} — {pretty(dates[6])}</small></div>
        <div className="strip-score">
          <div>
            <span className="eyebrow">Weekly gap</span>
            <div>
              <span className="week-gap-big num" style={{ color: gapColor }}>
                {A.total === B.total ? 0 : Math.abs(A.total - B.total)}
              </span>
              <span className="num" style={{ color: 'var(--ink-dim)' }}> pts</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid2">
        <Scoreboard name={st.names.a} s={A} tone="#FF7A4D" delay={60} />
        <Scoreboard name={st.names.b} s={B} tone="#4FC3E8" delay={120} />
      </div>

      <Card title="Day by day" note="Hover a day for the exact scores" delay={180}>
        <div className="legend">
          <span className="li"><span className="dot" style={{ background: 'var(--pa-mark)' }} />{st.names.a}</span>
          <span className="li"><span className="dot" style={{ background: 'var(--pb-mark)' }} />{st.names.b}</span>
          <span className="li"><span className="dot" style={{ background: 'rgba(148,178,255,.15)' }} />not logged</span>
        </div>
        <div className="chart-zone" ref={chartRef} onMouseLeave={() => setTip(null)}>
          <div className="chart">
            {dates.map((k, i) => {
              const a = score(st.entries.a[k], W).total;
              const b = score(st.entries.b[k], W).total;
              return (
                <div className="daycol" key={k}
                     onMouseEnter={ev => showTip(i, ev)}
                     onMouseMove={ev => showTip(i, ev)}>
                  <div className="pair">
                    <div className={`bar ${st.entries.a[k] ? 'a' : 'ghost'}`}
                         style={{ height: Math.max(2, a / maxBar * 100) + '%', '--d': (i * 60) + 'ms' }} />
                    <div className={`bar ${st.entries.b[k] ? 'b' : 'ghost'}`}
                         style={{ height: Math.max(2, b / maxBar * 100) + '%', '--d': (i * 60 + 30) + 'ms' }} />
                  </div>
                </div>
              );
            })}
          </div>
          {tip && (() => {
            const k = dates[tip.i];
            const a = score(st.entries.a[k], W).total;
            const b = score(st.entries.b[k], W).total;
            return (
              <div className="tip" style={{ left: tip.x, top: tip.y }}>
                <div className="th">{pretty(k)}</div>
                <div className="tr"><span className="dot" style={{ background: 'var(--pa-mark)' }} />{st.names.a}<b>{st.entries.a[k] ? a : '—'}</b></div>
                <div className="tr"><span className="dot" style={{ background: 'var(--pb-mark)' }} />{st.names.b}<b>{st.entries.b[k] ? b : '—'}</b></div>
              </div>
            );
          })()}
        </div>
        <div className="xaxis">
          {dates.map(k => (
            <span key={k} className={`xlab${k === TODAY ? ' now' : ''}`}>
              {DOW[fromKey(k).getDay()]}<span className="xd">{fromKey(k).getDate()}</span>
            </span>
          ))}
        </div>
      </Card>

      <Card title="Sunday rebalance" delay={240} note={<span>Reweight week {nextWeek}<br />Total must stay at 100</span>}>
        <p className="rebalance-intro">
          Your weakest area in week {wk} was{' '}
          <b className="rebalance-weak">{weakest.label}</b> at {Math.round(weakest.pct * 100)}% of its points.
          Make it worth more next week and the game pushes you straight at it.
        </p>
        {CATS.map(c => {
          const pct    = myStats.logged ? myStats.catTotals[c.key] / (W[c.key] * myStats.logged) : 0;
          const isWeak = c.key === weakest.key;
          return (
            <div className="wt-row" key={c.key}>
              <div className="wt-name">{c.icon} {c.label}</div>
              <div>
                <div className="meter">
                  <i className={isWeak ? 'weak' : pct >= .8 ? 'strong' : ''} style={{ width: Math.round(pct * 100) + '%' }} />
                </div>
                <div className="meter-cap">week {wk}: {Math.round(pct * 100)}% earned</div>
              </div>
              <div className="stepper">
                <button className="step" onClick={() => bump(c.key, -5)} disabled={D[c.key] <= 0} aria-label={`Lower ${c.label}`}>−</button>
                <span className="n tick" key={c.key + '-' + D[c.key] + '-' + tickKey}>{D[c.key]}</span>
                <button className="step" onClick={() => bump(c.key, +5)} aria-label={`Raise ${c.label}`}>+</button>
              </div>
            </div>
          );
        })}
        <div className="budget">
          <span className="eyebrow">Allocated</span>
          <span className={`num budget-allocated${spent === 100 ? ' a-gold' : ''}`}
                style={{ color: spent === 100 ? 'var(--gold)' : 'var(--bad)', textShadow: spent === 100 ? '0 0 12px rgba(245,196,69,.45)' : 'none' }}>
            {spent}
          </span>
          <span className="num budget-denom">/100</span>
          <div className="budget-actions">
            <button className="btn" onClick={suggest}>Suggest a split</button>
            <button className="btn" onClick={() => { setDraft({ ...BASE_W }); setTickKey(k => k + 1); }}>Reset to default</button>
            <button className="btn gold" onClick={applyWeights} disabled={spent !== 100}>Apply to week {nextWeek}</button>
          </div>
        </div>
      </Card>

      <Card title="Sunday message" note="Send it. Talk your talk." delay={300}>
        <textarea className="txt" rows="7" readOnly value={sundayMsg} />
        <div className="sunday-copy-row">
          <button className="btn gold" onClick={copyMsg}>{copied ? 'Copied ✓' : 'Copy message'}</button>
        </div>
      </Card>
    </div>
  );
}
