"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/workspace-context";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

interface WorkspaceSwitcherProps {
  className?: string;
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  const { currentWorkspace, workspaces, switchWorkspace, loading } = useWorkspace();

  // Show loading state while fetching - Context7 pattern
  if (loading) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn("justify-between gap-2 px-3", className)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs">
            🚀
          </div>
          <span className="font-medium text-muted-foreground">Loading...</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  // Show create workspace button when no workspace exists - Context7 UX pattern
  if (!currentWorkspace && workspaces.length === 0) {
    return (
      <CreateWorkspaceDialog>
        <Button
          variant="outline"
          className={cn("justify-between gap-2 px-3", className)}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs">
              🚀
            </div>
            <span className="font-medium">Create Workspace</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </CreateWorkspaceDialog>
    );
  }

  // Show placeholder when workspace exists but none selected - Context7 pattern
  if (!currentWorkspace) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn("justify-between gap-2 px-3", className)}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs">
            🚀
          </div>
          <span className="font-medium text-muted-foreground">No Workspace</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("justify-between gap-2 px-3", className)}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-xs",
                currentWorkspace.color
              )}
            >
              {currentWorkspace.icon}
            </div>
            <span className="font-medium">{currentWorkspace.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No workspaces yet
          </div>
        ) : (
          workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => switchWorkspace(workspace.id)}
              className="flex items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded text-xs",
                  workspace.color
                )}
              >
                {workspace.icon}
              </div>
              <span className="flex-1">{workspace.name}</span>
              {currentWorkspace.id === workspace.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <CreateWorkspaceDialog />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
