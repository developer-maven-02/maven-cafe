"use client";

import { useState, useEffect } from "react";
import { useRouter} from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { get, post, put } from "@/lib/api";
import { useParams } from "next/navigation";

export default function AddBeverage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null); // existing image URL
  const [file, setFile] = useState<File | null>(null); // newly selected file
  const [preview, setPreview] = useState<string | null>(null); // new file preview
  const [loading, setLoading] = useState(false);

  // ✅ Fetch existing item if editing
  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const res = await get(`admin_api/items/${id}`);
          if (res.success) {
            setName(res.data.name || "");
            setDescription(res.data.description || "");
            setImage(res.data.image || null);
          } else {
            alert(res.message);
          }
        } catch (error) {
          console.log(error);
          alert("Failed to fetch beverage data");
        }
      };
      fetchItem();
    }
  }, [id]);

  // ✅ Handle image selection and preview
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Image size must be 2 MB or less");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  // ✅ Save or update
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Enter beverage name");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", "Beverage");
      formData.append("is_available", "true");

      // Append file if new image selected
      if (file) formData.append("image", file);

      let res;
      if (id) {
        // Update existing item
        res = await put(`/admin_api/items/${id}`, formData, true);
      } else {
        // Add new item
        res = await post("/admin_api/items", formData, true);
      }

      if (res.success) {
        alert(`Beverage ${id ? "updated" : "added"} successfully!`);
        router.back();
      } else {
        alert(res.message);
      }
    } catch (error: any) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white flex items-center gap-3 p-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-semibold text-lg text-[#103c7f]">
          {id ? "Edit Beverage" : "Add Beverage"}
        </h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
          {/* Beverage Name */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Beverage Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coffee"
              className="w-full bg-gray-100 rounded-lg p-3 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hot coffee"
              rows={3}
              className="w-full bg-gray-100 rounded-lg p-3 outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Upload Image</p>
            <label className="flex items-center justify-center gap-2 bg-gray-100 p-4 rounded-lg cursor-pointer">
              <Upload size={18} />
              <span className="text-sm text-gray-600">Choose Image</span>
              <input type="file" onChange={handleImage} className="hidden" />
            </label>

            {/* ✅ Show preview if new file selected, else existing image */}
            {(preview || image) && (
              <img
                src={preview || image || ""}
                alt="Preview"
                className="mt-3 w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#103c7f] text-white py-3 rounded-xl font-medium"
          >
            {loading ? "Saving..." : id ? "Update Beverage" : "Add Beverage"}
          </button>
        </div>
      </div>
    </div>
  );
}