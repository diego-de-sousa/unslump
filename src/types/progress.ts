/**
 * Progress Tracking Type Definitions
 * Types for exercise completion and session state
 */

export interface ProgressState {
  completed: string[]; // Array of "phaseId-exerciseId" strings
  level: string;
  sessionLocked: boolean;
  lastSessionDate: string;
}

export interface PhaseProgress {
  phaseId: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface CompletionStats {
  totalExercises: number;
  completedExercises: number;
  completedPhases: string[];
  overallPercentage: number;
  phaseProgress: PhaseProgress[];
}

export interface CelebrationEvent {
  type: 'phase' | 'complete';
  phaseId?: string;
  timestamp: number;
}
