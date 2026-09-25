import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Clock, GraduationCap, Lightbulb, Lock, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';
import { MatrixSize, GameMode } from '../types';

interface MatrixOption {
  size: MatrixSize;
  title: string;
  orderLabel: string;
  constant: number;
  lives: number;
  multiplier: number;
  badge?: string;
  isRecommended?: boolean;
}

const OPTIONS: MatrixOption[] = [
  {
    size: 3,
    title: 'Beginner — 3×3',
    orderLabel: '3x3',
    constant: 15,
    lives: 5,
    multiplier: 1.0,
  },
  {
    size: 4,
    title: 'Easy — 4×4',
    orderLabel: '4x4',
    constant: 34,
    lives: 4,
    multiplier: 1.5,
  },
  {
    size: 5,
    title: 'Medium — 5×5',
    orderLabel: '5x5',
    constant: 65,
    lives: 3,
    multiplier: 2.0,
    isRecommended: true,
    badge: 'RECOMMENDED',
  },
  {
    size: 6,
    title: 'Hard — 6×6',
    orderLabel: '6x6',
    constant: 111,
    lives: 3,
    multiplier: 3.0,
  },
  {
    size: 7,
    title: 'Expert — 7×7 & 8×8',
    orderLabel: '7x7',
    constant: 175,
    lives: 2,
    multiplier: 4.5,
    badge: 'HIGH IQ',
  },
];

export const DifficultyScreen: React.FC = () => {
  const { 
    selectedSize, 
    setSelectedSize, 
    selectedMode, 
    setSelectedMode, 
    startNewGame, 
    setCurrentScreen 
  } = useGame();

  const handleSizeClick = (size: MatrixSize) => {
    sound.playClick();
    setSelectedSize(size);
  };

  const handleModeChange = (mode: GameMode) => {
    sound.playClick();
    setSelectedMode(mode);
  };

  const handleStart = () => {
    sound.playClick();
    startNewGame(selectedMode, selectedSize);
  };

  const activeOption = OPTIONS.find((o) => o.size === selectedSize) || OPTIONS[2];

  return (
    <div className="flex-1 flex flex-col w-full pb-8">
      <AppHeader subtitle="PLAY" showBack onBack={() => setCurrentScreen('home')} />

      <div className="px-5 pt-2 space-y-4">
        {/* Step Indicator */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tight">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>STEP 1 OF 2: SETUP MATRIX & MODE</span>
            </div>
            <span className="text-slate-400">50% Complete</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-1.5 overflow-hidden">
            <div className="w-1/2 h-full bg-blue-600 rounded-full" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Choose Matrix Size
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-relaxed">
            Higher orders yield larger magic constants and greater score multipliers.
          </p>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => handleModeChange('classic')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
              selectedMode === 'classic'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${selectedMode === 'classic' ? 'fill-white' : ''}`} />
            <span>Classic</span>
          </button>

          <button
            onClick={() => handleModeChange('timed')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none ${
              selectedMode === 'timed'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timed Blitz</span>
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
            <span>Practice</span>
          </button>
        </div>

        {/* Matrix Size Options List */}
        <div className="space-y-3 pt-1">
          {OPTIONS.map((opt) => {
            const isSelected = opt.size === selectedSize;

            return (
              <div key={opt.size} className="relative">
                {/* Optional Recommended or High IQ badge */}
                {opt.badge && (
                  <div className="absolute -top-2.5 right-4 z-10 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black tracking-widest uppercase shadow-xs flex items-center gap-1">
                    {opt.isRecommended && <span>✨</span>}
                    <span>{opt.badge}</span>
                  </div>
                )}

                <div
                  onClick={() => handleSizeClick(opt.size)}
                  className={`p-3.5 rounded-3xl transition-all cursor-pointer flex items-center justify-between border ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Matrix Thumbnail with Magic Constant */}
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 relative overflow-hidden shadow-inner">
                      <div className="w-full h-full rounded-xl border border-dashed border-blue-400/50 flex items-center justify-center bg-white dark:bg-slate-900">
                        <span className="text-xs font-black text-blue-600 dark:text-sky-400">
                          {opt.constant}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white">
                          {opt.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                        M = {opt.constant} • {selectedMode === 'practice' ? '∞' : opt.lives} Lives
                      </p>
                      <span className="text-[11px] font-black text-blue-600 dark:text-sky-400">
                        Multiplier ×{opt.multiplier.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Radio Checkmark Circle */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Educational Callout: Magic Constant Fact */}
        <GlassCard className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-black text-blue-950 dark:text-blue-200 tracking-tight">
              Magic Constant Fact
            </h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              For any normal magic square of order <span className="font-bold text-blue-700 dark:text-sky-300">n</span>, the sum of any row, column, or diagonal is <span className="font-mono font-bold text-blue-700 dark:text-sky-300">M = n(n² + 1) / 2</span>. Spot numbers along these axes for fast combo streaks!
            </p>
          </div>
        </GlassCard>

        {/* Sticky-like Bottom Section */}
        <div className="pt-2 space-y-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
            <span>⚙ Selected: {activeOption.orderLabel} {selectedMode.toUpperCase()}</span>
            <span>•</span>
            <span>{selectedMode === 'practice' ? '∞' : activeOption.lives} Lives</span>
            <span>•</span>
            <span>×{activeOption.multiplier.toFixed(1)}</span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wider shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 border border-blue-400/40 cursor-pointer"
          >
            <span>START NUMBER HUNT ({activeOption.orderLabel})</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
