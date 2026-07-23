const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  const serviceAccountPath = path.resolve(
    process.cwd(),
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'
  );

  if (!fs.existsSync(serviceAccountPath)) {
    console.warn(
      '[firebase] Service account file not found at',
      serviceAccountPath,
      '- push notifications will be disabled. Add FIREBASE_SERVICE_ACCOUNT_PATH to enable FCM.'
    );
    return null;
  }

  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  console.log('[firebase] Firebase Admin initialized');
  return admin;
}

module.exports = initFirebase;
