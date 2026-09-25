import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
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
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const HomeScreen: React.FC = () => {
  const { 
    userProfile, 
    setCurrentScreen, 
    startLevel,
    levelsProgress,
    isDarkMode, 
    toggleTheme,
    resetAllProgress
  } = useGame();

  // Chapter pagination (12 levels per chapter)
  const [activeChapter, setActiveChapter] = useState<number>(1);

  // Find the first uncompleted unlocked level to continue
  const nextLevel = levelsProgress.find((lvl) => lvl.isUnlocked && !lvl.isCompleted) || levelsProgress[0];

  // Calculate total stars collected across all levels
  const totalStars = levelsProgress.reduce((acc, lvl) => acc + (lvl.stars || 0), 0);
  const completedCount = levelsProgress.filter((lvl) => lvl.isCompleted).length;

  // Levels for active chapter (12 levels per page)
  const pageSize = 12;
  const startIndex = (activeChapter - 1) * pageSize;
  const currentChapterLevels = levelsProgress.slice(startIndex, startIndex + pageSize);

  const handleLevelClick = (levelNumber: number, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sound.playWrong();
      return;
    }
    sound.playClick();
    startLevel(levelNumber);
  };

  const handleContinue = () => {
    sound.playClick();
    startLevel(nextLevel.levelNumber);
  };

  const getSizeBadgeColor = (size: number, isCurrent: boolean) => {
    if (isCurrent) return 'bg-white/20 text-white border-white/30';
    switch (size) {
      case 3:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 4:
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 5:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 6:
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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

        {/* Hero Continue Banner: Built from zero */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="p-4 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider uppercase">
              <span>STAGE {nextLevel.levelNumber}</span>
              <span>•</span>
              <span>{nextLevel.size}×{nextLevel.size} MATRIX</span>
              <span>•</span>
              <span>{nextLevel.difficulty.toUpperCase()}</span>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-tight">
              Target Sum {nextLevel.targetSum} (Values 1–{nextLevel.size * nextLevel.size})
            </h3>
            <p className="text-xs text-blue-100 font-medium">
              Numbers never repeat in the matrix • Tap to start Stage {nextLevel.levelNumber}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black shadow-sm shrink-0 ml-2">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </motion.div>

        {/* Rule Highlight: Dynamic Size by Level & Zero Repeat */}
        <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
            1→N²
          </div>
          <div>
            <h4 className="text-xs font-black text-blue-900 dark:text-blue-200">
              Procedural Campaign: Build From Zero
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight">
              Each stage challenges you with a procedurally assigned matrix size (3×3 up to 6×6). All values are distinct!
            </p>
          </div>
        </div>

        {/* Chapter Tabs (Stages 1-12, 13-24, 25-36, 37-48) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Stage Map
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-[10px] font-black">
                {completedCount}/{levelsProgress.length}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {totalStars} Stars Earned
            </span>
          </div>

          {/* Chapter Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800">
            {[1, 2, 3, 4].map((ch) => {
              const start = (ch - 1) * pageSize + 1;
              const end = ch * pageSize;
              const chLevels = levelsProgress.slice(start - 1, end);
              const chCompleted = chLevels.filter((l) => l.isCompleted).length;

              return (
                <button
                  key={ch}
                  onClick={() => { sound.playClick(); setActiveChapter(ch); }}
                  className={`py-1.5 px-1 rounded-xl text-center transition-all cursor-pointer ${
                    activeChapter === ch
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="text-[10px] font-bold block leading-none opacity-80">Part {ch}</span>
                  <span className="text-[11px] font-black block mt-0.5">#{start}–{end}</span>
                  <span className="text-[8px] opacity-75 font-semibold block">{chCompleted}/12</span>
                </button>
              );
            })}
          </div>

          {/* Level Cards Grid (4 columns) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {currentChapterLevels.map((lvl) => {
              const isCurrent = lvl.levelNumber === nextLevel.levelNumber;
              const sizeBadgeStyle = getSizeBadgeColor(lvl.size, isCurrent);

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
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {/* Top status */}
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="font-extrabold opacity-75">#{lvl.levelNumber}</span>
                    {lvl.isCompleted ? (
                      <span className="text-emerald-500 font-black">✓</span>
                    ) : !lvl.isUnlocked ? (
                      <Lock className="w-3 h-3 text-slate-400" />
                    ) : null}
                  </div>

                  {/* Level Number & Size Badge */}
                  <div className="flex flex-col items-center gap-1 my-auto">
                    <span className="text-lg font-black leading-none">
                      {lvl.levelNumber}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black border uppercase ${sizeBadgeStyle}`}>
                      {lvl.size}×{lvl.size} • Σ{lvl.targetSum}
                    </span>
                  </div>

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

        {/* Daily Challenge Card */}
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
