const CACHE_VERSION = 'v3';
const CACHE_NAME = `jikoni-express-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/offline.html',
  '/images/logo.png',
  '/assets/main.js',
  '/assets/main.css'
];

// Install event - cache essential assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately after install
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => {
        console.log(`Cache ${CACHE_NAME} installed for Jikoni Express`);
        return self.skipWaiting();
      })
  );
});

// Activate event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log(`Claiming clients for ${CACHE_NAME}`);
      return self.clients.claim();
    }).then(() => {
      // Notify clients to reload pages
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'RELOAD_PAGE' });
        });
      });
    })
  );
});

// Fetch handler - serve cached assets, check API version header
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For API requests, check for new version header
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        const newVersion = response.headers.get('X-New-Version');
        if (newVersion && newVersion !== CACHE_VERSION) {
          self.registration.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: newVersion
          });
        }
        return response;
      }).catch(() => {
        // On API fetch failure, fallback could be customized if needed
        return caches.match(request);
      })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      return cachedResponse || fetch(request);
    }).catch(() => {
      // If offline and request matches offline page, serve offline.html
      if (request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
    })
  );
});

// Message handler for controlling service worker lifecycle
self.addEventListener('message', (event) => {
  switch(event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'RELOAD_CLIENTS':
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'FORCE_RELOAD' }));
      });
      break;
  }
});

// Periodically check version endpoint to notify about updates
setInterval(() => {
  fetch('/api/version').then(response => response.json())
    .then(data => {
      if (data.version !== CACHE_VERSION) {
        self.registration.postMessage({
          type: 'NEW_VERSION_AVAILABLE',
          version: data.version
        });
      }
    }).catch(console.error);
}, 300000); // every 5 minutes


// ---- Client-side integration code ----
// Place this inside your main JS file for Jikoni Express frontend
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (confirm('New version available! Refresh now?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data.type === 'NEW_VERSION_AVAILABLE') {
        console.log(`New version ${event.data.version} available`);
        if (confirm(`Update to version ${event.data.version}?`)) {
          reg.update().then(() => window.location.reload());
        }
      }
    });
  }).catch(err => console.error('Service Worker registration failed:', err));
}
