"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Workspace, mockWorkspaces } from "@/types/workspace";
import { Board, Issue, IssueStatus, Priority, IssueType, User } from "@/types";
import { mockBoard, mockUsers } from "@/lib/mock-data";

interface Project {
  id: string;
  name: string;
  key?: string;
  description?: string;
  workspaceId: string;
  board: Board;
}

interface CreateIssueData {
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  status: IssueStatus;
  assigneeId?: string;
  dueDate?: Date;
  tags: string[];
}

interface WorkspaceContextType {
  currentWorkspace: Workspace;
  currentProject: Project | null;
  workspaces: Workspace[];
  projects: Project[];
  switchWorkspace: (workspaceId: string) => void;
  switchProject: (projectId: string) => void;
  addProject: (project: Omit<Project, "board">) => void;
  addWorkspace: (workspace: Workspace) => void;
  addIssue: (issueData: CreateIssueData) => void;
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
  const [allProjects, setAllProjects] = useState<Project[]>(mockProjects);
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>(mockWorkspaces);

  const switchWorkspace = (workspaceId: string) => {
    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      // Switch to the first project in the new workspace
      const firstProjectInWorkspace = allProjects.find(
        (p) => p.workspaceId === workspaceId
      );
      setCurrentProject(firstProjectInWorkspace || null);
    }
  };

  const switchProject = (projectId: string) => {
    const project = allProjects.find((p) => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      // Optionally switch workspace if project belongs to different workspace
      if (project.workspaceId !== currentWorkspace.id) {
        const workspace = allWorkspaces.find(
          (w) => w.id === project.workspaceId
        );
        if (workspace) {
          setCurrentWorkspace(workspace);
        }
      }
    }
  };

  const addProject = (newProject: Omit<Project, "board">) => {
    const projectWithBoard: Project = {
      ...newProject,
      board: {
        ...mockBoard,
        id: `board-${Date.now()}`,
        name: `${newProject.name} Board`,
      },
    };
    setAllProjects([...allProjects, projectWithBoard]);
    setCurrentProject(projectWithBoard);
  };

  const addWorkspace = (newWorkspace: Workspace) => {
    setAllWorkspaces([...allWorkspaces, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
    setCurrentProject(null); // No projects in new workspace yet
  };

  const addIssue = (issueData: CreateIssueData) => {
    if (!currentProject) return;

    // Find the assignee user object
    const assignee = issueData.assigneeId
      ? mockUsers.find((u) => u.id === issueData.assigneeId)
      : undefined;

    // Create the new issue
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: issueData.title,
      description: issueData.description,
      status: issueData.status,
      priority: issueData.priority,
      type: issueData.type,
      assignee,
      reporter: mockUsers[0], // Default to first user as reporter
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: issueData.dueDate,
      tags: issueData.tags,
      comments: [],
    };

    // Update the current project's board
    const updatedBoard: Board = {
      ...currentProject.board,
      columns: currentProject.board.columns.map((column) => {
        if (column.id === issueData.status) {
          return {
            ...column,
            issues: [...column.issues, newIssue],
          };
        }
        return column;
      }),
    };

    // Update the project with the new board
    const updatedProject: Project = {
      ...currentProject,
      board: updatedBoard,
    };

    // Update the projects list
    setAllProjects(
      allProjects.map((p) =>
        p.id === currentProject.id ? updatedProject : p
      )
    );

    // Update the current project
    setCurrentProject(updatedProject);
  };

  // Get projects for current workspace
  const projects = allProjects.filter(
    (p) => p.workspaceId === currentWorkspace.id
  );

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        currentProject,
        workspaces: allWorkspaces,
        projects,
        switchWorkspace,
        switchProject,
        addProject,
        addWorkspace,
        addIssue,
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
