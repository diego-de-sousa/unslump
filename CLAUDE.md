# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**unslump!** (formerly Desatrófiate) is a bilingual Progressive Web App (PWA) for office workers that provides a scientifically-backed 25-minute exercise routine designed to counteract hours of computer work and improve posture. The app is based on 30+ peer-reviewed scientific studies and is available in English and Spanish.

## Tech Stack

- **Framework**: Astro v5 with server-side rendering and built-in i18n routing
- **Styling**: Tailwind CSS v3
- **Animations**: Motion One for smooth UI interactions
- **Fonts**: Barriecito (Google Fonts via @fontsource)
- **Deployment**: Vercel with adapter
- **Language**: TypeScript
- **Package Manager**: pnpm
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
```

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

The app uses vanilla JavaScript with localStorage for state persistence:
- Exercise completion status tracked per phase
- User's selected difficulty level (beginner/intermediate/advanced)
- Progress persists across sessions
- Language preference handled by URL routing (no storage needed)
- No external state management library needed

### Component Structure

- **`src/layouts/BaseLayout.astro`**: Main layout with multilingual SEO meta tags, PWA manifest links, and service worker registration
  - Accepts required props: `title`, `description`, `lang`
  - Generates hreflang links for alternate languages
  - Sets og:locale based on current language

- **`src/pages/index.astro`**: Root redirect to default locale (`/en/`)

- **`src/pages/[lang]/index.astro`**: Main application page with dynamic language routing
  - Uses `getStaticPaths()` to generate `/en/` and `/es/` routes
  - Loads localized data via helper functions
  - Contains all workout phases and interactive UI

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

The `[lang]/index.astro` page contains client-side JavaScript for:
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

- **`public/sw.js`**: Service worker for offline functionality (current version: v17)
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
