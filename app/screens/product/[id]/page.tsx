"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { get , post} from "@/lib/api";
import Image from "next/image";

export default function ItemDetails() {
  const router = useRouter();
  const params = useParams();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [temperature, setTemperature] = useState("Hot");
  const [type, setType] = useState("Milk");
  const [ordering, setOrdering] = useState(false);
  const [sugar, setSugar] = useState(0);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [seat, setSeat] = useState("");
  useEffect(() => {
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
          

      const result = await get(`/menu/items/${params.id}`);

      if (result.success) {
        setItem(result.item);
        setSeat(result.seat || "");
        if (result.item?.type?.length > 0) {
          setType(result.item.type[0]); // first backend type default
        }


      }
    } catch (error) {
      console.error(error);
    } finally {
setOrdering(false);
      setLoading(false);
    }
  };

  const placeOrder = async () => {
  try {
    setOrdering(true);
    const body = {
      item_id: item.id,
      quantity: qty,
      seat,
      temperature: item.category === "Beverage" ? temperature : null,
      drink_type: item.category === "Beverage" ? type : null,
      sugar: item.category === "Beverage" ? sugar : null,
      notes,
    };

    const result = await post("/orders", body);
    if (!result.success) {
      console.log('error:',result);
    }

    if (result.success) {
      router.push("/screens");
    }
  } catch (error: any) {
    console.log(error.response?.data);
  }
};

  if (loading) {
    return <div className="max-w-[420px] mx-auto min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!item) {
    return <div className="max-w-[420px] mx-auto min-h-screen flex items-center justify-center">Item not found</div>;
  }

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50 pb-28">

      <div className="sticky top-0 bg-white flex items-center justify-between p-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="font-semibold text-lg text-[#103c7f]">{item.name}</h1>
        </div>
        <div className="w-20 h-8 relative">
          <Image
            src="/logo.png"
            alt="Maven Cafe Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <img
        src={item.image}
        alt={item.name}
        className="w-full h-56 object-cover"
      />

      <div className="p-4 space-y-5">

        <div>
          <h1 className="text-xl font-semibold text-gray-800">{item.name}</h1>
          <p className="text-sm text-gray-500">{item.description}</p>
        </div>

        {/* Beverage Only */}
        {item.category === "Beverage" && (
          <>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm font-medium mb-3 text-[#103c7f]">Temperature</p>

              <div className="flex gap-2">
                {["Hot", "Cold","Normal"].map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setTemperature(temp)}
                    className={`px-4 py-2 rounded-full text-sm ${
                      temperature === temp
                        ? "bg-[#103c7f] text-white"
                        : "bg-gray-100 text-[#103c7f]"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

                        {item.type?.length > 0 && (
              <div className="bg-white p-4 rounded-xl shadow-md">
                <p className="text-sm font-medium mb-3 text-[#103c7f]">
                  Select Type
                </p>

                <div className="flex gap-2 flex-wrap">
                  {item.type.map((t: string) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        type === t
                          ? "bg-[#103c7f] text-white"
                          : "bg-gray-100 text-[#103c7f]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}


            <div className="bg-white p-4 rounded-xl shadow-md">
              <p className="text-sm font-medium mb-3 text-[#103c7f]">Sugar Level</p>

              <div className="flex gap-2">
                {[0, 1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSugar(s)}
                    className={`w-10 h-10 rounded-full ${
                      sugar === s
                        ? "bg-[#103c7f] text-white"
                        : "bg-gray-200 text-[#103c7f]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quantity */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm font-medium mb-3 text-[#103c7f]">Quantity</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="p-2 bg-gray-200 rounded-lg text-[#103c7f]"
            >
              <Minus size={16} />
            </button>

            <span className="font-semibold text-lg text-[#103c7f]">{qty}</span>

            <button
              onClick={() => setQty(qty + 1)}
              className="p-2 bg-[#103c7f] text-white rounded-lg"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
  <p className="text-sm font-medium mb-2 text-[#103c7f]">Delivery Location</p>

  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 shadow-inner">
    {seat}
  </div>
</div>

        {/* Notes */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-sm font-medium mb-2 text-[#103c7f]">Special Instructions</p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
  className="w-full rounded-lg p-2 text-sm bg-black text-white caret-white border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#103c7f]"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center">
        <div className="max-w-[420px] w-full p-4 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.12)] rounded-t-2xl">
         <button
  onClick={placeOrder}
  disabled={ordering}
  className={`w-full py-3 rounded-xl font-semibold ${
    ordering
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-[#a1db40] text-black"
  }`}
>
  {ordering ? "Placing Order..." : "Place Order"}
</button>
        </div>
      </div>
    </div>
  );
}