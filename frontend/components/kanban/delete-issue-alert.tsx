"use client";

import { useState } from "react";
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
}

export function DeleteIssueAlert({
  issue,
  open,
  onOpenChange,
}: DeleteIssueAlertProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteIssueApi } = useWorkspace();

  const handleDelete = async () => {
    if (issue) {
      setIsDeleting(true);
      const result = await deleteIssueApi(issue.id);
      setIsDeleting(false);
      
      if (result.success) {
        onOpenChange(false);
      } else {
        console.error('Failed to delete issue:', result.message);
        // TODO: Show error toast/notification
      }
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
            associated data.
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
