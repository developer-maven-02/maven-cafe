// public/firebase-messaging-sw.js
// Using Firebase v12.x (matching installed version)

importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");

// Initialize Firebase with your config
firebase.initializeApp({
  apiKey: "AIzaSyCFX-h38XaxTD1agJrWvrAz29wlXrwPBQA",
  authDomain: "maven-cafe-7d2c3.firebaseapp.com",
  projectId: "maven-cafe-7d2c3",
  messagingSenderId: "336010219010",
  appId: "1:336010219010:web:91332a220b35294fc7211b",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "Maven Cafe";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "maven-cafe-notification",
    requireInteraction: true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});