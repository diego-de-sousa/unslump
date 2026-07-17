# AGENTS.md

This file provides guidance to Pi agent and compatible coding agents when working with code in this repository.

## Project Overview

**unslump!** is a bilingual Progressive Web App (PWA) for office workers that provides a scientifically-backed 25-minute exercise routine designed to counteract hours of computer work and improve posture. The app is based on 30+ peer-reviewed scientific studies and is available in English and Spanish.

## Tech Stack

- **Framework**: Astro 7 with server-side rendering and built-in i18n routing
- **Styling**: Tailwind CSS 4
- **Animations**: Motion 12 for smooth UI interactions
- **Fonts**: Barriecito (Google Fonts via @fontsource)
- **Deployment**: Vercel with adapter
- **Language**: TypeScript
- **Runtime**: Node.js 24.x
- **Package Manager**: pnpm 11.13.1
- **Internationalization**: Astro i18n with English (default) and Spanish

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# or
pnpm start

# Type-check and build for production
pnpm run build

# Preview production build locally
pnpm run preview

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage
```

## Testing

The project uses **Vitest** for unit tests and **Playwright** for end-to-end tests, ensuring application flows work correctly and business logic is sound.

### Test Overview

- **Unit tests**: 264 passing tests covering stores and utilities
- **Chromium E2E tests**: 49 passing browser-flow tests plus 1 production offline PWA test; 0 skipped
- **Target coverage**: 80% for critical business logic

### Test Structure

```
src/
├── stores/__tests__/           # Store tests (Nanostores)
│   ├── progressStore.test.ts
│   ├── workoutController.test.ts
│   ├── userStore.test.ts
│   └── simpleStores.test.ts
├── utils/__tests__/            # Utility function tests
│   ├── progress.test.ts
│   ├── dateReset.test.ts
│   ├── storage.test.ts
│   ├── celebration.test.ts
│   └── toast.test.ts
└── components/islands/__tests__/ # Component tests (future)

tests/
└── e2e/                        # End-to-end tests (Playwright)
    ├── app-flow.spec.ts
    ├── workout-flow.spec.ts
    ├── language-switching.spec.ts
    └── progress-persistence.spec.ts
```

### Running Tests

**Unit Tests** (Vitest):
```bash
pnpm test              # Run all unit tests
pnpm test:watch        # Watch mode (auto-rerun on changes)
pnpm test:ui           # Visual test runner with UI
pnpm test:coverage     # Generate coverage report
```

**E2E Tests** (Playwright):
```bash
pnpm test:e2e          # Run all E2E tests (auto-starts dev server)
pnpm test:e2e:offline  # Run production-build offline PWA coverage
pnpm test:e2e:ui       # Interactive UI mode
pnpm test:e2e:headed   # Run with visible browser
```

**Note**: E2E tests automatically start the dev server. You can also run `pnpm dev` manually in a separate terminal.

### Unit Test Coverage

**Stores** (State Management with Nanostores):
- `progressStore.test.ts` - Exercise completion tracking, session locking, daily reset logic
- `workoutController.test.ts` - 8-state workout state machine (IDLE → WORKOUT_COMPLETE), timer logic, phase/exercise navigation
- `userStore.test.ts` - User profile, streak calculations, workout history, achievements
- `simpleStores.test.ts` - Level selection, modal visibility, navigation state

**Utilities** (Business Logic):
- `progress.test.ts` - Phase progress calculations, completion percentage stats
- `dateReset.test.ts` - Daily reset logic, midnight boundary handling, session locking
- `storage.test.ts` - localStorage wrapper, persistence, error handling, corrupted data recovery
- `celebration.test.ts` - Confetti animations and phase celebration triggers
- `toast.test.ts` - Toast notifications, auto-hide behavior, styling

### E2E Test Coverage

**App Flow** (`app-flow.spec.ts` - 12 tests):
- Exercise browser page rendering and navigation
- Phase expand/collapse functionality
- Exercise completion with button clicks
- Progress persistence across page reloads
- Mobile viewport compatibility
- Bilingual content (EN/ES)

**Workout Flow** (`workout-flow.spec.ts` - 13 tests):
- Guided workout page load and initial state
- Resume modal for saved sessions
- Settings modal (language, preferences)
- Pause/resume functionality
- Navigation buttons while paused
- FAB button behavior
- Exit confirmation dialog
- Mobile viewport support

**Language Switching** (`language-switching.spec.ts` - 15 tests):
- Root redirect to default locale (/en/)
- EN/ES content rendering
- Language selector functionality
- Correct lang attributes on HTML element
- Hreflang and og:locale meta tags
- Progress preservation across language switches
- Bilingual URL routes (/en/app, /es/app, etc.)

**Progress Persistence** (`progress-persistence.spec.ts` - 9 tests):
- App progress saved in localStorage
- Workout session state persistence
- Session restoration on page reload
- Browser navigation (back/forward)
- Corrupted localStorage handling
- Onboarding state persistence
- Multiple sessions on same day
- Storage quota exceeded handling

**Offline PWA** (`tests/offline/offline-pwa.spec.ts` - 1 test):
- Production-build service-worker activation
- Offline exercise-browser reload
- Progress persistence while offline

### Skipped Tests

The intended Chromium CI coverage has no skipped tests. Offline behavior runs separately with `pnpm run test:e2e:offline` because service-worker registration is production-only.

### Testing Patterns

**Mocking localStorage**:
Tests automatically mock localStorage via `vitest.setup.ts`. All stores are isolated between tests.

**Fake Timers**:
Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()` for testing timer-based logic:
```typescript
vi.useFakeTimers();
startTimer(30);
vi.advanceTimersByTime(5000); // Advance 5 seconds
expect(timeLeft.get()).toBe(25);
vi.useRealTimers();
```

