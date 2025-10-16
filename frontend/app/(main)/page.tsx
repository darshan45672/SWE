"use client";

import dynamic from "next/dynamic";
import { FolderKanban } from "lucide-react";
import { useWorkspace } from "@/contexts/workspace-context";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CreateProjectDialog } from "@/components/workspace/create-project-dialog";

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
  const { currentProject } = useWorkspace();

  return (
    <AuthGuard 
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      }
    >
      <DashboardContent currentProject={currentProject} />
    </AuthGuard>
  );
}

function DashboardContent({ currentProject }: { currentProject: any }) {
  // Show empty state when no project is selected
  if (!currentProject) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderKanban className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No Project Selected</EmptyTitle>
            <EmptyDescription>
              Get started by creating a new project or selecting an existing one from the sidebar.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateProjectDialog variant="empty" />
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
      {/* Kanban Board - Main Content (Wider Column) */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}

