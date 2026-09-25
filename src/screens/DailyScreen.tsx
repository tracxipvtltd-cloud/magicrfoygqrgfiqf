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
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const DailyScreen: React.FC = () => {
  const { 
    startDailyChallenge, 
    completedDailyDates, 
    streak, 
    setCurrentScreen 
  } = useGame();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' });
  const todayDate = now.getDate();
  const todayStr = now.toISOString().slice(0, 10);
  const isTodayCompleted = completedDailyDates.includes(todayStr);

  // Days in current month
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, now.getMonth(), 1).getDay(); // 0 is Sunday

  // Days array (1..daysInMonth)
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

  return (
    <div className="flex-1 flex flex-col w-full pb-8">
      <AppHeader subtitle="DAILY CHALLENGE" />

      <div className="px-5 pt-1 space-y-4">
        {/* Month & Trophy Overview Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-blue-500/10 border border-amber-400/30 dark:border-amber-500/20 backdrop-blur-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-black tracking-wider uppercase">
              <Crown className="w-3 h-3 fill-current" />
              <span>MONTHLY TROPHY</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {currentMonthName} Grand Cup
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Solve {daysInMonth} daily puzzles to earn this month's gold badge.
            </p>

            {/* Progress bar */}
            <div className="pt-1.5 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((completedCount / daysInMonth) * 100))}%` }}
                />
              </div>
              <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                {completedCount}/{daysInMonth}
              </span>
            </div>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-500 shadow-md">
            <Trophy className="w-7 h-7" />
          </div>
        </div>

        {/* Today's Mission Action Card */}
        <GlassCard className="p-4 flex items-center justify-between border-blue-300/60 dark:border-blue-700/60">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-blue-600 dark:text-sky-400 uppercase tracking-wider">
                TODAY • {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              {isTodayCompleted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>COMPLETED</span>
                </span>
              )}
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              Daily Numtrix (5×5 • Target 65)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Numbers 1–25 unique across the entire matrix!
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handlePlayToday}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/30 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isTodayCompleted ? 'Replay' : 'Play'}</span>
          </motion.button>
        </GlassCard>

        {/* Nonogram Calendar Grid */}
        <div className="p-3.5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              {currentMonthName} {currentYear}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-500">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak} Day Streak</span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase">
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
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square" />
            ))}

            {/* Month Days */}
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
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-sky-300 ring-2 ring-blue-500/40 shadow-xs scale-105'
                      : isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : isFuture
                      ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  <span>{d}</span>
                  {isDone ? (
                    <span className="text-[8px] text-emerald-500 leading-none mt-0.5">✓</span>
                  ) : isToday ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 mt-0.5" />
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
