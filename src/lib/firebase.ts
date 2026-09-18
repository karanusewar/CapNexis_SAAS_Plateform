import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

console.log("Firebase Config loaded:", { authDomain: firebaseConfig.authDomain, projectId: firebaseConfig.projectId });
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    console.log("Initiating Sign-In. Current Origin:", window.location.origin);
    // Use popup for better UX and to avoid redirect loops on custom domains
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Error initiating Google sign-in", error);
    alert(`Auth Error: ${error.message || error.code}. Please ensure your domain is whitelisted in Firebase.`);
    throw error;
  }
};

export const logout = () => signOut(auth);
