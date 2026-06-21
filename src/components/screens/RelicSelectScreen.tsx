import { useGameStore } from '../../store/gameStore';
import { getRelic } from '../../data/relics';

/** Shown between Adventure floors: pick one of three relics to power up. */
export function RelicSelectScreen() {
  const advDepth = useGameStore((s) => s.advDepth);
  const advTotalScore = useGameStore((s) => s.advTotalScore);
  const relicChoices = useGameStore((s) => s.relicChoices);
  const ownedIds = useGameStore((s) => s.advRelics);
  const chooseRelic = useGameStore((s) => s.chooseRelic);

  const owned = ownedIds.map((id) => getRelic(id)).filter(Boolean);

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

      <div className="stack">
        {relicChoices.map((id) => {
          const r = getRelic(id);
          if (!r) return null;
          return (
            <button
              key={id}
              className="relic-card"
              onClick={() => chooseRelic(id)}
            >
              <div className="relic-card__icon">{r.icon}</div>
              <div className="relic-card__text">
                <strong>{r.name}</strong>
                <span className="muted">{r.description}</span>
              </div>
              <span className="relic-card__pick">Pegar →</span>
            </button>
          );
        })}
      </div>

      {owned.length > 0 && (
        <div className="panel">
          <div className="stat__label" style={{ marginBottom: 6 }}>
            Suas relíquias
          </div>
          <div className="chips">
            {owned.map((r, i) => (
              <span className="chip" key={`${r!.id}-${i}`}>
                {r!.icon} {r!.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
