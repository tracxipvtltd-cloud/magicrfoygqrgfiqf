import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, Cloud, Flame, Trophy, Award, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GlassButton } from './AppleLiquidGlass';
import { sound } from '../services/soundEffects';

export const GoogleAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    user, 
    userProfile, 
    handleLoginWithGoogle, 
    handleLogout, 
    authLoading 
  } = useGame();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSignIn = async () => {
    setErrorMessage(null);
    try {
      await handleLoginWithGoogle();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('popup-closed-by-user')) {
          setErrorMessage('Sign-in popup was closed. Please try again.');
        } else if (err.message.includes('popup-blocked')) {
          setErrorMessage('Popup blocked by browser. Please allow popups for Google sign-in.');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('Authentication failed. Please check internet connection.');
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sound.playClick();
            setIsAuthModalOpen(false);
          }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Liquid Glass Dialog Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="relative w-full max-w-sm rounded-[32px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl p-6 overflow-hidden z-10"
        >
          {/* Top specular reflection line */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              setIsAuthModalOpen(false);
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Header Icon */}
          <div className="flex flex-col items-center text-center mt-2">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {user ? 'Firebase Cloud Account' : 'Connect with Google'}
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
              {user
                ? 'Your campaign level, stars, hints, and score are safely saved to Google Cloud Firestore.'
                : 'Sign in to save your 1,500 levels progression, hints, and sync across any browser or install.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {syncSuccess && (
            <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Successfully linked to Firebase Firestore!</span>
            </div>
          )}

          {/* Profile Card if Signed In */}
          {user ? (
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Account'}
                    className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black text-lg flex items-center justify-center">
                    {(user.displayName || 'U')[0]}
                  </div>
                )}

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Player Hunter'}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                      SYNCED
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Stats snapshot */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-slate-800/40 border border-emerald-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Best Score</div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {userProfile.bestScore.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50/70 dark:bg-slate-800/40 border border-orange-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Max Streak</div>
                  <div className="text-sm font-black text-orange-600 dark:text-amber-400 mt-0.5">
                    {userProfile.bestStreak}x
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-slate-800/40 border border-emerald-100 dark:border-slate-700 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Level</div>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    LVL {userProfile.level}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <GlassButton
                  variant="secondary"
                  size="md"
                  onClick={async () => {
                    sound.playClick();
                    await handleLogout();
                  }}
                  className="w-full text-red-600 dark:text-red-400 border-red-200 dark:border-red-950"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </GlassButton>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* Google Sign-in Button with official styling & Liquid Glass sheen */}
              <button
                onClick={handleSignIn}
                disabled={authLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Protected by Firebase Authentication & Zero-Trust Rules</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
