# Lighthouse PWA Audit - Verification Guide

**Subtask:** 4.1 - Run Lighthouse PWA audit
**Date:** 2026-01-06
**Status:** Ready for manual verification

---

## Pre-Verification Checklist

All configuration is complete and correct:

- ✅ **Icons Present:**
  - `icon-192.png` (192x192, 5.7K, RGBA)
  - `icon-512.png` (512x512, 18K, RGBA)
  - `maskable-192.png` (192x192, 5.0K, RGBA)
  - `maskable-512.png` (512x512, 16K, RGBA)
  - `apple-touch-icon.png` (180x180, 5.3K, RGBA)
  - `og-image.png` (1200x630, 38K, RGBA)

- ✅ **Manifest Configuration:**
  ```json
  {
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
      { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
      { "src": "/maskable-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
      { "src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```

- ✅ **Service Worker Updated:**
  - Version: `desatrofiate-v42` (incremented from v41)
  - Maskable icons added to cache: `/maskable-192.png`, `/maskable-512.png`

---

## How to Run Lighthouse PWA Audit

### Step 1: Build the Project

```bash
# Install dependencies (if not already done)
pnpm install

# Build for production
pnpm run build
```

Expected output: Build completes successfully without errors.

### Step 2: Preview the Production Build Locally

```bash
# Start preview server
pnpm run preview
```

The app should be running at `http://localhost:4321` (or similar).

### Step 3: Run Lighthouse Audit

**Option A: Chrome DevTools (Recommended)**

1. Open the preview URL in **Google Chrome** (not in dev mode)
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Lighthouse** tab
4. Configure audit:
   - **Mode:** Navigation (Default)
   - **Categories:** Check ✅ **Progressive Web App**
   - **Device:** Desktop or Mobile (test both)
5. Click **Analyze page load**
6. Wait for audit to complete (~30-60 seconds)

**Option B: Lighthouse CLI**

```bash
# Install Lighthouse globally (if not already done)
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4321/en/ --view --preset=desktop --only-categories=pwa

# Or for mobile
lighthouse http://localhost:4321/en/ --view --preset=mobile --only-categories=pwa
```

The `--view` flag automatically opens the HTML report in your browser.

### Step 4: Deploy to Vercel and Test Production

```bash
# Deploy to production
git push origin main
```

Then run Lighthouse on the production URL:
```bash
lighthouse https://unslump.vercel.app/en/ --view --preset=desktop --only-categories=pwa
```

---

## Expected Lighthouse PWA Audit Results

### ✅ Passing Criteria

The following checks should **PASS** (green checkmarks):

1. **Installable**
   - ✅ Web app manifest meets the installability requirements
   - ✅ Registers a service worker that controls page and `start_url`
   - ✅ Configured for a custom splash screen
   - ✅ Sets a theme color for the address bar

2. **PWA Optimized**
   - ✅ Manifest includes `name`
   - ✅ Manifest includes `short_name`
   - ✅ Manifest has a maskable icon
   - ✅ Current page responds with a 200 when offline

3. **Icon Requirements**
   - ✅ Manifest contains at least one icon sized 192x192 or larger
   - ✅ Manifest contains at least one icon sized 512x512 or larger
   - ✅ Manifest includes a maskable icon with safe zone padding

### ⚠️ Common Warnings (Acceptable)

These warnings are acceptable and do not affect PWA functionality:

- **Apple touch icon:** Already provided (`apple-touch-icon.png`)
- **Service worker:** May show as not registered in local preview (expected - works in production)
- **HTTPS:** Local preview uses HTTP (expected - production uses HTTPS)

### ❌ Should NOT Appear

If you see these errors, the audit has failed:

- ❌ "Manifest does not have a maskable icon"
- ❌ "Manifest does not contain a suitable icon"
- ❌ "Icons are not sized correctly"
- ❌ "Web app manifest validation errors"

---

## Verification Checklist

Before marking subtask 4.1 as complete, verify:

- [ ] Project builds successfully (`pnpm run build`)
- [ ] Preview server runs without errors (`pnpm run preview`)
- [ ] Lighthouse PWA audit score is 100% (or near-perfect with acceptable warnings)
- [ ] All icon-related checks pass:
  - [ ] Icons are the correct sizes (192x192, 512x512)
  - [ ] Maskable icon is present and detected
  - [ ] No icon configuration warnings
- [ ] App is installable:
  - [ ] Chrome shows "Install" button in address bar
  - [ ] Service worker registers successfully
  - [ ] Manifest validates without errors
- [ ] Visual verification (optional but recommended):
  - [ ] Icons display correctly in browser tab (favicon)
  - [ ] Install prompt shows correct app icon
  - [ ] App icon looks professional after installation

---

## Troubleshooting

### Issue: "Manifest does not have a maskable icon"

**Solution:** This should not occur. If it does, verify:
1. Maskable icons exist: `ls -lh public/maskable-*.png`
2. Manifest includes maskable entries: `cat public/manifest.json | grep maskable`
3. Service worker caches maskable icons: `cat public/sw.js | grep maskable`

### Issue: Service worker not detected in local preview

**Expected:** Service workers are disabled in dev mode (`astro dev`). Run audit on production build via `pnpm run preview` or deployed URL.

### Issue: Low PWA score

**Check:**
1. Are you testing the production build (`pnpm run preview`) or production URL?
2. Is the service worker registering? Check DevTools → Application → Service Workers
3. Are all icon files accessible? Check Network tab for 404 errors

---

## Manual Verification Steps

Since automated build/audit cannot be run in this environment, perform these steps manually:

1. ✅ **Icon files verified:** All icons present with correct dimensions
2. ✅ **Manifest verified:** Proper icon configuration with separate purposes
3. ✅ **Service worker verified:** Updated to v42 with maskable icons cached
4. ⏳ **Build project:** Run `pnpm run build` in terminal
5. ⏳ **Preview build:** Run `pnpm run preview` in terminal
6. ⏳ **Run Lighthouse:** Use Chrome DevTools or CLI to audit PWA
7. ⏳ **Verify score:** Ensure 100% PWA score with all icon checks passing
8. ⏳ **Test installation:** Verify app can be installed and icons display correctly

---

## Next Steps

After completing the Lighthouse audit:

1. **Document results:** Note the PWA score and any warnings
2. **Update subtask status:** Mark subtask 4.1 as "completed" in `implementation_plan.json`
3. **Update build progress:** Add results to `build-progress.txt`
4. **Proceed to subtask 4.2:** Visual verification across platforms
5. **Commit changes:** Git commit with verification results

---

## Reference Links

- [Lighthouse PWA Audits](https://developer.chrome.com/docs/lighthouse/pwa/)
- [Maskable Icon Spec](https://web.dev/maskable-icon/)
- [PWA Manifest Documentation](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
