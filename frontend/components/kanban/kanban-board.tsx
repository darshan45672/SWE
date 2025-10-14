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

export function KanbanBoard() {
  const { currentProject } = useWorkspace();
  const [board, setBoard] = useState<Board | null>(
    currentProject?.board || null
  );
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Update board when project changes
  useEffect(() => {
    if (currentProject?.board) {
      setBoard(currentProject.board);
    }
  }, [currentProject]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!board || !currentProject) {
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
      // Moving to a different column
      const updatedIssue = {
        ...activeIssue,
        status: destColumn.id as IssueStatus,
        updatedAt: new Date(),
      };

      const newSourceIssues = sourceColumn.issues.filter(
        (issue) => issue.id !== activeId
      );

      let newDestIssues;
      const destIssueIndex = destColumn.issues.findIndex(
        (issue) => issue.id === overId
      );

      if (destIssueIndex === -1) {
        // Dropped on the column itself
        newDestIssues = [...destColumn.issues, updatedIssue];
      } else {
        // Dropped on a specific issue
        newDestIssues = [...destColumn.issues];
        newDestIssues.splice(destIssueIndex, 0, updatedIssue);
      }

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
      <div className="grid h-full grid-cols-3 gap-4 p-4">
        {board.columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>

      <DragOverlay>
        {activeIssue ? <IssueCard issue={activeIssue} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
