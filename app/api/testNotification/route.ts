import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}


// Replace this with your browser FCM token
const FCM_TOKEN = "cjKkyLuzd3k1btAKFipfXk:APA91bF7ubf0EQNrywH2R4x9Tf1zmfsIzs0gB3C1l7QHeAGIcm8d1rb-PVgv4G46L0cC_8quqtRJkF2lDOgf4v-mQ9fhICAfNN6wwlOFe7UrKzMknB9hAVA";

export async function GET() {
  const message = {
    token: FCM_TOKEN,
    notification: {
      title: "☕ Test Notification",
      body: "This is a simple test notification for web!",
    },
    data: { test: "true" }, // optional extra info
  };

  try {
    const response = await admin.messaging().send(message);
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}