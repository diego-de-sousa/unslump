/**
 * Date Reset Utilities
 * Handles daily reset logic for workout sessions
 */

import type { ProgressState } from '../types/progress';
import { loadProgress, saveProgress } from './storage';

/**
 * Check if it's a new day and reset progress if needed
 * Returns true if progress was reset
 */
export function checkAndResetIfNewDay(): boolean {
  const saved = loadProgress();
  if (!saved) return false;

  const lastSessionDate = saved.lastSessionDate;
  if (!lastSessionDate) return false;

  const today = new Date().toDateString();
  const lastSession = new Date(lastSessionDate).toDateString();

  // If it's a new day, reset the session
  if (today !== lastSession) {
    const resetState: ProgressState = {
      completed: [],
      level: saved.level, // Preserve level preference
      sessionLocked: false,
      lastSessionDate: new Date().toISOString()
    };
    saveProgress(resetState);
    return true;
  }

  return false;
}

/**
 * Get whether the current session is locked (all exercises completed)
 */
export function isSessionLocked(): boolean {
  const saved = loadProgress();
  return saved?.sessionLocked ?? false;
}

/**
 * Check if the session should be locked based on completion
 */
export function shouldLockSession(completedCount: number, totalCount: number): boolean {
  return completedCount === totalCount && completedCount > 0;
}
