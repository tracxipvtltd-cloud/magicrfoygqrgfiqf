import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Flame, 
  Target, 
  Sparkles, 
  Heart, 
  Clock, 
  Compass, 
  Trophy, 
  ChevronRight, 
  CheckCircle2, 
  Award,
  Zap
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';
import { SAMPLE_4X4 } from '../services/magicMatrixEngine';
import { GameMode } from '../types';

export const HomeScreen: React.FC = () => {
  const { 
    userProfile, 
    setCurrentScreen, 
    startNewGame, 
    setSelectedMode, 
    setSelectedSize,
    selectedSize
  } = useGame();

  // Interactive Harmonic Field preview state
  const [previewTarget, setPreviewTarget] = useState(13);
  const [previewSolved, setPreviewSolved] = useState<number | null>(null);

  const handlePreviewCellClick = (val: number) => {
    sound.playClick();
    if (val === previewTarget) {
      sound.playCorrect(3);
      setPreviewSolved(val);
      setTimeout(() => {
        startNewGame('classic', 4);
      }, 350);
    } else {
      sound.playWrong();
    }
  };

  const handleModeSelect = (mode: GameMode) => {
    sound.playClick();
    setSelectedMode(mode);
    setCurrentScreen('difficulty');
  };

  const handlePlayNow = () => {
    sound.playClick();
    startNewGame('classic', 5);
  };

  const handleDailyChallenge = () => {
    sound.playClick();
    startNewGame('challenge', 5);
  };

  const currentMonthDay = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex-1 flex flex-col w-full pb-8">
      <AppHeader subtitle="HOME" />

      <div className="px-5 pt-2 space-y-5">
        {/* Tier / Level Hunter Badge */}
        <div className="flex items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800 text-blue-700 dark:text-sky-300 text-xs font-black tracking-wide shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>LVL {userProfile.level} NUMBER HUNTER</span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to Hunt?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
            Find numbers at lightning speed on harmonic magic squares.
          </p>
        </div>

        {/* Top 3-metric KPI Card */}
        <GlassCard className="p-3.5 flex items-center justify-between">
          <div className="flex flex-col items-center flex-1 border-r border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-tight">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Streak</span>
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {userProfile.bestStreak}x
            </span>
          </div>

          <div className="flex flex-col items-center flex-1 border-r border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-tight">
              <Trophy className="w-3.5 h-3.5 text-blue-500" />
              <span>Today</span>
            </div>
            <span className="text-lg font-black text-blue-600 dark:text-sky-400 mt-0.5">
              {userProfile.bestScore > 0 ? `${(userProfile.bestScore / 1000).toFixed(1)}k` : '18.4k'}
            </span>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-tight">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              <span>Accuracy</span>
            </div>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {userProfile.totalCorrect + userProfile.totalWrong > 0
                ? `${Math.round((userProfile.totalCorrect / (userProfile.totalCorrect + userProfile.totalWrong)) * 1000) / 10}%`
                : '96.2%'}
            </span>
          </div>
        </GlassCard>

        {/* Primary CTA Play Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePlayNow}
          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/30 flex items-center justify-between border border-blue-400/40 relative overflow-hidden cursor-pointer"
        >
          {/* Light sweep */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="text-sm font-black tracking-wider uppercase">PLAY NOW</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-100 bg-white/15 px-2.5 py-1 rounded-xl">
            <span>Speed Hunt</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </motion.button>

        {/* Daily Challenge Card */}
        <GlassCard
          onClick={handleDailyChallenge}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:border-blue-400/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-blue-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  Daily Challenge
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {currentMonthDay} • 5×5 Matrix • 30 Targets
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-sky-400 text-xs font-black border border-blue-200 dark:border-blue-800">
            +250 XP
          </div>
        </GlassCard>

        {/* Harmonic Field (Interactive Preview Board) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-white">
              <div className="w-4 h-4 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">
                ⊞
              </div>
              <span>Harmonic Field</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-slate-800 text-[10px] font-black text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-slate-700">
              SUM: 34
            </span>
          </div>

          <GlassCard className="p-3.5 space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] tracking-wider uppercase">ACTIVE SCAN PATTERN</span>
              </div>
              <span className="font-extrabold text-blue-600 dark:text-sky-400">
                Target: {previewTarget}
              </span>
            </div>

            {/* 4x4 Mini Interactive Grid */}
            <div className="grid grid-cols-4 gap-2 aspect-square max-w-[280px] mx-auto w-full">
              {SAMPLE_4X4.cells.map((row, r) =>
                row.map((val, c) => {
                  const isTarget = val === previewTarget;
                  const isSolved = val === previewSolved;

                  let cellClasses = 'bg-white/95 dark:bg-slate-800/90 text-slate-800 dark:text-white border border-slate-200/80 dark:border-slate-700/80 shadow-xs';
                  if (isSolved) {
                    cellClasses = 'bg-emerald-500 text-white border-emerald-400 scale-95';
                  } else if (isTarget) {
                    cellClasses = 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/40 ring-2 ring-blue-300 dark:ring-blue-500';
                  }

                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handlePreviewCellClick(val)}
                      className={`rounded-2xl font-black text-sm flex items-center justify-center aspect-square transition-all duration-150 cursor-pointer ${cellClasses}`}
                    >
                      {val}
                    </motion.button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-400 pt-1">
              <span>👆 Tap target to engage</span>
              <span>4×4 Standard</span>
            </div>
          </GlassCard>
        </div>

        {/* Game Modes (4 CHANNELS) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-white">
              <span>🎮 Game Modes</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              4 CHANNELS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Classic */}
            <GlassCard
              onClick={() => handleModeSelect('classic')}
              className="p-3 cursor-pointer hover:border-blue-400/60 transition-all flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">3 Lives</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white mt-2">
                  Classic
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                  Find numbers before losing all hearts
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-bold">Best</span>
                <span className="text-xs font-black text-blue-600 dark:text-sky-400">4,850</span>
              </div>
            </GlassCard>

            {/* Timed */}
            <GlassCard
              onClick={() => handleModeSelect('timed')}
              className="p-3 cursor-pointer hover:border-blue-400/60 transition-all flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center">
                    <Clock className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">60s</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white mt-2">
                  Timed
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                  Race against the clock at max speed
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-bold">Best</span>
                <span className="text-xs font-black text-blue-600 dark:text-sky-400">3,920</span>
              </div>
            </GlassCard>

            {/* Practice */}
            <GlassCard
              onClick={() => handleModeSelect('practice')}
              className="p-3 cursor-pointer hover:border-blue-400/60 transition-all flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center">
                    <Compass className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500">Free</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white mt-2">
                  Practice
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                  Zero pressure, master matrix layouts
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-bold">Status</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Unlocked</span>
              </div>
            </GlassCard>

            {/* Challenge */}
            <GlassCard
              onClick={() => handleModeSelect('challenge')}
              className="p-3 cursor-pointer hover:border-blue-400/60 transition-all flex flex-col justify-between h-36"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-500">Daily</span>
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white mt-2">
                  Challenge
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                  Custom constraints & modifiers
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-bold">Rank</span>
                <span className="text-xs font-black text-slate-800 dark:text-white">Tier 4</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Progress Summary Card */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-white">
              <span>📊 Progress Summary</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setCurrentScreen('leaderboard');
              }}
              className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Stats</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <GlassCard className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Played</div>
                  <div className="text-base font-black text-slate-800 dark:text-white">
                    {userProfile.gamesPlayed}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-sky-400">
                  ⊞
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Win Rate</div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    94%
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  ○
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Speed</div>
                  <div className="text-base font-black text-sky-600 dark:text-sky-400">
                    {userProfile.avgReactionTime}s
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  ⚡
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-orange-50/60 dark:bg-slate-800/60 border border-orange-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Max Streak</div>
                  <div className="text-base font-black text-orange-600 dark:text-amber-400">
                    {userProfile.bestStreak}
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/60 flex items-center justify-center text-orange-600 dark:text-amber-400">
                  ↻
                </div>
              </div>
            </div>

            {/* XP progress bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Tier {userProfile.level} Mastery Progress</span>
                <span className="text-slate-700 dark:text-white font-extrabold">
                  {userProfile.xp % 4000} / 4,000 XP
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((userProfile.xp % 4000) / 4000) * 100)}%` }}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
