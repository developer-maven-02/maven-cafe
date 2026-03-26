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
  notes?: string;
  status: string;
  rejected_reason?: string;
  rating?: number;
  review?: string;
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

      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-[#103c7f]">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-[#103c7f]">Service Requests</h1>
      </div>

      {/* Requests List */}
      <div className="p-4 space-y-4">

        {requests.length === 0 && (
          <p className="text-center text-gray-500 py-6">No service requests</p>
        )}

        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <p className="font-semibold text-[#103c7f] mb-1">{req.service}</p>
            <p className="text-sm text-[#103c7f]">👤 {req.user_name}</p>
            <p className="text-sm font-medium text-[#103c7f]">📍 Seat: {req.seat}</p>
            {req.notes && <p className="text-xs text-gray-500 mt-1">Note: {req.notes}</p>}

            {/* Status */}
            <p
              className={`text-xs mt-1 font-medium ${
                req.status === "Rejected" ? "text-red-600" : "text-yellow-600"
              }`}
            >
              {req.status}
            </p>

            {/* Rejected Reason */}
            {req.status === "Rejected" && req.rejected_reason && (
              <div className="mt-1 bg-red-50 border-l-4 border-red-500 rounded-md p-2">
                <p className="text-xs text-red-600 font-medium">
                  Reason: {req.rejected_reason}
                </p>
              </div>
            )}

            {/* Rating & Review */}
            {(req.rating || req.review) && (
              <div className="mt-2 bg-green-50 border-l-4 border-green-500 rounded-md p-2">
                {req.rating && (
                  <p className="text-xs text-green-700 font-medium">
                    Rating: {renderStars(req.rating)}
                  </p>
                )}
                {req.review && (
                  <p className="text-xs text-green-700">Review: {req.review}</p>
                )}
              </div>
            )}

            {/* View Button */}
            <button
              onClick={() => router.push(`/screens/staff/service-requests/${req.id}`)}
              className="w-full mt-3 bg-[#103c7f] text-white py-2 rounded-lg hover:bg-[#0d2f66] transition"
            >
              View
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}