# Visual Verification Guide - Icon Display Across Platforms

**Subtask:** 4.2 - Visual verification across platforms
**Status:** Ready for manual verification
**Created:** 2026-01-06

---

## Overview

This guide provides step-by-step instructions to verify that all icons display correctly in different contexts:

1. **Browser tab** (favicon.svg)
2. **iOS home screen** (apple-touch-icon.png)
3. **Android home screen** (maskable icons)
4. **Social sharing previews** (og-image.png)

All icon files are already in place and properly configured. This verification ensures they render correctly across platforms.

---

## Icon Inventory

All icons are located in `/public/` directory:

| Icon File | Dimensions | Size | Purpose | Context |
|-----------|-----------|------|---------|---------|
| `favicon.svg` | Vector | 7.7K | Browser tab favicon | Desktop/mobile browsers |
| `apple-touch-icon.png` | 180x180 | 5.3K | iOS home screen | iPhone, iPad |
| `icon-192.png` | 192x192 | 5.7K | PWA icon (any) | PWA installation |
| `icon-512.png` | 512x512 | 18K | PWA icon (any) | PWA installation, splash |
| `maskable-192.png` | 192x192 | 5.0K | Adaptive icon (maskable) | Android adaptive icons |
| `maskable-512.png` | 512x512 | 16K | Adaptive icon (maskable) | Android adaptive icons |
| `og-image.png` | 1200x630 | 38K | Social sharing | Facebook, Twitter, Slack |

---

## Verification Checklist

### ✅ Pre-Flight Checks

Before starting visual verification:

- [ ] All 7 icon files exist in `/public/` directory
- [ ] `manifest.json` has 4 icon entries (2 any + 2 maskable)
- [ ] `BaseLayout.astro` references favicon, apple-touch-icon, and og-image
- [ ] Project builds successfully: `pnpm run build`
- [ ] Preview server running: `pnpm run preview`

### 🖥️ 1. Browser Tab (Favicon)

**Icon:** `favicon.svg`
**Size:** Vector (scalable)
**Format:** SVG
**Config:** `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`

#### Desktop Verification

1. **Chrome/Edge:**
   - Visit `http://localhost:4321/en/`
   - Check browser tab - should show 4-color "u!" logo
   - Look for clean edges and proper colors (indigo, teal, orange, pink)
   - Icon should be crisp at all zoom levels (SVG benefit)

2. **Firefox:**
   - Same steps as Chrome
   - Firefox may cache favicons aggressively - use Ctrl+Shift+R to force refresh

3. **Safari:**
   - Same steps as Chrome
   - Safari has excellent SVG favicon support

#### Mobile Browser Verification

1. **iOS Safari:**
   - Open on iPhone/iPad: Your Vercel deployment URL
   - Check tab bar icon (appears when multiple tabs open)
   - Should show clean "u!" logo

2. **Android Chrome:**
   - Open on Android device
   - Check tab icon in Chrome
   - Should display clearly at small sizes

#### Pass Criteria

- ✅ Icon visible in browser tab
- ✅ Colors match brand (indigo, teal, orange, pink)
- ✅ Logo is crisp and centered
- ✅ No pixelation or blurriness
- ✅ Works across all major browsers

---

### 📱 2. iOS Home Screen (Apple Touch Icon)

**Icon:** `apple-touch-icon.png`
**Size:** 180x180 pixels
**Format:** PNG (RGBA)
**Config:** `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`

#### iOS Add to Home Screen

1. **iPhone/iPad Setup:**
   - Open Safari on iOS device
   - Navigate to your Vercel deployment URL (e.g., `https://unslump.vercel.app/en/`)
   - Tap Share button (square with arrow)
   - Select "Add to Home Screen"

2. **Visual Inspection:**
   - **Icon preview:** Check icon in "Add to Home Screen" dialog
   - **Home screen:** After adding, check icon on home screen
   - **Icon grid:** Icon should match iOS design language (rounded square with shadow)

3. **What to Look For:**
   - ✅ 4-color "u!" logo clearly visible
   - ✅ Logo centered with appropriate padding
   - ✅ White background (iOS adds rounded corners automatically)
   - ✅ No clipping or cropping of logo elements
   - ✅ High-quality rendering (no compression artifacts)

#### Pass Criteria

- ✅ Icon displays in "Add to Home Screen" dialog
- ✅ Icon renders correctly on iOS home screen
- ✅ Logo is not cropped or cut off
- ✅ Colors are vibrant and accurate
- ✅ Icon looks professional among other apps

#### Testing on Multiple iOS Versions

