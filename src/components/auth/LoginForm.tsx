"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import Cookies from "js-cookie";
import axiosSecure from "@/components/hook/axiosSecure";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosSecure.post("/auth/login", {
        email,
        password,
      });

      const { data } = response.data || response;
      const token = data?.token || response.data?.token || response.data;
      
      if (token) {
        Cookies.set("token", token, { expires: 1 });
        router.push("/overview");
      } else {
        setError("Invalid response from server. No token received.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
        <p className="text-white/50">Login to your account</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50"
          />
        </div>
        <div className="space-y-2 text-left">
          <label className="text-sm font-medium text-white/70">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded border border-white/20 bg-white/5 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              {/* Custom Checkbox */}
            </div>
            <span className="text-sm text-white/60">Remember Password</span>
          </div>
          <Link href="/reset" className="text-sm text-white underline hover:text-blue-400 transition-colors">
            Forgot Password
          </Link>
        </div>

        <Button
          type="submit"
          variant="premium"
          className="w-full h-12 text-base"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
