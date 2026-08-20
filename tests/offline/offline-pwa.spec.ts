import { expect, test } from '@playwright/test';

test('keeps the exercise browser and progress available offline', async ({ page, context }) => {
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });

  await page.goto('/en/app');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('unslump-onboarding-seen', 'true');
  });
  await page.reload();

  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.active?.state
      ?? registration?.waiting?.state
      ?? registration?.installing?.state
      ?? 'missing';
  }), { timeout: 30_000 }).toBe('activated');
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  const requiredResourceUrls = await page.evaluate(() => {
    const urls = new Set([window.location.href]);
    document.querySelectorAll('link[rel="stylesheet"][href], script[src]').forEach((element) => {
      const resourceUrl = new URL(element.getAttribute('href') ?? element.getAttribute('src') ?? '', window.location.href);
      if (resourceUrl.origin === window.location.origin) {
        urls.add(resourceUrl.href);
      }
    });
    return [...urls];
  });

  expect(requiredResourceUrls.some((url) => new URL(url).pathname.startsWith('/_astro/'))).toBe(true);
  await expect.poll(() => page.evaluate(async (urls) => {
    const cache = await caches.open('unslump-v47');
    const matches = await Promise.all(urls.map((url) => cache.match(url)));
    return matches.every(Boolean);
  }, requiredResourceUrls)).toBe(true);

  const serviceWorker = context.serviceWorkers()[0];
  expect(serviceWorker).toBeDefined();
  await serviceWorker.evaluate(() => {
    const workerGlobal = globalThis as typeof globalThis & {
      originalCachePut?: Cache['put'];
      runtimeCachePutUnhandled?: boolean;
    };
    workerGlobal.originalCachePut = Cache.prototype.put;
    workerGlobal.runtimeCachePutUnhandled = false;
    globalThis.addEventListener('unhandledrejection', () => {
      workerGlobal.runtimeCachePutUnhandled = true;
    });
    Cache.prototype.put = () => Promise.reject(new DOMException('Test quota failure', 'QuotaExceededError'));
  });

  try {
    const generatedAssetUrl = requiredResourceUrls.find((url) => new URL(url).pathname.startsWith('/_astro/'));
    expect(generatedAssetUrl).toBeDefined();
    const runtimeUrl = `${generatedAssetUrl}?runtime-cache-put-failure=1`;
    const runtimeResponse = await page.evaluate(async (url) => {
      const response = await fetch(url);
      return { bodyLength: (await response.text()).length, status: response.status };
    }, runtimeUrl);

    expect(runtimeResponse.status).toBe(200);
    expect(runtimeResponse.bodyLength).toBeGreaterThan(0);
    await page.waitForTimeout(100);
    expect(await serviceWorker.evaluate(() => {
      const workerGlobal = globalThis as typeof globalThis & { runtimeCachePutUnhandled?: boolean };
      return workerGlobal.runtimeCachePutUnhandled;
    })).toBe(false);
  } finally {
    await serviceWorker.evaluate(() => {
      const workerGlobal = globalThis as typeof globalThis & { originalCachePut?: Cache['put'] };
      if (workerGlobal.originalCachePut) {
        Cache.prototype.put = workerGlobal.originalCachePut;
        delete workerGlobal.originalCachePut;
      }
    });
  }

  await context.setOffline(true);
  try {
    await page.reload();
    await expect(page.locator('#progress-logo')).toBeVisible();

    const completeButton = page.locator('.complete-btn').first();
    await page.locator('.phase-toggle').first().click();
    await expect(completeButton).toBeVisible();
    await completeButton.click();
    await expect(completeButton).not.toHaveClass(/bg-slate-200/);
    await expect.poll(() => page.evaluate(() => {
      const progress = localStorage.getItem('unslump-progress');
      return progress ? JSON.parse(progress).completed.length : 0;
    })).toBeGreaterThan(0);
  } finally {
    await context.setOffline(false);
  }
});
