import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  completedExercises,
  skippedExercises,
  sessionLocked,
  currentWorkout,
  initializeProgress,
  toggleExerciseCompletion,
  completeExercise,
  skipExercise,
  resetProgress,
  isExerciseCompleted,
  completionStats,
  isFullyCompleted
} from '../progressStore';
import * as storage from '../../utils/storage';
import * as dateReset from '../../utils/dateReset';
import * as userStore from '../userStore';
import type { Workout } from '../../types/workout';

// Mock dependencies
vi.mock('../../utils/storage');
vi.mock('../../utils/dateReset');
vi.mock('../userStore', () => ({
  recordWorkoutCompletion: vi.fn()
}));

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

describe('progressStore', () => {
  beforeEach(() => {
    // Reset stores
    completedExercises.set(new Set());
    skippedExercises.set(new Set());
    sessionLocked.set(false);
    currentWorkout.set(null);

    // Clear mocks
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(storage.loadProgress).mockReturnValue(null);
    vi.mocked(storage.saveProgress).mockImplementation(() => {});
    vi.mocked(dateReset.checkAndResetIfNewDay).mockReturnValue(false);
    vi.mocked(dateReset.shouldLockSession).mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeProgress', () => {
    it('should initialize with workout data and no saved progress', () => {
      initializeProgress(mockWorkout);

      expect(currentWorkout.get()).toEqual(mockWorkout);
      expect(completedExercises.get().size).toBe(0);
      expect(skippedExercises.get().size).toBe(0);
      expect(sessionLocked.get()).toBe(false);
      expect(dateReset.checkAndResetIfNewDay).toHaveBeenCalled();
    });

    it('should load saved progress when available and not reset', () => {
      const savedProgress = {
        completed: ['fase1-ex1', 'fase2-ex3'],
        skipped: ['fase1-ex2'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: new Date().toISOString()
      };

      vi.mocked(storage.loadProgress).mockReturnValue(savedProgress);
      vi.mocked(dateReset.checkAndResetIfNewDay).mockReturnValue(false);

      initializeProgress(mockWorkout);

      expect(completedExercises.get()).toEqual(new Set(['fase1-ex1', 'fase2-ex3']));
      expect(skippedExercises.get()).toEqual(new Set(['fase1-ex2']));
      expect(sessionLocked.get()).toBe(false);
    });

    it('should not load saved progress when daily reset occurs', () => {
      const savedProgress = {
        completed: ['fase1-ex1'],
        skipped: [],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: new Date().toISOString()
      };

      vi.mocked(storage.loadProgress).mockReturnValue(savedProgress);
      vi.mocked(dateReset.checkAndResetIfNewDay).mockReturnValue(true); // Reset occurred

      initializeProgress(mockWorkout);

      expect(completedExercises.get().size).toBe(0); // Should be empty after reset
      expect(skippedExercises.get().size).toBe(0);
    });

    it('should handle saved progress with sessionLocked true', () => {
      const savedProgress = {
        completed: ['fase1-ex1', 'fase1-ex2', 'fase2-ex3'],
        skipped: [],
        level: 'principiante',
        sessionLocked: true,
        lastSessionDate: new Date().toISOString()
      };

      vi.mocked(storage.loadProgress).mockReturnValue(savedProgress);

      initializeProgress(mockWorkout);

      expect(sessionLocked.get()).toBe(true);
    });
  });

  describe('toggleExerciseCompletion', () => {
    beforeEach(() => {
      currentWorkout.set(mockWorkout);
    });

    it('should mark exercise as completed when not completed', () => {
      const result = toggleExerciseCompletion('fase1', 'ex1');

      expect(result).toBe(true);
      expect(completedExercises.get()).toContain('fase1-ex1');
      expect(storage.saveProgress).toHaveBeenCalled();
    });

    it('should mark exercise as not completed when already completed', () => {
      completedExercises.set(new Set(['fase1-ex1']));

      const result = toggleExerciseCompletion('fase1', 'ex1');

      expect(result).toBe(false);
      expect(completedExercises.get().has('fase1-ex1')).toBe(false);
      expect(storage.saveProgress).toHaveBeenCalled();
    });

    it('should generate correct exercise key', () => {
      toggleExerciseCompletion('fase2', 'ex3');

      expect(completedExercises.get().has('fase2-ex3')).toBe(true);
    });
  });

  describe('completeExercise', () => {
    beforeEach(() => {
      currentWorkout.set(mockWorkout);
    });

    it('should mark exercise as completed', () => {
      completeExercise('fase1', 'ex1');

      expect(completedExercises.get().has('fase1-ex1')).toBe(true);
      expect(storage.saveProgress).toHaveBeenCalled();
    });

    it('should remove exercise from skipped when completing', () => {
      skippedExercises.set(new Set(['fase1-ex1']));

      completeExercise('fase1', 'ex1');

      expect(skippedExercises.get().has('fase1-ex1')).toBe(false);
      expect(completedExercises.get().has('fase1-ex1')).toBe(true);
    });

    it('should not save progress if already completed', () => {
      completedExercises.set(new Set(['fase1-ex1']));

      completeExercise('fase1', 'ex1');

      // saveProgress should not be called because exercise was already completed
      expect(storage.saveProgress).not.toHaveBeenCalled();
    });

    it('should handle multiple exercises being completed', () => {
      completeExercise('fase1', 'ex1');
      completeExercise('fase1', 'ex2');
      completeExercise('fase2', 'ex3');

      expect(completedExercises.get().size).toBe(3);
      expect(completedExercises.get().has('fase1-ex1')).toBe(true);
      expect(completedExercises.get().has('fase1-ex2')).toBe(true);
      expect(completedExercises.get().has('fase2-ex3')).toBe(true);
    });
  });

  describe('skipExercise', () => {
    beforeEach(() => {
      currentWorkout.set(mockWorkout);
    });

    it('should mark exercise as skipped', () => {
      skipExercise('fase1', 'ex1');

      expect(skippedExercises.get().has('fase1-ex1')).toBe(true);
      expect(storage.saveProgress).toHaveBeenCalled();
    });

    it('should not mark as skipped if already completed', () => {
      completedExercises.set(new Set(['fase1-ex1']));

      skipExercise('fase1', 'ex1');

      expect(skippedExercises.get().has('fase1-ex1')).toBe(false);
    });

    it('should not save progress if already skipped', () => {
      skippedExercises.set(new Set(['fase1-ex1']));

      skipExercise('fase1', 'ex1');

      // Should not save because already skipped
      expect(storage.saveProgress).not.toHaveBeenCalled();
    });
  });

  describe('resetProgress', () => {
    it('should clear all progress', () => {
      currentWorkout.set(mockWorkout);
      completedExercises.set(new Set(['fase1-ex1', 'fase1-ex2']));
      skippedExercises.set(new Set(['fase2-ex3']));
      sessionLocked.set(true);

      resetProgress();

      expect(completedExercises.get().size).toBe(0);
      expect(skippedExercises.get().size).toBe(0);
      expect(sessionLocked.get()).toBe(false);
      expect(storage.saveProgress).toHaveBeenCalled();
    });
  });

  describe('isExerciseCompleted', () => {
    it('should return true for completed exercise', () => {
      completedExercises.set(new Set(['fase1-ex1']));

      expect(isExerciseCompleted('fase1', 'ex1')).toBe(true);
    });

    it('should return false for non-completed exercise', () => {
      expect(isExerciseCompleted('fase1', 'ex1')).toBe(false);
    });
  });

  describe('session locking', () => {
    beforeEach(() => {
      currentWorkout.set(mockWorkout);
    });

    it('should lock session when all exercises are completed', () => {
      vi.mocked(dateReset.shouldLockSession).mockReturnValue(true);

      completeExercise('fase1', 'ex1');

      expect(sessionLocked.get()).toBe(true);
    });

    it('should call recordWorkoutCompletion when session first locks', () => {
      vi.mocked(dateReset.shouldLockSession).mockReturnValue(true);
      sessionLocked.set(false); // Not locked initially

      completeExercise('fase1', 'ex1');

      expect(userStore.recordWorkoutCompletion).toHaveBeenCalled();
    });

    it('should not call recordWorkoutCompletion if already locked', () => {
      vi.mocked(dateReset.shouldLockSession).mockReturnValue(true);
      sessionLocked.set(true); // Already locked

      completeExercise('fase1', 'ex2');

      expect(userStore.recordWorkoutCompletion).not.toHaveBeenCalled();
    });
  });

  describe('computed values', () => {
    beforeEach(() => {
      currentWorkout.set(mockWorkout);
    });

    it('completionStats should return null when no workout', () => {
      currentWorkout.set(null);

      expect(completionStats.get()).toBeNull();
    });

    it('completionStats should calculate stats with workout', () => {
      completedExercises.set(new Set(['fase1-ex1']));

      const stats = completionStats.get();

      expect(stats).toBeDefined();
      expect(stats?.totalExercises).toBe(5); // Total exercises in mock workout (now includes fase3 and fase4)
    });

    it('isFullyCompleted should return false when not all exercises completed', () => {
      completedExercises.set(new Set(['fase1-ex1']));

      expect(isFullyCompleted.get()).toBe(false);
    });

    it('isFullyCompleted should return true when all exercises completed', () => {
      completedExercises.set(new Set([
        'fase1-ex1',
        'fase1-ex2',
        'fase2-ex3',
        'fase3-ex4',
        'fase4-ex5'
      ]));

      expect(isFullyCompleted.get()).toBe(true);
    });

    it('isFullyCompleted should return false when no workout', () => {
      currentWorkout.set(null);

      expect(isFullyCompleted.get()).toBe(false);
    });
  });

  describe('saveProgressState integration', () => {
    beforeEach(() => {
      currentWorkout.set(mockWorkout);
    });

    it('should save complete state to localStorage', () => {
      completeExercise('fase1', 'ex1');
      skipExercise('fase1', 'ex2');

      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: expect.arrayContaining(['fase1-ex1']),
          skipped: expect.arrayContaining(['fase1-ex2']),
          sessionLocked: expect.any(Boolean),
          lastSessionDate: expect.any(String)
        })
      );
    });

    it('should not save if no workout is set', () => {
      currentWorkout.set(null);

      // Try to toggle completion (this calls saveProgressState internally)
      toggleExerciseCompletion('fase1', 'ex1');

      // Should not save because no workout is set
      expect(storage.saveProgress).not.toHaveBeenCalled();
    });
  });
});
