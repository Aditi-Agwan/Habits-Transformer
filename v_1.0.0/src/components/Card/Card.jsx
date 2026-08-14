import { useRef } from 'react';
import './Card.css';

export default function Card({ title, note, children, delay }) {
  const ref = useRef(null);

  const onMove = e => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top)  + 'px');
  };

  return (
    <section
      ref={ref}
      className="card rise"
      style={{ '--d': (delay || 0) + 'ms' }}
      onPointerMove={onMove}
    >
      {(title || note) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {note  && <div className="card-note">{note}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
