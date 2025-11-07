// src/firebaseConfig.ts

import { initializeApp } from 'firebase/app';
// 1. This is the CORRECT import path for persistence in modern Firebase
import { getAuth } from 'firebase/auth';
// 2. This imports the storage module you installed
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCROAizPupXFK7YCo7K1-cHX93K2wT40y8",
  authDomain: "psyvana-9ca9f.firebaseapp.com",
  projectId: "psyvana-9ca9f",
  storageBucket: "psyvana-9ca9f.firebasestorage.app",
  messagingSenderId: "696664212467",
  appId: "1:696664212467:web:47dc029892b8323ab60886",
  measurementId: "G-EV3XVFJW2W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// This initializes Auth with persistence, which will now work correctly
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

// Export the initialized services
export { auth, db };