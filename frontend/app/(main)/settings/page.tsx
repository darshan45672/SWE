"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Eye, EyeOff, Mail, Bell, Laptop, Smartphone, Trash2 } from "lucide-react";
import { useWorkspace } from "@/contexts/workspace-context";
import { TwoFactorSettings } from "@/components/auth/two-factor-settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Password change validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Mock active sessions data
const mockSessions = [
  {
    id: "1",
    device: "Chrome on MacBook Pro",
    location: "San Francisco, CA",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "2",
    device: "Safari on iPhone 15",
    location: "San Francisco, CA",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "3",
    device: "Firefox on Windows 11",
    location: "New York, NY",
    lastActive: "1 day ago",
    current: false,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(false);

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Get auth token
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        toast.error('You must be logged in to change your password');
        setIsLoading(false);
        return;
      }

      // Call the API to update password
      const updatePassword = async (updateData: { currentPassword: string; newPassword: string }, authToken: string) => {
        console.log('🔐 Sending password update request...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const endpoint = `${apiUrl}/api/v1/auth/password`;
        console.log('🔐 API endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(updateData),
        });

        const result = await response.json();
        console.log('🔐 Password update response:', { status: response.status, result });
        return result;
      };

      const result = await updatePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        token
      );

      if (result.success) {
        toast.success('Password updated successfully!', {
          description: 'Your password has been changed. Please remember it for future logins.',
        });
        passwordForm.reset();
      } else {
        console.error('❌ Password update failed:', result);
        toast.error('Failed to update password', {
          description: result.message || 'Please check your current password and try again.',
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('An error occurred', {
        description: 'Unable to update your password. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    console.log("Revoke session:", sessionId);
    // In a real app, this would revoke the session
  };

  const handleDeleteAccount = () => {
    console.log("Delete account requested");
    // In a real app, this would initiate account deletion
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Must be at least 8 characters with uppercase, lowercase, number, and special character
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => passwordForm.reset()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Two-Factor Authentication */}
          <TwoFactorSettings />

          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>
                Your email address verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{currentUser.email}</p>
                    <p className="text-sm text-muted-foreground">Primary email</p>
                  </div>
                </div>
                {currentUser.emailVerified ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
                ) : (
                  <Badge variant="destructive">Not Verified</Badge>
                )}
              </div>
              {!currentUser.emailVerified && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Please verify your email to access all features
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/auth/verify-email')}
                  >
                    Verify Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across all devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSessions.map((session, index) => (
                <div key={session.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {session.device.includes("iPhone") ? (
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Laptop className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{session.device}</p>
                          {session.current && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will sign out the device. You&apos;ll need to sign in again on that device.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRevokeSession(session.id)}>
                              Revoke
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  {index < mockSessions.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}

              <Separator />

              <Button variant="outline" className="w-full">
                Sign Out All Other Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure how you receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your account via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="security-alerts" className="text-base">
                    Security Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about important security updates
                  </p>
                </div>
                <Switch
                  id="security-alerts"
                  checked={securityAlerts}
                  onCheckedChange={setSecurityAlerts}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="login-notifications" className="text-base">
                    Login Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone signs in to your account
                  </p>
                </div>
                <Switch
                  id="login-notifications"
                  checked={loginNotifications}
                  onCheckedChange={setLoginNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Browser push notifications for real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label className="text-base">Browser Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable browser notifications for this device
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
