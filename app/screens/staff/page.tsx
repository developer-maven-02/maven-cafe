"use client";

import {
  Bell,
  ClipboardList,
  Wrench,
  CheckCircle,
  XCircle,
  User, 
  Package, 
  LogOut,
 Utensils  
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { get, post, patch } from "@/lib/api";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import Image from "next/image";

type Order = {
  id: string;
  item_name: string;
  item_image: string;
  quantity?: number;
  user_name: string;
  seat: string;
  status: string;
  notes?: string;
  rejected_reason?: string;
  start_time?: string;
  end_time?: string;
  drink_type?: string;
    category?: string;

  created_at?: string;

};
type Service = {
  id: string;
  service: string;
  user_name: string;
  seat: string;
  start_time?: string;
    end_time?: string;

  status: string;
    created_at?: string;

};



export default function StaffDashboard() {
  const router = useRouter();


  const inventoryOptions = [
  "Sugar",
  "Milk",
  "Bread",
  "Oil",
  "Atta",
  "Rice",
  "Tea Powder",
  "Coffee Powder",
  "Butter",
  "Eggs",
  "Salt",
  "Paneer",
  "Vegetables",
];

  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [liveServices, setLiveServices] = useState<Service[]>([]);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [rejectedCount, setRejectedCount] = useState<number>(0);
  const [totalServiceCount, setTotalServiceCount] = useState<number>(0);
  const [cancelledServiceCount, setCancelledServiceCount] = useState<number>(0);
const [showReject, setShowReject] = useState(false);
const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
const [reason, setReason] = useState("");
const [customReason, setCustomReason] = useState("");
const [showInventoryModal, setShowInventoryModal] = useState(false);
const [showServiceReject, setShowServiceReject] = useState(false);
const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
const [currentTime, setCurrentTime] = useState(Date.now());
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);
type Product = {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

const [products, setProducts] = useState<Product[]>([]);
const [showInventoryForm, setShowInventoryForm] = useState(false);

const [inventoryForm, setInventoryForm] = useState({
  product_name: "",
  quantity: "",
  unit: "",
  reason: "",
});

const [inventoryRequests, setInventoryRequests] = useState<any[]>([]);
const fetchInventoryRequests = async () => {
  try {
    const result = await get("cafe_api/inventory_requests/my");

    if (result.success) {
      setInventoryRequests(result.data || []);
    }
  } catch (error) {
    console.log(error);
  }
};

const submitInventoryRequest = async () => {
  try {
    const result = await post("cafe_api/inventory_requests", inventoryForm);

    if (result.success) {
      fetchInventoryRequests();

      setInventoryForm({
        product_name: "",
        quantity: "",
        unit: "",
        reason: "",
      });

      setShowInventoryForm(false);
    }
  } catch (error) {
    console.log(error);
  }
};

const playBeep = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => console.log("Sound blocked"));
  };

  const fetchDashboard = async () => {
    try {
      const result = await get("/cafe_api/dashboard");
       console.log('check:',result.liveServices)
      if (result.success) {
setLiveOrders((prev) => {
  const incoming = result.liveOrders || [];

  const merged = [
    ...incoming.filter(
      (n: Order) => !prev.some((oldOrder) => oldOrder.id === n.id)
    ),
    ...prev.map((oldOrder) => {
      const updated = incoming.find((n: Order) => n.id === oldOrder.id);
      return updated || oldOrder;
    }),
  ];

  return merged.sort(
    (a, b) =>
      new Date(b.created_at || "").getTime() -
      new Date(a.created_at || "").getTime()
  );
});
setLiveServices((prev) => {
  const incoming = result.liveServices || [];

  const merged = [
    ...incoming.filter(
      (n: Service) => !prev.some((oldService) => oldService.id === n.id)
    ),
    ...prev.map((oldService) => {
      const updated = incoming.find((n: Service) => n.id === oldService.id);
      return updated || oldService;
    }),
  ];

  return merged.sort(
    (a, b) =>
      new Date(b.created_at || "").getTime() -
      new Date(a.created_at || "").getTime()
  );
});
        setCompletedCount(result.completedCount || 0);
        setRejectedCount(result.rejectedCount || 0);
        setTotalServiceCount(result.totalServiceCount || 0);
        setCancelledServiceCount(result.cancelledServiceCount || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(Date.now());
  }, 1000);

  return () => clearInterval(timer);
}, []);

  const rejectReasons = [
  "Item Out of Stock",
  "Kitchen Busy",
  "Item Not Available",
  "Other",
];

