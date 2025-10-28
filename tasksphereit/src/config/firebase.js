// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJ6oPXpjNH02Cas37Vt6VbZ7CSrHqk6Lk",
  authDomain: "tasksphereit-b53c8.firebaseapp.com",
  projectId: "tasksphereit-b53c8",
  storageBucket: "tasksphereit-b53c8.firebasestorage.app",
  messagingSenderId: "638410355707",
  appId: "1:638410355707:web:2773f33db240ae1201d15e",
  measurementId: "G-ZQTD7KEX9K",
};

const app = initializeApp(firebaseConfig);

// Analytics only when available (avoids SSR/dev errors)
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});

export const auth = getAuth(app);
export const db = getFirestore(app);
