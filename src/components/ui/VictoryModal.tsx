import { useGameStore } from '../../store/gameStore';
import { computeStars } from '../../game/objectives';
import { getLevel } from '../../data/levels';
import { formatTime } from './TimerCounter';
import { Modal, Stars } from './Modal';
import { Confetti } from './Confetti';
import { Button } from './Button';
import { useT, nf } from '../../i18n';

/** Shown when the player clears the level objective. */
export function VictoryModal() {
  const t = useT();
  const score = useGameStore((s) => s.score);
  const movesLeft = useGameStore((s) => s.movesLeft);
  const totalMoves = useGameStore((s) => s.totalMoves);
  const elapsedMs = useGameStore((s) => s.elapsedMs);
  const levelId = useGameStore((s) => s.level?.id ?? 0);
  const highScore = useGameStore((s) => s.lastHighScore);
  const timeMult = useGameStore((s) => s.lastTimeMultiplier);
  const isRecord = useGameStore((s) => s.lastIsRecord);
  const nextLevel = useGameStore((s) => s.nextLevel);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const user = useGameStore((s) => s.user);
  const authAvailable = useGameStore((s) => s.authAvailable);

  const stars = computeStars(movesLeft, totalMoves);
  const hasNext = !!getLevel(levelId + 1);
  const promptLogin = authAvailable && !user;

  return (
    <Modal variant="win">
      <Confetti />
      <span className="modal__cat" aria-hidden>
        😸
      </span>
      <h2 className="modal__title">{t('victory.title')}</h2>
      <Stars count={stars} />

      <div className="score-breakdown">
        <div className="score-breakdown__row">
          <span>{t('victory.points')}</span>
          <span>{nf(score)}</span>
        </div>
        <div className="score-breakdown__row">
          <span>{t('victory.timeRow', { time: formatTime(elapsedMs) })}</span>
          <span>×{timeMult}</span>
        </div>
        <div className="score-breakdown__row total">
          <span>{t('victory.highScore')}</span>
          <span>{nf(highScore)}</span>
        </div>
      </div>
      {isRecord && <div className="record-badge">{t('victory.newRecord')}</div>}
      {promptLogin && (
        <p className="muted" style={{ fontSize: 13, margin: '4px 0 10px' }}>
          {t('victory.loginPrompt')}
        </p>
      )}

      <div className="stack">
        {hasNext ? (
          <Button variant="green" block onClick={nextLevel}>
            {t('victory.continue')}
          </Button>
        ) : (
          <Button variant="green" block onClick={goLevelSelect}>
            {t('victory.levelMap')}
          </Button>
        )}
        <div className="row">
          <Button variant="ghost" small block onClick={restartLevel}>
            {t('victory.repeat')}
          </Button>
          <Button variant="purple" small block onClick={goLeaderboard}>
            {promptLogin ? t('victory.rankingLogin') : t('victory.ranking')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
