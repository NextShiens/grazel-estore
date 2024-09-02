import * as admin from "firebase-admin";

// Path to your service account key file
const serviceAccount = require("../config/firebase-key.json");

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// export default admin;

export const fcm = admin.messaging();
