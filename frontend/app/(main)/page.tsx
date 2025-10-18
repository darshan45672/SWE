"use client";

import dynamic from "next/dynamic";
import { FolderKanban, Layers } from "lucide-react";
import { useWorkspace } from "@/contexts/workspace-context";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CreateProjectDialog } from "@/components/workspace/create-project-dialog";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { Button } from "@/components/ui/button";

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
  const { currentWorkspace, currentProject, loading } = useWorkspace();

  return (
    <DashboardContent 
      currentWorkspace={currentWorkspace} 
      currentProject={currentProject}
      loading={loading}
    />
  );
}

function DashboardContent({ 
  currentWorkspace, 
  currentProject, 
  loading 
}: { 
  currentWorkspace: unknown; 
  currentProject: unknown;
  loading: boolean;
}) {
  // Show loading state while fetching data - Context7 pattern
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show create workspace prompt when no workspace exists - Context7 UX pattern
  if (!currentWorkspace) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No Workspace Yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first workspace. A workspace helps you organize your projects and collaborate with your team.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateWorkspaceDialog>
              <Button size="lg" className="gap-2">
                <Layers className="h-4 w-4" />
                Create Your First Workspace
              </Button>
            </CreateWorkspaceDialog>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // Show empty state when no project is selected - Context7 UX pattern
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

