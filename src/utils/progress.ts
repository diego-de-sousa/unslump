/**
 * Progress Calculation Utilities
 * Functions for calculating and tracking workout progress
 */

import type { Workout, PhaseId } from '../types/workout';
import type { PhaseProgress, CompletionStats } from '../types/progress';

/**
 * Generate exercise key for tracking
 */
export function getExerciseKey(phaseId: string, exerciseId: string): string {
  return `${phaseId}-${exerciseId}`;
}

/**
 * Parse exercise key into phase and exercise IDs
 */
export function parseExerciseKey(key: string): { phaseId: string; exerciseId: string } {
  const firstDashIndex = key.indexOf('-');
  const phaseId = key.substring(0, firstDashIndex);
  const exerciseId = key.substring(firstDashIndex + 1);
  return { phaseId, exerciseId };
}

/**
 * Calculate progress for a specific phase
 */
export function calculatePhaseProgress(
  phaseId: PhaseId,
  phase: any,
  completedExercises: Set<string>
): PhaseProgress {
  const total = phase.exercises.length;
  const completed = phase.exercises.filter((ex: any) =>
    completedExercises.has(getExerciseKey(phaseId, ex.id))
  ).length;

  return {
    phaseId,
    total,
    completed,
    percentage: total > 0 ? (completed / total) * 100 : 0
  };
}

/**
 * Calculate overall completion stats
 */
export function calculateCompletionStats(
  workout: Workout,
  completedExercises: Set<string>
): CompletionStats {
  const phaseProgress: PhaseProgress[] = [];
  let totalExercises = 0;
  let completedCount = 0;
  const completedPhases: string[] = [];

  for (const [phaseId, phase] of Object.entries(workout)) {
    const progress = calculatePhaseProgress(phaseId as PhaseId, phase, completedExercises);
    phaseProgress.push(progress);

    totalExercises += progress.total;
    completedCount += progress.completed;

    // Mark phase as completed if all exercises done
    if (progress.completed === progress.total && progress.total > 0) {
      completedPhases.push(phaseId);
    }
  }

  return {
    totalExercises,
    completedExercises: completedCount,
    completedPhases,
    overallPercentage: totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0,
    phaseProgress
  };
}

/**
 * Check if a phase is completed
 */
export function isPhaseCompleted(
  phaseId: PhaseId,
  phase: any,
  completedExercises: Set<string>
): boolean {
  return phase.exercises.every((ex: any) =>
    completedExercises.has(getExerciseKey(phaseId, ex.id))
  );
}

/**
 * Get list of completed phases
 */
export function getCompletedPhases(
  workout: Workout,
  completedExercises: Set<string>
): PhaseId[] {
  return (Object.entries(workout) as [PhaseId, any][])
    .filter(([phaseId, phase]) => isPhaseCompleted(phaseId, phase, completedExercises))
    .map(([phaseId]) => phaseId);
}

/**
 * Check if all exercises are completed
 */
export function isWorkoutCompleted(
  workout: Workout,
  completedExercises: Set<string>
): boolean {
  let totalExercises = 0;

  for (const [phaseId, phase] of Object.entries(workout)) {
    for (const exercise of phase.exercises) {
      totalExercises++;

      if (!completedExercises.has(getExerciseKey(phaseId, exercise.id))) {
        return false;
      }
    }
  }

  return totalExercises > 0;
}
