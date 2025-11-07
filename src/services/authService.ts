// src/services/authService.ts

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Define a type for Firebase errors for cleaner code
type FirebaseError = {
  code?: string;
};

// --- Sign In function (Corrected) ---
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in successfully!', userCredential.user.uid);
    return { success: true, user: userCredential.user };
  } catch (error) {
    const firebaseError = error as FirebaseError; // Type assertion
    let errorMessage = 'An unknown error occurred.';
    switch (firebaseError.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'The email address is not valid.';
        break;
      default:
        errorMessage = 'Login failed. Please try again later.';
        console.error('Firebase sign-in error:', error);
        break;
    }
    return { success: false, error: errorMessage };
  }
};

// --- Sign Up function (Corrected) ---
export const signUp = async (name: string, email: string, password: string) => {
  try {
    // 1. Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Create a user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: name,
      email: email,
      createdAt: serverTimestamp(),
    });

    return { success: true, user: user };
  } catch (error) {
    const firebaseError = error as FirebaseError; // Type assertion
    let errorMessage = 'An unknown error occurred.';
    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email address is already registered.';
        break;
      case 'auth/weak-password':
        errorMessage = 'The password must be at least 6 characters long.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'The email address is not valid.';
        break;
      default:
        errorMessage = 'Sign-up failed. Please try again later.';
        console.error('Firebase sign-up error:', error);
        break;
    }
    return { success: false, error: errorMessage };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out.' };
  }
};