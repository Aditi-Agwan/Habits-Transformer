import { CATS, TIERS } from '../../lib/constants.js';
import { emptyEntry, score } from '../../lib/scoring.js';
import Check from '../Check/Check.jsx';
import Slide from '../Slide/Slide.jsx';
import './LogForm.css';

function CatBlock({ c, s, weights, children }) {
  const w    = weights[c.key] ?? c.base;
  const got  = s.weighted[c.key];
  const full = got >= w && w > 0;
  const pct  = w > 0 ? Math.round(got / w * 100) : 0;

  return (
    <div className={`cat${full ? ' maxed' : ''}`}>
      <div className="cat-top">
        <span className="cat-ico" aria-hidden="true">{c.icon}</span>
        <span className="cat-name">{c.label}</span>
        {w !== c.base && (
          <span className="wt-flag">{w > c.base ? '▲' : '▼'} {w}</span>
        )}
        <span className={`cat-pts${full ? ' full' : ''}`}><b>{got}</b>/{w}</span>
      </div>
      {children}
      <div className="cat-meter" aria-hidden="true">
        <i style={{ width: pct + '%', '--tone': c.tone }} />
      </div>
    </div>
  );
}

export default function LogForm({ entry, weights, tone, onChange }) {
  const e   = entry || emptyEntry();
  const s   = score(entry, weights);
  const set = (cat, patch) => onChange({ ...e, [cat]: { ...e[cat], ...patch } });

  return (
    <div>
      <CatBlock c={CATS[0]} s={s} weights={weights}>
        <Check label="Woke up around my target time"    pts="7" on={e.wakeup.onTime}   set={v => set('wakeup', { onTime: v })} />
        <Check label="Got out of bed without snoozing"  pts="2" on={e.wakeup.noSnooze} set={v => set('wakeup', { noSnooze: v })} />
        <Check label="Didn't reach for the phone first" pts="1" on={e.wakeup.noScroll} set={v => set('wakeup', { noScroll: v })} />
      </CatBlock>

      <CatBlock c={CATS[1]} s={s} weights={weights}>
        <div className="tiers">
          {TIERS.map(t => (
            <button
              key={t.v}
              className={`tier${e.workout.tier === t.v ? ' on' : ''}`}
              onClick={() => set('workout', { tier: t.v })}
            >
              {t.t}<b>{t.v ? `+${t.v}` : '0'}</b>
            </button>
          ))}
        </div>
        <Check label="Pushed harder than usual" pts="3" on={e.workout.extra} set={v => set('workout', { extra: v })} />
        <input
          className="txt"
          style={{ marginTop: 8 }}
          placeholder="What did you do? (run, gym, badminton…)"
          value={e.workout.activity || ''}
          onChange={ev => set('workout', { activity: ev.target.value })}
        />
      </CatBlock>

      <CatBlock c={CATS[2]} s={s} weights={weights}>
        <Slide label="Focus"           max={10} val={e.work.focus}      set={v => set('work', { focus: v })}      tone={tone} />
        <Slide label="Work discipline" max={5}  val={e.work.discipline} set={v => set('work', { discipline: v })} tone={tone} />
        <Slide label="Learning"        max={10} val={e.work.learning}   set={v => set('work', { learning: v })}   tone={tone} />
      </CatBlock>

      <CatBlock c={CATS[3]} s={s} weights={weights}>
        <Slide label="Reading"           max={5} val={e.personal.reading} set={v => set('personal', { reading: v })} tone={tone} />
        <Slide label="Phone discipline"  max={5} val={e.personal.phone}   set={v => set('personal', { phone: v })}   tone={tone} />
        <Slide label="Water"             max={5} val={e.personal.water}   set={v => set('personal', { water: v })}   tone={tone} />
        <Slide label="Food"              max={5} val={e.personal.food}    set={v => set('personal', { food: v })}    tone={tone} />
        <Slide label="Hobby / meditation" max={5} val={e.personal.hobby}  set={v => set('personal', { hobby: v })}  tone={tone} />
      </CatBlock>

      <CatBlock c={CATS[4]} s={s} weights={weights}>
        <Check label="Got into bed around my target time" pts="7" on={e.sleep.bed}       set={v => set('sleep', { bed: v })} />
        <Check label="Slept enough hours"                 pts="5" on={e.sleep.enough}    set={v => set('sleep', { enough: v })} />
        <Check label="Phone away before bed"              pts="2" on={e.sleep.phoneAway} set={v => set('sleep', { phoneAway: v })} />
        <Check label="Set tomorrow up before sleeping"    pts="1" on={e.sleep.prep}      set={v => set('sleep', { prep: v })} />
      </CatBlock>

      <div className="cat">
        <span className="eyebrow note-label">Note to self</span>
        <input
          className="txt"
          placeholder="One honest line about today"
          value={e.note || ''}
          onChange={ev => onChange({ ...e, note: ev.target.value })}
        />
      </div>
    </div>
  );
}
