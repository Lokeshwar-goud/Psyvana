// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);