"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import axiosSecure from "@/components/hook/axiosSecure";

export default function VerifyCodeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otp = code.join("");
    const email = localStorage.getItem("reset_email");

    if (!email) {
      setError("Session expired. Please try resting password again.");
      setLoading(false);
      return;
    }

    try {
      // Assuming typical verify endpoint taking { email, otp }
      const response = await axiosSecure.post("/auth/verify-email", { email, otp });
      if (response.data?.success || response.status === 200) {
        // Typically might return a token to reset, or we just pass the OTP later.
        // We'll store OTP if needed for the next step.
        localStorage.setItem("reset_otp", otp);
        router.push("/new-password");
      } else {
        setError("Invalid verification code.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white">Verify Reset Password</h1>
        <p className="text-white/50">
          Enter the code sent to your email to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="flex justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-16 bg-[#111827] border border-white/5 rounded-xl text-center text-2xl font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          ))}
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <Button
          type="submit"
          variant="premium"
          className="w-full h-12 text-base"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </div>
  );
}

