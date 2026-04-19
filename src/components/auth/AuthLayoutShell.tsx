"use client";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Card, CardContent } from "@/components/ui/card";

type AuthLayoutShellProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export default function AuthLayoutShell({
  children,
}: AuthLayoutShellProps) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#090E1A] text-white">
      {/* Left Side: Hero Image and Text */}
      <div className="relative hidden md:block overflow-hidden">
        <img
          src="/hero-auth.png"
          alt="Auth Hero"
          className="w-full h-full object-cover"
        />
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Hero Text Content */}
        <div className="absolute bottom-0 left-0 right-0 p-12 space-y-4">
          <h2 className="text-5xl font-bold italic leading-tight">
            Financial Overview & <br /> Control
          </h2>
          <p className="max-w-md text-white/70 text-lg leading-relaxed">
            Monitor platform revenue, commissions, and expenses in real time.
            Gain a clear overview of financial performance and ensure accurate
            reporting across the system.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-[500px] flex flex-col items-center text-center">
          {/* Logo Card Section */}
          <div className="mb-12 relative">
            <div className="w-44 h-44 bg-[#111827] rounded-3xl border border-white/5 flex items-center justify-center  relative overflow-hidden">
              {/* Subtle Blue Glow Overlay */}
              <div className="absolute inset-0 bg-blue-500/5" />

              <div className="relative w-44 h-44">
                <img
                  src="/image-11-1.png"
                  alt="CashFlowIQ Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full text-left">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
