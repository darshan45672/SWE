"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkspace } from "@/contexts/workspace-context";
import { Issue } from "@/types";

interface DeleteIssueAlertProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteIssueAlert({
  issue,
  open,
  onOpenChange,
  onSuccess,
}: DeleteIssueAlertProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteIssueApi } = useWorkspace();

  const handleDelete = async () => {
    if (!issue) return;
    
    setIsDeleting(true);
    
    try {
      console.log('🗑️ Deleting issue:', issue.id);
      const result = await deleteIssueApi(issue.id);
      
      if (result.success) {
        console.log('✅ Issue deleted successfully');
        toast.success('Issue deleted successfully', {
          description: `"${issue.title}" has been permanently deleted.`,
        });
        
        onOpenChange(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: redirect to dashboard if no callback provided
          router.push('/');
        }
      } else {
        console.error('❌ Failed to delete issue:', result.message);
        toast.error('Failed to delete issue', {
          description: result.message || 'An error occurred while deleting the issue.',
        });
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('Failed to delete issue', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!issue) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the issue{" "}
            <span className="font-semibold">&ldquo;{issue.title}&rdquo;</span> and remove all
            associated data including comments and attachments.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Issue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
