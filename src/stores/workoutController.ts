/**
 * Workout Controller Store
 * Manages the guided automatic workout flow with state machine
 */

import { atom, computed } from 'nanostores';
import type { Workout, Exercise } from '../types/workout';
import { completeExercise, skipExercise as markExerciseSkipped, isExerciseCompleted } from './progressStore';

// Workout States
export type WorkoutState =
  | 'IDLE'
  | 'PHASE_INTRO'
  | 'EXERCISE_PREP'
  | 'EXERCISE_ACTIVE'
  | 'REST_PERIOD'
  | 'PHASE_COMPLETE'
  | 'WORKOUT_VERIFICATION' // Check if user really completed everything
  | 'WORKOUT_COMPLETE';

export interface WorkoutSession {
  currentPhaseIndex: number;
  currentExerciseIndex: number;
  workoutState: WorkoutState;
  isPaused: boolean;
  startTime: number | null;
  pausedTime: number | null;
  timeLeft: number; // for current timer (exercise, rest, or prep)
  currentReps: number; // for rep-based exercises
  currentSet: number; // for exercises with sets
}

// Settings
export interface WorkoutSettings {
  restDuration: number; // seconds between exercises
  phaseRestDuration: number; // seconds between phases
  prepDuration: number; // seconds for "get ready" countdown
  soundEnabled: boolean;
  voiceEnabled: boolean;
  vibrationEnabled: boolean;
  autoAdvance: boolean;
}

// Core atoms
export const workoutSession = atom<WorkoutSession>({
  currentPhaseIndex: 0,
  currentExerciseIndex: 0,
  workoutState: 'IDLE',
  isPaused: false,
  startTime: null,
  pausedTime: null,
  timeLeft: 0,
  currentReps: 0,
  currentSet: 1,
});

export const workoutSettings = atom<WorkoutSettings>({
  restDuration: 7, // 5-10 seconds as requested
  phaseRestDuration: 10,
  prepDuration: 5,
  soundEnabled: true,
  voiceEnabled: true,
  vibrationEnabled: true,
  autoAdvance: true,
});

export const currentWorkoutData = atom<Workout | null>(null);

// Timer interval reference (for cleanup)
let timerInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Initialize workout controller with workout data
 */
export function initializeWorkoutController(workout: Workout): void {
  currentWorkoutData.set(workout);
}

/**
 * Get all phases as array
 */
function getPhases(): { id: string; phase: any }[] {
  const workout = currentWorkoutData.get();
  if (!workout) return [];

  return Object.entries(workout).map(([id, phase]) => ({ id, phase }));
}

/**
 * Get current phase
 */
export const currentPhase = computed([workoutSession, currentWorkoutData], (session, workout) => {
  if (!workout) return null;
  const phases = getPhases();
  return phases[session.currentPhaseIndex] || null;
});

/**
 * Get current exercise
 */
export const currentExercise = computed([workoutSession, currentPhase], (session, phase) => {
  if (!phase) return null;
  return phase.phase.exercises[session.currentExerciseIndex] || null;
});

/**
 * Get next exercise (for preview during rest)
 */
export const nextExercise = computed([workoutSession, currentWorkoutData], (session, workout) => {
  if (!workout) return null;

  const phases = Object.values(workout);
  const currentPhase = phases[session.currentPhaseIndex];
  if (!currentPhase) return null;

  // Next exercise in same phase
  const nextInPhase = currentPhase.exercises[session.currentExerciseIndex + 1];
  if (nextInPhase) return nextInPhase;

  // First exercise of next phase
  const nextPhase = phases[session.currentPhaseIndex + 1];
  if (nextPhase) return nextPhase.exercises[0];

  return null;
});

/**
 * Get total exercise count
 */
export const totalExercises = computed([currentWorkoutData], (workout) => {
  if (!workout) return 0;
  return Object.values(workout).reduce((sum, phase) => sum + phase.exercises.length, 0);
});

/**
 * Get overall progress (exercise number out of total)
 */
export const overallProgress = computed([workoutSession, currentWorkoutData], (session, workout) => {
  if (!workout) return { current: 0, total: 0 };

  const phases = getPhases();
  let exerciseNumber = 0;

  // Count all exercises in previous phases
  for (let i = 0; i < session.currentPhaseIndex; i++) {
    exerciseNumber += phases[i].phase.exercises.length;
  }

  // Add current exercise index (1-based)
  exerciseNumber += session.currentExerciseIndex + 1;

  const total = Object.values(workout).reduce((sum, phase) => sum + phase.exercises.length, 0);

  return { current: exerciseNumber, total };
});

