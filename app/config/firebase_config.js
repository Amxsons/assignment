// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore'



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD66eCFq6i148XwlsdAMnjEIvs89TrLcTI",
  authDomain: "assignment-eb8d6.firebaseapp.com",
  projectId: "assignment-eb8d6",
  storageBucket: "assignment-eb8d6.appspot.com",
  messagingSenderId: "717394132545",
  appId: "1:717394132545:web:7cf1ae1c11659c35b6d0c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export { auth, provider, db, signInWithPopup, signOut, collection, addDoc, onSnapshot };