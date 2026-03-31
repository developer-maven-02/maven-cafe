"use client";

import {
  Bell,
  ClipboardList,
  Wrench,
  CheckCircle,
  XCircle,
  User,  
  LogOut

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
  quantity?: number;
  user_name: string;
  seat: string;
  status: string;
  notes?: string;
  rejected_reason?: string;
    start_time?: string;
  end_time?: string;

};
type Service = {
  id: string;
  service: string;
  user_name: string;
  seat: string;
  start_time?: string;
    end_time?: string;

  status: string;
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

  try {
    const result = await patch(`/cafe_api/orders/${selectedOrderId}`, {
      status: "Rejected",
      reject_reason: finalReason,
    });

    if (result.success) {
      fetchDashboard();
      setShowReject(false);
      setReason("");
      setCustomReason("");
      setSelectedOrderId(null);
    }
  } catch (error) {
    console.log(error);
  }
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

  try {
    const result = await patch(`/cafe_api/service-requests/${selectedServiceId}`, {
      status: "Rejected",
      rejected_reason: finalReason,
    });

    if (result.success) {
      fetchDashboard();
      setShowServiceReject(false);
      setReason("");
      setCustomReason("");
      setSelectedServiceId(null);
    }
  } catch (error) {
    console.log(error);
  }
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-24 h-10 relative">
            <Image
              src="/logo.png"
              alt="Maven Cafe Logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#103c7f]">
              Staff Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Manage orders and requests
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">

        {/* LEFT PANEL */}
        <div className="bg-white rounded-xl p-4 overflow-y-auto">
          <h2 className="text-[#103c7f] text-lg font-semibold mb-4">Live Orders / Requests</h2>

          <div className="space-y-3">
            {liveOrders.map((order) => (
  <div
    key={order.id}
    className="bg-gray-50 p-4 rounded-lg"
  >
<div className="flex justify-between items-center mb-2">
  <p className="font-medium text-[#103c7f]">{order.item_name}</p>

  {order.start_time &&
    ["Accepted", "Preparing", "Ready"].includes(order.status) && (
      <p className="text-xs text-green-600 font-semibold">
        ⏱ {formatRunningTime(order.start_time)}
      </p>
    )}
</div>    <p className="text-sm text-gray-600">👤 {order.user_name}</p>
    <p className="text-sm text-gray-500">📍 {order.seat}</p>
    <p className="text-xs text-yellow-600 mb-2">{order.status}</p>

    {order.notes && (
      <div className="bg-white p-2 rounded text-xs mb-2 text-gray-600">
        📝 {order.notes}
      </div>
    )}

    {order.status === "Pending" && (
      <div className="flex gap-2">
        <button
          onClick={() => updateOrderStatus(order.id, "Accepted")}
          className="flex-1 bg-[#103c7f] text-white py-1 rounded text-sm"
        >
          Accept
        </button>
<button
  onClick={() => {
    setSelectedOrderId(order.id);
    setShowReject(true);
  }}
  className="flex-1 bg-red-500 text-white py-1 rounded text-sm"
>
  Reject
</button>
      </div>
    )}

    {order.status === "Accepted" && (
      <button
        onClick={() => updateOrderStatus(order.id, "Preparing")}
        className="w-full bg-[#a1db40] py-1 rounded text-sm"
      >
        Start Preparing
      </button>
    )}

    {order.status === "Preparing" && (
      <button
        onClick={() => updateOrderStatus(order.id, "Ready")}
        className="w-full bg-[#a1db40] py-1 rounded text-sm"
      >
        Mark Ready
      </button>
    )}

    {order.status === "Ready" && (
      <button
        onClick={() => updateOrderStatus(order.id, "Served")}
        className="w-full bg-black text-white py-1 rounded text-sm"
      >
        Mark Served
      </button>
    )}
  </div>
))}          </div>


  <div className="space-y-3">
  {liveServices.map((service) => (
    <div key={service.id} className="bg-gray-50 p-4 rounded-lg">
      
<div className="flex justify-between items-center mb-2">
  <p className="font-medium text-[#103c7f]">🛠 {service.service}</p>

{service.start_time && ["Processing"].includes(service.status) && (      <p className="text-xs text-green-600 font-semibold">
        ⏱ {formatRunningTime(service.start_time)}
      </p>
    )}
</div> 

      <p className="text-sm text-gray-600">👤 {service.user_name}</p>
      <p className="text-sm text-gray-500">📍 {service.seat}</p>
      <p className="text-xs text-yellow-600 mb-2">{service.status}</p>

      {service.status === "Pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => updateServiceStatus(service.id, "Processing")}
            className="flex-1 bg-[#103c7f] text-white py-1 rounded text-sm"
          >
            Start
          </button>

          <button
            onClick={() => {
              setSelectedServiceId(service.id);
              setShowServiceReject(true);
            }}
            className="flex-1 bg-red-500 text-white py-1 rounded text-sm"
          >
            Reject
          </button>
        </div>
      )}

      {service.status === "Processing" && (
        <button
          onClick={() => updateServiceStatus(service.id, "Completed")}
          className="w-full bg-[#a1db40] py-1 rounded text-sm"
        >
          Mark Completed
        </button>
      )}
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

  <div className="flex items-center gap-4">
    <button
      onClick={() => router.push("/screens/staff/orders")}
      className="p-2 rounded-lg hover:bg-gray-100"
      title="View Orders History"
    >
      <ClipboardList size={20} className="text-[#103c7f]" />
    </button>

    <button
      onClick={() => router.push("/screens/staff/service-requests")}
      className="p-2 rounded-lg hover:bg-gray-100"
      title="View Services History"
    >
      <Wrench size={20} className="text-[#103c7f]" />
    </button>

    <button
      onClick={() => {
        const confirmLogout = window.confirm("Do you want to logout?");
        if (confirmLogout) logout();
      }}
      className="p-2 rounded-lg hover:bg-gray-100"
      title="Logout"
    >
      <LogOut size={20} className="text-[#103c7f]" />
    </button>
  </div>
</div>
          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-sm text-[#103c7f] mb-3">Order Summary Monthly</h2>

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
          {/* <div className="space-y-3">
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
          </div> */}
<div className="mt-6 border-t pt-4">
  <button
    onClick={() => setShowInventoryModal(true)}
    className="w-full bg-[#103c7f] text-white py-2 rounded-lg text-sm hover:opacity-90"
  >
    Add Inventory Request
  </button>

  {/* History */}
  <div className="mt-5">
    <h3 className="text-sm font-semibold text-[#103c7f] mb-3">
      Request History
    </h3>
<div className="space-y-3 max-h-56 overflow-y-auto pr-1">
  {inventoryRequests.map((item) => (
    <div
      key={item.id}
      className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold text-[#103c7f] text-sm">
            {item.product_name}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {item.quantity} {item.unit}
          </p>
        </div>

        <span
          className={`text-[11px] px-3 py-1 rounded-full font-medium ${
            item.status === "Approved"
              ? "bg-green-50 text-green-600"
              : item.status === "Rejected"
              ? "bg-red-50 text-red-500"
              : "bg-yellow-50 text-yellow-600"
          }`}
        >
          {item.status}
        </span>
      </div>

      <div className="bg-gray-50 rounded-md px-3 py-2 text-xs text-gray-600">
        {item.reason}
      </div>

      {item.admin_remark && (
        <div className="mt-2 text-xs text-[#103c7f] bg-blue-50 px-3 py-2 rounded-md">
          Admin: {item.admin_remark}
        </div>
      )}
    </div>
  ))}
</div>
  </div>
</div>
        </div>

        
<div className="bg-white rounded-xl p-4 overflow-y-auto h-full">
  <h2 className="text-[#103c7f] text-lg font-semibold mb-4">
    Product Catalog
  </h2>

<div className="flex flex-col gap-4">
  {/** Group products by category first */}
  {Object.entries(
    products.reduce((acc: Record<string, typeof products>, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {})
  ).map(([category, items]) => (
    <div key={category}>
      {/* Category Header */}
      <h2 className="text-[#103c7f] text-lg font-semibold mb-2">
        {category}
      </h2>

      {/* Items under category */}
      <div className="flex flex-col gap-2">
        {items.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between bg-white rounded-md shadow-sm hover:shadow-md transition p-3 cursor-pointer"
          >
            {/* Left: Image */}
            <div className="flex-shrink-0">
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            </div>

            {/* Middle: Name + Description */}
            <div className="flex-1 px-3">
              <p className="text-base font-semibold text-gray-800 truncate">
                {product.name}
              </p>
              {product.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            {/* Right: Price */}
            <div className="flex-shrink-0 text-right mr-6">
              <p
                className={`text-base font-semibold ${
                  product.price === 0 ? "text-green-600" : "text-gray-900"
                }`}
              >
                {product.price === 0 ? "Free" : `₹ ${product.price.toFixed(2)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div></div>

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

{showInventoryModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-[95%] max-w-md shadow-xl p-5">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[#103c7f] font-semibold text-lg">
          Inventory Request
        </h2>

        <button
          onClick={() => setShowInventoryModal(false)}
          className="text-gray-500"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
       <select
          value={inventoryForm.product_name}
          onChange={(e) =>
            setInventoryForm({
              ...inventoryForm,
              product_name: e.target.value,
            })
          }
          className="w-full border rounded-lg p-2 text-sm bg-white"
        >
          <option value="">Select Inventory Item</option>

          {inventoryOptions.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Quantity"
            value={inventoryForm.quantity}
            onChange={(e) =>
              setInventoryForm({
                ...inventoryForm,
                quantity: e.target.value,
              })
            }
            className="flex-1 border rounded-lg p-2 text-sm"
          />

          <select
  value={inventoryForm.unit}
  onChange={(e) =>
    setInventoryForm({
      ...inventoryForm,
      unit: e.target.value,
    })
  }
  className="flex-1 border rounded-lg p-2 text-sm bg-white"
>
  <option value="">Unit</option>
  <option value="kg">kg</option>
  <option value="litre">litre</option>
  <option value="packet">packet</option>
  <option value="piece">piece</option>
  <option value="gram">gram</option>
</select>
        </div>

        <textarea
          placeholder="Reason"
          value={inventoryForm.reason}
          onChange={(e) =>
            setInventoryForm({
              ...inventoryForm,
              reason: e.target.value,
            })
          }
          className="w-full border rounded-lg p-2 text-sm"
        />

        <button
          onClick={() => {
            submitInventoryRequest();
            setShowInventoryModal(false);
          }}
          className="w-full bg-[#a1db40] py-2 rounded-lg text-sm font-medium"
        >
          Submit Request
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