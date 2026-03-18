"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { get, post, put } from "@/lib/api"; // your axios wrapper

export default function AddService() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("id"); // if editing

  const [serviceName, setServiceName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Sparkles");
  const [loading, setLoading] = useState(false);

  const icons = [
    { name: "Bell", icon: Bell },
    { name: "Droplets", icon: Droplets },
    { name: "Coffee", icon: Coffee },
    { name: "Utensils", icon: Utensils },
    { name: "Flame", icon: Flame },
    { name: "Sparkles", icon: Sparkles },
    { name: "AlertCircle", icon: AlertCircle },
    { name: "Clock", icon: Clock },
    { name: "CupSoda", icon: CupSoda },
    { name: "Soup", icon: Soup },
    { name: "Sandwich", icon: Sandwich },
    { name: "Brush", icon: Brush },
    { name: "Trash2", icon: Trash2 },
    { name: "Hand", icon: Hand },
    { name: "MessageSquare", icon: MessageSquare },
    { name: "CheckCircle", icon: CheckCircle }
  ];

  // ✅ Load service if editing
  useEffect(() => {
    if (serviceId) {
      setLoading(true);
      get(`/admin_api/special-services/${serviceId}`)
        .then((res: any) => {
          if (res.success && res.data) {
            setServiceName(res.data.name);
            setSelectedIcon(res.data.icon || "Sparkles");
          }
        })
        .catch((err) => alert(err.message || err))
        .finally(() => setLoading(false));
    }
  }, [serviceId]);

  // ✅ Save or Update service
  const handleSave = async () => {
    if (!serviceName.trim()) {
      alert("Enter service name");
      return;
    }

    setLoading(true);

    const payload = {
      name: serviceName,
      icon: selectedIcon
    };

    try {
      let res;
      if (serviceId) {
        // update existing
        res = await put(`/admin_api/special-services/${serviceId}`, payload);
      } else {
        // create new
        res = await post(`/admin_api/special-services`, payload);
      }

      if (res.success) {
        alert(res.message || "Service saved successfully");
        router.back();
      } else {
        alert(res.message || "Failed to save");
      }
    } catch (err: any) {
      alert(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white p-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-semibold text-lg">
          {serviceId ? "Edit Service" : "Add Service"}
        </h1>
      </div>

      <div className="p-4 space-y-4">

        {/* Service Name */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Service Name</p>
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Cleaning"
            className="w-full bg-gray-100 p-3 rounded-lg outline-none text-sm"
          />
        </div>

        {/* Icon Picker */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-3">Select Icon</p>
          <div className="grid grid-cols-5 gap-3">
            {icons.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => setSelectedIcon(item.name)}
                  className={`p-3 rounded-lg flex items-center justify-center
                    ${selectedIcon === item.name ? "bg-[#103c7f] text-white" : "bg-gray-100"}`}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#103c7f] text-white py-3 rounded-xl font-semibold"
        >
          {loading ? (serviceId ? "Updating..." : "Saving...") : (serviceId ? "Update Service" : "Save Service")}
        </button>

      </div>
    </div>
  );
}