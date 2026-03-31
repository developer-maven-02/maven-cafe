"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e : any) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">

      <div className="w-full max-w-[420px] px-6">

        {/* Logo */}
        <div className="text-center text-white mb-10">
          <div className="w-40 h-16 relative mx-auto mb-2">
            <Image
              src="/logo.png"
              alt="Maven Cafe Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm opacity-80">Order food easily</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6">

          <h2 className="text-xl font-semibold mb-6 text-center">
            Login to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="flex items-center border rounded-xl px-3">
              <Mail className="text-gray-500 w-5 h-5"/>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 outline-none"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="flex items-center border rounded-xl px-3">
              <Lock className="text-gray-500 w-5 h-5"/>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 outline-none"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Login
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}