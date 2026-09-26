import React from 'react';
import { LayoutGrid, Calendar, Sliders, BarChart3, Settings } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../services/soundEffects';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, currentScreen, setCurrentScreen } = useGame();

  if (currentScreen === 'game') return null; // Immersive during gameplay

  const handleTabClick = (tab: 'home' | 'daily' | 'play' | 'stats' | 'settings') => {
    sound.playClick();
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentScreen('home');
    } else if (tab === 'daily') {
      setCurrentScreen('daily');
    } else if (tab === 'play') {
      setCurrentScreen('difficulty');
    } else if (tab === 'stats') {
      setCurrentScreen('leaderboard');
    } else if (tab === 'settings') {
      // settings handled via modal or tab
    }
  };

  return (
    <nav className="w-full px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-emerald-100 dark:border-white/10 flex items-center justify-around z-20 select-none shadow-[0_-5px_25px_rgba(0,0,0,0.03)]">
      {/* Levels / Home (Stage Map) */}
      <button
        onClick={() => handleTabClick('home')}
        className={`flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer ${
          activeTab === 'home' && currentScreen === 'home'
            ? 'text-emerald-700 dark:text-emerald-400 scale-105 font-black'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
        }`}
      >
        <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Levels</span>
      </button>

      {/* Daily Challenge Calendar */}
      <button
        onClick={() => handleTabClick('daily')}
        className={`flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer ${
          activeTab === 'daily' || currentScreen === 'daily'
            ? 'text-emerald-700 dark:text-emerald-400 scale-105 font-black'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
        }`}
      >
        <Calendar className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Daily</span>
      </button>

      {/* Custom Setup */}
      <button
        onClick={() => handleTabClick('play')}
        className={`flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer ${
          activeTab === 'play' || currentScreen === 'difficulty'
            ? 'text-emerald-700 dark:text-emerald-400 scale-105 font-black'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
        }`}
      >
        <Sliders className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Custom</span>
      </button>

      {/* Stats */}
      <button
        onClick={() => handleTabClick('stats')}
        className={`flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer ${
          activeTab === 'stats' || currentScreen === 'leaderboard'
            ? 'text-emerald-700 dark:text-emerald-400 scale-105 font-black'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
        }`}
      >
        <BarChart3 className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Stats</span>
      </button>

      {/* Settings */}
      <button
        onClick={() => handleTabClick('settings')}
        className={`flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer ${
          activeTab === 'settings'
            ? 'text-emerald-700 dark:text-emerald-400 scale-105 font-black'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-bold'
        }`}
      >
        <Settings className="w-5 h-5 stroke-[2.2]" />
        <span className="text-[10px] tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
