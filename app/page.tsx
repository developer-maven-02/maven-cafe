"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { post } from "@/lib/api";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await post("/auth/login", { email, password });
      if (!result.success) { alert(result.message); return; }
      
      switch (result.role) {
        case "admin": router.push("/screens/admin"); break;
        case "staff": router.push("/screens/staff"); break;
        default: router.push("/screens");
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main Wrapper: Background uses a subtle mesh gradient for a premium feel
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-gray-100">
      
      {/* Outer Border Container: Provides that "Framed" professional look */}
      <div className="w-full max-w-[450px] bg-white rounded-[2.5rem] p-2 shadow-[0_0_50px_-12px_rgba(0,0,0,0.12)] border border-gray-100">
        
        {/* Inner Content Div */}
        <div className="bg-white rounded-[2.2rem] border-[1.5px] border-dashed border-gray-200 p-6 sm:p-10">
          
          {/* --- BRANDING SECTION --- */}
          <div className="flex flex-col items-center mb-10 group">
            <div className="relative w-48 h-24 mb-2 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Maven Cafe Logo"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            
            {/* Themed Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#103c7f]/5 border border-[#103c7f]/10">
              <span className="text-[10px] font-bold text-[#103c7f] uppercase tracking-[0.2em]">
                Maven Cafe
              </span>
            </div>
          </div>

          {/* --- FORM SECTION --- */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-600 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#103c7f] transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@mavencafe.com"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-[#103c7f]/10 focus:border-[#103c7f] outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-semibold text-gray-600">Password</label>
                <button type="button" className="text-xs font-bold text-[#103c7f] hover:opacity-80">
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#103c7f] transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm transition-all focus:bg-white focus:ring-4 focus:ring-[#103c7f]/10 focus:border-[#103c7f] outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Themed Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-[#103c7f] hover:bg-[#0c2f63] disabled:opacity-70 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#103c7f]/25 active:scale-[0.98] overflow-hidden"
            >
              <div className="relative z-10 flex justify-center items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              {/* Subtle hover shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>

          {/* Footer inside the dashed div */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-center text-[11px] text-gray-400 font-medium tracking-tight">
              &copy; {new Date().getFullYear()} MAVEN CAFE MANAGEMENT SYSTEM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}