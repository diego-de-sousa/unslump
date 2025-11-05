import { test, expect } from '@playwright/test';

test.describe('Exercise Browser (/app) Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/en/');
    await page.evaluate(() => {
      localStorage.clear();
      // Mark onboarding as seen to avoid modal blocking tests
      localStorage.setItem('unslump-onboarding-seen', 'true');
    });
  });

  test('should display exercise browser page', async ({ page }) => {
    await page.goto('/en/app');

    // Logo should be visible
    await expect(page.locator('#progress-logo')).toBeVisible();

    // Should have phases (phase toggle buttons)
    await expect(page.locator('.phase-toggle').first()).toBeVisible();
  });

  test('should display all 4 workout phases', async ({ page }) => {
    await page.goto('/en/app');

    // Should have 4 phase toggle buttons
    const phaseToggles = page.locator('.phase-toggle');
    await expect(phaseToggles).toHaveCount(4);
  });

  test('should mark exercise as completed when button clicked', async ({ page }) => {
    await page.goto('/en/app');

    // Expand first phase
    const firstPhaseToggle = page.locator('.phase-toggle').first();
    await firstPhaseToggle.click();
    await page.waitForTimeout(500); // Wait for expansion animation

    // Find first exercise completion button
    const firstCompleteBtn = page.locator('.complete-btn').first();

    // Wait for it to be visible and clickable
    await firstCompleteBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Click to complete
    await firstCompleteBtn.click();

    // Button should have completed styling (check for background color change or completed class)
    await page.waitForTimeout(300); // Wait for state update

    // Progress should be saved in localStorage
    const progress = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });

    expect(progress).toBeTruthy();
    expect(progress.completed).toBeInstanceOf(Array);
    expect(progress.completed.length).toBeGreaterThan(0);
  });

  test('should persist progress across page reloads', async ({ page }) => {
    await page.goto('/en/app');

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete first exercise
    const completeBtn = page.locator('.complete-btn').first();
    await completeBtn.waitFor({ state: 'visible' });
    await completeBtn.click();

    // Get the exercise ID
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

  test('should show progress logo', async ({ page }) => {
    await page.goto('/en/app');

    // Look for progress logo
    const progressLogo = page.locator('#progress-logo');
    await expect(progressLogo).toBeVisible();
  });

  test('should track multiple completed exercises', async ({ page }) => {
    await page.goto('/en/app');

    // Expand first phase
    await page.locator('.phase-toggle').first().click();
    await page.waitForTimeout(500);

    // Complete first 3 exercises
    const completeButtons = page.locator('.complete-btn');
    const countToComplete = Math.min(3, await completeButtons.count());

    for (let i = 0; i < countToComplete; i++) {
      await completeButtons.nth(i).click();
      await page.waitForTimeout(100);
    }

    // Check localStorage
    const progress = await page.evaluate(() => {
      const data = localStorage.getItem('unslump-progress');
      return data ? JSON.parse(data) : null;
    });

    expect(progress.completed.length).toBe(countToComplete);
  });

  test('should expand/collapse phases', async ({ page }) => {
    await page.goto('/en/app');

    // Click phase toggle to expand
    const firstPhaseToggle = page.locator('.phase-toggle').first();
    await firstPhaseToggle.click();
    await page.waitForTimeout(500);

    // Phase content should be visible
    const phaseContent = page.locator('.phase-content').first();
    await expect(phaseContent).toBeVisible();

    // Click again to collapse
    await firstPhaseToggle.click();
    await page.waitForTimeout(500);

    // Phase content should be hidden
    await expect(phaseContent).toBeHidden();
  });

  test('should have link to guided workout', async ({ page }) => {
    await page.goto('/en/app');

    // Should have link to guided workout (based on app.astro structure)
    const guidedLink = page.locator('a[href*="workout"]').first();
    await expect(guidedLink).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en/app');

    // Check that page loads correctly
    await expect(page.locator('#progress-logo')).toBeVisible();

    // Check that phase toggles are visible
    const phaseToggles = page.locator('.phase-toggle');
    const count = await phaseToggles.count();
    expect(count).toBe(4);
  });

  test('should display Spanish content on /es/app', async ({ page }) => {
    await page.goto('/es/app');

    // Check for Spanish text
    const bodyText = await page.locator('body').textContent();

    // Should contain Spanish phase names or words
    expect(bodyText).toMatch(/fase|inhibir|alargar|activar|integrar/i);

    // Logo should still be visible
    await expect(page.locator('#progress-logo')).toBeVisible();
  });

  test('should preserve progress when switching languages', async ({ page }) => {
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

  test('should have correct lang attribute on html element', async ({ page }) => {
    await page.goto('/en/app');
    const langEN = await page.getAttribute('html', 'lang');
    expect(langEN).toBe('en');

    await page.goto('/es/app');
    const langES = await page.getAttribute('html', 'lang');
    expect(langES).toBe('es');
  });
});
