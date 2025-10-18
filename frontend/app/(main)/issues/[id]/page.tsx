"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { ArrowLeft, Calendar, Tag, MessageSquare, Clock, User, UserPlus, CalendarCheck, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditIssueDialog } from "@/components/kanban/edit-issue-dialog";
import { DeleteIssueAlert } from "@/components/kanban/delete-issue-alert";
import { cn } from "@/lib/utils";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  urgent: "bg-red-500/10 text-red-500 border-red-500/20",
};

const typeColors = {
  bug: "bg-red-500/10 text-red-600",
  feature: "bg-purple-500/10 text-purple-600",
  task: "bg-blue-500/10 text-blue-600",
  improvement: "bg-green-500/10 text-green-600",
};

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { issues } = useWorkspace();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const issueId = params.id as string;

  // Find the issue from the issues array
  const issue = issues?.find((issue) => issue.id === issueId);

  if (!issue) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Issue not found</h2>
          <p className="text-muted-foreground">
            The issue you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Board
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date));
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateShort = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date));
    } catch (error) {
      return "Invalid date";
    }
  };

  const getDaysUntilDue = (dueDate: Date | null | undefined) => {
    if (!dueDate) return 0;
    try {
      const now = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  };

  const getDueDateStatus = (dueDate: Date | null | undefined) => {
    if (!dueDate) {
      return { label: "No Due Date", color: "text-muted-foreground", bgColor: "bg-muted" };
    }
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil < 0) {
      return { label: "Overdue", color: "text-red-500", bgColor: "bg-red-500/10" };
    } else if (daysUntil === 0) {
      return { label: "Due Today", color: "text-orange-500", bgColor: "bg-orange-500/10" };
    } else if (daysUntil <= 3) {
      return { label: "Due Soon", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
    }
    return { label: "On Track", color: "text-green-500", bgColor: "bg-green-500/10" };
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={cn("text-xs", typeColors[issue.type])}>
                {issue.type}
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
            <h1 className="text-3xl font-bold">{issue.title}</h1>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Issue</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Issue</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {issue.description}
                </p>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                  <Badge variant="secondary" className="ml-auto">
                    {issue.comments.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {issue.comments.length > 0 ? (
                  <div className="space-y-4">
                    {issue.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author?.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {comment.author?.name?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.author?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Assigned to</span>
                  </div>
                  {issue.assignee ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 ml-6 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={issue.assignee.avatar || undefined} alt={issue.assignee.name} />
                              <AvatarFallback className="text-xs">
                                {issue.assignee.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{issue.assignee.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{issue.assignee.email}</p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Assigned to {issue.assignee.name}</p>
                          <p className="text-xs text-muted-foreground">{issue.assignee.email}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <p className="text-sm ml-6 text-muted-foreground">Unassigned</p>
                  )}
                </div>

                {/* Assigner */}
                {issue.assigner && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserPlus className="h-4 w-4" />
                        <span>Assigned by</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 ml-6 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={issue.assigner.avatar || undefined} alt={issue.assigner.name} />
                                <AvatarFallback className="text-xs">
                                  {issue.assigner.name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{issue.assigner.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{issue.assigner.email}</p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Assigned by {issue.assigner.name}</p>
                            <p className="text-xs text-muted-foreground">{issue.assigner.email}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                )}

                {/* Assignment Date */}
                {issue.assignedAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarCheck className="h-4 w-4" />
                        <span>Assigned on</span>
                      </div>
                      <p className="text-sm ml-6">{formatDate(issue.assignedAt)}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timeline & Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Due Date */}
                {issue.dueDate && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due Date</span>
                      </div>
                      <div className="ml-6 space-y-2">
                        <p className="text-sm font-medium">{formatDateShort(issue.dueDate)}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              getDueDateStatus(issue.dueDate).bgColor,
                              getDueDateStatus(issue.dueDate).color
                            )}
                          >
                            {getDueDateStatus(issue.dueDate).label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.abs(getDaysUntilDue(issue.dueDate))} days {getDaysUntilDue(issue.dueDate) < 0 ? "overdue" : "remaining"}
                          </span>
                        </div>
                        {getDaysUntilDue(issue.dueDate) < 0 && (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>This issue is overdue</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Created */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Created</span>
                  </div>
                  <p className="text-sm ml-6">{formatDate(issue.createdAt)}</p>
                </div>

                <Separator />

                {/* Updated */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last Updated</span>
                  </div>
                  <p className="text-sm ml-6">{formatDate(issue.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {issue.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {issue.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EditIssueDialog issue={issue} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteIssueAlert issue={issue} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  );
}
