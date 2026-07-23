const initFirebase = require('../config/firebase');

/**
 * Sends a push notification to a single device via Firebase Cloud Messaging.
 * Fails silently (logs a warning) if Firebase isn't configured or the send fails,
 * so a notification issue never breaks the like/comment API response.
 */
async function sendNotification({ token, title, body, data = {} }) {
  if (!token) return;

  const admin = initFirebase();
  if (!admin) return;

  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
    });
  } catch (err) {
    console.warn('[fcm] Failed to send notification:', err.message);
  }
}

module.exports = sendNotification;
