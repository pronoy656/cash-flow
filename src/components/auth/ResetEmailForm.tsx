"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import axiosSecure from "@/components/hook/axiosSecure";

export default function ResetEmailForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosSecure.post("/auth/forget-password", { email });
      if (response.data?.success) {
        setMessage(response.data.message || "OTP sent successfully");
        localStorage.setItem("reset_email", email);
        setTimeout(() => {
          router.push("/verify");
        }, 1500);
      } else {
        setError("Failed to send reset link.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white">Forgot Password</h1>
        <p className="text-white/50">Enter your email to receive a reset code</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50"
          />
        </div>
        
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {message && <div className="text-green-500 text-sm mt-2">{message}</div>}
        <Button variant="premium" type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
}

