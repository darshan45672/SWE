"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { IssueCard } from "./issue-card";
import { Board, Issue, IssueStatus } from "@/types";
import { useWorkspace } from "@/contexts/workspace-context";

// Static board structure - 3 columns only (frontend uses lowercase)
const STATIC_BOARD: Board = {
  id: "static-board",
  name: "Project Board",
  columns: [
    { id: "todo" as IssueStatus, title: "To Do", issues: [] },
    { id: "in-progress" as IssueStatus, title: "In Progress", issues: [] },
    { id: "done" as IssueStatus, title: "Done", issues: [] },
  ],
};

export function KanbanBoard() {
  const { currentProject, issues, updateIssueApi } = useWorkspace();
  const [board, setBoard] = useState<Board>(STATIC_BOARD);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Create virtual board from issues grouped by status
  useEffect(() => {
    if (issues && issues.length > 0) {
      const groupedBoard: Board = {
        ...STATIC_BOARD,
        columns: STATIC_BOARD.columns.map((col) => ({
          ...col,
          issues: issues.filter((issue) => issue.status === col.id),
        })),
      };
      setBoard(groupedBoard);
    } else {
      setBoard(STATIC_BOARD);
    }
  }, [issues]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!currentProject) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = board.columns
      .flatMap((col) => col.issues)
      .find((issue) => issue.id === active.id);

    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    const sourceColumn = board.columns.find((col) =>
      col.issues.some((issue) => issue.id === activeId)
    );

    const destColumn = board.columns.find(
      (col) => col.id === overId || col.issues.some((issue) => issue.id === overId)
    );

    if (!sourceColumn || !destColumn) return;

    const sourceIssueIndex = sourceColumn.issues.findIndex(
      (issue) => issue.id === activeId
    );
    const activeIssue = sourceColumn.issues[sourceIssueIndex];

    // Moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const destIssueIndex = destColumn.issues.findIndex(
        (issue) => issue.id === overId
      );

      if (sourceIssueIndex !== destIssueIndex) {
        const newIssues = arrayMove(
          sourceColumn.issues,
          sourceIssueIndex,
          destIssueIndex
        );

        setBoard({
          ...board,
          columns: board.columns.map((col) =>
            col.id === sourceColumn.id ? { ...col, issues: newIssues } : col
          ),
        });
      }
    } else {
      // Moving to a different column - update via API
      const newStatus = destColumn.id as IssueStatus;
      
      // Call API to update issue status
      updateIssueApi(activeIssue.id, {
        status: newStatus,
        title: activeIssue.title,
        description: activeIssue.description,
        type: activeIssue.type,
        priority: activeIssue.priority,
        dueDate: activeIssue.dueDate,
        tags: activeIssue.tags,
      });

      // Optimistically update UI
      const newSourceIssues = sourceColumn.issues.filter(
        (issue) => issue.id !== activeIssue.id
      );
      const newDestIssues = [...destColumn.issues, { ...activeIssue, status: newStatus }];

      setBoard({
        ...board,
        columns: board.columns.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, issues: newSourceIssues };
          }
          if (col.id === destColumn.id) {
            return { ...col, issues: newDestIssues };
          }
          return col;
        }),
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile: 3 rows with horizontal scroll, Desktop: 3 columns grid */}
      <div className="h-full overflow-y-auto p-3 sm:p-4">
        {/* Mobile Layout: Stack columns as rows */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:hidden">
          {board.columns.map((column) => (
            <KanbanColumn key={column.id} column={column} isMobileRow />
          ))}
        </div>
        
        {/* Desktop Layout: Grid columns */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 h-full">
          {board.columns.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeIssue ? <IssueCard issue={activeIssue} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
