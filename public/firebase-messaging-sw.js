// This is the Firebase Cloud Messaging Service Worker file.
// It needs to be placed at the root of your domain for proper functionality.

// Import and initialize the Firebase app - Updated to v11.9.1 as per your request
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
    authDomain: "jikoniexpressnotification.firebaseapp.com",
    projectId: "jikoniexpressnotification",
    storageBucket: "jikoniexpressnotification.appspot.com",
    messagingSenderId: "880547014610",
    appId: "1:880547014610:web:9168f6b24052eecd448a0b",
    measurementId: "G-G4FCZQ71M1"
};

// Initialize the Firebase app
firebase.initializeApp(firebaseConfig);

// Retrieve a Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
// This is called when the app is in the background or not running.
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    // Customize notification here
    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        // Prioritize icon from payload, fallback to default. Ensure this path is correct.
        icon: payload.notification?.icon || '/firebase-logo.png',
        data: payload.data || {} // Include data payload for deeper linking on click
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optionally, you can add a listener for notification clicks here if needed.
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    event.notification.close(); // Close the notification

    // Example: Open a specific URL when notification is clicked
    // Access data passed in notificationOptions.data
    const click_redirect_url = event.notification.data?.url || '/'; // Default to home
    event.waitUntil(
        clients.openWindow(click_redirect_url)
    );
});


// --- PWA Caching Logic ---
const CACHE_VERSION = 'v1';
const CACHE_NAME = `jikoni-express-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// IMPORTANT: Verify these paths match your deployed build structure exactly.
// If your assets are in a 'dist' or 'build' folder, or nested under 'static',
// 'assets' etc., you MUST adjust these paths accordingly (e.g., '/assets/main.js').
const INSTALL_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    // Check your build output for correct paths for these assets:
    '/styles.css',
    '/offline.html',
    '/images/logo.png', // Ensure this image is in your public/images directory
    '/assets/main.js',
    '/assets/main.css'
];


// Install event - cache essential assets immediately
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Activate worker immediately after install
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // IMPORTANT: Failed requests in addAll will make the entire install fail.
                // Ensure all paths in INSTALL_CACHE exist at the specified URL.
                return cache.addAll(INSTALL_CACHE);
            })
            .then(() => {
                console.log(`Cache ${CACHE_NAME} installed for Jikoni Express`);
                return self.skipWaiting();
            })
            .catch(error => {
                console.error(`🔴 Service Worker INSTALL failed for ${CACHE_NAME}:`, error);
                // Log the specific URL that caused the addAll to fail for debugging
                // (Note: addAll error itself won't tell which URL, but dev tools network tab will)
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
                console.warn(`API fetch failed for ${request.url}, falling back to cache if available.`);
                return caches.match(request);
            })
        );
        return;
    }

    // For other requests, try cache first, then network
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            return cachedResponse || fetch(request).then(response => {
                // Cache successful network responses
                if (response.ok && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            });
        }).catch(() => {
            // If offline and request matches offline page, serve offline.html
            if (request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
            }
            // For other failing requests (e.g., images), return a generic response or nothing
            return new Response('Offline: Resource not available', { status: 503, statusText: 'Service Unavailable' });
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
// IMPORTANT: Ensure /api/version returns valid JSON and is publicly accessible.
setInterval(() => {
    fetch('/api/version').then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.version && data.version !== CACHE_VERSION) {
            self.registration.postMessage({
                type: 'NEW_VERSION_AVAILABLE',
                version: data.version
            });
        }
    }).catch(error => console.error('Error checking API version:', error));
}, 300000); // every 5 minutes


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then(reg => { // Ensure this path is correct in your index.html registration
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                    // Changed from confirm to custom UI/logic for better UX
                    console.log('New version installed. Ready to update.');
                    // Example: You might show a toast or a banner here, then prompt for reload
                    // if (confirm('New version available! Refresh now?')) {
                    //   newWorker.postMessage({ type: 'SKIP_WAITING' });
                    //   window.location.reload();
                    // }
                }
            });
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });

        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data.type === 'NEW_VERSION_AVAILABLE') {
                console.log(`New version ${event.data.version} available`);
                // Changed from confirm to custom UI/logic for better UX
                // if (confirm(`Update to version ${event.data.version}?`)) {
                //   reg.update().then(() => window.location.reload());
                // }
            }
        });
    }).catch(err => console.error('Service Worker registration failed:', err));
}
