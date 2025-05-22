const admin = require("firebase-admin");
const data = require("./devotional_days.json"); // Ensure this file is in the same folder

const serviceAccount = require("./serviceAccountKey.json"); // Path to your Firebase Admin SDK JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importDevotionals() {
  const days = Object.keys(data);

  for (const date of days) {
    const docRef = db.collection("days").doc(date);
    await docRef.set(data[date], { merge: true });
    console.log(`✅ Imported ${date}`);
  }

  console.log("🎉 All devotionals imported.");
}

importDevotionals().catch(console.error);
