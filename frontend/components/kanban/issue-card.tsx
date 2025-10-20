"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, MessageSquare, Eye, Pencil, Trash2, User, Clock, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const router = useRouter();
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

  const handleCardClick = () => {
    router.push(`/issues/${issue.id}`);
  };

  const handleViewDetails = () => {
    router.push(`/issues/${issue.id}`);
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
        <CardHeader className="p-3 pb-2" onClick={handleCardClick}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono px-1.5 py-0 h-5 bg-muted/50">
                  #{issue.issueNumber}
                </Badge>
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
                  <DropdownMenuItem onClick={handleViewDetails}>
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

        <Separator className="my-2" />

        {/* Metadata Section */}
        <div className="space-y-2">
          {/* Assignee and Assigner */}
          <div className="flex items-center justify-between gap-2">
            {/* Assignee */}
            {issue.assignee ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <User className="h-3 w-3" />
                      <span className="font-medium">Assigned to:</span>
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={issue.assignee.avatar || undefined} alt={issue.assignee.name} />
                        <AvatarFallback className="text-[10px]">
                          {issue.assignee.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[60px]">{issue.assignee.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assigned to {issue.assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{issue.assignee.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="font-medium">Assigned to:</span>
                <span>Unassigned</span>
              </div>
            )}

            {/* Assigner */}
            {issue.assigner && issue.assignee && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <UserPlus className="h-3 w-3" />
                      <span className="font-medium">By:</span>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={issue.assigner.avatar || undefined} alt={issue.assigner.name} />
                        <AvatarFallback className="text-[8px]">
                          {issue.assigner.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Assigned by {issue.assigner.name}</p>
                    <p className="text-xs text-muted-foreground">{issue.assigner.email}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Dates and Comments Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {/* Due Date */}
              {issue.dueDate && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">Due:</span>
                        <span>{formatDate(issue.dueDate)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Due date: {new Date(issue.dueDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Comments */}
              {issue.comments.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                        <MessageSquare className="h-3 w-3" />
                        <span>{issue.comments.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{issue.comments.length} comment{issue.comments.length !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Created Date */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">Created:</span>
                    <span>{formatDate(issue.createdAt)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Created: {new Date(issue.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Dialogs */}
    <EditIssueDialog issue={issue} open={editOpen} onOpenChange={setEditOpen} />
    <DeleteIssueAlert issue={issue} open={deleteOpen} onOpenChange={setDeleteOpen} />
  </>
  );
}
