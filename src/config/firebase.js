import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAxRywmrAPxIER9x8kWicwUWsBKteQ54_s",
  authDomain: "organizadorestudo.firebaseapp.com",
  projectId: "organizadorestudo",
  storageBucket: "organizadorestudo.firebasestorage.app",
  messagingSenderId: "872263455038",
  appId: "1:872263455038:web:4b1ff1de308bd050689c6f",
  measurementId: "G-WKWKHT1SKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const isConfigValid = true;

console.log('🔥 Firebase configurado e conectado');

export default app;
