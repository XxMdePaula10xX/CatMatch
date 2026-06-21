import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { setupDailyReminder, clearBadge, setBadge } from './services/notifications';
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

  // Native only: schedule the daily play reminder and clear the icon badge on
  // open / whenever the app comes back to the foreground.
  useEffect(() => {
    setupDailyReminder();
    clearBadge();
    let remove: (() => void) | undefined;
    import('@capacitor/app')
      .then(({ App }) =>
        App.addListener('appStateChange', ({ isActive }) => {
          if (isActive) clearBadge();
          else setBadge();
        }),
      )
      .then((handle) => {
        remove = () => void handle.remove();
      })
      .catch(() => {});
    return () => remove?.();
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
