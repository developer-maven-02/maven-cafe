"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get } from "@/lib/api";
import Image from "next/image";

type Order = {
  id: string;
  item_name: string;
  quantity: number;
  user_name: string;
  seat: string;
  notes: string;
  category: string;
  rating?: number;
  review?: string;
  rejected_reason?: string;
  status: string;
};

// Helper function to render stars
const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className="text-yellow-500">
        {i <= rating ? "★" : "☆"}
      </span>
    );
  }
  return stars;
};

export default function IncomingOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await get("/cafe_api/orders");
      if (result.success) {
        setOrders(result.orders ?? []);
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white">

      {/* Header */}
      <div className="flex items-center justify-between p-4 text-[#103c7f]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold text-[#103c7f]">Incoming Orders</h1>
        </div>
        <div className="w-20 h-8 relative">
          <Image
            src="/logo.png"
            alt="Maven Cafe Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">

        {orders.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No incoming orders
          </p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => router.push(`/screens/staff/orders/${order.id}`)}
            className="p-4 bg-gray-100 rounded-lg cursor-pointer"
          >
            <p className="font-semibold text-[#103c7f] mb-1">
              Order #{order.id.slice(0, 6)}
            </p>

            <p className="text-sm text-[#103c7f]">
              {order.item_name} × {order.quantity}
            </p>

            <p className="text-sm text-gray-600">Name: {order.user_name}</p>
            <p className="text-sm text-gray-600">Seat: {order.seat}</p>
            <p className="text-xs text-blue-600">{order.category}</p>
            <p className="text-xs text-yellow-600">{order.status}</p>

            {order.notes && (
              <p className="text-xs text-gray-500">Note: {order.notes}</p>
            )}

            {order.status === "Rejected" && order.rejected_reason && (
              <div className="mt-2 bg-red-50 border-l-4 border-red-500 rounded-md p-2">
                <p className="text-xs text-red-600 font-medium">
                  Rejected Reason: {order.rejected_reason}
                </p>
              </div>
            )}

            {/* Rating & Review with Stars */}
            {(order.rating || order.review) && (
              <div className="mt-2 bg-green-50 border-l-4 border-green-500 rounded-md p-2">
                {order.rating && (
                  <p className="text-xs text-green-700 font-medium">
                    Rating: {renderStars(order.rating)}
                  </p>
                )}
                {order.review && (
                  <p className="text-xs text-green-700">Review: {order.review}</p>
                )}
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}