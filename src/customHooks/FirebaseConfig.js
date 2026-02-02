// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// import dotenv from 'dotenv';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"
// dotenv.config();

const firebaseConfig = {
    apiKey: "AIzaSyBF5T74P7XpJBP-nUtmVRqQ4sb3H4-oUjE",
    authDomain: "solmaqweb.firebaseapp.com",
    projectId: "solmaqweb",
    storageBucket: "solmaqweb.appspot.com",
    messagingSenderId: "868711475217",
    appId: "1:868711475217:web:ab79be3ab2b7c86955a9b0"
  };

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db  = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
export { db, storage,firebaseApp };
