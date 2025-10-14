// Type definitions for the project management tool

export type Priority = "low" | "medium" | "high" | "urgent";
export type IssueStatus = "todo" | "in-progress" | "done";
export type IssueType = "bug" | "feature" | "task" | "improvement";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: Priority;
  type: IssueType;
  assignee?: User;
  reporter: User;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: IssueStatus;
  title: string;
  issues: Issue[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  issueId?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  messages: Message[];
  participants: User[];
}
