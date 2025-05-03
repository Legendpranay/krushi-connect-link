
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Note: In a production app, you'd want to use environment variables
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Firebase auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Firebase project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Firebase storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase messaging sender ID
  appId: "YOUR_APP_ID", // Replace with your Firebase app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
