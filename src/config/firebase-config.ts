/**
 * Configuration for Firebase Admin SDK (Service Account Details).
 * These variables should be set in your .env.local file.
 * NOTE: Next.js only exposes NEXT_PUBLIC_ variables to the browser.
 * Since this is for the backend (API Route/Admin SDK), variables do not need the NEXT_PUBLIC prefix.
 */
export const firebaseAdminConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};