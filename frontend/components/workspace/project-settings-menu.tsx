"use client";

import { useState } from "react";
import { Settings2, Eye, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditProjectDialog } from "./edit-project-dialog";
import { DeleteProjectAlert } from "./delete-project-alert";
import { ProjectDetailsDialog } from "./project-details-dialog";

interface ProjectSettingsMenuProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  projectIsActive?: boolean;
}

export function ProjectSettingsMenu({
  projectId,
  projectName,
  projectDescription,
  projectIsActive,
}: ProjectSettingsMenuProps) {
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Project settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Project Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailsDialog(true);
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowEditDialog(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            <span>Edit Project</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteAlert(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        projectId={projectId}
        projectName={projectName}
        projectDescription={projectDescription}
      />

      {/* Edit Project Dialog */}
      <EditProjectDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        projectId={projectId}
        projectName={projectName}
        projectDescription={projectDescription}
        projectIsActive={projectIsActive}
      />

      {/* Delete Project Alert */}
      <DeleteProjectAlert
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
}
