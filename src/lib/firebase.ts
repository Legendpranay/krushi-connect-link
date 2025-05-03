
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from your google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyAP3xpyC1fcxZLc-5iQn1WxLVQsoMj5Bvo",
  authDomain: "agroconnect-a2813.firebaseapp.com",
  projectId: "agroconnect-a2813",
  storageBucket: "agroconnect-a2813.firebasestorage.app",
  messagingSenderId: "154016992684",
  appId: "1:154016992684:android:40a7949241e74020143e09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set up Firestore rules (note: these will need to be implemented in Firebase Console as well)
// Example rules:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow farmers to read driver profiles
    match /users/{userId} {
      allow read: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'farmer' &&
                    resource.data.role == 'driver' && resource.data.isVerified == true;
    }
    
    // Bookings rules
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
                   (resource.data.farmerId == request.auth.uid || 
                    resource.data.driverId == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.farmerId == request.auth.uid;
      allow update: if request.auth != null && 
                     (resource.data.farmerId == request.auth.uid || 
                      resource.data.driverId == request.auth.uid);
    }
    
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
                           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
*/

export default app;
