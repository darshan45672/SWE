"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewIssueDialog } from "./view-issue-sheet";
import { EditIssueDialog } from "./edit-issue-dialog";
import { DeleteIssueAlert } from "./delete-issue-alert";
import { Issue } from "@/types";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  issue: Issue;
}

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

export function IssueCard({ issue }: IssueCardProps) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "group cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
        )}
        {...attributes}
        {...listeners}
      >
        <CardHeader className="p-3 pb-2" onClick={() => setViewOpen(true)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn("text-xs cursor-pointer", typeColors[issue.type])}>
                  {issue.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs cursor-pointer", priorityColors[issue.priority])}
                >
                  {issue.priority}
                </Badge>
              </div>
              <h4 className="font-medium text-sm leading-tight line-clamp-2 cursor-pointer">
                {issue.title}
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Actions</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setViewOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Issue
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Issue
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2 cursor-pointer">
          {issue.description}
        </p>

        {/* Tags */}
        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0 cursor-pointer"
              >
                {tag}
              </Badge>
            ))}
            {issue.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 cursor-pointer">
                +{issue.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {issue.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(issue.dueDate)}</span>
              </div>
            )}
            {issue.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{issue.comments.length}</span>
              </div>
            )}
          </div>

          {issue.assignee && (
            <Avatar className="h-6 w-6 cursor-pointer">
              <AvatarFallback className="text-xs">
                {issue.assignee.avatar || issue.assignee.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Dialogs */}
    <ViewIssueDialog issue={issue} open={viewOpen} onOpenChange={setViewOpen} />
    <EditIssueDialog issue={issue} open={editOpen} onOpenChange={setEditOpen} />
    <DeleteIssueAlert issue={issue} open={deleteOpen} onOpenChange={setDeleteOpen} />
  </>
  );
}