- **iOS 15+:** Best support for 180x180 icons
- **iOS 14:** May downscale slightly but should work
- **iPad:** Same icon used, verify it scales well

---

### 🤖 3. Android Home Screen (Maskable Icons)

**Icons:** `maskable-192.png`, `maskable-512.png`
**Size:** 192x192 and 512x512 pixels
**Format:** PNG (RGBA)
**Config:** `manifest.json` with `"purpose": "maskable"`

#### Understanding Maskable Icons

Maskable icons are designed for Android's adaptive icon system. The OS applies different masks:
- **Circle:** Round icon (most common)
- **Squircle:** Rounded square
- **Teardrop:** Water drop shape
- **Full square:** Square with minimal rounding

Our maskable icons have the logo scaled to 70% and centered to fit within the **80% safe zone circle**. This ensures the logo is never cropped regardless of mask shape.

#### Android Add to Home Screen

1. **Android Chrome Setup:**
   - Open Chrome on Android device
   - Navigate to your Vercel deployment URL
   - Chrome should show "Add to Home Screen" banner automatically
   - Or: Tap menu (⋮) → "Add to Home Screen"

2. **Visual Inspection:**
   - **Icon preview:** Check icon in installation dialog
   - **Home screen:** After installing, check icon on home screen
   - **Launcher:** Verify icon in app drawer/launcher

3. **What to Look For:**
   - ✅ Logo fully visible within circular mask
   - ✅ No clipping at edges when circle mask applied
   - ✅ Logo has adequate padding (safe zone respected)
   - ✅ 4-color design clearly visible
   - ✅ White background visible around logo

#### Testing Maskable Icon Shapes

Use **Maskable.app** online tool for quick verification:

1. Visit: https://maskable.app/editor
2. Upload `maskable-192.png` or `maskable-512.png`
3. Toggle through different mask shapes:
   - Circle
   - Squircle
   - Teardrop
   - Square
4. Verify logo is fully visible in all shapes

#### Pass Criteria

- ✅ Icon displays correctly with circular mask
- ✅ Logo not cropped in any mask shape
- ✅ Safe zone padding adequate (logo within 80% circle)
- ✅ Icon looks professional on Android home screen
- ✅ Colors match brand identity

#### Android Version Testing

- **Android 12+:** Best adaptive icon support
- **Android 8-11:** Adaptive icons supported
- **Android 7 and below:** Falls back to regular icons (icon-192.png, icon-512.png)

---

### 🔗 4. Social Sharing Previews (Open Graph Image)

**Icon:** `og-image.png`
**Size:** 1200x630 pixels
**Format:** PNG (RGBA)
**Config:** `<meta property="og:image" content="/og-image.png" />`

#### Understanding OG Images

Open Graph (OG) images appear when sharing links on:
- **Facebook** - Link posts and shares
- **Twitter** - Cards with `summary_large_image`
- **LinkedIn** - Link previews
- **Slack** - Unfurl previews
- **Discord** - Embed previews
- **WhatsApp** - Link previews (on some platforms)

#### Testing with Preview Tools

1. **Facebook Sharing Debugger:**
   - URL: https://developers.facebook.com/tools/debug/
   - Enter your deployment URL: `https://unslump.vercel.app/en/`
   - Click "Debug"
   - Check "Image Preview" section
   - Should show og-image.png with full branding

2. **Twitter Card Validator:**
   - URL: https://cards-dev.twitter.com/validator
   - Enter your deployment URL
   - Click "Preview card"
   - Should show `summary_large_image` card with og-image.png

3. **LinkedIn Post Inspector:**
   - URL: https://www.linkedin.com/post-inspector/
   - Enter your deployment URL
   - Check preview - should show og-image.png

4. **OpenGraph.xyz:**
   - URL: https://www.opengraph.xyz/
   - Enter your deployment URL
   - Simulates how link appears across multiple platforms
   - Verify all platforms show og-image.png correctly

#### Visual Inspection

1. **What to Look For:**
   - ✅ 4-color "u!" logo prominently displayed
   - ✅ App name "unslump!" visible
   - ✅ Tagline or description visible
   - ✅ Professional, polished appearance
   - ✅ Image not cropped or distorted

2. **Dimensions:**
   - ✅ 1200x630 pixels (optimal for all platforms)
   - ✅ Aspect ratio 1.91:1 (Facebook recommended)

3. **Text Readability:**
   - ✅ All text legible at preview size
   - ✅ High contrast between text and background
   - ✅ No text cut off at edges

#### Manual Sharing Tests

