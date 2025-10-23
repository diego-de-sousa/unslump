/**
 * Progress Store
 * Centralized state management for exercise completion tracking
 */

import { atom, computed } from 'nanostores';
import type { ProgressState } from '../types/progress';
import type { Workout } from '../types/workout';
import { loadProgress, saveProgress } from '../utils/storage';
import { checkAndResetIfNewDay, shouldLockSession } from '../utils/dateReset';
import {
  getExerciseKey,
  calculateCompletionStats,
  isWorkoutCompleted
} from '../utils/progress';

// Core state atoms
export const completedExercises = atom<Set<string>>(new Set());
export const sessionLocked = atom<boolean>(false);
export const currentWorkout = atom<Workout | null>(null);

/**
 * Initialize progress store with workout data
 */
export function initializeProgress(workout: Workout): void {
  currentWorkout.set(workout);

  // Check for daily reset
  const wasReset = checkAndResetIfNewDay();

  // Load saved progress
  const saved = loadProgress();
  if (saved && !wasReset) {
    completedExercises.set(new Set(saved.completed));
    sessionLocked.set(saved.sessionLocked ?? false);
  }
}

/**
 * Toggle exercise completion
 */
export function toggleExerciseCompletion(phaseId: string, exerciseId: string): boolean {
  const key = getExerciseKey(phaseId, exerciseId);
  const current = completedExercises.get();
  const newSet = new Set(current);

  let isCompleted: boolean;
  if (newSet.has(key)) {
    newSet.delete(key);
    isCompleted = false;
  } else {
    newSet.add(key);
    isCompleted = true;
  }

  completedExercises.set(newSet);
  saveProgressState();

  return isCompleted;
}

/**
 * Mark exercise as completed
 */
export function completeExercise(phaseId: string, exerciseId: string): void {
  const key = getExerciseKey(phaseId, exerciseId);
  const current = completedExercises.get();

  if (!current.has(key)) {
    const newSet = new Set(current);
    newSet.add(key);
    completedExercises.set(newSet);
    saveProgressState();
  }
}

/**
 * Reset all progress
 */
export function resetProgress(): void {
  completedExercises.set(new Set());
  sessionLocked.set(false);
  saveProgressState();
}

/**
 * Save current state to localStorage
 */
function saveProgressState(): void {
  const workout = currentWorkout.get();
  if (!workout) return;

  const completed = Array.from(completedExercises.get());
  const total = Object.values(workout).reduce((sum, phase) => sum + phase.exercises.length, 0);

  // Lock session if all exercises completed
  const locked = shouldLockSession(completed.length, total);
  sessionLocked.set(locked);

  const state: ProgressState = {
    completed,
    level: 'principiante', // Will be synced from levelStore
    sessionLocked: locked,
    lastSessionDate: new Date().toISOString()
  };

  saveProgress(state);
}

/**
 * Computed: Overall completion stats
 */
export const completionStats = computed(
  [completedExercises, currentWorkout],
  (completed, workout) => {
    if (!workout) return null;
    return calculateCompletionStats(workout, completed);
  }
);

/**
 * Computed: Is workout fully completed
 */
export const isFullyCompleted = computed(
  [completedExercises, currentWorkout],
  (completed, workout) => {
    if (!workout) return false;
    return isWorkoutCompleted(workout, completed);
  }
);

/**
 * Check if a specific exercise is completed
 */
export function isExerciseCompleted(phaseId: string, exerciseId: string): boolean {
  const key = getExerciseKey(phaseId, exerciseId);
  return completedExercises.get().has(key);
}
