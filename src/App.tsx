import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { setupDailyReminder, clearBadge } from './services/notifications';
import { flushPendingScores } from './services/leaderboard';
import { HomeScreen } from './components/screens/HomeScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { GameScreen } from './components/screens/GameScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { AchievementsScreen } from './components/screens/AchievementsScreen';
import { RelicSelectScreen } from './components/screens/RelicSelectScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { TutorialOverlay } from './components/ui/TutorialOverlay';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const showTutorial = useGameStore((s) => s.showTutorial);

  useEffect(() => {
    // Retry any scores that failed to upload on a previous session, regardless
    // of when auth restores.
    flushPendingScores();
    // Native only: schedule the daily reminder and manage the icon badge.
    setupDailyReminder();
    clearBadge();
    let cancelled = false;
    let remove: (() => void) | undefined;
    import('@capacitor/app')
      .then(({ App }) =>
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            // Belt-and-suspenders: clear the badge whenever we return.
            clearBadge();
            flushPendingScores();
          } else {
            // App is being backgrounded (may be killed) — don't lose the run.
            useGameStore.getState().saveRunOnExit();
          }
        }),
      )
      .then((handle) => {
        // If cleanup already ran before the import resolved, remove immediately
        // so we never leak a listener (StrictMode / remount).
        if (cancelled) void handle.remove();
        else remove = () => void handle.remove();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      remove?.();
    };
  }, []);

  return (
    <div className="app">
      <div className="paw-bg" aria-hidden />
      {screen === 'home' && <HomeScreen />}
      {screen === 'levelSelect' && <LevelSelectScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'leaderboard' && <LeaderboardScreen />}
      {screen === 'achievements' && <AchievementsScreen />}
      {screen === 'relicSelect' && <RelicSelectScreen />}
      {screen === 'auth' && <AuthScreen />}
      {screen === 'profile' && <ProfileScreen />}
      {showTutorial && <TutorialOverlay />}
    </div>
  );
}
