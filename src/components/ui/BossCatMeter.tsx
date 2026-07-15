import { useGameStore } from '../../store/gameStore';
import { BOSS_ENERGY } from '../../game/scoring';
import { useT } from '../../i18n';

const FACE: Record<string, string> = {
  sleeping: '😴',
  waking: '🙀',
  excited: '😸',
  power: '😼',
  backToSleep: '😻',
};

/** The Boss Cat energy meter shown above the board. */
export function BossCatMeter() {
  const t = useT();
  const energy = useGameStore((s) => s.bossEnergy);
  const bossState = useGameStore((s) => s.bossState);
  const pct = Math.min(100, Math.round((energy / BOSS_ENERGY.full) * 100));
  const full = pct >= 100;

  return (
    <div className={`boss boss--${bossState}`}>
      <div className="boss__cat" aria-hidden>
        {FACE[bossState] ?? '😺'}
      </div>
      <div className="boss__body">
        <div className="boss__label">
          {t('boss.label')}{' '}
          {full && <span className="boss__full">{t('boss.ready')}</span>}
        </div>
        <div className="boss__bar">
          <div className="boss__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
