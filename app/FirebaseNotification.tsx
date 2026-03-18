"use client";

import { useEffect } from "react";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

export default function FirebaseNotification() {
  useEffect(() => {
    async function init() {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.warn("Firebase Messaging not supported in this browser.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      await navigator.serviceWorker.ready;

      try {
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });
        console.log("FCM Token:", token);
      } catch (err) {
        console.error("Error getting FCM token:", err);
      }

      onMessage(messaging, (payload) => {
        console.log("Foreground message:", payload);
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "Maven Cafe", {
            body: payload.notification?.body || "New message",
            icon: "/favicon.ico",
          });
        }
      });
    }

    init();
  }, []);

  return null;
}