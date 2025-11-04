/**
 * User Store
 * Manages user profile, streaks, achievements, and historical stats
 */

import { atom, computed } from 'nanostores';

export interface UserProfile {
  firstVisitDate: string | null;
  lastVisitDate: string | null;
  lastCompletionDate: string | null;
  totalWorkoutsCompleted: number;
  totalExercisesCompleted: number;
  totalTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  unlockedAchievements: string[];
  preferredLevel: 'beginner' | 'intermediate' | 'advanced';
}

const STORAGE_KEY = 'unslump-user-profile';
const WORKOUT_DURATION_MINUTES = 25;

// Default user profile
const defaultProfile: UserProfile = {
  firstVisitDate: null,
  lastVisitDate: null,
  lastCompletionDate: null,
  totalWorkoutsCompleted: 0,
  totalExercisesCompleted: 0,
  totalTimeMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  unlockedAchievements: [],
  preferredLevel: 'beginner'
};

// Core state atom
export const userProfile = atom<UserProfile>(loadUserProfile());

/**
 * Load user profile from localStorage
 */
function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultProfile;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProfile;

    const parsed = JSON.parse(stored);
    return { ...defaultProfile, ...parsed };
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return defaultProfile;
  }
}

/**
 * Save user profile to localStorage
 */
function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to save user profile:', error);
  }
}

/**
 * Initialize user profile (call on app start)
 */
export function initializeUserProfile(): void {
  const profile = userProfile.get();
  const now = new Date().toISOString();

  // Set first visit date if not set
  if (!profile.firstVisitDate) {
    profile.firstVisitDate = now;
  }

  // Update last visit date
  profile.lastVisitDate = now;

  userProfile.set(profile);
  saveUserProfile(profile);
}

/**
 * Calculate if dates are consecutive days
 */
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Reset times to midnight for accurate day comparison
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays === 1;
}

/**
 * Calculate if date is today
 */
function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();

  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}

/**
 * Record workout completion
 */
export function recordWorkoutCompletion(exercisesCompleted: number): void {
  const profile = userProfile.get();
  const now = new Date().toISOString();

  // Don't record if already completed today
  if (profile.lastCompletionDate && isToday(profile.lastCompletionDate)) {
    return;
  }

  // Update totals
  profile.totalWorkoutsCompleted++;
  profile.totalExercisesCompleted += exercisesCompleted;
  profile.totalTimeMinutes += WORKOUT_DURATION_MINUTES;

  // Update streak
  if (profile.lastCompletionDate) {
    if (areConsecutiveDays(profile.lastCompletionDate, now)) {
      // Consecutive day - increment streak
      profile.currentStreak++;
    } else if (!isToday(profile.lastCompletionDate)) {
      // Broke the streak
      profile.currentStreak = 1;
    }
  } else {
    // First workout ever
    profile.currentStreak = 1;
  }

  // Update longest streak
  if (profile.currentStreak > profile.longestStreak) {
    profile.longestStreak = profile.currentStreak;
  }

  // Update last completion date
  profile.lastCompletionDate = now;

  // Check and unlock achievements
  checkAndUnlockAchievements(profile);

  userProfile.set(profile);
  saveUserProfile(profile);
}

/**
 * Check and unlock achievements based on current stats
 */
function checkAndUnlockAchievements(profile: UserProfile): void {
  const achievements: string[] = [...profile.unlockedAchievements];

  // First Session
  if (profile.totalWorkoutsCompleted >= 1 && !achievements.includes('firstSession')) {
    achievements.push('firstSession');
  }

  // Week Warrior (7-day streak)
  if (profile.currentStreak >= 7 && !achievements.includes('weekWarrior')) {
    achievements.push('weekWarrior');
  }

  // Posture Pro (30-day streak)
  if (profile.currentStreak >= 30 && !achievements.includes('posturePro')) {
    achievements.push('posturePro');
  }

  // Consistency King (50 workouts)
  if (profile.totalWorkoutsCompleted >= 50 && !achievements.includes('consistencyKing')) {
    achievements.push('consistencyKing');
  }

  profile.unlockedAchievements = achievements;
}

/**
 * Update preferred level
 */
export function setPreferredLevel(level: 'beginner' | 'intermediate' | 'advanced'): void {
  const profile = userProfile.get();
  profile.preferredLevel = level;
  userProfile.set(profile);
  saveUserProfile(profile);
}

/**
 * Check if user has progress (has completed at least one workout)
 */
export function hasUserProgress(): boolean {
  const profile = userProfile.get();
  return profile.totalWorkoutsCompleted > 0;
}

/**
 * Check if this is first visit
 */
export function isFirstVisit(): boolean {
  const profile = userProfile.get();
  return profile.firstVisitDate === null || profile.totalWorkoutsCompleted === 0;
}

/**
 * Reset all user data (nuclear option)
 */
export function resetUserProfile(): void {
  userProfile.set(defaultProfile);
  saveUserProfile(defaultProfile);
}

/**
 * Computed: User stats for dashboard
 */
export const userStats = computed(userProfile, (profile) => ({
  streak: profile.currentStreak,
  totalExercises: profile.totalExercisesCompleted,
  totalTime: profile.totalTimeMinutes,
  totalWorkouts: profile.totalWorkoutsCompleted,
  level: profile.preferredLevel,
  longestStreak: profile.longestStreak
}));

/**
 * Computed: Achievement status
 */
export const achievements = computed(userProfile, (profile) => ({
  unlocked: profile.unlockedAchievements,
  isUnlocked: (achievementId: string) => profile.unlockedAchievements.includes(achievementId),
  count: profile.unlockedAchievements.length,
  total: 4 // Total number of achievements available
}));

/**
 * Computed: Streak status
 */
export const streakStatus = computed(userProfile, (profile) => {
  // Check if streak is at risk (didn't complete today)
  const completedToday = profile.lastCompletionDate && isToday(profile.lastCompletionDate);
  const isAtRisk = !completedToday && profile.currentStreak > 0;

  return {
    current: profile.currentStreak,
    longest: profile.longestStreak,
    completedToday,
    isAtRisk,
    daysUntilNextMilestone: profile.currentStreak < 7 ? 7 - profile.currentStreak :
                            profile.currentStreak < 30 ? 30 - profile.currentStreak :
                            null
  };
});
