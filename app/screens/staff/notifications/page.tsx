"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificationsScreen() {

  const router = useRouter();

  const notifications = [
    {
      id: 1,
      type: "order",
      message: "New Order #1045 received",
      time: "2 min ago"
    },
    {
      id: 2,
      type: "service",
      message: "Water requested at Seat 6",
      time: "5 min ago"
    },
    {
      id: 3,
      type: "ready",
      message: "Order #1042 marked Ready",
      time: "10 min ago"
    }
  ];

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white">

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">

        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>

        <h1 className="text-lg font-semibold text-[#103c7f]">
          Notifications
        </h1>

      </div>


      {/* Notification List */}
      <div className="p-4 space-y-3">

        {notifications.map((note) => (

          <div
            key={note.id}
            className="flex items-start gap-3 bg-gray-100 p-3 rounded-lg"
          >

            <div className="mt-1">
              <Bell size={18} />
            </div>

            <div className="flex-1">

              <p className="text-sm font-medium">
                {note.message}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {note.time}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}