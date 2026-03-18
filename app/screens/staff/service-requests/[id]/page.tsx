"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get, patch } from "@/lib/api";

type ServiceRequest = {
  id: string;
  service: string;
  user_name: string;
  seat: string;
  notes: string;
  status: string;
  rejected_reason?: string;
};

export default function ServiceProcessingScreen() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [status, setStatus] = useState("Pending");
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [request, setRequest] = useState<ServiceRequest | null>(null);

  const rejectReasons = [
    "Seat Not Found",
    "Service Unavailable",
    "Already Served",
    "Other",
  ];

  const fetchRequest = async () => {
    try {
      const result = await get(`/cafe_api/service-requests/${id}`);

      if (result.success) {
        setRequest(result.request);
        setStatus(result.request.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const result = await patch(`/cafe_api/service-requests/${id}`, {
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
      const result = await patch(`/cafe_api/service-requests/${id}`, {
        status: "Rejected",
        rejected_reason: reason,
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
    fetchRequest();
  }, []);

  if (!request) return null;

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white">

      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-[#103c7f]">
            Service Request #{id}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">

        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Service</p>
          <p>{request.service}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Customer</p>
          <p>{request.user_name}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Seat</p>
          <p>{request.seat}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Notes</p>
          <p>{request.notes}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <p>Status: {status}</p>
        </div>
        {status === "Rejected" && request.rejected_reason && (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
    <p className="text-sm text-red-600 font-medium">
      Rejected Reason
    </p>
    <p className="text-sm text-red-500 mt-1">
      {request.rejected_reason}
    </p>
  </div>
)}

        {status === "Pending" && (
          <>
            <button
              onClick={() => updateStatus("Processing")}
              className="w-full bg-[#103c7f] text-white py-3 rounded-lg"
            >
              Start Service
            </button>

            <button
              onClick={() => setShowReject(true)}
              className="w-full bg-red-500 text-white py-3 rounded-lg"
            >
              Reject Request
            </button>
          </>
        )}

        {status === "Processing" && (
          <button
            onClick={() => updateStatus("Completed")}
            className="w-full bg-[#a1db40] py-3 rounded-lg"
          >
            Mark Completed
          </button>
        )}

      </div>

      {showReject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-5 rounded-lg w-[90%] max-w-sm">

            <h2 className="font-semibold mb-3">Reject Reason</h2>

            {rejectReasons.map((r, i) => (
              <label key={i} className="flex items-center gap-2 mb-2">
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
                className="flex-1 bg-gray-200 py-2 rounded-lg"
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