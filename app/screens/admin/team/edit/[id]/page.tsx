"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  MapPin,
  Lock
} from "lucide-react";

import { get, put } from "@/lib/api";

export default function EditMember() {
  const router = useRouter();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [seat, setSeat] = useState("");
  const [status, setStatus] = useState("active");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const res = await get(`/admin_api/users/${id}`);

    if (res.success) {
      const user = res.data;

      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "staff");
      setSeat(user.seat || "");
      setStatus(user.status || "active");
      setProfileImage(user.profile_image || "");
    }
  };

  const handleUpdate = async () => {
    setLoading(true);

    const res = await put(`/admin_api/users/${id}`, {
      name,
      email,
      role,
      seat,
      status,
      password,
      profile_image: profileImage
    });

    if (res.success) {
      alert("Updated successfully");
      router.back();
    } else {
      alert(res.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-white">

      <div className="sticky top-0 bg-white p-4 shadow-sm flex items-center gap-3 text-[#103c7f]">
        <button onClick={() => router.back()}>
          <ArrowLeft size={18}/>
        </button>
        <h1 className="font-semibold">Edit Member</h1>
      </div>

      <div className="p-4 space-y-4">

        <div className="flex items-center gap-2 border rounded-lg p-3">
          <User size={16} className="text-[#103c7f]"/>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-3">
          <Mail size={16} className="text-[#103c7f]"/>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-3">
          <Shield size={16} className="text-[#103c7f]"/>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex-1 outline-none"
          >
            <option value="team">Team Member</option>
            <option value="staff">Cafe Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border rounded-lg p-3">
          <MapPin size={16} className="text-[#103c7f]"/>
          <input
            value={seat}
            onChange={(e) => setSeat(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-lg p-3"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="flex items-center gap-2 border rounded-lg p-3">
          <Lock size={16} className="text-[#103c7f]"/>
          <input
            type="password"
            placeholder="New Password optional"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-[#103c7f] text-white py-3 rounded-lg"
        >
          {loading ? "Updating..." : "Update Member"}
        </button>

      </div>
    </div>
  );
}