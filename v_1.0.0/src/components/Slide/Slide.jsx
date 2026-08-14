import './Slide.css';

export default function Slide({ label, max, val, set, tone }) {
  const pct = Math.round(((val || 0) / max) * 100);
  return (
    <div className="slider-row">
      <label htmlFor={`s-${label}`}>{label}</label>
      <input
        id={`s-${label}`}
        className={tone}
        type="range"
        min="0"
        max={max}
        value={val || 0}
        style={{ '--pct': pct + '%' }}
        onChange={e => set(+e.target.value)}
        aria-label={label}
      />
      <span className="v">{val || 0}<span className="om">/{max}</span></span>
    </div>
  );
}
