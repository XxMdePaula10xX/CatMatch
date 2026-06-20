import { useGameStore } from '../../store/gameStore';
import { Modal } from './Modal';
import { Confetti } from './Confetti';
import { Button } from './Button';

/** End screen for Daily Challenge and Blitz runs. */
export function ResultsModal() {
  const mode = useGameStore((s) => s.mode);
  const score = useGameStore((s) => s.score);
  const isRecord = useGameStore((s) => s.lastIsRecord);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const goHome = useGameStore((s) => s.goHome);

  const isDaily = mode === 'daily';

  return (
    <Modal variant="win">
      <Confetti />
      <span className="modal__cat" aria-hidden>
        {isDaily ? '📅' : '⚡'}
      </span>
      <h2 className="modal__title">
        {isDaily ? 'Desafio Diário!' : 'Tempo Esgotado!'}
      </h2>
      <div className="modal__score">{score.toLocaleString('pt-BR')} pontos</div>
      {isRecord && score > 0 && (
        <div className="record-badge">🎉 Seu melhor!</div>
      )}
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
        {isDaily
          ? 'Volte amanhã para um novo desafio 🐱'
          : 'Pontuação enviada ao ranking semanal 🏆'}
      </p>

      <div className="stack">
        <Button variant="green" block onClick={goLeaderboard}>
          🏆 Ver Ranking
        </Button>
        <div className="row">
          <Button variant="ghost" small block onClick={restartLevel}>
            🔁 Jogar de novo
          </Button>
          <Button variant="ghost" small block onClick={goHome}>
            🏠 Início
          </Button>
        </div>
      </div>
    </Modal>
  );
}
