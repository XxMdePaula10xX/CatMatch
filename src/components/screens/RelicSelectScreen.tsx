import { useGameStore } from '../../store/gameStore';
import { getRelic } from '../../data/relics';
import { Button } from '../ui/Button';

/** Shown between Adventure floors: pick one of three relics to power up. */
export function RelicSelectScreen() {
  const advDepth = useGameStore((s) => s.advDepth);
  const advTotalScore = useGameStore((s) => s.advTotalScore);
  const relicChoices = useGameStore((s) => s.relicChoices);
  const ownedIds = useGameStore((s) => s.advRelics);
  const chooseRelic = useGameStore((s) => s.chooseRelic);
  const goHome = useGameStore((s) => s.goHome);

  // Count how many of each relic the player owns (relics stack).
  const counts = new Map<string, number>();
  for (const id of ownedIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const ownedUnique = [...counts.keys()]
    .map((id) => ({ relic: getRelic(id), count: counts.get(id)! }))
    .filter((o) => o.relic);

  return (
    <div className="screen">
      <div className="logo" style={{ marginTop: 0 }}>
        <div className="logo__sub" style={{ background: 'var(--purple)' }}>
          🗺️ Andar {advDepth} concluído!
        </div>
      </div>

      <div className="panel center">
        <div className="stat__label">Pontuação total</div>
        <div className="stat__value" style={{ color: 'var(--purple)' }}>
          {advTotalScore.toLocaleString('pt-BR')}
        </div>
      </div>

      <h2 className="section-title center" style={{ margin: 0 }}>
        Escolha uma relíquia
      </h2>
      <p className="muted center" style={{ margin: '2px 0 0', fontSize: 12 }}>
        Relíquias repetidas se acumulam e ficam mais fortes! 🔁
      </p>

      <div className="stack">
        {relicChoices.map((id) => {
          const r = getRelic(id);
          if (!r) return null;
          const have = counts.get(id) ?? 0;
          return (
            <button
              key={id}
              className="relic-card"
              onClick={() => chooseRelic(id)}
            >
              <div className="relic-card__icon">{r.icon}</div>
              <div className="relic-card__text">
                <strong>
                  {r.name}
                  {have > 0 && <span className="relic-card__have"> ×{have}</span>}
                </strong>
                <span className="muted">{r.description}</span>
                {have > 0 && (
                  <span className="relic-card__stack">
                    Você já tem — pegar deixa ×{have + 1}
                  </span>
                )}
              </div>
              <span className="relic-card__pick">Pegar →</span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: 4, justifyContent: 'center' }}>
        <Button variant="ghost" small onClick={goHome}>
          ← Encerrar aventura
        </Button>
      </div>

      {ownedUnique.length > 0 && (
        <div className="panel">
          <div className="stat__label" style={{ marginBottom: 6 }}>
            Suas relíquias
          </div>
          <div className="chips">
            {ownedUnique.map(({ relic, count }) => (
              <span className="chip" key={relic!.id}>
                {relic!.icon} {relic!.name}
                {count > 1 && <strong> ×{count}</strong>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