**Date Mocking**:
Use `vi.setSystemTime()` to test date-dependent features (daily reset, streaks):
```typescript
vi.setSystemTime(new Date('2024-01-15T10:00:00'));
// Test streak calculation
vi.setSystemTime(new Date('2024-01-16T10:00:00'));
// Test daily reset
```

**Store Testing**:
Access Nanostores values with `.get()` method (not `get()` function):
```typescript
import { completedExercises } from '../progressStore';

expect(completedExercises.get().size).toBe(0); // ✅ Correct
// NOT: expect(get(completedExercises).size).toBe(0); // ❌ Wrong
```

**E2E Testing**:
Wait for elements and handle async operations properly:
```typescript
// Wait for phase to expand
await page.locator('.phase-toggle').first().click();
await page.waitForTimeout(500);

// Find completion button
const completeBtn = page.locator('.complete-btn').first();
await completeBtn.waitFor({ state: 'visible' });
await completeBtn.click();
```

### Writing New Tests

**Unit Tests**:
1. Create test file in `__tests__/` directory next to source file
2. Use `describe` blocks to organize tests by feature
3. Use `beforeEach` to reset state and clear mocks
4. Mock external dependencies (storage, date, timers)
5. Test both happy path and edge cases
6. Aim for 80%+ coverage on critical paths

Example:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myStore } from '../myStore';

