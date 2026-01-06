# Visual Verification Checklist - Quick Reference

**Subtask:** 4.2 - Visual verification across platforms
**Purpose:** Quick checklist for icon display verification
**See Full Guide:** `visual-verification-guide.md`

---

## Quick Checklist

### Pre-Verification Setup
- [ ] Project built: `pnpm run build`
- [ ] Preview server running: `pnpm run preview`
- [ ] All 7 icon files present in `/public/`
- [ ] Deployment URL ready for mobile testing

---

### 1️⃣ Browser Tab (Favicon) - 5 minutes

**Desktop:**
- [ ] Chrome: `http://localhost:4321/en/` - favicon visible
- [ ] Firefox: Favicon visible (force refresh if needed)
- [ ] Safari: Favicon visible

**Mobile:**
- [ ] iOS Safari: Tab icon visible
- [ ] Android Chrome: Tab icon visible

**Pass Criteria:** 4-color "u!" logo visible, crisp, centered

---

### 2️⃣ iOS Home Screen (Apple Touch Icon) - 10 minutes

**Setup:**
- [ ] Open Safari on iPhone/iPad
- [ ] Navigate to deployment URL
- [ ] Tap Share → "Add to Home Screen"

**Verify:**
- [ ] Icon preview looks good in dialog
- [ ] Icon displays correctly on home screen
- [ ] Logo not cropped or clipped
- [ ] Colors accurate (indigo, teal, orange, pink)

**Pass Criteria:** Professional appearance, logo fully visible, no clipping

---

### 3️⃣ Android Home Screen (Maskable) - 10 minutes

**Online Test (Quick):**
- [ ] Go to https://maskable.app/editor
- [ ] Upload `maskable-192.png` or `maskable-512.png`
- [ ] Test all mask shapes: Circle, Squircle, Teardrop, Square
- [ ] Verify logo fully visible in all shapes

**Device Test (Comprehensive):**
- [ ] Open Chrome on Android
- [ ] Navigate to deployment URL
- [ ] Menu → "Add to Home Screen"
- [ ] Check icon on home screen
- [ ] Verify logo not cropped

**Pass Criteria:** Logo fully visible in all mask shapes, safe zone respected

---

### 4️⃣ Social Sharing (OG Image) - 10 minutes

**Online Validators:**
- [ ] Facebook Debugger: https://developers.facebook.com/tools/debug/
  - Enter deployment URL
  - Click "Debug"
  - Verify image shows in preview

- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
  - Enter deployment URL
  - Verify `summary_large_image` card shows

- [ ] OpenGraph.xyz: https://www.opengraph.xyz/
  - Enter deployment URL
  - Check multi-platform preview

**Manual Test (Optional):**
- [ ] Share on Facebook - preview shows og-image.png
- [ ] Tweet URL - card shows og-image.png
- [ ] Paste in Slack - unfurl shows og-image.png

**Pass Criteria:** Image displays correctly, 1200x630 dimensions, professional appearance

---

## Icon File Reference

All files in `/public/`:

```
favicon.svg              (7.7K)  - Browser tab favicon
apple-touch-icon.png     (5.3K)  - iOS home screen (180x180)
icon-192.png             (5.7K)  - PWA icon any (192x192)
icon-512.png             (18K)   - PWA icon any (512x512)
maskable-192.png         (5.0K)  - Maskable icon (192x192)
maskable-512.png         (16K)   - Maskable icon (512x512)
og-image.png             (38K)   - Social sharing (1200x630)
```

---

## Common Issues

### Favicon not updating
- Hard refresh: Ctrl+Shift+R / Cmd+Shift+R
- Clear browser cache
- Try incognito window

### iOS icon cached
- Delete app from home screen
- Clear Safari cache in Settings
- Restart device, re-add

### Android icon not updating
- Uninstall PWA
- Clear Chrome cache for site
- Restart, re-install

### OG image not showing
- Use Facebook Debugger "Fetch new information"
- Verify og:image meta tag in page source
- Check image is publicly accessible

---

## Verification Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Maskable.app | https://maskable.app/editor | Test maskable icons with different masks |
| Facebook Debugger | https://developers.facebook.com/tools/debug/ | Verify OG image on Facebook |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Verify Twitter card preview |
| LinkedIn Inspector | https://www.linkedin.com/post-inspector/ | Verify LinkedIn preview |
| OpenGraph.xyz | https://www.opengraph.xyz/ | Multi-platform OG preview |

---

## Sign-Off

After completing all checks:

1. ✅ All 4 verification sections passed
2. 📝 Document results in `build-progress.txt`
3. ✏️ Update `implementation_plan.json` - mark subtask 4.2 as "completed"
4. 💾 Commit:
   ```bash
   git add .
   git commit -m "auto-claude: 4.2 - Verify icons display correctly in different contexts"
   ```

---

**Total Time:** ~30-45 minutes
**Status:** Ready for manual verification
**Last Updated:** 2026-01-06
