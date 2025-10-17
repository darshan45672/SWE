// Workspace types and mock data

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
  latestChoice?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  isActive?: boolean;
  latestChoice?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const mockWorkspaces: Workspace[] = [
  {
    id: "main",
    name: "Main Project",
    icon: "🚀",
    color: "bg-blue-500",
  },
  {
    id: "personal",
    name: "Personal Tasks",
    icon: "👤",
    color: "bg-purple-500",
  },
  {
    id: "team-alpha",
    name: "Team Alpha",
    icon: "⚡",
    color: "bg-green-500",
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "📢",
    color: "bg-orange-500",
  },
];
