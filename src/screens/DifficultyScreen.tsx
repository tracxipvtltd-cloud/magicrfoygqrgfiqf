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

// Strictly maintains unique matrix values (1 to N^2) and magic sums
const TARGET_OPTIONS: TargetOption[] = [
  {
    targetSum: 65,
    size: 5,
    title: '5×5 Matrix — Target 65',
    orderLabel: '5×5 (1–25 • Sum 65)',
    description: 'Flagship magic matrix. 25 unique numbers (1–25) summing to 65 across all rows, cols, and diags.',
    isRecommended: true,
    badge: 'FLAGSHIP',
  },
  {
    targetSum: 34,
    size: 4,
    title: '4×4 Matrix — Target 34',
    orderLabel: '4×4 (1–16 • Sum 34)',
    description: 'Classic Dürer matrix. 16 unique numbers (1–16) summing to 34.',
    badge: 'QUICK PLAY',
  },
  {
    targetSum: 111,
    size: 6,
    title: '6×6 Matrix — Target 111',
    orderLabel: '6×6 (1–36 • Sum 111)',
    description: 'Grand master matrix. 36 unique numbers (1–36) summing to 111.',
    badge: 'MASTER',
  },
  {
    targetSum: 15,
    size: 3,
    title: '3×3 Matrix — Target 15',
    orderLabel: '3×3 (1–9 • Sum 15)',
    description: 'Ancient Lo Shu starter. 9 unique numbers (1–9) summing to 15.',
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
    <div className="flex-1 flex flex-col w-full pb-8">
      <AppHeader subtitle="SETUP" showBack onBack={() => setCurrentScreen('home')} />

      <div className="px-5 pt-1 space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Configure Your Puzzle
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
            Every line sums to <span className="font-bold text-blue-600 dark:text-sky-400">N × N</span> and <span className="font-bold text-orange-500">numbers never repeat</span>.
          </p>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => handleModeChange('classic')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
              selectedMode === 'classic'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${selectedMode === 'classic' ? 'fill-white' : ''}`} />
            <span>Classic (3 Lives)</span>
          </button>

          <button
            onClick={() => handleModeChange('practice')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
              selectedMode === 'practice'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Practice (Zen)</span>
          </button>
        </div>

        {/* Target & Grid Options */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
            Choose Board (Target = N × N)
          </span>

          <div className="space-y-2.5">
            {TARGET_OPTIONS.map((opt) => {
              const isSelected = opt.targetSum === targetSum && opt.size === selectedSize;

              return (
                <div key={`${opt.size}-${opt.targetSum}`} className="relative">
                  {opt.badge && (
                    <div className="absolute -top-2.5 right-4 z-10 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black tracking-widest uppercase shadow-xs flex items-center gap-1">
                      {opt.isRecommended && <span>✨</span>}
                      <span>{opt.badge}</span>
                    </div>
                  )}

                  <div
                    onClick={() => handleTargetSelect(opt)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-black shadow-sm">
                        <span className="text-base leading-none">{opt.targetSum}</span>
                        <span className="text-[8px] font-bold text-blue-200 uppercase mt-0.5">{opt.size}×{opt.size}</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white">
                          {opt.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
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

        {/* Given Clues Difficulty Level */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
            Clue Density (Givens)
          </span>

          <div className="grid grid-cols-4 gap-2">
            {(['beginner', 'easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => {
              const active = difficulty === diff;
              const labels = {
                beginner: '60% Clues',
                easy: '50% Clues',
                medium: '40% Clues',
                hard: '30% Clues',
              };

              return (
                <button
                  key={diff}
                  onClick={() => handleDifficultySelect(diff)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-black capitalize">{diff}</div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                    {labels[diff]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Educational Callout */}
        <GlassCard className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div>
            <h5 className="text-xs font-black text-blue-950 dark:text-blue-200">
              Input Technique
            </h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              In game: Tap any upper cell in the matrix, then tap the number from the lower box dock to fill it. Row and column indicators light up green when hitting <span className="font-bold text-blue-600 dark:text-sky-400">{targetSum}</span>!
            </p>
          </div>
        </GlassCard>

        {/* Start Game CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wider shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 border border-blue-400/40 cursor-pointer"
        >
          <span>START {selectedSize}×{selectedSize} (TARGET {targetSum})</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </motion.button>
      </div>
    </div>
  );
};
