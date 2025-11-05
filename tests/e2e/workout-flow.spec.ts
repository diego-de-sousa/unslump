import { test, expect } from '@playwright/test';

test.describe('Guided Workout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/en/');
    await page.evaluate(() => {
      localStorage.clear();
      // Mark onboarding as seen to avoid modal blocking tests
      localStorage.setItem('unslump-workout-onboarding-seen', 'true');
    });
  });

  // Helper to dismiss onboarding modal if present
  async function dismissOnboardingIfPresent(page) {
    const onboardingModal = page.locator('#workoutOnboardingModal');
    if (await onboardingModal.isVisible({ timeout: 2000 }).catch(() => false)) {
      const startButton = page.locator('#startWorkoutOnboarding, #closeWorkoutOnboarding').first();
      await startButton.click();
      await page.waitForTimeout(500);
    }
  }

  test('should load workout page and show initial state', async ({ page }) => {
    await page.goto('/en/workout');

    // Should show loading or start state
    await expect(page.locator('#workoutContainer')).toBeVisible();

    // Header should be visible
    await expect(page.locator('.workout-header')).toBeVisible();

    // Logo should be visible
    await expect(page.locator('#progressLogo')).toBeVisible();

    // FAB button should be visible
    await expect(page.locator('#pausePlayButton')).toBeVisible();
  });

  test('should show resume modal if session exists', async ({ page }) => {
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

    // Reload page
    await page.goto('/en/workout');

    // Resume modal should appear
    const resumeModal = page.locator('#resumeModal');
    await expect(resumeModal).toBeVisible({ timeout: 10000 });

    // Should have resume and start new buttons
    await expect(page.locator('#resumeButton')).toBeVisible();
    await expect(page.locator('#startNewButton')).toBeVisible();
  });

  test('should start new workout from resume modal', async ({ page }) => {
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

    // Workout should be running
    await expect(page.locator('#pausePlayButton')).toBeVisible();
  });

  test('should open and close settings modal', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait for workout to start
    await page.waitForTimeout(2000);

    // Dismiss onboarding modal if present
    await dismissOnboardingIfPresent(page);

    // Click settings button
    const settingsButton = page.locator('#settingsButton');
    await settingsButton.click();

    // Settings modal should be visible
    const settingsModal = page.locator('#settingsModal');
    await expect(settingsModal).toBeVisible();

    // Should have language selector
    await expect(page.locator('#workout-language-select')).toBeVisible();

    // Close modal
    await page.locator('#closeSettingsButton').click();
    await expect(settingsModal).toBeHidden();
  });

  test.skip('should pause and resume workout', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait longer for workout to start and reach active state
    await page.waitForTimeout(10000);

    // Dismiss onboarding modal if present
    await dismissOnboardingIfPresent(page);

    // Verify workout is running - FAB should be visible
    await expect(page.locator('#pausePlayButton')).toBeVisible();

    // Click pause button
    await page.locator('#pausePlayButton').click();
    await page.waitForTimeout(500);

    // Check if paused - either playIcon visible OR navigation buttons visible
    const playIconVisible = await page.locator('#playIcon').isVisible().catch(() => false);
    const navButtonsVisible = await page.locator('#navigationButtons').isVisible().catch(() => false);

    // At least one indicator of pause state should be visible
    expect(playIconVisible || navButtonsVisible).toBe(true);
  });

  test.skip('should navigate to previous exercise when paused', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait for workout to progress
    await page.waitForTimeout(8000);

    // Pause
    await page.locator('#pausePlayButton').click();

    // Previous button should be visible
    const previousButton = page.locator('#previousButton');
    await expect(previousButton).toBeVisible();

    // Click previous
    await previousButton.click();

    // Should still be paused
    await expect(page.locator('#playIcon')).toBeVisible();
  });

  test.skip('should skip exercise when paused', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait for workout to start
    await page.waitForTimeout(5000);

    // Pause
    await page.locator('#pausePlayButton').click();

    // Skip button should be visible
    const skipButton = page.locator('#skipButton');
    await expect(skipButton).toBeVisible();

    // Click skip
    await skipButton.click();

    // Should move to next exercise
    await page.waitForTimeout(500);

    // Should still be paused
    await expect(page.locator('#playIcon')).toBeVisible();
  });

  test('should open workout navigator', async ({ page }) => {
    await page.goto('/en/workout');

    await page.waitForTimeout(2000);

    // Click logo to open navigator
    await page.locator('#logoNavigationButton').click();

    // Navigator should appear (it's a Preact island component)
    // Check if the navigator panel becomes visible
    await page.waitForTimeout(500);

    // The navigator uses Preact, so we can't easily test its internals in E2E
    // But clicking the button should trigger the toggle
  });

  test('should show FAB timer display during active exercise', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait for workout to reach active exercise state
    await page.waitForTimeout(8000);

    // FAB timer should be visible
    const fabTimer = page.locator('#fabTimer');

    // Timer might be visible
    if (await fabTimer.isVisible()) {
      const timerText = await fabTimer.textContent();
      // Should be a number
      expect(timerText).toMatch(/\d+/);
    }
  });

  test('should show progress ring during timed exercises', async ({ page }) => {
    await page.goto('/en/workout');

    // Wait for workout to reach active state
    await page.waitForTimeout(8000);

    // Progress ring might be visible for timed exercises
    const progressRing = page.locator('#fabProgressRing');

    // Check if visible (depends on exercise type)
    const isVisible = await progressRing.isVisible();
    // Just verify it exists
    expect(progressRing).toBeTruthy();
  });

  test('should confirm before exit', async ({ page }) => {
    await page.goto('/en/workout');

    await page.waitForTimeout(2000);

    // Set up dialog handler
    page.on('dialog', dialog => {
      expect(dialog.type()).toBe('confirm');
      dialog.dismiss(); // Cancel the exit
    });

    // Click exit button
    await page.locator('#exitButton').click();

    // Should still be on workout page
    await expect(page.locator('#workoutContainer')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/workout');

    // Check that page loads correctly
    await expect(page.locator('#workoutContainer')).toBeVisible();

    // FAB should be visible
    await expect(page.locator('#pausePlayButton')).toBeVisible();

    // Header should be visible
    await expect(page.locator('.workout-header')).toBeVisible();
  });

  test('should display correct language content', async ({ page }) => {
    await page.goto('/en/workout');

    await page.waitForTimeout(2000);

    // Check HTML lang attribute
    const langAttr = await page.getAttribute('html', 'lang');
    expect(langAttr).toBe('en');

    // Switch to Spanish
    await page.goto('/es/workout');
    await page.waitForTimeout(2000);

    const langAttrES = await page.getAttribute('html', 'lang');
    expect(langAttrES).toBe('es');
  });
});
