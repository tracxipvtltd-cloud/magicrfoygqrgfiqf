import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pause, 
  Play, 
  Heart, 
  RotateCcw, 
  Lightbulb, 
  Flame, 
  Delete, 
  Edit3, 
  Undo2, 
  Home,
  CheckCircle2,
  Lock,
  AlertTriangle,
  X,
  Skull,
  ShieldAlert,
  Sparkles,
  Award
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const GameScreen: React.FC = () => {
  const {
    puzzle,
    targetSum,
    selectedCell,
    selectCell,
    enterNumber,
    eraseCell,
    isPencilMode,
    togglePencilMode,
    undoMove,
    canUndo,
    useHint,
    hintsLeft,
    levelsCompletedTowardsHint,
    earnedHintToast,
    dismissHintToast,
    duplicateCells,
    rowHasDuplicates,
    colHasDuplicates,
    conflictWarning,
    clearConflictWarning,
    rowSums,
    colSums,
    diag1Sum,
    diag2Sum,
    isRowComplete,
    isColComplete,
    isDiag1Complete,
    isDiag2Complete,
    score,
    lives,
    maxLives,
    streak,
    movesCount,
    parMoves,
    timeElapsed,
    isPaused,
    togglePause,
    isGameOver,
    restartGame,
    restartLevel,
    reviveGame,
    quitGame,
    selectedMode,
    currentLevelNumber,
    isDailyChallenge,
    dailyChallengeInfo,
    currentLevelDifficulty,
    currentLevelBaseScore,
    currentLevelBaseXP
  } = useGame();

  const [confirmExit, setConfirmExit] = useState(false);
  const [hintInfoOpen, setHintInfoOpen] = useState(false);

  // Format timer mm:ss.t
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const tenths = Math.floor((timeElapsed * 10) % 10);
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;

  const currentCell = selectedCell ? puzzle.grid[selectedCell.row][selectedCell.col] : null;
  const currentCellValue = currentCell ? currentCell.value : null;
  const isSelectedGiven = currentCell ? currentCell.isGiven : false;

  // Track placed numbers across the board
  const placedNumbersSet = new Set<number>();
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const v = puzzle.grid[r][c].value;
      if (v !== null) {
        placedNumbersSet.add(v);
      }
    }
  }

  const allKeypadNumbers = Array.from({ length: puzzle.maxNumber }, (_, i) => i + 1);

  // USER REQUIREMENT:
  // "hey can you just remove the placed numbers just so that the person might not get confused when playing"
  // When a number is already placed on the board, REMOVE IT from the keypad dock so the player only sees remaining available numbers!
  const availableNumbers = allKeypadNumbers.filter((num) => !placedNumbersSet.has(num));

  // Dynamic cell dimension class matching symmetric containers
  const getCellDimensionClass = () => {
    switch (puzzle.size) {
      case 3:
        return 'w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl';
      case 4:
        return 'w-13 h-13 sm:w-16 sm:h-16 text-xl sm:text-2xl';
      case 5:
        return 'w-11 h-11 sm:w-13 sm:h-13 text-lg sm:text-xl';
      case 6:
        return 'w-9 h-9 sm:w-11 sm:h-11 text-base sm:text-lg';
      default:
        return 'w-11 h-11 sm:w-13 sm:h-13 text-lg sm:text-xl';
    }
  };

  const cellClass = getCellDimensionClass();

  const subTitle = isDailyChallenge
    ? `DAILY: ${dailyChallengeInfo.title.toUpperCase()} • ${puzzle.size}×${puzzle.size}`
    : currentLevelNumber
    ? `LEVEL ${currentLevelNumber} • ${puzzle.size}×${puzzle.size} TILES`
    : `${puzzle.size}×${puzzle.size} PUZZLE`;

  const handleHintClick = () => {
    if (hintsLeft <= 0) {
      sound.playWrong();
      setHintInfoOpen(true);
      return;
    }
    useHint();
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-3 select-none relative">
      <AppHeader 
        subtitle={subTitle} 
        showBack 
        onBack={() => setConfirmExit(true)} 
      />

      <div className="px-3 pt-1 space-y-2 flex-1 flex flex-col justify-between">
        {/* Top Control Bar: Pause, Score Pill, Lives, Timer */}
        <div className="flex items-center justify-between gap-2">
          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-emerald-100 dark:border-white/10 shadow-xs flex items-center justify-center text-slate-950 dark:text-white active:scale-90 transition-all cursor-pointer"
            aria-label="Pause"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-600" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>

          {/* Central Score & Moves Pill */}
          <div className="flex-1 max-w-[210px] py-1 px-3 rounded-full bg-white/95 dark:bg-slate-800/90 backdrop-blur-xl border border-emerald-100 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black text-slate-400 uppercase leading-none">
                SCORE
              </span>
              <span className="text-xs font-black text-slate-950 dark:text-white leading-tight">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col items-center px-1.5 border-x border-slate-200 dark:border-slate-700">
              <span className="text-[8px] font-black text-slate-400 uppercase leading-none">
                MOVES
              </span>
              <span className={`text-[11px] font-mono font-black leading-tight ${movesCount <= parMoves ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'}`}>
                {movesCount}/{parMoves}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[9px] font-black text-slate-400 uppercase leading-none">
                TIME
              </span>
              <span className="font-mono text-[11px] font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                {formattedTimer}
              </span>
            </div>
          </div>

          {/* Hearts / Lives Display */}
          <div className="px-2.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-emerald-100 dark:border-white/10 shadow-xs flex items-center gap-1">
            {selectedMode === 'practice' ? (
              <span className="text-xs font-black text-emerald-600">∞ Lives</span>
            ) : (
              Array.from({ length: maxLives }).map((_, idx) => {
                const isAlive = idx < lives;
                return (
                  <Heart
                    key={idx}
                    className={`w-3.5 h-3.5 transition-all duration-200 ${
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

        {/* Target Sum & Diagonals Info Banner */}
        <GlassCard className="p-2 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                {puzzle.size}×{puzzle.size} TILES
              </span>
              <span className="text-[11px] font-extrabold text-slate-950 dark:text-slate-100">
                Sum <span className="font-black text-emerald-700 dark:text-emerald-400">{targetSum}</span>
              </span>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                • D{currentLevelDifficulty}/10
              </span>
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                +{currentLevelBaseScore} pts
              </span>
              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400">
                +{currentLevelBaseXP} XP
              </span>
            </div>

            {/* Streak indicator */}
            {streak > 1 && (
              <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-950 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{streak}x</span>
              </div>
            )}
          </div>

          {/* Diagonals with identical container sizes */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-black pt-1 border-t border-emerald-50 dark:border-white/5">
            {/* Main Diagonal */}
            <div
              className={`h-6 flex items-center justify-between px-2.5 rounded-lg border transition-all ${
                diag1Sum === targetSum && isDiag1Complete
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : diag1Sum > targetSum
                  ? 'bg-red-500 text-white border-red-400'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>↘ Main Diag</span>
              <span className="font-mono">
                {diag1Sum === targetSum && isDiag1Complete ? `✓ ${targetSum}` : `${diag1Sum}/${targetSum}`}
              </span>
            </div>

            {/* Anti Diagonal */}
            <div
              className={`h-6 flex items-center justify-between px-2.5 rounded-lg border transition-all ${
                diag2Sum === targetSum && isDiag2Complete
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : diag2Sum > targetSum
                  ? 'bg-red-500 text-white border-red-400'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>↙ Anti Diag</span>
              <span className="font-mono">
                {diag2Sum === targetSum && isDiag2Complete ? `✓ ${targetSum}` : `${diag2Sum}/${targetSum}`}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Duplicate Conflict Alert Banner */}
        <AnimatePresence>
          {conflictWarning && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-red-50 dark:bg-red-950/90 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-black shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{conflictWarning}</span>
              </div>
              <button
                onClick={clearConflictWarning}
                className="p-1 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint Earned Toast Milestone */}
        <AnimatePresence>
          {earnedHintToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-600/30 border border-emerald-400/40"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 fill-current text-amber-300" />
                <span>🎉 10 Levels Milestone! +1 Hint Earned!</span>
              </div>
              <button
                onClick={dismissHintToast}
                className="p-1 rounded-lg hover:bg-white/20 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPPER BOX: The Matrix Grid & Identical Sum Indicators */}
        <div className="w-full flex flex-col items-center justify-center my-auto">
          <div className="flex gap-1.5 items-start">
            {/* Main Cells Grid */}
            <div
              className="grid gap-1.5 p-1.5 rounded-2xl bg-emerald-950/10 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-slate-800 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.grid.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const isSameRowOrCol = selectedCell && (selectedCell.row === r || selectedCell.col === c);
                  const isSameNumber = currentCellValue !== null && cell.value === currentCellValue;

                  let cellBg = 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-slate-200 dark:border-slate-700';

                  if (cell.isDuplicate) {
                    cellBg = 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-300 border-red-500 ring-2 ring-red-400 font-black animate-pulse';
                  } else if (cell.isGiven) {
                    // Pre-filled fixed clue: bold dark black number with clear locked styling
                    cellBg = 'bg-emerald-50/90 dark:bg-emerald-950/50 text-slate-950 dark:text-emerald-200 font-black border-emerald-300 dark:border-emerald-800 shadow-xs';
                  } else if (cell.value !== null) {
                    cellBg = cell.isError
                      ? 'bg-red-100 dark:bg-red-950/80 text-red-600 border-red-400 font-black'
                      : 'bg-emerald-500 text-white border-emerald-400 font-black shadow-xs';
                  }

                  // Crosshair guide
                  if (isSameRowOrCol && !isSelected && !cell.isDuplicate) {
                    cellBg += ' ring-1 ring-emerald-300/40 dark:ring-emerald-800/40';
                  }

                  if (isSameNumber && !isSelected && cell.value !== null && !cell.isDuplicate) {
                    cellBg += ' ring-2 ring-emerald-500';
                  }

                  if (isSelected) {
                    cellBg += ' ring-3 ring-emerald-600 dark:ring-emerald-400 shadow-md scale-[1.04] z-10';
                  }

                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => selectCell(r, c)}
                      disabled={isPaused || isGameOver}
                      className={`${cellClass} rounded-xl border flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${cellBg}`}
                    >
                      {cell.value !== null ? (
                        <span className="font-black leading-none">{cell.value}</span>
                      ) : cell.notes && cell.notes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-0.5 text-[8px] font-black text-slate-400 p-0.5 leading-none">
                          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                            <span key={n} className="w-2 h-2 flex items-center justify-center">
                              {cell.notes.includes(n) ? n : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}

                      {/* Clue lock indicator for fixed numbers */}
                      {cell.isGiven && (
                        <span className="absolute top-1 right-1 text-emerald-700 dark:text-emerald-400 opacity-70">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Row Sum Indicators on the Right: IDENTICAL SIZES matching grid cells */}
            <div className="flex flex-col gap-1.5 pt-1.5">
              {rowSums.map((sum, r) => {
                const hasDup = rowHasDuplicates[r];
                const complete = sum === targetSum && isRowComplete[r] && !hasDup;
                const overflow = sum > targetSum;

                let pillColor = 'bg-white/80 dark:bg-slate-800/80 text-slate-950 dark:text-slate-200 border-slate-200 dark:border-slate-700';
                if (hasDup) {
                  pillColor = 'bg-red-500 text-white border-red-400 shadow-xs animate-pulse';
                } else if (complete) {
                  pillColor = 'bg-emerald-500 text-white border-emerald-400 shadow-xs shadow-emerald-500/30';
                } else if (overflow) {
                  pillColor = 'bg-red-500 text-white border-red-400';
                }

                // Match exact height of row cells
                const heightClass = puzzle.size === 3 
                  ? 'h-16 sm:h-20' 
                  : puzzle.size === 4 
                  ? 'h-13 sm:h-16' 
                  : puzzle.size === 6 
                  ? 'h-9 sm:h-11' 
                  : 'h-11 sm:h-13';

                return (
                  <div
                    key={`row-${r}`}
                    className={`w-9 sm:w-11 ${heightClass} rounded-xl border flex flex-col items-center justify-center text-[10px] font-black transition-all ${pillColor}`}
                    title={hasDup ? 'Duplicate numbers in this row!' : `Row ${r + 1} sum: ${sum}`}
                  >
                    {hasDup ? (
                      <span className="text-[9px] leading-tight font-black">DUP!</span>
                    ) : complete ? (
                      `✓${targetSum}`
                    ) : sum > 0 ? (
                      sum
                    ) : (
                      `—`
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column Sum Indicators Below Grid: IDENTICAL SIZES matching grid cells */}
          <div className="flex gap-1.5 mt-1.5 pr-10 sm:pr-12">
            {colSums.map((sum, c) => {
              const hasDup = colHasDuplicates[c];
              const complete = sum === targetSum && isColComplete[c] && !hasDup;
              const overflow = sum > targetSum;

              let pillColor = 'bg-white/80 dark:bg-slate-800/80 text-slate-950 dark:text-slate-200 border-slate-200 dark:border-slate-700';
              if (hasDup) {
                pillColor = 'bg-red-500 text-white border-red-400 shadow-xs animate-pulse';
              } else if (complete) {
                pillColor = 'bg-emerald-500 text-white border-emerald-400 shadow-xs shadow-emerald-500/30';
              } else if (overflow) {
                pillColor = 'bg-red-500 text-white border-red-400';
              }

              // Match exact width of column cells
              const widthClass = puzzle.size === 3 
                ? 'w-16 sm:w-20' 
                : puzzle.size === 4 
                ? 'w-13 sm:w-16' 
                : puzzle.size === 6 
                ? 'w-9 sm:w-11' 
                : 'w-11 sm:w-13';

              return (
                <div
                  key={`col-${c}`}
                  className={`h-6 ${widthClass} rounded-lg border flex items-center justify-center text-[10px] font-black transition-all ${pillColor}`}
                  title={hasDup ? 'Duplicate numbers in this column!' : `Column ${c + 1} sum: ${sum}`}
                >
                  {hasDup ? 'DUP!' : complete ? `✓${targetSum}` : sum > 0 ? sum : `—`}
                </div>
              );
            })}
          </div>
        </div>

        {/* LOWER BOX: "NUMBER SET DOCK" */}
        {/* USER REQUIREMENT:
            "hey can you just remove the placed numbers just so that the person might not get confused when playing"
            Placed numbers are completely removed from this dock!
        */}
        <div className="p-2.5 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-100 dark:border-white/10 shadow-lg space-y-2">
          {/* Header of the lower number set box */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                AVAILABLE NUMBERS
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 text-[9px] font-black">
                {availableNumbers.length} / {puzzle.maxNumber}
              </span>
            </div>

            {/* Quick action buttons right inside the box */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={undoMove}
                disabled={!canUndo || isPaused || isGameOver}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-900 dark:text-slate-200 flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>

              <button
                onClick={eraseCell}
                disabled={isPaused || isGameOver || !selectedCell || isSelectedGiven}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-900 dark:text-slate-200 flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
              >
                <Delete className="w-3 h-3" />
                <span>Erase</span>
              </button>

              <button
                onClick={togglePencilMode}
                disabled={isPaused || isGameOver}
                className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                  isPencilMode
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Notes {isPencilMode ? 'ON' : 'OFF'}</span>
              </button>

              {/* USER REQUIREMENT:
                  "the total number of hints must be only 3 and if needed more they need to complete 10 more levels to get one more hint as an option"
              */}
              <button
                onClick={handleHintClick}
                disabled={isPaused || isGameOver || !selectedCell || isSelectedGiven}
                className={`px-2 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                  hintsLeft > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
                title={hintsLeft > 0 ? `${hintsLeft} hints remaining` : `Need 10 levels for next hint (${levelsCompletedTowardsHint}/10)`}
              >
                <Lightbulb className={`w-3 h-3 fill-current ${hintsLeft > 0 ? 'text-emerald-600' : 'text-amber-500'}`} />
                <span>Hint ({hintsLeft})</span>
              </button>
            </div>
          </div>

          {/* Number buttons grid inside the lower box:
              ONLY available (unplaced) numbers are shown!
          */}
          {availableNumbers.length > 0 ? (
            <div 
              className="grid gap-1.5 max-h-[175px] sm:max-h-[195px] overflow-y-auto no-scrollbar p-0.5"
              style={{
                gridTemplateColumns: `repeat(${availableNumbers.length <= 5 ? availableNumbers.length : 5}, minmax(0, 1fr))`,
              }}
            >
              {availableNumbers.map((num) => {
                const isCurrentCellNumber = currentCellValue === num;

                return (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.90 }}
                    onClick={() => enterNumber(num)}
                    disabled={isPaused || isGameOver || !selectedCell || isSelectedGiven}
                    className={`py-2.5 sm:py-3 rounded-xl border transition-all flex items-center justify-center relative cursor-pointer disabled:opacity-40 ${
                      isCurrentCellNumber
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm ring-2 ring-emerald-400'
                        : selectedCell && !isSelectedGiven
                        ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-xs active:bg-emerald-50 dark:active:bg-slate-700'
                        : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                    title={`Place ${num}`}
                  >
                    <span className="text-lg sm:text-xl font-black leading-none">{num}</span>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="py-4 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All {puzzle.maxNumber} numbers placed!</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                Check row, column and diagonal sums to ensure all targets equal {targetSum}!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Zero Hints Milestone Info Modal */}
      <AnimatePresence>
        {hintInfoOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-900 p-5 text-center shadow-2xl space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-500 border border-amber-300 dark:border-amber-800 flex items-center justify-center mx-auto shadow-sm">
                <Lightbulb className="w-6 h-6 fill-current" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  0 Hints Remaining
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-1">
                  You start with 3 hints. To earn +1 extra hint, complete 10 levels!
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-black text-amber-950 dark:text-amber-300">
                  <span>Hint Progress</span>
                  <span>{levelsCompletedTowardsHint} / 10 Levels</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(levelsCompletedTowardsHint / 10) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-bold text-center">
                  Complete {10 - levelsCompletedTowardsHint} more levels to unlock your next hint!
                </p>
              </div>

              <GlassButton variant="primary" size="md" onClick={() => setHintInfoOpen(false)} className="w-full">
                Got It
              </GlassButton>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GAME OVER / OUT OF LIVES MODAL */}
      <AnimatePresence>
        {isGameOver && (
          <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 select-none">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="w-full max-w-xs rounded-3xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900 p-6 text-center shadow-2xl space-y-4"
            >
              {/* Defeat Icon */}
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 border-2 border-red-200 dark:border-red-800 flex items-center justify-center mx-auto shadow-md">
                <Skull className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  Out of Lives!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-1">
                  You made 3 mistakes on Level {currentLevelNumber || 1} ({puzzle.size}×{puzzle.size}).
                </p>
                <p className="text-[11px] text-red-500 font-extrabold mt-0.5">
                  Level not passed. Try again to advance!
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <GlassButton variant="primary" size="md" onClick={restartLevel} className="w-full">
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Level</span>
                </GlassButton>

                <GlassButton variant="secondary" size="md" onClick={reviveGame} className="w-full">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Second Chance (+2 Lives)</span>
                </GlassButton>

                <button
                  onClick={quitGame}
                  className="w-full py-2.5 text-center text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Back to Levels
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pause Overlay Modal */}
      <AnimatePresence>
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-white/10 p-6 text-center shadow-2xl space-y-4"
            >
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Game Paused
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Target: {targetSum} ({puzzle.size}×{puzzle.size}) • Score: {score.toLocaleString()}
              </p>

              <div className="space-y-2 pt-2">
                <GlassButton variant="primary" size="md" onClick={togglePause} className="w-full">
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Game</span>
                </GlassButton>

                <GlassButton variant="secondary" size="md" onClick={restartGame} className="w-full">
                  <RotateCcw className="w-4 h-4" />
                  <span>Restart Puzzle</span>
                </GlassButton>

                <button
                  onClick={quitGame}
                  className="w-full py-2.5 text-center text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Exit to Home
                </button>
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
              className="w-full max-w-xs rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-white/10 p-6 text-center shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                Leave Puzzle?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Your current unfinished puzzle progress will not be saved.
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
                  Leave
                </GlassButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
