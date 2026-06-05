import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import {
  workoutSession,
  workoutSettings,
  currentWorkoutData,
  currentPhase,
  currentExercise,
  nextExercise,
  totalExercises,
  overallProgress,
  initializeWorkoutController,
  startWorkout,
  resumeWorkout,
  pauseWorkout,
  resumeFromPause,
  continueFromPhaseIntro,
  startExerciseFromPrep,
  completeCurrentExercise,
  advanceToNextExercise,
  advanceToNextPhase,
  skipExercise,
  previousExercise,
  jumpToExercise,
  confirmWorkoutComplete,
  incrementRep,
  confirmRepExerciseComplete,
  skipRest,
  exitWorkout,
  updateSettings,
  loadSessionState,
  loadSettingsState,
  type WorkoutSession
} from '../workoutController';
import * as progressStore from '../progressStore';
import type { Workout } from '../../types/workout';

// Mock progressStore
vi.mock('../progressStore', () => ({
  completeExercise: vi.fn(),
  skipExercise: vi.fn(),
  isExerciseCompleted: vi.fn(() => false),
}));

// Mock timers
vi.useFakeTimers();

// Test workout data
const mockWorkout: Workout = {
  fase1: {
    name: 'Phase 1',
    time: '5 min',
    color: 'blue',
    colorPrimary: 'blue-500',
    colorLight: 'blue-50',
    colorBorder: 'blue-200',
    colorPrimaryHex: '#0000ff',
    colorLightHex: '#f0f0ff',
    colorBorderHex: '#d0d0ff',
    description: 'Test phase 1',
    exercises: [
      { id: 'ex1', name: 'Exercise 1', duration: 60, reps: '10', instructions: 'Do it' },
      { id: 'ex2', name: 'Exercise 2', duration: 30, reps: '5', instructions: 'Do it twice' }
    ]
  },
  fase2: {
    name: 'Phase 2',
    time: '3 min',
    color: 'green',
    colorPrimary: 'green-500',
    colorLight: 'green-50',
    colorBorder: 'green-200',
    colorPrimaryHex: '#00ff00',
    colorLightHex: '#f0fff0',
    colorBorderHex: '#d0ffd0',
    description: 'Test phase 2',
    exercises: [
      { id: 'ex3', name: 'Exercise 3', duration: 45, reps: '8', instructions: 'Do it well' }
    ]
  },
  fase3: {
    name: 'Phase 3',
    time: '4 min',
    color: 'orange',
    colorPrimary: 'orange-500',
    colorLight: 'orange-50',
    colorBorder: 'orange-200',
    colorPrimaryHex: '#ff8800',
    colorLightHex: '#fff0e0',
    colorBorderHex: '#ffd0a0',
    description: 'Test phase 3',
    exercises: [
      { id: 'ex4', name: 'Exercise 4', duration: 40, reps: '12', instructions: 'Do it right' }
    ]
  },
  fase4: {
    name: 'Phase 4',
    time: '6 min',
    color: 'pink',
    colorPrimary: 'pink-500',
    colorLight: 'pink-50',
    colorBorder: 'pink-200',
    colorPrimaryHex: '#ff00ff',
    colorLightHex: '#fff0ff',
    colorBorderHex: '#ffd0ff',
    description: 'Test phase 4',
    exercises: [
      { id: 'ex5', name: 'Exercise 5', duration: 50, reps: '15', instructions: 'Final exercise' }
    ]
  }
};

