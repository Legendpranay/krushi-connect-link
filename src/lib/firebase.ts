
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// In a production app, you should use environment variables
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
