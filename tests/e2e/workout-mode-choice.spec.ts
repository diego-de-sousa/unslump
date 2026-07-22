import { test, expect } from '@playwright/test';

const MODE_CHOICES = {
  en: {
    explore: 'Explore exercises',
    guided: 'Guided workout',
  },
  es: {
    explore: 'Explorar ejercicios',
    guided: 'Entrenamiento guiado',
  },
} as const;

for (const [lang, labels] of Object.entries(MODE_CHOICES)) {
  test(`requires an explicit ${lang.toUpperCase()} workout mode choice`, async ({ page }) => {
    await page.goto(`/${lang}/`);

    const exploreChoice = page.getByRole('link', { name: labels.explore });
    const guidedChoice = page.getByRole('link', { name: labels.guided });

    await expect(exploreChoice).toBeVisible();
    await expect(guidedChoice).toBeVisible();
    await expect(exploreChoice).not.toHaveAttribute('aria-current');
    await expect(guidedChoice).not.toHaveAttribute('aria-current');

    await exploreChoice.click();
    await expect(page).toHaveURL(`/${lang}/app`);
    await expect(page.getByRole('link', { name: labels.guided })).toBeVisible();

    await page.goto(`/${lang}/`);
    await page.getByRole('link', { name: labels.guided }).click();
    await expect(page).toHaveURL(`/${lang}/workout`);
    await expect(page.getByRole('link', { name: labels.explore })).toBeVisible();
  });
}
