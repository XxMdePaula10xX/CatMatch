import { useGameStore } from './store/gameStore';
import { HomeScreen } from './components/screens/HomeScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { GameScreen } from './components/screens/GameScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { AchievementsScreen } from './components/screens/AchievementsScreen';
import { RelicSelectScreen } from './components/screens/RelicSelectScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { TutorialOverlay } from './components/ui/TutorialOverlay';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const showTutorial = useGameStore((s) => s.showTutorial);

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
      {showTutorial && <TutorialOverlay />}
    </div>
  );
}
