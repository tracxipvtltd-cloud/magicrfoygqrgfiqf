import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Sun, Moon } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../services/soundEffects';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const { deviceFrame, setDeviceFrame, currentScreen, streak, targetSum, isDarkMode, toggleTheme } = useGame();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden select-none p-0 sm:p-4 md:p-6 lg:p-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Background ambient liquid glass glows */}
      {isDarkMode ? (
        <>
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-sky-300/25 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-amber-300/15 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* Top Floating Control Bar on Desktop */}
      <div className={`hidden sm:flex items-center justify-between w-full max-w-sm mb-3 px-4 py-2 rounded-2xl backdrop-blur-xl border text-xs shadow-xl transition-all ${
        isDarkMode 
          ? 'bg-slate-900/70 border-white/10 text-slate-300' 
          : 'bg-white/80 border-slate-200/90 text-slate-700 shadow-slate-200/50'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight">Apple Liquid Glass UI</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Theme Toggle in Top Bar */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Switch to White Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 fill-current" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen / iPhone toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setDeviceFrame(deviceFrame === 'iphone' ? 'fullscreen' : 'iphone');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer"
          >
            {deviceFrame === 'iphone' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Mobile Container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          deviceFrame === 'iphone'
            ? `sm:max-w-[412px] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[54px] relative overflow-hidden ${
                isDarkMode
                  ? 'sm:border-[10px] sm:border-slate-800/90 sm:shadow-[0_25px_70px_rgba(0,0,0,0.8),inset_0_0_0_2px_rgba(255,255,255,0.2)] bg-slate-950 text-white'
                  : 'sm:border-[10px] sm:border-slate-300/80 sm:shadow-[0_25px_70px_rgba(0,0,0,0.12),inset_0_0_0_2px_rgba(255,255,255,0.8)] bg-slate-50 text-slate-900'
              }`
            : `max-w-md h-screen sm:h-[90vh] sm:rounded-3xl sm:border overflow-hidden shadow-2xl ${
                isDarkMode
                  ? 'sm:border-white/10 bg-slate-950 text-white'
                  : 'sm:border-slate-200 bg-slate-50 text-slate-900'
              }`
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        <div className="w-full pt-3 px-7 flex items-center justify-between z-30 select-none pointer-events-none">
          {/* iOS Clock */}
          <span className="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">
            {currentTime}
          </span>

          {/* Sleek Island Pill - Clean and minimal without fake camera dots */}
          <div className="h-6 px-3 rounded-full bg-black flex items-center justify-center gap-1.5 shadow-md pointer-events-auto">
            {currentScreen === 'game' ? (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400">
                {streak >= 3 && <span className="text-amber-400">🔥{streak}x</span>}
                <span>Σ{targetSum}</span>
              </div>
            ) : (
              <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                NUMTRIX
              </span>
            )}
          </div>

          {/* iOS Status Icons */}
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2.5] fill-current" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full flex flex-col overflow-y-auto no-scrollbar relative">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="w-full py-2 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-32 h-1 rounded-full bg-slate-300 dark:bg-slate-700/80" />
        </div>
      </div>
    </div>
  );
};
