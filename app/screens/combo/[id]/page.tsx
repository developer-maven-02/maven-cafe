"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { get } from "@/lib/api";

export default function ComboDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [combo, setCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCombo();
  }, []);

  const fetchCombo = async () => {
    try {
      const result = await get(`/combo/${params.id}`);
       console.log("cheheh",result);
      if (result.success) {
        setCombo(result.combo);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-[#f7f9fc] pb-28">

      {/* Header */}
      <div className="bg-[#103c7f] px-4 pt-7 pb-6 rounded-b-3xl text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}>
            <ArrowLeft size={22} />
          </button>

          <h2 className="text-lg font-bold">
            Combo Details 🍽️
          </h2>
        </div>
      </div>

      {/* Combo Card */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-4">

          <div className="flex items-center gap-3">
            <div className="bg-[#103c7f]/10 p-3 rounded-2xl">
              <Package size={24} className="text-[#103c7f]" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">
                {combo.name}
              </h3>

              <p className="text-xs text-[#a1db40] font-medium">
                Combo Deal
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-5 space-y-3">
            {combo.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border rounded-2xl p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">
                    {item.name}
                  </h4>

                  <p className="text-xs text-gray-500">
                    ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mt-5">
            <p className="font-bold text-[#103c7f]">
              Total ₹{combo.total_price}
            </p>

            <button className="bg-[#103c7f] text-white px-4 py-2 rounded-xl text-sm">
              Order Combo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}