/**
 * LocalStorage Utilities
 * Type-safe localStorage operations for progress tracking
 */

import type { ProgressState } from '../types/progress';

const STORAGE_KEY = 'unslump-progress';
const ONBOARDING_KEY = 'unslump-onboarding-seen';

/**
 * Load progress state from localStorage
 */
export function loadProgress(): ProgressState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const data = JSON.parse(saved);
    return data as ProgressState;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}

/**
 * Save progress state to localStorage
 */
export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

/**
 * Reset progress state
 */
export function resetProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting progress:', error);
  }
}

/**
 * Check if onboarding has been seen
 */
export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return false;
  }
}

/**
 * Mark onboarding as seen
 */
export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error marking onboarding:', error);
  }
}

/**
 * Reset onboarding state (for testing)
 */
export function resetOnboarding(): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
}
