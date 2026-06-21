import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  levels,
  DAILY_LEVEL_ID,
  BLITZ_LEVEL_ID,
  ADVENTURE_LEVEL_ID,
} from '../../data/levels';
import { weekLabel } from '../../services/periods';
import {
  getTopScores,
  getPlayerRank,
  type LeaderEntry,
  type QueryParams,
} from '../../services/leaderboard';
import { Button } from '../ui/Button';

type Filter = 'daily' | 'blitz' | 'adventure' | 'all' | number;

function paramsFor(filter: Filter): QueryParams {
  if (filter === 'daily') return { board: 'daily', scope: 'daily' };
  if (filter === 'blitz') return { board: 'blitz', scope: 'weekly' };
  if (filter === 'adventure') return { board: 'adventure', scope: 'weekly' };
  if (filter === 'all') return { scope: 'weekly' };
  return { board: `lvl${filter}`, scope: 'weekly' };
}

function boardLabel(board: string): string {
  if (board === 'daily') return '📅';
  if (board === 'blitz') return '⚡';
  if (board === 'adventure') return '🗺️';
  return board.replace('lvl', 'F');
}

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
  const highScores = useGameStore((s) => s.highScores);

  const [filter, setFilter] = useState<Filter>('all');
  const [entries, setEntries] = useState<LeaderEntry[] | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [name, setName] = useState(nickname);

  useEffect(() => setName(nickname), [nickname]);

  const myScore =
    filter === 'all'
      ? Math.max(0, ...levels.map((l) => highScores[l.id] ?? 0))
      : filter === 'daily'
        ? highScores[DAILY_LEVEL_ID] ?? 0
        : filter === 'blitz'
          ? highScores[BLITZ_LEVEL_ID] ?? 0
          : filter === 'adventure'
            ? highScores[ADVENTURE_LEVEL_ID] ?? 0
            : highScores[filter] ?? 0;

  useEffect(() => {
    let active = true;
    setEntries(null);
    setMyRank(null);
    const params = paramsFor(filter);
    getTopScores(params).then((rows) => active && setEntries(rows));
    getPlayerRank(params, myScore).then((r) => active && setMyRank(r));
    return () => {
      active = false;
    };
  }, [filter, myScore]);

  const isDaily = filter === 'daily';
  const inTop = entries?.some((e) =>
    user ? e.uid === user.uid : e.name === nickname,
  );

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
              <div className="account__info">
                <strong>Modo local</strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  Configure o Firebase para login e ranking global.
                </span>
              </div>
            </div>
            <NickRow {...{ name, setName, nickname, setNickname }} />
          </>
        ) : !authReady ? (
          <p className="center muted">Carregando conta…</p>
        ) : user ? (
          <>
            <div className="account">
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
            <NickRow {...{ name, setName, nickname, setNickname }} />
          </>
        ) : (
          <div className="stack">
            <p className="center muted" style={{ margin: 0 }}>
              Entre para salvar sua pontuação no ranking global.
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
          className={`filter ${filter === 'daily' ? 'on' : ''}`}
          onClick={() => setFilter('daily')}
        >
          📅 Diário
        </button>
        <button
          className={`filter ${filter === 'blitz' ? 'on' : ''}`}
          onClick={() => setFilter('blitz')}
        >
          ⚡ Relâmpago
        </button>
        <button
          className={`filter ${filter === 'adventure' ? 'on' : ''}`}
          onClick={() => setFilter('adventure')}
        >
          🗺️ Aventura
        </button>
        <button
          className={`filter ${filter === 'all' ? 'on' : ''}`}
          onClick={() => setFilter('all')}
        >
          Geral
        </button>
        <select
          className={`filter filter--select ${
            typeof filter === 'number' ? 'on' : ''
          }`}
          value={typeof filter === 'number' ? filter : ''}
          onChange={(e) =>
            setFilter(e.target.value ? Number(e.target.value) : 'all')
          }
        >
          <option value="">Por fase…</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              Fase {l.id}
            </option>
          ))}
        </select>
      </div>

      <p className="center muted" style={{ margin: 0, fontSize: 12 }}>
        {isDaily ? '📅 Ranking de hoje' : `🗓️ ${weekLabel()} · zera toda semana`}
      </p>

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
                <span className="ranking__lvl">{boardLabel(e.board)}</span>
                <span className="ranking__score">
                  {e.score.toLocaleString('pt-BR')}
                </span>
              </li>
            ))}
          </ol>
        )}

        {/* Your position, pinned when you're outside the visible top list. */}
        {myScore > 0 && !inTop && myRank !== null && (
          <div className="ranking__me-pin">
            <span className="ranking__pos">#{myRank}</span>
            <span className="ranking__name">{nickname || 'Você'} (você)</span>
            <span className="ranking__score">
              {myScore.toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function NickRow({
  name,
  setName,
  nickname,
  setNickname,
}: {
  name: string;
  setName: (v: string) => void;
  nickname: string;
  setNickname: (v: string) => void;
}) {
  return (
    <>
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
  );
}
