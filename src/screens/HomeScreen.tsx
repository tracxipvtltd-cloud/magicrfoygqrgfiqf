import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Flame, 
  Target, 
  Sparkles, 
  Trophy, 
  Zap,
  Grid,
  Sun,
  Moon,
  Lock,
  Star,
  Check,
  Calendar,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';
import { MatrixSize } from '../types';

export const HomeScreen: React.FC = () => {
  const { 
    userProfile, 
    setCurrentScreen, 
    startNewGame, 
    startLevel,
    levelsProgress,
    isDarkMode, 
    toggleTheme,
    startDailyChallenge 
  } = useGame();

  const [activeSizeTab, setActiveSizeTab] = useState<MatrixSize>(5);

  const levels = levelsProgress[activeSizeTab] || [];

  // Find the first uncompleted unlocked level to continue
  const nextLevel = levels.find((lvl) => lvl.isUnlocked && !lvl.isCompleted) || levels[0];

  // Calculate total stars collected across all levels
  const totalStars = Object.values(levelsProgress).reduce((acc, lvlList) => {
    return acc + lvlList.reduce((s, l) => s + (l.stars || 0), 0);
  }, 0);

  const handleLevelClick = (levelNumber: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sound.playWrong();
      return;
    }
    sound.playClick();
    startLevel(activeSizeTab, levelNumber);
  };

  const handleContinue = () => {
    sound.playClick();
    startLevel(activeSizeTab, nextLevel.levelNumber);
  };

  const getMagicSumForTab = (sz: MatrixSize) => {
    switch (sz) {
      case 3: return 15;
      case 4: return 34;
      case 5: return 65;
      case 6: return 111;
      default: return 65;
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-8">
      <AppHeader subtitle="NUMTRIX MATRIX" />

      <div className="px-5 pt-1 space-y-4">
        {/* Top Header Bar: Player Rank, Total Stars & White/Dark Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-sky-300 text-xs font-black tracking-wide shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>LVL {userProfile.level}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{totalStars}</span>
            </div>
          </div>

          {/* Theme Selector: Apple Liquid Glass White / Dark Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xs">
            <button
              onClick={() => { if (isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                !isDarkMode
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3 h-3 fill-current" />
              <span>White</span>
            </button>

            <button
              onClick={() => { if (!isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <Moon className="w-3 h-3 fill-current" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Nonogram Size Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800">
          <button
            onClick={() => { sound.playClick(); setActiveSizeTab(5); }}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeSizeTab === 5
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="text-[10px] font-bold block leading-none opacity-80">5×5</span>
            <span className="text-xs font-black block mt-0.5">Sum 65</span>
            <span className="text-[9px] opacity-75 font-semibold block">1–25</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveSizeTab(4); }}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeSizeTab === 4
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="text-[10px] font-bold block leading-none opacity-80">4×4</span>
            <span className="text-xs font-black block mt-0.5">Sum 34</span>
            <span className="text-[9px] opacity-75 font-semibold block">1–16</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveSizeTab(6); }}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeSizeTab === 6
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="text-[10px] font-bold block leading-none opacity-80">6×6</span>
            <span className="text-xs font-black block mt-0.5">Sum 111</span>
            <span className="text-[9px] opacity-75 font-semibold block">1–36</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveSizeTab(3); }}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
              activeSizeTab === 3
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span className="text-[10px] font-bold block leading-none opacity-80">3×3</span>
            <span className="text-xs font-black block mt-0.5">Sum 15</span>
            <span className="text-[9px] opacity-75 font-semibold block">1–9</span>
          </button>
        </div>

        {/* Nonogram Hero Continue Banner */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider uppercase">
              <span>{activeSizeTab}×{activeSizeTab} NUMTRIX</span>
              <span>•</span>
              <span>STAGE {nextLevel.levelNumber}</span>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-tight">
              Target Sum {getMagicSumForTab(activeSizeTab)}
            </h3>
            <p className="text-xs text-blue-100 font-medium">
              Values 1 to {activeSizeTab * activeSizeTab} • Zero repeats in the matrix!
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black shadow-sm">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </motion.div>

        {/* Rule Highlight: "Numbers Don't Repeat" */}
        <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
            ≠
          </div>
          <div>
            <h4 className="text-xs font-black text-blue-900 dark:text-blue-200">
              Crucial Rule: Numbers Never Repeat!
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight">
              Every value from <span className="font-bold text-blue-600 dark:text-sky-400">1 to {activeSizeTab * activeSizeTab}</span> appears exactly once in the {activeSizeTab}×{activeSizeTab} matrix.
            </p>
          </div>
        </div>

        {/* Nonogram Stage Cards Map (1..12) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {activeSizeTab}×{activeSizeTab} Levels
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              {levels.filter((l) => l.isCompleted).length}/{levels.length} Solved
            </span>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            {levels.map((lvl) => {
              const isCurrent = lvl.levelNumber === nextLevel.levelNumber;

              return (
                <motion.button
                  key={lvl.levelNumber}
                  whileTap={lvl.isUnlocked ? { scale: 0.92 } : undefined}
                  onClick={() => handleLevelClick(lvl.levelNumber, lvl.isUnlocked)}
                  className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center justify-between aspect-square relative cursor-pointer ${
                    !lvl.isUnlocked
                      ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                      : isCurrent
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30 ring-2 ring-blue-400/50'
                      : lvl.isCompleted
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {/* Top status */}
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="font-bold opacity-60">#{lvl.levelNumber}</span>
                    {lvl.isCompleted ? (
                      <span className="text-emerald-500 font-black">✓</span>
                    ) : !lvl.isUnlocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                    ) : null}
                  </div>

                  {/* Level Number */}
                  <span className="text-base font-black leading-none my-auto">
                    {lvl.levelNumber}
                  </span>

                  {/* Stars 0..3 */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 3 }).map((_, sIdx) => (
                      <Star
                        key={sIdx}
                        className={`w-2.5 h-2.5 ${
                          sIdx < lvl.stars
                            ? isCurrent
                              ? 'text-amber-300 fill-amber-300'
                              : 'text-amber-400 fill-amber-400'
                            : isCurrent
                            ? 'text-white/40'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Daily Challenge Card in Nonogram Style */}
        <GlassCard
          onClick={() => {
            sound.playClick();
            setCurrentScreen('daily');
          }}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:border-blue-400/70 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  Daily Challenge
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase">
                  CALENDAR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Solve today's puzzle to earn the monthly trophy!
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </GlassCard>
      </div>
    </div>
  );
};
