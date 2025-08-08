// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDalzqBX9R8Mz2K537EAfeTW7fr6og3b74",
  authDomain: "nammai-live.firebaseapp.com",
  projectId: "nammai-live",
  storageBucket: "nammai-live.firebasestorage.app",
  messagingSenderId: "1075347785616",
  appId: "1:1075347785616:web:a7c58cba17aba711561515"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
