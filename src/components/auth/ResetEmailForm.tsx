"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetEmailForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/verify");
    }, 600);
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
            placeholder="you@example.com"
            className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50"
          />
        </div>
        <Button variant="premium" type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
}

