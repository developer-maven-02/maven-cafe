// sendTestNotification.ts
import admin from "firebase-admin";

// Initialize Firebase admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}




// Replace this with the FCM token you got from your client device
const FCM_TOKEN = "cjKkyLuzd3k1btAKFipfXk:APA91bFPopeT5KQ-egsK1SYd0XG2StocSHTvSYpU5nLtNsaEY6MwN-BTmSDIxODsROJZuq15PPTqbUm7PNfJm6iDklFW4oTJDuRid9V8cNMfOBdutChp3MI";

async function sendTestNotification() {
  const message = {
    token: FCM_TOKEN,
    notification: {
      title: "☕ New Order Alert!",
      body: "You have a new live order in Maven Cafe",
      // icon can be optional
    },
    data: {
      orderId: "12345" // optional extra data
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

sendTestNotification();