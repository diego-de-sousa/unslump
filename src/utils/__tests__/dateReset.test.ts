import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkAndResetIfNewDay,
  isSessionLocked,
  shouldLockSession
} from '../dateReset';
import * as storage from '../storage';

// Mock storage module
vi.mock('../storage');

describe('dateReset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkAndResetIfNewDay', () => {
    it('should return false when no saved progress', () => {
      vi.mocked(storage.loadProgress).mockReturnValue(null);

      const result = checkAndResetIfNewDay();

      expect(result).toBe(false);
    });

    it('should return false when no lastSessionDate', () => {
      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: ''
      });

      const result = checkAndResetIfNewDay();

      expect(result).toBe(false);
    });

    it('should return false when same day', () => {
      const today = new Date('2025-01-15T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T08:00:00Z' // Same day, different time
      });

      const result = checkAndResetIfNewDay();

      expect(result).toBe(false);
      expect(storage.saveProgress).not.toHaveBeenCalled();
    });

    it('should return true and reset when new day', () => {
      const today = new Date('2025-01-16T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1', 'fase1-ex2'],
        level: 'intermedio',
        sessionLocked: true,
        lastSessionDate: '2025-01-15T20:00:00Z' // Yesterday
      });

      const result = checkAndResetIfNewDay();

      expect(result).toBe(true);
      expect(storage.saveProgress).toHaveBeenCalledWith({
        completed: [],
        level: 'intermedio', // Should preserve level
        sessionLocked: false,
        lastSessionDate: expect.any(String)
      });
    });

    it('should preserve user level preference after reset', () => {
      const today = new Date('2025-01-16T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'avanzado',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T10:00:00Z'
      });

      checkAndResetIfNewDay();

      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'avanzado'
        })
      );
    });

    it('should reset completed exercises', () => {
      const today = new Date('2025-01-16T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1', 'fase1-ex2', 'fase2-ex3'],
        level: 'principiante',
        sessionLocked: true,
        lastSessionDate: '2025-01-15T10:00:00Z'
      });

      checkAndResetIfNewDay();

      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: []
        })
      );
    });

    it('should unlock session after reset', () => {
      const today = new Date('2025-01-16T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1', 'fase1-ex2'],
        level: 'principiante',
        sessionLocked: true,
        lastSessionDate: '2025-01-15T10:00:00Z'
      });

      checkAndResetIfNewDay();

      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionLocked: false
        })
      );
    });

    it('should handle local midnight boundary correctly', () => {
      // Day 1 at 23:59 in the user's local timezone.
      const dayOneLateNight = new Date(2025, 0, 15, 23, 59, 0);
      vi.setSystemTime(dayOneLateNight);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: dayOneLateNight.toISOString()
      });

      let result = checkAndResetIfNewDay();
      expect(result).toBe(false);

      // Day 2 at 00:01 in the user's local timezone.
      const dayTwoEarlyMorning = new Date(2025, 0, 16, 0, 1, 0);
      vi.setSystemTime(dayTwoEarlyMorning);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: dayOneLateNight.toISOString()
      });

      result = checkAndResetIfNewDay();
      expect(result).toBe(true);
    });

    it('should handle date comparison across months', () => {
      const today = new Date('2025-02-01T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-31T10:00:00Z' // Last day of previous month
      });

      const result = checkAndResetIfNewDay();

      expect(result).toBe(true);
    });

    it('should handle date comparison across years', () => {
      const today = new Date('2026-01-01T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-12-31T10:00:00Z' // Last day of previous year
      });

      const result = checkAndResetIfNewDay();

      expect(result).toBe(true);
    });
  });

  describe('isSessionLocked', () => {
    it('should return false when no saved progress', () => {
      vi.mocked(storage.loadProgress).mockReturnValue(null);

      expect(isSessionLocked()).toBe(false);
    });

    it('should return false when sessionLocked is false', () => {
      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: new Date().toISOString()
      });

      expect(isSessionLocked()).toBe(false);
    });

    it('should return true when sessionLocked is true', () => {
      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1', 'fase1-ex2', 'fase2-ex3'],
        level: 'principiante',
        sessionLocked: true,
        lastSessionDate: new Date().toISOString()
      });

      expect(isSessionLocked()).toBe(true);
    });

    it('should handle missing sessionLocked field', () => {
      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: [],
        level: 'principiante',
        lastSessionDate: new Date().toISOString()
      } as any);

      expect(isSessionLocked()).toBe(false);
    });
  });

  describe('shouldLockSession', () => {
    it('should return true when all exercises completed', () => {
      expect(shouldLockSession(21, 21)).toBe(true);
    });

    it('should return false when not all exercises completed', () => {
      expect(shouldLockSession(20, 21)).toBe(false);
    });

    it('should return false when no exercises exist', () => {
      expect(shouldLockSession(0, 0)).toBe(false);
    });

    it('should return false when completed count exceeds total (edge case)', () => {
      expect(shouldLockSession(22, 21)).toBe(false);
    });

    it('should work with single exercise', () => {
      expect(shouldLockSession(1, 1)).toBe(true);
    });

    it('should work with large numbers', () => {
      expect(shouldLockSession(100, 100)).toBe(true);
      expect(shouldLockSession(99, 100)).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete daily workflow', () => {
      // Day 1 - Start workout
      const day1 = new Date('2025-01-15T10:00:00Z');
      vi.setSystemTime(day1);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: [],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: day1.toISOString()
      });

      let reset = checkAndResetIfNewDay();
      expect(reset).toBe(false); // Same day, no reset

      // Day 2 - New day
      const day2 = new Date('2025-01-16T10:00:00Z');
      vi.setSystemTime(day2);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1', 'fase1-ex2'],
        level: 'principiante',
        sessionLocked: true, // Was locked yesterday
        lastSessionDate: day1.toISOString()
      });

      reset = checkAndResetIfNewDay();
      expect(reset).toBe(true); // Should reset
      expect(storage.saveProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          completed: [],
          sessionLocked: false
        })
      );
    });

    it('should handle same day multiple checks', () => {
      const today = new Date('2025-01-15T10:00:00Z');
      vi.setSystemTime(today);

      vi.mocked(storage.loadProgress).mockReturnValue({
        completed: ['fase1-ex1'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: '2025-01-15T08:00:00Z'
      });

      // Multiple checks in same day
      expect(checkAndResetIfNewDay()).toBe(false);
      expect(checkAndResetIfNewDay()).toBe(false);
      expect(checkAndResetIfNewDay()).toBe(false);

      expect(storage.saveProgress).not.toHaveBeenCalled();
    });
  });
});
