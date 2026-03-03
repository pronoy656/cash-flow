"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function NewPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/overview");
    }, 600);
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white">Set New Password</h1>
        <p className="text-white/50">Create a new secure password for your account</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2 text-left">
          <label className="text-sm font-medium text-white/70">New Password</label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <label className="text-sm font-medium text-white/70">Confirm Password</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="h-12 bg-white/5 border-white/5 text-white placeholder:text-white/20 focus-visible:ring-blue-500/50 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <Button variant="premium" type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? "Saving..." : "Set New Password"}
        </Button>
      </form>
    </div>
  );
}

