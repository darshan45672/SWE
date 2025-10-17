"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface InvitationDetails {
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  };
  workspace: {
    id: string;
    name: string;
    description?: string;
  };
  inviter: {
    name: string;
    email: string;
  };
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [details, setDetails] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const fetchInvitationDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/invitations/${token}`,
        {
          credentials: "include",
        }
      );

      const result = await response.json();
      console.log("📥 Invitation details response:", result);

      if (!response.ok) {
        setError(result.message || "Failed to load invitation");
        setLoading(false);
        return;
      }

      setDetails(result.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("Failed to load invitation details");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    }
  }, [token, fetchInvitationDetails]);

  const handleAcceptInvitation = async () => {
    setAccepting(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/invitations/${token}/accept`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await response.json();
      console.log("📥 Accept invitation response:", response.status, result);

      if (!response.ok) {
        // User not authenticated - redirect to sign in
        if (response.status === 401) {
          setError("Please sign in to accept this invitation.");
          setTimeout(() => {
            router.push(`/auth/signin?redirect=/invite/${token}`);
          }, 1500);
          return;
        }
        
        if (result.requiresVerification) {
          setError("Please verify your email address before accepting this invitation.");
          setAccepting(false);
          return;
        }
        setError(result.message || "Failed to accept invitation");
        setAccepting(false);
        return;
      }

      setSuccess(true);
      // Redirect to workspace after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("An error occurred while accepting the invitation");
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!confirm("Are you sure you want to decline this invitation?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/invitations/${token}/decline`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Failed to decline invitation");
        return;
      }

      router.push("/");
    } catch (err) {
      setError("An error occurred while declining the invitation");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-center">Invitation Accepted!</CardTitle>
            <CardDescription className="text-center">
              You are now a member of {details?.workspace.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Redirecting to workspace...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (details?.invitation?.status === "EXPIRED") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-center">Invitation Expired</CardTitle>
            <CardDescription className="text-center">
              This invitation has expired. Please contact the workspace admin for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Workspace Invitation</CardTitle>
          <CardDescription className="text-center">
            You&apos;ve been invited to join a workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {details && (
            <>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-semibold text-lg">{details.workspace?.name || 'Workspace'}</h3>
                  {details.workspace?.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {details.workspace.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invited by:</span>
                    <span className="font-medium">{details.inviter?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your email:</span>
                    <span className="font-medium">{details.invitation?.email || ''}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="font-medium capitalize">
                      {details.invitation?.role?.toLowerCase() || 'member'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium">
                      {details.invitation?.expiresAt
                        ? new Date(details.invitation.expiresAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleDeclineInvitation}
                  variant="outline"
                  className="flex-1"
                  disabled={accepting}
                >
                  Decline
                </Button>
                <Button
                  onClick={handleAcceptInvitation}
                  className="flex-1"
                  disabled={accepting}
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    "Accept Invitation"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
