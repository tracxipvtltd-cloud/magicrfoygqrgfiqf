import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Moon, 
  Sun, 
  BookOpen, 
  ShieldCheck, 
  Cloud, 
  Smartphone, 
  RotateCcw,
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { GlassCard, GlassButton } from './AppleLiquidGlass';
import { sound } from '../services/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    soundEnabled,
    setSoundEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    isDarkMode,
    setIsDarkMode,
    deviceFrame,
    setDeviceFrame,
    autoCheckErrors,
    setAutoCheckErrors,
    user,
    setIsAuthModalOpen,
  } = useGame();

  if (!isOpen) return null;

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
            onClose();
          }}
          className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
        />

        {/* Liquid Glass Dialog Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="relative w-full max-w-sm rounded-[34px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl p-6 overflow-hidden z-10 max-h-[85vh] overflow-y-auto no-scrollbar"
        >
          {/* Top specular glow */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings & Academy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Personalize gameplay controls and explore magic square mathematics.
          </p>

          {/* Cloud Account Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/80 dark:bg-slate-800/70 border border-blue-200/80 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  {user ? user.displayName || 'Google Account' : 'Guest Player'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {user ? 'Synced with Firebase' : 'Scores saved on device'}
                </p>
              </div>
            </div>

            <GlassButton
              variant={user ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                sound.playClick();
                setIsAuthModalOpen(true);
              }}
            >
              {user ? 'Manage' : 'Sign In'}
            </GlassButton>
          </div>

          {/* Audio & Haptic Toggles */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Audio & Feedback
            </span>

            {/* Sound FX */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-xs">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Sound Effects</h5>
                  <p className="text-[10px] text-slate-400">Harmonic chimes & streak audio</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) sound.playClick();
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  soundEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Haptics */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-xs">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Haptic Vibration</h5>
                  <p className="text-[10px] text-slate-400">Tactile cell tap response</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setHapticsEnabled(!hapticsEnabled);
                  sound.playClick();
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  hapticsEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Error Highlight */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-red-500 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Highlight Conflicts</h5>
                  <p className="text-[10px] text-slate-400">Warn if sum exceeds target</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setAutoCheckErrors(!autoCheckErrors);
                  sound.playClick();
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  autoCheckErrors ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    autoCheckErrors ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Theme & Layout */}
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Visuals & Frame
            </span>

            {/* Dark Mode */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-xs">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Appearance</h5>
                  <p className="text-[10px] text-slate-400">{isDarkMode ? 'Dark Navy Glass' : 'Light Frosted Glass'}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsDarkMode(!isDarkMode);
                  if (!isDarkMode) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  isDarkMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Device Simulator Frame */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">Mobile Viewport</h5>
                  <p className="text-[10px] text-slate-400">
                    {deviceFrame === 'iphone' ? 'iPhone 16 Pro Frame' : 'Fullscreen Canvas'}
                  </p>
                </div>
              </div>

              <GlassButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  sound.playClick();
                  setDeviceFrame(deviceFrame === 'iphone' ? 'fullscreen' : 'iphone');
                }}
              >
                Toggle
              </GlassButton>
            </div>
          </div>

          {/* Educational Magic Square Explanation */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-950/40 border border-blue-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-blue-900 dark:text-blue-200">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-400" />
              <span>Magic Square Math Academy</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              A <strong>magic square</strong> of order <span className="font-mono font-bold">n</span> is an arrangement of the distinct integers from <span className="font-mono font-bold">1</span> to <span className="font-mono font-bold">n²</span> such that the sum of the <span className="font-bold">n</span> numbers in each row, column, and main diagonal is the constant:
            </p>
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 text-center font-mono font-bold text-blue-600 dark:text-sky-400 text-xs shadow-xs border border-blue-200 dark:border-slate-800">
              M = n × (n² + 1) / 2
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
              Used in ancient architecture, cryptography, and combinatorics. Albrecht Dürer immortalized the 4×4 square in 1514 with constant <span className="font-bold">34</span>!
            </p>
          </div>

          <div className="mt-5 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              Numtrix v1.0.0 • Liquid Glass Architecture
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
