import * as admin from "firebase-admin";

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  const { projectId, clientEmail, privateKey } = firebaseAdminConfig;
  
  if (projectId && clientEmail && privateKey && privateKey.includes("BEGIN PRIVATE KEY")) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        databaseURL: `https://${projectId}.firebaseio.com`,
      });
    } catch (error) {
      console.error("Firebase admin initialization error:", error);
    }
  } else {
    console.warn("Firebase Admin environment variables are missing or invalid. Skipping initialization.");
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
