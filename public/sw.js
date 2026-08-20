// IMPORTANT: Increment version (v1 -> v2 -> v3, etc.) when deploying changes that need cache invalidation
// Examples: UI updates, bug fixes, exercise data changes, styling updates
// This ensures users get the latest content by clearing old caches on activation
const CACHE_NAME = 'unslump-v47';
const urlsToCache = [
  '/en/',
  '/es/',
  '/en/app',
  '/es/app',
  '/en/workout',
  '/es/workout',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-192.png',
  '/maskable-512.png'
  // Note: Exercise images in /exercise-images/ are cached automatically on-demand via fetch handler
];

const isCacheableRuntimeRequest = (requestUrl, request) => {
  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return false;
  }

  return request.mode === 'navigate'
    || requestUrl.pathname.startsWith('/_astro/')
    || requestUrl.pathname.startsWith('/exercise-images/');
};

const matchCachedRequest = (requestUrl, request) => {
  if (requestUrl.pathname.startsWith('/_astro/')) {
    return caches.match(requestUrl.href, { ignoreVary: true });
  }

  return caches.match(request);
};

const addRequiredUrls = (cache, urls) => Promise.all(urls.map(async (url) => {
  try {
    await cache.add(url);
  } catch (error) {
    throw new Error(`Failed to cache required URL ${url}`, { cause: error });
  }
}));

const findGeneratedAssetUrls = (content, baseUrl) => {
  const assetUrls = new Set();
  const references = [
    ...content.matchAll(/(?:src|href)=["']([^"']+)["']/g),
    ...content.matchAll(/["'`](\.?\.?\/[^"'`\s)]+|\/_astro\/[^"'`\s)]+)["'`]/g),
    ...content.matchAll(/url\(["']?([^)"']+)/g)
  ];

  for (const match of references) {
    if (match[1].includes('${')) {
      continue;
    }

    const assetUrl = new URL(match[1], baseUrl);
    const isGeneratedAsset = assetUrl.pathname.startsWith('/_astro/')
      && !assetUrl.pathname.includes('%')
      && /\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp|avif)$/.test(assetUrl.pathname);
    if (assetUrl.origin === self.location.origin && isGeneratedAsset) {
      assetUrls.add(assetUrl.href);
    }
  }

  return assetUrls;
};

const cacheGeneratedAssets = async (cache) => {
  const discoveredUrls = new Set();

  await Promise.all(urlsToCache.map(async (url) => {
    const response = await cache.match(url);
    if (!response || !response.headers.get('content-type')?.includes('text/html')) {
      return;
    }

    const html = await response.text();
    for (const assetUrl of findGeneratedAssetUrls(html, new URL(url, self.location.origin))) {
      discoveredUrls.add(assetUrl);
    }
  }));

  let pendingUrls = [...discoveredUrls];
  while (pendingUrls.length > 0) {
    await addRequiredUrls(cache, pendingUrls);
    const nextUrls = new Set();

    await Promise.all(pendingUrls.map(async (url) => {
      const response = await cache.match(url);
      const contentType = response?.headers.get('content-type') ?? '';
      if (!response || (!contentType.includes('javascript') && !contentType.includes('text/css'))) {
        return;
      }

      const content = await response.text();
      for (const assetUrl of findGeneratedAssetUrls(content, url)) {
        if (!discoveredUrls.has(assetUrl)) {
          discoveredUrls.add(assetUrl);
          nextUrls.add(assetUrl);
        }
      }
    }));

    pendingUrls = [...nextUrls];
  }
};

// Install event - cache pages and their generated build assets as one required shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Opened cache');
        await addRequiredUrls(cache, urlsToCache);
        await cacheGeneratedAssets(cache);
      })
      .catch((error) => {
        console.error('Failed to install offline cache:', error);
        throw error;
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all([
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ),
      self.clients.claim()
    ]))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (!isCacheableRuntimeRequest(requestUrl, event.request)) {
    return;
  }

  event.respondWith(
    matchCachedRequest(requestUrl, event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          return caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache))
            .catch((error) => {
              console.warn('Failed to cache runtime response:', error);
            })
            .then(() => response);
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          const localeHome = requestUrl.pathname.startsWith('/es/') ? '/es/' : '/en/';
          return caches.match(localeHome);
        }

        return Response.error();
      })
  );
});