/**
 * Start the workout from beginning
 */
export function startWorkout(): void {
  workoutSession.set({
    currentPhaseIndex: 0,
    currentExerciseIndex: 0,
    workoutState: 'PHASE_INTRO',
    isPaused: false,
    startTime: Date.now(),
    pausedTime: null,
    timeLeft: 0,
    currentReps: 0,
    currentSet: 1,
  });

  saveSessionState();
}

/**
 * Resume workout from saved state
 */
export function resumeWorkout(savedSession: WorkoutSession): void {
  workoutSession.set({
    ...savedSession,
    isPaused: false,
    pausedTime: null,
  });
}

/**
 * Pause the workout
 */
export function pauseWorkout(): void {
  const session = workoutSession.get();
  workoutSession.set({
    ...session,
    isPaused: true,
    pausedTime: Date.now(),
  });

  stopTimer();
  saveSessionState();
}

/**
 * Resume from pause
 */
export function resumeFromPause(): void {
  const session = workoutSession.get();
  workoutSession.set({
    ...session,
    isPaused: false,
    pausedTime: null,
  });

  // Restart timer if in active state
  if (session.workoutState === 'EXERCISE_ACTIVE' ||
      session.workoutState === 'REST_PERIOD' ||
      session.workoutState === 'EXERCISE_PREP') {
    startTimer(session.timeLeft);
  }

  saveSessionState();
}

/**
 * Continue from phase intro
 */
export function continueFromPhaseIntro(): void {
  const session = workoutSession.get();
  workoutSession.set({
    ...session,
    workoutState: 'EXERCISE_PREP',
    timeLeft: workoutSettings.get().prepDuration,
  });

  startTimer(workoutSettings.get().prepDuration);
  saveSessionState();
}

/**
 * Start exercise after prep countdown
 */
export function startExerciseFromPrep(): void {
  const session = workoutSession.get();
  const exercise = currentExercise.get();

  if (!exercise) return;

  // Set initial state for exercise
  const newSession: WorkoutSession = {
    ...session,
    workoutState: 'EXERCISE_ACTIVE',
    currentReps: 0,
    currentSet: 1,
    timeLeft: exercise.duration || 0,
  };

  workoutSession.set(newSession);

  // Start timer for timed exercises
  if (exercise.duration > 0) {
    startTimer(exercise.duration);
  }

  saveSessionState();
}

/**
 * Complete current exercise (from timer or manual)
 */
export function completeCurrentExercise(): void {
  const session = workoutSession.get();
  const phase = currentPhase.get();
  const exercise = currentExercise.get();

  if (!phase || !exercise) return;

  // Mark as completed in progress store
  completeExercise(phase.id, exercise.id);

  // Check if this is the last exercise in the phase
  const isLastInPhase = session.currentExerciseIndex === phase.phase.exercises.length - 1;

  if (isLastInPhase) {
    // Check if this is the last phase
    const workout = currentWorkoutData.get();
    const isLastPhase = workout && session.currentPhaseIndex === Object.keys(workout).length - 1;

    if (isLastPhase) {
      // Go to verification screen to check if user really completed everything
      workoutSession.set({
        ...session,
        workoutState: 'WORKOUT_VERIFICATION',
      });
    } else {
      // Phase complete
      workoutSession.set({
        ...session,
        workoutState: 'PHASE_COMPLETE',
      });
    }
  } else {
    // Start rest period before next exercise
    const restDuration = workoutSettings.get().restDuration;
    workoutSession.set({
      ...session,
      workoutState: 'REST_PERIOD',
      timeLeft: restDuration,
    });
    startTimer(restDuration);
  }

  saveSessionState();
}

/**
 * Advance to next exercise after rest (goes directly to active)
 */
export function advanceToNextExercise(): void {
  const session = workoutSession.get();
  const exercise = getExerciseAtIndex(session.currentPhaseIndex, session.currentExerciseIndex + 1);

  if (!exercise) return;

  workoutSession.set({
    ...session,
    currentExerciseIndex: session.currentExerciseIndex + 1,
    workoutState: 'EXERCISE_ACTIVE',
    timeLeft: exercise.duration || 0,
    currentReps: 0,
    currentSet: 1,
  });

  // Start timer for timed exercises
  if (exercise.duration > 0) {
    startTimer(exercise.duration);
  }

  saveSessionState();
}

