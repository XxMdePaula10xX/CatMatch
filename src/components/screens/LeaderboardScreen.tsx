import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { levels } from '../../data/levels';
import {
  getTopScores,
  isGlobalLeaderboard,
  type LeaderEntry,
} from '../../services/leaderboard';
import { Button } from '../ui/Button';

/** Global (or local fallback) ranking screen. */
export function LeaderboardScreen() {
  const goHome = useGameStore((s) => s.goHome);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);

  const [filter, setFilter] = useState<number | 'all'>('all');
  const [entries, setEntries] = useState<LeaderEntry[] | null>(null);
  const [name, setName] = useState(nickname);

  useEffect(() => {
    let active = true;
    setEntries(null);
    getTopScores(filter === 'all' ? undefined : filter).then((rows) => {
      if (active) setEntries(rows);
    });
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <div className="screen">
      <div className="row spread">
        <Button variant="ghost" small icon onClick={goHome}>
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          🏆 Ranking
        </h2>
        <div style={{ width: 50 }} />
      </div>

      <div className="panel">
        <label className="stat__label" htmlFor="nick">
          Seu apelido
        </label>
        <div className="row" style={{ marginTop: 6 }}>
          <input
            id="nick"
            className="nick-input"
            placeholder="Digite seu nome"
            value={name}
            maxLength={18}
            onChange={(e) => setName(e.target.value)}
          />
          <Button
            variant="blue"
            small
            onClick={() => setNickname(name.trim())}
            disabled={!name.trim() || name.trim() === nickname}
          >
            Salvar
          </Button>
        </div>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: 12 }}>
          {isGlobalLeaderboard()
            ? '🌍 Ranking global ativo (Firebase).'
            : '📱 Modo local: configure o Firebase para comparar com o mundo.'}
        </p>
      </div>

      <div className="filters">
        <button
          className={`filter ${filter === 'all' ? 'on' : ''}`}
          onClick={() => setFilter('all')}
        >
          Geral
        </button>
        {levels.map((l) => (
          <button
            key={l.id}
            className={`filter ${filter === l.id ? 'on' : ''}`}
            onClick={() => setFilter(l.id)}
          >
            F{l.id}
          </button>
        ))}
      </div>

      <div className="panel">
        {entries === null ? (
          <p className="center muted">Carregando…</p>
        ) : entries.length === 0 ? (
          <p className="center muted">Ainda sem pontuações. Seja o primeiro! 🐾</p>
        ) : (
          <ol className="ranking">
            {entries.map((e, i) => (
              <li
                key={`${e.name}-${i}`}
                className={`ranking__row ${
                  e.name === nickname ? 'me' : ''
                }`}
              >
                <span className="ranking__pos">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className="ranking__name">{e.name}</span>
                <span className="ranking__lvl">F{e.level}</span>
                <span className="ranking__score">
                  {e.score.toLocaleString('pt-BR')}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
