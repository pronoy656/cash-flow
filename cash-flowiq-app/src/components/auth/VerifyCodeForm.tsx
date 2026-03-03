"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyCodeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/new-password");
    }, 600);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm">Verification Code</label>
        <Input type="text" required placeholder="Enter 6-digit code" />
      </div>
      <Button type="submit" className="w-full bg-[var(--brand)]" disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </Button>
    </form>
  );
}

