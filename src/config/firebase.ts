// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";
// Import other services like getStorage if needed
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpacAXPw7p4q5mhT4diULIEhQFHoSN25E",
  authDomain: "automatics-task-management.firebaseapp.com",
  projectId: "automatics-task-management",
  storageBucket: "automatics-task-management.firebasestorage.app",
  messagingSenderId: "853719341343",
  appId: "1:853719341343:web:386fdd7f0d75b268a4f82a",
  measurementId: "G-36TPL9R4R5"
};

// Initialize Firebase services
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

// Prevent Firebase initialization errors during hot-reloading in development
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // Check if window is defined (only initialize Analytics on client-side)
    if (typeof window !== 'undefined') {
       analytics = getAnalytics(app);
    }
} else {
    app = getApps()[0]; // Use the existing app instance
    // Ensure analytics is initialized if app already exists (for client-side)
    if (typeof window !== 'undefined' && !analytics) {
         try {
             analytics = getAnalytics(app);
         } catch (error) {
              console.log("Could not get Analytics instance, likely already initialized or running on server.");
         }
    }
}

// Initialize other services (they are safe to initialize multiple times or use existing instances)
auth = getAuth(app);
db = getFirestore(app);

// Export the initialized services for use in other parts of your app
export { app, auth, db, analytics };