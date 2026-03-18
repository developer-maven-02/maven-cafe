"use client";

import { initializeApp, getApps } from "firebase/app";
import { isSupported, getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Returns Firebase Messaging instance if supported (browser-only)
 */
export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(firebaseApp);
}