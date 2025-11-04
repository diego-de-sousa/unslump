/**
 * Celebration Sounds Controller
 * Specialized sound effects for logo celebration animations
 * Uses Web Audio API for real-time synthesis
 */

import type { PhaseId } from './animationConfig';

class CelebrationSounds {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.3;
  private isMuted: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeOnUserGesture();
      this.loadPreferences();
    }
  }

  private initializeOnUserGesture(): void {
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  private loadPreferences(): void {
    try {
      const savedVolume = localStorage.getItem('unslump-celebration-volume');
      const savedMuted = localStorage.getItem('unslump-celebration-muted');
      const savedEnabled = localStorage.getItem('unslump-celebration-enabled');

      if (savedVolume) this.volume = parseFloat(savedVolume);
      if (savedMuted) this.isMuted = savedMuted === 'true';
      if (savedEnabled) this.isEnabled = savedEnabled === 'true';
    } catch (e) {
      console.warn('Could not load celebration sound preferences:', e);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('unslump-celebration-volume', this.volume.toString());
      localStorage.setItem('unslump-celebration-muted', this.isMuted.toString());
      localStorage.setItem('unslump-celebration-enabled', this.isEnabled.toString());
    } catch (e) {
      console.warn('Could not save celebration sound preferences:', e);
    }
  }

  private shouldPlay(): boolean {
    return this.isEnabled && !this.isMuted && this.audioContext !== null;
  }

  private createGainNode(): GainNode {
    const gainNode = this.audioContext!.createGain();
    gainNode.gain.value = this.volume;
    return gainNode;
  }

  // Exercise Complete Sounds (Subtle)
  playExerciseComplete(phaseId: PhaseId): void {
    if (!this.shouldPlay()) return;

    const ctx = this.audioContext!;
    const gainNode = this.createGainNode();
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (phaseId) {
      case 'fase1':
        this.playSoftReleaseTone(ctx, gainNode, now);
        break;
      case 'fase2':
        this.playGentleStretchTone(ctx, gainNode, now);
        break;
      case 'fase3':
        this.playActivationPop(ctx, gainNode, now);
        break;
      case 'fase4':
        this.playIntegrationChord(ctx, gainNode, now);
        break;
    }
  }

  private playSoftReleaseTone(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, time);
    osc.frequency.exponentialRampToValueAtTime(220, time + 0.3);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playGentleStretchTone(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, time);
    osc.frequency.exponentialRampToValueAtTime(523, time + 0.4);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.4);
  }

  private playActivationPop(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private playIntegrationChord(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const frequencies = [261.63, 329.63, 392.0];

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.2, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(time);
      osc.stop(time + 0.5);
    });
  }

  // Phase Complete Sounds (Medium)
  playPhaseComplete(phaseId: PhaseId): void {
    if (!this.shouldPlay()) return;

    const ctx = this.audioContext!;
    const gainNode = this.createGainNode();
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (phaseId) {
      case 'fase1':
        this.playCompressionRelease(ctx, gainNode, now);
        break;
      case 'fase2':
        this.playStretchSnap(ctx, gainNode, now);
        break;
      case 'fase3':
        this.playPowerUpCrescendo(ctx, gainNode, now);
        break;
      case 'fase4':
        this.playFlowingArpeggio(ctx, gainNode, now);
        break;
    }
  }

  private playCompressionRelease(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.linearRampToValueAtTime(80, time + 0.3);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.6);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.linearRampToValueAtTime(0.6, time + 0.3);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.7);

    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.7);
  }

  private playStretchSnap(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(200, time);
    osc1.frequency.exponentialRampToValueAtTime(600, time + 0.5);

    const osc1Gain = ctx.createGain();
    osc1Gain.gain.setValueAtTime(0.3, time);
    osc1Gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

    osc1.connect(osc1Gain);
    osc1Gain.connect(gainNode);
    osc1.start(time);
    osc1.stop(time + 0.6);

    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1000, time + 0.5);
    osc2.frequency.exponentialRampToValueAtTime(100, time + 0.6);

    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.4, time + 0.5);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);

    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);
    osc2.start(time + 0.5);
    osc2.stop(time + 0.65);
  }

  private playPowerUpCrescendo(ctx: AudioContext, gainNode: GainNode, time: number): void {
    for (let i = 0; i < 3; i++) {
      const startTime = time + i * 0.15;
      const freq = 300 + i * 100;

      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.5, startTime + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  private playFlowingArpeggio(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const notes = [261.63, 329.63, 392.0, 493.88];
    const duration = 0.2;

    notes.forEach((freq, i) => {
      const startTime = time + i * duration;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration * 2);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(startTime);
      osc.stop(startTime + duration * 2);
    });
  }

  // Session Complete Sounds (Epic)
  playSessionComplete(variant: 'sequential' | 'transformation' | 'wave' | 'explosion'): void {
    if (!this.shouldPlay()) return;

    const ctx = this.audioContext!;
    const gainNode = this.createGainNode();
    gainNode.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (variant) {
      case 'sequential':
        this.playSequentialMelody(ctx, gainNode, now);
        break;
      case 'transformation':
        this.playTransformationEpic(ctx, gainNode, now);
        break;
      case 'wave':
        this.playWaveEffect(ctx, gainNode, now);
        break;
      case 'explosion':
        this.playExplosionDrop(ctx, gainNode, now);
        break;
    }
  }

  private playSequentialMelody(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const melody = [
      { freq: 261.63, time: 0 },
      { freq: 329.63, time: 0.3 },
      { freq: 392.0, time: 0.6 },
      { freq: 523.25, time: 0.9 },
    ];

    melody.forEach(({ freq, time: offset }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.4, time + offset);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + offset + 0.8);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(time + offset);
      osc.stop(time + offset + 0.8);
    });

    setTimeout(() => {
      const chordFreqs = [261.63, 329.63, 392.0, 523.25];
      chordFreqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.3, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      });
    }, 1200);
  }

  private playTransformationEpic(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(880, time + 1.5);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.1, time);
    oscGain.gain.linearRampToValueAtTime(0.6, time + 0.7);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 2.0);

    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 2.0);
  }

  private playWaveEffect(ctx: AudioContext, gainNode: GainNode, time: number): void {
    for (let i = 0; i < 4; i++) {
      const startTime = time + i * 0.15;
      const freq = 300 + i * 50;

      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.4, startTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    }
  }

  private playExplosionDrop(ctx: AudioContext, gainNode: GainNode, time: number): void {
    const buildUp = ctx.createOscillator();
    buildUp.type = 'sawtooth';
    buildUp.frequency.setValueAtTime(100, time);
    buildUp.frequency.exponentialRampToValueAtTime(1000, time + 1.0);

    const buildUpGain = ctx.createGain();
    buildUpGain.gain.setValueAtTime(0.1, time);
    buildUpGain.gain.linearRampToValueAtTime(0.5, time + 1.0);

    buildUp.connect(buildUpGain);
    buildUpGain.connect(gainNode);
    buildUp.start(time);
    buildUp.stop(time + 1.0);

    const drop = ctx.createOscillator();
    drop.type = 'square';
    drop.frequency.setValueAtTime(200, time + 1.0);
    drop.frequency.exponentialRampToValueAtTime(50, time + 1.5);

    const dropGain = ctx.createGain();
    dropGain.gain.setValueAtTime(0.7, time + 1.0);
    dropGain.gain.exponentialRampToValueAtTime(0.01, time + 2.5);

    drop.connect(dropGain);
    dropGain.connect(gainNode);
    drop.start(time + 1.0);
    drop.stop(time + 2.5);
  }

  // Public API
  setVolume(level: number): void {
    this.volume = Math.max(0, Math.min(1, level));
    this.savePreferences();
  }

  getVolume(): number {
    return this.volume;
  }

  mute(): void {
    this.isMuted = true;
    this.savePreferences();
  }

  unmute(): void {
    this.isMuted = false;
    this.savePreferences();
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.savePreferences();
    return this.isMuted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }

  enable(): void {
    this.isEnabled = true;
    this.savePreferences();
  }

  disable(): void {
    this.isEnabled = false;
    this.savePreferences();
  }

  toggleEnabled(): boolean {
    this.isEnabled = !this.isEnabled;
    this.savePreferences();
    return this.isEnabled;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }
}

export const celebrationSounds = new CelebrationSounds();
