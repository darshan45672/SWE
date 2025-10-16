"use client";

import { format } from "date-fns";
import { Calendar, Clock, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Issue } from "@/types";
import { cn } from "@/lib/utils";

interface ViewIssueDialogProps {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",
};

const typeColors = {
  bug: "bg-red-500/10 text-red-600",
  feature: "bg-purple-500/10 text-purple-600",
  task: "bg-blue-500/10 text-blue-600",
  improvement: "bg-green-500/10 text-green-600",
};

const typeEmoji = {
  bug: "🐛",
  feature: "✨",
  task: "📋",
  improvement: "🚀",
};

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export function ViewIssueDialog({
  issue,
  open,
  onOpenChange,
}: ViewIssueDialogProps) {
  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn("text-xs", typeColors[issue.type])}>
                  {typeEmoji[issue.type]} {issue.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", priorityColors[issue.priority])}
                >
                  {issue.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {statusLabels[issue.status]}
                </Badge>
              </div>
              <DialogTitle className="text-2xl leading-tight pr-6">
                {issue.title}
              </DialogTitle>
              <DialogDescription className="text-base text-foreground/70">
                {issue.description}
              </DialogDescription>
            </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Metadata */}
          <div className="space-y-4">
            {/* Due Date */}
            {issue.dueDate && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[100px]">
                  <Calendar className="h-4 w-4" />
                  <span>Due Date</span>
                </div>
                <p className="text-sm font-medium">
                  {format(issue.dueDate, "PPP")}
                </p>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[100px]">
                <Clock className="h-4 w-4" />
                <span>Created</span>
              </div>
              <p className="text-sm font-medium">
                {format(issue.createdAt, "PPP 'at' p")}
              </p>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[100px]">
                <Clock className="h-4 w-4" />
                <span>Updated</span>
              </div>
              <p className="text-sm font-medium">
                {format(issue.updatedAt, "PPP 'at' p")}
              </p>
            </div>
          </div>

          {/* Tags */}
          {issue.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {issue.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comments Section */}
          {issue.comments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Comments ({issue.comments.length})
                </h3>
                <div className="space-y-4">
                  {issue.comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {comment.author.avatar ||
                              comment.author.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, "PPP")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-8">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
