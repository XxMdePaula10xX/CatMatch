import { useMemo } from 'react';

const COLORS = ['#FFD447', '#FF6FAE', '#42A5F5', '#7ED957', '#8E5AD7'];
const PIECES = 36;

/** Pure-CSS confetti shower, shown over victory/results modals. Pieces are
 *  generated once (memoised) so re-renders don't restart the animation. */
export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.2,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    [],
  );

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti__piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size * 1.4,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
