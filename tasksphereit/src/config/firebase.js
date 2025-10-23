// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,  } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJ6oPXpjNH02Cas37Vt6VbZ7CSrHqk6Lk",
  authDomain: "tasksphereit-b53c8.firebaseapp.com",
  projectId: "tasksphereit-b53c8",
  storageBucket: "tasksphereit-b53c8.firebasestorage.app",
  messagingSenderId: "638410355707",
  appId: "1:638410355707:web:2773f33db240ae1201d15e",
  measurementId: "G-ZQTD7KEX9K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();