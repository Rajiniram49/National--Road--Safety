import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";


// Firebase config (Ensure these values are correct)
const firebaseConfig = {
  apiKey: 'AIzaSyAaqw5TadKq_if0zkyjgr_lcNSOr92TnLo',
  authDomain: 'national-road-safety-6ba03.firebaseapp.com',
  projectId: 'national-road-safety-6ba03',
  storageBucket: 'national-road-safety-6ba03.firebasestorage.app',
  messagingSenderId: '218300036487',
  appId: '1:218300036487:web:fca93f5f2f4b31fa5e0f22',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
let auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


try {
  if (getApps().length == 0) {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    console.log('Firebase Initialized:', app);
  } else {
    console.log('Firebase already initialized.');
    auth = getAuth();
  }
}
catch (error) {
  console.error('Error initializing Firebase:', error);
}


export { auth, db, storage };