function getExerciseAtIndex(phaseIndex: number, exerciseIndex: number) {
  const workout = currentWorkoutData.get();
  if (!workout) return null;

  const phases = Object.values(workout);
  const phase = phases[phaseIndex];
  if (!phase) return null;

  return phase.exercises[exerciseIndex] || null;
}

/**
 * Advance to next phase
 */
export function advanceToNextPhase(): void {
  const session = workoutSession.get();

  workoutSession.set({
    ...session,
    currentPhaseIndex: session.currentPhaseIndex + 1,
    currentExerciseIndex: 0,
    workoutState: 'PHASE_INTRO',
  });

  saveSessionState();
}

/**
 * Skip current exercise (marks as skipped, not completed)
 */
export function skipExercise(): void {
  stopTimer();

  const session = workoutSession.get();
  const phase = currentPhase.get();
  const exercise = currentExercise.get();

  if (!phase || !exercise) return;

  // Mark as skipped in progress store
  markExerciseSkipped(phase.id, exercise.id);

  const isLastInPhase = session.currentExerciseIndex === phase.phase.exercises.length - 1;

  if (isLastInPhase) {
    const workout = currentWorkoutData.get();
    const isLastPhase = workout && session.currentPhaseIndex === Object.keys(workout).length - 1;

    if (isLastPhase) {
      workoutSession.set({ ...session, workoutState: 'WORKOUT_VERIFICATION' });
    } else {
      workoutSession.set({ ...session, workoutState: 'PHASE_COMPLETE' });
    }
  } else {
    const restDuration = workoutSettings.get().restDuration;
    workoutSession.set({
      ...session,
      workoutState: 'REST_PERIOD',
      timeLeft: restDuration,
    });
    startTimer(restDuration);
  }

  saveSessionState();
}

/**
 * Go to previous exercise
 */
export function previousExercise(): void {
  stopTimer();

  const session = workoutSession.get();

  if (session.currentExerciseIndex > 0) {
    // Previous exercise in same phase
    workoutSession.set({
      ...session,
      currentExerciseIndex: session.currentExerciseIndex - 1,
      workoutState: 'EXERCISE_PREP',
      timeLeft: workoutSettings.get().prepDuration,
    });
    startTimer(workoutSettings.get().prepDuration);
  } else if (session.currentPhaseIndex > 0) {
    // Last exercise of previous phase
    const phases = getPhases();
    const previousPhase = phases[session.currentPhaseIndex - 1];

    workoutSession.set({
      ...session,
      currentPhaseIndex: session.currentPhaseIndex - 1,
      currentExerciseIndex: previousPhase.phase.exercises.length - 1,
      workoutState: 'EXERCISE_PREP',
      timeLeft: workoutSettings.get().prepDuration,
    });
    startTimer(workoutSettings.get().prepDuration);
  }

  saveSessionState();
}

/**
 * Jump to a specific exercise (for navigation)
 * Goes directly to the exercise without prep countdown
 */
export function jumpToExercise(phaseIndex: number, exerciseIndex: number): void {
  stopTimer();

  const workout = currentWorkoutData.get();
  if (!workout) return;

  const phases = getPhases();
  const targetPhase = phases[phaseIndex];
  if (!targetPhase) return;

  const targetExercise = targetPhase.phase.exercises[exerciseIndex];
  if (!targetExercise) return;

  const session = workoutSession.get();

  console.log('[jumpToExercise] Jumping to:', targetExercise.name, 'Phase:', phaseIndex, 'Exercise:', exerciseIndex);

  // Check if exercise is already completed
  const alreadyCompleted = isExerciseCompleted(targetPhase.id, targetExercise.id);
  console.log('[jumpToExercise] Exercise already completed?', alreadyCompleted);

  // CRITICAL: Always unpause when jumping to ensure timer works (unless already completed)
  const wasPaused = session.isPaused;
  const shouldPause = alreadyCompleted; // Pause if already completed to show completed state

  // Jump directly to the exercise (no prep countdown for manual navigation)
  workoutSession.set({
    ...session,
    currentPhaseIndex: phaseIndex,
    currentExerciseIndex: exerciseIndex,
    workoutState: 'EXERCISE_ACTIVE',
    isPaused: shouldPause, // Pause if already completed
    timeLeft: targetExercise.duration || 0,
    currentReps: 0,
    currentSet: 1,
  });

  console.log('[jumpToExercise] State updated, starting timer for duration:', targetExercise.duration, 'Already completed:', alreadyCompleted);

  // Only start timer if NOT already completed and has duration
  if (!alreadyCompleted && targetExercise.duration > 0) {
    startTimer(targetExercise.duration);
  }

  // Update UI
  if (typeof window !== 'undefined' && (window as any).updatePauseUI) {
    const finalPauseState = shouldPause;
    console.log('[jumpToExercise] Updating UI to pause state:', finalPauseState);
    (window as any).updatePauseUI(finalPauseState);
  }

  saveSessionState();
  console.log('[jumpToExercise] Jump complete');
}

