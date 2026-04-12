"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  MessageSquare,
  Scale,
  LogOut,
  LucideIcon,
} from "lucide-react";

type IconType = LucideIcon;

const items: Array<{
  href: string;
  label: string;
  Icon: IconType;
}> = [
    { href: "/overview", label: "Overview", Icon: LayoutDashboard },
    { href: "/users", label: "User Management", Icon: Users },
    { href: "/subscription", label: "Subscription", Icon: CreditCard },
    { href: "/documents", label: "Documents & Audit", Icon: FileText },
    { href: "/chat", label: "Chat", Icon: MessageSquare },
    { href: "/legal", label: "Legal & Content", Icon: Scale },
  ];

export default function Sidebar({ active }: { active?: string }) {
  const pathname = usePathname();
  const current = active ?? pathname ?? "";
  return (
    <aside className="h-screen w-64 surface-alt text-white border-r border-white/10 fixed left-0 top-0">
      <div className="flex items-center justify-center">
        <div className="p-3 rounded-xl">
          <Image
            src="/image 11 (1).png"
            alt="CashFlowIQ logo"
            width={82}
            height={72}
          />
        </div>
      </div>
      {/* <Separator className="bg-white/10" /> */}
      <div className="px-3 pt-10 pb-1 text-xs uppercase tracking-wide text-white/50">
        Main Menu
      </div>
      <nav className="p-3 space-y-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors",
              (current === item.href || current.startsWith(item.href)) &&
              "bg-[var(--brand)] text-white hover:bg-[var(--brand)]",
            )}
          >
            <item.Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center justify-center">
          <button 
            type="button" 
            onClick={() => {
              import("js-cookie").then((Cookies) => {
                Cookies.default.remove("token");
                window.location.href = "/login";
              });
            }} 
            className="flex w-full justify-center items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
