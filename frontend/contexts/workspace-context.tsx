"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Workspace, mockWorkspaces } from "@/types/workspace";
import { Board, Issue, IssueStatus, Priority, IssueType, User, Notification, NotificationType } from "@/types";
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
  currentUser: User;
  workspaces: Workspace[];
  projects: Project[];
  notifications: Notification[];
  unreadCount: number;
  switchWorkspace: (workspaceId: string) => void;
  switchProject: (projectId: string) => void;
  addProject: (project: Omit<Project, "board">) => void;
  addWorkspace: (workspace: Workspace) => void;
  addIssue: (issueData: CreateIssueData) => void;
  updateIssue: (issueId: string, issueData: Partial<CreateIssueData>) => void;
  deleteIssue: (issueId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (notificationId: string) => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Current user (in a real app, this would come from auth)
  const currentUser = mockUsers[0];

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Helper function to create notification
  const createNotification = (
    type: NotificationType,
    title: string,
    message: string,
    issue: Issue,
    actor: User,
    recipient: User
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      issue,
      actor,
      recipient,
      createdAt: new Date(),
      read: false,
      link: `/issues/${issue.id}`,
    };
    setNotifications(prev => [notification, ...prev]);
  };

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
      reporter: currentUser,
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

    // Create notification if issue is assigned to someone
    if (assignee && assignee.id !== currentUser.id) {
      createNotification(
        "issue_assigned",
        "New Issue Assigned",
        `${currentUser.name} assigned you to "${newIssue.title}"`,
        newIssue,
        currentUser,
        assignee
      );
    }
  };

  const updateIssue = (issueId: string, issueData: Partial<CreateIssueData>) => {
    if (!currentProject) return;

    // Find the assignee user object if assigneeId is provided
    const assignee = issueData.assigneeId
      ? mockUsers.find((u) => u.id === issueData.assigneeId)
      : undefined;

    // Update the current project's board
    const updatedBoard: Board = {
      ...currentProject.board,
      columns: currentProject.board.columns.map((column) => {
        // Remove issue from old column if status changed
        const issuesWithoutTarget = column.issues.filter(
          (issue) => issue.id !== issueId
        );

        // Find the issue to update
        const issueToUpdate = currentProject.board.columns
          .flatMap((col) => col.issues)
          .find((issue) => issue.id === issueId);

        if (!issueToUpdate) return column;

        // Create updated issue
        const updatedIssue: Issue = {
          ...issueToUpdate,
          ...(issueData.title && { title: issueData.title }),
          ...(issueData.description && { description: issueData.description }),
          ...(issueData.type && { type: issueData.type }),
          ...(issueData.priority && { priority: issueData.priority }),
          ...(issueData.status && { status: issueData.status }),
          ...(issueData.assigneeId !== undefined && { assignee }),
          ...(issueData.dueDate !== undefined && { dueDate: issueData.dueDate }),
          ...(issueData.tags && { tags: issueData.tags }),
          updatedAt: new Date(),
        };

        // Add issue to new column if status matches
        const targetStatus = issueData.status || issueToUpdate.status;
        if (column.id === targetStatus) {
          return {
            ...column,
            issues: [...issuesWithoutTarget, updatedIssue],
          };
        }

        // Return column without the issue if it moved to another column
        return {
          ...column,
          issues: issuesWithoutTarget,
        };
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

    // Create notification if assignee changed and it's not the current user
    if (issueData.assigneeId && assignee && assignee.id !== currentUser.id) {
      const issueToUpdate = currentProject.board.columns
        .flatMap((col) => col.issues)
        .find((issue) => issue.id === issueId);
      
      if (issueToUpdate && issueToUpdate.assignee?.id !== assignee.id) {
        createNotification(
          "issue_assigned",
          "Issue Assigned to You",
          `${currentUser.name} assigned you to "${issueToUpdate.title}"`,
          issueToUpdate,
          currentUser,
          assignee
        );
      }
    }
  };

  const deleteIssue = (issueId: string) => {
    if (!currentProject) return;

    // Update the current project's board by removing the issue
    const updatedBoard: Board = {
      ...currentProject.board,
      columns: currentProject.board.columns.map((column) => ({
        ...column,
        issues: column.issues.filter((issue) => issue.id !== issueId),
      })),
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

  // Notification management functions
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        currentProject,
        currentUser,
        workspaces: allWorkspaces,
        projects,
        notifications,
        unreadCount,
        switchWorkspace,
        switchProject,
        addProject,
        addWorkspace,
        addIssue,
        updateIssue,
        deleteIssue,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
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
