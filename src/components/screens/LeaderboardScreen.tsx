import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { levels } from '../../data/levels';
import { getTopScores, type LeaderEntry } from '../../services/leaderboard';
import { Button } from '../ui/Button';

/** Global (or local fallback) ranking screen with account login. */
export function LeaderboardScreen() {
  const goHome = useGameStore((s) => s.goHome);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const user = useGameStore((s) => s.user);
  const authReady = useGameStore((s) => s.authReady);
  const authAvailable = useGameStore((s) => s.authAvailable);
  const signInGoogle = useGameStore((s) => s.signInGoogle);
  const signInApple = useGameStore((s) => s.signInApple);
  const signOut = useGameStore((s) => s.signOut);

  const [filter, setFilter] = useState<number | 'all'>('all');
  const [entries, setEntries] = useState<LeaderEntry[] | null>(null);
  const [name, setName] = useState(nickname);

  useEffect(() => setName(nickname), [nickname]);

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

      {/* Account / login */}
      <div className="panel">
        {!authAvailable ? (
          <>
            <div className="account">
              <div className="account__avatar">📱</div>
              <div className="account__info">
                <strong>Modo local</strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  Configure o Firebase para login e ranking global.
                </span>
              </div>
            </div>
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
          </>
        ) : !authReady ? (
          <p className="center muted">Carregando conta…</p>
        ) : user ? (
          <>
            <div className="account">
              {user.photoURL ? (
                <img className="account__avatar" src={user.photoURL} alt="" />
              ) : (
                <div className="account__avatar">😺</div>
              )}
              <div className="account__info">
                <strong>{nickname || user.name}</strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  🌍 Conectado · ranking global
                </span>
              </div>
              <Button variant="ghost" small onClick={signOut}>
                Sair
              </Button>
            </div>
            <label className="stat__label" htmlFor="nick">
              Apelido no ranking
            </label>
            <div className="row" style={{ marginTop: 6 }}>
              <input
                id="nick"
                className="nick-input"
                placeholder="Seu nome"
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
          </>
        ) : (
          <div className="stack">
            <p className="center muted" style={{ margin: 0 }}>
              Entre para salvar sua pontuação no ranking global e competir com
              outros jogadores.
            </p>
            <Button variant="ghost" block onClick={signInGoogle}>
              <span style={{ fontSize: 18 }}>🔵</span> Entrar com Google
            </Button>
            <Button variant="ghost" block onClick={signInApple}>
              <span style={{ fontSize: 18 }}>🍎</span> Entrar com Apple
            </Button>
          </div>
        )}
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
                key={`${e.uid ?? e.name}-${i}`}
                className={`ranking__row ${
                  (user && e.uid === user.uid) ||
                  (!user && e.name === nickname)
                    ? 'me'
                    : ''
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
