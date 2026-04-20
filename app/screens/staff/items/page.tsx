"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Product = {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  is_available: boolean; // ✅ only this used
  category: string;
};

export default function ItemsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await get("/menu/items");
      if (res.success) {
        setProducts(res.items || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      
      {/* 🔷 Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-100"
          >
            <ArrowLeft size={18} className="text-[#103c7f]" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-[#103c7f]">
              Menu Items
            </h1>
            <p className="text-xs text-gray-500">
              All available products
            </p>
          </div>
        </div>
      </div>

      {/* ⏳ Loading */}
      {loading && (
        <p className="text-center text-gray-500 mt-10">
          Loading items...
        </p>
      )}

      {/* ❌ Empty */}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          🍽 No items available
        </p>
      )}

      {/* ✅ Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
            >
              {/* 🖼 Image */}
              <div className="relative h-36 w-full bg-gray-100">
                <img
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  className={`w-full h-full object-cover transition ${
                    !item.is_available ? "grayscale opacity-80" : ""
                  }`}
                />

                {/* Category */}
                <span className="absolute top-2 left-2 bg-[#103c7f] text-white text-[10px] px-2 py-1 rounded-md shadow">
                  {item.category || "Item"}
                </span>

                {/* ❗ Availability Badge */}
                {!item.is_available && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-red-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm border border-red-200">
                      Not Available
                    </span>
                  </div>
                )}
              </div>

              {/* 📦 Content */}
              <div className="p-3">
                <h3 className="text-sm font-semibold text-[#103c7f] truncate">
                  {item.name}
                </h3>

                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                  {item.description || "No description"}
                </p>

                <div className="flex items-center justify-between mt-3">
                 {item.price > 0 && (
  <p className="text-sm font-bold text-[#103c7f]">
    ₹{item.price}
  </p>
)}

                  {/* Optional CTA */}
                
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}