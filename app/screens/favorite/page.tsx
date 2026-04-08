"use client";

import { ArrowLeft, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";

interface FavoriteOrder {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  temperature?: string;
  drink_type?: string;
  sugar?: number;
  food_type?: string;
  seat?: string;
  notes?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteOrder[]>([]);
const [quantities, setQuantities] = useState<{ [key: string]: number | string }>({});  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const result = await get("/orders/favorite");

      if (result.success) {
        setFavorites(result.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

 const increaseQty = (id: string) => {
  setQuantities((prev) => ({
    ...prev,
    [id]: Number(prev[id] || 1) + 1,
  }));
};

const decreaseQty = (id: string) => {
  setQuantities((prev) => ({
    ...prev,
    [id]: Math.max(Number(prev[id] || 1) - 1, 1),
  }));
};

  const reorderItem = async (order: FavoriteOrder) => {
    try {
      const result = await post("/orders", {
        item_id: order.item_id,
        quantity: quantities[order.id] || order.quantity || 1,
        temperature: order.temperature,
        drink_type: order.drink_type,
        sugar: order.sugar,
        food_type: order.food_type,
        seat: order.seat,
        notes: order.notes,
      });

      if (result.success) {
        alert("Order placed again");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm z-20">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            Favorites
          </h1>
          <p className="text-xs text-gray-500">
            Your saved drinks
          </p>
        </div>
      </div>

      {/* Favorite List */}
      <div className="p-4 space-y-4">
        {favorites.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No favorites yet
          </div>
        )}

        {favorites.map((order) => (
       <div
  key={order.id}
  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
>
  <div className="flex justify-between items-start">
    <div>
      <p className="text-base font-medium text-gray-800">
        {order.item_name}
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {order.temperature && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-[#103c7f]">
            {order.temperature}
          </span>
        )}

        {order.drink_type && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-[#103c7f]">
            {order.drink_type}
          </span>
        )}

        {order.sugar !== undefined && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-[#103c7f]">
            Sugar {order.sugar}
          </span>
        )}
      </div>
    </div>

    <Heart size={18} className="fill-red-500 text-red-500" />
  </div>

  {/* Quantity Row */}
<div className="flex items-center justify-between mt-4">
  <span className="text-sm text-gray-500 font-medium">Quantity</span>

  <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 px-2 py-1 shadow-sm">
    <button
      onClick={() => decreaseQty(order.id)}
      className="w-7 h-7 flex items-center justify-center rounded-full text-[#103c7f] text-base font-semibold hover:bg-white"
    >
      −
    </button>

    <input
      type="number"
      min="1"
      value={quantities[order.id] ?? order.quantity ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        setQuantities((prev) => ({
          ...prev,
          [order.id]: value,
        }));
      }}
      className="w-10 bg-transparent text-center text-sm font-medium outline-none appearance-none"
    />

    <button
      onClick={() => increaseQty(order.id)}
      className="w-7 h-7 flex items-center justify-center rounded-full text-[#103c7f] text-base font-semibold hover:bg-white"
    >
      +
    </button>
  </div>
</div>

  {/* Order Button */}
  <button
    onClick={() => reorderItem(order)}
    className="mt-4 w-full bg-[#103c7f] text-white py-2 rounded-xl text-sm font-medium"
  >
    Order Again
  </button>
</div>
        ))}
      </div>
    </div>
  );
}