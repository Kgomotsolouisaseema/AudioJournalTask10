// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import {getAuth , GoogleAuthProvider} from "firebase/auth";
import {getFirestore} from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyDwSv9QNdq8ra6ZRhCsv2WGSLlWuxVdhyM",
  authDomain: "audiojournal-30ab9.firebaseapp.com",
  projectId: "audiojournal-30ab9",
  storageBucket: "audiojournal-30ab9.appspot.com",
  messagingSenderId: "855903106452",
  appId: "1:855903106452:web:aa19eeebefe6309324cb81",
  measurementId: "G-GECC8VMJLJ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const  auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);