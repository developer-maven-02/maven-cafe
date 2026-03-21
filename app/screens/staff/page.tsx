"use client";

import {
  Bell,
  ClipboardList,
  Wrench,
  CheckCircle,
  XCircle,
  User
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { get } from "@/lib/api";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

type Order = {
  id: string;
  item_name: string;
  user_name: string;
  seat: string;
  status: string;
};

type Service = {
  id: string;
  service: string;
  user_name: string;
  seat: string;
  status: string;
};

export default function StaffDashboard() {
  const router = useRouter();

  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [liveServices, setLiveServices] = useState<Service[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [totalServiceCount, setTotalServiceCount] = useState<number>(0);
  const [cancelledServiceCount, setCancelledServiceCount] = useState<number>(0);

  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playBeep = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => console.log("Sound blocked"));
  };

  const fetchDashboard = async () => {
    try {
      const result = await get("/cafe_api/dashboard");

      if (result.success) {
        setLiveOrders(result.liveOrders || []);
        setLiveServices(result.liveServices || []);
        setCompletedCount(result.completedCount || 0);
        setRejectedCount(result.rejectedCount || 0);
        setTotalServiceCount(result.totalServiceCount || 0);
        setCancelledServiceCount(result.cancelledServiceCount || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Auto beep when pending exists
  useEffect(() => {
    const hasPendingOrders = liveOrders.some((o) => o.status === "Pending");
    const hasPendingServices = liveServices.some((s) => s.status === "Pending");

    if (hasPendingOrders || hasPendingServices) {
      if (!soundIntervalRef.current) {
        soundIntervalRef.current = setInterval(() => {
          playBeep();
        }, 5000);
      }
    } else {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    }

    return () => {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    };
  }, [liveOrders, liveServices]);

  // Firebase + polling
// Firebase + polling
useEffect(() => {
  console.log("🔥 useEffect started");
  
  fetchDashboard();

  const interval = setInterval(() => {
    console.log("🔄 Polling dashboard");
    fetchDashboard();
  }, 50000);

  async function initFirebaseNotifications() {
    console.log("📱 initFirebaseNotifications started");
    
    try {
      const messaging = await getFirebaseMessaging();
      console.log("📱 Firebase messaging:", messaging ? "Available" : "Not available");
      
      if (!messaging) {
        console.error("❌ Firebase messaging not available");
        return;
      }

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.error("❌ Service Worker not supported");
        return;
      }
      console.log("✅ Service Worker supported");

      // Register SW
      try {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("✅ Service Worker registered:", registration);
      } catch (swError) {
        console.error("❌ SW registration failed:", swError);
        return;
      }

      // Wait for ready SW
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker ready:", registration);

      // Request Notification permission
      const permission = await Notification.requestPermission();
      console.log("📱 Notification permission:", permission);
      
      if (permission !== "granted") {
        console.error("❌ Notification permission denied");
        return;
      }

      // Get FCM token
      try {
        console.log("📱 Getting FCM token with VAPID key:", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? "Present" : "Missing");
        
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        
        console.log("📱 FCM Token received:", token ? "Yes (token length: " + token.length + ")" : "No");
        
        if (!token) {
          console.error("❌ No FCM token received");
          return;
        }

        // Save token to server
        console.log("📱 Saving token to server...");
        const saveResponse = await fetch("/api/save-fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: token }),
        });

        console.log("📱 Save response status:", saveResponse.status);
        
        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          console.error("❌ Failed to save token to server:", errorText);
        } else {
          console.log("✅ Token saved to server");
        }
      } catch (tokenError) {
        console.error("❌ Error getting FCM token:", tokenError);
      }

      // Listen for foreground messages
     onMessage(messaging, (payload) => {
  console.log("🔔 Order Notification received:", payload);

  if (payload.notification && Notification.permission === "granted") {
    const title = payload.notification.title || "☕ New Order Received!";
    const body = payload.notification.body || "A new order has arrived";

    try {
      new Notification(title, {
        body,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: "order-" + Date.now(),
        requireInteraction: true,
        silent: false,
      });

      console.log("✅ Order notification shown");
    } catch (error) {
      console.error("❌ Notification error:", error);
    }
  }

  playBeep();       // sound alert 🔊
  fetchDashboard(); // refresh order list 🔄
});
      
      console.log("✅ onMessage listener registered");
      
    } catch (err) {
      console.error("❌ Firebase init error:", err);
    }
  }

  initFirebaseNotifications();

  return () => {
    console.log("🧹 Cleanup: clearing interval");
    clearInterval(interval);
  };
}, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-2rem)]">

        {/* LEFT PANEL */}
        <div className="bg-white rounded-xl p-4 overflow-y-auto">
          <h2 className="text-[#103c7f] text-lg font-semibold mb-4">Live Orders</h2>

          <div className="space-y-3">
            {liveOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/screens/staff/orders/${order.id}`)}
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <p className="font-medium text-[#103c7f]">☕ {order.item_name}</p>
                <p className="text-sm text-gray-600">👤 {order.user_name}</p>
                <p className="text-sm text-gray-500">📍 {order.seat}</p>
                <p className="text-xs text-yellow-600">{order.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="bg-white rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-semibold text-[#103c7f]">
                Staff Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Manage cafeteria orders & services
              </p>
            </div>

            <button onClick={() => router.push("/screens/profile")}>
              <User size={22} className="text-[#103c7f]"/>
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-sm text-[#103c7f] mb-3">Order Summary</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-600" />
                  <p className="text-sm text-gray-600">Completed Orders</p>
                </div>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  {completedCount}
                </p>
              </button>

              <button className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 text-left">
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />
                  <p className="text-sm text-gray-600">Rejected Orders</p>
                </div>
                <p className="text-lg font-semibold text-red-600 mt-1">
                  {rejectedCount}
                </p>
              </button>
            </div>

            {/* Service Summary */}
            <h2 className="text-sm text-[#103c7f] mb-3">Service Summary</h2>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 text-left">
                <div className="flex items-center gap-2">
                  <Wrench size={18} className="text-blue-600" />
                  <p className="text-sm text-gray-600">Total Requests</p>
                </div>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  {totalServiceCount}
                </p>
              </button>

              <button className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 text-left">
                <div className="flex items-center gap-2">
                  <XCircle size={18} className="text-red-600" />
                  <p className="text-sm text-gray-600">Cancelled Requests</p>
                </div>
                <p className="text-lg font-semibold text-red-600 mt-1">
                  {cancelledServiceCount}
                </p>
              </button>
            </div>
          </div>

          {/* View Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push("/screens/staff/orders")}
              className="w-full bg-[#103c7f] text-white p-3 rounded-lg flex justify-between items-center"
            >
              View Orders
              <ClipboardList size={18} />
            </button>

            <button
              onClick={() => router.push("/screens/staff/service-requests")}
              className="w-full bg-[#a1db40] text-black p-3 rounded-lg flex justify-between items-center"
            >
              View Services
              <Wrench size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white rounded-xl p-4 overflow-y-auto">
          <h2 className="text-[#103c7f] text-lg font-semibold mb-4">
            Live Service Requests
          </h2>

          <div className="space-y-3">
            {liveServices.map((service) => (
              <div
                key={service.id}
                onClick={() =>
                  router.push(`/screens/staff/service-requests/${service.id}`)
                }
                className="bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <p className="font-medium text-[#103c7f]">🛠 {service.service}</p>
                <p className="text-sm text-gray-600">👤 {service.user_name}</p>
                <p className="text-sm text-gray-500">📍 {service.seat}</p>
                <p className="text-xs text-yellow-600">{service.status}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}