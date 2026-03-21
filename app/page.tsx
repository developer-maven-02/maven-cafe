"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { post } from "@/lib/api";
export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const result = await post("/auth/login", {
      email,
      password,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    // localStorage.setItem("user", JSON.stringify(result.user));

    console.log('check:',result);
    switch (result.role) {
      case "admin":
        router.push("/screens/admin");
        break;

      case "staff":
        router.push("/screens/staff");
        break;

      default:
        router.push("/screens");
    }
  } catch (error: any) {
    console.error("Login Error:", error);

    alert(
      error?.response?.data?.message ||
      error?.message ||
      "Login failed"
    );
  }
};

  return (
    <div className="max-w-[420px] mx-auto min-h-screen bg-gray-50 flex flex-col justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-[#103c7f]">
          Maven Cafe
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-6 text-center text-[#103c7f]">
          Login to your account
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 bg-gray-50 shadow-sm">
            <Mail className="text-gray-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 outline-none bg-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center border border-gray-300 rounded-xl px-3 bg-gray-50 shadow-sm">
            <Lock className="text-gray-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 outline-none bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#103c7f] hover:bg-[#0c2f63] text-white py-3 rounded-xl font-medium transition"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}