describe('workoutController', () => {
  beforeEach(() => {
    // Reset state
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

    workoutSettings.set({
      restDuration: 7,
      phaseRestDuration: 10,
      prepDuration: 5,
      soundEnabled: true,
      voiceEnabled: true,
      vibrationEnabled: true,
      autoAdvance: true,
    });

    currentWorkoutData.set(null);

    // Clear mocks
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.clearAllTimers();

    // Mock Date.now for consistent testing
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with workout data', () => {
      initializeWorkoutController(mockWorkout);

      expect(currentWorkoutData.get()).toEqual(mockWorkout);
    });
  });

  describe('computed values', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
    });

    it('should compute currentPhase', () => {
      const phase = currentPhase.get();

      expect(phase).toBeDefined();
      expect(phase?.id).toBe('fase1');
      expect(phase?.phase.name).toBe('Phase 1');
    });

    it('should compute currentExercise', () => {
      const exercise = currentExercise.get();

      expect(exercise).toBeDefined();
      expect(exercise?.id).toBe('ex1');
      expect(exercise?.name).toBe('Exercise 1');
    });

    it('should compute nextExercise for next in same phase', () => {
      const next = nextExercise.get();

      expect(next).toBeDefined();
      expect(next?.id).toBe('ex2');
    });

    it('should compute nextExercise for first of next phase', () => {
      workoutSession.set({
        ...workoutSession.get(),
        currentExerciseIndex: 1, // Last exercise of phase 1
      });

      const next = nextExercise.get();

      expect(next).toBeDefined();
      expect(next?.id).toBe('ex3'); // First of phase 2
    });

    it('should return null for nextExercise when at last exercise', () => {
      workoutSession.set({
        ...workoutSession.get(),
        currentPhaseIndex: 3,
        currentExerciseIndex: 0, // Last exercise of last phase
      });

      const next = nextExercise.get();

      expect(next).toBeNull();
    });

    it('should compute totalExercises', () => {
      expect(totalExercises.get()).toBe(5); // All exercises across four phases
    });

    it('should compute overallProgress', () => {
      const progress = overallProgress.get();

      expect(progress.current).toBe(1);
      expect(progress.total).toBe(5);
    });

    it('should compute overallProgress for different position', () => {
      workoutSession.set({
        ...workoutSession.get(),
        currentPhaseIndex: 1,
        currentExerciseIndex: 0,
      });

      const progress = overallProgress.get();

      expect(progress.current).toBe(3); // 2 from phase 1 + 1 current
      expect(progress.total).toBe(5);
    });
  });

  describe('startWorkout', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
    });

    it('should start workout from beginning', () => {
      startWorkout();

      const session = workoutSession.get();

      expect(session.workoutState).toBe('PHASE_INTRO');
      expect(session.currentPhaseIndex).toBe(0);
      expect(session.currentExerciseIndex).toBe(0);
      expect(session.isPaused).toBe(false);
      expect(session.startTime).toBeTruthy();
    });
  });

  describe('pause and resume', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
    });

    it('should pause workout', () => {
      pauseWorkout();

      const session = workoutSession.get();

      expect(session.isPaused).toBe(true);
      expect(session.pausedTime).toBeTruthy();
    });

    it('should resume from pause', () => {
      pauseWorkout();
      resumeFromPause();

      const session = workoutSession.get();

      expect(session.isPaused).toBe(false);
      expect(session.pausedTime).toBeNull();
    });
  });

  describe('phase flow', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
    });

    it('should continue from phase intro to exercise prep', () => {
      continueFromPhaseIntro();

      const session = workoutSession.get();

      expect(session.workoutState).toBe('EXERCISE_PREP');
      expect(session.timeLeft).toBe(5); // prepDuration
    });

    it('should start exercise after prep countdown', () => {
      continueFromPhaseIntro();

      // Fast-forward through prep countdown
      vi.advanceTimersByTime(5000);

      const session = workoutSession.get();

      expect(session.workoutState).toBe('EXERCISE_ACTIVE');
    });

    it('should advance to next phase', () => {
      advanceToNextPhase();

      const session = workoutSession.get();

      expect(session.currentPhaseIndex).toBe(1);
      expect(session.currentExerciseIndex).toBe(0);
      expect(session.workoutState).toBe('PHASE_INTRO');
    });
  });

  describe('exercise flow', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
      continueFromPhaseIntro();
      vi.advanceTimersByTime(5000); // Complete prep
    });

    it('should be in EXERCISE_ACTIVE after prep', () => {
      const session = workoutSession.get();

      expect(session.workoutState).toBe('EXERCISE_ACTIVE');
      expect(session.timeLeft).toBe(60); // Duration of ex1
    });

    it('should auto-complete exercise when timer ends', () => {
      // Advance through exercise duration
      vi.advanceTimersByTime(60000);

      const session = workoutSession.get();

      expect(progressStore.completeExercise).toHaveBeenCalledWith('fase1', 'ex1');
      expect(session.workoutState).toBe('REST_PERIOD');
    });

    it('should advance to next exercise after rest', () => {
      // Complete first exercise
      vi.advanceTimersByTime(60000);

      // Advance through rest
      vi.advanceTimersByTime(7000);

      const session = workoutSession.get();

      expect(session.currentExerciseIndex).toBe(1);
      expect(session.workoutState).toBe('EXERCISE_ACTIVE');
    });

    it('should complete exercise manually', () => {
      completeCurrentExercise();

      const session = workoutSession.get();

      expect(progressStore.completeExercise).toHaveBeenCalledWith('fase1', 'ex1');
      expect(session.workoutState).toBe('REST_PERIOD');
    });

    it('should move to PHASE_COMPLETE when last exercise in phase completes', () => {
      // Move to last exercise of phase 1
      workoutSession.set({
        ...workoutSession.get(),
        currentExerciseIndex: 1,
      });

      completeCurrentExercise();

      const session = workoutSession.get();

      expect(session.workoutState).toBe('PHASE_COMPLETE');
    });

    it('should move to WORKOUT_VERIFICATION when last exercise completes', () => {
      // Move to last exercise of last phase
      workoutSession.set({
        ...workoutSession.get(),
        currentPhaseIndex: 3,
        currentExerciseIndex: 0,
      });

      completeCurrentExercise();

      const session = workoutSession.get();

      expect(session.workoutState).toBe('WORKOUT_VERIFICATION');
    });
  });

  describe('skipExercise', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
      continueFromPhaseIntro();
      vi.advanceTimersByTime(5000);
    });

    it('should skip exercise and mark as skipped', () => {
      skipExercise();

      expect(progressStore.skipExercise).toHaveBeenCalledWith('fase1', 'ex1');

      const session = workoutSession.get();
      expect(session.workoutState).toBe('REST_PERIOD');
    });

    it('should move to PHASE_COMPLETE when skipping last exercise in phase', () => {
      workoutSession.set({
        ...workoutSession.get(),
        currentExerciseIndex: 1,
      });

      skipExercise();

      const session = workoutSession.get();
      expect(session.workoutState).toBe('PHASE_COMPLETE');
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
    });

    it('should jump to specific exercise', () => {
      jumpToExercise(1, 0); // Jump to phase 2, exercise 1

      const session = workoutSession.get();

      expect(session.currentPhaseIndex).toBe(1);
      expect(session.currentExerciseIndex).toBe(0);
      expect(session.workoutState).toBe('EXERCISE_ACTIVE');
    });

    it('should start timer when jumping to timed exercise', () => {
      jumpToExercise(1, 0);

      const session = workoutSession.get();

      expect(session.timeLeft).toBe(45); // Duration of ex3
    });

    it('should go to previous exercise', () => {
      workoutSession.set({
        ...workoutSession.get(),
        currentExerciseIndex: 1,
      });

      previousExercise();

      const session = workoutSession.get();

      expect(session.currentExerciseIndex).toBe(0);
      expect(session.workoutState).toBe('EXERCISE_PREP');
    });

    it('should go to last exercise of previous phase', () => {
      workoutSession.set({
        ...workoutSession.get(),
        currentPhaseIndex: 1,
        currentExerciseIndex: 0,
      });

      previousExercise();

      const session = workoutSession.get();

      expect(session.currentPhaseIndex).toBe(0);
      expect(session.currentExerciseIndex).toBe(1); // Last exercise of phase 1
    });

    it('should not go to previous if at first exercise', () => {
      const beforeSession = workoutSession.get();
      previousExercise();
      const afterSession = workoutSession.get();

      expect(afterSession.currentPhaseIndex).toBe(beforeSession.currentPhaseIndex);
      expect(afterSession.currentExerciseIndex).toBe(beforeSession.currentExerciseIndex);
    });
  });

  describe('rep counting', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
      continueFromPhaseIntro();
      vi.advanceTimersByTime(5000);
    });

    it('should increment rep counter', () => {
      incrementRep();

      const session = workoutSession.get();
      expect(session.currentReps).toBe(1);
    });

    it('should handle manual completion for rep exercises', () => {
      incrementRep();
      incrementRep();
      confirmRepExerciseComplete();

      expect(progressStore.completeExercise).toHaveBeenCalled();
    });
  });

  describe('multi-set exercises', () => {
    const workoutWithSets: Workout = {
      fase1: {
        name: 'Phase 1',
        time: '5 min',
        color: 'blue',
        colorPrimary: 'blue-500',
        colorLight: 'blue-50',
        colorBorder: 'blue-200',
        colorPrimaryHex: '#0000ff',
        colorLightHex: '#f0f0ff',
        colorBorderHex: '#d0d0ff',
        description: 'Test phase 1',
        exercises: [
          { id: 'ex1', name: 'Exercise 1', duration: 60, reps: '10', sets: 3, instructions: 'Do it' }
        ]
      },
      fase2: {
        name: 'Phase 2',
        time: '0 min',
        color: 'green',
        colorPrimary: 'green-500',
        colorLight: 'green-50',
        colorBorder: 'green-200',
        colorPrimaryHex: '#00ff00',
        colorLightHex: '#f0fff0',
        colorBorderHex: '#d0ffd0',
        description: 'Empty',
        exercises: []
      },
      fase3: {
        name: 'Phase 3',
        time: '0 min',
        color: 'orange',
        colorPrimary: 'orange-500',
        colorLight: 'orange-50',
        colorBorder: 'orange-200',
        colorPrimaryHex: '#ff8800',
        colorLightHex: '#fff0e0',
        colorBorderHex: '#ffd0a0',
        description: 'Empty',
        exercises: []
      },
      fase4: {
        name: 'Phase 4',
        time: '0 min',
        color: 'pink',
        colorPrimary: 'pink-500',
        colorLight: 'pink-50',
        colorBorder: 'pink-200',
        colorPrimaryHex: '#ff00ff',
        colorLightHex: '#fff0ff',
        colorBorderHex: '#ffd0ff',
        description: 'Empty',
        exercises: []
      }
    };

    beforeEach(() => {
      initializeWorkoutController(workoutWithSets);
      startWorkout();
      continueFromPhaseIntro();
      vi.advanceTimersByTime(5000);
    });

    it('should advance to next set after completing reps', () => {
      // Complete 10 reps
      for (let i = 0; i < 10; i++) {
        incrementRep();
      }

      const session = workoutSession.get();

      expect(session.currentSet).toBe(2);
      expect(session.currentReps).toBe(0);
      expect(session.workoutState).toBe('REST_PERIOD');
    });

    it('should complete exercise after all sets', () => {
      // Set 1
      for (let i = 0; i < 10; i++) incrementRep();
      vi.advanceTimersByTime(10000); // Rest

      // Set 2
      for (let i = 0; i < 10; i++) incrementRep();
      vi.advanceTimersByTime(10000); // Rest

      // Set 3
      for (let i = 0; i < 10; i++) incrementRep();

      expect(progressStore.completeExercise).toHaveBeenCalled();
    });
  });

  describe('rest skipping', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
      continueFromPhaseIntro();
      vi.advanceTimersByTime(5000);
      completeCurrentExercise(); // Move to REST_PERIOD
    });

    it('should skip rest and advance to next exercise', () => {
      const beforeIndex = workoutSession.get().currentExerciseIndex;

      skipRest();

      const session = workoutSession.get();

      expect(session.currentExerciseIndex).toBe(beforeIndex + 1);
      expect(session.workoutState).toBe('EXERCISE_ACTIVE');
    });
  });

  describe('workout completion', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
    });

    it('should confirm workout complete', () => {
      workoutSession.set({
        ...workoutSession.get(),
        workoutState: 'WORKOUT_VERIFICATION',
      });

      confirmWorkoutComplete();

      const session = workoutSession.get();

      expect(session.workoutState).toBe('WORKOUT_COMPLETE');
    });
  });

  describe('exitWorkout', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
    });

    it('should reset to IDLE state', () => {
      exitWorkout();

      const session = workoutSession.get();

      expect(session.workoutState).toBe('IDLE');
      expect(session.currentPhaseIndex).toBe(0);
      expect(session.currentExerciseIndex).toBe(0);
      expect(session.isPaused).toBe(false);
    });
  });

  describe('settings', () => {
    it('should update settings', () => {
      updateSettings({ restDuration: 10, soundEnabled: false });

      const settings = workoutSettings.get();

      expect(settings.restDuration).toBe(10);
      expect(settings.soundEnabled).toBe(false);
    });
  });

  describe('persistence', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
    });

    it('should save and load session state', () => {
      startWorkout();

      const savedState = loadSessionState();

      expect(savedState).toBeDefined();
      expect(savedState?.workoutState).toBe('PHASE_INTRO');
    });

    it('should load saved settings', () => {
      updateSettings({ restDuration: 12 });

      // Clear current settings
      workoutSettings.set({
        restDuration: 7,
        phaseRestDuration: 10,
        prepDuration: 5,
        soundEnabled: true,
        voiceEnabled: true,
        vibrationEnabled: true,
        autoAdvance: true,
      });

      loadSettingsState();

      const settings = workoutSettings.get();
      expect(settings.restDuration).toBe(12);
    });
  });

  describe('timer behavior', () => {
    beforeEach(() => {
      initializeWorkoutController(mockWorkout);
      startWorkout();
      continueFromPhaseIntro();
    });

    it('should count down timer every second', () => {
      const initialTime = workoutSession.get().timeLeft;

      vi.advanceTimersByTime(3000); // 3 seconds

      const currentTime = workoutSession.get().timeLeft;

      expect(currentTime).toBe(initialTime - 3);
    });

    it('should stop timer when paused', () => {
      vi.advanceTimersByTime(2000);

      const timeBeforePause = workoutSession.get().timeLeft;

      pauseWorkout();
      vi.advanceTimersByTime(5000); // Advance but should not count down

      const timeAfterPause = workoutSession.get().timeLeft;

      expect(timeAfterPause).toBe(timeBeforePause);
    });
  });
});
