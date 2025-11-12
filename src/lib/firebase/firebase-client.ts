// src/lib/firebase-client.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Your web app's Firebase configuration (Public, safe to expose via NEXT_PUBLIC_)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
const db = getFirestore(app);

/**
 * Saves a lead document to the 'leads' collection in Firestore using the Client SDK.
 * @param leadData The data object to save.
 */
export async function saveLeadToFirestore(leadData: any) {
  // Ensure the necessary public config keys are present before attempting a connection
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
     throw new Error("Missing NEXT_PUBLIC_FIREBASE environment variables for Client SDK.");
  }
    
  try {
    const leadsCollection = collection(db, 'leads');
    const docRef = await addDoc(leadsCollection, {
      ...leadData,
      timestamp: new Date().toISOString(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    // Re-throw to allow the caller (the API route) to catch and log the failure
    throw e;
  }
}