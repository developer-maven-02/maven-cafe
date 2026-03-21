"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { get } from "@/lib/api";

type ServiceRequest = {
  id: string;
  service: string;
  user_name: string;
  seat: string;
  status: string;
  created_at: string;
  rejected_reason?: string;
  review?: string;
  rating?: number;
};

export default function ServiceRequestsOverview() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const fetchRequests = async () => {
    try {
      const result = await get(
        `/admin_api/service-requests?status=${statusFilter}&search=${searchName}&startDate=${startDate}&endDate=${endDate}`
      );

      if (result.success) {
        setRequests(result.requests || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchName, startDate, endDate]);

  const getStatusColor = (status: string) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Completed") return "bg-green-100 text-green-700";
    if (status === "Rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm z-10">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            Service Requests
          </h1>

          <p className="text-xs text-gray-500">
            View and filter customer requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">

          <input
            type="text"
            placeholder="Search by customer name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
  className="w-full bg-gray-100 rounded-lg p-2 outline-none border border-gray-300"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Start Date</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-100 rounded-lg p-2 outline-none"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">End Date</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-100 rounded-lg p-2 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {["All", "Pending", "Completed", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-[#103c7f] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 pb-4 space-y-3">
        {requests.length === 0 && (
          <p className="text-center text-gray-500">
            No requests found
          </p>
        )}

        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-gray-800">
                Request #{request.id.slice(0, 8)}
              </p>

              <span
                className={`text-xs px-3 py-1 rounded-full ${getStatusColor(request.status)}`}
              >
                {request.status}
              </span>
            </div>

            <p className="text-sm text-gray-700">
              Service: {request.service}
            </p>

            <p className="text-sm text-gray-500">
              Requested by: {request.user_name}
            </p>

            <p className="text-sm text-gray-500">
              Location: {request.seat}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Date: {request.created_at?.split("T")[0]}
            </p>

            {/* Rejected Reason */}
            {request.status === "Rejected" && request.rejected_reason && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium">
                  Rejected Reason:
                </p>
                <p className="text-sm text-red-500">
                  {request.rejected_reason}
                </p>
              </div>
            )}

            {/* Review */}
            {request.review && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">
                  Review:
                </p>
                <p className="text-sm text-green-600">
                  {request.review}
                </p>

                {request.rating && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Rating: ⭐ {request.rating}/5
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}