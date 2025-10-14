"use client";

import { Check, ChevronsUpDown, FolderKanban, Plus } from "lucide-react";
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

interface ProjectSwitcherProps {
  className?: string;
}

export function ProjectSwitcher({ className }: ProjectSwitcherProps) {
  const { currentProject, projects, switchProject } = useWorkspace();

  if (!currentProject) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          className={cn("justify-between gap-2 px-3 w-full", className)}
        >
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <span className="font-medium">{currentProject.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]" align="start">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onSelect={() => switchProject(project.id)}
            className="flex items-center gap-2"
          >
            <FolderKanban className="h-4 w-4" />
            <span className="flex-1">{project.name}</span>
            {currentProject.id === project.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span>Create project</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
