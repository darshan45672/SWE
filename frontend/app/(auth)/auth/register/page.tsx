"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X, AlertCircle, User, Mail, Phone, MapPin, Building, Briefcase, Clock, Globe2, Shield, Settings, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { RegisterFormData } from "@/types/auth";
import { validatePassword } from "@/lib/auth-utils";
import { completeRegistrationSchema } from "@/lib/registration-schemas";

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "US/Eastern", label: "Eastern Time (UTC-5/-4)" },
  { value: "US/Central", label: "Central Time (UTC-6/-5)" },
  { value: "US/Mountain", label: "Mountain Time (UTC-7/-6)" },
  { value: "US/Pacific", label: "Pacific Time (UTC-8/-7)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
  { value: "Asia/Kolkata", label: "India (UTC+5:30)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ru", label: "Русский" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [countdown, setCountdown] = useState(5);

  // Form state management using Context7 patterns
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(completeRegistrationSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      phone: "",
      location: "",
      website: "",
      company: "",
      jobTitle: "",
      timezone: "",
      language: "en",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordValidation = validatePassword(password || "");

  // Context7 pattern: Auto-redirect countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (showVerificationDialog && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (showVerificationDialog && countdown === 0) {
      // Automatically redirect when countdown reaches 0
      router.push("/auth/signin");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showVerificationDialog, countdown, router]);

  // Form submission using Context7 patterns
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError("");
    
    try {
      console.log("🚀 Submitting comprehensive registration:", {
        hasBasicInfo: !!(data.name && data.email),
        hasContactInfo: !!(data.phone || data.location || data.website),
        hasProfessionalInfo: !!(data.company || data.jobTitle),
        hasPreferences: !!(data.timezone || data.language),
        termsAccepted: data.acceptTerms
      });
      
      const result = await register(data);

      if (result.success) {
        console.log("✅ Registration successful, showing verification dialog");
        // Context7 pattern: Store email and show verification dialog instead of immediate redirect
        setRegisteredEmail(data.email);
        setCountdown(5); // Reset countdown
        setShowVerificationDialog(true);
      } else {
        setApiError(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Context7 pattern: Handle verification dialog confirmation
  const handleVerificationDialogClose = () => {
    setShowVerificationDialog(false);
    setCountdown(5); // Reset countdown
    // Redirect to sign in page immediately when user clicks button
    router.push("/auth/signin");
  };

  return (
    <AuthLayout
      title="Create Your Account"
      description="Join our platform and start managing your projects effectively"
    >
      <div className="w-full max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* API Error */}
            {apiError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {/* Basic Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential information to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description for your profile (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Help others connect with you (all optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {/* Phone Number */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="San Francisco, CA"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website */}
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe2 className="h-4 w-4" />
                          Website
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://johndoe.com"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription>
                          Your personal website, portfolio, or LinkedIn profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Share your professional background (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {/* Company */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Company
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Acme Inc."
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Job Title */}
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Software Engineer"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your experience (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {/* Timezone */}
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timezone
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONES.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe2 className="h-4 w-4" />
                        Language
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "en"}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select your language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Account Security Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
                <CardDescription>
                  Secure your account with a strong password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              {...field}
                              className="h-11 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              {...field}
                              className="h-11 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        {confirmPassword && password && password !== confirmPassword && (
                          <p className="text-sm text-destructive flex items-center gap-1.5 mt-1.5">
                            <X className="h-3.5 w-3.5" />
                            Passwords don&apos;t match
                          </p>
                        )}
                        {confirmPassword && password && password === confirmPassword && (
                          <p className="text-sm text-green-600 dark:text-green-500 flex items-center gap-1.5 mt-1.5">
                            <Check className="h-3.5 w-3.5" />
                            Passwords match
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Password Strength
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasMinLength ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className={passwordValidation.hasMinLength ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground"}>
                          8+ characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasUpperCase ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className={passwordValidation.hasUpperCase ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground"}>
                          Uppercase
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasLowerCase ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className={passwordValidation.hasLowerCase ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground"}>
                          Lowercase
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasNumber ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className={passwordValidation.hasNumber ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground"}>
                          Number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        {passwordValidation.hasSpecialChar ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className={passwordValidation.hasSpecialChar ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground"}>
                          Special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm cursor-pointer">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>{" "}
                          *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col gap-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              {/* Sign in link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Form>

        {/* Email Verification Dialog - Context7 pattern */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle className="text-center text-xl">
                Account Created Successfully!
              </DialogTitle>
              <DialogDescription className="text-center">
                A verification link has been sent to your email address.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Verification email sent to:
                </p>
                <p className="font-semibold text-foreground">
                  {registeredEmail}
                </p>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                Please check your email and click the verification link to activate your account before signing in.
              </p>
              
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> If you don&apos;t see the email, please check your spam folder. The verification link will expire in 24 hours.
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col items-center gap-3">
              <Button
                onClick={handleVerificationDialogClose}
                className="w-full sm:w-auto"
                size="lg"
              >
                Go to Sign In
              </Button>
              <p className="text-xs text-muted-foreground">
                Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthLayout>
  );
}
