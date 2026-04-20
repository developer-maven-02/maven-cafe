"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Search, X } from "lucide-react";

import { get, remove ,patch} from "@/lib/api";
export default function FoodManagement() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Fetch food items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const result = await get("/admin_api/items");

      if (result.success) {
        const foodItems = result.data;

        setItems(foodItems);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

const toggleAvailability = async (item: any) => {
  try {
    const updatedStatus = !item.is_available;

    const res = await patch(`/admin_api/items/${item.id}`, {
      is_available: updatedStatus,
    });

    if (res.success) {
      setItems((prev: any[]) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, is_available: updatedStatus }
            : i
        )
      );
    }
  } catch (err: any) {
    console.error("Toggle error:", err);
    alert(err?.message || "Failed to update availability");
  }
};
  // ✅ Delete item
  const deleteItem = async (id: string) => {
    const confirmDelete = confirm("Delete this item?");

    if (!confirmDelete) return;

    try {
      const result = await remove(`admin_api/items/${id}`);

      if (result.success) {
        fetchItems();
      } else {
        alert(result.message);
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
            <ArrowLeft size={18}/>
          </button>

          <h1 className="font-semibold text-lg text-[#103c7f]">
            Menu Items
          </h1>
        </div>

        <button
          onClick={() => router.push(`/screens/admin/menu/orders/AddOrders`)}
          className="flex items-center gap-1 bg-[#103c7f] text-white px-3 py-2 rounded-lg text-sm"
        >
          <Plus size={16}/>
          Add
        </button>

      </div>

      {/* Search Bar */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Food List */}
      <div className="p-4 space-y-3">

        {loading ? (
          <p className="text-center text-sm text-gray-500">
            Loading...
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            {searchTerm ? "No items found" : "No food items found"}
          </p>
        ) : (
          filteredItems.map((item) => (
           <div
  key={item.id}
  className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center"
>
  {/* Left */}
  <div>
    <p className="font-medium text-gray-800">{item.name}</p>

    <p className="text-xs mt-1">
      <span
        className={`px-2 py-1 rounded-full ${
          item.is_available
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-500"
        }`}
      >
        {item.is_available ? "Available" : "Unavailable"}
      </span>
    </p>
  </div>

  {/* Right */}
  <div className="flex items-center gap-3">

    {/* 🔥 SWITCH */}
    <div
      onClick={() => toggleAvailability(item)}
      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
        item.is_available ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
          item.is_available ? "translate-x-5" : ""
        }`}
      />
    </div>

    {/* Edit */}
    <button
      onClick={() =>
        router.push(`/screens/admin/menu/orders/AddOrders/${item.id}`)
      }
      className="p-2 bg-gray-100 rounded-lg text-[#103c7f]"
    >
      <Pencil size={14} />
    </button>

    {/* Delete */}
    <button
      onClick={() => deleteItem(item.id)}
      className="p-2 bg-red-500 text-white rounded-lg"
    >
      <Trash2 size={14} />
    </button>

  </div>
</div>
          ))
        )}

      </div>

    </div>
  );
}