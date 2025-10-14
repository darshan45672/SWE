"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IssueCard } from "./issue-card";
import { CreateIssueDialog } from "./create-issue-dialog";
import { Column } from "@/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: Column;
}

const columnColors = {
  todo: "border-blue-500/20 bg-blue-500/5",
  "in-progress": "border-yellow-500/20 bg-yellow-500/5",
  done: "border-green-500/20 bg-green-500/5",
};

const columnBadgeColors = {
  todo: "bg-blue-500/10 text-blue-600",
  "in-progress": "bg-yellow-500/10 text-yellow-600",
  done: "bg-green-500/10 text-green-600",
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-lg border-2 bg-muted/50 transition-colors",
        columnColors[column.id],
        isOver && "border-primary bg-primary/5"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b bg-background/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <Badge
            variant="secondary"
            className={cn("h-5 px-1.5 text-xs", columnBadgeColors[column.id])}
          >
            {column.issues.length}
          </Badge>
        </div>
        <CreateIssueDialog defaultStatus={column.id} />
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1">
        <div
          ref={setNodeRef}
          className="space-y-3 p-3 min-h-[200px]"
        >
          <SortableContext
            items={column.issues.map((issue) => issue.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </SortableContext>

          {column.issues.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-sm">No issues</p>
              <p className="text-xs">Drag issues here or create new ones</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
