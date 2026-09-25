/**
 * Web Audio API synthesizer for crisp, low-latency Apple-style sound effects.
 * Emulates physical haptics and game feedback without any external asset loading issues.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;
  public hapticsEnabled = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public triggerHaptic(type: 'light' | 'medium' | 'success' | 'error' = 'light') {
    if (!this.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      if (type === 'light') navigator.vibrate(15);
      else if (type === 'medium') navigator.vibrate(35);
      else if (type === 'success') navigator.vibrate([20, 40, 30]);
      else if (type === 'error') navigator.vibrate([50, 60, 70]);
    } catch {
      // Ignore vibration errors if not supported by browser
    }
  }

  // Soft Apple iOS click
  public playClick() {
    this.triggerHaptic('light');
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Correct answer bell with dynamic pitch based on combo streak!
  public playCorrect(streak = 1) {
    this.triggerHaptic('success');
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Pitch rises gracefully with streak
    const baseFreq = 523.25; // C5
    const multiplier = 1 + Math.min(streak * 0.05, 0.8);
    const primaryFreq = baseFreq * multiplier;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc2.type = 'sine';

    osc.frequency.setValueAtTime(primaryFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(primaryFreq * 1.5, this.ctx.currentTime + 0.12);

    osc2.frequency.setValueAtTime(primaryFreq * 2, this.ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(primaryFreq * 2.5, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(this.ctx.currentTime + 0.22);
    osc2.stop(this.ctx.currentTime + 0.22);
  }

  // Incorrect buzz
  public playWrong() {
    this.triggerHaptic('error');
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Hint activation ping
  public playHint() {
    this.triggerHaptic('medium');
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Round victory fanfare
  public playVictory() {
    this.triggerHaptic('success');
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }
}

export const sound = new SoundService();
