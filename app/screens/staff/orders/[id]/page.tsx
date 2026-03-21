"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get, patch } from "@/lib/api";

type OrderItem = {
  item_name: string;
  quantity: number;
};

type Order = {
  id: string;
  user_name: string;
  seat: string;
  status: string;
  notes?: string;
  rejected_reason?: string;

  items: OrderItem[];
};

export default function OrderStatusScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const steps = ["Pending", "Accepted", "Preparing", "Ready", "Served"];

  const [status, setStatus] = useState<string>("Pending");
  const [showReject, setShowReject] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);

  const rejectReasons = [
    "Item Out of Stock",
    "Kitchen Busy",
    "Item Not Available",
    "Other",
  ];

  const currentIndex = steps.indexOf(status);

  
const fetchOrder = async () => {
  try {
    const result = await get(`/cafe_api/orders/${id}`);
    console.log("check:", result);

    if (result.success) {
      setOrder({
        ...result.order,
        items: [
          {
            item_name: result.order.item_name,
            quantity: result.order.quantity,
          },
        ],
      });

      setStatus(result.order.status);
    }
  } catch (error) {
    console.log(error);
  }
};

  const updateStatus = async (newStatus: string) => {
    try {
      const result = await patch(`/cafe_api/orders/${id}`, {
        status: newStatus,
      });

      if (result.success) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = async () => {
    if (!reason) {
      alert("Select reason");
      return;
    }

    try {
      const result = await patch(`/cafe_api/orders/${id}`, {
        status: "Rejected",
        reject_reason: reason,
      });

      if (result.success) {
        setStatus("Rejected");
        setShowReject(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (!order) return null;

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white">

      <div className="flex items-center gap-3 p-4 text-[#103c7f]">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-semibold text-[#103c7f]">
          Order #{id}
        </h1>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-semibold text-[#103c7f]">{order.user_name}</p>

          <p className="text-xs text-gray-500 mt-1">Location</p>
          <p className="text-2xl font-bold text-[#103c7f]">
            {order.seat}
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <h2 className="font-semibold mb-2 text-[#103c7f]">Items</h2>

        <div className="space-y-2 text-[#103c7f]">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between bg-gray-100 rounded-lg p-3"
            >
              <p>{item.item_name}</p>
              <p>× {item.quantity}</p>
            </div>
          ))}
        </div>
  {order.notes && (
  <div className="mt-4">
    <h2 className="font-semibold mb-2 text-[#103c7f]">Notes</h2>

    <div className="bg-gray-100 rounded-lg p-3 border-l-4 border-[#a1db40]">
      <p className="text-sm text-gray-700">
        {order.notes}
      </p>
    </div>
  </div>
)}
{status === "Rejected" && order.rejected_reason && (
  <div className="mt-4">
    <h2 className="font-semibold mb-2 text-red-600 text-[#103c7f]">
      Rejected Reason
    </h2>

    <div className="bg-gray-100 rounded-lg p-3 border-l-4 border-red-500">
      <p className="text-sm text-gray-700 text-[#103c7f]">
        {order.rejected_reason}
      </p>
    </div>
  </div>
)}
      </div>

      {status !== "Rejected" && (
        <div className="px-4 pb-4">

          <div className="flex justify-between text-xs mb-2">
            {steps.map((step, i) => (
              <span
                key={i}
                className={
                  i <= currentIndex
                    ? "text-[#a1db40] font-semibold"
                    : "text-gray-500 text-[#103c7f]"
                }
              >
                {step}
              </span>
            ))}
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-[#a1db40] h-2 rounded-full"
              style={{
                width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

        </div>
      )}

      <div className="p-4 space-y-3">

        {status === "Pending" && (
          <>
            <button
              onClick={() => updateStatus("Accepted")}
              className="w-full bg-[#103c7f] text-white py-3 rounded-lg"
            >
              Accept Order
            </button>

            <button
              onClick={() => setShowReject(true)}
              className="w-full bg-red-500 text-white py-3 rounded-lg"
            >
              Reject
            </button>
          </>
        )}

        {status === "Accepted" && (
          <button
            onClick={() => updateStatus("Preparing")}
            className="w-full bg-[#a1db40] py-3 rounded-lg"
          >
            Start Preparing
          </button>
        )}

        {status === "Preparing" && (
          <button
            onClick={() => updateStatus("Ready")}
            className="w-full bg-[#a1db40] py-3 rounded-lg"
          >
            Mark Ready
          </button>
        )}

        {status === "Ready" && (
          <button
            onClick={() => updateStatus("Served")}
            className="w-full bg-black text-white py-3 rounded-lg"
          >
            Mark Served
          </button>
        )}

      </div>

      {showReject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-5 rounded-lg w-[90%] max-w-sm">

            <h2 className="font-semibold mb-3 text-[#103c7f]">Reject Reason</h2>

            {rejectReasons.map((r, i) => (
              <label key={i} className="flex items-center gap-2 mb-2 text-[#103c7f]">
                <input
                  type="radio"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
                {r}
              </label>
            ))}

            <div className="flex gap-3 mt-4">

              <button
                onClick={() => setShowReject(false)}
                className="flex-1 bg-gray-200 py-2 rounded-lg text-[#103c7f]"
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

    </div>
  );
}