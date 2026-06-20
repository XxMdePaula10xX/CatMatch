import { useGameStore } from './store/gameStore';
import { HomeScreen } from './components/screens/HomeScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { GameScreen } from './components/screens/GameScreen';
import { LeaderboardScreen } from './components/screens/LeaderboardScreen';
import { AchievementsScreen } from './components/screens/AchievementsScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div className="app">
      <div className="paw-bg" aria-hidden />
      {screen === 'home' && <HomeScreen />}
      {screen === 'levelSelect' && <LevelSelectScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'leaderboard' && <LeaderboardScreen />}
      {screen === 'achievements' && <AchievementsScreen />}
    </div>
  );
}
