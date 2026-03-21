"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Users,
  Pencil,
  Plus,
  User,
  Trash2
} from "lucide-react";

import { get, post } from "@/lib/api";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function ManageTeam() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  const fetchMembers = async () => {
    try {
      const result = await get(
        `/admin_api/team?search=${search}`
      );

      if (result.success) {
        setMembers(result.members || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [search]);

  const deleteMember = async (id: string) => {
    const confirmDelete = confirm("Delete this member?");
    if (!confirmDelete) return;

    try {
      const result = await post("/admin_api/team/delete", { id });

      if (result.success) {
        fetchMembers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50">

      {/* Header */}
      <div className="sticky top-0 bg-white p-4 shadow-sm flex items-center gap-3 text-[#103c7f]">
        <button
          onClick={() => router.back()}
          className="p-2 bg-gray-100 rounded-full"
        >
          <ArrowLeft size={18}/>
        </button>

        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18}/>
            Team Members
          </h1>

          <p className="text-xs text-gray-500">
            Manage team members
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Search */}
        <div className="bg-white rounded-xl p-3 flex items-center gap-2 border border-gray-200 shadow-sm">
          <Search size={18} className="text-gray-500"/>

          <input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>

        {/* Members */}
        <div className="space-y-3">
          {members.length === 0 && (
            <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-500 border border-gray-200 shadow-sm">
              No team members found
            </div>
          )}

          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full text-[#103c7f]">
                    <User size={18}/>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-[#103c7f]">
                      {member.name}
                    </p>

                   <p className="text-xs text-gray-500">
  {member.email
    ? member.email.replace(/(.{3}).+(@.+)/, "$1***$2")
    : ""}
</p>
                    <p className="text-xs text-gray-500">
                      {member.role} • Joined {member.created_at?.split("T")[0]}
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 text-[#103c7f]">
                  <button
                    onClick={() => router.push(`/screens/admin/team/edit/${member.id}`)}
                    className="flex items-center gap-1 text-xs px-3 py-1 bg-gray-100 rounded-lg"
                  >
                    <Pencil size={14}/>
                    Edit
                  </button>

                  <button
                    onClick={() => deleteMember(member.id)}
                    className="flex items-center gap-1 text-xs px-3 py-1 bg-red-500 text-white rounded-lg"
                  >
                    <Trash2 size={14}/>
                    Delete
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Add Member */}
        <button
          onClick={() => router.push(`/screens/admin/team/add`)}
          className="w-full flex items-center justify-center gap-2 bg-[#103c7f] text-white py-3 rounded-xl font-medium shadow-sm"
        >
          <Plus size={18}/>
          Add Member
        </button>

      </div>
    </div>
  );
}