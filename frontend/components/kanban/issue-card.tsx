"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, GripVertical, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary"
      )}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", typeColors[issue.type])}>
                {issue.type}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", priorityColors[issue.priority])}
              >
                {issue.priority}
              </Badge>
            </div>
            <h4 className="font-medium text-sm leading-tight line-clamp-2">
              {issue.title}
            </h4>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {issue.description}
        </p>

        {/* Tags */}
        {issue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {issue.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {issue.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
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
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {issue.assignee.avatar || issue.assignee.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
