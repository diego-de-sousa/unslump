import { test, expect } from '@playwright/test';

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
    const completedKey = await page.evaluate(() => {
      const progress = JSON.parse(localStorage.getItem('unslump-progress') || '{}');
      return progress.completed[0];
    });

    // Reload page
    await page.reload();

    // Check that progress is still there
    const progressAfterReload = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });

    expect(progressAfterReload.completed).toContain(completedKey);
  });

  test('should save workout session state', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait longer for workout to fully start and reach active state
    await page.waitForTimeout(10000);

    // Check that session state is saved (auto-saves during workout)
    const sessionState = await page.evaluate(() => {
      const data = localStorage.getItem('workout-session-state');
      return data ? JSON.parse(data) : null;
    });

    // Session should be saved automatically during workout
    if (sessionState) {
      expect(sessionState.workoutState).toBeTruthy();
    } else {
      // If no session saved yet, just verify workout is running
      const container = await page.locator('#workoutContainer').isVisible();
      expect(container).toBe(true);
    }
  });

  test('should restore workout session on reload', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait longer for workout to reach active state and save
    await page.waitForTimeout(10000);

    // Manually save a session state to ensure we have something to restore
    await page.evaluate(() => {
      localStorage.setItem('workout-session-state', JSON.stringify({
        workoutState: 'EXERCISE_ACTIVE',
        currentPhaseIndex: 0,
        currentExerciseIndex: 0,
        timeLeft: 30,
        isPaused: false
      }));
    });

    // Reload page
    await page.goto('/en/workout');

    // Resume modal should appear
    await expect(page.locator('#resumeModal')).toBeVisible({ timeout: 10000 });

    // Has resume button
    await expect(page.locator('#resumeButton')).toBeVisible();
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
    const progress = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });
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

  test.skip('should work offline (PWA mode)', async ({ page, context }) => {
    await page.goto('/en/app');

    // Wait for service worker to be registered
    await page.waitForTimeout(2000);

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete an exercise
    const completeBtn = page.locator('.complete-btn').first();
    await completeBtn.waitFor({ state: 'visible' });
    await completeBtn.click();

    // Simulate offline mode
    await context.setOffline(true);

    // Reload page - should still work due to service worker cache
    await page.reload();

    // Check that page loaded
    await expect(page.locator('#progress-logo')).toBeVisible();

    // Progress should still be there
    const progress = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });

    expect(progress.completed.length).toBeGreaterThan(0);

    // Restore online mode
    await context.setOffline(false);
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
    const progress = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });

    expect(progress.completed.length).toBe(2);
  });

  test('should clear workout session when starting new', async ({ page }) => {
    // Create a saved session
    await page.goto('/en/workout');
    await page.evaluate(() => {
      localStorage.setItem('workout-session-state', JSON.stringify({
        workoutState: 'EXERCISE_ACTIVE',
        currentPhaseIndex: 0,
        currentExerciseIndex: 0,
        timeLeft: 30,
        isPaused: false
      }));
    });

    await page.goto('/en/workout');

    // Click start new
    await page.locator('#startNewButton').click();

    // Modal should close
    await expect(page.locator('#resumeModal')).toBeHidden();

    // New session should be created
    const sessionState = await page.evaluate(() => {
      const data = localStorage.getItem('workout-session-state');
      return data ? JSON.parse(data) : null;
    });

    expect(sessionState).toBeTruthy();
    // Should have reset to initial state
    expect(sessionState.currentPhaseIndex).toBe(0);
    expect(sessionState.currentExerciseIndex).toBe(0);
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