describe('myStore', () => {
  beforeEach(() => {
    myStore.set(initialValue);
    vi.clearAllMocks();
  });

  it('should update state correctly', () => {
    myStore.set(newValue);
    expect(myStore.get()).toBe(newValue);
  });
});
```

**E2E Tests**:
1. Create test file in `tests/e2e/` directory
2. Clear localStorage in `beforeEach` to start fresh
3. Mark onboarding as seen to avoid modal blocking
4. Use actual element IDs and classes from components
5. Test user workflows end-to-end
6. Verify visual elements and localStorage state

Example:
```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('unslump-onboarding-seen', 'true');
    });
  });

  test('should complete workflow', async ({ page }) => {
    await page.goto('/en/app');
    await page.locator('#myButton').click();
    await expect(page.locator('#result')).toBeVisible();
  });
});
```

### CI/CD Integration

`.github/workflows/ci.yml` runs a frozen install, Astro check, unit tests, production build, Chromium Playwright E2E, and isolated production offline PWA coverage on pull requests and pushes to `main`.

## Architecture

### Data Structure

The app follows a 4-phase exercise protocol based on corrective exercise science:

1. **INHIBIR** (Inhibit) - Myofascial release to reduce neural overactivity in tight muscles
2. **ALARGAR** (Lengthen) - Stretching shortened muscles to restore normal range of motion
3. **ACTIVAR** (Activate) - Isolated strengthening of weak muscles to correct imbalances
4. **INTEGRAR** (Integrate) - Multi-joint functional movement patterns for daily application

### Key Data Files

**Localized Exercise Data** (separate files for English and Spanish):

- **`src/data/workout.en.ts`** / **`src/data/workout.es.ts`**: Complete workout structure with 4 phases and all exercises. Each exercise includes:
  - `id`, `name`, `duration`, `reps`, `instructions`
  - Optional `levels` (beginner/intermediate/advanced or principiante/intermedio/avanzado)
  - Optional `videoUrl` (YouTube tutorial links)
  - Optional `sets` (for exercises with multiple sets, used for set counter UI)
  - Optional `imageUrl` (static thumbnail image for quick visual reference)
  - Optional `gifUrl` (animated GIF shown on hover/click for movement demonstration)

- **`src/data/exerciseDetails.en.ts`** / **`src/data/exerciseDetails.es.ts`**: Comprehensive scientific information for each exercise:
  - `muscles`: Which muscles are targeted
  - `why`: Why this exercise matters for office workers
  - `evidence`: Scientific evidence and study citations
  - `tips`: Execution tips and safety notes

- **`src/data/references.en.ts`** / **`src/data/references.es.ts`**: Complete bibliography of 30+ scientific studies organized by category

- **`src/data/index.ts`**: Helper functions to get localized data:
  - `getWorkout(lang)`: Returns workout data for specified language
  - `getExerciseDetails(lang)`: Returns exercise details for specified language
  - `getReferences(lang)`: Returns references for specified language

### Internationalization (i18n)

The app supports English and Spanish with the following structure:

- **`src/i18n/utils.ts`**: Core i18n utilities
  - `getLangFromUrl(url)`: Extract language from URL path
  - `useTranslations(lang)`: Get translation function for specified language
  - `getLocalizedUrl(url, lang)`: Generate localized URLs
  - Type-safe Language type

- **`src/i18n/locales/en.json`** / **`src/i18n/locales/es.json`**: UI translations
  - Meta tags (title, description, keywords)
  - Interface text (buttons, labels, messages)
  - Onboarding and help content

- **Routing**: Dynamic `[lang]` route parameter generates `/en/` and `/es/` paths
- **Default locale**: English (`en`) with automatic redirect from `/`
- **SEO**: Proper hreflang tags, og:locale, and canonical URLs for both languages

### State Management

The app uses Nanostores for client-side state and localStorage for persistence:
- Store modules in `src/stores/` manage workout state, progress, user profile, navigation, level selection, and modals
- Exercise completion and user/workout preferences persist in localStorage
- Utility modules in `src/utils/` handle storage, date reset, progress calculations, toasts, and celebrations
- Language preference is handled by URL routing rather than a global store

### Component Structure

- **`src/layouts/BaseLayout.astro`**: Main layout with multilingual SEO meta tags, PWA manifest links, and service worker registration
  - Accepts required props: `title`, `description`, `lang`
  - Generates hreflang links for alternate languages
  - Sets og:locale based on current language

- **`src/pages/index.astro`**: Root redirect to default locale (`/en/`)

- **`src/pages/[lang]/index.astro`**: Landing page with dynamic language routing
  - Uses `getStaticPaths()` to generate `/en/` and `/es/` routes
- **`src/pages/[lang]/app.astro`**: Exercise browser at `/[lang]/app`
  - Loads localized data via helper functions
  - Contains all workout phases and interactive UI
- **`src/pages/[lang]/workout.astro`**: Guided workout at `/[lang]/workout`

- **`src/components/Logo.astro`**: Reusable "unslump!" logo component
  - Props: `size` (small/medium/large/xl), `showProgress` (boolean), `id`
  - Animated progress fill for each of the 4 phases
  - Uses Barriecito font

- **`src/components/LanguageSelector.astro`**: Language switcher component
  - EN/ES buttons with active state indication
  - Links to localized URLs

- **`src/components/ExerciseImage.astro`**: Exercise reference image component
  - Displays static thumbnail image with optional animated GIF on hover/click
  - Props: `imageUrl`, `gifUrl`, `alt`, `exerciseId`
  - Responsive design with lazy loading and smooth transitions
  - Mobile: tap to toggle between static and animated
  - Desktop: hover to show animated GIF
  - Returns null if no image is provided (graceful degradation)

- **`src/components/icons/`**: SVG icon components (Play, Pause, Check, etc.)

### Interactive Features

The `[lang]/app.astro` exercise browser contains client-side JavaScript for:
- Timer functionality for timed exercises
- Set counter for exercises with multiple sets
- Phase collapse/expand toggles with smooth animations (Motion One)
- Exercise completion tracking with confetti celebration
- Progress bar visualization across all 4 phases
- Animated logo progress fill that syncs with workout phases
- Level selector that shows/hides level-specific instructions
- Modal dialogs for exercise details and scientific references
- Onboarding modal with app instructions
- Language-aware localStorage keys for persistence

### PWA Configuration

- **`public/manifest.json`**: PWA manifest with app metadata, icons, and display settings
  - `start_url`: `/en/` (points to default locale)
  - `lang`: `en` (primary language)
  - `name`: "unslump! - Exercise Routine"

- **`public/sw.js`**: Service worker for offline functionality (current version: v45)
  - **Development**: Service worker is DISABLED in dev mode to avoid cache issues
  - **Production**: Cache-first strategy for offline support
  - **Cached URLs**: `/en/`, `/es/`, manifest, and icons
  - **Cache invalidation**: Increment `CACHE_NAME` version (v1 → v2 → v3) when deploying changes that need fresh content:
    - UI updates, bug fixes, exercise data changes, styling updates, i18n changes
    - Old caches are automatically deleted on activation
  - **Exercise images**: Images from `/exercise-images/` are cached automatically on-demand via fetch handler (no need to pre-cache)

- **`vercel.json`**: Custom headers for service worker, manifest, and security (CSP, X-Frame-Options, etc.)
- Icons required: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png`

