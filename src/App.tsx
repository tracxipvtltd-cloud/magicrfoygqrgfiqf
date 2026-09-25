import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { HomeScreen } from './screens/HomeScreen';
import { DifficultyScreen } from './screens/DifficultyScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { DailyScreen } from './screens/DailyScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SettingsModal } from './components/SettingsModal';

const AppContent: React.FC = () => {
  const { currentScreen, activeTab, setActiveTab } = useGame();

  return (
    <MobileDeviceFrame>
      <div className="flex-1 flex flex-col w-full relative">
        {currentScreen === 'home' && <HomeScreen />}
        {currentScreen === 'daily' && <DailyScreen />}
        {currentScreen === 'difficulty' && <DifficultyScreen />}
        {currentScreen === 'game' && <GameScreen />}
        {currentScreen === 'result' && <ResultScreen />}
        {currentScreen === 'leaderboard' && <LeaderboardScreen />}
      </div>

      {/* Apple Liquid Glass Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Google Authentication & Firebase Cloud Sync Sheet */}
      <GoogleAuthModal />

      {/* Settings & Educational Academy Modal */}
      <SettingsModal
        isOpen={activeTab === 'settings'}
        onClose={() => setActiveTab('home')}
      />
    </MobileDeviceFrame>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
