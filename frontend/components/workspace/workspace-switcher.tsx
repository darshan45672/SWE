"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
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

interface WorkspaceSwitcherProps {
  className?: string;
}

export function WorkspaceSwitcher({ className }: WorkspaceSwitcherProps) {
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();

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
        {workspaces.map((workspace) => (
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
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span>Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
