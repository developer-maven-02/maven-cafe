"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

import { get, remove } from "@/lib/api";
export default function FoodManagement() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch food items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const result = await get("/admin_api/items");

      if (result.success) {
        const foodItems = result.data.filter(
          (item: any) => item.category === "Food"
        );

        setItems(foodItems);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
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
            className="p-2 bg-gray-100 rounded-full"
          >
            <ArrowLeft size={18}/>
          </button>

          <h1 className="font-semibold text-lg text-[#103c7f]">
            Food
          </h1>
        </div>

        <button
          onClick={() => router.push(`/screens/admin/menu/food/AddFood`)}
          className="flex items-center gap-1 bg-[#103c7f] text-white px-3 py-2 rounded-lg text-sm"
        >
          <Plus size={16}/>
          Add
        </button>

      </div>

      {/* Food List */}
      <div className="p-4 space-y-3">

        {loading ? (
          <p className="text-center text-sm text-gray-500">
            Loading...
          </p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-500">
            No food items found
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center"
            >
              <p className="font-medium text-gray-800">
                {item.name}
              </p>

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    router.push(`/screens/admin/menu/food/AddFood/${item.id}`)
                  }
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm"
                >
                  <Pencil size={14}/>
                  Edit
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                >
                  <Trash2 size={14}/>
                  Delete
                </button>

              </div>
            </div>
          ))
        )}

      </div>

    </div>
  );
}