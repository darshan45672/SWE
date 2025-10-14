"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Check, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validatePassword } from "@/lib/auth-utils";
import type { ResetPasswordFormData } from "@/types/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
    token: token || "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);

  const passwordValidation = validatePassword(formData.password);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
    }
    // In a real app, you would validate the token with your backend here
  }, [token]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ResetPasswordFormData, string>> = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.isValid) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    }, 1500);
  };

  // Invalid or missing token
  if (!isTokenValid) {
    return (
      <AuthLayout
        title="Invalid reset link"
        description="This password reset link is invalid or has expired"
      >
        <div className="space-y-6">
          {/* Error icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>

          {/* Error message */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">Possible reasons:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>The link has expired (links are valid for 1 hour)</li>
              <li>The link has already been used</li>
              <li>The link is malformed or incomplete</li>
            </ul>
          </div>

          {/* Request new link */}
          <Button
            className="w-full"
            onClick={() => router.push("/auth/forgot-password")}
          >
            Request new reset link
          </Button>

          {/* Back to sign in */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Back to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password reset successful"
        description="Your password has been successfully reset"
      >
        <div className="space-y-6">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-3">
              <Check className="h-6 w-6 text-green-500" />
            </div>
          </div>

          {/* Success message */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to sign in...
            </p>
          </div>

          {/* Manual redirect button */}
          <Button
            className="w-full"
            onClick={() => router.push("/auth/signin")}
          >
            Continue to sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a new password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Password requirements */}
        {formData.password && (
          <div className="rounded-lg bg-muted p-3 space-y-2">
            <p className="text-sm font-medium">Password requirements:</p>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {passwordValidation.hasMinLength ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={passwordValidation.hasMinLength ? "text-green-500" : "text-muted-foreground"}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordValidation.hasUpperCase ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={passwordValidation.hasUpperCase ? "text-green-500" : "text-muted-foreground"}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordValidation.hasLowerCase ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={passwordValidation.hasLowerCase ? "text-green-500" : "text-muted-foreground"}>
                  One lowercase letter
                </span>
              </div>
              <div className="flex items-center gap-2">
                {passwordValidation.hasNumber ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                )}
                <span className={passwordValidation.hasNumber ? "text-green-500" : "text-muted-foreground"}>
                  One number
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset password"
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
          Back to sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Loading..." description="Please wait">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
