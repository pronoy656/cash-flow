"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewPasswordForm() {
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
        <label className="text-sm">New Password</label>
        <Input type="password" required placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Confirm Password</label>
        <Input type="password" required placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full bg-[var(--brand)]" disabled={loading}>
        {loading ? "Saving..." : "Set New Password"}
      </Button>
    </form>
  );
}