### Exercise Images

The app supports optional reference images for exercises to help users quickly identify exercises:

- **Storage**: Images stored in `/public/exercise-images/` directory
- **Format**:
  - Static images: JPG/PNG thumbnails (recommended: 400x400px, optimized for web)
  - Animated images: GIF files showing exercise movement (recommended: 400x400px, optimized file size)
- **Integration**:
  - Images configured via `imageUrl` and `gifUrl` fields in `workout.en.ts` / `workout.es.ts`
  - Component: `ExerciseImage.astro` handles display logic
  - Behavior: Static thumbnail by default, animated GIF on hover (desktop) or tap (mobile)
- **Performance**:
  - Lazy loading enabled for all images
  - Service worker caches images on-demand for offline access
  - Images are optional - exercises without images display normally without placeholder
- **Adding images**:
  1. Add optimized image files to `/public/exercise-images/`
  2. Update exercise objects in `workout.en.ts` and `workout.es.ts` with image paths
  3. Example: `imageUrl: "/exercise-images/glute-bridge.jpg"`, `gifUrl: "/exercise-images/glute-bridge.gif"`
  4. Increment service worker version in `public/sw.js` when deploying new images

### Deployment

The app uses Astro's Vercel adapter with:
- Server-side rendering (`output: 'server'`)
- Built-in i18n routing with prefix for all locales
- Automatic redirect to default locale enabled
- Vercel Web Analytics enabled
- Site URL configured in `astro.config.mjs`

## Important Notes

- **Bilingual**: Full content available in English (default) and Spanish
  - English target: Global audience of office workers
  - Spanish target: Spanish-speaking office workers
  - All exercise data, UI text, and scientific references fully translated

- **Brand**: "unslump!" is the app name (displayed in Barriecito font)
  - Logo uses 4-color gradient representing the 4 exercise phases
  - Colors: Indigo (#4f46e5), Teal (#14b8a6), Orange (#f97316), Pink (#ec4899)

- **Mobile-first**: The UI is fully responsive with mobile considerations (sticky headers, compact layouts)

- **Accessibility**: Exercises include detailed instructions, video tutorials, and safety tips

- **Scientific rigor**: All exercises are backed by cited research; maintain scientific accuracy when modifying content in any language

- **Progressive difficulty**: The 3-level system (beginner/intermediate/advanced or principiante/intermedio/avanzado) allows users to scale exercises safely

- **i18n Development**: When adding new features:
  - Add UI strings to both `en.json` and `es.json`
  - Duplicate exercise/content data in both `.en.ts` and `.es.ts` files
  - Use `t()` translation function for all user-facing text
  - Test both `/en/` and `/es/` routes
  - Update service worker version and cache when deploying content changes
