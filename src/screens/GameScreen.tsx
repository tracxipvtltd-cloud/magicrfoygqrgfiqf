import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pause, 
  Play, 
  Heart, 
  TrendingUp, 
  Flame, 
  Maximize2, 
  Minimize2, 
  Lightbulb, 
  Check, 
  RotateCcw, 
  Home, 
  X 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const GameScreen: React.FC = () => {
  const {
    matrix,
    targetNumber,
    currentTargetIndex,
    totalTargets,
    score,
    streakBonus,
    lives,
    maxLives,
    streak,
    hintsLeft,
    highlightedCell,
    isPaused,
    timeElapsed,
    lastClickedCell,
    solvedCells,
    handleCellTap,
    useHint,
    togglePause,
    restartGame,
    quitGame,
    selectedMode
  } = useGame();

  const [confirmExit, setConfirmExit] = useState(false);
  const [isGridZoomed, setIsGridZoomed] = useState(false);

  // Format timer as 00:18.4
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const tenths = Math.floor((timeElapsed * 10) % 10);
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;

  // Calculate timer progress bar
  const maxTimerSeconds = selectedMode === 'timed' ? 60 : 90;
  const timerPercent = Math.min(100, (timeElapsed / maxTimerSeconds) * 100);

  const getGridColsClass = () => {
    switch (matrix.size) {
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      case 6: return 'grid-cols-6';
      case 7: return 'grid-cols-7';
      case 8: return 'grid-cols-8';
      default: return 'grid-cols-5';
    }
  };

  const getCellFontSize = () => {
    switch (matrix.size) {
      case 3: return 'text-2xl sm:text-3xl font-black';
      case 4: return 'text-xl sm:text-2xl font-black';
      case 5: return 'text-lg sm:text-xl font-black';
      case 6: return 'text-sm sm:text-base font-black';
      case 7: return 'text-xs sm:text-sm font-extrabold';
      case 8: return 'text-[11px] sm:text-xs font-extrabold';
      default: return 'text-base font-black';
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-6 select-none relative">
      <AppHeader subtitle="PLAY" showBack onBack={() => setConfirmExit(true)} />

      <div className="px-4 pt-1 space-y-3.5 flex-1 flex flex-col justify-between">
        {/* Top Control Bar: Pause, Score Pill, Hearts */}
        <div className="flex items-center justify-between gap-2">
          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="w-11 h-11 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-center text-slate-800 dark:text-white active:scale-90 transition-all cursor-pointer"
            aria-label="Pause"
          >
            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
          </button>

          {/* Central Score Pill */}
          <div className="flex-1 max-w-[200px] py-1.5 px-3 rounded-full bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-xs flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                SCORE
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {score.toLocaleString()}
              </span>
            </div>
            {streakBonus > 0 ? (
              <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3 stroke-[3]" />
                <span>+{streakBonus} streak bonus</span>
              </div>
            ) : (
              <span className="text-[10px] font-bold text-slate-400">Hunt active number</span>
            )}
          </div>

          {/* Hearts / Lives Display */}
          <div className="px-3 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs flex items-center gap-1">
            {selectedMode === 'practice' ? (
              <span className="text-xs font-black text-emerald-500">∞ Lives</span>
            ) : (
              Array.from({ length: maxLives }).map((_, idx) => {
                const isAlive = idx < lives;
                return (
                  <Heart
                    key={idx}
                    className={`w-4 h-4 transition-all duration-200 ${
                      isAlive
                        ? 'text-red-500 fill-red-500 scale-100'
                        : 'text-slate-300 dark:text-slate-600 scale-90'
                    }`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Find Number Target Card */}
        <GlassCard className="p-4 text-center space-y-1 relative overflow-hidden">
          {/* Subtle blue accent glow behind target */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-xs font-bold px-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-[10px] font-black uppercase tracking-wider">
              FIND NUMBER
            </span>
            <span className="text-slate-400 text-[11px] font-bold">
              Target {currentTargetIndex + 1} of {totalTargets}
            </span>
          </div>

          {/* Huge prominent Target Number */}
          <motion.div
            key={targetNumber}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 450 }}
            className="py-1"
          >
            <span className="text-5xl sm:text-6xl font-black text-blue-600 dark:text-sky-400 tracking-tight drop-shadow-sm font-sans">
              {targetNumber}
            </span>
          </motion.div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-1.5">
            <span>👆 Tap cell with</span>
            <span className="font-black text-slate-800 dark:text-white">{targetNumber}</span>
            <span>in the grid</span>
          </p>
        </GlassCard>

        {/* Round Timer Bar */}
        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between text-[11px] font-black">
            <span className="text-slate-400 tracking-wider uppercase flex items-center gap-1">
              <span>⏱</span>
              <span>ROUND TIMER</span>
            </span>
            <span className="font-mono text-blue-600 dark:text-sky-400 text-xs">
              {formattedTimer}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150"
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        {/* Main Magic Matrix Grid */}
        <div className="w-full flex items-center justify-center my-auto py-1">
          <div
            className={`grid ${getGridColsClass()} gap-2 sm:gap-2.5 w-full max-w-[360px] aspect-square transition-all duration-200 ${
              isGridZoomed ? 'scale-105' : 'scale-100'
            }`}
          >
            {matrix.cells.map((row, r) =>
              row.map((val, c) => {
                const isTarget = val === targetNumber;
                const isSolved = solvedCells.has(val);
                const isHinted = highlightedCell === val;
                const isJustClicked = lastClickedCell?.r === r && lastClickedCell?.c === c;
                const wasWrong = isJustClicked && !lastClickedCell.correct;

                let cellClasses = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200/90 dark:border-slate-700 shadow-sm';

                if (isSolved) {
                  cellClasses = 'bg-emerald-400/90 dark:bg-emerald-600/90 text-slate-900 dark:text-white border-emerald-300 dark:border-emerald-500';
                } else if (wasWrong) {
                  cellClasses = 'bg-red-500 text-white border-red-400 animate-shake';
                } else if (isHinted) {
                  cellClasses = 'bg-sky-200 dark:bg-sky-900/80 text-blue-700 dark:text-sky-200 border-blue-500 ring-4 ring-blue-400/60 animate-hint';
                }

                return (
                  <motion.button
                    key={`${r}-${c}`}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCellTap(val, r, c)}
                    disabled={isPaused}
                    className={`rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center relative aspect-square transition-all duration-150 cursor-pointer select-none active:scale-95 ${cellClasses}`}
                  >
                    <span className={`${getCellFontSize()}`}>{val}</span>

                    {/* Checkmark icon for solved cell */}
                    {isSolved && (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-white flex items-center justify-center absolute bottom-1 right-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Hint badge if hint triggered */}
                    {isHinted && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Bar: Streak Pill, Zoom Button, Hint Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Streak pill */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-sky-100/80 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 text-blue-700 dark:text-sky-300 text-xs font-black shadow-xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{streak}× STREAK</span>
          </div>

          {/* Fullscreen / Zoom grid toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setIsGridZoomed(!isGridZoomed);
            }}
            className="w-11 h-11 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
            aria-label="Toggle Zoom"
          >
            {isGridZoomed ? (
              <Minimize2 className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Maximize2 className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>

          {/* Hint Button */}
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || isPaused}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 text-white font-black text-xs shadow-md shadow-blue-500/30 transition-all cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 fill-white" />
            <span>Hint {hintsLeft}/3</span>
          </button>
        </div>
      </div>

      {/* Pause Overlay Modal */}
      <AnimatePresence>
        {isPaused && (
          <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/40 dark:border-white/10 p-6 text-center shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Game Paused
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current score: {score.toLocaleString()} • Time: {formattedTimer}
              </p>

              <div className="space-y-2 pt-2">
                <GlassButton variant="primary" size="md" onClick={togglePause} className="w-full">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Game</span>
                </GlassButton>

                <GlassButton variant="secondary" size="md" onClick={restartGame} className="w-full">
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Round</span>
                </GlassButton>

                <GlassButton variant="ghost" size="md" onClick={quitGame} className="w-full text-slate-500">
                  <Home className="w-4 h-4" />
                  <span>Exit to Home</span>
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {confirmExit && (
          <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-white/40 dark:border-white/10 p-6 text-center shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Leave Current Match?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your current round progress will not be saved to your career statistics.
              </p>

              <div className="flex gap-2.5 pt-2">
                <GlassButton
                  variant="secondary"
                  size="md"
                  onClick={() => setConfirmExit(false)}
                  className="flex-1"
                >
                  Stay
                </GlassButton>
                <GlassButton
                  variant="danger"
                  size="md"
                  onClick={() => {
                    setConfirmExit(false);
                    quitGame();
                  }}
                  className="flex-1"
                >
                  Exit
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
