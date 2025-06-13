// lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Validate required environment variables
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: requiredEnvVars.projectId!,
    clientEmail: requiredEnvVars.clientEmail!,
    privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
  }),
  databaseURL: `https://${requiredEnvVars.projectId}-default-rtdb.firebaseio.com/`
};

// Initialize Firebase Admin with proper error handling
let app: App;
let database: Database;
let db: Firestore;

try {
  // Check if app is already initialized
  const existingApps = getApps();
  app = existingApps.length === 0 ? initializeApp(firebaseAdminConfig) : existingApps[0];

  // Initialize database (Realtime Database)
  database = getDatabase(app);

  // Initialize Firestore
  db = getFirestore(app);

} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  throw new Error(`Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

// Export the database instance (Realtime Database)
export { database };

// Export Firestore instance
export { db };

// Export as adminDb for backward compatibility
export { database as adminDb };

// Export app for other potential uses
export { app };

// Default export for convenience (Realtime Database)
export default database;