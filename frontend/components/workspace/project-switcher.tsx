"use client";

import { Check, ChevronsUpDown, FolderKanban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/contexts/workspace-context";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectSettingsMenu } from "./project-settings-menu";

interface ProjectSwitcherProps {
  className?: string;
}

export function ProjectSwitcher({ className }: ProjectSwitcherProps) {
  const { currentProject, projects, switchProject } = useWorkspace();

  if (!currentProject) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            className={cn("justify-between gap-2 px-3 flex-1", className)}
          >
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              <span className="font-medium">{currentProject.name}</span>
              <Badge 
                variant={currentProject.isActive ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {currentProject.isActive ? "Active" : "Inactive"}
              </Badge>
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
              <Badge 
                variant={project.isActive ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {project.isActive ? "Active" : "Inactive"}
              </Badge>
              {currentProject.id === project.id && (
                <Check className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <CreateProjectDialog />
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Project Settings Menu */}
      <ProjectSettingsMenu
        projectId={currentProject.id}
        projectName={currentProject.name}
        projectDescription={currentProject.description}
        projectIsActive={currentProject.isActive}
      />
    </div>
  );
}
