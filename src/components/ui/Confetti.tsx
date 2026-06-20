const COLORS = ['#FFD447', '#FF6FAE', '#42A5F5', '#7ED957', '#8E5AD7'];
const PIECES = 36;

/** Pure-CSS confetti shower, shown over victory/results modals. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: PIECES }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.6 + Math.random() * 1.2;
        const color = COLORS[i % COLORS.length];
        const size = 6 + Math.random() * 6;
        return (
          <span
            key={i}
            className="confetti__piece"
            style={{
              left: `${left}%`,
              background: color,
              width: size,
              height: size * 1.4,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
