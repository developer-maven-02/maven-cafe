"use client";

import { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Search,
  HandHelping,
  Heart,
  MessageSquare,
  AlertCircle,
  Headphones,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get } from "@/lib/api";

const categories = [
  { name: "Beverage", icon: "☕" },
  { name: "Food", icon: "🍔" },
  { name: "Combo", icon: "🥪" },
  { name: "Special Services", icon: "⭐" },
];

export default function MenuPage() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("Beverage");
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const result = await get("/menu/items");

      if (result.success) {
        setItems(result.items);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError("Failed to load menu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(
    (item: any) =>
      item.category === activeCategory &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50 pb-24">

      {/* Header */}
      <div className="sticky top-0 bg-white flex justify-between items-center p-4 pl-0 border-b border-gray-200 z-20 shadow-md">
<div className="w-18 h-12 relative">
  <Image
    src="/logo.png"
    alt="Logo"
    fill
    className="object-contain"
  />
</div>
        <div className="flex items-center gap-4">

          
<Link href="/screens/favorite" className="relative group">
  <Heart size={22} className="text-[#103c7f]" />

  <span
    className="absolute left-1/2 -translate-x-1/2 top-8
               opacity-0 group-hover:opacity-100
               bg-[#103c7f] text-white text-xs px-2 py-1 rounded
               transition duration-200 whitespace-nowrap"
  >
    Favorite
  </span>
</Link>
<Link href="/screens/orders/MyOrders" className="relative group">
  <div className="relative text-[#103c7f]">
    <ShoppingBag size={22} />

    <span className="absolute -top-1 -right-1 bg-[#a1db40] text-xs px-1 rounded-full text-[#103c7f]">
      2
    </span>
  </div>

  <span
    className="absolute left-1/2 -translate-x-1/2 top-8
               opacity-0 group-hover:opacity-100
               bg-[#103c7f] text-white text-xs px-2 py-1 rounded
               transition duration-200 whitespace-nowrap z-50"
  >
    Orders
  </span>
</Link>
          <Link href="/screens/profile">
            <User size={22} className="text-[#103c7f]"/>
          </Link>
        </div>
      </div>

      {/* Banner */}
      <div className="p-4">
        <div className="bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085')] bg-cover bg-center rounded-2xl h-32 flex items-center justify-center text-white text-center shadow-sm">
          <div className="bg-black/40 w-full h-full rounded-2xl flex flex-col justify-center">
            <h2 className="text-xl font-bold">Ready to order?</h2>
            <p className="text-sm">Fuel your day ☕</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
          <Search size={18} className="text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search coffee, tea, sandwiches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-[64px] bg-gray-50 flex gap-2 px-4 overflow-x-auto pb-3 z-10">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeCategory === cat.name
                ? "bg-[#103c7f] text-white shadow"
                : "bg-white border border-gray-200 text-[#103c7f]"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">

        {activeCategory === "Special Services" && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex items-center gap-4">
            <div className="bg-[#103c7f]/10 p-4 rounded-xl">
              <HandHelping size={26} className="text-[#103c7f]" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">
                Cafeteria Service Request
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Request tea service, meeting snacks or cafeteria assistance
              </p>

              <button
                onClick={() => router.push("/screens/product/Special-Services")}
                className="mt-3 bg-[#103c7f] text-white text-xs px-4 py-2 rounded-lg"
              >
                Request Service
              </button>
            </div>
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-gray-500">
            Loading menu...
          </p>
        )}

        {error && (
          <p className="text-center text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          activeCategory !== "Special Services" &&
          filteredItems.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              No items found
            </p>
          )}

        {!loading &&
          !error &&
          activeCategory !== "Special Services" &&
          filteredItems.map((item: any) => (
           <div
  key={item.id}
  className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
>
  <div className="w-24 h-24 bg-gray-50 flex items-center justify-center">
    <img
      src={item.image}
      className="w-full h-full object-cover"
      alt={item.name}
    />
  </div>

  <div className="flex flex-col justify-between flex-1 p-3">
    <div>
      <h3 className="font-medium text-gray-800 text-sm">
        {item.name}
      </h3>

      <p className="text-xs text-gray-500 line-clamp-2">
        {item.description}
      </p>
    </div>

    <div className="flex items-center justify-between mt-2">
  <button
    onClick={() =>
      router.push(`/screens/product/${item.id}`)
    }
    className="bg-[#103c7f] text-white text-xs px-3 py-1.5 rounded-lg"
  >
    Order Now
  </button>

  <p
    className={`font-semibold text-sm ${
      Number(item.price) == 0
        ? "text-green-600"
        : "text-[#103c7f]"
    }`}
  >
    {Number(item.price) == 0 ? "Free" : `₹${item.price}`}
  </p>
</div>  </div>
</div>
          ))}
      </div>

      {/* 
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">

        {showOptions && (
          <>
            {/* <button
              onClick={() => router.push("/screens/support/review")}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow text-sm"
            >
              <MessageSquare size={16} />
              Review
            </button> 

            <button
              onClick={() => router.push("/screens/support/complaint")}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow text-sm text-[#103c7f]"
            >
              <AlertCircle size={16} />
              Complaint
            </button>
          </>
        )}

        <button
          onClick={() => setShowOptions(!showOptions)}
          className="bg-[#103c7f] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
        >
          <Headphones size={24} />
        </button>

      </div> */}
    </div>
  );
}