"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { post } from "@/lib/api"; // make sure your API helper is imported

export default function AddQuickNote() {

  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const saveNote = async () => {
    if (!note.trim()) {
      alert("Enter quick note");
      return;
    }

    setLoading(true);
    try {
      const res = await post("/admin_api/quick-notes", { text: note });

      if (res.success) {
        alert("Quick Note Added");
        router.back(); // go back to the list
      } else {
        alert(res.message || "Failed to add note");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Server error");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white p-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18}/>
        </button>
        <h1 className="font-semibold">Add Quick Note</h1>
      </div>

      <div className="p-4 space-y-4">

        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm mb-2">Quick Note</p>
          <input
            type="text"
            placeholder="Enter quick note"
            value={note}
            onChange={(e)=>setNote(e.target.value)}
            className="w-full bg-gray-100 rounded-lg p-3 text-sm outline-none"
          />
        </div>

        <button
          onClick={saveNote}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white ${loading ? "bg-gray-400" : "bg-[#103c7f]"}`}
        >
          {loading ? "Saving..." : "Save Note"}
        </button>

      </div>
    </div>
  );
}