

// src/utilities/firebaseUtilities.js
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
  authDomain: "jikoniexpressnotification.firebaseapp.com",
  projectId: "jikoniexpressnotification",
  storageBucket: "jikoniexpressnotification.appspot.com", // ✅ FIXED
  messagingSenderId: "880547014610",
  appId: "1:880547014610:web:9168f6b24052eecd448a0b",
  measurementId: "G-G4FCZQ71M1"
};

// Your VAPID Key
const VAPID_KEY = 'BKWJV-ITEoOZo-YQ2VnBPu479gwTRjP02Cp8lJ2HxT9__zL4kJ9q5zbiC_-1T7emTaQ6u1NJAQ5HQpHvZcXKaLI';


// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = getMessaging(app);

// Export the initialized app, messaging instance, and VAPID key
// These are named exports now.
export { app, messaging, VAPID_KEY };

// The requestFCMToken function is no longer needed here as its logic
// is integrated directly into App.jsx for consolidated FCM handling.
