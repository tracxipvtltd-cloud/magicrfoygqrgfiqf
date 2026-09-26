import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Clock, 
  Flame, 
  Zap, 
  RotateCcw, 
  Share2, 
  Home, 
  ArrowRight,
  Star,
  Award
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const ResultScreen: React.FC = () => {
  const { 
    lastResult, 
    setCurrentScreen, 
    startNewGame, 
    startLevel,
    currentLevelNumber,
    totalCampaignLevels,
    movesCount,
    parMoves,
    completedLevelsMap,
    playerLevelInfo,
    getPlayerLevelInfo,
    userProfile
  } = useGame();

  const [copiedShare, setCopiedShare] = useState(false);

  if (!lastResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-black text-slate-950 dark:text-slate-200">No puzzle summary available.</p>
        <GlassButton variant="primary" size="md" onClick={() => setCurrentScreen('home')} className="mt-4">
          Return Home
        </GlassButton>
      </div>
    );
  }

  const {
    score,
    baseScore = 0,
    placementScore = 0,
    accuracy,
    correctAnswers,
    wrongAnswers,
    bestStreak,
    timeSeconds,
    speedBonus,
    baseXP = 0,
    speedXP = 0,
    xpEarned,
    isNewBest,
    matrixSize,
    targetSum,
    mode,
    difficulty,
    levelNumber,
    levelDifficulty,
    movesCount: resultMovesCount,
    parMoves: resultParMoves,
    starsEarned: resultStarsEarned,
    previousPlayerXP,
    newPlayerXP,
    previousPlayerLevel,
    newPlayerLevel,
    didLevelUp,
    solvedGrid,
  } = lastResult;

  const currentParMoves = resultParMoves || parMoves;
  const currentMoves = resultMovesCount !== undefined ? resultMovesCount : movesCount;

  // Compute stars based on level completion
  const starsEarned = resultStarsEarned !== undefined
    ? resultStarsEarned
    : currentLevelNumber && completedLevelsMap[currentLevelNumber]
    ? completedLevelsMap[currentLevelNumber].stars
    : wrongAnswers === 0 && currentMoves <= currentParMoves
    ? 3
    : wrongAnswers <= 2 && currentMoves <= currentParMoves * 1.25
    ? 2
    : 1;

  const effectivePlayerLevel = newPlayerLevel || (playerLevelInfo ? playerLevelInfo.playerLevel : 1);
  const resolvedLevelInfo = getPlayerLevelInfo(newPlayerXP !== undefined ? newPlayerXP : (userProfile.xp || 0));

  const handleShare = () => {
    sound.playClick();
    const text = `🎯 I just solved the ${matrixSize}×${matrixSize} Sum ${targetSum} matrix puzzle with ${score.toLocaleString()} points (${starsEarned} Stars ⭐) in ${timeSeconds}s! Can you match my score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const nextLevelToPlay = currentLevelNumber 
    ? Math.min(totalCampaignLevels, currentLevelNumber + 1)
    : 1;

  return (
    <div className="flex-1 flex flex-col w-full pb-8 select-none">
      <AppHeader subtitle="ROUND COMPLETE" showBack onBack={() => setCurrentScreen('home')} />

      <div className="px-5 pt-1 space-y-4">
        {/* Celebration Trophy & Star Rating */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 350 }}
              className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 border-2 border-white dark:border-slate-800"
            >
              <Trophy className="w-8 h-8 fill-white/20 stroke-[2.2]" />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* Stars display */}
          <div className="flex items-center gap-1.5 my-1">
            {[1, 2, 3].map((starIdx) => (
              <motion.div
                key={starIdx}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15 * starIdx, type: 'spring' }}
              >
                <Star
                  className={`w-6 h-6 transition-all ${
                    starIdx <= starsEarned
                      ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Target {targetSum} Complete!
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">
            {currentLevelNumber ? `Level ${currentLevelNumber} • ` : ''}{matrixSize}×{matrixSize} Tiles • All Lines Sum to {targetSum}
          </p>
        </div>

        {/* Total Score & XP Reward */}
        <div className="flex flex-col items-center">
          {didLevelUp && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-white text-xs font-black tracking-wider uppercase mb-1.5 shadow-md shadow-amber-500/30 animate-bounce"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>LEVEL UP! PLAYER LEVEL {effectivePlayerLevel}</span>
            </motion.div>
          )}

          {isNewBest && !didLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black tracking-wider uppercase mb-1 shadow-xs"
            >
              <Sparkles className="w-3 h-3 fill-current" />
              <span>NEW PERSONAL BEST</span>
            </motion.div>
          )}

          <div className="text-4xl font-black text-slate-950 dark:text-white tracking-tight leading-none mt-1">
            {score.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              TOTAL SCORE
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
              <Zap className="w-3 h-3 fill-current text-emerald-600" />
              <span>+{xpEarned} XP</span>
            </span>
          </div>
        </div>

        {/* Level Progression & Score Breakdown Card */}
        <GlassCard className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-950 dark:text-white">
                Progression & Scoring Schema
              </span>
              {levelDifficulty && (
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 text-[9px] font-black">
                  Diff D{levelDifficulty}/10
                </span>
              )}
            </div>
            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
              Level {levelNumber || currentLevelNumber || 1}
            </span>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* Score Breakdown */}
            <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Score Breakdown</div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold">
                <span>Base Level:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">+{baseScore}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold">
                <span>Placements:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">+{placementScore}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold">
                <span>Speed Bonus:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">+{speedBonus}</span>
              </div>
              <div className="flex justify-between font-black text-slate-950 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total:</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">{score.toLocaleString()}</span>
              </div>
            </div>

            {/* XP Breakdown */}
            <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">XP Breakdown</div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold">
                <span>Base Level XP:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">+{baseXP}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-bold">
                <span>Speed XP:</span>
                <span className="font-mono text-teal-600 dark:text-teal-400">+{speedXP}</span>
              </div>
              <div className="flex justify-between font-black text-slate-950 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total XP:</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">+{xpEarned}</span>
              </div>
            </div>
          </div>

          {/* Player Level Progress Bar */}
          <div className="pt-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-600 fill-current" />
                <span>Player Level {effectivePlayerLevel} Progress</span>
              </span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 text-[10px]">
                {resolvedLevelInfo.xpInCurrentLevel} / {resolvedLevelInfo.xpNeededForNext} XP ({resolvedLevelInfo.progressPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${resolvedLevelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </GlassCard>

        {/* 2x2 Stats Summary Grid (Identical size cards) */}
        <div className="grid grid-cols-2 gap-2.5">
          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase">Clear Time</div>
              <div className="text-base font-black text-slate-950 dark:text-white leading-tight">
                {timeSeconds}s
              </div>
              <span className="text-[10px] font-bold text-slate-500">Speed</span>
            </div>
          </GlassCard>

          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase">Accuracy</div>
              <div className="text-base font-black text-slate-950 dark:text-white leading-tight">
                {accuracy}%
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {correctAnswers} Right • {wrongAnswers} Mistakes
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase">Best Streak</div>
              <div className="text-base font-black text-slate-950 dark:text-white leading-tight">
                {bestStreak}×
              </div>
              <span className="text-[10px] font-bold text-slate-500">Combo Bonus</span>
            </div>
          </GlassCard>

          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase">Par Moves</div>
              <div className="text-base font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                {movesCount} / {parMoves}
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {movesCount <= parMoves ? '⭐ Under Par' : 'Standard'}
              </span>
            </div>
          </GlassCard>
        </div>

        {/* Solved Grid Proof */}
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-950 dark:text-white">
              <span>⊞ Solved Matrix Proof</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>ALL LINES = {targetSum}</span>
            </div>
          </div>

          <div
            className="grid gap-1.5 p-2 rounded-2xl bg-emerald-950/5 dark:bg-slate-800/50 border border-emerald-200/80 dark:border-slate-700/80 max-w-[260px] mx-auto w-full items-center justify-center"
            style={{
              gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))`,
            }}
          >
            {solvedGrid.map((row, r) =>
              row.map((val, c) => {
                const isDiag = r === c || r + c === matrixSize - 1;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      isDiag
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* Primary CTA: Advance to Next Level (Works up to 1500+ levels!) */}
        <div className="space-y-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sound.playClick();
              if (currentLevelNumber) {
                startLevel(nextLevelToPlay);
              } else {
                startNewGame(matrixSize, targetSum, difficulty, mode);
              }
            }}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wider shadow-lg shadow-emerald-600/35 flex items-center justify-center gap-2 border border-emerald-400/40 cursor-pointer"
          >
            <span>
              {currentLevelNumber 
                ? `ADVANCE TO LEVEL ${nextLevelToPlay}` 
                : `PLAY NEXT PUZZLE (TARGET ${targetSum})`}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>

          <div className="flex gap-2">
            <GlassButton
              variant="glass"
              size="md"
              onClick={() => {
                sound.playClick();
                if (currentLevelNumber) {
                  startLevel(currentLevelNumber);
                } else {
                  startNewGame(matrixSize, targetSum, difficulty, mode);
                }
              }}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </GlassButton>

            <GlassButton
              variant="glass"
              size="md"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
            </GlassButton>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setCurrentScreen('home');
            }}
            className="w-full py-2.5 text-center text-xs font-black text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Levels</span>
          </button>
        </div>
      </div>
    </div>
  );
};
