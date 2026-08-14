import { Num } from '../Ring/Ring.jsx';
import './VersusHero.css';

export default function VersusHero({ names, sA, sB, subtitle }) {
  const total  = sA.total + sB.total;
  const shareA = total > 0 ? sA.total / total * 100 : 50;
  const lead   = sA.total === sB.total ? null : (sA.total > sB.total ? 'a' : 'b');

  return (
    <div className="versus rise" style={{ '--d': '40ms' }}>
      <div className="versus-row">
        <div className="vs-side l">
          <span className="vs-name a-tx">
            {lead === 'a' && <span className="vs-crown" aria-label="leading">👑 </span>}
            {names.a}
          </span>
          <span className="vs-score">
            <Num v={sA.total} /><span className="of"> /100</span>
          </span>
        </div>

        <div className="vs-badge" aria-hidden="true">VS</div>

        <div className="vs-side r">
          <span className="vs-name b-tx">
            {names.b}
            {lead === 'b' && <span className="vs-crown" aria-label="leading"> 👑</span>}
          </span>
          <span className="vs-score">
            <Num v={sB.total} /><span className="of"> /100</span>
          </span>
        </div>
      </div>

      <div className="tug" aria-hidden="true">
        <div className="tug-bar">
          <div className="tug-a" style={{ width: shareA + '%' }} />
          <div className="tug-gap" />
          <div className="tug-b" style={{ width: (100 - shareA) + '%' }} />
          <div className="tug-notch" />
        </div>
      </div>

      <div className="vs-verdict">
        {subtitle || (lead === null
          ? 'Dead level — next point takes it'
          : <span><b>{names[lead]}</b> ahead by {Math.abs(sA.total - sB.total)}</span>)}
      </div>
    </div>
  );
}
