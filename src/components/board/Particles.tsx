import { useGameStore } from '../../store/gameStore';

const SPOKES = 6;

/** Small particle bursts at cleared cells (rendered over the board). */
export function Particles({ rows, cols }: { rows: number; cols: number }) {
  const particles = useGameStore((s) => s.particles);
  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="burst"
          style={{
            left: `calc(${p.col + 0.5} * (100% / ${cols}))`,
            top: `calc(${p.row + 0.5} * (100% / ${rows}))`,
          }}
        >
          {Array.from({ length: SPOKES }).map((_, i) => (
            <span
              key={i}
              className="burst__dot"
              style={{ ['--a' as string]: `${(360 / SPOKES) * i}deg` }}
            />
          ))}
        </div>
      ))}
    </>
  );
}
