"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Droplets,
  Coffee,
  Utensils,
  Flame,
  Sparkles,
  AlertCircle,
  Clock,
  CupSoda,
  Soup,
  Sandwich,
  Brush,
  Trash2,
  Hand,
  MessageSquare,
  CheckCircle,
  ArrowLeft
} from "lucide-react";

import { get, remove } from "@/lib/api";

// Icon map
const iconMap: Record<string, any> = {
  Bell,
  Droplets,
  Coffee,
  Utensils,
  Flame,
  Sparkles,
  AlertCircle,
  Clock,
  CupSoda,
  Soup,
  Sandwich,
  Brush,
  Trash2,
  Hand,
  MessageSquare,
  CheckCircle
};

export default function SpecialServices() {
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch services and notes
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await get("/admin_api/special-services");
      setServices(res.data || []);
      // If you have notes API, fetch notes too
      const notesRes = await get("/admin_api/quick-notes");
      setNotes(notesRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await remove(`/admin_api/special-services/${id}`);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await remove(`/admin_api/quick-notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete note");
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white p-4 flex items-center gap-3 shadow-sm text-[#103c7f]">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold ">Special Services</h1>
      </div>

      {/* SERVICES */}
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-[#103c7f]">Services</h2>
          <button
            onClick={() => router.push("/screens/admin/menu/specialService/AddService")}
            className="bg-[#103c7f] text-white px-3 py-1.5 rounded-lg text-sm shadow-sm"
          >
            Add
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {services.map((item) => {
              const Icon = iconMap[item.icon] || Sparkles;
              return (
                <div key={item.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-[#103c7f]">
                      <Icon size={18} />
                    </div>
                    <p className="font-medium text-[#103c7f]">{item.name}</p>
                  </div>

                  <div className="flex gap-2 text-[#103c7f]">
                    <button
                      onClick={() => router.push(`/screens/admin/menu/specialService/AddService/${item.id}`)}
                      className="px-3 py-1 bg-gray-100 rounded-md text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK NOTES */}
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-[#103c7f]">Quick Notes</h2>
          <button
            onClick={() => router.push("/screens/admin/menu/specialService/AddQuickNote")}
            className="bg-[#103c7f] text-white px-3 py-1.5 rounded-lg text-sm shadow-sm"
          >
            Add
          </button>
        </div>

        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl p-4 flex justify-between items-center shadow-md">
              <p className="text-sm text-[#103c7f]">{note.text}</p>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}