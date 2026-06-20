import { useGameStore } from '../../store/gameStore';
import { Button } from '../ui/Button';
import { CATS, CAT_TYPES } from '../../data/cats';

/** Title screen: logo, mascot, and the main menu (campaign + modes). */
export function HomeScreen() {
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const goAchievements = useGameStore((s) => s.goAchievements);
  const startDaily = useGameStore((s) => s.startDaily);
  const startBlitz = useGameStore((s) => s.startBlitz);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const savedGameExists = useGameStore((s) => s.savedGameExists);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);

  return (
    <div className="screen">
      <div className="logo">
        <span className="logo__cat" role="img" aria-label="gato mascote">
          🐱
        </span>
        <h1 className="logo__title">
          <span>Cat</span>
          <span>Match</span>
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
          onClick={goLevelSelect}
        >
          🐾 Jogar (Fases)
        </Button>
        <div className="row">
          <Button variant="pink" block onClick={startDaily}>
            📅 Diário
          </Button>
          <Button variant="purple" block onClick={startBlitz}>
            ⚡ Relâmpago
          </Button>
        </div>
        <div className="row">
          <Button variant="blue" block onClick={goLeaderboard}>
            🏆 Ranking
          </Button>
          <Button variant="ghost" block onClick={goAchievements}>
            🏅 Conquistas
          </Button>
        </div>
        <Button variant="ghost" block small onClick={toggleSound}>
          {soundEnabled ? '🔊 Som ligado' : '🔇 Som desligado'}
        </Button>
      </div>
    </div>
  );
}
