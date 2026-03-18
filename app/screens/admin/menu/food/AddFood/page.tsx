"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";

import { get, post, put } from "@/lib/api";

export default function AddFood() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null); // Existing image from API
  const [file, setFile] = useState<File | null>(null); // Newly selected file
  const [preview, setPreview] = useState<string | null>(null); // Preview URL
  const [loading, setLoading] = useState(false);

  // ✅ Edit mode fetch
  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const result = await get(`admin_api/items/${id}`);
      if (result.success) {
        const item = result.data;
        setName(item.name || "");
        setDescription(item.description || "");
        setImage(item.image || null); // API image
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Handle image preview
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Enter food name");
      return;
    }

    if (file && file.size > 2 * 1024 * 1024) { // 2 MB in bytes
    alert("Image size must be 2 MB or less");
    return;
  }


    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", "Food");
      if (file) formData.append("image", file);
      formData.append("is_available", "true");

      let result;
      if (id) {
        result = await put(`/admin_api/items/${id}`, formData, true); // multipart
      } else {
        result = await post("/admin_api/items", formData, true);
      }

      if (result.success) {
        alert(id ? "Food updated ✅" : "Food added ✅");
        router.back();
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18}/>
        </button>

        <h1 className="font-semibold text-lg text-[#103c7f]">
          {id ? "Edit Food" : "Add Food"}
        </h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">

          <div>
            <p className="text-sm text-gray-500 mb-1">Food Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Veg Sandwich"
              className="w-full bg-gray-100 rounded-lg p-3 outline-none"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh sandwich with vegetables"
              rows={3}
              className="w-full bg-gray-100 rounded-lg p-3 outline-none"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Upload Image</p>
            <label className="flex items-center justify-center gap-2 bg-gray-100 p-4 rounded-lg cursor-pointer">
              <Upload size={18}/>
              <span className="text-sm text-gray-600">Choose Image</span>
              <input
                type="file"
                onChange={handleImage}
                className="hidden"
              />
            </label>

            {/* ✅ Display preview if selected, otherwise show existing image */}
            {(preview || image) && (
              <img
                src={preview || image || ""}
                className="mt-3 w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#103c7f] text-white py-3 rounded-xl font-medium"
          >
            {loading ? "Saving..." : id ? "Update Food" : "Save Food"}
          </button>

        </div>
      </div>
    </div>
  );
}