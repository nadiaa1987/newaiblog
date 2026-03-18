import * as admin from "firebase-admin";

const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  if (firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig as admin.ServiceAccount),
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    } catch (error) {
      console.error("Firebase admin initialization error", error);
    }
  } else {
    console.warn("Firebase admin variables are missing. Skipping initialization during build.");
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
