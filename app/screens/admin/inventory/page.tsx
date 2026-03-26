"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ClipboardList,
  Clock
} from "lucide-react";
import { get, patch } from "@/lib/api";

type InventoryRequest = {
  id: string;
  user_name: string;
  product_name: string;
  quantity: number;
  unit: string;
  status: string;
 reason: string;
  admin_notes?: string;
  created_at: string;
};

export default function InventoryRequests() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
const [rejectingRequest, setRejectingRequest] = useState<InventoryRequest | null>(null);
const [rejectReason, setRejectReason] = useState("");
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const result = await get(
        `/admin_api/inventory-requests?status=${statusFilter}&search=${searchName}&startDate=${startDate}&endDate=${endDate}`
      );

      if (result.success) {
        setRequests(result.requests || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchName, startDate, endDate]);

  const handleUpdateStatus = async (id: string, newStatus: string, notes?: string) => {
    try {
      const result = await patch("/admin_api/inventory-requests", { id, status: newStatus, notes });
      if (result.success) {
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Approved") return "bg-green-100 text-green-700";
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
            Inventory Requests
          </h1>
          <p className="text-xs text-gray-500">
            Approve or reject inventory requests
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by user name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full bg-gray-100 rounded-lg p-2 outline-none border border-gray-300"
          />

          {/* Date Range */}
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

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
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
        {loading && (
          <p className="text-center text-gray-500">Loading...</p>
        )}

        {!loading && requests.length === 0 && (
          <p className="text-center text-gray-500">
            No inventory requests found
          </p>
        )}

        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-1">
    <p className="font-semibold text-gray-800">
      {req.product_name} {req.quantity}{req.unit}
    </p>

    {/* Status */}
    <span
      className={`text-xs px-3 py-1 rounded-full ${getStatusColor(req.status)}`}
    >
      {req.status}
    </span>
  </div>

  {/* Reason row (only if present) */}
  {req.reason && (
    <p className="text-xs text-gray-500 mt-1">
      Reason: {req.reason}
    </p>
  )}

            <p className="text-sm text-gray-500">
              Requested by: {req.user_name}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Requested at: {new Date(req.created_at).toLocaleString()}
            </p>

            {/* Admin Actions */}
            {req.status === "Pending" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleUpdateStatus(req.id, "Approved")}
                  className="flex-1 bg-[#103c7f] text-white py-1.5 rounded-lg text-sm"
                >
                  Approve
                </button>
                <button
  onClick={() => setRejectingRequest(req)}
  className="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-sm"
>
  Reject
</button>
              </div>
            )}

            {/* Admin Notes */}
            {req.admin_notes && (
              <p className="text-xs text-gray-600 mt-2">
                Admin Notes: {req.admin_notes}
              </p>
            )}
          </div>
          
        ))}
      </div>
  {rejectingRequest && (
  <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-30">
    {/* Modal container */}
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-5 w-[90%] max-w-sm shadow-lg"
      onClick={(e) => e.stopPropagation()} // Prevent closing on background click
    >
      <h2 className="text-lg font-semibold text-[#103c7f] dark:text-white mb-3">
        Reject Request
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Product: {rejectingRequest.product_name} ({rejectingRequest.quantity} {rejectingRequest.unit})
      </p>

      {/* Predefined reasons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {["Out of Stock", "Damaged Item", "Other"].map((reason) => (
          <button
            key={reason}
            onClick={() => setRejectReason(reason)}
            className={`px-3 py-1 text-sm rounded-lg border font-medium ${
              rejectReason === reason
                ? "bg-[#103c7f] text-white border-[#103c7f]"
                : "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            }`}
          >
            {reason}
          </button>
        ))}
      </div>

      {/* Custom reason */}
      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="Enter rejection reason"
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 outline-none text-sm dark:bg-gray-700 dark:text-white"
      />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (!rejectReason.trim()) {
              alert("Please select or enter a reason");
              return;
            }
            handleUpdateStatus(rejectingRequest.id, "Rejected", rejectReason);
            setRejectingRequest(null);
            setRejectReason("");
          }}
          className="flex-1 bg-[#103c7f] text-white py-2 rounded-lg font-medium text-sm shadow-sm hover:bg-blue-800 transition"
        >
          Confirm Reject
        </button>

        <button
          onClick={() => {
            setRejectingRequest(null);
            setRejectReason("");
          }}
          className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}