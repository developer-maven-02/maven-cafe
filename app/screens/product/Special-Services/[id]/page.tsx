"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { get, post } from "@/lib/api";

type QuickNote = {
  id: string;
  text: string;
};

export default function ServiceDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [service, setService] = useState("");
  const [seat, setSeat] = useState("");
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const serviceName = searchParams.get("name");

    if (serviceName) {
      setService(serviceName);
    }

    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const result = await get("/service-config");

      if (result.success) {
        setQuickNotes(result.notes || []);
        setSeat(result.seat || "");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendRequest = async () => {
    if (!service) {
      alert("Service not found");
      return;
    }

    setLoading(true);

    try {
      const result = await post("/customer-service-requests", {
        service,
        seat,
        notes,
        status: "Pending",
      });

      if (result.success) {
        alert("Request sent successfully");
        router.back();
      } else {
        alert(result.message || "Failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50 pb-28">

      {/* Header */}
      <div className="sticky top-0 bg-white p-4 shadow-sm flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>

        <h2 className="font-semibold text-[#103c7f] text-lg">
          {service}
        </h2>
      </div>

      <div className="p-4 space-y-4">

        {/* Seat */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-[#103c7f] mb-2">
            Delivery Location
          </p>

          <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
            {seat}
          </div>
        </div>

        {/* Quick Notes */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-[#103c7f] mb-3">
            Quick Notes
          </p>

          <div className="flex flex-wrap gap-2">
            {quickNotes.map((q) => (
              <button
                key={q.id}
                onClick={() => setNotes(q.text)}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs text-[#103c7f]"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm font-medium text-[#103c7f] mb-2">
            Additional Notes
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Write your request..."
            className="w-full rounded-xl p-3 bg-gray-100 text-sm outline-none resize-none"
          />
        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center">
        <div className="max-w-[420px] w-full p-4 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.1)] rounded-t-2xl">
          <button
            onClick={sendRequest}
            disabled={loading}
            className="w-full bg-[#a1db40] py-3 rounded-xl font-semibold text-black"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}