"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWorkspace } from "@/contexts/workspace-context";
import { CalendarIcon, FolderKanban, Users, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  projectDescription?: string;
}

export function ProjectDetailsDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  projectDescription,
}: ProjectDetailsDialogProps) {
  const { projects, issues, currentWorkspace, currentProject } = useWorkspace();
  
  // Find the project
  const project = projects.find(p => p.id === projectId);
  
  // Use all issues if viewing current project, otherwise empty (since we only have current project's issues loaded)
  const projectIssues = currentProject?.id === projectId ? issues : [];
  const totalIssues = projectIssues.length;
  const completedIssues = projectIssues.filter(issue => issue.status === 'done').length;
  const inProgressIssues = projectIssues.filter(issue => issue.status === 'in-progress').length;
  const todoIssues = projectIssues.filter(issue => issue.status === 'todo').length;
  
  // Calculate completion percentage
  const completionPercentage = totalIssues > 0 
    ? Math.round((completedIssues / totalIssues) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">{projectName}</DialogTitle>
              <DialogDescription className="mt-1">
                {currentWorkspace?.name || "Workspace"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Description */}
          {projectDescription && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </h4>
              <p className="text-sm text-muted-foreground">
                {projectDescription}
              </p>
            </div>
          )}

          <Separator />

          {/* Project Stats */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Project Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-2xl font-bold">{totalIssues}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Issues</div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="text-2xl font-bold">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground mt-1">Completed</div>
              </div>
            </div>
          </div>

          {/* Issue Breakdown */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Issue Breakdown</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm">To Do</span>
                </div>
                <Badge variant="secondary">{todoIssues}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge variant="secondary">{inProgressIssues}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Done</span>
                </div>
                <Badge variant="secondary">{completedIssues}</Badge>
              </div>
            </div>
          </div>

          {/* Project Info */}
          {project && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Project Information
              </h4>
              <div className="space-y-2 text-sm">
                {project.key && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project Key:</span>
                    <Badge variant="outline">{project.key}</Badge>
                  </div>
                )}
                {project.isActive !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={project.isActive ? "default" : "secondary"}>
                      {project.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                )}
                {project.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {format(new Date(project.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {project.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {format(new Date(project.updatedAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
