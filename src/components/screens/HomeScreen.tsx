import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CATS, CAT_TYPES } from '../../data/cats';

/** Title screen: logo, mascot, and a streamlined main menu. */
export function HomeScreen() {
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
      <div className="logo">
        <span className="logo__cat" role="img" aria-label="gato mascote">
          🐱
        </span>
        <h1 className="logo__title">
          <span>Cat</span>
          <span>Match 3</span>
        </h1>
        <div className="logo__sub">Match-3 de Gatinhos</div>
      </div>

      <div className="panel center">
        <div className="gallery">
          {CAT_TYPES.map((c) => (
            <div
              key={c}
              className="gallery__item"
              style={{ background: CATS[c].color }}
              title={`${CATS[c].name} — ${CATS[c].personality}`}
            >
              {CATS[c].emoji}
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          Cuide de uma casa cheia de gatinhos bagunceiros!
        </p>
      </div>

      <div className="stack">
        {savedGameExists && (
          <Button variant="green" block onClick={resumeGame}>
            ▶ Continuar
          </Button>
        )}
        <Button
          variant={savedGameExists ? 'blue' : 'green'}
          block
          onClick={() => setShowPlay(true)}
        >
          🐾 Jogar
        </Button>
        <div className="row">
          <Button variant="blue" block onClick={goLeaderboard}>
            🏆 Ranking
          </Button>
          <Button variant="purple" block onClick={goAchievements}>
            🏅 Conquistas
          </Button>
        </div>
        <div className="row">
          <Button variant="ghost" block small onClick={openTutorial}>
            ❓ Como Jogar
          </Button>
          <Button variant="ghost" block small onClick={toggleSound}>
            {soundEnabled ? '🔊 Som' : '🔇 Som'}
          </Button>
        </div>
      </div>

      {showPlay && (
        <Modal>
          <button
            className="modal__close"
            aria-label="Fechar"
            onClick={() => setShowPlay(false)}
          >
            ✕
          </button>
          <h2 className="modal__title">Escolha um modo</h2>
          <div className="stack" style={{ marginTop: 8 }}>
            <Button variant="green" block onClick={pick(goLevelSelect)}>
              🐾 Fases
            </Button>
            <p className="mode-desc">Campanha com objetivos por fase.</p>

            <Button variant="purple" block onClick={pick(startAdventure)}>
              🗺️ Aventura (Roguelite)
            </Button>
            <p className="mode-desc">Suba andares com relíquias e chefes.</p>

            <Button variant="blue" block onClick={pick(startBlitz)}>
              ⚡ Relâmpago
            </Button>
            <p className="mode-desc">Máximo de pontos contra o relógio.</p>

            <Button variant="pink" block onClick={pick(startDaily)}>
              📅 Diário
            </Button>
            <p className="mode-desc">Um desafio novo todo dia.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
