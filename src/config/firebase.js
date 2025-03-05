import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Use Netlify environment variables
const firebaseConfig = {
    const firebaseConfig = {
    apiKey: "AIzaSyC9fZZCxZvI-qY6UXPTKh0LAWruB-qIEVI",
    authDomain: "timmo-2f70c.firebaseapp.com",
    projectId: "timmo-2f70c",
    storageBucket: "timmo-2f70c.appspot.com",
    messagingSenderId: "1075188777095",
    appId: "1:1075188777095:web:9b5b2b15677634fa5db822",
    measurementId: "G-16Q56WEB16"
};

// Debugging: Check if variables are loaded from Netlify
console.log("Firebase Config from Netlify:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };
