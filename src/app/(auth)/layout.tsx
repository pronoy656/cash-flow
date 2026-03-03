import AuthLayoutShell from "@/components/auth/AuthLayoutShell";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}

