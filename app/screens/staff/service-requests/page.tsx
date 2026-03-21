"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get } from "@/lib/api";

type ServiceRequest = {
  id: string;
  user_name: string;
  service: string;
  seat: string;
  status: string;
  rejected_reason: string;
};

export default function ServiceRequests() {
  const router = useRouter();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const fetchRequests = useCallback(async () => {
    try {
      const result = await get("/cafe_api/service-requests");

      if (result.success) {
        setRequests(result.requests ?? []);
      }
    } catch (error) {
      console.error("Service fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white">

      <div className="flex items-center gap-3 p-4 text-[#103c7f]">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-semibold text-[#103c7f]">
          Service Requests
        </h1>
      </div>

      <div className="p-4 space-y-4">

        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-gray-100 p-4 rounded-lg"
          >
            <p className="font-semibold text-[#103c7f]">
              {req.service}
            </p>

            <p className="text-sm text-[#103c7f]">
              👤 {req.user_name}
            </p>

            <p className="text-lg font-bold text-[#103c7f]">
              📍 {req.seat}
            </p>

            <p className="text-xs text-yellow-600 mt-1">
              {req.status}
            </p>
            {req.status === "Rejected" && req.rejected_reason && (
  <p className="text-xs text-red-600 mt-1">
    Reason: {req.rejected_reason}
  </p>
)}

            <button
              onClick={() =>
                router.push(`/screens/staff/service-requests/${req.id}`)
              }
              className="w-full mt-3 bg-[#103c7f] text-white py-2 rounded-lg"
            >
              View
            </button>
          </div>
        ))}

        {requests.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No service requests
          </p>
        )}

      </div>

    </div>
  );
}