import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from './Button';
import { useT } from '../../i18n';

interface Slide {
  icon: string;
  titleKey: string;
  textKey: string;
}

const SLIDES: Slide[] = [
  { icon: '🐱', titleKey: 'tut.1.title', textKey: 'tut.1.text' },
  { icon: '👆', titleKey: 'tut.2.title', textKey: 'tut.2.text' },
  { icon: '✨', titleKey: 'tut.3.title', textKey: 'tut.3.text' },
  { icon: '😺', titleKey: 'tut.4.title', textKey: 'tut.4.text' },
  { icon: '🧶', titleKey: 'tut.5.title', textKey: 'tut.5.text' },
  { icon: '👑', titleKey: 'tut.6.title', textKey: 'tut.6.text' },
  { icon: '📦', titleKey: 'tut.7.title', textKey: 'tut.7.text' },
  { icon: '⏱️', titleKey: 'tut.8.title', textKey: 'tut.8.text' },
  { icon: '🗺️', titleKey: 'tut.9.title', textKey: 'tut.9.text' },
];

/** First-run (and re-openable) step-by-step tutorial. */
export function TutorialOverlay() {
  const t = useT();
  const closeTutorial = useGameStore((s) => s.closeTutorial);
  const [i, setI] = useState(0);

  const slide = SLIDES[i];
  const isLast = i === SLIDES.length - 1;

  return (
    <div className="modal-overlay">
      <div className="modal modal--tutorial">
        <div className="tutorial__icon" aria-hidden>
          {slide.icon}
        </div>
        <h2 className="modal__title">{t(slide.titleKey)}</h2>
        <p className="tutorial__text">{t(slide.textKey)}</p>

        <div className="tutorial__dots">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === i ? 'on' : ''}`}
              onClick={() => setI(idx)}
            />
          ))}
        </div>

        <div className="row" style={{ marginTop: 6 }}>
          {i > 0 ? (
            <Button variant="ghost" small block onClick={() => setI(i - 1)}>
              {t('tut.prev')}
            </Button>
          ) : (
            <Button variant="ghost" small block onClick={closeTutorial}>
              {t('tut.skip')}
            </Button>
          )}
          {isLast ? (
            <Button variant="green" small block onClick={closeTutorial}>
              {t('tut.start')}
            </Button>
          ) : (
            <Button variant="green" small block onClick={() => setI(i + 1)}>
              {t('tut.next')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
