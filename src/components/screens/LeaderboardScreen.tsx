import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { levels } from '../../data/levels';
import { weekLabel } from '../../services/periods';
import {
  getTopScores,
  getPlayerRank,
  getMyScore,
  playerTag,
  countryFlag,
  type LeaderEntry,
  type QueryParams,
} from '../../services/leaderboard';
import { Button } from '../ui/Button';
import { useT, nf, t } from '../../i18n';

type Filter = 'daily' | 'blitz' | 'adventure' | 'all' | number;

function paramsFor(filter: Filter, allTime: boolean): QueryParams {
  if (filter === 'daily') return { board: 'daily', scope: 'daily', allTime };
  if (filter === 'blitz') return { board: 'blitz', scope: 'weekly', allTime };
  if (filter === 'adventure')
    return { board: 'adventure', scope: 'weekly', allTime };
  if (filter === 'all') return { scope: 'weekly', allTime };
  return { board: `lvl${filter}`, scope: 'weekly', allTime };
}

function boardLabel(board: string): string {
  if (board === 'daily') return '📅';
  if (board === 'blitz') return '⚡';
  if (board === 'adventure') return '🗺️';
  return board.replace('lvl', t('lb.levelShort'));
}

export function LeaderboardScreen() {
  const tt = useT();
  const goHome = useGameStore((s) => s.goHome);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const user = useGameStore((s) => s.user);
  const authReady = useGameStore((s) => s.authReady);
  const authAvailable = useGameStore((s) => s.authAvailable);
  const goAuth = useGameStore((s) => s.goAuth);
  const goProfile = useGameStore((s) => s.goProfile);
  const rankingRefresh = useGameStore((s) => s.rankingRefresh);

  const [filter, setFilter] = useState<Filter>('all');
  const [allTime, setAllTime] = useState(false);
  const [entries, setEntries] = useState<LeaderEntry[] | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [name, setName] = useState(nickname);

  useEffect(() => setName(nickname), [nickname]);

  useEffect(() => {
    let active = true;
    setEntries(null);
    setMyRank(null);
    const params = paramsFor(filter, allTime);
    getTopScores(params)
      .then((rows) => active && setEntries(rows))
      .catch(() => active && setEntries([]));
    // Fetch the player's score for THIS board+period (not the all-time local
    // high), so the pinned "your position" reflects the current view.
    getMyScore(params, user?.uid)
      .then((score) => {
        if (!active) return undefined;
        setMyScore(score);
        return getPlayerRank(params, score);
      })
      .then((r) => {
        if (active && r !== undefined) setMyRank(r);
      })
      .catch(() => active && setMyRank(null));
    return () => {
      active = false;
    };
  }, [filter, allTime, user, rankingRefresh]);

  const isDaily = filter === 'daily';
  const inTop = entries?.some((e) =>
    user ? e.uid === user.uid : e.name === nickname,
  );

  return (
    <div className="screen">
      <div className="row spread">
        <Button
          variant="ghost"
          small
          icon
          aria-label={tt('common.back')}
          onClick={goHome}
        >
          ←
        </Button>
        <h2 className="section-title" style={{ margin: 0 }}>
          {tt('lb.title')}
        </h2>
        <div style={{ width: 50 }} />
      </div>

      {/* Account / login */}
      <div className="panel">
        {!authAvailable ? (
          <>
            <div className="account">
              <div className="account__info">
                <strong>{tt('lb.localMode')}</strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  {tt('lb.localModeDesc')}
                </span>
              </div>
            </div>
            <NickRow {...{ name, setName, nickname, setNickname }} />
          </>
        ) : !authReady ? (
          <p className="center muted">{tt('lb.loadingAccount')}</p>
        ) : user ? (
          <>
            <div className="account">
              <div className="account__info">
                <strong>
                  {nickname || user.name}
                  <span className="ranking__tag">#{playerTag(user.uid)}</span>
                </strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  {tt('lb.connected')}
                </span>
              </div>
              <Button variant="ghost" small onClick={goProfile}>
                {tt('lb.profile')}
              </Button>
            </div>
            <NickRow {...{ name, setName, nickname, setNickname }} />
          </>
        ) : (
          <div className="stack">
            <p className="center muted" style={{ margin: 0 }}>
              {tt('lb.signInPrompt')}
            </p>
            <Button variant="green" block onClick={goAuth}>
              {tt('lb.signInBtn')}
            </Button>
          </div>
        )}
      </div>

      <div className="period-toggle">
        <button
          className={`period-toggle__btn ${!allTime ? 'on' : ''}`}
          onClick={() => setAllTime(false)}
        >
          {tt('lb.thisWeek')}
        </button>
        <button
          className={`period-toggle__btn ${allTime ? 'on' : ''}`}
          onClick={() => setAllTime(true)}
        >
          {tt('lb.allTime')}
        </button>
      </div>

      <div className="filters">
        <button
          className={`filter ${filter === 'daily' ? 'on' : ''}`}
          onClick={() => setFilter('daily')}
        >
          {allTime ? tt('lb.filterBestDay') : tt('lb.filterDaily')}
        </button>
        <button
          className={`filter ${filter === 'blitz' ? 'on' : ''}`}
          onClick={() => setFilter('blitz')}
        >
          {tt('lb.filterBlitz')}
        </button>
        <button
          className={`filter ${filter === 'adventure' ? 'on' : ''}`}
          onClick={() => setFilter('adventure')}
        >
          {tt('lb.filterAdventure')}
        </button>
        <button
          className={`filter ${filter === 'all' ? 'on' : ''}`}
          onClick={() => setFilter('all')}
        >
          {tt('lb.filterAll')}
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
          <option value="">{tt('lb.byLevel')}</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>
              {tt('lb.levelN', { n: l.id })}
            </option>
          ))}
        </select>
      </div>

      <p className="center muted" style={{ margin: 0, fontSize: 12 }}>
        {allTime
          ? tt('lb.captionAllTime')
          : isDaily
            ? tt('lb.captionDaily')
            : tt('lb.captionWeekly', { week: weekLabel() })}
      </p>

      <div className="panel">
        {entries === null ? (
          <p className="center muted">{tt('common.loading')}</p>
        ) : entries.length === 0 ? (
          <p className="center muted">{tt('lb.empty')}</p>
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
                <span className="ranking__name">
                  {countryFlag(e.country) && (
                    <span className="ranking__flag" aria-hidden>
                      {countryFlag(e.country)}{' '}
                    </span>
                  )}
                  {e.name}
                  {playerTag(e.uid) && (
                    <span className="ranking__tag">#{playerTag(e.uid)}</span>
                  )}
                </span>
                <span className="ranking__lvl">{boardLabel(e.board)}</span>
                <span className="ranking__score">{nf(e.score)}</span>
              </li>
            ))}
          </ol>
        )}

        {/* Your position, pinned when you're outside the visible top list. */}
        {myScore > 0 && !inTop && myRank !== null && (
          <div className="ranking__me-pin">
            <span className="ranking__pos">#{myRank}</span>
            <span className="ranking__name">
              {nickname || tt('lb.you')} {tt('lb.youParen')}
            </span>
            <span className="ranking__score">{nf(myScore)}</span>
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
  const tt = useT();
  return (
    <>
      <label className="stat__label" htmlFor="nick">
        {tt('auth.nickname')}
      </label>
      <div className="row" style={{ marginTop: 6 }}>
        <input
          id="nick"
          className="nick-input"
          placeholder={tt('lb.nickPlaceholder')}
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
          {tt('common.save')}
        </Button>
      </div>
    </>
  );
}
