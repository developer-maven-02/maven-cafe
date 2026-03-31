"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { get, put, post } from "@/lib/api";
import Image from "next/image";

export default function Profile() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [seat, setSeat] = useState("");
  const [photo, setPhoto] = useState("https://i.pravatar.cc/150?img=12");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const result = await get("/profile");

      if (result.success) {
        setName(result.user.name || "");
        setEmail(result.user.email || "");
        setSeat(result.user.seat || "");
        setPhoto(result.user.profile_image || "https://i.pravatar.cc/150?img=12");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfile = async () => {
    try {
      const result = await put("/profile", {
        name,
        seat,
      });

      if (result.success) {
        alert("Profile updated successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    await post("/auth/logout", {});
    router.push("/");
  };

  const handlePhotoChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50 pb-10">

      <div className="sticky top-0 bg-white flex items-center justify-between p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-100 rounded-full text-[#103c7f]"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-[#103c7f]">
              Profile
            </h1>
            <p className="text-xs text-gray-500">
              Manage your account details
            </p>
          </div>
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

      <div className="p-4 space-y-5">

        <div className="bg-white rounded-xl shadow-sm p-5 text-center">
          <img
            src={photo}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto object-cover"
          />

          <label className="block mt-3 text-sm text-[#103c7f] cursor-pointer">
            Change Photo
            <input
              type="file"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">

          <div>
            <p className="text-sm text-gray-500">Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 bg-gray-100 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#103c7f]"
            />
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium text-gray-700">{email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Seat Number</p>
            <input
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="w-full mt-1 bg-gray-100 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#103c7f]"
            />
          </div>

          <button
            onClick={updateProfile}
            className="w-full bg-[#103c7f] text-white py-3 rounded-xl"
          >
            Save Changes
          </button>

        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <button
            onClick={logout}
            className="w-full bg-[#a1db40] text-black py-3 rounded-xl font-semibold shadow"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}