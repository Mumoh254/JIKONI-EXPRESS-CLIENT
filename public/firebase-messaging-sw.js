importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
// Note: Using -compat versions for importScripts in service workers is common
// as they expose the global 'firebase' namespace.

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
  authDomain: "jikoniexpressnotification.firebaseapp.com",
  projectId: "jikoniexpressnotification",
  storageBucket: "jikoniexpressnotification.firebasestorage.app",
  messagingSenderId: "880547014610",
  appId: "1:880547014610:web:9168f6b24052eecd448a0b",
  measurementId: "G-G4FCZQ71M1"
};

// Initialize Firebase App
const app = firebase.initializeApp(firebaseConfig);

// Get the Messaging service instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // You can customize the notification display here based on the payload
  const notificationTitle = payload.notification.title || 'New Message';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message.',
    icon: payload.notification.icon || '/firebase-logo.png', // Provide a default icon
    data: payload.data // Pass data to be available when notification is clicked
  };