"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
} from "lucide-react";

import { get, remove, patch } from "@/lib/api";

export default function FoodManagement() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const result = await get("/admin_api/items");
      if (result.success) {
        setItems(result.data);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  // ✅ Toggle Team B visibility
  const toggleItemType = async (item: any) => {
    try {
      const updatedValue = !item.item_type;

      const res = await patch(`/admin_api/items/${item.id}`, {
        item_type: updatedValue,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, item_type: updatedValue } : i
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Toggle Availability
  const toggleAvailability = async (item: any) => {
    try {
      const updatedStatus = !item.is_available;

      const res = await patch(`/admin_api/items/${item.id}`, {
        is_available: updatedStatus,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, is_available: updatedStatus }
              : i
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to update");
    }
  };

  // ✅ Delete
  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;

    try {
      const result = await remove(`admin_api/items/${id}`);
      if (result.success) {
        fetchItems();
      }
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

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
            Menu Items
          </h1>
        </div>

        <button
          onClick={() =>
            router.push(`/screens/admin/menu/orders/AddOrders`)
          }
          className="flex items-center gap-1 bg-[#103c7f] text-white px-3 py-2 rounded-lg text-sm"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#103c7f]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="p-4 space-y-4">

        {loading ? (
          <p className="text-center text-sm text-gray-500">
            Loading...
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No items found
          </p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm space-y-3"
            >

              {/* Name */}
              <p className="font-medium text-gray-800">
                {item.name}
              </p>

              {/* Status */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.is_available
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {item.is_available
                    ? "Available"
                    : "Unavailable"}
                </span>

                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.item_type
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {item.item_type
                    ? "Team B Visible"
                    : "Team B Hidden"}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between border-t pt-3">

                {/* Toggles */}
                <div className="flex gap-6">

                  {/* Availability */}
                  <div className="flex flex-col items-center text-[10px] text-gray-500">
                    <span>Available</span>
                    <div
                      onClick={() => toggleAvailability(item)}
                      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${
                        item.is_available
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transform ${
                          item.is_available
                            ? "translate-x-5"
                            : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="flex flex-col items-center text-[10px] text-gray-500">
                    <span>Team B</span>
                    <div
                      onClick={() => toggleItemType(item)}
                      className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${
                        item.item_type
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full transform ${
                          item.item_type
                            ? "translate-x-5"
                            : ""
                        }`}
                      />
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(
                        `/screens/admin/menu/orders/AddOrders/${item.id}`
                      )
                    }
                    className="p-2 bg-gray-100 rounded-lg text-[#103c7f]"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}