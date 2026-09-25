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
  ArrowRight 
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
  } = useGame();

  const [copiedShare, setCopiedShare] = useState(false);

  if (!lastResult) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-bold text-slate-500">No puzzle summary available.</p>
        <GlassButton variant="primary" size="md" onClick={() => setCurrentScreen('home')} className="mt-4">
          Return Home
        </GlassButton>
      </div>
    );
  }

  const {
    score,
    accuracy,
    correctAnswers,
    wrongAnswers,
    bestStreak,
    timeSeconds,
    speedBonus,
    isNewBest,
    matrixSize,
    targetSum,
    mode,
    difficulty,
    solvedGrid,
  } = lastResult;

  const handleShare = () => {
    sound.playClick();
    const text = `🎯 I just solved the ${matrixSize}×${matrixSize} Sum ${targetSum} matrix puzzle with ${score.toLocaleString()} points in ${timeSeconds}s! Can you match my score?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-8">
      <AppHeader subtitle="ROUND COMPLETE" showBack onBack={() => setCurrentScreen('home')} />

      <div className="px-5 pt-1 space-y-4">
        {/* Celebration Trophy Badge */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-2">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 350 }}
              className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/40 border-2 border-white dark:border-slate-800"
            >
              <Trophy className="w-8 h-8 fill-white/20 stroke-[2.2]" />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Target {targetSum} Complete!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
            {matrixSize}×{matrixSize} {difficulty.toUpperCase()} • All Lines Equal {targetSum}
          </p>
        </div>

        {/* Total Score & New Best Badge */}
        <div className="flex flex-col items-center">
          {isNewBest && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black tracking-wider uppercase mb-1.5 shadow-xs"
            >
              <Sparkles className="w-3 h-3 fill-current" />
              <span>NEW PERSONAL BEST!</span>
            </motion.div>
          )}

          <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
            TOTAL SCORE
          </span>
          <span className="text-4xl font-black text-blue-600 dark:text-sky-400 tracking-tight font-sans">
            {score.toLocaleString()}
          </span>
        </div>

        {/* 4 Performance Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Accuracy</div>
              <div className="text-base font-black text-slate-800 dark:text-white leading-tight">
                {accuracy.toFixed(1)}%
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                {correctAnswers} Correct Placements
              </span>
            </div>
          </GlassCard>

          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Time</div>
              <div className="text-base font-black text-slate-800 dark:text-white leading-tight">
                {timeSeconds}s
              </div>
              <span className="text-[10px] font-medium text-slate-400">Speed Solve</span>
            </div>
          </GlassCard>

          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Best Streak</div>
              <div className="text-base font-black text-slate-800 dark:text-white leading-tight">
                {bestStreak}×
              </div>
              <span className="text-[10px] font-medium text-slate-400">Combo Bonus</span>
            </div>
          </GlassCard>

          <GlassCard className="p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Speed Bonus</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                +{speedBonus} pts
              </div>
              <span className="text-[10px] font-medium text-slate-400">Bonus XP</span>
            </div>
          </GlassCard>
        </div>

        {/* Solved Grid Parity Proof */}
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
              <span>⊞ Solved Matrix Proof</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>ALL LINES = {targetSum}</span>
            </div>
          </div>

          <div
            className="grid gap-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 max-w-[260px] mx-auto w-full items-center justify-center"
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
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-around text-[10px] font-black text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
            <span>Rows: Σ = {targetSum}</span>
            <span>•</span>
            <span>Cols: Σ = {targetSum}</span>
            <span>•</span>
            <span>Diagonals: Σ = {targetSum}</span>
          </div>
        </GlassCard>

        {/* Primary CTA: Play Next Puzzle */}
        <div className="space-y-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sound.playClick();
              startNewGame(matrixSize, targetSum, difficulty, mode);
            }}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wider shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 border border-blue-400/40 cursor-pointer"
          >
            <span>PLAY NEXT PUZZLE (TARGET {targetSum})</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>

          <div className="flex gap-2">
            <GlassButton
              variant="glass"
              size="md"
              onClick={() => {
                sound.playClick();
                startNewGame(matrixSize, targetSum, difficulty, mode);
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
            className="w-full py-2.5 text-center text-xs font-black text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
