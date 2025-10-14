"use client";

import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { ArrowLeft, Calendar, User, Tag, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const { currentProject } = useWorkspace();

  const issueId = params.id as string;

  // Find the issue from the current project
  const issue = currentProject?.board.columns
    .flatMap((col) => col.issues)
    .find((issue) => issue.id === issueId);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
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
                          <AvatarFallback className="text-xs">
                            {comment.author.avatar || comment.author.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {comment.author.name}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Assignee</span>
                  </div>
                  {issue.assignee ? (
                    <div className="flex items-center gap-2 ml-6">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {issue.assignee.avatar || issue.assignee.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{issue.assignee.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground ml-6">Unassigned</p>
                  )}
                </div>

                <Separator />

                {/* Reporter */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Reporter</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {issue.reporter.avatar || issue.reporter.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{issue.reporter.name}</span>
                  </div>
                </div>

                <Separator />

                {/* Due Date */}
                {issue.dueDate && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Due Date</span>
                      </div>
                      <p className="text-sm ml-6">{formatDateShort(issue.dueDate)}</p>
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
                    <span>Updated</span>
                  </div>
                  <p className="text-sm ml-6">{formatDate(issue.updatedAt)}</p>
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
                      <div className="flex flex-wrap gap-1 ml-6">
                        {issue.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
