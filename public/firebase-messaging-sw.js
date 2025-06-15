// Firebase v11.9.1 - compat imports for service workers
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
  authDomain: "jikoniexpressnotification.firebaseapp.com",
  projectId: "jikoniexpressnotification",
  storageBucket: "jikoniexpressnotification.appspot.com", // ✅ Corrected
  messagingSenderId: "880547014610",
  appId: "1:880547014610:web:9168f6b24052eecd448a0b",
  measurementId: "G-G4FCZQ71M1"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: payload.notification?.icon || '/firebase-logo.png', // ✅ Ensure this icon exists in /public
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
