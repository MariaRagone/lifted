const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ✅ Replace with the path to your service account key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function uploadNotes() {
  const filePath = path.join(__dirname, 'user_notes_batch.json');
  const rawData = fs.readFileSync(filePath);
  const noteData = JSON.parse(rawData);

  const userId = '3LPkqCsyYUaweIleKdOpzmeqPK83';
  const batch = db.batch();

  for (const date in noteData) {
    const noteText = noteData[date];
    const noteRef = db.doc(`users/${userId}/notes/${date}`);
    batch.set(
      noteRef,
      {
        text: noteText,
        timestamp: new Date(),
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log('✅ Notes uploaded successfully.');
}

uploadNotes().catch(console.error);
