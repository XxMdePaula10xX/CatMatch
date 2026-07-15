import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CATS, CAT_TYPES, CAT_IMAGE } from '../../data/cats';
import { useT, useLang, setLang, tr } from '../../i18n';

/** Soft pastel tint of a cat color for the gallery card background. */
function tint(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * 0.72);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r},${g},${b})`;
}

/** Title screen: logo, mascot, and a streamlined main menu. */
export function HomeScreen() {
  const t = useT();
  const lang = useLang();
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const goAchievements = useGameStore((s) => s.goAchievements);
  const startDaily = useGameStore((s) => s.startDaily);
  const startBlitz = useGameStore((s) => s.startBlitz);
  const startAdventure = useGameStore((s) => s.startAdventure);
  const openTutorial = useGameStore((s) => s.openTutorial);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const savedGameExists = useGameStore((s) => s.savedGameExists);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  const [showPlay, setShowPlay] = useState(false);

  // Pick a mode from the popup, closing it first.
  const pick = (fn: () => void) => () => {
    setShowPlay(false);
    fn();
  };

  return (
    <div className="screen">
      <div className="lang-switch" role="group" aria-label={t('home.language')}>
        <button
          className={`lang-switch__btn ${lang === 'pt' ? 'on' : ''}`}
          onClick={() => setLang('pt')}
          aria-pressed={lang === 'pt'}
        >
          🇧🇷 PT
        </button>
        <button
          className={`lang-switch__btn ${lang === 'en' ? 'on' : ''}`}
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
        >
          🇺🇸 EN
        </button>
      </div>

      <div className="logo">
        <img
          className="logo__cat"
          src="/cats/mascot.svg"
          alt="Cat Match 3"
          draggable={false}
        />
        <h1 className="logo__title">
          <span>Cat</span>
          <span>Match 3</span>
        </h1>
        <div className="logo__sub">{t('home.tagline')}</div>
      </div>

      <div className="panel center">
        <div className="gallery">
          {CAT_TYPES.map((c) => (
            <div
              key={c}
              className="gallery__item"
              style={{
                background: `linear-gradient(160deg, ${tint(CATS[c].color)}, #fffdf8)`,
                borderColor: CATS[c].color,
              }}
              title={`${tr(CATS[c].name)} — ${tr(CATS[c].personality)}`}
            >
              <img
                className="gallery__img"
                src={CAT_IMAGE[c]}
                alt={tr(CATS[c].name)}
                draggable={false}
              />
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          {t('home.blurb')}
        </p>
      </div>

      <div className="stack">
        {savedGameExists && (
          <Button variant="green" block onClick={resumeGame}>
            {t('home.continue')}
          </Button>
        )}
        <Button
          variant={savedGameExists ? 'blue' : 'green'}
          block
          onClick={() => setShowPlay(true)}
        >
          {t('home.play')}
        </Button>
        <div className="row">
          <Button variant="blue" block onClick={goLeaderboard}>
            {t('home.ranking')}
          </Button>
          <Button variant="purple" block onClick={goAchievements}>
            {t('home.achievements')}
          </Button>
        </div>
        <div className="row">
          <Button variant="ghost" block small onClick={openTutorial}>
            {t('home.howToPlay')}
          </Button>
          <Button variant="ghost" block small onClick={toggleSound}>
            {soundEnabled ? '🔊' : '🔇'} {t('home.sound')}
          </Button>
        </div>
      </div>

      {showPlay && (
        <Modal>
          <button
            className="modal__close"
            aria-label={t('common.close')}
            onClick={() => setShowPlay(false)}
          >
            ✕
          </button>
          <h2 className="modal__title">{t('home.chooseMode')}</h2>
          <div className="stack" style={{ marginTop: 8 }}>
            <Button variant="green" block onClick={pick(goLevelSelect)}>
              {t('home.modeLevels')}
            </Button>
            <p className="mode-desc">{t('home.modeLevelsDesc')}</p>

            <Button variant="purple" block onClick={pick(startAdventure)}>
              {t('home.modeAdventure')}
            </Button>
            <p className="mode-desc">{t('home.modeAdventureDesc')}</p>

            <Button variant="blue" block onClick={pick(startBlitz)}>
              {t('home.modeBlitz')}
            </Button>
            <p className="mode-desc">{t('home.modeBlitzDesc')}</p>

            <Button variant="pink" block onClick={pick(startDaily)}>
              {t('home.modeDaily')}
            </Button>
            <p className="mode-desc">{t('home.modeDailyDesc')}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
