"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { get, post } from "@/lib/api";

export default function ComboPage() {
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [comboItems, setComboItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [comboName, setComboName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showNameStep, setShowNameStep] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const result = await get("/menu/items");

      if (result?.success) {
        const filtered = result.items.filter(
          (item: any) =>
            item.category === "Food" || item.category === "Beverage"
        );

        setItems(filtered);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComboItem = (item: any) => {
    setComboItems((prev) => {
      const exists = prev.find((p) => p.id === item.id);

      if (exists) {
        return prev.filter((p) => p.id !== item.id);
      }

      return [...prev, item];
    });
  };

  const comboTotal = useMemo(() => {
    return comboItems.reduce(
      (sum, item) => sum + Number(item.price),
      0
    );
  }, [comboItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const saveCombo = async () => {
    if (!comboName.trim()) {
      alert("Enter combo name");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: comboName,
        item_ids: comboItems.map((item) => item.id),
        total_price: comboTotal,
      };

      const result = await post("/combo", payload);

      if (result?.success) {
        alert("Combo saved successfully");

        setComboItems([]);
        setComboName("");
        setShowNameStep(false);
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f9fc] pb-24">

      {/* Header */}
      <div className="bg-[#103c7f] px-4 pt-7 pb-6 rounded-b-3xl shadow-lg text-white">
        <div className="flex items-center justify-between mb-3">

          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}>
              <ArrowLeft size={22} />
            </button>

            <h2 className="text-lg font-bold">
              Build Your Combo 🍽️
            </h2>
          </div>

          <button
        onClick={() => {
  if (comboItems.length >= 2) {
    const ids = comboItems.map((i) => i.id).join(",");
    router.push(`/screens/combo/${ids}`);
  }
}}
            disabled={comboItems.length < 2}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium ${
              comboItems.length >= 2
                ? "bg-white text-[#103c7f]"
                : "bg-white/30 text-white cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>

        <p className="text-sm opacity-90">
          Select items and save combo
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl px-3 py-2 flex items-center shadow-sm border">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 w-full outline-none text-sm"
          />
        </div>
      </div>

      {/* Items */}
      <div className="px-4 mt-5">
        {loading ? (
          <p className="text-center text-gray-500">
            Loading...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item: any) => {
              const added = comboItems.find(
                (p) => p.id === item.id
              );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden h-40 bg-[#f7f9fc]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="px-3 pb-3">
                    <h4 className="font-semibold text-sm text-gray-800">
                      {item.name}
                    </h4>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-3 flex justify-between items-center">
                     
                      <button
                        onClick={() => toggleComboItem(item)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium ${
                          added
                            ? "bg-[#a1db40] text-[#103c7f]"
                            : "bg-[#103c7f] text-white"
                        }`}
                      >
                        {added ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup */}
      {showNameStep && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl">

            <h3 className="text-lg font-bold text-gray-800">
              Save Combo 🍽️
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              {comboItems.map((item) => item.name).join(", ")}
            </p>

            <input
              type="text"
              placeholder="Enter combo name"
              value={comboName}
              onChange={(e) => setComboName(e.target.value)}
              className="w-full mt-4 px-3 py-2 border rounded-xl text-sm outline-none"
            />

            <div className="flex justify-between items-center mt-4">
              <p className="font-bold text-[#103c7f]">
                ₹{comboTotal}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNameStep(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancel
                </button>

                <button
                  onClick={saveCombo}
                  className="bg-[#103c7f] text-white px-4 py-2 rounded-xl"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}