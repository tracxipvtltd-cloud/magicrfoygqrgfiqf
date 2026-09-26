import React from 'react';
import { ArrowLeft, User as UserIcon, Zap, CheckCircle2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { sound } from '../services/soundEffects';

interface AppHeaderProps {
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  subtitle = 'HOME',
  showBack = false,
  onBack,
}) => {
  const { currentScreen, setCurrentScreen, user, userProfile, setIsAuthModalOpen } = useGame();

  const handleBack = () => {
    sound.playClick();
    if (onBack) {
      onBack();
    } else {
      if (currentScreen === 'difficulty') setCurrentScreen('home');
      else if (currentScreen === 'game') setCurrentScreen('home');
      else if (currentScreen === 'result') setCurrentScreen('home');
      else setCurrentScreen('home');
    }
  };

  return (
    <header className="flex items-center justify-between px-5 pt-3 pb-2 w-full select-none">
      {/* Left side: Back button or Logo + Title */}
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-slate-800/80 border border-emerald-100 dark:border-white/10 shadow-xs hover:bg-white active:scale-90 transition-all text-slate-950 dark:text-white cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          {/* Numtrix App Icon (Squircle with sleek green N matrix badge) */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-1.5 shadow-md shadow-emerald-600/30 flex items-center justify-center overflow-hidden border border-emerald-300/40">
            <div className="w-full h-full rounded-lg bg-emerald-950/70 p-0.5 grid grid-cols-3 gap-0.5 items-center justify-items-center">
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-400 font-black text-[5px] flex items-center justify-center text-slate-950">1</div>
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-300/50" />
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-300/50" />
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-300/50" />
              <div className="w-2 h-2 rounded-xs bg-white text-emerald-900 flex items-center justify-center font-black text-[6px]">
                N
              </div>
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-300/50" />
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-300/50" />
              <div className="w-1.5 h-1.5 rounded-xs bg-emerald-300/50" />
              <div className="w-1.5 h-1.5 rounded-xs bg-amber-400 font-black text-[5px] flex items-center justify-center text-slate-950">Σ</div>
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-base font-extrabold tracking-tight text-slate-950 dark:text-emerald-100 leading-none">
              Numtrix
            </h1>
            <span className="text-[10px] font-black tracking-widest text-emerald-800 dark:text-emerald-400 uppercase mt-0.5">
              {subtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right side: LVL badge and Google Profile Avatar */}
      <div className="flex items-center gap-2">
        {/* Level badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
          <span className="text-xs font-black tracking-wider text-slate-950 dark:text-slate-100 uppercase">
            LVL {userProfile.level}
          </span>
        </div>

        {/* Profile / Google Auth trigger button */}
        <button
          onClick={() => {
            sound.playClick();
            setIsAuthModalOpen(true);
          }}
          className="relative w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 active:scale-95 transition-all overflow-hidden border-2 border-white dark:border-slate-800 cursor-pointer"
          title="Google Account & Cloud Sync"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-5 h-5 fill-white/20 stroke-[2.2]" />
          )}
        </button>
      </div>
    </header>
  );
};
