import { useMemo } from 'react';
import './Sky.css';

export default function Sky() {
  const stars = useMemo(() =>
    Array.from({ length: 64 }, (_, i) => ({
      id: i,
      left:  Math.random() * 100,
      top:   Math.random() * 100,
      size:  Math.random() < .85 ? 1.5 : 2.5,
      tw:    (2.5 + Math.random() * 5).toFixed(1) + 's',
      maxo:  (.25 + Math.random() * .5).toFixed(2),
      delay: (Math.random() * 4).toFixed(1) + 's',
    })),
  []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="orb a" />
      <div className="orb b" />
      <div className="orb g" />
      {stars.map(s => (
        <span
          key={s.id}
          className="star"
          style={{
            left: s.left + '%',
            top:  s.top  + '%',
            width:  s.size,
            height: s.size,
            '--tw':   s.tw,
            '--maxo': s.maxo,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
