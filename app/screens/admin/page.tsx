"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  CheckCircle,
  Users,
  User,
  Calendar,
  UtensilsCrossed,
  ClipboardList
} from "lucide-react";
import { get } from "@/lib/api";
import Image from "next/image";

export default function AdminDashboard() {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalRequests: 0,
    completedRequests: 0,
      totalMenus: 0,

  totalCategoryAUsers: 0,
  totalCategoryBUsers: 0,
  totalCategoryBMenus: 0,
  totalCategoryAMenus: 0,

  activeUsers: 0,
  inactiveUsers: 0
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
    },
     {
    label: "Menu Items",
    icon: UtensilsCrossed
  },

  // CATEGORY CARD
  {
    label: "A / B Users",
    icon: Users
  },

  // ACTIVE / INACTIVE CARD
  {
    label: "Users Status",
    icon: User
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
    label: "Inventory",
    icon: ClipboardList,
    path: "/screens/admin/inventory",
    color: "bg-emerald-600 text-white"
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
    },   
    {
    label: "Order Schedule",
    icon: Calendar, // calendar icon from lucide-react
    path: "/screens",
      color: "bg-[#103c7f] text-white"
  }

  ];

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
<div className="bg-white p-4 shadow-md flex pl-0 items-center justify-between">  <div className="flex items-center gap-3">
    <div className="w-24 h-10 relative">
      <Image
        src="/logo.png"
        alt="Maven Cafe Logo"
        fill
        className="object-contain"
      />
    </div>
    <div>
      <h1 className="text-xl font-semibold text-[#103c7f]">
        Admin Dashboard
      </h1>

      <p className="text-sm text-gray-500">
        Cafeteria overview
      </p>
    </div>
  </div>

  <button
    onClick={() => router.push("/screens/profile")}
    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm"
  >
    <User size={18} className="text-[#103c7f]" />
  </button>
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

          // MENU ITEMS CARD
if (stat.label === "A / B Users") {
  return (
    <div
      key={i}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 border-b">
        <Icon size={18} className="text-[#103c7f]" />

        <p className="text-sm font-semibold text-gray-700">
        Users Catergory
        </p>
      </div>

      <div className="grid grid-cols-2">
        {/* Active */}
        <div className="p-4 text-center border-r bg-green-50">
          <p className="text-xs text-gray-500">
            A
          </p>

          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {dashboardData.totalCategoryAUsers}
          </h2>
        </div>

        {/* Inactive */}
        <div className="p-4 text-center bg-red-50">
          <p className="text-xs text-gray-500">
            B
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {dashboardData.totalCategoryBUsers}
          </h2>
        </div>
      </div>
    </div>
  );
}

if (stat.label === "Menu Items") {
  return (
    <div
      key={i}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 border-b">
        <Icon size={18} className="text-[#103c7f]" />

        <p className="text-sm font-semibold text-gray-700">
          Menu Items
        </p>
      </div>

      <div className="grid grid-cols-2">
        {/* Active */}
        <div className="p-4 text-center border-r bg-green-50">
          <p className="text-xs text-gray-500">
            A
          </p>

          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {dashboardData.totalCategoryAMenus}
          </h2>
        </div>

        {/* Inactive */}
        <div className="p-4 text-center bg-red-50">
          <p className="text-xs text-gray-500">
            B
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {dashboardData.totalCategoryBMenus}
          </h2>
        </div>
      </div>
    </div>
  );
}

// ACTIVE / INACTIVE CARD
if (stat.label === "Users Status") {
  return (
    <div
      key={i}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3 border-b">
        <Icon size={18} className="text-[#103c7f]" />

        <p className="text-sm font-semibold text-gray-700">
          Users Status
        </p>
      </div>

      <div className="grid grid-cols-2">
        {/* Active */}
        <div className="p-4 text-center border-r bg-green-50">
          <p className="text-xs text-gray-500">
            Active
          </p>

          <h2 className="text-2xl font-bold text-green-700 mt-1">
            {dashboardData.activeUsers}
          </h2>
        </div>

        {/* Inactive */}
        <div className="p-4 text-center bg-red-50">
          <p className="text-xs text-gray-500">
            Inactive
          </p>

          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {dashboardData.inactiveUsers}
          </h2>
        </div>
      </div>
    </div>
  );
}

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