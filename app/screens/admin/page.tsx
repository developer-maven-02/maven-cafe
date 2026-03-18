"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  CheckCircle,
  Users,
  UtensilsCrossed,
  ClipboardList
} from "lucide-react";
import { get } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRequests: 0,
    completedRequests: 0
  });

  const fetchDashboard = async () => {
    try {
      const result = await get(
        `/admin_api/dashboard?startDate=${startDate}&endDate=${endDate}`
      );

      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [startDate, endDate]);

  const stats = [
    {
      label: "Total Orders",
      value: dashboardData.totalOrders,
      icon: ShoppingBag
    },
    {
      label: "Completed Orders",
      value: dashboardData.completedOrders,
      icon: CheckCircle
    },
    {
      label: "Total Requests",
      value: dashboardData.totalRequests,
      icon: Users
    },
    {
      label: "Completed Requests",
      value: dashboardData.completedRequests,
      icon: CheckCircle
    }
  ];

  const actions = [
    {
      label: "Manage Orders",
      icon: ShoppingBag,
      path: "/screens/admin/order",
      color: "bg-[#103c7f] text-white"
    },
    {
    label: "Service Requests",
    icon: ClipboardList,
    path: "/screens/admin/request",
    color: "bg-orange-500 text-white"
  },
    {
      label: "Manage Menu",
      icon: UtensilsCrossed,
      path: "/screens/admin/menu",
      color: "bg-gray-900 text-white"
    },
    {
      label: "Team Members",
      icon: Users,
      path: "/screens/admin/team",
      color: "bg-[#a1db40] text-black"
    }
  ];

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#103c7f]">
          Admin Dashboard
        </h1>

        <p className="text-sm text-gray-500">
          Cafeteria overview
        </p>
      </div>

      {/* Date Filter */}
      <div className="bg-white mx-4 mt-4 p-4 rounded-xl shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          Date Filter
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg px-2 py-2 text-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;

          return (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className="text-[#103c7f]" />

                <span className="text-lg font-semibold text-gray-800">
                  {stat.value}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          Quick Actions
        </h2>

        <div className="space-y-3">
          {actions.map((action, i) => {
            const Icon = action.icon;

            return (
              <button
                key={i}
                onClick={() => router.push(action.path)}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm ${action.color}`}
              >
                <Icon size={18} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}