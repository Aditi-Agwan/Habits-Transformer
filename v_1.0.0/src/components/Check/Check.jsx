import './Check.css';

function Tick() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="#241a02" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6.4 4.4 9.3 10.5 2.8" />
    </svg>
  );
}

export default function Check({ label, pts, on, set }) {
  return (
    <label className="check">
      <input type="checkbox" checked={!!on} onChange={e => set(e.target.checked)} />
      <span className="box">
        <Tick />
        <span className="burst" aria-hidden="true">
          <i /><i /><i /><i /><i /><i />
        </span>
      </span>
      <span>{label}</span>
      <span className="val">+{pts}</span>
    </label>
  );
}
