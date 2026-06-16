require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function test() {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
    console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
    console.log("Private Key length:", privateKey?.length);
    console.log("Private Key ends with:", privateKey?.slice(-30));

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    const db = getFirestore();
    const snapshot = await db.collection('projects').limit(1).get();
    console.log("Success! Found", snapshot.size, "documents.");
  } catch (e) {
    console.error("Firebase Admin Error:", e);
  }
}

test();
