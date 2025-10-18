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
}
interface UpdateIssueData {
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: Priority;
    type?: IssueType;
    dueDate?: Date;
    tags?: string[];
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
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    description: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    priority: import(".prisma/client").$Enums.Priority;
    projectId: string;
    dueDate: Date | null;
}>;
export declare const getIssuesByProjectId: (projectId: string, userId: string) => Promise<({
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
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    description: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    priority: import(".prisma/client").$Enums.Priority;
    projectId: string;
    dueDate: Date | null;
})[]>;
export declare const createIssue: (issueData: CreateIssueData, userId: string) => Promise<{
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
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    description: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    priority: import(".prisma/client").$Enums.Priority;
    projectId: string;
    dueDate: Date | null;
}>;
export declare const updateIssue: (issueId: string, issueData: UpdateIssueData, userId: string) => Promise<{
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
    type: import(".prisma/client").$Enums.IssueType;
    title: string;
    description: string;
    status: import(".prisma/client").$Enums.IssueStatus;
    priority: import(".prisma/client").$Enums.Priority;
    projectId: string;
    dueDate: Date | null;
}>;
export declare const deleteIssue: (issueId: string, userId: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=issue.d.ts.map