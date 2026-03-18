"use client";

import { ArrowLeft, Clock, CheckCircle, ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const result = await get("/orders/my");

      if (result.success) {
        setOrders(result.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Preparing") {
      return {
        color: "text-[#103c7f] bg-blue-100",
        icon: <ChefHat size={14} />,
      };
    }

    if (status === "Delivered") {
      return {
        color: "text-green-700 bg-green-100",
        icon: <CheckCircle size={14} />,
      };
    }

    return {
      color: "text-gray-600 bg-gray-100",
      icon: <Clock size={14} />,
    };
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            My Orders
          </h1>

          <p className="text-xs text-gray-500">
            Track your active and past orders
          </p>
        </div>
      </div>

      {/* Orders */}
      <div className="p-4 space-y-4">
        {orders.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No orders yet
          </div>
        )}

        {orders.map((order) => {
          const status = getStatusStyle(order.status);

          return (
            <Link
              key={order.id}
              href={`/screens/orders/${order.id}`}
              className="block"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-gray-800">
                    Order #{order.id.slice(0, 6)}
                  </h2>

                  <span
                    className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${status.color}`}
                  >
                    {status.icon}
                    {order.status}
                  </span>
                </div>

                {/* Item */}
                <p className="text-sm text-gray-700">
                  {order.item_name}
                </p>

                <p className="text-sm text-gray-500">
                  Quantity: {order.quantity}
                </p>

                {/* Time */}
                <p className="text-xs text-gray-400 mt-2">
                  Ordered at{" "}
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>

                {/* Review Button */}
                {order.status === "Delivered" && !order.rating && (
  <button
    onClick={(e) => {
      e.preventDefault();
      router.push(`/screens/support/review?id=${order.id}&type=order`);
    }}
    className="mt-3 px-4 py-2 text-sm bg-[#103c7f] text-white rounded-lg"
  >
    Review Order
  </button>
)}

{order.rating && (
  <div className="mt-3 bg-gray-50 rounded-lg p-3">
    <p className="text-sm font-medium text-gray-700">
      Your Review
    </p>

    <p className="text-yellow-500 text-sm">
      {"⭐".repeat(order.rating)}
    </p>

    {order.review && (
      <p className="text-sm text-gray-500 mt-1">
        {order.review}
      </p>
    )}
  </div>
)}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}