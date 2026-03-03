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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm">Email</label>
        <Input type="email" required placeholder="you@example.com" />
      </div>
      <Button type="submit" className="w-full bg-[var(--brand)]" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}

