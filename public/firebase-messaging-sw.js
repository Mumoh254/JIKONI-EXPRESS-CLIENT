// Import and initialize Firebase
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
    authDomain: "jikoniexpressnotification.firebaseapp.com",
    projectId: "jikoniexpressnotification",
    storageBucket: "jikoniexpressnotification.appspot.com",
    messagingSenderId: "880547014610",
    appId: "1:880547014610:web:9168f6b24052eecd448a0b",
    measurementId: "G-G4FCZQ71M1"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Received background message:', payload);
    
    // Extract custom data from payload
    const notificationData = payload.data || {};
    
    // Build notification options
    const notificationOptions = {
        body: notificationData.body || 'You have a new message.',
        icon: notificationData.imageUrl || '/images/rider.png',
        data: notificationData,
        badge: '/images/badge.png',
        vibrate: [200, 100, 200, 100, 200],
        timestamp: Date.now()
    };
    
    // Add title from data if available
    const notificationTitle = notificationData.title || 'New Message';
    
    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions)
        .catch(error => console.error('Failed to show notification:', error));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({type: 'window'}).then(windowClients => {
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// --- PWA Caching Logic ---
const CACHE_VERSION = 'v1'; // This will be compared against the version from /api/version
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


// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`Installing cache: ${CACHE_NAME}`);
                return cache.addAll(INSTALL_CACHE);
            })
            .catch(error => {
                console.error(`🔴 Service Worker INSTALL failed for ${CACHE_NAME}:`, error);
            })
    );
});

// Activate event
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
        }).then(() => self.clients.claim())
    );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    // Cache-first strategy for assets
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            return cachedResponse || fetch(request).then(networkResponse => {
                // Cache successful responses
                if (networkResponse.ok && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // Serve offline page for navigation failures
            if (request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
            }
        })
    );
});

// --- API Version Check (FIXED) ---
// This function now robustly checks for a new version from your API.
function checkApiVersion() {
    fetch('/api/version')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // IMPORTANT: Check if the response is actually JSON before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("Received response was not JSON. Check your /api/version endpoint.");
            }
            return response.json();
        })
        .then(data => {
            // Check if the version from the API is new
            if (data.version && data.version !== CACHE_VERSION) {
                console.log(`New version available: ${data.version}. Current version: ${CACHE_VERSION}`);
                // Send a message to the client-side code to notify the user
                self.registration.postMessage({
                    type: 'NEW_VERSION_AVAILABLE',
                    version: data.version
                });
            } else {
                console.log('API version is up to date.');
            }
        }).catch(error => {
            // This will now catch both network errors and the TypeError if the response isn't JSON
            console.error('Error checking API version:', error);
        });
}

// Periodically check the API version every 5 minutes
setInterval(checkApiVersion, 300000);

// Check version once on activation
self.addEventListener('activate', (event) => {
    event.waitUntil(
        // ... (previous activate logic) ...
        // Add an immediate check
        Promise.resolve().then(() => checkApiVersion())
    );
});