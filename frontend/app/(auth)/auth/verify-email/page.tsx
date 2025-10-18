"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error" | "expired" | "already-verified">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && verificationStatus === "idle") {
      handleVerifyToken(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVerifyToken = async (verificationToken: string) => {
    setIsVerifying(true);
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/verification/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: verificationToken }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Check if already verified
        if (data.data?.alreadyVerified) {
          setVerificationStatus("already-verified");
          setMessage("Your email was already verified!");
        } else {
          setVerificationStatus("success");
          setMessage("Your email has been verified successfully!");
        }
        
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        // Check if token expired
        if (data.message && data.message.toLowerCase().includes("expired")) {
          setVerificationStatus("expired");
          setMessage("Your verification link has expired. Please request a new one.");
        } else {
          setVerificationStatus("error");
          setMessage(data.message || "Verification failed. The link may be invalid or expired.");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus("error");
      setMessage("Failed to verify email. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/v1/verification/resend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setVerificationStatus("idle");
        setMessage("Verification email sent! Please check your inbox.");
        setResendCooldown(60); // 60 second cooldown
      } else {
        setMessage(data.message || "Failed to resend verification email");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title={
        verificationStatus === "success" || verificationStatus === "already-verified"
          ? "Email Verified!"
          : verificationStatus === "error"
          ? "Verification Failed"
          : verificationStatus === "expired"
          ? "Link Expired"
          : "Verify Your Email"
      }
      description={
        verificationStatus === "success"
          ? "Your email has been successfully verified"
          : verificationStatus === "already-verified"
          ? "Your email was already verified"
          : verificationStatus === "error"
          ? "There was a problem verifying your email"
          : verificationStatus === "expired"
          ? "Your verification link has expired"
          : "Check your email for a verification link"
      }
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Status Icon */}
        {isVerifying ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying your email...</p>
          </div>
        ) : verificationStatus === "success" || verificationStatus === "already-verified" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {message || "Email Verified Successfully!"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {verificationStatus === "already-verified" 
                  ? "You can now sign in to your account."
                  : "Redirecting you to sign in..."}
              </p>
            </div>
          </div>
        ) : verificationStatus === "expired" ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/20 p-4">
              <AlertCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                Verification Link Expired
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {message || "Your verification link has expired. Verification links are valid for 24 hours."}
              </p>
            </div>

            {/* Resend Email Form for Expired */}
            <div className="w-full space-y-4 mt-4">
              <p className="text-sm text-center font-medium">
                Request a new verification link
              </p>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={isResending}
                  />
                </div>
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>Wait {resendCooldown}s</>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Send New Verification Link
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : verificationStatus === "error" ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                Verification Failed
              </p>
              {message && (
                <p className="text-sm text-muted-foreground mt-2">{message}</p>
              )}
            </div>

            {/* Resend Email Form */}
            <div className="w-full space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={isResending}
                  />
                </div>
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>Wait {resendCooldown}s</>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-16 w-16 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                A verification link has been sent to your email address.
                <br />
                Click the link in the email to verify your account.
              </p>
            </div>

            {/* Resend Email Form */}
            <div className="w-full space-y-4 mt-4">
              <p className="text-sm text-center text-muted-foreground">
                Didn&apos;t receive the email?
              </p>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={isResending}
                  />
                </div>
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  <>Wait {resendCooldown}s</>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              {message && (
                <p className="text-sm text-center text-muted-foreground mt-2">
                  {message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Back to Sign In */}
        {verificationStatus !== "success" && verificationStatus !== "already-verified" && (
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/signin")}
            className="w-full"
          >
            Back to Sign In
          </Button>
        )}

        {/* Sign In Now for Already Verified */}
        {verificationStatus === "already-verified" && (
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full"
          >
            Sign In Now
          </Button>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Loading..." description="Please wait">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
