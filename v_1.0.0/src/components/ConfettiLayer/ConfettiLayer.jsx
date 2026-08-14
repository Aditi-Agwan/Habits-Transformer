import { useRef, useEffect } from 'react';
import './ConfettiLayer.css';

const COLORS = ['#EF5B2A', '#FF7A4D', '#F5C445', '#22A0CC', '#4FC3E8', '#EAF2FF'];

export default function ConfettiLayer() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let parts = [], raf = null;

    const resize = () => { cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; };
    resize();
    addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.vy += 0.16 * DPR;
        p.vx *= 0.992; p.vy *= 0.992;
        p.x += p.vx; p.y += p.vy;
        p.rot += p.vr; p.life -= 1;
        const fade = Math.min(1, p.life / 28);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.sin(p.life * p.wob));
        ctx.fillStyle = p.c;
        if (p.shape === 0) ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.62);
        else { ctx.beginPath(); ctx.arc(0, 0, p.s * 0.34, 0, 7); ctx.fill(); }
        ctx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(tick);
      else raf = null;
    };

    const fire = e => {
      const d = e.detail || {};
      const n  = d.count || 120;
      const cx = (d.x  != null ? d.x  : innerWidth  / 2) * DPR;
      const cy = (d.y  != null ? d.y  : innerHeight * 0.35) * DPR;
      for (let i = 0; i < n; i++) {
        const ang = (d.angle != null ? d.angle : -Math.PI / 2) + (Math.random() - .5) * (d.spread || 2.2);
        const pow = (5 + Math.random() * 9) * DPR * (d.power || 1);
        parts.push({
          x: cx, y: cy,
          vx: Math.cos(ang) * pow, vy: Math.sin(ang) * pow,
          s: (5 + Math.random() * 6) * DPR,
          c: (d.colors || COLORS)[i % (d.colors || COLORS).length],
          rot: Math.random() * 6.3, vr: (Math.random() - .5) * .3,
          wob: .08 + Math.random() * .12,
          life: 110 + Math.random() * 70,
          shape: Math.random() < .8 ? 0 : 1,
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    addEventListener('p100:boom', fire);
    return () => {
      removeEventListener('p100:boom', fire);
      removeEventListener('resize', resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="fx" aria-hidden="true" />;
}
