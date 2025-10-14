"use client";

import dynamic from "next/dynamic";

// Dynamically import KanbanBoard with no SSR to avoid hydration issues with @dnd-kit
const KanbanBoard = dynamic(
  () => import("@/components/kanban/kanban-board").then((mod) => ({ default: mod.KanbanBoard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading board...</p>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      {/* Kanban Board - Main Content (Wider Column) */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}

