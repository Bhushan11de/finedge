import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyDjDGFPSNq3tatjzOmBjuzG5f6wfssTn08",
  authDomain: "finedge-780d1.firebaseapp.com",
  projectId: "finedge-780d1",
  storageBucket: "finedge-780d1.firebasestorage.app",
  messagingSenderId: "870029771318",
  appId: "1:870029771318:web:8a06b16b0cb0a44c410e97",
  measurementId: "G-5R5T9VZK4W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this export
