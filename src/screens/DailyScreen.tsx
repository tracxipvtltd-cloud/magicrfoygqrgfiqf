import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Crown, 
  Trophy, 
  Flame, 
  Check, 
  Play, 
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const DailyScreen: React.FC = () => {
  const { 
    startDailyChallenge, 
    completedDailyDates, 
    userProfile, 
    dailyChallengeInfo,
    setCurrentScreen 
  } = useGame();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const todayDate = now.getDate();
  const todayStr = now.toISOString().slice(0, 10);
  const isTodayCompleted = completedDailyDates.includes(todayStr);

  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, now.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePlayToday = () => {
    sound.playClick();
    startDailyChallenge(todayDate);
  };

  const handleDayClick = (day: number) => {
    sound.playClick();
    if (day <= todayDate) {
      startDailyChallenge(day);
    }
  };

  const completedCount = completedDailyDates.filter((d) =>
    d.startsWith(`${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  ).length;

  const currentStreak = userProfile.dailyStreak || 0;

  return (
    <div className="flex-1 flex flex-col w-full pb-8 select-none">
      <AppHeader subtitle="DAILY CHALLENGE" />

      <div className="px-5 pt-1 space-y-4">
        {/* Month & Trophy Overview Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-emerald-500/10 to-teal-500/10 border border-amber-400/30 dark:border-amber-500/20 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-950 dark:text-amber-300 text-[10px] font-black tracking-wider uppercase">
              <Crown className="w-3 h-3 fill-current text-amber-500" />
              <span>MONTHLY TROPHY</span>
            </div>
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              {currentMonthName} Grand Cup
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold">
              Solve {daysInMonth} daily puzzles to earn this month's gold badge.
            </p>

            {/* Progress bar */}
            <div className="pt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((completedCount / daysInMonth) * 100))}%` }}
                />
              </div>
              <span className="text-[11px] font-black text-emerald-800 dark:text-emerald-400">
                {completedCount}/{daysInMonth}
              </span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-500 shadow-md">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        {/* Today's Mission Action Card */}
        <GlassCard className="p-4 space-y-3 border-emerald-300/60 dark:border-emerald-700/60">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  TODAY • {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {isTodayCompleted && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1 border border-emerald-300">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>COMPLETED</span>
                  </span>
                )}
              </div>
              <h4 className="text-base font-black text-slate-950 dark:text-white">
                {dailyChallengeInfo.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {dailyChallengeInfo.description}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={handlePlayToday}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer shrink-0 ml-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTodayCompleted ? 'Replay' : 'Play'}</span>
            </motion.button>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[9px] font-black text-slate-500 uppercase block">SCORE</span>
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-mono">
                +{dailyChallengeInfo.scoreReward}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60">
              <span className="text-[9px] font-black text-slate-500 uppercase block">XP REWARD</span>
              <span className="text-xs font-black text-teal-800 dark:text-teal-300 font-mono">
                +{dailyChallengeInfo.xpReward}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <span className="text-[9px] font-black text-slate-500 uppercase block">STREAK BONUS</span>
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 font-mono">
                +{dailyChallengeInfo.streakBonus}
              </span>
            </div>
          </div>

          {/* Rules info summary */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <Info className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Target Level {dailyChallengeInfo.targetLevel} • {dailyChallengeInfo.size}×{dailyChallengeInfo.size} Tiles (Sum {dailyChallengeInfo.targetSum}) • Mathematical Daily Seed</span>
          </div>
        </GlassCard>

        {/* Calendar Grid */}
        <div className="p-3.5 rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-100 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-950 dark:text-white">
              {currentMonthName} {currentYear}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>{currentStreak} Day Streak</span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-500 uppercase">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square" />
            ))}

            {days.map((d) => {
              const dayStr = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isDone = completedDailyDates.includes(dayStr);
              const isToday = d === todayDate;
              const isFuture = d > todayDate;

              return (
                <button
                  key={d}
                  onClick={() => handleDayClick(d)}
                  disabled={isFuture}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all text-xs font-black ${
                    isToday
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/40 shadow-xs scale-105'
                      : isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-300'
                      : isFuture
                      ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/60 text-slate-950 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <span>{d}</span>
                  {isDone ? (
                    <span className="text-[8px] text-emerald-600 dark:text-emerald-400 leading-none mt-0.5">✓</span>
                  ) : isToday ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
