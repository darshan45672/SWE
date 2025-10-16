export interface ProjectResponse {
  id: string;
  name: string;
  key: string;
  description: string | null;
  avatar: string | null;
  isPublic: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: Date;
}
