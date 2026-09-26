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
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-emerald-50/40 text-slate-950'
    }`}>
      {/* Background ambient emerald glass glows */}
      {isDarkMode ? (
        <>
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-emerald-800/15 rounded-full blur-[150px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-300/25 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-200/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-amber-200/20 rounded-full blur-[150px] pointer-events-none" />
        </>
      )}

      {/* Top Floating Control Bar on Desktop */}
      <div className={`hidden sm:flex items-center justify-between w-full max-w-sm mb-3 px-4 py-2 rounded-2xl backdrop-blur-xl border text-xs shadow-xl transition-all ${
        isDarkMode 
          ? 'bg-slate-900/80 border-emerald-950 text-slate-200' 
          : 'bg-white/90 border-emerald-100 text-slate-950 shadow-emerald-500/5'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-black tracking-tight text-emerald-700 dark:text-emerald-400">Numtrix Glass</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                : 'bg-emerald-50 border-emerald-200 text-slate-950 hover:bg-emerald-100'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 fill-current" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen / iPhone toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setDeviceFrame(deviceFrame === 'iphone' ? 'fullscreen' : 'iphone');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all cursor-pointer shadow-xs"
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
                  : 'sm:border-[10px] sm:border-slate-200/90 sm:shadow-[0_25px_70px_rgba(0,0,0,0.08),inset_0_0_0_2px_rgba(255,255,255,0.9)] bg-white text-slate-950'
              }`
            : `max-w-md h-screen sm:h-[90vh] sm:rounded-3xl sm:border overflow-hidden shadow-2xl ${
                isDarkMode
                  ? 'sm:border-emerald-950/80 bg-slate-950 text-white'
                  : 'sm:border-emerald-100 bg-white text-slate-950'
              }`
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        <div className="w-full pt-3 px-7 flex items-center justify-between z-30 select-none pointer-events-none">
          {/* iOS Clock */}
          <span className="text-[13px] font-black tracking-tight text-slate-950 dark:text-white">
            {currentTime}
          </span>

          {/* Dynamic Island pill */}
          <div className="h-6 w-28 bg-black dark:bg-black rounded-full flex items-center justify-between px-2.5 shadow-sm border border-white/10 pointer-events-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-white/90 tracking-wide uppercase">
              {currentScreen === 'game' ? `Target ${targetSum}` : 'Numtrix'}
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
          </div>

          {/* iOS Battery & WiFi */}
          <div className="flex items-center gap-1.5 text-slate-950 dark:text-white">
            <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            <Battery className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col relative">
          {children}
        </div>
      </div>
    </div>
  );
};
