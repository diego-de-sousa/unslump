# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Desatrófiate** is a Progressive Web App (PWA) for office workers that provides a scientifically-backed 25-minute exercise routine designed to counteract hours of computer work and improve posture. The app is based on 30+ peer-reviewed scientific studies.

## Tech Stack

- **Framework**: Astro v5 with server-side rendering
- **Styling**: Tailwind CSS v3
- **Deployment**: Vercel with adapter
- **Language**: TypeScript
- **Package Manager**: pnpm

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

- **`src/data/workout.ts`**: Defines the complete workout structure with 4 phases and all exercises. Each exercise includes:
  - `id`, `name`, `duration`, `reps`, `instructions`
  - Optional `levels` (principiante/intermedio/avanzado variations)
  - Optional `videoUrl` (YouTube tutorial links)
  - Optional `sets` (for exercises with multiple sets, used for set counter UI)

- **`src/data/exerciseDetails.ts`**: Comprehensive scientific information for each exercise:
  - `muscles`: Which muscles are targeted
  - `why`: Why this exercise matters for office workers
  - `evidence`: Scientific evidence and study citations
  - `tips`: Execution tips and safety notes

- **`src/data/references.ts`**: Complete bibliography of 30+ scientific studies organized by category

### State Management

The app uses vanilla JavaScript with localStorage for state persistence:
- Exercise completion status tracked per phase
- User's selected difficulty level (principiante/intermedio/avanzado)
- Progress persists across sessions
- No external state management library needed

### Component Structure

- **`src/layouts/BaseLayout.astro`**: Main layout with SEO meta tags, PWA manifest links, and service worker registration
- **`src/pages/index.astro`**: Single-page application containing all workout phases and interactive UI
- **`src/components/icons/`**: SVG icon components (Play, Pause, Check, etc.)

### Interactive Features

The `index.astro` page contains client-side JavaScript for:
- Timer functionality for timed exercises
- Set counter for exercises with multiple sets
- Phase collapse/expand toggles
- Exercise completion tracking with confetti celebration
- Progress bar visualization across all 4 phases
- Level selector that shows/hides level-specific instructions
- Modal dialogs for exercise details and scientific references

### PWA Configuration

- **`public/manifest.json`**: PWA manifest with app metadata, icons, and display settings
- **`public/sw.js`**: Service worker for offline functionality
  - **Development**: Service worker is DISABLED in dev mode to avoid cache issues
  - **Production**: Cache-first strategy for offline support
  - **Cache invalidation**: Increment `CACHE_NAME` version (v1 → v2 → v3) when deploying changes that need fresh content:
    - UI updates, bug fixes, exercise data changes, styling updates
    - Old caches are automatically deleted on activation
- **`vercel.json`**: Custom headers for service worker, manifest, and security (CSP, X-Frame-Options, etc.)
- Icons required: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png`

### Deployment

The app uses Astro's Vercel adapter with:
- Server-side rendering (`output: 'server'`)
- Vercel Web Analytics enabled
- Site URL configured in `astro.config.mjs`

## Important Notes

- **Language**: All content is in Spanish (target audience: Spanish-speaking office workers)
- **Mobile-first**: The UI is fully responsive with mobile considerations (sticky headers, compact layouts)
- **Accessibility**: Exercises include detailed instructions, video tutorials, and safety tips
- **Scientific rigor**: All exercises are backed by cited research; maintain scientific accuracy when modifying content
- **Progressive difficulty**: The 3-level system (principiante/intermedio/avanzado) allows users to scale exercises safely
