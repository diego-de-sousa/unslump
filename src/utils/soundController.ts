/**
 * Sound Controller
 * Manages audio playback for workout: beeps, notifications, and voice synthesis
 */

export type SoundType =
  | 'beep'
  | 'complete'
  | 'phase_complete'
  | 'workout_complete'
  | 'rest';

export interface VoiceAnnouncementOptions {
  text: string;
  lang: 'en' | 'es';
  rate?: number; // 0.5 to 2.0
  pitch?: number; // 0 to 2.0
  volume?: number; // 0 to 1.0
}

class SoundController {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private isVoiceEnabled: boolean = true;
  private masterVolume: number = 1.0;
  private speechSynthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.speechSynthesis = window.speechSynthesis;
      this.initializeAudioContext();
    }
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Load audio files (optional - will fallback to synthesized sounds)
   */
  loadSounds(basePath: string = '/sounds'): void {
    const soundFiles: Record<SoundType, string> = {
      beep: `${basePath}/beep.mp3`,
      complete: `${basePath}/complete.mp3`,
      phase_complete: `${basePath}/phase-complete.mp3`,
      workout_complete: `${basePath}/workout-complete.mp3`,
      rest: `${basePath}/rest.mp3`,
    };

    Object.entries(soundFiles).forEach(([type, path]) => {
      const audio = new Audio(path);
      audio.preload = 'none'; // Don't preload to avoid 404 errors in console

      // Only add to map if file loads successfully
      audio.addEventListener('error', () => {
        console.log(`Audio file not found: ${path}, using synthesized sounds`);
      });

      this.sounds.set(type as SoundType, audio);
    });
  }

  /**
   * Play a sound effect
   */
  playSound(type: SoundType): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(type);
    if (!sound) {
      // Fallback to synthesized sounds
      this.playSynthesizedSound(type);
      return;
    }

    // Clone and play to allow overlapping sounds
    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.volume = this.masterVolume;
    clone.play().catch(() => {
      // If audio file fails, fallback to synthesized sound
      this.playSynthesizedSound(type);
    });
  }

  /**
   * Play synthesized sound based on type
   */
  private playSynthesizedSound(type: SoundType): void {
    switch (type) {
      case 'beep':
        this.playSynthesizedBeep(800, 100);
        break;
      case 'complete':
        // Success chime (two ascending notes)
        this.playSynthesizedBeep(600, 100);
        setTimeout(() => this.playSynthesizedBeep(800, 150), 100);
        break;
      case 'phase_complete':
        // Celebration (three ascending notes)
        this.playSynthesizedBeep(600, 100);
        setTimeout(() => this.playSynthesizedBeep(800, 100), 100);
        setTimeout(() => this.playSynthesizedBeep(1000, 200), 200);
        break;
      case 'workout_complete':
        // Victory fanfare (ascending scale)
        this.playSynthesizedBeep(600, 150);
        setTimeout(() => this.playSynthesizedBeep(700, 150), 150);
        setTimeout(() => this.playSynthesizedBeep(800, 150), 300);
        setTimeout(() => this.playSynthesizedBeep(1000, 300), 450);
        break;
      case 'rest':
        // Rest indicator (low gentle tone)
        this.playSynthesizedBeep(400, 200);
        break;
    }
  }

  /**
   * Play synthesized beep using Web Audio API (fallback)
   */
  private playSynthesizedBeep(frequency: number = 800, duration: number = 100): void {
    if (!this.audioContext || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  /**
   * Play countdown beeps (for last 3 seconds)
   */
  playCountdownBeep(secondsLeft: number): void {
    if (secondsLeft <= 3 && secondsLeft > 0) {
      this.playSound('beep');
    }
  }

  /**
   * Speak text using Web Speech API
   */
  speak(options: VoiceAnnouncementOptions): void {
    if (!this.speechSynthesis || !this.isVoiceEnabled || this.isMuted) return;

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = options.lang === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = (options.volume || 1.0) * this.masterVolume;

    // Try to find the best voice for the language
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith(options.lang) && voice.localService
    ) || voices.find(voice =>
      voice.lang.startsWith(options.lang)
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Stop any ongoing speech
   */
  stopSpeech(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Announce phase introduction
   */
  announcePhase(phaseNumber: number, phaseName: string, lang: 'en' | 'es'): void {
    const text = lang === 'es'
      ? `Fase ${phaseNumber}: ${phaseName}`
      : `Phase ${phaseNumber}: ${phaseName}`;

    this.speak({ text, lang });
  }

  /**
   * Announce next exercise
   */
  announceExercise(exerciseName: string, lang: 'en' | 'es'): void {
    const prefix = lang === 'es' ? 'Siguiente ejercicio:' : 'Next exercise:';
    this.speak({ text: `${prefix} ${exerciseName}`, lang });
  }

  /**
   * Announce countdown (3, 2, 1, Begin!)
   */
  announceCountdown(lang: 'en' | 'es'): void {
    const text = lang === 'es'
      ? 'Tres... Dos... Uno... ¡Comienza!'
      : 'Three... Two... One... Begin!';

    this.speak({ text, lang });
  }

  /**
   * Announce exercise completion
   */
  announceExerciseComplete(lang: 'en' | 'es'): void {
    this.playSound('complete');

    const text = lang === 'es'
      ? 'Ejercicio completo. ¡Buen trabajo!'
      : 'Exercise complete. Good job!';

    this.speak({ text, lang });
  }

  /**
   * Announce phase completion
   */
  announcePhaseComplete(phaseNumber: number, lang: 'en' | 'es'): void {
    this.playSound('phase_complete');

    const text = lang === 'es'
      ? `¡Fase ${phaseNumber} completa!`
      : `Phase ${phaseNumber} complete!`;

    this.speak({ text, lang });
  }

  /**
   * Announce workout completion
   */
  announceWorkoutComplete(lang: 'en' | 'es'): void {
    this.playSound('workout_complete');

    const text = lang === 'es'
      ? '¡Entrenamiento completo! ¡Excelente trabajo!'
      : 'Workout complete! Excellent work!';

    this.speak({ text, lang });
  }

  /**
   * Announce rest period
   */
  announceRest(seconds: number, lang: 'en' | 'es'): void {
    this.playSound('rest');

    const text = lang === 'es'
      ? `Descansa por ${seconds} segundos`
      : `Rest for ${seconds} seconds`;

    this.speak({ text, lang });
  }

  /**
   * Announce get ready
   */
  announceGetReady(exerciseName: string, lang: 'en' | 'es'): void {
    const text = lang === 'es'
      ? `Prepárate para ${exerciseName}`
      : `Get ready for ${exerciseName}`;

    this.speak({ text, lang });
  }

  /**
   * Set muted state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopSpeech();
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeech();
    }
    return this.isMuted;
  }

  /**
   * Set voice enabled state
   */
  setVoiceEnabled(enabled: boolean): void {
    this.isVoiceEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    }
  }

  /**
   * Set master volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current muted state
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get voice enabled state
   */
  getVoiceEnabled(): boolean {
    return this.isVoiceEnabled;
  }

  /**
   * Get master volume
   */
  getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Check if speech synthesis is supported
   */
  isSpeechSupported(): boolean {
    return !!this.speechSynthesis;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return [];
    return this.speechSynthesis.getVoices();
  }
}

// Singleton instance
export const soundController = new SoundController();

// Initialize voices (they load asynchronously)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices loaded
  };
}
