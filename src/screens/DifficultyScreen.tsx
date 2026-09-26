import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Clock, GraduationCap, Lightbulb, ArrowRight, Grid } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';
import { MatrixSize, GameMode, DifficultyLevel } from '../types';

interface TargetOption {
  targetSum: number;
  size: MatrixSize;
  title: string;
  orderLabel: string;
  description: string;
  badge?: string;
  isRecommended?: boolean;
}

const TARGET_OPTIONS: TargetOption[] = [
  {
    targetSum: 15,
    size: 3,
    title: '3×3 Matrix — Target 15',
    orderLabel: '3×3 (1–9 • Target 15)',
    description: 'Ancient Lo Shu starter. 9 unique numbers (1–9) summing to 15.',
    badge: 'STARTER',
    isRecommended: true,
  },
  {
    targetSum: 34,
    size: 4,
    title: '4×4 Matrix — Target 34',
    orderLabel: '4×4 (1–16 • Target 34)',
    description: 'Classic Dürer matrix. 16 unique numbers (1–16) summing to 34.',
    badge: 'POPULAR',
  },
  {
    targetSum: 65,
    size: 5,
    title: '5×5 Matrix — Target 65',
    orderLabel: '5×5 (1–25 • Target 65)',
    description: 'Flagship magic matrix. 25 unique numbers (1–25) summing to 65 across all lines.',
    badge: 'CHALLENGE',
  },
  {
    targetSum: 111,
    size: 6,
    title: '6×6 Matrix — Target 111',
    orderLabel: '6×6 (1–36 • Target 111)',
    description: 'Grand master matrix. 36 unique numbers (1–36) summing to 111.',
    badge: 'MASTER',
  },
];

export const DifficultyScreen: React.FC = () => {
  const { 
    selectedSize, 
    setSelectedSize, 
    targetSum,
    setTargetSum,
    selectedMode, 
    setSelectedMode, 
    difficulty,
    setDifficulty,
    startNewGame, 
    setCurrentScreen 
  } = useGame();

  const handleTargetSelect = (opt: TargetOption) => {
    sound.playClick();
    setTargetSum(opt.targetSum);
    setSelectedSize(opt.size);
  };

  const handleDifficultySelect = (diff: DifficultyLevel) => {
    sound.playClick();
    setDifficulty(diff);
  };

  const handleModeChange = (mode: GameMode) => {
    sound.playClick();
    setSelectedMode(mode);
  };

  const handleStart = () => {
    sound.playClick();
    startNewGame(selectedSize, targetSum, difficulty, selectedMode);
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-8 select-none">
      <AppHeader subtitle="CUSTOM PLAY" showBack onBack={() => setCurrentScreen('home')} />

      <div className="px-5 pt-1 space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
            Custom Puzzle
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5 leading-relaxed">
            All lines sum to target • Clues provided • Numbers never repeat
          </p>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => handleModeChange('classic')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
              selectedMode === 'classic'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${selectedMode === 'classic' ? 'fill-white' : ''}`} />
            <span>Classic (3 Lives)</span>
          </button>

          <button
            onClick={() => handleModeChange('practice')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
              selectedMode === 'practice'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Practice (Zen Mode)</span>
          </button>
        </div>

        {/* Target & Grid Options */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
            Choose Board Size
          </span>

          <div className="space-y-2.5">
            {TARGET_OPTIONS.map((opt) => {
              const isSelected = opt.targetSum === targetSum && opt.size === selectedSize;

              return (
                <div key={`${opt.size}-${opt.targetSum}`} className="relative">
                  {opt.badge && (
                    <div className="absolute -top-2.5 right-4 z-10 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black tracking-widest uppercase shadow-xs flex items-center gap-1">
                      {opt.isRecommended && <span>✨</span>}
                      <span>{opt.badge}</span>
                    </div>
                  )}

                  <div
                    onClick={() => handleTargetSelect(opt)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/90 dark:border-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-100/60 dark:bg-slate-800 text-slate-950 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-sm font-black">{opt.size}×{opt.size}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-950 dark:text-white leading-tight">
                          {opt.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
            Clue Frequency / Difficulty
          </span>

          <div className="grid grid-cols-4 gap-2">
            {(['beginner', 'easy', 'medium', 'hard'] as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                onClick={() => handleDifficultySelect(d)}
                className={`py-2 px-1 rounded-xl text-center text-xs font-black capitalize transition-all cursor-pointer ${
                  difficulty === d
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white dark:bg-slate-800 text-slate-950 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 border border-emerald-400/40 cursor-pointer mt-2"
        >
          <span>START {selectedSize}×{selectedSize} PUZZLE</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </motion.button>
      </div>
    </div>
  );
};
