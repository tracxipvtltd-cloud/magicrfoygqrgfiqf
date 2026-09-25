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
  X
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
    timeElapsed,
    isPaused,
    togglePause,
    restartGame,
    quitGame,
    selectedMode,
    currentLevelNumber,
    isDailyChallenge
  } = useGame();

  const [confirmExit, setConfirmExit] = useState(false);

  // Format timer
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = Math.floor(timeElapsed % 60);
  const tenths = Math.floor((timeElapsed * 10) % 10);
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;

  const currentCell = selectedCell ? puzzle.grid[selectedCell.row][selectedCell.col] : null;
  const currentCellValue = currentCell ? currentCell.value : null;
  const isSelectedGiven = currentCell ? currentCell.isGiven : false;

  // Board total counts for each number
  const numberCounts: Record<number, number> = {};
  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const v = puzzle.grid[r][c].value;
      if (v !== null) {
        numberCounts[v] = (numberCounts[v] || 0) + 1;
      }
    }
  }

  // Keypad numbers list
  const keypadNumbers = Array.from({ length: puzzle.maxNumber }, (_, i) => i + 1);

  // Dynamic grid sizing based on matrix dimension
  const getCellSizeClass = () => {
    switch (puzzle.size) {
      case 3:
        return 'w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl';
      case 4:
        return 'w-13 h-13 sm:w-16 sm:h-16 text-lg sm:text-xl';
      case 5:
        return 'w-11 h-11 sm:w-13 sm:h-13 text-base sm:text-lg';
      case 6:
        return 'w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base';
      default:
        return 'w-11 h-11 sm:w-13 sm:h-13 text-base sm:text-lg';
    }
  };

  const cellClass = getCellSizeClass();

  const subTitle = isDailyChallenge
    ? `DAILY • ${puzzle.size}×${puzzle.size} (SUM ${targetSum})`
    : currentLevelNumber
    ? `STAGE ${currentLevelNumber} • ${puzzle.size}×${puzzle.size} (SUM ${targetSum})`
    : `${puzzle.size}×${puzzle.size} • SUM ${targetSum}`;

  return (
    <div className="flex-1 flex flex-col w-full pb-3 select-none relative">
      <AppHeader 
        subtitle={subTitle} 
        showBack 
        onBack={() => setConfirmExit(true)} 
      />

      <div className="px-3 pt-1 space-y-2 flex-1 flex flex-col justify-between">
        {/* Top Control Bar: Pause, Score Pill, Hearts, Timer */}
        <div className="flex items-center justify-between gap-2">
          {/* Pause Button */}
          <button
            onClick={togglePause}
            className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs flex items-center justify-center text-slate-800 dark:text-white active:scale-90 transition-all cursor-pointer"
            aria-label="Pause"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>

          {/* Central Score Pill */}
          <div className="flex-1 max-w-[190px] py-1 px-3 rounded-full bg-white/85 dark:bg-slate-800/85 backdrop-blur-xl border border-white/70 dark:border-white/10 shadow-xs flex items-center justify-between">
            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
              SCORE
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {score.toLocaleString()}
            </span>
            <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-sky-400 pl-1 border-l border-slate-200 dark:border-slate-700">
              {formattedTimer}
            </span>
          </div>

          {/* Hearts / Lives Display */}
          <div className="px-2.5 py-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-xs flex items-center gap-1">
            {selectedMode === 'practice' ? (
              <span className="text-xs font-black text-emerald-500">∞ Lives</span>
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

        {/* Target Sum & No-Repeat Rule Banner */}
        <GlassCard className="p-2 space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                {puzzle.size}×{puzzle.size} • 1–{puzzle.maxNumber}
              </span>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                Lines sum to <span className="font-black text-blue-600 dark:text-sky-400">{targetSum}</span> • <span className="text-orange-500 font-black">All Unique</span>
              </span>
            </div>

            {/* Streak indicator */}
            {streak > 1 && (
              <div className="flex items-center gap-0.5 text-[10px] font-black text-orange-500 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                <Flame className="w-3 h-3 fill-orange-500" />
                <span>{streak}x</span>
              </div>
            )}
          </div>

          {/* Diagonal sums display with duplicate warning */}
          <div className="flex items-center justify-between text-[10px] font-bold pt-0.5 border-t border-slate-100 dark:border-white/5">
            {/* Main Diagonal */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                diag1Sum === targetSum && isDiag1Complete
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : diag1Sum > targetSum
                  ? 'bg-red-50 dark:bg-red-950 text-red-600 border-red-300'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>↘ Main Diag:</span>
              <span className="font-black">
                {diag1Sum === targetSum && isDiag1Complete ? `✓ ${targetSum}` : `${diag1Sum}/${targetSum}`}
              </span>
            </div>

            {/* Anti Diagonal */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${
                diag2Sum === targetSum && isDiag2Complete
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                  : diag2Sum > targetSum
                  ? 'bg-red-50 dark:bg-red-950 text-red-600 border-red-300'
                  : 'bg-white/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>↙ Anti Diag:</span>
              <span className="font-black">
                {diag2Sum === targetSum && isDiag2Complete ? `✓ ${targetSum}` : `${diag2Sum}/${targetSum}`}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Duplicate Conflict Alert Banner */}
        <AnimatePresence>
          {conflictWarning && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-red-50 dark:bg-red-950/90 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-black shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
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

        {/* UPPER BOX: The Matrix Grid & Nonogram Clue Trackers */}
        <div className="w-full flex flex-col items-center justify-center my-auto">
          <div className="flex gap-1.5 items-start">
            {/* Main Cells Grid */}
            <div
              className="grid gap-1.5 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/90 border border-slate-300/70 dark:border-slate-800 shadow-sm"
              style={{
                gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.grid.map((row, r) =>
                row.map((cell, c) => {
                  const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                  const isSameRowOrCol = selectedCell && (selectedCell.row === r || selectedCell.col === c);
                  const isSameNumber = currentCellValue !== null && cell.value === currentCellValue;

                  let cellBg = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700';

                  if (cell.isDuplicate) {
                    // Red duplicate conflict highlight
                    cellBg = 'bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-300 border-red-500 ring-2 ring-red-400 font-extrabold animate-pulse';
                  } else if (cell.isGiven) {
                    cellBg = 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-black border-slate-300 dark:border-slate-600';
                  } else if (cell.value !== null) {
                    cellBg = cell.isError
                      ? 'bg-red-100 dark:bg-red-950/80 text-red-600 border-red-400'
                      : 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-sky-300 border-blue-300 dark:border-blue-700 font-extrabold';
                  }

                  // Nonogram crosshair ruler guide
                  if (isSameRowOrCol && !isSelected && !cell.isDuplicate) {
                    cellBg += ' bg-blue-50/50 dark:bg-blue-950/30';
                  }

                  if (isSameNumber && !isSelected && cell.value !== null && !cell.isDuplicate) {
                    cellBg += ' ring-2 ring-blue-400/80';
                  }

                  if (isSelected) {
                    cellBg += ' ring-3 ring-blue-600 dark:ring-sky-400 shadow-md scale-[1.04] z-10';
                  }

                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => selectCell(r, c)}
                      disabled={isPaused}
                      className={`${cellClass} rounded-xl border flex flex-col items-center justify-center relative transition-all duration-150 cursor-pointer ${cellBg}`}
                    >
                      {cell.value !== null ? (
                        <span className="font-black leading-none">{cell.value}</span>
                      ) : cell.notes && cell.notes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-0.5 text-[8px] font-bold text-slate-400 p-0.5 leading-none">
                          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                            <span key={n} className="w-2 h-2 flex items-center justify-center">
                              {cell.notes.includes(n) ? n : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}

                      {/* Small clue lock indicator */}
                      {cell.isGiven && (
                        <span className="absolute top-1 right-1 text-slate-400 dark:text-slate-500">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}

                      {/* Small duplicate warning dot */}
                      {cell.isDuplicate && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Row Sum & Duplicate Indicators on the Right */}
            <div className="flex flex-col gap-1.5 pt-1.5">
              {rowSums.map((sum, r) => {
                const hasDup = rowHasDuplicates[r];
                const complete = sum === targetSum && isRowComplete[r] && !hasDup;
                const overflow = sum > targetSum;

                let pillColor = 'bg-white/70 dark:bg-slate-800/70 text-slate-500 border-slate-200 dark:border-slate-700';
                if (hasDup) {
                  pillColor = 'bg-red-500 text-white border-red-400 shadow-xs animate-pulse';
                } else if (complete) {
                  pillColor = 'bg-emerald-500 text-white border-emerald-400 shadow-xs shadow-emerald-500/30';
                } else if (overflow) {
                  pillColor = 'bg-red-500 text-white border-red-400';
                }

                return (
                  <div
                    key={`row-${r}`}
                    className={`w-9 sm:w-11 rounded-xl border flex flex-col items-center justify-center text-[10px] font-black transition-all ${pillColor} ${
                      puzzle.size === 3 ? 'h-16 sm:h-20' : puzzle.size === 4 ? 'h-13 sm:h-16' : puzzle.size === 6 ? 'h-9 sm:h-11' : 'h-11 sm:h-13'
                    }`}
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

          {/* Column Sum & Duplicate Indicators Below the Grid */}
          <div className="flex gap-1.5 mt-1.5 pr-10 sm:pr-12">
            {colSums.map((sum, c) => {
              const hasDup = colHasDuplicates[c];
              const complete = sum === targetSum && isColComplete[c] && !hasDup;
              const overflow = sum > targetSum;

              let pillColor = 'bg-white/70 dark:bg-slate-800/70 text-slate-500 border-slate-200 dark:border-slate-700';
              if (hasDup) {
                pillColor = 'bg-red-500 text-white border-red-400 shadow-xs animate-pulse';
              } else if (complete) {
                pillColor = 'bg-emerald-500 text-white border-emerald-400 shadow-xs shadow-emerald-500/30';
              } else if (overflow) {
                pillColor = 'bg-red-500 text-white border-red-400';
              }

              return (
                <div
                  key={`col-${c}`}
                  className={`h-6 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all ${pillColor} ${
                    puzzle.size === 3 ? 'w-16 sm:w-20' : puzzle.size === 4 ? 'w-13 sm:w-16' : puzzle.size === 6 ? 'w-9 sm:w-11' : 'w-11 sm:w-13'
                  }`}
                  title={hasDup ? 'Duplicate numbers in this column!' : `Column ${c + 1} sum: ${sum}`}
                >
                  {hasDup ? 'DUP!' : complete ? `✓${targetSum}` : sum > 0 ? sum : `—`}
                </div>
              );
            })}
          </div>
        </div>

        {/* TAP INSTRUCTION BANNER: Selected Cell Guide */}
        <div className="px-1 text-center">
          {selectedCell ? (
            isSelectedGiven ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Pre-filled clue locked — Tap an empty cell above</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-[11px] font-black text-blue-600 dark:text-sky-300 border border-blue-200 dark:border-blue-800 animate-pulse">
                <span>📍 Row {selectedCell.row + 1}, Col {selectedCell.col + 1}</span>
                <span>→ Tap a unique number below</span>
              </div>
            )
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <span>👆 Tap an upper box in the grid, then tap a number below</span>
            </div>
          )}
        </div>

        {/* LOWER BOX: "NUMBER SET IN A SMALL BOX DOWN" */}
        <div className="p-2.5 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-lg space-y-2">
          {/* Header of the lower number set box */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              NUMBER SET DOCK
            </span>

            {/* Quick action buttons right inside the box */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={undoMove}
                disabled={!canUndo || isPaused}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>

              <button
                onClick={eraseCell}
                disabled={isPaused || !selectedCell || isSelectedGiven}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
              >
                <Delete className="w-3 h-3" />
                <span>Erase</span>
              </button>

              <button
                onClick={togglePencilMode}
                disabled={isPaused}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer ${
                  isPencilMode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Notes {isPencilMode ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={useHint}
                disabled={hintsLeft <= 0 || isPaused || !selectedCell || isSelectedGiven}
                className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-slate-800 text-[10px] font-black text-blue-600 dark:text-sky-400 border border-sky-200 dark:border-slate-700 flex items-center gap-1 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
              >
                <Lightbulb className="w-3 h-3 fill-current" />
                <span>Hint ({hintsLeft})</span>
              </button>
            </div>
          </div>

          {/* Number buttons grid inside the lower box */}
          <div 
            className="grid gap-1 max-h-[175px] sm:max-h-[195px] overflow-y-auto no-scrollbar p-0.5"
            style={{
              gridTemplateColumns: `repeat(${puzzle.size === 3 ? 5 : puzzle.size === 4 ? 8 : puzzle.size === 6 ? 6 : 5}, minmax(0, 1fr))`,
            }}
          >
            {keypadNumbers.map((num) => {
              const count = numberCounts[num] || 0;
              const isUsedElsewhere = selectedCell 
                ? puzzle.grid.some((r, rIdx) => r.some((c, cIdx) => (rIdx !== selectedCell.row || cIdx !== selectedCell.col) && c.value === num))
                : (count > 0);
              const isCurrentCellNumber = currentCellValue === num;

              return (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.90 }}
                  onClick={() => enterNumber(num)}
                  disabled={isPaused || !selectedCell || isSelectedGiven}
                  className={`py-1.5 sm:py-2 rounded-xl border transition-all flex flex-col items-center justify-center relative cursor-pointer disabled:opacity-40 ${
                    isCurrentCellNumber
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm ring-2 ring-blue-400/50'
                      : isUsedElsewhere
                      ? 'bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-slate-800'
                      : selectedCell && !isSelectedGiven
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200/90 dark:border-slate-700 hover:border-blue-500 shadow-xs active:bg-blue-50 dark:active:bg-slate-700'
                      : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title={isUsedElsewhere ? `Number ${num} already placed on board` : `Place ${num}`}
                >
                  <span className="text-sm sm:text-base font-black leading-tight">{num}</span>
                  <span className="text-[8px] font-bold leading-none mt-0.5">
                    {isCurrentCellNumber ? (
                      <span className="text-white font-black">Active</span>
                    ) : isUsedElsewhere ? (
                      <span className="text-slate-400 dark:text-slate-500 font-bold">Placed</span>
                    ) : (
                      <span className="text-blue-600 dark:text-sky-400 font-extrabold">Avail</span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
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
                Leave Puzzle?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your current unfinished puzzle will not be recorded in career stats.
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