const fetchProducts = async () => {
  try {
    const result = await get("/menu/items");

    if (result.success) {
      setProducts(result.items || []);
    }
  } catch (err) {
    console.error("Error fetching products:", err);
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
const logout = async () => {
    await post("/auth/logout", {});
    router.push("/");
  };
  // Firebase + polling
// Firebase + polling
useEffect(() => {
  console.log("🔥 useEffect started");
  
  fetchDashboard();
  fetchProducts(); // <-- fetch products for right panel
  fetchInventoryRequests();
  const interval = setInterval(() => {
    console.log("🔄 Polling dashboard");
    fetchDashboard();
      fetchProducts(); // <-- fetch products for right panel
      fetchInventoryRequests();

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

const updateOrderStatus = async (
  id: string,
  newStatus: string,
  reject_reason?: string
) => {

  console.log(id, newStatus, reject_reason);
  try {
     const payload: any = {
      status: newStatus,
      reject_reason,
    };

    // when accepted → save start_time
    if (newStatus === "Accepted") {
      payload.start_time = new Date().toISOString();
    }

    // when served → save end_time
    if (newStatus === "Served") {
      payload.end_time = new Date().toISOString();
    }

    const result = await patch(`/cafe_api/orders/${id}`, payload);

   if (result.success) {
  if (newStatus === "Served"|| newStatus === "Rejected") {
    setLiveOrders((prev) => prev.filter((o) => o.id !== id));
  } else {
    setLiveOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: newStatus, ...payload } : o
      )
    );
  }

  fetchDashboard();
}
  } catch (error) {
    console.log(error);
  }
};

const handleReject = async () => {
  const finalReason = reason === "Other" ? customReason : reason;

  if (!finalReason || !selectedOrderId) {
    alert("Select reason");
    return;
  }

  await updateOrderStatus(selectedOrderId, "Rejected", finalReason);

  setShowReject(false);
  setReason("");
  setCustomReason("");
  setSelectedOrderId(null);
};

const updateServiceStatus = async (
  id: string,
  newStatus: string,
  rejected_reason?: string
) => {
  try {
    const payload: any = {
      status: newStatus,
      rejected_reason,
    };

    // when started → save start_time
    if (newStatus === "Processing") {
      payload.start_time = new Date().toISOString();
    }

    // when completed → save end_time
    if (newStatus === "Completed") {
      payload.end_time = new Date().toISOString();
    }

    const result = await patch(`/cafe_api/service-requests/${id}`, payload);

    if (result.success) {
      if (newStatus === "Completed" || newStatus === "Rejected") {
        setLiveServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        setLiveServices((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: newStatus, ...payload } : s
          )
        );
      }

      fetchDashboard();
    }
  } catch (error) {
    console.log(error);
  }
};
const handleServiceReject = async () => {
  const finalReason = reason === "Other" ? customReason : reason;

  if (!finalReason || !selectedServiceId) {
    alert("Select reason");
    return;
  }

  await updateServiceStatus(selectedServiceId, "Rejected", finalReason);

  setShowServiceReject(false);
  setReason("");
  setCustomReason("");
  setSelectedServiceId(null);
};

const formatRunningTime = (startTime?: string) => {
  if (!startTime) return "0m 0s";

  const start = new Date(startTime);

  // subtract 5h 30m
  const adjustedStart = new Date(start.getTime() + 330 * 60 * 1000);

  const now = new Date();

  const diff = Math.floor(
    (now.getTime() - adjustedStart.getTime()) / 1000
  );

  const safeDiff = diff < 0 ? 0 : diff;

  const mins = Math.floor(safeDiff / 60);
  const secs = safeDiff % 60;

  return `${mins}m ${secs}s`;
};
 return (
  <div className="h-screen overflow-hidden bg-gray-50 flex flex-col p-4">

    {/* Header */}
    <div className="bg-white rounded-xl px-4 py-2 mb-3 shadow-sm flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-20 h-8 relative">
      <Image
        src="/logo.png"
        alt="Maven Cafe Logo"
        fill
        className="object-contain"
      />
    </div>

    <div>
      <h1 className="text-lg font-semibold text-[#103c7f] leading-tight">
        Staff Dashboard
      </h1>
      <p className="text-xs text-gray-500 leading-tight">
        Live orders & requests
      </p>
    </div>
  </div>

  <div className="flex items-center gap-2">
     <button
    onClick={() => router.push("/screens/staff/items")}
    className="p-1.5 rounded-lg hover:bg-gray-100"
    title="Menu Items"
  >
    <Utensils size={18} className="text-[#103c7f]" />
  </button>
    <button
      onClick={() => router.push("/screens/staff/orders")}
      className="p-1.5 rounded-lg hover:bg-gray-100"
       title="Orders"
    >
      <ClipboardList size={18} className="text-[#103c7f]" />
    </button>

    <button
      onClick={() => router.push("/screens/staff/service-requests")}
      className="p-1.5 rounded-lg hover:bg-gray-100"
      title="Services"
    >
      <Wrench size={18} className="text-[#103c7f]" />
    </button>

    <button
      onClick={() => router.push("/screens/staff/inventory")}
      className="p-1.5 rounded-lg hover:bg-gray-100"
      title="inventory"
    >
      <Package size={18} className="text-[#103c7f]" />
    </button>

    <button
      onClick={logout}
      className="p-1.5 rounded-lg hover:bg-gray-100"
    >
      <LogOut size={18} className="text-red-500" />
    </button>
  </div>
</div>

   

    {/* Summary Cards */}
{/* Monthly Summary Section */}
<div className="mb-3">
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-lg font-semibold text-[#103c7f]">
      📊 Monthly Summary
    </h2>
    <p className="text-xs text-gray-500">
      Overview this month
    </p>
  </div>

  <div className="grid grid-cols-4 gap-3">
    {/* Completed */}
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle size={16} className="text-green-600" />
        <p className="text-xs text-gray-600 font-medium">Completed</p>
      </div>
      <p className="text-xl font-bold text-green-600 mt-1">{completedCount}</p>
    </div>

    {/* Rejected */}
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <XCircle size={16} className="text-red-600" />
        <p className="text-xs text-gray-600 font-medium">Rejected</p>
      </div>
      <p className="text-xl font-bold text-red-600 mt-1">{rejectedCount}</p>
    </div>

    {/* Requests */}
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Wrench size={16} className="text-blue-600" />
        <p className="text-xs text-gray-600 font-medium">Requests</p>
      </div>
      <p className="text-xl font-bold text-blue-600 mt-1">{totalServiceCount}</p>
    </div>

    {/* Cancelled */}
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <XCircle size={16} className="text-orange-500" />
        <p className="text-xs text-gray-600 font-medium">Cancelled</p>
      </div>
      <p className="text-xl font-bold text-orange-500 mt-1">{cancelledServiceCount}</p>
    </div>
  </div>
</div>

    {/* Live Orders Section */}
{/* Live Orders + Services (50% / 50%) */}
<div className="grid grid-rows-2 gap-4 flex-1 min-h-0 overflow-hidden">  {/* Orders - Top 50% */}
  <div className="flex-1 bg-white rounded-xl p-2 shadow-sm overflow-hidden flex flex-col min-h-0">
    

    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr className="text-left text-gray-600">
            <th className="p-3">Image</th>
            <th className="p-3">Item</th>
            <th className="p-3">Qty</th>
            <th className="p-3">User</th>
            <th className="p-3">Seat</th>
            <th className="p-3">Status</th>
            <th className="p-3">Timer</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
{liveOrders
  .filter((order) => order.status !== "Served" && order.status !== "Rejected")
  .map((order) => (            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                {order.item_image && (
                  <img
                    src={order.item_image}
                    alt={order.item_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
              </td>

              <td className="p-3">
                <p className="font-medium text-[#103c7f]">{order.item_name}</p>
                {order.notes && (
                  <p className="text-xs text-gray-400">📝 {order.notes}</p>
                )}
              </td>

            <td className="p-3 text-black">x{order.quantity || 1}</td>
              <td className="p-3 text-black">{order.user_name}</td>
              <td className="p-3 text-black">{order.seat}</td>
              <td className="p-3 text-black">{order.status}</td>

              <td className="p-3 text-green-600">
                {order.start_time &&
                ["Accepted", "Preparing", "Ready"].includes(order.status)
                  ? formatRunningTime(order.start_time)
                  : "-"}
              </td>

              <td className="p-3">
                {order.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(order.id, "Accepted")}
                      className="bg-[#103c7f] text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setShowReject(true);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {order.status === "Accepted" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "Preparing")}
                    className="bg-[#a1db40] px-3 py-1 rounded-lg text-xs"
                  >
                    Start
                  </button>
                )}

                {order.status === "Preparing" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "Ready")}
                    className="bg-[#a1db40] px-3 py-1 rounded-lg text-xs"
                  >
                    Ready
                  </button>
                )}

                {order.status === "Ready" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "Served")}
                    className="bg-black text-white px-3 py-1 rounded-lg text-xs"
                  >
                    Served
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Services - Bottom 50% */}
  <div className="flex-1 bg-white rounded-xl p-2 shadow-sm overflow-hidden flex flex-col min-h-0">
   

    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-100 z-10">
          <tr className="text-left text-gray-600">
            <th className="p-3">Service</th>
            <th className="p-3">User</th>
            <th className="p-3">Seat</th>
            <th className="p-3">Status</th>
            <th className="p-3">Timer</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
{liveServices
  .filter(
    (service) =>
      service.status !== "Completed" &&
      service.status !== "Rejected" &&
      service.status !== "Cancelled"
  )
  .map((service) => (            <tr key={service.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium text-[#103c7f]">
                🛠 {service.service}
              </td>

              <td className="p-3">{service.user_name}</td>
              <td className="p-3">{service.seat}</td>
              <td className="p-3">{service.status}</td>

              <td className="p-3 text-green-600">
                {service.start_time && service.status === "Processing"
                  ? formatRunningTime(service.start_time)
                  : "-"}
              </td>

              <td className="p-3">
                {service.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        updateServiceStatus(service.id, "Processing")
                      }
                      className="bg-[#103c7f] text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Start
                    </button>

                    <button
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setShowServiceReject(true);
                      }}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {service.status === "Processing" && (
                  <button
                    onClick={() =>
                      updateServiceStatus(service.id, "Completed")
                    }
                    className="bg-[#a1db40] px-3 py-1 rounded-lg text-xs"
                  >
                    Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

</div>
              {showReject && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-xl w-[90%] max-w-sm shadow-lg">
      <h2 className="text-[#103c7f] font-semibold mb-3">Reject Reason</h2>

      {rejectReasons.map((r, i) => (
        <label
          key={i}
          className={`flex items-center gap-2 mb-2 p-2 rounded cursor-pointer ${
            reason === r ? "bg-red-50" : ""
          }`}
        >
          <input
            type="radio"
            checked={reason === r}
            onChange={() => setReason(r)}
          />
          {r}
        </label>
      ))}

      {reason === "Other" && (
        <input
          type="text"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Enter custom reason"
          className="w-full mt-3 border rounded-lg p-2 text-sm"
        />
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            setShowReject(false);
            setReason("");
            setCustomReason("");
          }}
          className="flex-1 bg-gray-200 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleReject}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

        {showServiceReject && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-xl w-[90%] max-w-sm shadow-lg">
      <h2 className="text-[#103c7f] font-semibold mb-3">Reject Service Reason</h2>

      {[
        "Seat Not Found",
        "Service Unavailable",
        "Already Served",
        "Other",
      ].map((r, i) => (
        <label key={i} className="flex items-center gap-2 mb-2">
          <input
            type="radio"
            checked={reason === r}
            onChange={() => setReason(r)}
          />
          {r}
        </label>
      ))}

      {reason === "Other" && (
        <input
          type="text"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          className="w-full mt-3 border rounded-lg p-2"
        />
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => setShowServiceReject(false)}
          className="flex-1 bg-gray-200 py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleServiceReject}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
  </div>
);
}