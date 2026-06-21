import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Modal } from './Modal';
import { Confetti } from './Confetti';
import { Button } from './Button';
import { buildDailyShare, shareText } from '../../services/share';
import { getDayId } from '../../services/periods';

/** End screen for Daily Challenge, Blitz and Adventure runs. */
export function ResultsModal() {
  const mode = useGameStore((s) => s.mode);
  const score = useGameStore((s) => s.score);
  const advDepth = useGameStore((s) => s.advDepth);
  const advTotalScore = useGameStore((s) => s.advTotalScore);
  const isRecord = useGameStore((s) => s.lastIsRecord);
  const restartLevel = useGameStore((s) => s.restartLevel);
  const goLeaderboard = useGameStore((s) => s.goLeaderboard);
  const goHome = useGameStore((s) => s.goHome);

  const [shareLabel, setShareLabel] = useState('📤 Compartilhar');

  const isDaily = mode === 'daily';
  const isAdventure = mode === 'adventure';
  const shownScore = isAdventure ? advTotalScore : score;

  const icon = isDaily ? '📅' : isAdventure ? '🗺️' : '⚡';
  const title = isDaily
    ? 'Desafio Diário!'
    : isAdventure
      ? 'Fim da Aventura!'
      : 'Tempo Esgotado!';
  const subtitle = isDaily
    ? 'Volte amanhã para um novo desafio 🐱'
    : isAdventure
      ? `Você chegou ao Andar ${advDepth}! 🐾`
      : 'Pontuação enviada ao ranking semanal 🏆';

  async function onShare() {
    const { text } = buildDailyShare(getDayId(), score);
    const result = await shareText(text);
    setShareLabel(
      result === 'copied'
        ? '✅ Copiado!'
        : result === 'shared'
          ? '✅ Compartilhado!'
          : '❌ Falhou',
    );
    setTimeout(() => setShareLabel('📤 Compartilhar'), 2000);
  }

  return (
    <Modal variant="win">
      <Confetti />
      <span className="modal__cat" aria-hidden>
        {icon}
      </span>
      <h2 className="modal__title">{title}</h2>
      {isAdventure && (
        <div className="record-badge" style={{ background: 'var(--purple)', color: '#fff' }}>
          🗺️ Andar {advDepth}
        </div>
      )}
      <div className="modal__score">
        {shownScore.toLocaleString('pt-BR')} pontos
      </div>
      {isRecord && shownScore > 0 && (
        <div className="record-badge">🎉 Seu melhor!</div>
      )}
      <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
        {subtitle}
      </p>

      <div className="stack">
        {isDaily && (
          <Button variant="pink" block onClick={onShare}>
            {shareLabel}
          </Button>
        )}
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
