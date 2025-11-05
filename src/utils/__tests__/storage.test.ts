import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  hasSeenOnboarding,
  markOnboardingSeen,
  resetOnboarding
} from '../storage';
import type { ProgressState } from '../../types/progress';

describe('storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Clear console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('loadProgress', () => {
    it('should return null when no progress saved', () => {
      expect(loadProgress()).toBeNull();
    });

    it('should load saved progress', () => {
      const progress: ProgressState = {
        completed: ['fase1-ex1', 'fase1-ex2'],
        level: 'intermedio',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      localStorage.setItem('unslump-progress', JSON.stringify(progress));

      const loaded = loadProgress();

      expect(loaded).toEqual(progress);
    });

    it('should handle corrupted JSON', () => {
      localStorage.setItem('unslump-progress', 'invalid json{');

      const loaded = loadProgress();

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should load progress with all fields', () => {
      const progress: ProgressState = {
        completed: ['fase1-ex1', 'fase2-ex3'],
        level: 'avanzado',
        sessionLocked: true,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      localStorage.setItem('unslump-progress', JSON.stringify(progress));

      const loaded = loadProgress();

      expect(loaded?.completed).toEqual(['fase1-ex1', 'fase2-ex3']);
      expect(loaded?.level).toBe('avanzado');
      expect(loaded?.sessionLocked).toBe(true);
      expect(loaded?.lastSessionDate).toBe('2025-01-15T10:00:00Z');
    });

    it('should handle empty completed array', () => {
      const progress: ProgressState = {
        completed: [],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      localStorage.setItem('unslump-progress', JSON.stringify(progress));

      const loaded = loadProgress();

      expect(loaded?.completed).toEqual([]);
    });
  });

  describe('saveProgress', () => {
    it('should save progress to localStorage', () => {
      const progress: ProgressState = {
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      saveProgress(progress);

      const saved = localStorage.getItem('unslump-progress');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(progress);
    });

    it('should overwrite existing progress', () => {
      const initial: ProgressState = {
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      saveProgress(initial);

      const updated: ProgressState = {
        completed: ['fase1-ex1', 'fase1-ex2'],
        level: 'intermedio',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T11:00:00Z'
      };

      saveProgress(updated);

      const loaded = loadProgress();
      expect(loaded).toEqual(updated);
    });

    it('should handle saving with sessionLocked true', () => {
      const progress: ProgressState = {
        completed: ['fase1-ex1', 'fase1-ex2', 'fase2-ex3'],
        level: 'principiante',
        sessionLocked: true,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      saveProgress(progress);

      const loaded = loadProgress();
      expect(loaded?.sessionLocked).toBe(true);
    });

    it('should handle saving large completed arrays', () => {
      const completed = Array.from({ length: 100 }, (_, i) => `fase${i}-ex${i}`);
      const progress: ProgressState = {
        completed,
        level: 'avanzado',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      saveProgress(progress);

      const loaded = loadProgress();
      expect(loaded?.completed).toHaveLength(100);
    });

    it('should handle storage errors gracefully', () => {
      // Mock localStorage to throw an error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const progress: ProgressState = {
        completed: [],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      // Should not throw
      expect(() => saveProgress(progress)).not.toThrow();
      expect(console.error).toHaveBeenCalled();

      setItemSpy.mockRestore();
    });
  });

  describe('resetProgress', () => {
    it('should remove progress from localStorage', () => {
      const progress: ProgressState = {
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      saveProgress(progress);
      expect(loadProgress()).toBeTruthy();

      resetProgress();

      expect(loadProgress()).toBeNull();
    });

    it('should not throw when no progress exists', () => {
      expect(() => resetProgress()).not.toThrow();
    });

    it('should handle removal errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Cannot remove');
      });

      expect(() => resetProgress()).not.toThrow();
      expect(console.error).toHaveBeenCalled();

      removeItemSpy.mockRestore();
    });
  });

  describe('hasSeenOnboarding', () => {
    it('should return false when onboarding not seen', () => {
      expect(hasSeenOnboarding()).toBe(false);
    });

    it('should return true when onboarding marked as seen', () => {
      localStorage.setItem('unslump-onboarding-seen', 'true');

      expect(hasSeenOnboarding()).toBe(true);
    });

    it('should return false for any value other than "true"', () => {
      localStorage.setItem('unslump-onboarding-seen', 'false');
      expect(hasSeenOnboarding()).toBe(false);

      localStorage.setItem('unslump-onboarding-seen', 'yes');
      expect(hasSeenOnboarding()).toBe(false);

      localStorage.setItem('unslump-onboarding-seen', '1');
      expect(hasSeenOnboarding()).toBe(false);
    });

    it('should handle storage errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(hasSeenOnboarding()).toBe(false);
      expect(console.error).toHaveBeenCalled();

      getItemSpy.mockRestore();
    });
  });

  describe('markOnboardingSeen', () => {
    it('should mark onboarding as seen', () => {
      markOnboardingSeen();

      expect(hasSeenOnboarding()).toBe(true);
    });

    it('should persist across checks', () => {
      markOnboardingSeen();

      expect(hasSeenOnboarding()).toBe(true);
      expect(hasSeenOnboarding()).toBe(true);
    });

    it('should handle storage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => markOnboardingSeen()).not.toThrow();
      expect(console.error).toHaveBeenCalled();

      setItemSpy.mockRestore();
    });
  });

  describe('resetOnboarding', () => {
    it('should reset onboarding state', () => {
      markOnboardingSeen();
      expect(hasSeenOnboarding()).toBe(true);

      resetOnboarding();

      expect(hasSeenOnboarding()).toBe(false);
    });

    it('should not throw when onboarding not set', () => {
      expect(() => resetOnboarding()).not.toThrow();
    });

    it('should handle removal errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Cannot remove');
      });

      expect(() => resetOnboarding()).not.toThrow();
      expect(console.error).toHaveBeenCalled();

      removeItemSpy.mockRestore();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow: save, load, reset', () => {
      // Save progress
      const progress: ProgressState = {
        completed: ['fase1-ex1', 'fase1-ex2'],
        level: 'intermedio',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };
      saveProgress(progress);

      // Load and verify
      let loaded = loadProgress();
      expect(loaded).toEqual(progress);

      // Reset
      resetProgress();

      // Verify cleared
      loaded = loadProgress();
      expect(loaded).toBeNull();
    });

    it('should handle onboarding workflow', () => {
      // First visit - not seen
      expect(hasSeenOnboarding()).toBe(false);

      // Mark as seen
      markOnboardingSeen();
      expect(hasSeenOnboarding()).toBe(true);

      // Reset for testing
      resetOnboarding();
      expect(hasSeenOnboarding()).toBe(false);
    });

    it('should keep progress and onboarding separate', () => {
      // Save progress
      const progress: ProgressState = {
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };
      saveProgress(progress);

      // Mark onboarding seen
      markOnboardingSeen();

      // Reset progress - should not affect onboarding
      resetProgress();

      expect(loadProgress()).toBeNull();
      expect(hasSeenOnboarding()).toBe(true);

      // Reset onboarding - should not affect progress (which is already null)
      resetOnboarding();

      expect(hasSeenOnboarding()).toBe(false);
    });

    it('should handle multiple save operations', () => {
      const states: ProgressState[] = [
        {
          completed: [],
          level: 'principiante',
          sessionLocked: false,
          lastSessionDate: '2025-01-15T10:00:00Z'
        },
        {
          completed: ['fase1-ex1'],
          level: 'principiante',
          sessionLocked: false,
          lastSessionDate: '2025-01-15T10:30:00Z'
        },
        {
          completed: ['fase1-ex1', 'fase1-ex2'],
          level: 'principiante',
          sessionLocked: false,
          lastSessionDate: '2025-01-15T11:00:00Z'
        }
      ];

      // Save each state
      states.forEach(state => saveProgress(state));

      // Should have the last state
      const loaded = loadProgress();
      expect(loaded).toEqual(states[2]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string lastSessionDate', () => {
      const progress: ProgressState = {
        completed: [],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: ''
      };

      saveProgress(progress);
      const loaded = loadProgress();

      expect(loaded?.lastSessionDate).toBe('');
    });

    it('should handle special characters in exercise keys', () => {
      const progress: ProgressState = {
        completed: ['fase-1-ex-1', 'fase_2_ex_2', 'fase3:ex3'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      saveProgress(progress);
      const loaded = loadProgress();

      expect(loaded?.completed).toEqual(progress.completed);
    });

    it('should handle all level options', () => {
      const levels: Array<'principiante' | 'intermedio' | 'avanzado'> = [
        'principiante',
        'intermedio',
        'avanzado'
      ];

      levels.forEach(level => {
        const progress: ProgressState = {
          completed: [],
          level,
          sessionLocked: false,
          lastSessionDate: '2025-01-15T10:00:00Z'
        };

        saveProgress(progress);
        const loaded = loadProgress();

        expect(loaded?.level).toBe(level);
      });
    });

    it('should handle localStorage quota exceeded', () => {
      // Try to fill storage with huge data
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      let callCount = 0;
      setItemSpy.mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new DOMException('QuotaExceededError');
        }
      });

      const progress: ProgressState = {
        completed: Array.from({ length: 10000 }, (_, i) => `ex${i}`),
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      };

      expect(() => saveProgress(progress)).not.toThrow();

      setItemSpy.mockRestore();
    });
  });
});
