
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP3xpyC1fcxZLc-5iQn1WxLVQsoMj5Bvo",
  authDomain: "agroconnect-a2813.firebaseapp.com",
  projectId: "agroconnect-a2813",
  storageBucket: "agroconnect-a2813.appspot.com",
  messagingSenderId: "154016992684",
  appId: "1:154016992684:android:40a7949241e74020143e09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Disable app verification for testing (ONLY for development)
// Remove this in production!
if (process.env.NODE_ENV !== 'production') {
  auth.settings.appVerificationDisabledForTesting = true;
}

// Utility function to create invisible recaptcha
export const createRecaptchaVerifier = (auth) => {
  return new RecaptchaVerifier(auth, 'invisible-recaptcha', {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    },
  });
};

// Export as default
export default app;
