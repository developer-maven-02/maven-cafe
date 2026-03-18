"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Clock, ChefHat } from "lucide-react";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";

export default function OrderDetails({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const result = await get(`/orders/${id}`);

      if (result.success) {
        setOrder(result.order);
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

  if (!order) {
    return (
      <div className="max-w-[420px] mx-auto p-4 text-center">
        Loading...
      </div>
    );
  }

  const status = getStatusStyle(order.status);

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="font-semibold text-lg text-[#103c7f]">
          Order Details
        </h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
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

          <div className="text-sm">
            <p className="text-gray-500">Item</p>
            <p className="font-medium text-gray-800">
              {order.item_name}
            </p>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">Quantity</p>
            <p className="font-medium text-gray-800">
              {order.quantity}
            </p>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">Delivery Location</p>
            <p className="font-medium text-gray-800">
              {order.seat}
            </p>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">Special Instructions</p>
            <p className="font-medium text-gray-800">
              {order.notes || "None"}
            </p>
          </div>

          <div className="text-xs text-gray-400 pt-3 border-t">
            Ordered at {new Date(order.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}