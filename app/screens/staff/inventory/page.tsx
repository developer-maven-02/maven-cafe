"use client";

import {
  Package,
  Plus,
  LogOut,
  ClipboardList,
  Wrench,
  ArrowLeft
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import Image from "next/image";

export default function InventoryPage() {
  const router = useRouter();

  const [inventoryRequests, setInventoryRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [inventoryForm, setInventoryForm] = useState({
    product_name: "",
    quantity: "",
    unit: "",
    reason: "",
  });
const units = [
  "kg",
  "gram",
  "litre",
  "ml",
  "packet",
  "piece",
  "box",
  "bottle",
  "dozen",
  "tray",
];
  const fetchInventoryRequests = async () => {
    try {
      const result = await get("cafe_api/inventory_requests/my");

      if (result.success) {
        setInventoryRequests(result.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitInventoryRequest = async () => {
    try {
      const result = await post("cafe_api/inventory_requests", inventoryForm);

      if (result.success) {
        fetchInventoryRequests();

        setInventoryForm({
          product_name: "",
          quantity: "",
          unit: "",
          reason: "",
        });

        setShowForm(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    await post("/auth/logout", {});
    router.push("/");
  };

  useEffect(() => {
    fetchInventoryRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">

      {/* Header */}
      <div className="bg-white rounded-xl p-4 mb-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
              <button
      onClick={() => router.back()} // goes back to previous page
      className="p-2 rounded-lg hover:bg-gray-100"
    >
      <ArrowLeft size={20} className="text-[#103c7f]" />
    </button>

          <div className="w-24 h-10 relative">
            <Image
              src="/logo.png"
              alt="Maven Cafe Logo"
              fill
              className="object-contain"
            />
          </div>

          <div>
            <h1 className="text-xl font-semibold text-[#103c7f]">
              Inventory Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Manage inventory requests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/screens/staff/orders")}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ClipboardList size={20} className="text-[#103c7f]" />
          </button>

          <button
            onClick={() => router.push("/screens/staff/service-requests")}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Wrench size={20} className="text-[#103c7f]" />
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut size={20} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Add Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#103c7f] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Add Inventory Request
        </button>
      </div>

      {/* Inventory List */}
  {/* Inventory List */}
<div className="bg-white rounded-xl p-4 shadow-sm">
  <h2 className="text-[#103c7f] text-lg font-semibold mb-4">
    Inventory Requests
  </h2>

  {/* Table Header */}

    {/* Table Header */}
<div className="grid grid-cols-5 gap-3 border-b border-gray-200 pb-2 mb-2 text-sm text-gray-500 font-medium">
  <div>Product Name</div>
  <div>Quantity</div>
  <div>Unit</div>
  <div>Reason</div>
  <div>Status</div>
</div>

{/* Table Rows */}
<div className="space-y-2">
  {inventoryRequests.map((item) => (
    <div
      key={item.id}
      className="grid grid-cols-5 gap-3 p-2 items-center border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition"
    >
      <div className="truncate font-medium text-[#103c7f]" title={item.product_name}>
        {item.product_name}
      </div>
      <div>{item.quantity}</div>
      <div>{item.unit}</div>
      <div className="truncate text-gray-500" title={item.reason}>
        {item.reason}
      </div>
      <div>
        <span className={`text-xs px-3 py-1 rounded-full ${
          item.status === "Pending"
            ? "bg-yellow-50 text-yellow-600"
            : item.status === "Approved"
            ? "bg-green-50 text-green-600"
            : "bg-red-50 text-red-600"
        }`}>
          {item.status}
        </span>
      </div>
    </div>
  ))}
</div>
</div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[90%] max-w-sm shadow-lg">
            <h2 className="text-[#103c7f] font-semibold mb-4">
              New Inventory Request
            </h2>

            <input
              placeholder="Product Name"
              value={inventoryForm.product_name}
              onChange={(e) =>
                setInventoryForm({
                  ...inventoryForm,
                  product_name: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 mb-3"
            />

            <input
              placeholder="Quantity"
              value={inventoryForm.quantity}
              onChange={(e) =>
                setInventoryForm({
                  ...inventoryForm,
                  quantity: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 mb-3"
            />

           <select
  value={inventoryForm.unit}
  onChange={(e) =>
    setInventoryForm({
      ...inventoryForm,
      unit: e.target.value,
    })
  }
  className="w-full border rounded-lg p-2 mb-3 bg-white text-sm"
>
  <option value="">Select Unit</option>
  {units.map((unit) => (
    <option key={unit} value={unit}>
      {unit}
    </option>
  ))}
</select>

            <input
              placeholder="Reason"
              value={inventoryForm.reason}
              onChange={(e) =>
                setInventoryForm({
                  ...inventoryForm,
                  reason: e.target.value,
                })
              }
              className="w-full border rounded-lg p-2 mb-3"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={submitInventoryRequest}
                className="flex-1 bg-[#103c7f] text-white py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}