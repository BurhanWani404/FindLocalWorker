// Import the modular Firebase v9 SDKs
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQQXtjt3x38hevSg7QE9Al7BcfjGRq2KM",
  authDomain: "find-woker.firebaseapp.com",
  databaseURL: "https://find-woker-default-rtdb.firebaseio.com",
  projectId: "find-woker",
  storageBucket: "find-woker.appspot.com",
  messagingSenderId: "500247591926",
  appId: "1:500247591926:web:cd214ed21e10336b11e5d7",
  measurementId: "G-8146QWG7MS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const realtimeDb = getDatabase(app);

// Set persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Password reset functions
const functions = getFunctions(app);
const requestPasswordReset = httpsCallable(functions, "sendPasswordResetCode");
const verifyResetCode = httpsCallable(functions, "verifyResetCodeAndUpdatePassword");

// Export initialization function
export const initFirebase = () => {
  return { app, auth, db, storage, functions, realtimeDb };
};

// Export all Firebase services
export {
  // Core services
  app,
  auth,
  db,
  storage,
  functions,
  realtimeDb,

  // Auth functions
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,

  // Firestore functions
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  updateDoc,

  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL,

  // Password reset functions
  requestPasswordReset,
  verifyResetCode,

  // Additional utilities
  httpsCallable,
};