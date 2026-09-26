import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Target, 
  Clock, 
  User, 
  Cloud, 
  TrendingUp, 
  Medal, 
  RefreshCw 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { AppHeader } from '../components/AppHeader';
import { GlassCard, GlassButton } from '../components/AppleLiquidGlass';
import { fetchTopScores } from '../services/firebase';
import { GameScoreRecord } from '../types';
import { sound } from '../services/soundEffects';

export const LeaderboardScreen: React.FC = () => {
  const { userProfile, user, setCurrentScreen, setIsAuthModalOpen } = useGame();
  const [tab, setTab] = useState<'leaderboard' | 'stats'>('leaderboard');
  const [scores, setScores] = useState<GameScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadScores() {
      setLoading(true);
      try {
        const data = await fetchTopScores(10);
        if (mounted) {
          if (data && data.length > 0) {
            setScores(data);
          } else {
            setScores([
              {
                scoreId: 'seed_1',
                userId: 'p1',
                displayName: 'CosmoEuler',
                mode: 'classic',
                matrixSize: 5,
                targetSum: 65,
                score: 5420,
                accuracy: 98.4,
                timeSeconds: 36.2,
                maxStreak: 25,
                createdAt: new Date().toISOString(),
              },
              {
                scoreId: 'seed_2',
                userId: 'p2',
                displayName: 'MatrixMaster',
                mode: 'classic',
                matrixSize: 5,
                targetSum: 65,
                score: 4850,
                accuracy: 96.0,
                timeSeconds: 42.1,
                maxStreak: 24,
                createdAt: new Date().toISOString(),
              },
              {
                scoreId: 'seed_3',
                userId: 'p3',
                displayName: 'Hypatia99',
                mode: 'classic',
                matrixSize: 4,
                targetSum: 34,
                score: 4210,
                accuracy: 94.2,
                timeSeconds: 38.5,
                maxStreak: 19,
                createdAt: new Date().toISOString(),
              },
              {
                scoreId: 'seed_4',
                userId: 'p4',
                displayName: 'GaussHunter',
                mode: 'classic',
                matrixSize: 3,
                targetSum: 15,
                score: 3950,
                accuracy: 91.8,
                timeSeconds: 22.0,
                maxStreak: 16,
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        }
      } catch (err) {
        console.warn('Leaderboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadScores();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full pb-8 select-none">
      <AppHeader subtitle="STATS" showBack onBack={() => setCurrentScreen('home')} />

      <div className="px-5 pt-2 space-y-4">
        {/* Sub Navigation Tabs */}
        <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 flex items-center">
          <button
            onClick={() => {
              sound.playClick();
              setTab('leaderboard');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              tab === 'leaderboard'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Global Leaderboard
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('stats');
            }}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              tab === 'stats'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Career Mastery
          </button>
        </div>

        {tab === 'leaderboard' ? (
          <div className="space-y-3">
            {/* Top 3 Podium Card */}
            <GlassCard className="p-4 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Top Numtrix Masters</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-100 uppercase">
                  Live Global Sync
                </span>
              </div>

              {/* Podium row */}
              <div className="flex items-end justify-around pt-2 pb-1">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-slate-800 text-slate-200 flex items-center justify-center font-black text-xs shadow-md">
                    2
                  </div>
                  <span className="text-[11px] font-extrabold mt-1 text-emerald-100 max-w-[70px] truncate text-center">
                    {scores[1]?.displayName || 'Silver'}
                  </span>
                  <span className="text-[10px] font-black text-amber-300">
                    {scores[1]?.score.toLocaleString() || '4,850'}
                  </span>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center -translate-y-2">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-lg shadow-amber-500/30">
                      <Crown className="w-7 h-7 text-amber-950 fill-amber-950" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white">
                      1
                    </span>
                  </div>
                  <span className="text-xs font-black mt-1 text-white max-w-[80px] truncate text-center">
                    {scores[0]?.displayName || 'CosmoEuler'}
                  </span>
                  <span className="text-xs font-black text-amber-300">
                    {scores[0]?.score.toLocaleString() || '5,420'}
                  </span>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-700 bg-amber-900 text-amber-200 flex items-center justify-center font-black text-xs shadow-md">
                    3
                  </div>
                  <span className="text-[11px] font-extrabold mt-1 text-emerald-100 max-w-[70px] truncate text-center">
                    {scores[2]?.displayName || 'Bronze'}
                  </span>
                  <span className="text-[10px] font-black text-amber-300">
                    {scores[2]?.score.toLocaleString() || '4,210'}
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Scores List */}
            <div className="space-y-2">
              {scores.map((sc, idx) => {
                const isCurrentUser = user && sc.userId === user.uid;

                return (
                  <GlassCard
                    key={sc.scoreId || idx}
                    className={`p-3 flex items-center justify-between ${
                      isCurrentUser ? 'border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-900 font-black'
                            : idx === 2
                            ? 'bg-amber-700 text-white font-black'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-950 dark:text-white">
                            {sc.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {sc.matrixSize}×{sc.matrixSize} • {sc.accuracy}% Acc • {sc.timeSeconds}s
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 block leading-tight">
                        {sc.score.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">PTS</span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        ) : (
          /* Career Stats Tab */
          <div className="space-y-3">
            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider">
                  Player Career Overview
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                  LVL {userProfile.level}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase block">Total Puzzles</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white">
                    {userProfile.gamesPlayed}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase block">Best Score</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    {userProfile.bestScore.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase block">Best Streak</span>
                  <span className="text-xl font-black text-amber-500">
                    {userProfile.bestStreak}×
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 uppercase block">Total XP</span>
                  <span className="text-xl font-black text-slate-950 dark:text-white">
                    {userProfile.xp.toLocaleString()}
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
