import { test, expect } from '@playwright/test';

interface ProgressState {
  completed: string[];
}

interface WorkoutSessionState {
  workoutState: string;
  currentPhaseIndex: number;
  currentExerciseIndex: number;
  isPaused: boolean;
  currentReps: number;
  currentSet: number;
  currentSide: number;
}

function parseStoredJson<T>(value: string | null, key: string): T {
  if (value === null) {
    throw new Error(`Expected localStorage key "${key}" to exist`);
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Expected localStorage key "${key}" to contain valid JSON`);
  }
}

test.describe('Progress Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/');
    await page.evaluate(() => {
      localStorage.clear();
      // Mark onboarding as seen to avoid modal blocking tests
      localStorage.setItem('unslump-onboarding-seen', 'true');
      localStorage.setItem('unslump-workout-onboarding-seen', 'true');
    });
  });

  test('should save app progress across page reloads', async ({ page }) => {
    await page.goto('/en/app');

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete first exercise
    const completeBtn = page.locator('.complete-btn').first();
    await completeBtn.waitFor({ state: 'visible' });
    await completeBtn.click();

    // Get the exercise key that was completed
    const savedProgress = parseStoredJson<ProgressState>(
      await page.evaluate(() => localStorage.getItem('unslump-progress')),
      'unslump-progress',
    );
    const completedKey = savedProgress.completed[0];

    // Reload page
    await page.reload();

    // Check that progress is still there
    const progressAfterReload = parseStoredJson<ProgressState>(
      await page.evaluate(() => localStorage.getItem('unslump-progress')),
      'unslump-progress',
    );

    expect(progressAfterReload.completed).toContain(completedKey);
  });

  test('should save workout session state', async ({ page }) => {
    await page.goto('/en/workout');

    await expect.poll(() => page.evaluate(() =>
      localStorage.getItem('unslump-workout-session'),
    )).not.toBeNull();

    const sessionState = parseStoredJson<WorkoutSessionState>(
      await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
      'unslump-workout-session',
    );
    expect(sessionState).toMatchObject({
      workoutState: 'PHASE_INTRO',
      currentPhaseIndex: 0,
      currentExerciseIndex: 0,
    });
  });

  test('should restore workout session on reload', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('unslump-workout-session', JSON.stringify({
        workoutState: 'EXERCISE_ACTIVE',
        currentPhaseIndex: 0,
        currentExerciseIndex: 1,
        timeLeft: 30,
        isPaused: false,
        startTime: Date.now(),
        pausedTime: null,
        currentReps: 0,
        currentSet: 1,
        currentSide: 1,
      }));
    });

    await page.goto('/en/workout');

    const resumeHeading = page.getByRole('heading', { name: 'Resume where you left off?' });
    await expect(resumeHeading).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Resume workout' }).click();
    await expect(resumeHeading).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Pectoral release' })).toBeVisible();
  });

  test('should handle browser navigation (back/forward)', async ({ page }) => {
    await page.goto('/en/');
    await page.goto('/en/app');

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete exercise
    const completeBtn = page.locator('.complete-btn').first();
    await completeBtn.waitFor({ state: 'visible' });
    await completeBtn.click();

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/?$/);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/\/en\/app/);

    // Progress should still be there in localStorage
    const progress = parseStoredJson<ProgressState>(
      await page.evaluate(() => localStorage.getItem('unslump-progress')),
      'unslump-progress',
    );
    expect(progress.completed.length).toBeGreaterThan(0);
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    await page.goto('/en/app');

    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('unslump-progress', 'invalid json{');
    });

    // Reload - should not crash
    await page.reload();

    // Page should still load (check for logo)
    await expect(page.locator('#progress-logo')).toBeVisible();
  });

  test('should preserve onboarding state', async ({ page }) => {
    await page.goto('/en/app');

    // Mark onboarding as seen
    await page.evaluate(() => {
      localStorage.setItem('unslump-onboarding-seen', 'true');
    });

    // Reload
    await page.reload();

    // Check that onboarding is still marked as seen
    const onboardingSeen = await page.evaluate(() => {
      return localStorage.getItem('unslump-onboarding-seen') === 'true';
    });

    expect(onboardingSeen).toBe(true);
  });

  test('should handle multiple sessions on same day (app)', async ({ page }) => {
    await page.goto('/en/app');

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete first exercise
    const completeBtn1 = page.locator('.complete-btn').first();
    await completeBtn1.waitFor({ state: 'visible' });
    await completeBtn1.click();

    // Reload (simulating closing and reopening app)
    await page.reload();

    // Expand first phase again
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Try to complete another exercise
    const completeBtn2 = page.locator('.complete-btn').nth(1);
    await completeBtn2.waitFor({ state: 'visible' });
    await completeBtn2.click();

    // Progress should accumulate
    const progress = parseStoredJson<ProgressState>(
      await page.evaluate(() => localStorage.getItem('unslump-progress')),
      'unslump-progress',
    );

    expect(progress.completed.length).toBe(2);
  });

  test('should clear workout session when starting new', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('unslump-workout-session', JSON.stringify({
        workoutState: 'EXERCISE_ACTIVE',
        currentPhaseIndex: 2,
        currentExerciseIndex: 3,
        timeLeft: 30,
        isPaused: true,
        startTime: Date.now(),
        pausedTime: Date.now(),
        currentReps: 5,
        currentSet: 2,
        currentSide: 2,
      }));
    });

    await page.goto('/en/workout');
    await page.getByRole('button', { name: 'Start from beginning' }).click();

    await expect(
      page.getByRole('heading', { name: 'Resume where you left off?' }),
    ).toBeHidden();
    await expect.poll(async () => {
      const session = parseStoredJson<WorkoutSessionState>(
        await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
        'unslump-workout-session',
      );
      return [
        session.workoutState,
        session.currentPhaseIndex,
        session.currentExerciseIndex,
        session.isPaused,
        session.currentReps,
        session.currentSet,
        session.currentSide,
      ];
    }).toEqual(['PHASE_INTRO', 0, 0, false, 0, 1, 1]);
  });

  test('should handle storage quota exceeded', async ({ page }) => {
    await page.goto('/en/app');

    // Try to fill localStorage near limit
    await page.evaluate(() => {
      try {
        const largeData = 'x'.repeat(5 * 1024 * 1024); // 5MB
        localStorage.setItem('test-large-data', largeData);
      } catch (e) {
        // Expected to fail, that's okay
      }
    });

    // App should still work
    await expect(page.locator('#progress-logo')).toBeVisible();

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Can still interact with completion buttons
    const completeBtn = page.locator('.complete-btn').first();
    await completeBtn.waitFor({ state: 'visible' });
    await completeBtn.click();
  });
});
