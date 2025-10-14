"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/auth-utils";
import type { ForgotPasswordFormData } from "@/types/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    if (!formData.email) {
      setError("Email is required");
      return false;
    }
    if (!isValidEmail(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        description="We've sent you password reset instructions"
      >
        <div className="space-y-6">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-3">
              <Check className="h-6 w-6 text-green-500" />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to
            </p>
            <p className="text-sm font-medium">{formData.email}</p>
          </div>

          {/* Additional info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">What to do next:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Check your email inbox</li>
              <li>Click the reset link in the email</li>
              <li>Create a new password</li>
              <li>Link expires in 1 hour</li>
            </ul>
          </div>

          {/* Resend link */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email?
            </p>
            <Button
              variant="link"
              onClick={() => setIsSubmitted(false)}
              className="p-0 h-auto font-normal"
            >
              Try a different email
            </Button>
          </div>

          {/* Back to sign in */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      description="Enter your email address and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Email input */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ email: e.target.value });
              setError("");
            }}
            className={error ? "border-destructive" : ""}
            disabled={isLoading}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send reset link"
          )}
        </Button>

        {/* Back to sign in */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => router.push("/auth/signin")}
          type="button"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
