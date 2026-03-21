"use client";

import { useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
export default function ComplaintPage() {

  const router = useRouter();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const reasons = [
    "Order Delay",
    "Wrong Item",
    "Quality Issue",
    "Staff Behavior",
    "Other"
  ];

const handleSubmit = async () => {
  if (!reason) {
    alert("Please select issue");
    return;
  }

  if (!description) {
    alert("Please enter description");
    return;
  }

  try {
    const result = await post("/complaints", {
      reason,
      description,
      status: "Pending",
    });

    if (result.success) {
      alert("Complaint submitted");
      router.back();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
};

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white border-b">

        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
        >
          <ArrowLeft size={18}/>
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            Report Issue
          </h1>

          <p className="text-xs text-gray-500">
            Tell us what went wrong
          </p>
        </div>

      </div>

      {/* Content */}
      <div className="p-4 space-y-5">

        {/* Issue Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm">

          <div className="flex items-center gap-2 mb-3">

            <AlertCircle size={16} className="text-[#103c7f]" />

            <p className="text-sm font-semibold text-black">
              Select Issue
            </p>

          </div>

          <div className="space-y-2">

            {reasons.map((r, i) => (

              <button
                key={i}
                onClick={() => setReason(r)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm
                ${
                  reason === r
                    ? "border-[#103c7f] bg-[#103c7f]/5"
                    : "border-gray-200 text-black"
                }`}
              >
                {r}
              </button>

            ))}

          </div>

        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm">

          <p className="text-sm font-semibold mb-2 text-black">
            Description
          </p>

          <textarea
            placeholder="Explain your issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-[#103c7f]"
            rows={4}
          />

        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#103c7f] text-white py-3 rounded-xl font-medium shadow-sm"
        >
          Submit Complaint
        </button>

      </div>

    </div>
  );
}