const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load user data
const userData = JSON.parse(fs.readFileSync("users_upload_data.json", "utf-8"));

async function uploadUsers() {
  const batch = db.batch();

  Object.entries(userData).forEach(([docId, user]) => {
    const userRef = db.collection("users").doc(docId);
    batch.set(userRef, user);
  });

  try {
    await batch.commit();
    console.log("✅ Users uploaded successfully");
  } catch (err) {
    console.error("❌ Error uploading users:", err);
  }
}

uploadUsers();
