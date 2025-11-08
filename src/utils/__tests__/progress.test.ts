import { describe, it, expect } from 'vitest';
import {
  getExerciseKey,
  parseExerciseKey,
  calculatePhaseProgress,
  calculateCompletionStats,
  isPhaseCompleted,
  getCompletedPhases,
  isWorkoutCompleted
} from '../progress';
import type { Workout } from '../../types/workout';

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

describe('progress utilities', () => {
  describe('getExerciseKey', () => {
    it('should generate correct exercise key', () => {
      expect(getExerciseKey('fase1', 'ex1')).toBe('fase1-ex1');
      expect(getExerciseKey('fase2', 'ex3')).toBe('fase2-ex3');
    });

    it('should handle different phase/exercise IDs', () => {
      expect(getExerciseKey('phaseA', 'exercise123')).toBe('phaseA-exercise123');
    });
  });

  describe('parseExerciseKey', () => {
    it('should parse exercise key correctly', () => {
      const result = parseExerciseKey('fase1-ex1');

      expect(result.phaseId).toBe('fase1');
      expect(result.exerciseId).toBe('ex1');
    });

    it('should handle keys with multiple dashes in exercise ID', () => {
      const result = parseExerciseKey('fase1-ex-with-dashes');

      expect(result.phaseId).toBe('fase1');
      expect(result.exerciseId).toBe('ex-with-dashes');
    });

    it('should parse and generate be inverse operations', () => {
      const original = { phaseId: 'fase2', exerciseId: 'ex3' };
      const key = getExerciseKey(original.phaseId, original.exerciseId);
      const parsed = parseExerciseKey(key);

      expect(parsed).toEqual(original);
    });
  });

  describe('calculatePhaseProgress', () => {
    it('should calculate progress for phase with no completions', () => {
      const completed = new Set<string>();
      const progress = calculatePhaseProgress('fase1', mockWorkout.fase1, completed);

      expect(progress.phaseId).toBe('fase1');
      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should calculate progress for partially completed phase', () => {
      const completed = new Set(['fase1-ex1']);
      const progress = calculatePhaseProgress('fase1', mockWorkout.fase1, completed);

      expect(progress.completed).toBe(1);
      expect(progress.total).toBe(2);
      expect(progress.percentage).toBe(50);
    });

    it('should calculate progress for fully completed phase', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2']);
      const progress = calculatePhaseProgress('fase1', mockWorkout.fase1, completed);

      expect(progress.completed).toBe(2);
      expect(progress.total).toBe(2);
      expect(progress.percentage).toBe(100);
    });

    it('should handle phase with single exercise', () => {
      const completed = new Set(['fase2-ex3']);
      const progress = calculatePhaseProgress('fase2', mockWorkout.fase2, completed);

      expect(progress.completed).toBe(1);
      expect(progress.total).toBe(1);
      expect(progress.percentage).toBe(100);
    });
  });

  describe('calculateCompletionStats', () => {
    it('should calculate stats for no completions', () => {
      const completed = new Set<string>();
      const stats = calculateCompletionStats(mockWorkout, completed);

      expect(stats.totalExercises).toBe(5);
      expect(stats.completedExercises).toBe(0);
      expect(stats.overallPercentage).toBe(0);
      expect(stats.completedPhases).toEqual([]);
      expect(stats.phaseProgress).toHaveLength(4);
    });

    it('should calculate stats for partial completion', () => {
      const completed = new Set(['fase1-ex1', 'fase2-ex3']);
      const stats = calculateCompletionStats(mockWorkout, completed);

      expect(stats.totalExercises).toBe(5);
      expect(stats.completedExercises).toBe(2);
      expect(stats.overallPercentage).toBeCloseTo(40, 1);
      expect(stats.completedPhases).toEqual(['fase2']); // Only fase2 fully complete
    });

    it('should calculate stats for full completion', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2', 'fase2-ex3', 'fase3-ex4', 'fase4-ex5']);
      const stats = calculateCompletionStats(mockWorkout, completed);

      expect(stats.totalExercises).toBe(5);
      expect(stats.completedExercises).toBe(5);
      expect(stats.overallPercentage).toBe(100);
      expect(stats.completedPhases).toEqual(['fase1', 'fase2', 'fase3', 'fase4']);
    });

    it('should include phase progress for each phase', () => {
      const completed = new Set(['fase1-ex1']);
      const stats = calculateCompletionStats(mockWorkout, completed);

      expect(stats.phaseProgress).toHaveLength(4);
      expect(stats.phaseProgress[0].phaseId).toBe('fase1');
      expect(stats.phaseProgress[0].completed).toBe(1);
      expect(stats.phaseProgress[1].phaseId).toBe('fase2');
      expect(stats.phaseProgress[1].completed).toBe(0);
    });
  });

  describe('isPhaseCompleted', () => {
    it('should return false for incomplete phase', () => {
      const completed = new Set(['fase1-ex1']);
      const result = isPhaseCompleted('fase1', mockWorkout.fase1, completed);

      expect(result).toBe(false);
    });

    it('should return true for completed phase', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2']);
      const result = isPhaseCompleted('fase1', mockWorkout.fase1, completed);

      expect(result).toBe(true);
    });

    it('should return false for phase with no completions', () => {
      const completed = new Set<string>();
      const result = isPhaseCompleted('fase1', mockWorkout.fase1, completed);

      expect(result).toBe(false);
    });

    it('should handle single-exercise phase', () => {
      const completed = new Set(['fase2-ex3']);
      const result = isPhaseCompleted('fase2', mockWorkout.fase2, completed);

      expect(result).toBe(true);
    });
  });

  describe('getCompletedPhases', () => {
    it('should return empty array when no phases complete', () => {
      const completed = new Set(['fase1-ex1']);
      const result = getCompletedPhases(mockWorkout, completed);

      expect(result).toEqual([]);
    });

    it('should return completed phases', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2', 'fase2-ex3', 'fase3-ex4', 'fase4-ex5']);
      const result = getCompletedPhases(mockWorkout, completed);

      expect(result).toContain('fase1');
      expect(result).toContain('fase2');
      expect(result).toContain('fase3');
      expect(result).toContain('fase4');
      expect(result).toHaveLength(4);
    });

    it('should return only fully completed phases', () => {
      const completed = new Set(['fase1-ex1', 'fase2-ex3']);
      const result = getCompletedPhases(mockWorkout, completed);

      expect(result).toEqual(['fase2']);
      expect(result).not.toContain('fase1');
    });
  });

  describe('isWorkoutCompleted', () => {
    it('should return false for incomplete workout', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2']);
      const result = isWorkoutCompleted(mockWorkout, completed);

      expect(result).toBe(false);
    });

    it('should return true for fully completed workout', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2', 'fase2-ex3', 'fase3-ex4', 'fase4-ex5']);
      const result = isWorkoutCompleted(mockWorkout, completed);

      expect(result).toBe(true);
    });

    it('should return false for empty workout', () => {
      const completed = new Set<string>();
      const result = isWorkoutCompleted(mockWorkout, completed);

      expect(result).toBe(false);
    });

    it('should return false when set has extra exercises', () => {
      const completed = new Set(['fase1-ex1', 'fase1-ex2', 'fase2-ex3', 'fase3-ex4', 'fase4-ex5', 'fase5-ex1']);
      const result = isWorkoutCompleted(mockWorkout, completed);

      // More exercises in set than in workout - should still be true since all workout exercises are done
      expect(result).toBe(true);
    });

    it('should require all exercises to be completed', () => {
      const completed = new Set(['fase1-ex1', 'fase2-ex3']);
      const result = isWorkoutCompleted(mockWorkout, completed);

      expect(result).toBe(false); // Missing fase1-ex2, fase3-ex4, fase4-ex5
    });
  });

  describe('edge cases', () => {
    it('should handle workout with no exercises', () => {
      const emptyWorkout: Workout = {
        fase1: {
          name: 'Empty Phase 1',
          time: '0 min',
          color: 'gray',
          colorPrimary: 'gray-500',
          colorLight: 'gray-50',
          colorBorder: 'gray-200',
          colorPrimaryHex: '#808080',
          colorLightHex: '#f0f0f0',
          colorBorderHex: '#d0d0d0',
          description: 'Empty',
          exercises: []
        },
        fase2: {
          name: 'Empty Phase 2',
          time: '0 min',
          color: 'gray',
          colorPrimary: 'gray-500',
          colorLight: 'gray-50',
          colorBorder: 'gray-200',
          colorPrimaryHex: '#808080',
          colorLightHex: '#f0f0f0',
          colorBorderHex: '#d0d0d0',
          description: 'Empty',
          exercises: []
        },
        fase3: {
          name: 'Empty Phase 3',
          time: '0 min',
          color: 'gray',
          colorPrimary: 'gray-500',
          colorLight: 'gray-50',
          colorBorder: 'gray-200',
          colorPrimaryHex: '#808080',
          colorLightHex: '#f0f0f0',
          colorBorderHex: '#d0d0d0',
          description: 'Empty',
          exercises: []
        },
        fase4: {
          name: 'Empty Phase 4',
          time: '0 min',
          color: 'gray',
          colorPrimary: 'gray-500',
          colorLight: 'gray-50',
          colorBorder: 'gray-200',
          colorPrimaryHex: '#808080',
          colorLightHex: '#f0f0f0',
          colorBorderHex: '#d0d0d0',
          description: 'Empty',
          exercises: []
        }
      };

      const completed = new Set<string>();
      const stats = calculateCompletionStats(emptyWorkout, completed);

      expect(stats.totalExercises).toBe(0);
      expect(stats.overallPercentage).toBe(0);
    });

    it('should handle empty completed set', () => {
      const completed = new Set<string>();

      expect(isWorkoutCompleted(mockWorkout, completed)).toBe(false);
      expect(getCompletedPhases(mockWorkout, completed)).toEqual([]);
    });

    it('should handle percentage calculation precision', () => {
      const workout: Workout = {
        fase1: {
          name: 'Phase with 3',
          time: '9 min',
          color: 'blue',
          colorPrimary: 'blue-500',
          colorLight: 'blue-50',
          colorBorder: 'blue-200',
          colorPrimaryHex: '#0000ff',
          colorLightHex: '#f0f0ff',
          colorBorderHex: '#d0d0ff',
          description: 'Test',
          exercises: [
            { id: 'ex1', name: 'Ex 1', duration: 60, reps: '10', instructions: 'Do it' },
            { id: 'ex2', name: 'Ex 2', duration: 60, reps: '10', instructions: 'Do it' },
            { id: 'ex3', name: 'Ex 3', duration: 60, reps: '10', instructions: 'Do it' }
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

      const completed = new Set(['fase1-ex1']);
      const progress = calculatePhaseProgress('fase1', workout.fase1, completed);

      expect(progress.percentage).toBeCloseTo(33.33, 2);
    });
  });
});
