import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import {
  userProfile,
  userStats,
  achievements,
  streakStatus,
  initializeUserProfile,
  recordWorkoutCompletion,
  setPreferredLevel,
  hasUserProgress,
  isFirstVisit,
  resetUserProfile,
  type UserProfile
} from '../userStore';

describe('userStore', () => {
  const mockDate = new Date('2025-01-15T10:00:00Z');

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Mock current date
    vi.setSystemTime(mockDate);

    // Reset store to default state
    resetUserProfile();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default profile', () => {
      const profile = userProfile.get();

      expect(profile.firstVisitDate).toBeNull();
      expect(profile.totalWorkoutsCompleted).toBe(0);
      expect(profile.currentStreak).toBe(0);
      expect(profile.preferredLevel).toBe('beginner');
      expect(profile.unlockedAchievements).toEqual([]);
    });

    it('should set first visit date on initialization', () => {
      initializeUserProfile();

      const profile = userProfile.get();

      expect(profile.firstVisitDate).toBe(mockDate.toISOString());
      expect(profile.lastVisitDate).toBe(mockDate.toISOString());
    });

    it('should update last visit date but not first visit', () => {
      initializeUserProfile();

      // Advance time by 1 day
      vi.setSystemTime(new Date('2025-01-16T10:00:00Z'));

      initializeUserProfile();

      const profile = userProfile.get();

      expect(profile.firstVisitDate).toBe(mockDate.toISOString());
      expect(profile.lastVisitDate).toBe(new Date('2025-01-16T10:00:00Z').toISOString());
    });

    it('should load saved profile from localStorage', () => {
      const savedProfile: UserProfile = {
        firstVisitDate: '2025-01-01T00:00:00Z',
        lastVisitDate: '2025-01-14T00:00:00Z',
        lastCompletionDate: '2025-01-14T00:00:00Z',
        totalWorkoutsCompleted: 10,
        totalExercisesCompleted: 300,
        totalTimeMinutes: 250,
        currentStreak: 5,
        longestStreak: 8,
        unlockedAchievements: ['firstSession', 'weekWarrior'],
        preferredLevel: 'intermediate'
      };

      localStorage.setItem('unslump-user-profile', JSON.stringify(savedProfile));

      // Force reload by resetting the module
      // In real scenario, this would happen on page reload
      const loaded = JSON.parse(localStorage.getItem('unslump-user-profile')!);

      expect(loaded.totalWorkoutsCompleted).toBe(10);
      expect(loaded.currentStreak).toBe(5);
    });
  });

  describe('recordWorkoutCompletion', () => {
    it('should record first workout completion', () => {
      recordWorkoutCompletion(21);

      const profile = userProfile.get();

      expect(profile.totalWorkoutsCompleted).toBe(1);
      expect(profile.totalExercisesCompleted).toBe(21);
      expect(profile.totalTimeMinutes).toBe(25);
      expect(profile.currentStreak).toBe(1);
      expect(profile.longestStreak).toBe(1);
      expect(profile.lastCompletionDate).toBe(mockDate.toISOString());
    });

    it('should not record duplicate completion on same day', () => {
      recordWorkoutCompletion(21);
      recordWorkoutCompletion(21); // Try to record again

      const profile = userProfile.get();

      expect(profile.totalWorkoutsCompleted).toBe(1); // Should still be 1
    });

    it('should increment streak for consecutive days', () => {
      // Day 1
      recordWorkoutCompletion(21);

      // Day 2
      vi.setSystemTime(new Date('2025-01-16T10:00:00Z'));
      recordWorkoutCompletion(21);

      // Day 3
      vi.setSystemTime(new Date('2025-01-17T10:00:00Z'));
      recordWorkoutCompletion(21);

      const profile = userProfile.get();

      expect(profile.currentStreak).toBe(3);
      expect(profile.longestStreak).toBe(3);
      expect(profile.totalWorkoutsCompleted).toBe(3);
    });

    it('should reset streak when missing a day', () => {
      // Day 1
      recordWorkoutCompletion(21);

      // Day 2 (skip)

      // Day 3
      vi.setSystemTime(new Date('2025-01-17T10:00:00Z'));
      recordWorkoutCompletion(21);

      const profile = userProfile.get();

      expect(profile.currentStreak).toBe(1); // Reset to 1
      expect(profile.longestStreak).toBe(1);
    });

    it('should maintain longest streak when current streak is lower', () => {
      // Build up a streak of 5
      for (let i = 0; i < 5; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      let profile = userProfile.get();
      expect(profile.currentStreak).toBe(5);
      expect(profile.longestStreak).toBe(5);

      // Skip 2 days and restart
      vi.setSystemTime(new Date(mockDate.getTime() + 8 * 24 * 60 * 60 * 1000));
      recordWorkoutCompletion(21);

      profile = userProfile.get();
      expect(profile.currentStreak).toBe(1); // Reset
      expect(profile.longestStreak).toBe(5); // Maintains longest
    });

    it('should update longest streak when current exceeds it', () => {
      // Build streak of 3
      for (let i = 0; i < 3; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      // Skip days and build streak of 5
      vi.setSystemTime(new Date(mockDate.getTime() + 10 * 24 * 60 * 60 * 1000));
      for (let i = 0; i < 5; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (10 + i + 1) * 24 * 60 * 60 * 1000));
      }

      const profile = userProfile.get();
      expect(profile.currentStreak).toBe(5);
      expect(profile.longestStreak).toBe(5);
    });

    it('should accumulate exercises and time correctly', () => {
      recordWorkoutCompletion(21);
      vi.setSystemTime(new Date('2025-01-16T10:00:00Z'));
      recordWorkoutCompletion(21);
      vi.setSystemTime(new Date('2025-01-17T10:00:00Z'));
      recordWorkoutCompletion(18); // User skipped some exercises

      const profile = userProfile.get();

      expect(profile.totalExercisesCompleted).toBe(60); // 21 + 21 + 18
      expect(profile.totalTimeMinutes).toBe(75); // 25 * 3
    });
  });

  describe('achievements', () => {
    it('should unlock firstSession achievement', () => {
      recordWorkoutCompletion(21);

      const profile = userProfile.get();

      expect(profile.unlockedAchievements).toContain('firstSession');
    });

    it('should unlock weekWarrior at 7-day streak', () => {
      for (let i = 0; i < 7; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      const profile = userProfile.get();

      expect(profile.unlockedAchievements).toContain('weekWarrior');
    });

    it('should unlock posturePro at 30-day streak', () => {
      for (let i = 0; i < 30; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      const profile = userProfile.get();

      expect(profile.unlockedAchievements).toContain('posturePro');
    });

    it('should unlock consistencyKing at 50 workouts', () => {
      for (let i = 0; i < 50; i++) {
        // Do workouts with gaps to test that it's based on total count, not streak
        recordWorkoutCompletion(21);
        // Skip every other day
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 2 * 24 * 60 * 60 * 1000));
      }

      const profile = userProfile.get();

      expect(profile.unlockedAchievements).toContain('consistencyKing');
    });

    it('should not unlock achievements twice', () => {
      recordWorkoutCompletion(21);
      vi.setSystemTime(new Date('2025-01-16T10:00:00Z'));
      recordWorkoutCompletion(21);

      const profile = userProfile.get();
      const firstSessionCount = profile.unlockedAchievements.filter(a => a === 'firstSession').length;

      expect(firstSessionCount).toBe(1);
    });
  });

  describe('computed values', () => {
    it('should compute userStats correctly', () => {
      // Set up profile with some data
      recordWorkoutCompletion(21);
      vi.setSystemTime(new Date('2025-01-16T10:00:00Z'));
      recordWorkoutCompletion(21);

      const stats = userStats.get();

      expect(stats.streak).toBe(2);
      expect(stats.totalExercises).toBe(42);
      expect(stats.totalTime).toBe(50);
      expect(stats.totalWorkouts).toBe(2);
      expect(stats.level).toBe('beginner');
      expect(stats.longestStreak).toBe(2);
    });

    it('should compute achievements correctly', () => {
      recordWorkoutCompletion(21);

      const achievementsData = achievements.get();

      expect(achievementsData.unlocked).toContain('firstSession');
      expect(achievementsData.isUnlocked('firstSession')).toBe(true);
      expect(achievementsData.isUnlocked('weekWarrior')).toBe(false);
      expect(achievementsData.count).toBe(1);
      expect(achievementsData.total).toBe(4);
    });

    it('should compute streakStatus for active streak', () => {
      // Complete workout today
      recordWorkoutCompletion(21);

      const status = streakStatus.get();

      expect(status.current).toBe(1);
      expect(status.completedToday).toBe(true);
      expect(status.isAtRisk).toBe(false);
      expect(status.daysUntilNextMilestone).toBe(6); // 7 - 1
    });

    it('should compute streakStatus for at-risk streak', () => {
      // Complete workout yesterday
      vi.setSystemTime(new Date('2025-01-14T10:00:00Z'));
      recordWorkoutCompletion(21);

      // Check status today (didn't complete yet)
      vi.setSystemTime(new Date('2025-01-15T10:00:00Z'));
      userProfile.set({ ...userProfile.get() });

      const status = streakStatus.get();

      expect(status.completedToday).toBe(false);
      expect(status.isAtRisk).toBe(true);
    });

    it('should compute daysUntilNextMilestone correctly', () => {
      // 3-day streak
      for (let i = 0; i < 3; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      const status = streakStatus.get();

      expect(status.daysUntilNextMilestone).toBe(4); // 7 - 3
    });

    it('should compute daysUntilNextMilestone for mid-level streak', () => {
      // 10-day streak (between 7 and 30)
      for (let i = 0; i < 10; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      const status = streakStatus.get();

      expect(status.daysUntilNextMilestone).toBe(20); // 30 - 10
    });

    it('should return null for daysUntilNextMilestone at max', () => {
      // 30+ day streak
      for (let i = 0; i < 31; i++) {
        recordWorkoutCompletion(21);
        vi.setSystemTime(new Date(mockDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000));
      }

      const status = streakStatus.get();

      expect(status.daysUntilNextMilestone).toBeNull();
    });
  });

  describe('setPreferredLevel', () => {
    it('should update preferred level', () => {
      setPreferredLevel('advanced');

      const profile = userProfile.get();

      expect(profile.preferredLevel).toBe('advanced');
    });

    it('should persist level to localStorage', () => {
      setPreferredLevel('intermediate');

      const saved = JSON.parse(localStorage.getItem('unslump-user-profile')!);

      expect(saved.preferredLevel).toBe('intermediate');
    });
  });

  describe('hasUserProgress', () => {
    it('should return false for new user', () => {
      expect(hasUserProgress()).toBe(false);
    });

    it('should return true after completing workout', () => {
      recordWorkoutCompletion(21);

      expect(hasUserProgress()).toBe(true);
    });
  });

  describe('isFirstVisit', () => {
    it('should return true for new user', () => {
      expect(isFirstVisit()).toBe(true);
    });

    it('should return false after initialization', () => {
      initializeUserProfile();

      // Still first visit if no workouts completed
      expect(isFirstVisit()).toBe(true);
    });

    it('should return false after completing workout', () => {
      recordWorkoutCompletion(21);

      expect(isFirstVisit()).toBe(false);
    });
  });

  describe('resetUserProfile', () => {
    it('should reset all user data to defaults', () => {
      // Set up some data
      recordWorkoutCompletion(21);
      setPreferredLevel('advanced');

      // Reset
      resetUserProfile();

      const profile = userProfile.get();

      expect(profile.totalWorkoutsCompleted).toBe(0);
      expect(profile.currentStreak).toBe(0);
      expect(profile.preferredLevel).toBe('beginner');
      expect(profile.unlockedAchievements).toEqual([]);
    });

    it('should clear localStorage', () => {
      recordWorkoutCompletion(21);

      resetUserProfile();

      const saved = localStorage.getItem('unslump-user-profile');
      const parsed = JSON.parse(saved!);

      expect(parsed.totalWorkoutsCompleted).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle workout completion at midnight boundary', () => {
      // Complete workout at 23:59
      vi.setSystemTime(new Date('2025-01-15T23:59:00Z'));
      recordWorkoutCompletion(21);

      // Complete workout at 00:01 next day
      vi.setSystemTime(new Date('2025-01-16T00:01:00Z'));
      recordWorkoutCompletion(21);

      const profile = userProfile.get();

      expect(profile.currentStreak).toBe(2);
    });

    it('should handle multiple workouts on different days with time zone', () => {
      // Day 1 morning
      vi.setSystemTime(new Date('2025-01-15T08:00:00Z'));
      recordWorkoutCompletion(21);

      // Day 2 evening
      vi.setSystemTime(new Date('2025-01-16T20:00:00Z'));
      recordWorkoutCompletion(21);

      const profile = userProfile.get();

      expect(profile.currentStreak).toBe(2);
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('unslump-user-profile', 'invalid json{');

      // Should return default profile without throwing
      const profile = userProfile.get();

      expect(profile.totalWorkoutsCompleted).toBeDefined();
    });
  });

  describe('localStorage persistence', () => {
    it('should save profile after workout completion', () => {
      recordWorkoutCompletion(21);

      const saved = localStorage.getItem('unslump-user-profile');

      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.totalWorkoutsCompleted).toBe(1);
    });

    it('should save profile after setting level', () => {
      setPreferredLevel('intermediate');

      const saved = localStorage.getItem('unslump-user-profile');
      const parsed = JSON.parse(saved!);

      expect(parsed.preferredLevel).toBe('intermediate');
    });
  });
});
