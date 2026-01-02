
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- ACTION REQUIRED ---
// Replace this with your app's Firebase project configuration.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Creates a reference to the 'fetchUrlContent' Cloud Function.
// Ensure the function name here matches the exported name in your Cloud Function's index.ts
export const fetchUrlContentCallable = httpsCallable(functions, 'fetchUrlContent');
