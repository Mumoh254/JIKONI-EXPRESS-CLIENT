// This is the Firebase Cloud Messaging Service Worker file.
// It needs to be placed at the root of your domain for proper functionality.

// Import and initialize the Firebase app (v11.9.1)
// Using 'compat' versions for broader compatibility, as seen in your provided code.
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// IMPORTANT: Replace with your actual Firebase configuration
// This configuration allows the service worker to identify your Firebase project
// and handle messages sent to it.
const firebaseConfig = {
    apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
    authDomain: "jikoniexpressnotification.firebaseapp.com",
    projectId: "jikoniexpressnotification",
    storageBucket: "jikoniexpressnotification.appspot.com",
    messagingSenderId: "880547014610",
    appId: "1:880547014610:web:9168f6b24052eecd448a0b",
    measurementId: "G-G4FCZQ71M1"
};

// Initialize the Firebase app with your project's configuration.
firebase.initializeApp(firebaseConfig);

// Retrieve a Firebase Messaging instance, which is used to interact with FCM.
const messaging = firebase.messaging();

// --- Handle Background Messages ---
// This listener triggers when a push notification is received while your web app
// is not in the foreground (i.e., closed, minimized, or in another tab).
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    // Extract notification title and body from the payload, with fallbacks.
    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message.',
        // Use the icon provided in the payload, or a default image.
        // Ensure '/firebase-logo.png' exists at your root or provide another path.
        icon: payload.notification?.icon || '/images/rider.png',
        // 'data' can contain custom key-value pairs for additional context or actions.
        data: payload.data || {}
    };

    // 'self.registration.showNotification()' displays the notification in the user's
    // device notification tray. This is the core functionality for background notifications.
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- Handle Notification Clicks ---
// This listener triggers when a user clicks on a notification displayed by the service worker.
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event);
    // Close the notification in the tray after it's clicked.
    event.notification.close();

    // Determine the URL to redirect to upon clicking the notification.
    // It looks for a 'url' in the notification's data, otherwise defaults to the root.
    const click_redirect_url = event.notification.data?.url || '/';

    // 'event.waitUntil()' ensures the service worker remains active until the
    // promise passed to it resolves. Here, it opens a new window/tab to the
    // specified URL. If the app is already open, it will focus that tab.
    event.waitUntil(
        clients.openWindow(click_redirect_url)
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