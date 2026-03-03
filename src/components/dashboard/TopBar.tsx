"use client";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";

export default function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-6 border-b border-white/10  bg-[#121e33] sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        {/* <Input
          placeholder="Search users, subscriptions, or documents..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
        /> */}
      </div>
      <div className="ml-4 relative">
        <Bell className="w-5 h-5 text-white/80" />
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--brand)]" />
      </div>
    </div>
  );
}
