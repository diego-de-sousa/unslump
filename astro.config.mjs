import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

const isOfflineE2E = process.env.OFFLINE_E2E === 'true';

export default defineConfig({
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()]
  },
  output: isOfflineE2E ? 'static' : 'server',
  adapter: isOfflineE2E ? undefined : vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  site: 'https://unslump.vercel.app',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
  }
});
