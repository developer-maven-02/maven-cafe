"use client";

import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Bell,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";

export default function MyServiceRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const result = await get("/customer-service-requests/my");

      if (result.success) {
        setRequests(result.requests);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Accepted") {
      return {
        color: "text-[#103c7f] bg-blue-100",
        icon: <Bell size={14} />,
      };
    }

    if (status === "Completed") {
      return {
        color: "text-green-700 bg-green-100",
        icon: <CheckCircle size={14} />,
      };
    }

    if (status === "Rejected") {
      return {
        color: "text-red-700 bg-red-100",
        icon: <AlertCircle size={14} />,
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
          className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            My Service Requests
          </h1>

          <p className="text-xs text-gray-500">
            Track your service requests
          </p>
        </div>
      </div>

      {/* Requests */}
      <div className="p-4 space-y-4">
        {requests.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No requests yet
          </div>
        )}

        {requests.map((request) => {
          const status = getStatusStyle(request.status);

          return (
            <div
              key={request.id}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800">
                  {request.service}
                </h2>

                <span
                  className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${status.color}`}
                >
                  {status.icon}
                  {request.status}
                </span>
              </div>

              {/* Seat */}
              <p className="text-sm text-gray-600">
                Seat: {request.seat}
              </p>

              {/* Notes */}
              {request.notes && (
                <p className="text-sm text-gray-500 mt-1">
                  {request.notes}
                </p>
              )}

              {/* Time */}
              <p className="text-xs text-gray-500 mt-2">
                Requested at{" "}
                {new Date(request.created_at).toLocaleTimeString()}
              </p>

              {/* Review Button */}
              {request.status === "Completed" && !request.rating && (
  <button
    onClick={() =>
      router.push(`/screens/support/review?id=${request.id}&type=service`)
    }
    className="mt-3 px-4 py-2 text-sm bg-[#103c7f] text-white rounded-lg"
  >
    Review Service
  </button>
)}

{request.rating && (
  <div className="mt-3 bg-gray-50 rounded-lg p-3">
    <p className="text-sm font-medium text-gray-700">
      Your Review
    </p>

    <p className="text-yellow-500 text-sm">
      {"⭐".repeat(request.rating)}
    </p>

    {request.review && (
      <p className="text-sm text-gray-500 mt-1">
        {request.review}
      </p>
    )}
  </div>
)}
            </div>
          );
        })}
      </div>
    </div>
  );
}