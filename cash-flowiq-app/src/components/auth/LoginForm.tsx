"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/overview");
    }, 600);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm">Email</label>
        <Input type="email" required placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Password</label>
        <Input type="password" required placeholder="••••••••" />
      </div>
      <div className="flex items-center justify-between">
        <Link href="/reset" className="text-sm text-primary underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" className="w-full bg-[var(--brand)]" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
