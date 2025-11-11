import { Priority, IssueStatus, IssueType } from '@prisma/client';
interface CreateIssueData {
    title: string;
    description?: string;
    status: IssueStatus;
    priority: Priority;
    type: IssueType;
    projectId: string;
    dueDate?: Date;
    tags?: string[];
    assigneeId?: string;
}
interface UpdateIssueData {
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: Priority;
    type?: IssueType;
    dueDate?: Date;
    tags?: string[];
    assigneeId?: string;
}
export declare const getIssueById: (issueId: string, userId: string) => Promise<{
    project: {
        workspace: {
            members: {
                id: string;
                createdAt: Date;
                userId: string;
                workspaceId: string;
                role: import(".prisma/client").$Enums.WorkspaceRole;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            icon: string | null;
            color: string | null;
            isActive: boolean;
            latestChoice: boolean;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        isActive: boolean;
        latestChoice: boolean;
    };
    comments: ({
        author: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        issueId: string;
    })[];
    assignee: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    assigner: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    tags: ({
        tag: {
            name: string;
            id: string;
            createdAt: Date;
            color: string | null;
        };
    } & {
        id: string;
        issueId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    issueNumber: number;
    description: string;
    priority: import(".prisma/client").$Enums.Priority;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    dueDate: Date | null;
}>;
export declare const getIssuesByProjectId: (projectId: string, userId: string) => Promise<({
    comments: ({
        author: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        issueId: string;
    })[];
    assignee: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    assigner: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    tags: ({
        tag: {
            name: string;
            id: string;
            createdAt: Date;
            color: string | null;
        };
    } & {
        id: string;
        issueId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    issueNumber: number;
    description: string;
    priority: import(".prisma/client").$Enums.Priority;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    dueDate: Date | null;
})[]>;
export declare const createIssue: (issueData: CreateIssueData, userId: string) => Promise<{
    assignee: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    assigner: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    tags: ({
        tag: {
            name: string;
            id: string;
            createdAt: Date;
            color: string | null;
        };
    } & {
        id: string;
        issueId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    issueNumber: number;
    description: string;
    priority: import(".prisma/client").$Enums.Priority;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    dueDate: Date | null;
}>;
export declare const updateIssue: (issueId: string, issueData: UpdateIssueData, userId: string) => Promise<{
    assignee: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    assigner: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    tags: ({
        tag: {
            name: string;
            id: string;
            createdAt: Date;
            color: string | null;
        };
    } & {
        id: string;
        issueId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    issueNumber: number;
    description: string;
    priority: import(".prisma/client").$Enums.Priority;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    dueDate: Date | null;
}>;
export declare const deleteIssue: (issueId: string, userId: string) => Promise<{
    message: string;
}>;
export declare const assignIssue: (issueId: string, assigneeId: string, assignerId: string) => Promise<{
    project: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        isActive: boolean;
        latestChoice: boolean;
    };
    comments: ({
        author: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        issueId: string;
    })[];
    assignee: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    assigner: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    tags: ({
        tag: {
            name: string;
            id: string;
            createdAt: Date;
            color: string | null;
        };
    } & {
        id: string;
        issueId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    issueNumber: number;
    description: string;
    priority: import(".prisma/client").$Enums.Priority;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    dueDate: Date | null;
}>;
export declare const unassignIssue: (issueId: string, userId: string) => Promise<{
    project: {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        workspaceId: string;
        description: string | null;
        isActive: boolean;
        latestChoice: boolean;
    };
    comments: ({
        author: {
            name: string;
            id: string;
            email: string;
            avatar: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        issueId: string;
    })[];
    assignee: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    assigner: {
        name: string;
        id: string;
        email: string;
        avatar: string | null;
    } | null;
    tags: ({
        tag: {
            name: string;
            id: string;
            createdAt: Date;
            color: string | null;
        };
    } & {
        id: string;
        issueId: string;
        tagId: string;
    })[];
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    issueNumber: number;
    description: string;
    priority: import(".prisma/client").$Enums.Priority;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedAt: Date | null;
    dueDate: Date | null;
}>;
export {};
//# sourceMappingURL=issue.d.ts.map