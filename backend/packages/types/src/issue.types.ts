export interface IssueResponse {
  id: string;
  projectId: string;
  key: string;
  title: string;
  description: string | null;
  type: 'BUG' | 'FEATURE' | 'TASK' | 'IMPROVEMENT';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reporterId: string;
  assigneeId: string | null;
  dueDate: Date | null;
  startDate: Date | null;
  completedAt: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentResponse {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
