
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get } from "@/lib/api";
import Image from "next/image";

type ServiceRequest = {
  id: string;
  user_name: string;
  service: string;
  seat: string;
  notes?: string;
  status: string;
  rejected_reason?: string;
  rating?: number;
  review?: string;
  created_at?: string;
};

export default function ServiceRequests() {
  const router = useRouter();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statusTabs = ["all", "Pending", "In Progress", "Completed", "Rejected"];

  const fetchRequests = useCallback(async () => {
    try {
      let url = "/cafe_api/service-requests";
      const params = new URLSearchParams();

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (selectedUser !== "all") params.append("user", selectedUser);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      if (params.toString()) url += `?${params.toString()}`;

      const result = await get(url);

      if (result.success) {
        const data = result.requests ?? [];
        setRequests(data);

        // ✅ Extract unique users
        const uniqueUsers = Array.from(
          new Set(data.map((item: ServiceRequest) => item.user_name))
        );

        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error("Service fetch error:", error);
    }
  }, [statusFilter, searchTerm, selectedUser, startDate, endDate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const sortedRequests = [...requests].sort(
    (a, b) =>
      new Date(b.created_at || "").getTime() -
      new Date(a.created_at || "").getTime()
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#103c7f] text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Service Requests</h1>
        </div>

        <div className="w-20 h-8 relative">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
      </div>

      {/* FILTERS */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        {/* STATUS */}
        <div className="flex gap-2 flex-wrap mb-4">
          {statusTabs.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm ${
                statusFilter === status
                  ? "bg-[#103c7f] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* FILTER ROW */}
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
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All Users</option>
            {users.map((user) => (
              <option key={user} value={user}>
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
            onClick={fetchRequests}
            className="bg-[#103c7f] text-white px-4 py-2 rounded-lg text-sm"
          >
            Apply
          </button>

          <button
            onClick={() => {
              setStatusFilter("all");
              setSearchTerm("");
              setSelectedUser("all");
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f1f5f9] text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Seat</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sortedRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No service requests
                  </td>
                </tr>
              )}

              {sortedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">
                    #{req.id.slice(0, 6)}
                  </td>

                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {req.service}
                    {req.notes && (
                      <div className="text-xs text-gray-500">{req.notes}</div>
                    )}
                  </td>

                  <td className="px-4 py-3">{req.user_name}</td>
                  <td className="px-4 py-3">{req.seat}</td>

                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {req.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {req.created_at
                      ? new Date(req.created_at).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        router.push(`/screens/staff/service-requests/${req.id}`)
                      }
                      className="bg-[#103c7f] text-white px-3 py-1 rounded-lg text-xs"
                    >
                      View
                    </button>
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