/**
 * Continue from verification to workout complete (only if everything is done)
 */
export function confirmWorkoutComplete(): void {
  const session = workoutSession.get();
  workoutSession.set({
    ...session,
    workoutState: 'WORKOUT_COMPLETE',
  });
  saveSessionState();
}

/**
 * Increment rep counter (for rep-based exercises)
 */
export function incrementRep(): void {
  const session = workoutSession.get();
  const exercise = currentExercise.get();

  if (!exercise) return;

  const newReps = session.currentReps + 1;

  // Check if exercise has sets
  if (exercise.sets) {
    // Rep-based with sets
    const repsPerSet = parseInt(exercise.reps?.match(/\d+/)?.[0] || '0');

    if (newReps >= repsPerSet) {
      // Completed a set
      if (session.currentSet < exercise.sets) {
        // More sets remaining - brief rest between sets
        workoutSession.set({
          ...session,
          currentSet: session.currentSet + 1,
          currentReps: 0,
          workoutState: 'REST_PERIOD',
          timeLeft: 10, // 10 seconds between sets
        });
        startTimer(10);
      } else {
        // All sets complete - finish exercise
        completeCurrentExercise();
      }
    } else {
      // Continue counting reps in this set
      workoutSession.set({ ...session, currentReps: newReps });
    }
  } else {
    // Simple rep counter without sets
    workoutSession.set({ ...session, currentReps: newReps });
  }

  saveSessionState();
}

/**
 * Manual completion for rep exercises (user confirms they're done)
 */
export function confirmRepExerciseComplete(): void {
  completeCurrentExercise();
}

/**
 * Skip rest period
 */
export function skipRest(): void {
  stopTimer();

  const session = workoutSession.get();

  // If resting between sets, go back to exercise
  const exercise = currentExercise.get();
  if (exercise && exercise.sets && session.currentSet <= exercise.sets) {
    startExerciseFromPrep();
  } else {
    // Otherwise advance to next exercise
    advanceToNextExercise();
  }
}

/**
 * Exit workout
 */
export function exitWorkout(): void {
  stopTimer();
  workoutSession.set({
    currentPhaseIndex: 0,
    currentExerciseIndex: 0,
    workoutState: 'IDLE',
    isPaused: false,
    startTime: null,
    pausedTime: null,
    timeLeft: 0,
    currentReps: 0,
    currentSet: 1,
  });
  clearSessionState();
}

/**
 * Timer management
 */
function startTimer(seconds: number): void {
  stopTimer(); // Clear any existing timer

  let remaining = seconds;
  const session = workoutSession.get();

  workoutSession.set({ ...session, timeLeft: remaining });

  timerInterval = setInterval(() => {
    remaining--;
    const currentSession = workoutSession.get();

    if (currentSession.isPaused) {
      stopTimer();
      return;
    }

    workoutSession.set({ ...currentSession, timeLeft: remaining });

    if (remaining <= 0) {
      stopTimer();
      handleTimerComplete();
    }
  }, 1000);
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Handle timer completion
 */
function handleTimerComplete(): void {
  const session = workoutSession.get();

  switch (session.workoutState) {
    case 'EXERCISE_PREP':
      startExerciseFromPrep();
      break;
    case 'EXERCISE_ACTIVE':
      completeCurrentExercise();
      break;
    case 'REST_PERIOD':
      advanceToNextExercise();
      break;
  }
}

/**
 * Update settings
 */
export function updateSettings(newSettings: Partial<WorkoutSettings>): void {
  const current = workoutSettings.get();
  workoutSettings.set({ ...current, ...newSettings });
  saveSettingsState();
}

/**
 * Persistence
 */
const SESSION_KEY = 'unslump-workout-session';
const SETTINGS_KEY = 'unslump-workout-settings';

function saveSessionState(): void {
  const session = workoutSession.get();
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSessionState(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function loadSessionState(): WorkoutSession | null {
  const saved = localStorage.getItem(SESSION_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function saveSettingsState(): void {
  const settings = workoutSettings.get();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettingsState(): void {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return;

  try {
    const settings = JSON.parse(saved);
    workoutSettings.set(settings);
  } catch {
    // Ignore invalid settings
  }
}
