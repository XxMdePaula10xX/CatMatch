import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Button } from './Button';

interface Slide {
  icon: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    icon: '🐱',
    title: 'Bem-vindo ao Cat Match!',
    text: 'Combine 3 ou mais gatinhos iguais para fazê-los sumir e ganhar pontos.',
  },
  {
    icon: '👆',
    title: 'Como jogar',
    text: 'Arraste um gato na direção desejada — ou toque em dois vizinhos para trocá-los. A troca só vale se formar uma combinação.',
  },
  {
    icon: '✨',
    title: 'Combinações especiais',
    text: '3 iguais somem. 4 em linha criam um Ninja (limpa linha/coluna). 5 criam um Mago. Em formato L ou T criam o Bravo (explode 3x3).',
  },
  {
    icon: '😺',
    title: 'Cada gato tem um poder',
    text: 'Laranja: +pontos · Cinza: dá dica · Branco: transforma vizinho · Preto: quebra obstáculo · Siamês: carrega o Chefe · Rajado: empurra peças.',
  },
  {
    icon: '🧶',
    title: 'Novelo de Lã',
    text: 'Combine ao lado de um novelo e ele rola pelo tabuleiro, limpando um caminho inteiro!',
  },
  {
    icon: '👑',
    title: 'Gato Chefe',
    text: 'Seus combos enchem a barra do Chefe. Quando enche, ele acorda e remove todos os gatos do tipo mais comum do tabuleiro.',
  },
  {
    icon: '📦',
    title: 'Obstáculos',
    text: 'Caixas precisam de 2 danos para quebrar. Faça combinações ao lado delas. Arranhadores bloqueiam a queda das peças.',
  },
  {
    icon: '⏱️',
    title: 'Objetivo & tempo',
    text: 'Cumpra o objetivo antes de acabar os movimentos. Quanto mais rápido terminar, maior o seu High Score!',
  },
  {
    icon: '🗺️',
    title: 'Modos de jogo',
    text: 'Fases (campanha), Desafio Diário, Relâmpago (60s) e Aventura — uma jornada roguelite onde você escolhe relíquias entre os andares. Divirta-se! 🐾',
  },
];

/** First-run (and re-openable) step-by-step tutorial. */
export function TutorialOverlay() {
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
        <h2 className="modal__title">{slide.title}</h2>
        <p className="tutorial__text">{slide.text}</p>

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
              ← Voltar
            </Button>
          ) : (
            <Button variant="ghost" small block onClick={closeTutorial}>
              Pular
            </Button>
          )}
          {isLast ? (
            <Button variant="green" small block onClick={closeTutorial}>
              Começar! 🐾
            </Button>
          ) : (
            <Button variant="green" small block onClick={() => setI(i + 1)}>
              Próximo →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
