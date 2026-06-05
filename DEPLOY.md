# Deployment guide

This project is configured to deploy **unslump!** to Vercel as an Astro PWA.

## Pre-deploy checklist

- [ ] `pnpm install` completes successfully
- [ ] `pnpm run build` passes locally
- [ ] `pnpm test` passes locally
- [ ] PWA icons are present in `public/`
- [ ] `astro.config.mjs` uses the correct production `site` URL
- [ ] No local agent/runtime files are tracked
- [ ] Git remote points to the public repository, for example `https://github.com/cozarkd/unslump.git`

## Local verification

```bash
pnpm install
pnpm run build
pnpm run preview
```

Open the preview URL and verify:

- `/en/` and `/es/` render correctly
- `/en/app` and `/es/app` preserve progress in `localStorage`
- `/en/workout` and `/es/workout` start the guided workout flow
- PWA manifest appears in Chrome DevTools → Application → Manifest
- Service worker registers in production preview/deploy environments

## Deploy from GitHub to Vercel

1. Push the repository to GitHub.
2. Open [vercel.com/new](https://vercel.com/new).
3. Import the `unslump` repository.
4. Use the detected Astro settings, or set them explicitly:

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Install command | `pnpm install` |
| Build command | `pnpm run build` |

5. Deploy.
6. After the first deployment, confirm the production URL and update `astro.config.mjs` if needed.

## Deploy from Vercel CLI

```bash
pnpm add -g vercel
vercel login
vercel
vercel --prod
```

## PWA cache invalidation

`public/sw.js` uses a versioned `CACHE_NAME`. Increment it whenever users must receive fresh cached content, such as after UI, route, icon, exercise-data, or localization changes.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Build fails | Run `pnpm install`, then `pnpm run build`; inspect Astro type-check output. |
| Manifest warnings | Confirm all icon paths in `public/manifest.json` exist. |
| Service worker stale content | Increment `CACHE_NAME`, redeploy, then hard-refresh or clear site data. |
| Wrong canonical URL | Update `site` in `astro.config.mjs` and redeploy. |
