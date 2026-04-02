"use client";

import {
  ArrowLeft,
  Clock,
  CheckCircle,
  ChefHat,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { get,post } from "@/lib/api";
import Image from "next/image";

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleFavorite = async (order) => {
  try {
    const updated = !order.is_favorite;

    const result = await post("/orders/favorite", {
      order_id: order.id,
      is_favorite: updated,
    });

    if (result.success) {
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id
            ? { ...item, is_favorite: updated }
            : item
        )
      );
    }
  } catch (error) {
    console.log(error);
  }
};

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

  const formatTakenTime = (start, end) => {
    if (!start || !end) return null;

    const diff = Math.floor(
      (new Date(end).getTime() - new Date(start).getTime()) / 1000
    );

    const mins = Math.floor(diff / 60);
    const secs = diff % 60;

    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center justify-between p-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
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

        <div className="w-20 h-8 relative">
          <Image
            src="/logo.png"
            alt="Maven Cafe Logo"
            fill
            className="object-contain"
          />
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
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">

                {/* Top */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-sm">
                      Order #{order.id.slice(0, 6)}
                    </h2>

                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`flex items-center gap-1 text-[11px] px-3 py-1 rounded-full ${status.color}`}
                    >
                      {status.icon}
                      {order.status}
                    </span>

                    {order.start_time && order.end_time && (
                      <p className="text-[10px] text-green-600">
                        ⏱ {formatTakenTime(order.start_time, order.end_time)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3"></div>

                {/* Item */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-medium text-gray-800">
                      {order.item_name}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">

                      {order.temperature && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-[#103c7f]">
                          {order.temperature}
                        </span>
                      )}

                      {order.drink_type && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-[#103c7f]">
                          {order.drink_type}
                        </span>
                      )}

                      {order.sugar !== null &&
                        order.sugar !== undefined && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-[#103c7f]">
                            Sugar {order.sugar}
                          </span>
                        )}

                      <span className="text-[11px] px-2 py-1 rounded-full bg-[#f5f7fa] text-gray-600">
                        Qty {order.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Favorite */}
                  <button
  onClick={(e) => {
    e.preventDefault();
    toggleFavorite(order);
  }}
  className="p-2 rounded-full hover:bg-gray-100 group relative"
>
  <Heart
    size={18}
    className={`${
      order.is_favorite
        ? "fill-red-500 text-red-500"
        : "text-[#103c7f]"
    }`}
  />

  <span
    className="absolute right-0 top-8 opacity-0 group-hover:opacity-100
               bg-[#103c7f] text-white text-xs px-2 py-1 rounded"
  >
    Favorite
  </span>
</button>
                </div>

                {/* Review */}
                {order.status === "Served" && !order.rating && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(
                        `/screens/support/review?id=${order.id}&type=order`
                      );
                    }}
                    className="mt-4 px-4 py-2 text-sm bg-[#103c7f] text-white rounded-lg"
                  >
                    Review Order
                  </button>
                )}

                {/* Existing Review */}
                {order.rating && (
  <div className="mt-4 bg-gray-50 rounded-lg p-3">
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-700">
        Your Review
      </p>

      <p className="text-yellow-500 text-sm">
        {"⭐".repeat(order.rating)}
      </p>
    </div>

    {order.review && (
      <p className="text-sm text-gray-500 mt-2">
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