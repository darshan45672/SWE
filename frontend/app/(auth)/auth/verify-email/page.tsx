"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VerifyEmailFormData } from "@/types/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<VerifyEmailFormData>({
    code: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");

  // Refs for the 6 input fields
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [codes, setCodes] = useState<string[]>(["", "", "", "", "", ""]);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);
    setFormData({ code: newCodes.join("") });
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    
    if (!/^\d{6}$/.test(pastedData)) return;

    const newCodes = pastedData.split("");
    setCodes(newCodes);
    setFormData({ code: pastedData });
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 1500);
  };

  const handleResend = async () => {
    setIsResending(true);

    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setResendCooldown(60); // 60 second cooldown
      setCodes(["", "", "", "", "", ""]);
      setFormData({ code: "" });
      setError("");
      inputRefs.current[0]?.focus();
    }, 1000);
  };

  return (
    <AuthLayout
      title="Verify your email"
      description="We sent a verification code to your email address"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* 6-digit code input */}
        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            {codes.map((code, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="h-12 w-12 text-center text-lg font-semibold"
                disabled={isLoading}
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading || formData.code.length !== 6}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>

        {/* Resend code */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?
          </p>
          <Button
            type="button"
            variant="link"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="p-0 h-auto font-normal"
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              "Resend code"
            )}
          </Button>
        </div>

        {/* Help text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Check your spam folder if you don&apos;t see the email</p>
        </div>
      </form>
    </AuthLayout>
  );
}
