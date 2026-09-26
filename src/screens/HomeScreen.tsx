import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Sparkles, 
  Trophy, 
  Zap,
  Sun, 
  Moon, 
  Lock, 
  Check, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  Calendar,
  RotateCcw,
  Search,
  Lightbulb,
  CloudCheck,
  CloudOff,
  Flame,
  LogIn
} from 'lucide-react';
import { useGame, TOTAL_CAMPAIGN_LEVELS } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';
import { getLevelConfig } from '../services/magicMatrixEngine';

export const HomeScreen: React.FC = () => {
  const { 
    user,
    userProfile, 
    setCurrentScreen, 
    startLevel,
    highestUnlockedLevel,
    completedLevelsMap,
    getLevelData,
    isDarkMode, 
    toggleTheme,
    totalCampaignLevels,
    hintsLeft,
    levelsCompletedTowardsHint,
    playerLevelInfo,
    dailyChallengeInfo,
    cloudSyncStatus,
    setIsAuthModalOpen,
    calculateLevelScore,
    calculateLevelXP,
    calculateDifficulty
  } = useGame();

  // 16 levels per page in a clean, uniform 4x4 grid
  const pageSize = 16;
  const totalPages = Math.ceil(totalCampaignLevels / pageSize);

  // Default to the page containing the player's highest unlocked level
  const initialPage = Math.max(1, Math.ceil(highestUnlockedLevel / pageSize));
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [jumpInput, setJumpInput] = useState<string>('');

  // Calculate total stars collected across all completed levels
  const totalStars = useMemo(() => {
    return Object.values(completedLevelsMap).reduce((acc, lvl) => acc + (lvl.stars || 0), 0);
  }, [completedLevelsMap]);

  const completedCount = useMemo(() => {
    return Object.keys(completedLevelsMap).length;
  }, [completedLevelsMap]);

  // Next level to play is the highest unlocked level
  const nextLevelNumber = highestUnlockedLevel;
  const nextLevelConfig = getLevelConfig(nextLevelNumber);

  // Generate the 16 level descriptors for the current page
  const pageLevels = useMemo(() => {
    const start = (currentPage - 1) * pageSize + 1;
    return Array.from({ length: pageSize }, (_, i) => {
      const lvlNum = start + i;
      if (lvlNum > totalCampaignLevels) return null;
      return getLevelData(lvlNum);
    }).filter(Boolean);
  }, [currentPage, totalCampaignLevels, getLevelData]);

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
    startLevel(nextLevelNumber);
  };

  const handleJumpToCurrent = () => {
    sound.playClick();
    const targetPage = Math.max(1, Math.ceil(highestUnlockedLevel / pageSize));
    setCurrentPage(targetPage);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalCampaignLevels) {
      sound.playClick();
      const targetPage = Math.ceil(parsed / pageSize);
      setCurrentPage(targetPage);
      setJumpInput('');
    } else {
      sound.playWrong();
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-8 select-none">
      <AppHeader subtitle="STAGE MAP" />

      <div className="px-5 pt-1 space-y-4">
        {/* Top Header Bar: Player XP progress, Stars, Hints & Emerald Light/Dark Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Player Level & XP Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 text-xs font-black tracking-wide shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current text-emerald-600 dark:text-emerald-400" />
              <span>LVL {playerLevelInfo.playerLevel}</span>
            </div>

            {/* Stars Pill */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-300 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{totalStars}</span>
            </div>

            {/* Hints Counter Pill */}
            <div 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-slate-950 dark:text-white text-xs font-black"
              title={`${hintsLeft} hints remaining (${levelsCompletedTowardsHint}/10 levels to next hint)`}
            >
              <Lightbulb className="w-3.5 h-3.5 fill-current text-emerald-600" />
              <span>{hintsLeft}</span>
            </div>
          </div>

          {/* Theme Selector: Apple Liquid Glass Light / Dark Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-emerald-100 dark:border-white/10 shadow-xs">
            <button
              onClick={() => { if (isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                !isDarkMode
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <Sun className="w-3 h-3 fill-current" />
              <span>Light</span>
            </button>

            <button
              onClick={() => { if (!isDarkMode) toggleTheme(); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              <Moon className="w-3 h-3 fill-current" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Player XP & Hint Progression Bar */}
        <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-white/10 shadow-xs space-y-2">
          {/* XP Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-600 fill-current" />
                <span>Level {playerLevelInfo.playerLevel} XP Progress</span>
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                {playerLevelInfo.xpInCurrentLevel} / {playerLevelInfo.xpNeededForNext} XP ({playerLevelInfo.progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${playerLevelInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Hint Milestone Tracker */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-black">
              <Lightbulb className="w-3 h-3 text-emerald-600" />
              <span>Next Hint Reward:</span>
            </span>
            <span className="text-emerald-800 dark:text-emerald-400 font-black">
              {levelsCompletedTowardsHint} / 10 levels completed ({10 - levelsCompletedTowardsHint} more to earn +1 Hint)
            </span>
          </div>
        </div>

        {/* Cloud Persistence Banner */}
        {user ? (
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-300 text-xs font-black">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-4 h-4 rounded-full border border-emerald-400" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <span>Cloud Saved: {user.displayName || 'Player'}</span>
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-1">
              ✓ Synced
            </span>
          </div>
        ) : (
          <div 
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:border-emerald-400 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save Progress to Cloud (Sign In with Google)</span>
            </div>
            <span className="text-[10px] font-black text-emerald-600">Connect</span>
          </div>
        )}

        {/* Hero Current Stage Banner */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40 cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black tracking-wider uppercase flex-wrap">
              <span>LEVEL {nextLevelNumber}</span>
              <span>•</span>
              <span>{nextLevelConfig.size}×{nextLevelConfig.size} TILES</span>
              <span>•</span>
              <span>D{calculateDifficulty(nextLevelNumber)}/10</span>
              <span>•</span>
              <span className="text-amber-200 font-mono">+{calculateLevelScore(nextLevelNumber)} pts</span>
              <span>•</span>
              <span className="text-teal-200 font-mono">+{calculateLevelXP(nextLevelNumber)} XP</span>
            </div>
            <h3 className="text-xl font-black tracking-tight leading-tight">
              Continue Level {nextLevelNumber}
            </h3>
            <p className="text-xs text-emerald-100 font-medium">
              Fixed clues provided • Deduce remaining {nextLevelConfig.size}×{nextLevelConfig.size} tiles
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black shadow-sm shrink-0 ml-2">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </motion.div>

        {/* Stage Map Header & Quick Jump Controls */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                Levels
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                {completedCount} / {totalCampaignLevels}
              </span>
            </div>

            <button
              onClick={handleJumpToCurrent}
              className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Current (Lvl {highestUnlockedLevel})</span>
            </button>
          </div>

          {/* Jump to level form */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                max={totalCampaignLevels}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder={`Jump to level (1–${totalCampaignLevels})...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-950 dark:text-white text-xs font-bold border border-slate-200 dark:border-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs cursor-pointer"
            >
              Go
            </button>
          </form>

          {/* Page Navigation Bar */}
          <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-100 dark:border-slate-800">
            <button
              onClick={() => {
                sound.playClick();
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <span className="text-xs font-black text-slate-950 dark:text-white">
              Page {currentPage} of {totalPages}
              <span className="text-slate-400 font-bold ml-1.5">
                (Levels {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCampaignLevels)})
              </span>
            </span>

            <button
              onClick={() => {
                sound.playClick();
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* LEVEL BOARD: Identical containers with same size!
              User requirements:
              - "where in this levels place it will say the number of the level and then it will say how many tiles size it was like 3x3 or 4x4 or 5x5 like that only and no more"
              - "and also in light mode i cant see the letters change that where the letters in light mode should be black"
              - "and also redesign the whole ui. to look greener rather than blue it was so good to look green !"
              - "and make shure identical containers must have same size"
          */}
          <div className="grid grid-cols-4 gap-2.5">
            {pageLevels.map((lvl) => {
              if (!lvl) return null;
              const isCurrent = lvl.levelNumber === nextLevelNumber;

              return (
                <motion.button
                  key={lvl.levelNumber}
                  whileTap={lvl.isUnlocked ? { scale: 0.93 } : undefined}
                  onClick={() => handleLevelClick(lvl.levelNumber, lvl.isUnlocked)}
                  className={`w-full aspect-square rounded-2xl border transition-all flex flex-col items-center justify-between p-2 relative cursor-pointer ${
                    !lvl.isUnlocked
                      ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 opacity-55 cursor-not-allowed text-slate-400'
                      : isCurrent
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/35 ring-2 ring-emerald-400'
                      : lvl.isCompleted
                      ? 'bg-white dark:bg-slate-800/90 text-slate-950 dark:text-white border-emerald-300 dark:border-emerald-800 shadow-xs hover:border-emerald-500'
                      : 'bg-white dark:bg-slate-800/90 text-slate-950 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-xs'
                  }`}
                >
                  {/* Status Indicator at top right */}
                  <div className="w-full flex items-center justify-end text-[10px] h-3.5">
                    {lvl.isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    ) : !lvl.isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  {/* Level Number: Crisp, deep bold black in light mode */}
                  <span
                    className={`text-xl sm:text-2xl font-black leading-none ${
                      isCurrent
                        ? 'text-white'
                        : lvl.isUnlocked
                        ? 'text-slate-950 dark:text-white'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {lvl.levelNumber}
                  </span>

                  {/* Tile Size: "3x3 or 4x4 or 5x5 like that only and no more" */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-tight py-0.5 px-1.5 rounded-md ${
                      isCurrent
                        ? 'bg-white/20 text-white'
                        : lvl.isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : lvl.isUnlocked
                        ? 'bg-slate-100 dark:bg-slate-700/60 text-slate-950 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {lvl.size}×{lvl.size}
                  </span>
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
          className="p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-950 dark:text-white">
                  {dailyChallengeInfo.title}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-300 text-[9px] font-black uppercase">
                  DAILY
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                Target Level {dailyChallengeInfo.targetLevel} • +{dailyChallengeInfo.scoreReward} pts & +{dailyChallengeInfo.xpReward} XP
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
