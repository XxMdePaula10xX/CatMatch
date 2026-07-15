import { useState } from 'react';
import { CATS, CAT_TYPES, SPECIAL_CATS, SPECIAL_CREATE } from '../../data/cats';
import { OBSTACLES, OBSTACLE_IMAGE } from '../../data/obstacles';
import { CatTile } from '../board/CatTile';
import { Button } from './Button';
import type { SpecialCatType, ObstacleType } from '../../game/types';
import { useT, tr } from '../../i18n';

const SPECIAL_ORDER: SpecialCatType[] = [
  'ninjaH',
  'sleepy',
  'magician',
  'angry',
  'lucky',
];

/** Obstacle art with an emoji fallback, for the guide list. */
function ObstacleGuideIcon({ type }: { type: ObstacleType }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{OBSTACLES[type].emoji}</>;
  return (
    <img
      className="guide__img"
      src={OBSTACLE_IMAGE[type]}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

interface HelpModalProps {
  onClose: () => void;
}

/** Explains every cat personality power, special cat, and obstacle. */
export function HelpModal({ onClose }: HelpModalProps) {
  const t = useT();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal--guide"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal__title">{t('help.title')}</h2>
        <div className="guide">
          <h3 className="section-title">{t('help.basicCats')}</h3>
          {CAT_TYPES.map((c) => (
            <div className="guide__row" key={c}>
              <div className="guide__icon">
                <CatTile catType={c} />
              </div>
              <div className="guide__text">
                <strong>
                  {tr(CATS[c].name)} · {tr(CATS[c].personality)}
                </strong>
                <span>{tr(CATS[c].power)}</span>
              </div>
            </div>
          ))}

          <h3 className="section-title">{t('help.specialCats')}</h3>
          {SPECIAL_ORDER.map((s) => (
            <div className="guide__row" key={s}>
              <div className="guide__icon">
                <CatTile catType="black" specialType={s} />
              </div>
              <div className="guide__text">
                <strong>{tr(SPECIAL_CATS[s].name)}</strong>
                <span>{tr(SPECIAL_CATS[s].description)}</span>
                <em className="muted">
                  {t('help.howToCreate', { how: tr(SPECIAL_CREATE[s]) })}
                </em>
              </div>
            </div>
          ))}

          <h3 className="section-title">{t('help.obstacles')}</h3>
          {Object.values(OBSTACLES).map((o) => (
            <div className="guide__row" key={o.id}>
              <div className="guide__icon guide__icon--plain">
                <ObstacleGuideIcon type={o.id} />
              </div>
              <div className="guide__text">
                <strong>{tr(o.name)}</strong>
                <span>{tr(o.description)}</span>
              </div>
            </div>
          ))}

          <h3 className="section-title">{t('help.bossTitle')}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {t('help.bossBodyPre')}
            <strong>{t('help.bossMove')}</strong>
            {t('help.bossBodyPost')}
          </p>
        </div>
        <Button variant="green" block onClick={onClose}>
          {t('help.gotIt')}
        </Button>
      </div>
    </div>
  );
}
