/**
 * Workout Controller Store
 * Manages the guided automatic workout flow with state machine
 */

import { atom, computed } from 'nanostores';
import type { Workout, Exercise } from '../types/workout';
import { completeExercise, skipExercise as markExerciseSkipped, isExerciseCompleted } from './progressStore';

export const COMPLETION_SOURCE = {
  MANUAL: 'manual',
  TIMER: 'timer',
} as const;

export type CompletionSource = (typeof COMPLETION_SOURCE)[keyof typeof COMPLETION_SOURCE];

export const REST_PURPOSE = {
  BETWEEN_SETS: 'between-sets',
  BETWEEN_EXERCISES: 'between-exercises',
  BETWEEN_PHASES: 'between-phases',
} as const;

export type RestPurpose = (typeof REST_PURPOSE)[keyof typeof REST_PURPOSE];

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
  currentSide: number; // for bilateral exercises (left=1, right=2)
  stepRevision?: number;
  restPurpose?: RestPurpose;
  capturedPrepDuration?: number;
  capturedRestDuration?: number;
  capturedPhaseRestDuration?: number;
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
  currentSide: 1,
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
let generation = 0;

interface CompletionToken {
  generation: number;
  stepRevision: number;
}

function invalidateCallbacks(): void {
  generation += 1;
  stopTimer();
}

function transition(session: WorkoutSession, updates: Partial<WorkoutSession>): WorkoutSession {
  return {
    ...session,
    ...updates,
    stepRevision: (session.stepRevision ?? 0) + 1,
  };
}

function captureDurations(): Pick<WorkoutSession, 'capturedPrepDuration' | 'capturedRestDuration' | 'capturedPhaseRestDuration'> {
  const settings = workoutSettings.get();
  return {
    capturedPrepDuration: settings.prepDuration,
    capturedRestDuration: settings.restDuration,
    capturedPhaseRestDuration: settings.phaseRestDuration,
  };
}

function getDuration(session: WorkoutSession, key: 'prep' | 'rest' | 'phaseRest'): number {
  const settings = workoutSettings.get();
  const captured = {
    prep: session.capturedPrepDuration,
    rest: session.capturedRestDuration,
    phaseRest: session.capturedPhaseRestDuration,
  };
  return captured[key] ?? settings[`${key}Duration` as keyof WorkoutSettings] as number;
}

/**
 * Initialize workout controller with workout data
 */
export function initializeWorkoutController(workout: Workout): void {
  invalidateCallbacks();
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
  invalidateCallbacks();
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
    currentSide: 1,
    stepRevision: 0,
    ...captureDurations(),
  });

  saveSessionState();
}

/**
 * Resume workout from saved state
 */
export function resumeWorkout(savedSession: WorkoutSession): void {
  invalidateCallbacks();
  const session = normalizeSession(savedSession);
  workoutSession.set({ ...session, isPaused: true, pausedTime: session.pausedTime ?? Date.now() });
  saveSessionState();
}

/**
 * Pause the workout
 */
export function pauseWorkout(): void {
  const session = workoutSession.get();
  invalidateCallbacks();
  workoutSession.set(transition(session, {
    isPaused: true,
    pausedTime: Date.now(),
  }));
  saveSessionState();
}

/**
 * Resume from pause
 */
export function resumeFromPause(): void {
  const session = workoutSession.get();
  invalidateCallbacks();
  const resumed = transition(session, {
    isPaused: false,
    pausedTime: null,
  });
  workoutSession.set(resumed);

  // Restart timer if in active state
  if (resumed.workoutState === 'EXERCISE_ACTIVE' ||
      resumed.workoutState === 'REST_PERIOD' ||
      resumed.workoutState === 'EXERCISE_PREP') {
    startTimer(resumed.timeLeft);
  }

  saveSessionState();
}

/**
 * Continue from phase intro
 */
export function continueFromPhaseIntro(): void {
  const session = workoutSession.get();
  const prepDuration = getDuration(session, 'prep');
  const next = transition(session, {
    workoutState: 'EXERCISE_PREP',
    timeLeft: prepDuration,
  });
  workoutSession.set(next);

  startTimer(prepDuration);
  saveSessionState();
}

