/**
 * Haptics Controller
 * Manages vibration feedback using the Vibration API
 */

export type HapticPattern =
  | 'light' // Quick tap
  | 'medium' // Standard feedback
  | 'heavy' // Strong feedback
  | 'success' // Pattern for success (e.g., exercise complete)
  | 'warning' // Pattern for warnings
  | 'countdown' // Pattern for countdown beeps
  | 'double' // Double tap pattern
  | 'triple'; // Triple tap pattern

class HapticsController {
  private isEnabled: boolean = true;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      this.isSupported = true;
    }
  }

  /**
   * Vibrate with a specific pattern
   */
  vibrate(pattern: HapticPattern): void {
    if (!this.isEnabled || !this.isSupported) return;

    const patterns: Record<HapticPattern, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 40,
      success: [20, 50, 20, 50, 40], // Two short, one medium
      warning: [50, 100, 50], // Long, pause, long
      countdown: [30], // Quick beep
      double: [20, 50, 20], // Two quick
      triple: [20, 50, 20, 50, 20], // Three quick
    };

    const vibrationPattern = patterns[pattern];

    try {
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.warn('Vibration API error:', error);
    }
  }

  /**
   * Vibrate with custom duration or pattern
   */
  vibrateCustom(pattern: number | number[]): void {
    if (!this.isEnabled || !this.isSupported) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Vibration API error:', error);
    }
  }

  /**
   * Stop any ongoing vibration
   */
  stop(): void {
    if (!this.isSupported) return;

    try {
      navigator.vibrate(0);
    } catch (error) {
      console.warn('Vibration API error:', error);
    }
  }

  /**
   * Haptic feedback for rep completion
   */
  onRepComplete(): void {
    this.vibrate('light');
  }

  /**
   * Haptic feedback for set completion
   */
  onSetComplete(): void {
    this.vibrate('double');
  }

  /**
   * Haptic feedback for exercise completion
   */
  onExerciseComplete(): void {
    this.vibrate('success');
  }

  /**
   * Haptic feedback for phase completion
   */
  onPhaseComplete(): void {
    this.vibrate('success');
  }

  /**
   * Haptic feedback for workout completion
   */
  onWorkoutComplete(): void {
    // Triple success pattern for workout complete
    setTimeout(() => this.vibrate('success'), 0);
    setTimeout(() => this.vibrate('success'), 300);
    setTimeout(() => this.vibrate('success'), 600);
  }

  /**
   * Haptic feedback for countdown beep
   */
  onCountdownBeep(): void {
    this.vibrate('countdown');
  }

  /**
   * Haptic feedback for timer start
   */
  onTimerStart(): void {
    this.vibrate('medium');
  }

  /**
   * Haptic feedback for pause
   */
  onPause(): void {
    this.vibrate('medium');
  }

  /**
   * Haptic feedback for resume
   */
  onResume(): void {
    this.vibrate('medium');
  }

  /**
   * Haptic feedback for skip
   */
  onSkip(): void {
    this.vibrate('light');
  }

  /**
   * Haptic feedback for navigation (back/forward)
   */
  onNavigate(): void {
    this.vibrate('light');
  }

  /**
   * Haptic feedback for button press
   */
  onButtonPress(): void {
    this.vibrate('light');
  }

  /**
   * Haptic feedback for error/warning
   */
  onWarning(): void {
    this.vibrate('warning');
  }

  /**
   * Set enabled state
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Toggle enabled state
   */
  toggleEnabled(): boolean {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.stop();
    }
    return this.isEnabled;
  }

  /**
   * Get enabled state
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check if vibration is supported
   */
  getSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Test vibration (for settings)
   */
  test(): void {
    this.vibrate('success');
  }
}

// Singleton instance
export const haptics = new HapticsController();
