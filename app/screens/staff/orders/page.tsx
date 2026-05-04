"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get } from "@/lib/api";
import Image from "next/image";

type Order = {
  id: string;
  item_name: string;
  quantity: number;
  user_name: string;
  seat: string;
  notes: string;
  category: string;
  status: string;
  created_at?: string;
};

export default function IncomingOrders() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statusTabs = [
    "all",
    "Pending",
    "Preparing",
    "Ready",
    "Served",
    "Rejected",
  ];

  // ✅ FETCH ORDERS
  const fetchOrders = useCallback(async () => {
    try {
      let url = "/cafe_api/orders";
      const params = new URLSearchParams();

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (selectedUser) params.append("user", selectedUser);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      if (params.toString()) url += `?${params.toString()}`;

      const result = await get(url);
      if (result.success) {
        setOrders(result.orders ?? []);
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
    }
  }, [statusFilter, searchTerm, selectedUser, startDate, endDate]);

  // ✅ FETCH USERS
  const fetchUsers = useCallback(async () => {
    try {
      const result = await get("/cafe_api/orders/users");
      if (result.success) {
        setUsers(result.users ?? []);
      }
    } catch (error) {
      console.error("Users fetch error:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, [fetchOrders, fetchUsers]);

  // ✅ SORT
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.created_at || "").getTime() -
      new Date(a.created_at || "").getTime()
  );

const formatIST = (utcDate: string | Date): string => {
  const date = new Date(utcDate);

  const istTime = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  return istTime.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#103c7f] text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Incoming Orders</h1>
        </div>

        <div className="w-20 h-8 relative">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
      </div>

      {/* FILTERS */}
      <div className="px-6 py-4 bg-white">

        {/* STATUS */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                statusFilter === status
                  ? "bg-[#103c7f] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* FILTER INPUTS */}
        <div className="flex flex-wrap gap-3 items-center">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48"
          />

          {/* USER FILTER */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Users</option>
            {users.map((user, i) => (
              <option key={i} value={user}>
                {user}
              </option>
            ))}
          </select>

          {/* DATE RANGE */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />

       
          {/* <button
            onClick={fetchOrders}
            className="bg-[#103c7f] text-white px-4 py-2 rounded-lg text-sm"
          >
            Apply
          </button>

         
          <button
            onClick={() => {
              setStatusFilter("all");
              setSearchTerm("");
              setSelectedUser("");
              setStartDate("");
              setEndDate("");
            }}
            className="text-sm text-gray-500"
          >
            Clear
          </button> */}
        </div>
      </div>

      {/* TABLE */}
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">

            <thead className="bg-[#f1f5f9] text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Seat</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sortedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}

              {sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() =>
                    router.push(`/screens/staff/orders/${order.id}`)
                  }
                  className="cursor-pointer hover:bg-[#f9fafb] transition"
                >
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">
                    #{order.id.slice(0, 6)}
                  </td>

                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {order.item_name} × {order.quantity}
                    {order.notes && (
                      <div className="text-xs text-gray-500">
                        {order.notes}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">{order.user_name}</td>
                  <td className="px-4 py-3">{order.seat}</td>

                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {order.category}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {order.status}
                    </span>
                  </td>

                 <td className="px-4 py-3 text-xs text-gray-500">
  {order.created_at ? formatIST(order.created_at) : "-"}
</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}