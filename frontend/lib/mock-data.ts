// Mock data for the project management tool

import { Board, Issue, User, Message, ChatRoom } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "JS",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: "BJ",
  },
];

export const mockIssues: Issue[] = [
  {
    id: "1",
    title: "Fix login bug",
    description: "Users are unable to log in with Google OAuth",
    status: "todo",
    priority: "high",
    type: "bug",
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-12"),
    dueDate: new Date("2025-01-20"),
    tags: ["authentication", "critical"],
    comments: [],
  },
  {
    id: "2",
    title: "Implement dark mode",
    description: "Add dark mode theme to the application",
    status: "in-progress",
    priority: "medium",
    type: "feature",
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-14"),
    dueDate: new Date("2025-01-25"),
    tags: ["ui", "enhancement"],
    comments: [],
  },
  {
    id: "3",
    title: "Update documentation",
    description: "Update API documentation with new endpoints",
    status: "done",
    priority: "low",
    type: "task",
    assignee: mockUsers[2],
    reporter: mockUsers[0],
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-13"),
    tags: ["documentation"],
    comments: [],
  },
  {
    id: "4",
    title: "Optimize database queries",
    description: "Improve performance of dashboard queries",
    status: "todo",
    priority: "urgent",
    type: "improvement",
    assignee: mockUsers[0],
    reporter: mockUsers[2],
    createdAt: new Date("2025-01-11"),
    updatedAt: new Date("2025-01-11"),
    dueDate: new Date("2025-01-18"),
    tags: ["performance", "database"],
    comments: [],
  },
  {
    id: "5",
    title: "Add user profile page",
    description: "Create a dedicated user profile page with edit functionality",
    status: "in-progress",
    priority: "medium",
    type: "feature",
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    createdAt: new Date("2025-01-09"),
    updatedAt: new Date("2025-01-14"),
    tags: ["user", "profile"],
    comments: [],
  },
  {
    id: "6",
    title: "Fix responsive layout",
    description: "Dashboard is not responsive on mobile devices",
    status: "todo",
    priority: "high",
    type: "bug",
    assignee: mockUsers[2],
    reporter: mockUsers[1],
    createdAt: new Date("2025-01-12"),
    updatedAt: new Date("2025-01-12"),
    dueDate: new Date("2025-01-22"),
    tags: ["responsive", "mobile"],
    comments: [],
  },
];

export const mockBoard: Board = {
  id: "main-board",
  name: "Main Project Board",
  columns: [
    {
      id: "todo",
      title: "To Do",
      issues: mockIssues.filter((issue) => issue.status === "todo"),
    },
    {
      id: "in-progress",
      title: "In Progress",
      issues: mockIssues.filter((issue) => issue.status === "in-progress"),
    },
    {
      id: "done",
      title: "Done",
      issues: mockIssues.filter((issue) => issue.status === "done"),
    },
  ],
};

export const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey team, great progress on the sprint!",
    sender: mockUsers[0],
    timestamp: new Date("2025-01-14T10:30:00"),
  },
  {
    id: "2",
    content: "Thanks! Should we prioritize the login bug?",
    sender: mockUsers[1],
    timestamp: new Date("2025-01-14T10:32:00"),
    issueId: "1",
  },
  {
    id: "3",
    content: "Yes, let's fix it by end of week",
    sender: mockUsers[0],
    timestamp: new Date("2025-01-14T10:35:00"),
  },
];

export const mockChatRoom: ChatRoom = {
  id: "main-chat",
  name: "Project Team Chat",
  messages: mockMessages,
  participants: mockUsers,
};
