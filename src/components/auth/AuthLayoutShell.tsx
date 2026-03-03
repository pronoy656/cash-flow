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
  title = "Welcome back",
  subtitle = "Sign in to manage CashFlowIQ",
}: AuthLayoutShellProps) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 auth-surface text-white">
      <div className="relative hidden md:block">
        <Image
          src="/auth-hero.jpg"
          alt="Auth"
          priority
          fill
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end p-10">
          <div>
            <Image
              src="/logo.png"
              alt="CashFlowIQ"
              width={180}
              height={48}
              className="mb-6"
            />
            <p className="max-w-md text-foreground/90">
              Track income and expenses accurately. Gain insights to grow your
              business with confidence.
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur border-white/10">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/logo.png" alt="logo" width={36} height={36} />
              <span className="text-xl font-semibold">CashFlowIQ Admin</span>
            </div>
            <h1 className="text-2xl font-semibold mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
            {children}
            <p className="mt-8 text-xs text-muted-foreground">
              © {new Date().getFullYear()} CashFlowIQ. All rights reserved.{" "}
              <Link href="/legal" className="text-primary underline">
                Legal
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
