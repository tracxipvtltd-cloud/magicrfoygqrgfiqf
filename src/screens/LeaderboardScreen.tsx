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
            // Seed sample high scores if newly provisioned database
            setScores([
              {
                scoreId: 'seed_1',
                userId: 'p1',
                displayName: 'CosmoEuler',
                mode: 'classic',
                matrixSize: 5,
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
                mode: 'timed',
                matrixSize: 4,
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
                matrixSize: 6,
                score: 3950,
                accuracy: 91.8,
                timeSeconds: 52.0,
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
    <div className="flex-1 flex flex-col w-full pb-8">
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
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
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
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Career Mastery
          </button>
        </div>

        {tab === 'leaderboard' ? (
          <div className="space-y-3">
            {/* Top 3 Podium Card */}
            <GlassCard className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Top Harmonic Hunters</span>
                </div>
                <span className="text-[10px] font-bold text-blue-200 uppercase">
                  Firebase Live Sync
                </span>
              </div>

              {/* Podium row */}
              <div className="flex items-end justify-around pt-2 pb-1">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 bg-slate-800 text-slate-200 flex items-center justify-center font-black text-xs shadow-md">
                    2
                  </div>
                  <span className="text-[11px] font-extrabold mt-1 text-blue-100 max-w-[70px] truncate text-center">
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
                  <span className="text-[11px] font-extrabold mt-1 text-blue-100 max-w-[70px] truncate text-center">
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
                      isCurrentUser ? 'border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-800 dark:text-white">
                            {sc.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-black">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {sc.matrixSize}×{sc.matrixSize} {sc.mode.toUpperCase()} • {sc.accuracy}% ACC
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-blue-600 dark:text-sky-400">
                        {sc.score.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {sc.timeSeconds}s
                      </span>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Cloud Sync Callout if not signed in */}
            {!user && (
              <GlassCard className="p-4 bg-sky-50/70 dark:bg-slate-800/60 border-sky-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-800 dark:text-white">
                    Appear on Global Leaderboards
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Link your Google account to record your top scores permanently.
                  </p>
                </div>
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Sign In
                </GlassButton>
              </GlassCard>
            )}
          </div>
        ) : (
          /* Career Stats Tab */
          <div className="space-y-4">
            <GlassCard className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                    {userProfile.displayName[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">
                      {userProfile.displayName}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-sky-400 font-bold">
                      Level {userProfile.level} Hunter • {userProfile.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400">Personal Best</div>
                  <div className="text-base font-black text-slate-800 dark:text-white">
                    {userProfile.bestScore.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Games Finished</div>
                  <div className="text-base font-black text-slate-800 dark:text-white mt-0.5">
                    {userProfile.gamesPlayed}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Total Correct</div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {userProfile.totalCorrect}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Reaction Time</div>
                  <div className="text-base font-black text-sky-600 dark:text-sky-400 mt-0.5">
                    {userProfile.avgReactionTime}s
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Best Combo Streak</div>
                  <div className="text-base font-black text-orange-600 dark:text-amber-400 mt-0.5">
                    {userProfile.bestStreak}×
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};
