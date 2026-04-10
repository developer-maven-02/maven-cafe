"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, post } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

export default function CustomComboPage() {
  const params = useParams();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedVIP, setSelectedVIP] = useState("VIP1");
  const [seat, setSeat] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchItems();
    }
  }, [params.id]);

  const fetchItems = async () => {
    try {
      const raw = params.id?.toString() || "";
      const decoded = decodeURIComponent(raw);
      const ids = decoded.split(",");

      const result = await get("/menu/items");

      if (result.success) {
        const selected = result.items.filter((item: any) =>
          ids.includes(item.id.toString())
        );

        setItems(selected);

        const qtyObj: any = {};
        selected.forEach((item: any) => {
          qtyObj[item.id] = 1;
        });
        setQuantities(qtyObj);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const increaseQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  const decreaseQty = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: prev[id] > 1 ? prev[id] - 1 : 1,
    }));
  };

  const placeOrder = async () => {
    try {
      if (!seat) {
        alert("Please enter seat / location");
        return;
      }

      for (let item of items) {
        await post("/orders", {
          item_id: item.id,
          quantity: quantities[item.id] || 1,
          name: selectedVIP, // VIP
          seat: seat, // Seat
        });
      }

      alert("Order placed successfully 🎉");
      router.push("/screens/orders/MyOrders");
    } catch (error) {
      console.log(error);
      alert("Order failed");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading your combo...
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f9fc] pb-24">

      {/* 🔷 Header */}
      <div className="sticky top-0 bg-[#103c7f] text-white p-4 flex items-center gap-3 shadow-md">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-semibold text-lg">Your Combo</h1>
      </div>

      {/* ✅ VIP Select */}
      <div className="p-4">
        <label className="text-sm text-gray-600 mb-1 block">
          Select VIP
        </label>
        <select
          value={selectedVIP}
          onChange={(e) => setSelectedVIP(e.target.value)}
          className="w-full p-2 rounded-lg border bg-white text-sm"
        >
          <option value="VIP1">VIP1</option>
          <option value="VIP2">VIP2</option>
          <option value="VIP3">VIP3</option>
        </select>
      </div>

      {/* ✅ Seat Input */}
      <div className="px-4 pb-2">
        <label className="text-sm text-gray-600 mb-1 block">
          Enter Seat / Location
        </label>
        <input
          type="text"
          value={seat}
          onChange={(e) => setSeat(e.target.value)}
          placeholder="e.g. Table 5"
          className="w-full p-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#103c7f]"
        />
      </div>

      {/* 🔥 Items */}
      <div className="p-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
          >
            <img
              src={item.image || "/placeholder.png"}
              className="w-16 h-16 rounded-xl object-cover"
            />

            <div className="flex-1">
              <p className="font-semibold text-gray-800 text-sm">
                {item.name}
              </p>

              <p className="text-xs text-gray-500 line-clamp-1">
                {item.description}
              </p>

              <p className="text-xs text-green-600 mt-1 font-medium">
                Included in combo
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="w-7 h-7 rounded-lg bg-gray-200 text-sm"
                >
                  -
                </button>

                <span className="text-sm font-medium">
                  {quantities[item.id] || 1}
                </span>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="w-7 h-7 rounded-lg bg-[#103c7f] text-white text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[420px] mx-auto bg-white border-t p-4 shadow-lg">
        <button
          onClick={placeOrder}
          className="w-full bg-[#103c7f] text-white py-3 rounded-xl font-semibold shadow-md"
        >
          Place VIP Order 🚀
        </button>
      </div>
    </div>
  );
}