"use client";

import { useState, useEffect } from "react";

import {
  ArrowLeft,
  User,
  ShoppingBag,
  Search,
  Heart,
  HandHelping,
  Gift,
  Package,
   Bell,
  Droplets,
  Coffee,
  Utensils,
  Flame,
  Sparkles,
  AlertCircle,
  Clock,
  CupSoda,
  Soup,
  Sandwich,
  Brush,
  Trash,
  Hand,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { get } from "@/lib/api";

const categories = [
  { name: "All", icon: "📋" },  // Added "All" category

  { name: "Beverage", icon: "☕" },
  { name: "Food", icon: "🍔" },
  { name: "Combo", icon: "🥪" },
  { name: "Other Services", icon: "⭐" },
];



export default function MenuPage() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [combos, setCombos] = useState([]);
  const [services, setServices] = useState([]);
  const [userRole, setUserRole] = useState("");

  const fetchUserRole = async () => {
  try {
    const result = await get("/profile");

    if (result.success) {
      setUserRole(result.user.role);
    }
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    fetchMenu();
      fetchCombos();
       fetchServices();
   fetchUserRole();
  }, []);

  const fetchServices = async () => {
  try {
    const result = await get("/service-config");

    if (result.success) {
      setServices(result.services || []);
    }
  } catch (error) {
    console.error(error);
  }
};
  const fetchCombos = async () => {
  try {
    const result = await get("/combo");
      console.log('chekc:',result);

    if (result.success) {

      setCombos(result.combos);
    }
  } catch (error) {
    console.error(error);
  }
};

  const fetchMenu = async () => {
    try {
      const result = await get("/menu/items");
      if (result.success) {
        setItems(result.items);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

 const filteredItems = items.filter((item: any) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const serviceIconMap = {
  Bell,
  Droplets,
  Coffee,
  Utensils,
  Flame,
  Sparkles,
  AlertCircle,
  Clock,
  CupSoda,
  Soup,
  Sandwich,
  Brush,
  Trash,
  Hand,
  MessageSquare,
  CheckCircle,
};

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f9fc] pb-24">

      {/* Header */}
<div className="sticky top-0 z-20 bg-[#103c7f] px-4 pt-7 pb-8 overflow-hidden rounded-b-3xl shadow-lg">

  <div className="flex justify-between items-center mb-5">

    {/* Left Side */}
    <div className="flex items-center gap-2">
      {userRole === "admin" && (
        <button onClick={() => router.back()} className="text-white">
          <ArrowLeft size={22} />
        </button>
      )}

      <div className="w-24 h-14 relative">
        <Image
          src="/logo.png"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>
    </div>

    {/* Right Side */}
    <div className="flex items-center gap-4 text-white">
      <Link href="/screens/combo">
        <Gift size={22} />
      </Link>

      <Link href="/screens/favorite">
        <Heart size={22} />
      </Link>

      <Link href="/screens/orders/MyOrders" className="relative">
        <ShoppingBag size={22} />
        <span className="absolute -top-1 -right-2 bg-[#a1db40] text-[10px] px-1 rounded-full text-[#103c7f] font-semibold">
          2
        </span>
      </Link>

      <Link href="/screens/profile">
        <User size={22} />
      </Link>
    </div>

  </div>
</div>
  {/* Floating Search */}
<div className=" top-2 z-30 px-4 mt-5 mb-3">
    <div className="bg-white rounded-2xl px-4 py-3 flex items-center shadow-xl">

      <Search size={18} className="text-gray-400 mr-2" />

      <input
        type="text"
        placeholder="Search menu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 outline-none text-sm"
      />

    </div>
  </div>


      {/* Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-[#103c7f] to-[#1d4e89] rounded-2xl p-4 text-[#103c7f] shadow-md flex justify-between items-center">

          <div>
            <h2 className="text-m font-bold">
Maven Cafe Welcomes You 🌟
            </h2>

            <p className="text-sm opacity-90">
              Quality coffee, fresh food, <><br /></>always ready
            </p>

            <button className="mt-3 bg-[#a1db40] text-[#103c7f] px-4 py-1 rounded-full text-sm font-semibold">
              Order Now
            </button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
            alt="banner"
            className="w-24 h-24 rounded-xl object-cover"
          />
        </div>
      </div>

      {/* Categories */}

 

<div className="px-4 mt-2">
  <h3 className="text-xl font-bold text-gray-800 mb-4">
    Categories
  </h3>

  <div className="flex gap-3 overflow-x-auto pb-3">
    {categories.map((cat) => (
      <button
        key={cat.name}
        onClick={() => setActiveCategory(cat.name)}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
          activeCategory === cat.name
            ? "bg-[#103c7f] text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span className="text-2xl mb-1">{cat.icon}</span>

        <p className="text-[11px] font-medium text-center px-2 leading-tight">
          {cat.name}
        </p>
      </button>
    ))}
  </div>
</div>


      {activeCategory === "Other Services" && (
  <div className="px-4 mt-5">
    <div className="grid grid-cols-2 gap-4">
      {services.map((s: any) => {
        const Icon =
          serviceIconMap[s.icon as keyof typeof serviceIconMap] || Bell;

        return (
          <div
            key={s.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
          >
            <div className="bg-[#103c7f]/10 p-3 rounded-xl w-fit">
              <Icon size={22} className="text-[#103c7f]" />
            </div>

            <h4 className="font-semibold text-sm text-gray-800 mt-3">
              {s.name}
            </h4>

            <button
              onClick={() =>
                router.push(`/screens/product/Special-Services/${s.id}/?name=${s.name}`)
              }
              className="mt-3 bg-[#103c7f] text-white px-3 py-1 rounded-lg text-xs"
            >
              Request
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}




      {/* Products */}
      {activeCategory !== "Other Services" && (

      <div className="px-4 mt-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Items
        </h3>

        {loading ? (
          <p className="text-center text-gray-500 text-sm">
            Loading...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">

  {filteredItems.map((item: any) => (
      <div
      key={item.id}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition hover:shadow-md"
    >
      {/* Fixed Image Container - ensures consistent height */}
    <div className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden bg-[#f7f9fc] aspect-square"   style={{ height: '176px' }}  // ← CRITICAL: Parent must have fixed height
>

    <img
      src={item.image}
      alt={item.name}
      className="w-full h-full object-cover object-center"
      
    />

  </div>

      {/* Content */}
      <div className="px-3 pb-3 flex flex-col flex-1">
        <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
          {item.name}
        </h4>

        <p className="text-xs text-gray-500 line-clamp-2 min-h-[34px] mt-1">
          {item.description}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <p
            className={`font-bold text-sm ${
              Number(item.price) === 0
                ? "text-green-600"
                : "text-[#103c7f]"
            }`}
          >
            {Number(item.price) === 0
              ? ""
              : `₹${item.price}`}
          </p>

          <button
            onClick={() =>
              router.push(`/screens/product/${item.id}`)
            }
            className="bg-[#103c7f] text-white px-3 py-1.5 rounded-xl text-xs font-medium"
          >
            Order
          </button>
        </div>
      </div>
    </div>

  ))}

</div>


        )}

              {activeCategory === "Combo" &&
  combos.map((combo: any) => (
    <div
      key={combo.id}
      className="bg-white rounded-3xl shadow-md border border-gray-100 p-4 mt-4 flex items-center gap-4"
    >
      <div className="bg-gradient-to-br from-[#103c7f] to-[#1d4f99] p-3 rounded-2xl shadow-sm">
        <Package size={22} className="text-white" />
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {combo.name}
            </h3>

            <p className="text-[11px] text-[#a1db40] font-medium mt-1">
              Combo Deal
            </p>
          </div>

          <p className="font-bold text-[#103c7f] text-sm">
            ₹{combo.total_price}
          </p>
        </div>

        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {combo.item_names?.join(", ")}
        </p>

        <div className="flex justify-end mt-3">
          <button
            onClick={() =>
router.push(`/screens/combo/${combo.id}`)
            }
            className="bg-[#103c7f] text-white text-xs px-4 py-2 rounded-xl font-medium"
          >
            Order Combo
          </button>
        </div>
      </div>
    </div>
  ))}
      </div>
      )}
    </div>
  );
}