/**
 * Start exercise after prep countdown
 */
export function startExerciseFromPrep(): void {
  const session = workoutSession.get();
  const exercise = currentExercise.get();

  if (!exercise) return;

  // Duration is already per-side, no need to divide
  const exerciseDuration = exercise.duration || 0;

  // Set initial state for exercise
  const newSession = transition(session, {
    workoutState: 'EXERCISE_ACTIVE',
    currentReps: 0,
    currentSet: 1,
    currentSide: 1,
    timeLeft: exerciseDuration,
  });

  workoutSession.set(newSession);

  // Start timer for timed exercises
  if (exerciseDuration > 0) {
    startTimer(exerciseDuration);
  }

  saveSessionState();
}

/**
 * Complete current exercise (from timer or manual)
 */
export function completeCurrentExercise(): void {
  createCompletionCallback(COMPLETION_SOURCE.MANUAL)();
}

export function createCompletionCallback(source: CompletionSource): () => void {
  const session = workoutSession.get();
  const token: CompletionToken = { generation, stepRevision: session.stepRevision ?? 0 };
  return () => completeCurrentStep(token, source);
}

export function completeCurrentStep(token?: CompletionToken, source: CompletionSource = COMPLETION_SOURCE.MANUAL): void {
  const session = workoutSession.get();
  const phase = currentPhase.get();
  const exercise = currentExercise.get();

  if (token && (token.generation !== generation || token.stepRevision !== (session.stepRevision ?? 0))) return;
  if (session.isPaused || !phase || !exercise) return;
  if (source === COMPLETION_SOURCE.MANUAL && session.workoutState !== 'EXERCISE_ACTIVE') return;

  if (session.workoutState === 'EXERCISE_PREP') {
    startExerciseFromPrep();
    return;
  }

  if (session.workoutState === 'REST_PERIOD') {
    if (session.restPurpose === REST_PURPOSE.BETWEEN_SETS) {
      const duration = exercise.duration || 0;
      const next = transition(session, { workoutState: 'EXERCISE_ACTIVE', currentSet: session.currentSet + 1, currentSide: 1, timeLeft: duration, restPurpose: undefined });
      workoutSession.set(next);
      if (duration > 0) startTimer(duration);
    } else if (session.restPurpose === REST_PURPOSE.BETWEEN_EXERCISES) {
      advanceToNextExercise();
    } else if (session.restPurpose === REST_PURPOSE.BETWEEN_PHASES) {
      workoutSession.set(transition(session, { currentPhaseIndex: session.currentPhaseIndex + 1, currentExerciseIndex: 0, workoutState: 'PHASE_INTRO', restPurpose: undefined, timeLeft: 0 }));
    }
    saveSessionState();
    return;
  }

  if (session.workoutState !== 'EXERCISE_ACTIVE') return;

  const sideCount = (exercise as Exercise & { sides?: number }).sides ?? 1;
  if (session.currentSide < sideCount) {
    const duration = exercise.duration || 0;
    const next = transition(session, { currentSide: session.currentSide + 1, timeLeft: duration });
    workoutSession.set(next);
    if (duration > 0) startTimer(duration);
    saveSessionState();
    return;
  }

  const setCount = exercise.sets ?? 1;
  if (session.currentSet < setCount) {
    const restDuration = getDuration(session, 'rest');
    const next = transition(session, { workoutState: 'REST_PERIOD', currentSide: 1, timeLeft: restDuration, restPurpose: REST_PURPOSE.BETWEEN_SETS });
    workoutSession.set(next);
    startTimer(restDuration);
    saveSessionState();
    return;
  }

  completeExercise(phase.id, exercise.id);

  // Check if this is the last exercise in the phase
  const isLastInPhase = session.currentExerciseIndex === phase.phase.exercises.length - 1;

  if (isLastInPhase) {
    // Check if this is the last phase
    const workout = currentWorkoutData.get();
    const isLastPhase = workout && session.currentPhaseIndex === Object.keys(workout).length - 1;

    if (isLastPhase) {
      // Go to verification screen to check if user really completed everything
      workoutSession.set(transition(session, {
        workoutState: 'WORKOUT_VERIFICATION',
      }));
    } else {
      // Phase complete
      workoutSession.set(transition(session, {
        workoutState: 'PHASE_COMPLETE',
      }));
    }
  } else {
    // Start rest period before next exercise
    const restDuration = getDuration(session, 'rest');
    workoutSession.set(transition(session, {
      workoutState: 'REST_PERIOD',
      timeLeft: restDuration,
      restPurpose: REST_PURPOSE.BETWEEN_EXERCISES,
    }));
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

  workoutSession.set(transition(session, {
    currentExerciseIndex: session.currentExerciseIndex + 1,
    workoutState: 'EXERCISE_ACTIVE',
    timeLeft: exercise.duration || 0,
    currentReps: 0,
    currentSet: 1,
    currentSide: 1,
    restPurpose: undefined,
  }));

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
  const duration = getDuration(session, 'phaseRest');
  workoutSession.set(transition(session, {
    workoutState: 'REST_PERIOD',
    timeLeft: duration,
    restPurpose: REST_PURPOSE.BETWEEN_PHASES,
  }));
  startTimer(duration);

  saveSessionState();
}

/**
 * Skip current exercise (marks as skipped, not completed)
 */
export function skipExercise(): void {
  invalidateCallbacks();

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
    const restDuration = getDuration(session, 'rest');
    workoutSession.set(transition(session, {
      workoutState: 'REST_PERIOD',
      timeLeft: restDuration,
      restPurpose: REST_PURPOSE.BETWEEN_EXERCISES,
    }));
    startTimer(restDuration);
  }

  saveSessionState();
}

