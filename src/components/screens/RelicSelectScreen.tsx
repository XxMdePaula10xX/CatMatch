import { useGameStore } from '../../store/gameStore';
import { getRelic } from '../../data/relics';
import { Button } from '../ui/Button';
import { useT, nf, tr } from '../../i18n';

/** Shown between Adventure floors: pick one of three relics to power up. */
export function RelicSelectScreen() {
  const t = useT();
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
          {t('relic.floorDone', { n: advDepth })}
        </div>
      </div>

      <div className="panel center">
        <div className="stat__label">{t('relic.totalScore')}</div>
        <div className="stat__value" style={{ color: 'var(--purple)' }}>
          {nf(advTotalScore)}
        </div>
      </div>

      <h2 className="section-title center" style={{ margin: 0 }}>
        {t('relic.choose')}
      </h2>
      <p className="muted center" style={{ margin: '2px 0 0', fontSize: 12 }}>
        {t('relic.stackHint')}
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
                  {tr(r.name)}
                  {have > 0 && <span className="relic-card__have"> ×{have}</span>}
                </strong>
                <span className="muted">{tr(r.description)}</span>
                {have > 0 && (
                  <span className="relic-card__stack">
                    {t('relic.haveStack', { n: have + 1 })}
                  </span>
                )}
              </div>
              <span className="relic-card__pick">{t('relic.pick')}</span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: 4, justifyContent: 'center' }}>
        <Button variant="ghost" small onClick={goHome}>
          {t('relic.endAdventure')}
        </Button>
      </div>

      {ownedUnique.length > 0 && (
        <div className="panel">
          <div className="stat__label" style={{ marginBottom: 6 }}>
            {t('relic.yours')}
          </div>
          <div className="chips">
            {ownedUnique.map(({ relic, count }) => (
              <span className="chip" key={relic!.id}>
                {relic!.icon} {tr(relic!.name)}
                {count > 1 && <strong> ×{count}</strong>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
