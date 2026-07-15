import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Modal } from './Modal';
import { Confetti } from './Confetti';
import { Button } from './Button';
import { buildDailyShare, shareText } from '../../services/share';
import { getDayId } from '../../services/periods';
import { useT, nf } from '../../i18n';

/** End screen for Daily Challenge, Blitz and Adventure runs. */
export function ResultsModal() {
  const t = useT();
  const mode = useGameStore((s) => s.mode);
  const score = useGameStore((s) => s.score);
  const advDepth = useGameStore((s) => s.advDepth);
  const advTotalScore = useGameStore((s) => s.advTotalScore);
  const isRecord = useGameStore((s) => s.lastIsRecord);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const goHome = useGameStore((s) => s.goHome);

  const [shareLabel, setShareLabel] = useState<string | null>(null);

  const isDaily = mode === 'daily';
  const isAdventure = mode === 'adventure';
  const shownScore = isAdventure ? advTotalScore : score;

  const icon = isDaily ? '📅' : isAdventure ? '🗺️' : '⚡';
  const title = isDaily
    ? t('results.dailyTitle')
    : isAdventure
      ? t('results.adventureTitle')
      : t('results.blitzTitle');
  const subtitle = isDaily
    ? t('results.dailySubtitle')
    : isAdventure
      ? t('results.adventureSubtitle', { n: advDepth })
      : t('results.blitzSubtitle');

  async function onShare() {
    const { text } = buildDailyShare(getDayId(), score);
    const result = await shareText(text);
    setShareLabel(
      result === 'copied'
        ? t('results.copied')
        : result === 'shared'
          ? t('results.shared')
          : t('results.shareFailed'),
    );
    setTimeout(() => setShareLabel(null), 2000);
  }

  return (
    <Modal variant="win">
      <Confetti />
      <span className="modal__cat" aria-hidden>
        {icon}
      </span>
      <h2 className="modal__title">{title}</h2>
      {isAdventure && (
        <div
          className="record-badge"
          style={{ background: 'var(--purple)', color: '#fff' }}
        >
          {t('results.floorBadge', { n: advDepth })}
        </div>
      )}
      <div className="modal__score">
        {t('results.points', { score: nf(shownScore) })}
      </div>
      {isRecord && shownScore > 0 && (
        <div className="record-badge">{t('results.yourBest')}</div>
      )}
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
        {subtitle}
      </p>

      <div className="stack">
        {isDaily && (
          <Button variant="pink" block onClick={onShare}>
            {shareLabel ?? t('results.share')}
          </Button>
        )}
        <Button variant="green" block onClick={goLeaderboard}>
          {t('results.viewRanking')}
        </Button>
        <div className="row">
          <Button variant="ghost" small block onClick={restartLevel}>
            {t('results.playAgain')}
          </Button>
          <Button variant="ghost" small block onClick={goHome}>
            {t('results.home')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
