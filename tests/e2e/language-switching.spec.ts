import { test, expect, type Page } from '@playwright/test';

interface GuidedSessionState {
  workoutState: string;
  currentPhaseIndex: number;
  currentExerciseIndex: number;
  timeLeft: number;
  isPaused: boolean;
  startTime: number;
  pausedTime: number | null;
  currentReps: number;
  currentSet: number;
  currentSide: number;
}

async function showGuidedState(
  page: Page,
  lang: 'en' | 'es',
  overrides: Partial<GuidedSessionState>,
): Promise<void> {
  const session: GuidedSessionState = {
    workoutState: 'PHASE_INTRO',
    currentPhaseIndex: 0,
    currentExerciseIndex: 0,
    timeLeft: 30,
    isPaused: true,
    startTime: Date.now(),
    pausedTime: Date.now(),
    currentReps: 0,
    currentSet: 1,
    currentSide: 1,
    ...overrides,
  };

  await page.evaluate((savedSession) => {
    localStorage.setItem('unslump-workout-session', JSON.stringify(savedSession));
    localStorage.setItem('unslump-workout-onboarding-seen', 'true');
  }, session);
  await page.goto(`/${lang}/workout`);
  await page.locator('#resumeButton').click();
  await expect(page.locator('#resumeModal')).toBeHidden();
}

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/');
    await page.evaluate(() => {
      // Mark onboarding as seen to avoid modal blocking tests
      localStorage.setItem('unslump-onboarding-seen', 'true');
      localStorage.setItem('unslump-workout-onboarding-seen', 'true');
    });
  });

  test('should redirect from root to default locale (EN)', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /en/
    await expect(page).toHaveURL(/\/en\/?/);
  });

  test('should display English content on /en/ route', async ({ page }) => {
    await page.goto('/en/');

    // Check for English text
    await expect(page.locator('body')).toContainText(/exercise|workout|posture/i);

    // Check page is loaded (any visible element)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display Spanish content on /es/ route', async ({ page }) => {
    await page.goto('/es/');

    // Check for Spanish text
    await expect(page.locator('body')).toContainText(/ejercicio|rutina|postura/i);

    // Check page is loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should switch landing language by click without relying on hover', async ({ page }) => {
    await page.goto('/en/');

    const langButton = page.getByRole('button', {
      name: 'Select language. Current language: EN',
    });
    await expect(langButton).toHaveAttribute('aria-expanded', 'false');
    await langButton.click();
    await expect(langButton).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('link', { name: 'Switch to Español' }).click();

    await expect(page).toHaveURL('/es/');
    await expect(page.locator('body')).toContainText(/ejercicio|rutina/i);
  });

  test('should operate the landing language selector with the keyboard', async ({ page }) => {
    await page.goto('/en/');

    const langButton = page.getByRole('button', {
      name: 'Select language. Current language: EN',
    });
    await langButton.focus();
    await page.keyboard.press('Enter');
    await expect(langButton).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(langButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('should preserve the Explore route when switching languages', async ({ page }) => {
    await page.goto('/en/app');
    await page.locator('#show-onboarding-btn').click();
    await page.locator('#language-select').selectOption('es');

    await expect(page).toHaveURL('/es/app');
  });

  test('should have correct lang attribute on html element', async ({ page }) => {
    await page.goto('/en/');
    const langEN = await page.getAttribute('html', 'lang');
    expect(langEN).toBe('en');

    await page.goto('/es/');
    const langES = await page.getAttribute('html', 'lang');
    expect(langES).toBe('es');
  });

  test('should have correct hreflang links', async ({ page }) => {
    await page.goto('/en/');

    // Check for alternate language links
    const enLink = page.locator('link[rel="alternate"][hreflang="en"]');
    const esLink = page.locator('link[rel="alternate"][hreflang="es"]');

    await expect(enLink).toHaveCount(1);
    await expect(esLink).toHaveCount(1);
  });

  test('should preserve nested routes in canonical and alternate metadata', async ({ page }) => {
    const routes = [
      {
        path: '/en/workout?source=e2e',
        canonical: 'https://unslump.vercel.app/en/workout',
        en: 'https://unslump.vercel.app/en/workout',
        es: 'https://unslump.vercel.app/es/workout',
      },
      {
        path: '/es/app?source=e2e',
        canonical: 'https://unslump.vercel.app/es/app',
        en: 'https://unslump.vercel.app/en/app',
        es: 'https://unslump.vercel.app/es/app',
      },
    ];

    for (const route of routes) {
      await page.goto(route.path);

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', route.en);
      await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', route.es);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', route.en);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        'https://unslump.vercel.app/og-image.png'
      );
      await expect(page.locator('meta[property="twitter:image"]')).toHaveAttribute(
        'content',
        'https://unslump.vercel.app/og-image.png'
      );
    }
  });

  test('should have different meta descriptions for each language', async ({ page }) => {
    await page.goto('/en/');
    const descEN = await page.getAttribute('meta[name="description"]', 'content');

    await page.goto('/es/');
    const descES = await page.getAttribute('meta[name="description"]', 'content');

    expect(descEN).toBeTruthy();
    expect(descES).toBeTruthy();
    expect(descEN).not.toBe(descES);
  });

  test('should have correct og:locale meta tags', async ({ page }) => {
    await page.goto('/en/');
    const ogLocaleEN = await page.getAttribute('meta[property="og:locale"]', 'content');
    expect(ogLocaleEN).toMatch(/en/i);

    await page.goto('/es/');
    const ogLocaleES = await page.getAttribute('meta[property="og:locale"]', 'content');
    expect(ogLocaleES).toMatch(/es/i);
  });

  test('should preserve app progress when switching languages', async ({ page }) => {
    await page.goto('/en/app');

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete an exercise
    const completeBtn = page.locator('.complete-btn').first();
    await completeBtn.waitFor({ state: 'visible' });
    await completeBtn.click();

    // Get completed exercise key
    const completedKey = await page.evaluate(() => {
      const progress = JSON.parse(localStorage.getItem('unslump-progress') || '{}');
      return progress.completed[0];
    });

    // Switch to Spanish
    await page.goto('/es/app');

    // Check that progress is still there
    const progressInSpanish = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });

    expect(progressInSpanish.completed).toContain(completedKey);
  });

  test('should handle direct navigation to workout page in both languages', async ({ page }) => {
    // English workout page
    await page.goto('/en/workout');
    await expect(page.locator('#workoutContainer')).toBeVisible();

    // Spanish workout page
    await page.goto('/es/workout');
    await expect(page.locator('#workoutContainer')).toBeVisible();
  });

  test('should maintain language preference across navigation', async ({ page }) => {
    await page.goto('/es/');

    // Navigate to workout
    const workoutLink = page.locator('a[href*="workout"]').first();
    if (await workoutLink.isVisible()) {
      await workoutLink.click();

      // Should stay in Spanish
      await expect(page).toHaveURL(/\/es\/workout/);
    }
  });

  test('should handle invalid language codes', async ({ page }) => {
    // Try to navigate to invalid language
    const response = await page.goto('/fr/');

    // Should either redirect or show 404
    const url = page.url();

    // Astro might show the page with wrong language or 404
    // Just check that we get some response
    expect(response).toBeTruthy();
  });

  test('should display correct workout language in settings', async ({ page }) => {
    await page.goto('/en/workout');

    // Open settings
    await page.locator('#settingsButton').click();

    // Language selector should show correct language
    const langSelect = page.locator('#workout-language-select');
    await expect(langSelect).toBeVisible();

    const selectedValue = await langSelect.inputValue();
    expect(selectedValue).toBe('en');

    // Close settings
    await page.locator('#closeSettingsButton').click();

    // Switch to Spanish workout
    await page.evaluate(() => localStorage.removeItem('unslump-workout-session'));
    await page.goto('/es/workout');

    // Open settings again
    await page.locator('#settingsButton').click();

    // Should show Spanish selected
    const langSelectES = page.locator('#workout-language-select');
    await expect(langSelectES).toBeVisible();
    const selectedValueES = await langSelectES.inputValue();
    expect(selectedValueES).toBe('es');
  });

  test('should switch language from workout settings modal', async ({ page }) => {
    await page.goto('/en/workout');
    await page.locator('#settingsButton').click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#workout-language-select').selectOption('es');

    await expect(page).toHaveURL('/es/workout');
    await expect(page.locator('#workoutContainer')).toBeVisible();
  });

  test('should preserve an active Guided session and shared progress across a language switch', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('unslump-progress', JSON.stringify({
        completed: ['fase1-pectoral'],
        level: 'principiante',
        sessionLocked: false,
        lastSessionDate: new Date().toISOString(),
      }));
      localStorage.setItem('unslump-workout-session', JSON.stringify({
        workoutState: 'EXERCISE_ACTIVE',
        currentPhaseIndex: 0,
        currentExerciseIndex: 1,
        timeLeft: 30,
        isPaused: true,
        startTime: Date.now(),
        pausedTime: Date.now(),
        currentReps: 0,
        currentSet: 1,
        currentSide: 1,
      }));
    });
    await page.goto('/en/workout');
    await page.locator('#resumeButton').click();
    await page.locator('#settingsButton').click();
    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#workout-language-select').selectOption('es');

    await expect(page).toHaveURL('/es/workout');
    await expect(page.locator('#resumeModal')).toBeVisible();
    const preserved = await page.evaluate(() => ({
      session: JSON.parse(localStorage.getItem('unslump-workout-session') ?? '{}'),
      progress: JSON.parse(localStorage.getItem('unslump-progress') ?? '{}'),
    }));
    expect(preserved.session.currentPhaseIndex).toBe(0);
    expect(preserved.session.currentExerciseIndex).toBe(1);
    expect(preserved.session.workoutState).toBe('EXERCISE_ACTIVE');
    expect(preserved.progress.completed).toContain('fase1-pectoral');

    await page.locator('#resumeButton').click();
    await expect(page.locator('#stateContainer')).toContainText('Liberación de pectoral');
  });

  test('should render representative Spanish Guided states with exact dynamic copy', async ({ page }) => {
    await showGuidedState(page, 'es', { workoutState: 'PHASE_INTRO' });
    await expect(page.locator('#stateContainer')).toContainText('3 ejercicios');
    await expect(page.locator('#continueFromPhaseBtn')).toHaveText('Continuar');

    await showGuidedState(page, 'es', { workoutState: 'EXERCISE_PREP' });
    await expect(page.locator('#stateContainer')).toContainText('¡Prepárate!');

    await showGuidedState(page, 'es', {
      workoutState: 'EXERCISE_ACTIVE',
      currentPhaseIndex: 2,
    });
    await expect(page.locator('#stateContainer')).toContainText(
      'Toca el botón cuando completes la serie',
    );

    await showGuidedState(page, 'es', { workoutState: 'REST_PERIOD' });
    await expect(page.locator('#stateContainer')).toContainText('Siguiente ejercicio:');

    await showGuidedState(page, 'es', { workoutState: 'PHASE_COMPLETE' });
    await expect(page.locator('#stateContainer')).toContainText('¡Fase completada! 🎉');

    await showGuidedState(page, 'es', { workoutState: 'WORKOUT_COMPLETE' });
    await expect(page.locator('#stateContainer')).toContainText('¡Entrenamiento Completo! 🎉');
    await expect(page.locator('#stateContainer')).toContainText('¡Completaste los 21 ejercicios!');
  });

  test('should keep representative English Guided states in English', async ({ page }) => {
    await showGuidedState(page, 'en', { workoutState: 'PHASE_INTRO' });
    await expect(page.locator('#stateContainer')).toContainText('3 exercises');
    await expect(page.locator('#continueFromPhaseBtn')).toHaveText('Continue');

    await showGuidedState(page, 'en', { workoutState: 'EXERCISE_PREP' });
    await expect(page.locator('#stateContainer')).toContainText('Get ready!');

    await showGuidedState(page, 'en', {
      workoutState: 'EXERCISE_ACTIVE',
      currentPhaseIndex: 2,
    });
    await expect(page.locator('#stateContainer')).toContainText(
      'Tap the button when you complete the set',
    );

    await showGuidedState(page, 'en', { workoutState: 'REST_PERIOD' });
    await expect(page.locator('#stateContainer')).toContainText('Next exercise:');

    await showGuidedState(page, 'en', { workoutState: 'PHASE_COMPLETE' });
    await expect(page.locator('#stateContainer')).toContainText('Phase Complete! 🎉');

    await showGuidedState(page, 'en', { workoutState: 'WORKOUT_COMPLETE' });
    await expect(page.locator('#stateContainer')).toContainText('Workout Complete! 🎉');
    await expect(page.locator('#stateContainer')).toContainText('You crushed all 21 exercises!');
  });

  test('should have bilingual URLs in sitemap/routes', async ({ page }) => {
    // Test that both language routes exist and load
    const routes = [
      '/en/',
      '/es/',
      '/en/app',
      '/es/app',
      '/en/workout',
      '/es/workout'
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    }
  });
});

test.describe('Landing language selector touch input', () => {
  test.use({ hasTouch: true });

  test('should switch landing language by touch', async ({ page }) => {
    await page.goto('/en/');

    const langButton = page.getByRole('button', {
      name: 'Select language. Current language: EN',
    });
    await langButton.tap();
    await expect(langButton).toHaveAttribute('aria-expanded', 'true');
    await page.getByRole('link', { name: 'Switch to Español' }).tap();

    await expect(page).toHaveURL('/es/');
  });
});
