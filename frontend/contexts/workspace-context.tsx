"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Workspace, mockWorkspaces } from "@/types/workspace";
import { Issue, IssueStatus, Priority, IssueType, User, Notification, NotificationType } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { useAuth } from "@/contexts/auth-context";

// Simplified Project interface - no board model needed
interface Project {
  id: string;
  name: string;
  key?: string;
  description?: string;
  workspaceId: string;
}

interface CreateIssueData {
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  status: IssueStatus;
  dueDate?: Date;
  tags: string[];
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  currentUser: User;
  workspaces: Workspace[];
  projects: Project[];
  issues: Issue[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  switchProject: (projectId: string) => void;
  addProject: (project: Project) => void;
  addWorkspace: (workspace: Workspace) => void;
  createWorkspace: (workspaceData: { name: string; description?: string; icon?: string; color?: string }) => Promise<{ success: boolean; message?: string; data?: Workspace }>;
  createProject: (projectData: { name: string; description?: string }) => Promise<{ success: boolean; message?: string; data?: any }>;
  fetchWorkspaces: () => Promise<void>;
  fetchProjects: (workspaceId: string) => Promise<void>;
  fetchIssues: (projectId: string) => Promise<void>;
  createIssue: (issueData: CreateIssueData) => Promise<{ success: boolean; message?: string; data?: Issue }>;
  updateIssueApi: (issueId: string, issueData: Partial<CreateIssueData>) => Promise<{ success: boolean; message?: string; data?: Issue }>;
  deleteIssueApi: (issueId: string) => Promise<{ success: boolean; message?: string }>;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (notificationId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

// Status conversion helpers - Frontend uses lowercase, Backend uses uppercase
const toBackendStatus = (status: IssueStatus): string => {
  const map: Record<IssueStatus, string> = {
    'todo': 'TODO',
    'in-progress': 'IN_PROGRESS',
    'done': 'DONE',
  };
  return map[status];
};

const toFrontendStatus = (status: string): IssueStatus => {
  const map: Record<string, IssueStatus> = {
    'TODO': 'todo',
    'IN_PROGRESS': 'in-progress',
    'DONE': 'done',
  };
  return map[status] || 'todo';
};

// Priority conversion helpers - Frontend uses lowercase, Backend uses uppercase
const toBackendPriority = (priority: Priority): string => {
  return priority.toUpperCase();
};

const toFrontendPriority = (priority: string): Priority => {
  return priority.toLowerCase() as Priority;
};

// Type conversion helpers - Frontend uses lowercase, Backend uses uppercase
const toBackendType = (type: IssueType): string => {
  return type.toUpperCase();
};

const toFrontendType = (type: string): IssueType => {
  return type.toLowerCase() as IssueType;
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { token, user: authUser } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Current user - use authenticated user or fallback to mock - Context7 pattern
  const currentUser = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    avatar: authUser.avatar || authUser.name.slice(0, 2).toUpperCase(),
  } : mockUsers[0];

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch workspaces from API - Context7 pattern
  const fetchWorkspaces = async () => {
    if (!token) {
      console.log('No token available, skipping workspace fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching workspaces with token:', token ? 'Token present' : 'No token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/workspaces`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch workspaces response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch workspaces failed:', response.status, errorText);
        throw new Error(`Failed to fetch workspaces: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched workspaces:', data);
      
      if (data.success && data.data) {
        setAllWorkspaces(data.data);
        
        // Set first workspace as current if none selected
        if (!currentWorkspace && data.data.length > 0) {
          setCurrentWorkspace(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new workspace - Context7 pattern
  const createWorkspace = async (workspaceData: { name: string; description?: string; icon?: string; color?: string }): Promise<{ success: boolean; message?: string; data?: Workspace }> => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    console.log('Creating workspace with data:', workspaceData);
    console.log('Using token:', token ? 'Token present' : 'No token');
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/workspaces`;
      console.log('Sending POST request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        const textResponse = await response.text();
        console.error('Response text:', textResponse);
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        console.error('Error data:', data);
        return {
          success: false,
          message: data.message || 'Failed to create workspace',
        };
      }

      if (data.success && data.data) {
        // Add to local state
        setAllWorkspaces(prev => [...prev, data.data]);
        setCurrentWorkspace(data.data);
        
        return {
          success: true,
          message: data.message,
          data: data.data,
        };
      }

      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      console.error('Error creating workspace:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create workspace',
      };
    }
  };

  // Fetch projects for a workspace - Context7 pattern
  const fetchProjects = async (workspaceId: string) => {
    if (!token) {
      console.log('No token available, skipping projects fetch');
      return;
    }

    try {
      console.log('Fetching projects for workspace:', workspaceId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/projects/workspace/${workspaceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch projects response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch projects failed:', response.status, errorText);
        throw new Error(`Failed to fetch projects: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched projects:', data);
      
      if (data.success && data.data) {
        // Map API projects to local Project type (no boards)
        const projects = data.data.map((project: any) => ({
          id: project.id,
          name: project.name,
          key: project.key,
          description: project.description || '',
          workspaceId: project.workspaceId,
        }));
        
        setAllProjects(projects);
        
        // Set first project as current if none selected
        if (!currentProject && projects.length > 0) {
          setCurrentProject(projects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Create new project - Context7 pattern
  const createProject = async (projectData: { name: string; description?: string }): Promise<{ success: boolean; message?: string; data?: any }> => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    if (!currentWorkspace) {
      return { success: false, message: 'No workspace selected' };
    }

    console.log('Creating project with data:', projectData);
    console.log('Using token:', token ? 'Token present' : 'No token');
    console.log('Current workspace:', currentWorkspace.id);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/projects`;
      console.log('Sending POST request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          workspaceId: currentWorkspace.id,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        const textResponse = await response.text();
        console.error('Response text:', textResponse);
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        console.error('Error data:', data);
        return {
          success: false,
          message: data.message || 'Failed to create project',
        };
      }

      if (data.success && data.data) {
        // Add to local state (no board)
        const project: Project = {
          id: data.data.id,
          name: data.data.name,
          key: data.data.key,
          description: data.data.description || '',
          workspaceId: data.data.workspaceId,
        };
        
        setAllProjects(prev => [...prev, project]);
        setCurrentProject(project);
        
        return {
          success: true,
          message: data.message,
          data: data.data,
        };
      }

      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      console.error('Error creating project:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create project',
      };
    }
  };

  // Fetch workspaces on mount and when token changes
  useEffect(() => {
    fetchWorkspaces();
  }, [token]);

  // Fetch projects when current workspace changes
  useEffect(() => {
    if (currentWorkspace && token) {
      fetchProjects(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, token]);

  // Fetch issues when current project changes
  useEffect(() => {
    if (currentProject && token) {
      fetchIssues(currentProject.id);
    }
  }, [currentProject?.id, token]);

  // Fetch issues for a project - Context7 pattern (Simplified - no boards)
  const fetchIssues = async (projectId: string) => {
    if (!token) {
      console.log('No token available, skipping issues fetch');
      return;
    }

    try {
      console.log('Fetching issues for project:', projectId);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/issues/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch issues response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch issues failed:', response.status, errorText);
        throw new Error(`Failed to fetch issues: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Fetched issues:', data);
      
      if (data.success && data.data) {
        // Map issues (no assignee/reporter fields)
        const mappedIssues = data.data.map((issue: any) => ({
          ...issue,
          status: toFrontendStatus(issue.status), // Convert uppercase to lowercase
          priority: toFrontendPriority(issue.priority), // Convert uppercase to lowercase
          type: toFrontendType(issue.type), // Convert uppercase to lowercase
          createdAt: new Date(issue.createdAt),
          updatedAt: new Date(issue.updatedAt),
          dueDate: issue.dueDate ? new Date(issue.dueDate) : undefined,
          tags: issue.tags ? issue.tags.map((t: any) => t.tag.name) : [], // Extract tag names from relation
          comments: [],
        }));
        
        setIssues(mappedIssues);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

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
      if (currentWorkspace && project.workspaceId !== currentWorkspace.id) {
        const workspace = allWorkspaces.find(
          (w) => w.id === project.workspaceId
        );
        if (workspace) {
          setCurrentWorkspace(workspace);
        }
      }
    }
  };

  const addProject = (newProject: Project) => {
    setAllProjects([...allProjects, newProject]);
    setCurrentProject(newProject);
  };

  const addWorkspace = (newWorkspace: Workspace) => {
    setAllWorkspaces([...allWorkspaces, newWorkspace]);
    setCurrentWorkspace(newWorkspace);
    setCurrentProject(null); // No projects in new workspace yet
  };

  // Create issue - Context7 pattern (Simplified - no boards)
  const createIssue = async (issueData: CreateIssueData): Promise<{ success: boolean; message?: string; data?: Issue }> => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    if (!currentProject) {
      return { success: false, message: 'No project selected' };
    }

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/issues`;
      
      const requestBody = {
        title: issueData.title,
        description: issueData.description || '',
        type: toBackendType(issueData.type), // Convert to uppercase
        priority: toBackendPriority(issueData.priority), // Convert to uppercase
        status: toBackendStatus(issueData.status), // Convert to uppercase
        projectId: currentProject.id,
        dueDate: issueData.dueDate,
        tags: issueData.tags,
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      if (!response.ok) {
        console.error('Failed to create issue:', data.message || data.errors?.[0]?.msg);
        return {
          success: false,
          message: data.message || data.errors?.[0]?.msg || 'Failed to create issue',
        };
      }

      if (data.success && data.data) {
        // Map issue (no assignee/reporter fields)
        const newIssue: Issue = {
          ...data.data,
          status: toFrontendStatus(data.data.status), // Convert backend to frontend status
          priority: toFrontendPriority(data.data.priority), // Convert backend to frontend priority
          type: toFrontendType(data.data.type), // Convert backend to frontend type
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
          dueDate: data.data.dueDate ? new Date(data.data.dueDate) : undefined,
          tags: data.data.tags ? data.data.tags.map((t: any) => t.tag.name) : [], // Extract tag names from relation
          comments: [],
        };

        // Add to local state
        setIssues(prev => [...prev, newIssue]);
        
        return {
          success: true,
          message: data.message,
          data: newIssue,
        };
      }

      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      console.error('Error creating issue:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create issue',
      };
    }
  };

  // Update issue - Context7 pattern (Simplified - no boards)
  const updateIssueApi = async (issueId: string, issueData: Partial<CreateIssueData>): Promise<{ success: boolean; message?: string; data?: Issue }> => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    console.log('Updating issue:', issueId, 'with data:', issueData);

    try {
      const updateData: any = {
        ...(issueData.title && { title: issueData.title }),
        ...(issueData.description !== undefined && { description: issueData.description }),
        ...(issueData.type && { type: toBackendType(issueData.type) }), // Convert to uppercase
        ...(issueData.priority && { priority: toBackendPriority(issueData.priority) }), // Convert to uppercase
        ...(issueData.status && { status: toBackendStatus(issueData.status) }), // Convert to uppercase
        ...(issueData.dueDate !== undefined && { dueDate: issueData.dueDate }),
        ...(issueData.tags && { tags: issueData.tags }),
      };

      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/issues/${issueId}`;
      console.log('Sending PUT request to:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        console.error('Error data:', data);
        return {
          success: false,
          message: data.message || 'Failed to update issue',
        };
      }

      if (data.success && data.data) {
        // Map issue (no assignee/reporter fields)
        const updatedIssue: Issue = {
          ...data.data,
          status: toFrontendStatus(data.data.status), // Convert backend to frontend status
          priority: toFrontendPriority(data.data.priority), // Convert backend to frontend priority
          type: toFrontendType(data.data.type), // Convert backend to frontend type
          createdAt: new Date(data.data.createdAt),
          updatedAt: new Date(data.data.updatedAt),
          dueDate: data.data.dueDate ? new Date(data.data.dueDate) : undefined,
          tags: data.data.tags ? data.data.tags.map((t: any) => t.tag.name) : [], // Extract tag names from relation
          comments: [],
        };

        // Update local state
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? updatedIssue : issue
        ));
        
        return {
          success: true,
          message: data.message,
          data: updatedIssue,
        };
      }

      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      console.error('Error updating issue:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update issue',
      };
    }
  };

  // Delete issue - Context7 pattern (Simplified - no boards)
  const deleteIssueApi = async (issueId: string): Promise<{ success: boolean; message?: string }> => {
    if (!token) {
      return { success: false, message: 'Authentication required' };
    }

    console.log('Deleting issue:', issueId);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/issues/${issueId}`;
      console.log('Sending DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      if (!response.ok) {
        console.error('Request failed with status:', response.status);
        console.error('Error data:', data);
        return {
          success: false,
          message: data.message || 'Failed to delete issue',
        };
      }

      if (data.success) {
        // Remove from local state
        setIssues(prev => prev.filter(issue => issue.id !== issueId));
        
        return {
          success: true,
          message: data.message,
        };
      }

      return { success: false, message: 'Unexpected response format' };
    } catch (error) {
      console.error('Error deleting issue:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete issue',
      };
    }
  };

  // Get projects for current workspace
  const projects = currentWorkspace 
    ? allProjects.filter((p) => p.workspaceId === currentWorkspace.id)
    : [];

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
        issues,
        notifications,
        unreadCount,
        loading,
        switchWorkspace,
        switchProject,
        addProject,
        addWorkspace,
        createWorkspace,
        createProject,
        fetchWorkspaces,
        fetchProjects,
        fetchIssues,
        createIssue,
        updateIssueApi,
        deleteIssueApi,
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
