"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Workspace, mockWorkspaces } from "@/types/workspace";
import { Board } from "@/types";
import { mockBoard } from "@/lib/mock-data";

interface Project {
  id: string;
  name: string;
  workspaceId: string;
  board: Board;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace;
  currentProject: Project | null;
  workspaces: Workspace[];
  projects: Project[];
  switchWorkspace: (workspaceId: string) => void;
  switchProject: (projectId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

// Mock projects data - in a real app, this would come from an API
const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "Main Project",
    workspaceId: "workspace-1",
    board: mockBoard,
  },
  {
    id: "project-2",
    name: "Mobile App",
    workspaceId: "workspace-1",
    board: {
      ...mockBoard,
      id: "board-2",
      name: "Mobile App Board",
    },
  },
  {
    id: "project-3",
    name: "Personal Tasks",
    workspaceId: "workspace-2",
    board: {
      ...mockBoard,
      id: "board-3",
      name: "Personal Board",
    },
  },
  {
    id: "project-4",
    name: "Team Sprint",
    workspaceId: "workspace-3",
    board: {
      ...mockBoard,
      id: "board-4",
      name: "Team Alpha Board",
    },
  },
  {
    id: "project-5",
    name: "Campaign Planning",
    workspaceId: "workspace-4",
    board: {
      ...mockBoard,
      id: "board-5",
      name: "Marketing Board",
    },
  },
];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(
    mockWorkspaces[0]
  );
  const [currentProject, setCurrentProject] = useState<Project | null>(
    mockProjects[0]
  );

  const switchWorkspace = (workspaceId: string) => {
    const workspace = mockWorkspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      // Switch to the first project in the new workspace
      const firstProjectInWorkspace = mockProjects.find(
        (p) => p.workspaceId === workspaceId
      );
      setCurrentProject(firstProjectInWorkspace || null);
    }
  };

  const switchProject = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      // Optionally switch workspace if project belongs to different workspace
      if (project.workspaceId !== currentWorkspace.id) {
        const workspace = mockWorkspaces.find(
          (w) => w.id === project.workspaceId
        );
        if (workspace) {
          setCurrentWorkspace(workspace);
        }
      }
    }
  };

  // Get projects for current workspace
  const projects = mockProjects.filter(
    (p) => p.workspaceId === currentWorkspace.id
  );

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        currentProject,
        workspaces: mockWorkspaces,
        projects,
        switchWorkspace,
        switchProject,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