/**
 * Go to previous exercise
 */
export function previousExercise(): void {
  invalidateCallbacks();

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
  invalidateCallbacks();

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
  workoutSession.set(transition(session, {
    currentPhaseIndex: phaseIndex,
    currentExerciseIndex: exerciseIndex,
    workoutState: 'EXERCISE_ACTIVE',
    isPaused: shouldPause, // Pause if already completed
    timeLeft: targetExercise.duration || 0,
    currentReps: 0,
    currentSet: 1,
    currentSide: 1,
  }));

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
        const restDuration = getDuration(session, 'rest');
        workoutSession.set(transition(session, {
          currentReps: 0,
          workoutState: 'REST_PERIOD',
          timeLeft: restDuration,
          restPurpose: REST_PURPOSE.BETWEEN_SETS,
        }));
        startTimer(restDuration);
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
  createCompletionCallback(COMPLETION_SOURCE.TIMER)();
}

/**
 * Exit workout
 */
export function exitWorkout(): void {
  invalidateCallbacks();
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
    currentSide: 1,
  });
  clearSessionState();
}

/**
 * Timer management
 */
function startTimer(seconds: number): void {
  stopTimer();

  let remaining = seconds;
  const session = workoutSession.get();
  const completion = createCompletionCallback(COMPLETION_SOURCE.TIMER);

  workoutSession.set({ ...session, timeLeft: remaining });

  timerInterval = setInterval(() => {
    remaining--;
    const currentSession = workoutSession.get();

    if (currentSession.isPaused || currentSession.stepRevision !== session.stepRevision) {
      stopTimer();
      return;
    }

    workoutSession.set({ ...currentSession, timeLeft: remaining });

    if (remaining <= 0) {
      stopTimer();
      completion();
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
    return normalizeSession(JSON.parse(saved));
  } catch {
    return null;
  }
}

function normalizeSession(savedSession: WorkoutSession): WorkoutSession {
  const session = { ...captureDurations(), ...savedSession };

  if (session.workoutState !== 'REST_PERIOD' || session.restPurpose) return session;

  const phase = getPhases()[session.currentPhaseIndex];
  const exercise = phase?.phase.exercises[session.currentExerciseIndex];
  if (!phase || !exercise) return session;

  const restPurpose = session.currentSet < (exercise.sets ?? 1)
    ? REST_PURPOSE.BETWEEN_SETS
    : session.currentExerciseIndex < phase.phase.exercises.length - 1
      ? REST_PURPOSE.BETWEEN_EXERCISES
      : session.currentPhaseIndex < getPhases().length - 1
        ? REST_PURPOSE.BETWEEN_PHASES
        : undefined;

  return { ...session, restPurpose };
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
