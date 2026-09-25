import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../services/soundEffects';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const { deviceFrame, setDeviceFrame, currentScreen, streak, targetNumber, isDarkMode } = useGame();

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden select-none p-0 sm:p-4 md:p-6 lg:p-8">
      {/* Background ambient liquid glass glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Control Bar on Desktop */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-sm mb-4 px-4 py-2 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs text-slate-300 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold tracking-tight text-white">Apple Liquid Glass Mobile</span>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setDeviceFrame(deviceFrame === 'iphone' ? 'fullscreen' : 'iphone');
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-semibold transition-all cursor-pointer"
        >
          {deviceFrame === 'iphone' ? (
            <>
              <Monitor className="w-3.5 h-3.5" />
              <span>Full View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container: either iPhone frame or full container */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          deviceFrame === 'iphone'
            ? 'sm:max-w-[412px] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[54px] sm:border-[10px] sm:border-slate-800/90 sm:shadow-[0_25px_70px_rgba(0,0,0,0.8),inset_0_0_0_2px_rgba(255,255,255,0.2)] relative overflow-hidden bg-slate-50 dark:bg-slate-950'
            : 'max-w-md h-screen sm:h-[90vh] sm:rounded-3xl sm:border border-white/10 bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-2xl'
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        <div className="w-full pt-3 px-7 flex items-center justify-between z-30 select-none pointer-events-none">
          {/* iOS Clock */}
          <span className="text-[13px] font-black tracking-tight text-slate-900 dark:text-white">
            {currentTime}
          </span>

          {/* Apple Dynamic Island */}
          <div className="h-7 px-3 rounded-full bg-black flex items-center justify-center gap-2 shadow-md pointer-events-auto">
            {currentScreen === 'game' && streak >= 3 ? (
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-400">
                <span>🔥</span>
                <span>{streak}x</span>
              </div>
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
            )}
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            {currentScreen === 'game' && (
              <div className="text-[10px] font-black text-cyan-400 pl-0.5">
                #{targetNumber}
              </div>
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
