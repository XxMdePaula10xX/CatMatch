import { useGameStore } from '../../store/gameStore';
import { ObjectiveCard } from './ObjectiveCard';
import { Modal } from './Modal';
import { Button } from './Button';

/** Shown when the player runs out of moves without finishing the objective. */
export function DefeatModal() {
  const objectives = useGameStore((s) => s.objectives);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLevelSelect = useGameStore((s) => s.goLevelSelect);

  const remaining = objectives.filter(
    (o) => (o.current ?? 0) < o.target,
  );

  return (
    <Modal variant="lose">
      <span className="modal__cat" aria-hidden>
        🙀
      </span>
      <h2 className="modal__title">Sem movimentos!</h2>
      <p className="muted">Faltou pouco para cuidar de todos os gatinhos…</p>
      <div className="stack" style={{ margin: '12px 0' }}>
        {remaining.map((o, i) => (
          <ObjectiveCard key={`${o.type}-${o.catType ?? ''}-${i}`} objective={o} />
        ))}
      </div>
      <div className="stack">
        <Button variant="green" block onClick={restartLevel}>
          🔁 Tentar novamente
        </Button>
        <Button variant="ghost" block small onClick={goLevelSelect}>
          🏠 Voltar
        </Button>
      </div>
    </Modal>
  );
}
