import * as admin from "firebase-admin";

const parseFirebasePrivateKey = (key?: string) => {
  if (!key) return "";

  let normalizedKey = key.trim();

  // Remove surrounding quotes if the env variable was wrapped in quotes
  if (
    normalizedKey.startsWith('"') &&
    normalizedKey.endsWith('"') &&
    normalizedKey.length > 1
  ) {
    normalizedKey = normalizedKey.slice(1, -1);
  }

  // Convert escaped newline sequences to actual newlines
  normalizedKey = normalizedKey.replace(/\\n/g, "\n");

  return normalizedKey;
};

// Firebase Admin SDK configuration
const serviceAccount = {
  type: "service_account",
  project_id: "ironclad-2b8a4",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: parseFirebasePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "ironclad-2b8a4.firebasestorage.app",
  });
}

export const bucket = admin.storage().bucket();
export default admin;
