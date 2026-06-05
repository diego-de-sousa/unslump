# unslump!

**unslump!** is a bilingual Progressive Web App (PWA) for office workers: a guided 25-minute exercise routine designed to counteract long hours at a desk and support better posture.

The routine is organized around a corrective exercise protocol and backed by 30+ peer-reviewed references. It is available in English and Spanish.

## Quick start

```bash
pnpm install
pnpm run dev
```

Open the local Astro server and choose one of the localized routes:

- `/en/` — English landing page
- `/es/` — Spanish landing page
- `/en/app` and `/es/app` — exercise browser
- `/en/workout` and `/es/workout` — guided workout flow

## What it includes

- Science-backed 4-phase protocol: inhibit, lengthen, activate, integrate
- Guided 25-minute workout with timers, rest periods, and exercise navigation
- Exercise browser with progress tracking
- Difficulty levels for scalable instructions
- Local progress persistence with `localStorage`
- English and Spanish content, SEO metadata, and localized routes
- PWA manifest, service worker, installable icons, and offline support
- Unit tests with Vitest and E2E tests with Playwright

## Tech stack

| Area | Tooling |
| --- | --- |
| Framework | Astro v5 with server output and i18n routing |
| UI islands | Preact |
| Styling | Tailwind CSS v3 |
| State | Nanostores + browser storage |
| Motion | Motion One |
| Deployment | Vercel adapter |
| Tests | Vitest + Playwright |
| Package manager | pnpm |

## Commands

```bash
pnpm run dev            # Start development server
pnpm run build          # Type-check and build for production
pnpm run preview        # Preview production build
pnpm test               # Run unit tests
pnpm test:coverage      # Run unit tests with coverage
pnpm test:e2e           # Run Playwright E2E tests
pnpm test:e2e:ui        # Run Playwright in UI mode
```

## Project structure

```text
public/                 PWA icons, manifest, service worker, static assets
src/components/         Astro and Preact UI components
src/components/landing/ Landing page sections
src/components/workout/ Guided workout UI states
src/data/               Localized exercise data, references, and details
src/i18n/               Locale files and routing helpers
src/layouts/            Shared Astro layouts and SEO metadata
src/pages/              Localized Astro routes
tests/e2e/              Playwright E2E tests
```

## Deployment

The project is configured for Vercel.

```bash
pnpm run build
```

Vercel settings:

| Setting | Value |
| --- | --- |
| Build command | `pnpm run build` |
| Install command | `pnpm install` |
| Framework | Astro |
| Output | Vercel adapter output |

The canonical site URL is configured in `astro.config.mjs`. Update it if the production deployment does not use `https://unslump.vercel.app`.

## PWA notes

- Increment `CACHE_NAME` in `public/sw.js` when deploying changes that must invalidate the offline cache.
- Keep app icons in `public/`: `icon-192.png`, `icon-512.png`, `maskable-192.png`, `maskable-512.png`, `apple-touch-icon.png`, and `og-image.png`.
- Test installability with Chrome DevTools → Application → Manifest and Lighthouse.

## Agent instructions

Project-specific coding-agent guidance lives in `AGENTS.md`. Pi loads `AGENTS.md` at startup, and it can also load compatible context files from parent directories.

## Medical disclaimer

unslump! is an educational exercise app, not medical advice. Users with pain, injuries, medical conditions, or uncertainty about exercise safety should consult a qualified health professional.

## License

MIT — see [`LICENSE`](LICENSE).
