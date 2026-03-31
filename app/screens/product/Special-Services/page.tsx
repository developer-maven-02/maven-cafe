"use client";

import { useState, useEffect } from "react";
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
  Trash,
  Hand,
  MessageSquare,
  CheckCircle,
  ClipboardList,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import Image from "next/image";

type ServiceItem = {
  id: string;
  name: string;
  icon: keyof typeof iconMap;
};

type QuickNote = {
  id: string;
  text: string;
};

const iconMap = {
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
  Trash,
  Hand,
  MessageSquare,
  CheckCircle,
};

export default function ServiceRequest() {
  const router = useRouter();

const [seat, setSeat] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [service, setService] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const result = await get("/service-config");

      if (result.success) {
        setServices(result.services || []);
        setQuickNotes(result.notes || []);
           setSeat(result.seat || "");

        if (result.services?.length > 0) {
          setService(result.services[0].name);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendRequest = async () => {
    try {
      const result = await post("/customer-service-requests", {
        service,
        seat,
        notes,
        status: "Pending",
      });

      if (result.success) {
        alert("Request sent successfully");
        setNotes("");
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
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50 pb-28">

      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center justify-between p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="font-semibold text-lg text-[#103c7f]">
            Service Request
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-20 h-8 relative">
            <Image
              src="/logo.png"
              alt="Maven Cafe Logo"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={() => router.push("/screens/orders/ServiceOrder")}
            className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
          >
            <ClipboardList size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* Services */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm font-semibold mb-3 text-[#103c7f]">Select Service</p>

          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => {
              const Icon = iconMap[s.icon] || Bell;

              return (
                <button
                  key={s.id}
                  onClick={() => setService(s.name)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition shadow-sm ${
                    service === s.name
                      ? "bg-[#103c7f] text-white"
                      : "bg-gray-100 text-[#103c7f]"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-sm">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seat */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm font-medium mb-2 text-[#103c7f]">Delivery Location</p>

          <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 shadow-inner">
          {seat}
          </div>
        </div>

        {/* Quick Notes */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm font-semibold mb-3 text-[#103c7f]">Quick Notes</p>

          <div className="flex flex-wrap gap-2">
            {quickNotes.map((q) => (
              <button
                key={q.id}
                onClick={() => setNotes(q.text)}
                className="px-3 py-1 bg-gray-100 rounded-full text-xs shadow-sm text-[#103c7f]"
              >
                {q.text}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm font-semibold mb-2 text-[#103c7f]">Additional Notes</p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your request..."
            rows={3}
  className="w-full rounded-lg p-2 text-sm bg-black text-white caret-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#103c7f]"
          />
        </div>

      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center">
        <div className="max-w-[420px] w-full p-4 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.12)] rounded-t-2xl">
          <button
            onClick={sendRequest}
            className="w-full bg-[#a1db40] text-black py-3 rounded-xl font-semibold shadow-md hover:scale-[1.01] transition"
          >
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}