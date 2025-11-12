import * as admin from 'firebase-admin';
// Force this to be a server-only module to protect the private key
import 'server-only'; 

// This object maps your environment variables (UPPER_SNAKE_CASE) 
// to the required snake_case keys for the Firebase Admin SDK.
const serviceAccount = {
    'type': process.env.FIREBASE_TYPE,
    'project_id': process.env.FIREBASE_PROJECT_ID,
    'private_key_id': process.env.FIREBASE_PRIVATE_KEY_ID,
    // CRITICAL: Replace escaped newlines (\n) with actual newline characters.
    'private_key': process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined, 
    'client_email': process.env.FIREBASE_CLIENT_EMAIL,
    'client_id': process.env.FIREBASE_CLIENT_ID,
    'auth_uri': process.env.FIREBASE_AUTH_URI,
    'token_uri': process.env.FIREBASE_TOKEN_URI,
    'auth_provider_x509_cert_url': process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    'client_x509_cert_url': process.env.FIREBASE_CLIENT_X509_CERT_URL,
    'universe_domain': process.env.FIREBASE_UNIVERSE_DOMAIN,
};

// Check for required configuration pieces for the custom Service Account credential.
const isCustomConfigComplete = !!serviceAccount.project_id && !!serviceAccount.private_key && !!serviceAccount.client_email;

if (!admin.apps.length) {
  try {
    if (isCustomConfigComplete) {
      // Use the custom Service Account details
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log('Firebase Admin Initialized successfully with custom config.');
    } else {
      // Fallback for other environments (e.g., Google Cloud, Vercel with JSON file)
      admin.initializeApp();
      console.log('Firebase Admin Initialized using application default credentials.');
    }
  } catch (error) {
    console.error('Firebase Admin Initialization failed:', error);
  }
}

// Export the Firestore instance
const db = admin.firestore();

export { db, admin };