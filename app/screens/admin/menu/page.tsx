"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UtensilsCrossed, Coffee, Sparkles } from "lucide-react";

export default function AdminManageMenu() {

  const router = useRouter();

  const catalog = [
    {
      name: "Food",
      icon: <UtensilsCrossed size={26} />,
      link: "/screens/admin/menu/food"
    },
    {
      name: "Beverages",
      icon: <Coffee size={26} />,
      link: "/screens/admin/menu/beverage"
    },
    {
      name: "Special Services",
      icon: <Sparkles size={26} />,
      link: "/screens/admin/menu/specialService"
    }
  ];

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm z-10">

        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
        >
          <ArrowLeft size={18}/>
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            Manage Menu
          </h1>

          <p className="text-xs text-gray-500">
            Manage cafeteria catalog
          </p>
        </div>

      </div>

      {/* Menu Categories */}
      <div className="p-4 grid grid-cols-2 gap-4">

        {catalog.map((item) => (

          <Link key={item.name} href={item.link}>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center justify-center gap-2 cursor-pointer">

              <div className="text-[#103c7f]">
                {item.icon}
              </div>

              <p className="font-medium text-gray-800 text-sm text-center">
                {item.name}
              </p>

            </div>

          </Link>

        ))}

      </div>

    </div>
  );
}