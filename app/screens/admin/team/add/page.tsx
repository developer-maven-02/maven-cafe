"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  MapPin,
  Camera,
  Lock
} from "lucide-react";

import { post } from "@/lib/api";

export default function AddMember() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [seat, setSeat] = useState("");
  const [status, setStatus] = useState("active");
  const [image, setImage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e: any) => {
    const file = e.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name || !email || !password) {
      alert("Name, Email and Password required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await post("/admin_api/users/create", {
        name,
        email,
        password,
        role,
        seat,
        profile_image: image,
        status
      });

      if (result.success) {
        alert("Member added successfully");
        router.back();
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gradient-to-b from-[#f8fbff] to-white">

      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 shadow-sm flex items-center gap-3 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18}/>
        </button>

        <div>
          <h1 className="font-semibold text-lg text-[#103c7f]">
            Add Team Member
          </h1>
          <p className="text-xs text-gray-500">
            Create new member profile
          </p>
        </div>
      </div>

      <div className="p-4">

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-4">

          {/* Image */}
          <div className="flex flex-col items-center gap-3">

            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border">

              {image ? (
                <img
                  src={image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={30} className="text-gray-400"/>
              )}

            </div>

            <label className="flex items-center gap-1 text-sm text-blue-600 cursor-pointer">
              <Camera size={14}/>
              Upload Photo
              <input
                type="file"
                className="hidden"
                onChange={handleImage}
              />
            </label>

          </div>

          {/* Name */}
          <div className="flex items-center gap-2 border rounded-xl p-3">
            <User size={16} className="text-gray-400"/>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 border rounded-xl p-3">
            <Mail size={16} className="text-gray-400"/>
            <input
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 border rounded-xl p-3">
            <Lock size={16} className="text-gray-400"/>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center gap-2 border rounded-xl p-3">
            <Lock size={16} className="text-gray-400"/>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Role */}
          <div className="flex items-center gap-2 border rounded-xl p-3">
            <Shield size={16} className="text-gray-400"/>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
            >
              <option value="team">Team Member</option>
              <option value="staff">Cafe Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Seat */}
          <div className="flex items-center gap-2 border rounded-xl p-3">
            <MapPin size={16} className="text-gray-400"/>
            <input
              placeholder="Seat / Location"
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-[#103c7f] text-white py-3 rounded-xl font-medium shadow-sm"
          >
            {loading ? "Saving..." : "Save Member"}
          </button>

        </div>

      </div>

    </div>
  );
}