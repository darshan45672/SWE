"use client";

import { useState } from "react";
import { UserPlus, Mail, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkspace } from "@/contexts/workspace-context";
import { sendInvitation } from "@/lib/api/invitations";

interface InviteWorkspaceDialogProps {
  variant?: "default" | "sidebar";
}

export function InviteWorkspaceDialog({ variant = "default" }: InviteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  // Generate invite link (mock)
  const inviteLink = currentWorkspace 
    ? `${window.location.origin}/invite/${currentWorkspace.id}`
    : "";

  const handleSendInvite = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!currentWorkspace) {
      setError("No workspace selected");
      return;
    }

    setLoading(true);

    try {
      // Call the API to send invitation
      const result = await sendInvitation(currentWorkspace.id, {
        email,
        role,
      });

      if (result.success) {
        setSuccess(result.message || `Invitation sent to ${email}`);
        // Clear form and close dialog after 2 seconds
        setTimeout(() => {
          setEmail("");
          setRole("MEMBER");
          setSuccess("");
          setOpen(false);
        }, 2000);
      } else {
        setError(result.message || "Failed to send invitation");
      }
    } catch (err) {
      console.error("Exception sending invitation:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setSuccess("Invite link copied to clipboard");
      setTimeout(() => {
        setCopied(false);
        setSuccess("");
      }, 2000);
    } catch {
      setError("Could not copy link to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "sidebar" ? (
          <Button variant="outline" size="sm" className="w-full gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Invite Members</span>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite to Workspace</DialogTitle>
          <DialogDescription>
            Invite team members to join{" "}
            <span className="font-semibold">{currentWorkspace?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Success/Error Messages */}
          {success && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Email Invite Section */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendInvite();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSendInvite} 
            className="w-full gap-2"
            disabled={loading}
          >
            <Mail className="h-4 w-4" />
            {loading ? "Sending..." : "Send Invitation"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or share link
              </span>
            </div>
          </div>

          {/* Invite Link Section */}
          <div className="space-y-2">
            <Label htmlFor="link">Invite Link</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={inviteLink}
                readOnly
                className="flex-1 bg-muted"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join the workspace
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
