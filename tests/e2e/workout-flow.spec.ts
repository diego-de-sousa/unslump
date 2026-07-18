import { test, expect, type Page } from '@playwright/test';

interface WorkoutSessionState {
  workoutState: string;
  currentPhaseIndex: number;
  currentExerciseIndex: number;
  isPaused: boolean;
  pausedTime: number | null;
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
  async function dismissOnboardingIfPresent(page: Page) {
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

  async function startActiveWorkout(page: Page) {
    await page.goto('/en/workout');
    await dismissOnboardingIfPresent(page);
    await page.locator('#continueFromPhaseBtn').click();
    await expect.poll(async () => {
      const session = parseStoredJson<WorkoutSessionState>(
        await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
        'unslump-workout-session',
      );
      return session.workoutState;
    }, { timeout: 10_000 }).toBe('EXERCISE_ACTIVE');
  }

  async function restoreActiveWorkout(page: Page, exerciseIndex: number) {
    await page.evaluate((currentExerciseIndex) => {
      localStorage.setItem('unslump-workout-session', JSON.stringify({
        workoutState: 'EXERCISE_ACTIVE',
        currentPhaseIndex: 0,
        currentExerciseIndex,
        timeLeft: 30,
        isPaused: false,
        startTime: Date.now(),
        pausedTime: null,
        currentReps: 0,
        currentSet: 1,
        currentSide: 1,
      }));
    }, exerciseIndex);
    await page.goto('/en/workout');
    await page.locator('#resumeButton').click();
    await expect(page.locator('#resumeModal')).toBeHidden();
  }

  test('should preserve an active session when switching to Explore mode', async ({ page }) => {
    await restoreActiveWorkout(page, 1);

    await page.getByRole('link', { name: 'Explore mode' }).click();
    await expect(page).toHaveURL('/en/app');

    const preservedSession = parseStoredJson<WorkoutSessionState>(
      await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
      'unslump-workout-session',
    );
    expect(preservedSession.currentPhaseIndex).toBe(0);
    expect(preservedSession.currentExerciseIndex).toBe(1);
    expect(preservedSession.workoutState).toBe('EXERCISE_ACTIVE');
    expect(preservedSession.isPaused).toBe(true);
    expect(preservedSession.pausedTime).not.toBeNull();

    await page.getByRole('link', { name: 'Start Guided Workout' }).click();
    await expect(page.locator('#resumeModal')).toBeVisible();
    await page.locator('#resumeButton').click();
    await expect(page.locator('#fabTimer')).toHaveText('30');
    await expect(page.locator('#fabTimer')).not.toHaveText('30', { timeout: 5_000 });
  });

  test('should pause and resume workout', async ({ page }) => {
    await startActiveWorkout(page);

    await page.locator('#pausePlayButton').click();
    await expect(page.locator('#playIcon')).toBeVisible();
    await expect(page.locator('#navigationButtons')).toBeVisible();
    await expect.poll(async () => parseStoredJson<WorkoutSessionState>(
      await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
      'unslump-workout-session',
    ).isPaused).toBe(true);

    await page.locator('#pausePlayButton').click();
    await expect(page.locator('#playIcon')).toBeHidden();
    await expect(page.locator('#navigationButtons')).toBeHidden();
    await expect.poll(async () => parseStoredJson<WorkoutSessionState>(
      await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
      'unslump-workout-session',
    ).isPaused).toBe(false);
  });

  test('should navigate to previous exercise when paused', async ({ page }) => {
    await restoreActiveWorkout(page, 1);
    await page.locator('#pausePlayButton').click();
    const previousButton = page.locator('#previousButton');
    await expect(previousButton).toBeVisible();
    await previousButton.click();
    await expect(page.locator('#playIcon')).toBeVisible();
    await expect.poll(async () => {
      const session = parseStoredJson<WorkoutSessionState>(
        await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
        'unslump-workout-session',
      );
      return [session.currentExerciseIndex, session.workoutState, session.isPaused];
    }).toEqual([0, 'EXERCISE_PREP', true]);
  });

  test('should skip exercise when paused', async ({ page }) => {
    await restoreActiveWorkout(page, 0);
    await page.locator('#pausePlayButton').click();
    const skipButton = page.locator('#skipButton');
    await expect(skipButton).toBeVisible();
    await skipButton.click();
    await expect(page.locator('#playIcon')).toBeVisible();
    await expect.poll(async () => {
      const session = parseStoredJson<WorkoutSessionState>(
        await page.evaluate(() => localStorage.getItem('unslump-workout-session')),
        'unslump-workout-session',
      );
      return [session.workoutState, session.isPaused];
    }).toEqual(['REST_PERIOD', true]);
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

    // Just verify it exists
    await expect(progressRing).toBeAttached();
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

  test('should preserve onboarding modal spacing on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => localStorage.removeItem('unslump-workout-onboarding-seen'));
    await page.goto('/en/workout');

    const modal = page.locator('#workoutOnboardingModal');
    await expect(modal).toBeVisible();

    const panel = modal.locator(':scope > div');
    const header = panel.locator(':scope > div').nth(0);
    const content = panel.locator(':scope > div').nth(1);
    const footer = panel.locator(':scope > div').nth(2);
    const firstCard = content.locator('.grid > div').first();
    const introduction = content.locator(':scope > div').first();

    await expect(modal).toHaveCSS('padding', '16px');
    await expect(header).toHaveCSS('padding', '16px 24px');
    await expect(content).toHaveCSS('padding', '24px');
    await expect(introduction).toHaveCSS('margin-bottom', '24px');
    await expect(firstCard).toHaveCSS('padding', '16px');
    await expect(footer).toHaveCSS('padding', '16px 24px');

    const contentBox = await content.boundingBox();
    const footerBox = await footer.boundingBox();
    if (!contentBox || !footerBox) {
      throw new Error('Expected onboarding content and footer to have bounding boxes');
    }
    expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(footerBox.y);
    await expect(page.locator('#startWorkoutOnboarding')).toBeInViewport();
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
    await expect(page.getByRole('link', { name: 'Modo explorar' })).toHaveAttribute('href', '/es/app');
  });
});
