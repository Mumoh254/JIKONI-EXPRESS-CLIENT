import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBX7U1lDZihQ2tHq1CTfgm9EEamw8HlFoc",
  authDomain: "jikoniexpressnotification.firebaseapp.com",
  projectId: "jikoniexpressnotification",
  storageBucket: "jikoniexpressnotification.appspot.com", // ✅ FIXED
  messagingSenderId: "880547014610",
  appId: "1:880547014610:web:9168f6b24052eecd448a0b",
  measurementId: "G-G4FCZQ71M1"
};

const vapidKey = 'BKWJV-ITEoOZo-YQ2VnBPu479gwTRjP02Cp8lJ2HxT9__zL4kJ9q5zbiC_-1T7emTaQ6u1NJAQ5HQpHvZcXKaLI';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        console.log('✅ FCM Token:', currentToken);
        return currentToken;
      } else {
        throw new Error('⚠️ No FCM token available. Request permission to generate one.');
      }
    } else {
      throw new Error('❌ Notification permission denied.');
    }
  } catch (error) {
    console.error('🔥 Error requesting FCM token:', error);
    throw error;
  }
};