1. **Facebook:**
   - Create a post with your deployment URL
   - Check link preview before posting
   - Post should show og-image.png with title and description

2. **Twitter:**
   - Tweet your deployment URL
   - Check card preview (may take a few seconds to load)
   - Should show large image card with og-image.png

3. **Slack:**
   - Paste URL into any Slack channel
   - Check unfurl preview
   - Should show og-image.png with app details

#### Pass Criteria

- ✅ OG image displays in Facebook sharing debugger
- ✅ OG image displays in Twitter card validator
- ✅ Image not cropped or distorted on any platform
- ✅ Logo, app name, and tagline clearly visible
- ✅ Professional appearance suitable for sharing

---

## Common Issues and Troubleshooting

### Favicon Not Updating

**Problem:** Old favicon still showing after deployment

**Solutions:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache: Settings → Privacy → Clear browsing data
3. Try incognito/private window
4. Check browser dev tools → Network tab → verify favicon.svg loads

### iOS Icon Caching

**Problem:** Old icon still showing on iOS home screen

**Solutions:**
1. Delete the app from home screen
2. Clear Safari cache: Settings → Safari → Clear History and Website Data
3. Restart device
4. Re-add to home screen

### Android Icon Not Updating

**Problem:** Old icon cached on Android

**Solutions:**
1. Uninstall PWA from home screen
2. Clear Chrome cache: Settings → Site settings → Your site → Clear & reset
3. Restart device
4. Re-install PWA

### OG Image Not Showing

**Problem:** Social platforms showing wrong or no image

**Solutions:**
1. Use Facebook Debugger to clear cache: "Fetch new information"
2. Verify og:image meta tag in page source (View Source)
3. Check image URL is absolute, not relative
4. Ensure image is publicly accessible (not behind auth)
5. Verify image meets size requirements (1200x630)

---

## Verification Results Template

Copy this template to `build-progress.txt` after completing verification:

```markdown
## Subtask 4.2 - Visual Verification Results

**Date:** [YYYY-MM-DD]
**Tester:** [Your name]

### 1. Browser Tab (Favicon) ✅/❌
- [ ] Chrome/Edge: Icon displays correctly
- [ ] Firefox: Icon displays correctly
- [ ] Safari: Icon displays correctly
- [ ] Mobile Safari: Icon displays correctly
- [ ] Android Chrome: Icon displays correctly
- **Notes:** [Any issues or observations]

### 2. iOS Home Screen (Apple Touch Icon) ✅/❌
- [ ] Icon preview in "Add to Home Screen" dialog
- [ ] Icon renders on iOS home screen
- [ ] Logo not cropped or clipped
- [ ] Colors accurate and vibrant
- **Devices Tested:** [iPhone model, iOS version]
- **Notes:** [Any issues or observations]

### 3. Android Home Screen (Maskable Icons) ✅/❌
- [ ] Icon displays with circular mask
- [ ] Logo visible in all mask shapes (tested on Maskable.app)
- [ ] Safe zone padding adequate
- [ ] Icon looks professional on home screen
- **Devices Tested:** [Android model, version]
- **Notes:** [Any issues or observations]

### 4. Social Sharing Previews (OG Image) ✅/❌
- [ ] Facebook Sharing Debugger: Image displays
- [ ] Twitter Card Validator: Image displays
- [ ] LinkedIn Post Inspector: Image displays
- [ ] Manual test - Facebook post: Image shows
- [ ] Manual test - Twitter tweet: Image shows
- [ ] Manual test - Slack unfurl: Image shows
- **Notes:** [Any issues or observations]

### Overall Result: ✅ PASS / ❌ FAIL

**Summary:** [Brief summary of verification results]

**Issues Found:** [List any issues or none]

**Next Steps:** [Any follow-up actions needed or mark complete]
```

---

## Sign-Off

Once all verifications pass:

1. Update `build-progress.txt` with verification results
2. Mark subtask 4.2 as complete in `implementation_plan.json`
3. Commit changes with message:
   ```bash
   git add .
   git commit -m "auto-claude: 4.2 - Verify icons display correctly in different contexts"
   ```

---

## Reference Links

- **Maskable.app Editor:** https://maskable.app/editor
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- **OpenGraph.xyz Preview:** https://www.opengraph.xyz/
- **PWA Manifest Spec:** https://www.w3.org/TR/appmanifest/
- **Apple Touch Icon Spec:** https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html

---

**Status:** Ready for manual verification
**Expected Duration:** 30-45 minutes
**Last Updated:** 2026-01-06
