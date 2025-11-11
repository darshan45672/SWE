"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMCPTools = registerMCPTools;
const zod_1 = require("zod");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
/**
 * Initialize MCP tools for AI context gathering
 * These tools allow the AI to fetch relevant data from the database
 */
function registerMCPTools(mcpServer) {
    // Tool: Get project information
    mcpServer.registerTool('getProjectInfo', {
        title: 'Get Project Information',
        description: 'Retrieve detailed information about a project including name, description, and metadata',
        inputSchema: {
            projectId: zod_1.z.string().describe('The ID of the project'),
        },
        outputSchema: {
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            workspaceId: zod_1.z.string(),
            isActive: zod_1.z.boolean(),
            createdAt: zod_1.z.string(),
            updatedAt: zod_1.z.string(),
        },
    }, async ({ projectId }) => {
        try {
            const project = await prisma_js_1.default.project.findUnique({
                where: { id: projectId },
                include: {
                    workspace: {
                        select: {
                            name: true,
                            description: true,
                        },
                    },
                },
            });
            if (!project) {
                return {
                    content: [{ type: 'text', text: 'Project not found' }],
                    isError: true,
                };
            }
            const output = {
                id: project.id,
                name: project.name,
                description: project.description || '',
                workspaceId: project.workspaceId,
                workspaceName: project.workspace.name,
                workspaceDescription: project.workspace.description || '',
                isActive: project.isActive,
                createdAt: project.createdAt.toISOString(),
                updatedAt: project.updatedAt.toISOString(),
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching project: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Get workspace information
    mcpServer.registerTool('getWorkspaceInfo', {
        title: 'Get Workspace Information',
        description: 'Retrieve workspace details and member count',
        inputSchema: {
            workspaceId: zod_1.z.string().describe('The ID of the workspace'),
        },
        outputSchema: {
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            memberCount: zod_1.z.number(),
            projectCount: zod_1.z.number(),
        },
    }, async ({ workspaceId }) => {
        try {
            const workspace = await prisma_js_1.default.workspace.findUnique({
                where: { id: workspaceId },
                include: {
                    _count: {
                        select: {
                            members: true,
                            projects: true,
                        },
                    },
                },
            });
            if (!workspace) {
                return {
                    content: [{ type: 'text', text: 'Workspace not found' }],
                    isError: true,
                };
            }
            const output = {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description || '',
                memberCount: workspace._count.members,
                projectCount: workspace._count.projects,
                isActive: workspace.isActive,
                createdAt: workspace.createdAt.toISOString(),
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching workspace: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Get issues summary
    mcpServer.registerTool('getIssuesSummary', {
        title: 'Get Issues Summary',
        description: 'Get count and breakdown of issues by status, priority, and type for a project',
        inputSchema: {
            projectId: zod_1.z.string().describe('The ID of the project'),
        },
        outputSchema: {
            totalIssues: zod_1.z.number(),
            byStatus: zod_1.z.object({
                TODO: zod_1.z.number(),
                IN_PROGRESS: zod_1.z.number(),
                DONE: zod_1.z.number(),
            }),
            byPriority: zod_1.z.object({
                LOW: zod_1.z.number(),
                MEDIUM: zod_1.z.number(),
                HIGH: zod_1.z.number(),
                URGENT: zod_1.z.number(),
            }),
            byType: zod_1.z.object({
                BUG: zod_1.z.number(),
                FEATURE: zod_1.z.number(),
                TASK: zod_1.z.number(),
                IMPROVEMENT: zod_1.z.number(),
            }),
        },
    }, async ({ projectId }) => {
        try {
            const issues = await prisma_js_1.default.issue.findMany({
                where: { projectId },
                select: {
                    status: true,
                    priority: true,
                    type: true,
                },
            });
            const output = {
                totalIssues: issues.length,
                byStatus: {
                    TODO: issues.filter((i) => i.status === 'TODO').length,
                    IN_PROGRESS: issues.filter((i) => i.status === 'IN_PROGRESS').length,
                    DONE: issues.filter((i) => i.status === 'DONE').length,
                },
                byPriority: {
                    LOW: issues.filter((i) => i.priority === 'LOW').length,
                    MEDIUM: issues.filter((i) => i.priority === 'MEDIUM').length,
                    HIGH: issues.filter((i) => i.priority === 'HIGH').length,
                    URGENT: issues.filter((i) => i.priority === 'URGENT').length,
                },
                byType: {
                    BUG: issues.filter((i) => i.type === 'BUG').length,
                    FEATURE: issues.filter((i) => i.type === 'FEATURE').length,
                    TASK: issues.filter((i) => i.type === 'TASK').length,
                    IMPROVEMENT: issues.filter((i) => i.type === 'IMPROVEMENT').length,
                },
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching issues: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Get recent issues
    mcpServer.registerTool('getRecentIssues', {
        title: 'Get Recent Issues',
        description: 'Get list of recent issues with details',
        inputSchema: {
            projectId: zod_1.z.string().describe('The ID of the project'),
            limit: zod_1.z.number().optional().describe('Number of issues to fetch (default: 10)'),
        },
        outputSchema: {
            issues: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.string(),
                issueNumber: zod_1.z.number(),
                title: zod_1.z.string(),
                description: zod_1.z.string(),
                status: zod_1.z.string(),
                priority: zod_1.z.string(),
                type: zod_1.z.string(),
                createdAt: zod_1.z.string(),
            })),
        },
    }, async ({ projectId, limit = 10 }) => {
        try {
            const issues = await prisma_js_1.default.issue.findMany({
                where: { projectId },
                orderBy: { issueNumber: 'asc' },
                take: limit,
                select: {
                    id: true,
                    issueNumber: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    type: true,
                    createdAt: true,
                    dueDate: true,
                },
            });
            const output = {
                issues: issues.map((issue) => ({
                    id: issue.id,
                    issueNumber: issue.issueNumber,
                    title: issue.title,
                    description: issue.description,
                    status: issue.status,
                    priority: issue.priority,
                    type: issue.type,
                    createdAt: issue.createdAt.toISOString(),
                    dueDate: issue.dueDate?.toISOString(),
                })),
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching issues: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Get chat history
    mcpServer.registerTool('getChatHistory', {
        title: 'Get Chat History',
        description: 'Retrieve recent chat messages from a project',
        inputSchema: {
            projectId: zod_1.z.string().describe('The ID of the project'),
            limit: zod_1.z.number().optional().describe('Number of messages to fetch (default: 50)'),
        },
        outputSchema: {
            messages: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.string(),
                content: zod_1.z.string(),
                senderName: zod_1.z.string(),
                isAIMessage: zod_1.z.boolean(),
                createdAt: zod_1.z.string(),
            })),
        },
    }, async ({ projectId, limit = 50 }) => {
        try {
            const messages = await prisma_js_1.default.message.findMany({
                where: { projectId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                include: {
                    sender: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            const output = {
                messages: messages
                    .reverse() // Return in chronological order
                    .map((msg) => ({
                    id: msg.id,
                    content: msg.content,
                    senderName: msg.sender.name,
                    senderEmail: msg.sender.email,
                    isAIMessage: msg.isAIMessage,
                    createdAt: msg.createdAt.toISOString(),
                })),
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching chat history: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Get workspace members
    mcpServer.registerTool('getWorkspaceMembers', {
        title: 'Get Workspace Members',
        description: 'Get comprehensive information about members in a workspace including their roles, profile details, comments, messages, and all workspaces they belong to',
        inputSchema: {
            workspaceId: zod_1.z.string().describe('The ID of the workspace'),
        },
        outputSchema: {
            members: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.string(),
                name: zod_1.z.string(),
                email: zod_1.z.string(),
                avatar: zod_1.z.string().optional(),
                bio: zod_1.z.string().optional(),
                phone: zod_1.z.string().optional(),
                location: zod_1.z.string().optional(),
                website: zod_1.z.string().optional(),
                company: zod_1.z.string().optional(),
                jobTitle: zod_1.z.string().optional(),
                role: zod_1.z.string(),
                joinedAt: zod_1.z.string(),
                emailVerified: zod_1.z.boolean(),
                allWorkspaces: zod_1.z.array(zod_1.z.object({
                    workspaceId: zod_1.z.string(),
                    workspaceName: zod_1.z.string(),
                    role: zod_1.z.string(),
                    joinedAt: zod_1.z.string(),
                })),
                commentsCount: zod_1.z.number(),
                messagesCount: zod_1.z.number(),
            })),
        },
    }, async ({ workspaceId }) => {
        try {
            const members = await prisma_js_1.default.workspaceMember.findMany({
                where: { workspaceId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            bio: true,
                            phone: true,
                            location: true,
                            website: true,
                            company: true,
                            jobTitle: true,
                            emailVerified: true,
                            createdAt: true,
                            // Get all workspaces this user is a member of
                            workspaces: {
                                include: {
                                    workspace: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                        },
                                    },
                                },
                                orderBy: { createdAt: 'desc' },
                            },
                            // Get comment count
                            comments: {
                                select: {
                                    id: true,
                                },
                            },
                            // Get message count  
                            messages: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            });
            const output = {
                members: members.map((member) => ({
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    avatar: member.user.avatar || undefined,
                    bio: member.user.bio || undefined,
                    phone: member.user.phone || undefined,
                    location: member.user.location || undefined,
                    website: member.user.website || undefined,
                    company: member.user.company || undefined,
                    jobTitle: member.user.jobTitle || undefined,
                    role: member.role,
                    joinedAt: member.createdAt.toISOString(),
                    emailVerified: member.user.emailVerified,
                    allWorkspaces: member.user.workspaces.map((membership) => ({
                        workspaceId: membership.workspace.id,
                        workspaceName: membership.workspace.name,
                        role: membership.role,
                        joinedAt: membership.createdAt.toISOString(),
                    })),
                    commentsCount: member.user.comments.length,
                    messagesCount: member.user.messages.length,
                })),
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching members: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Get detailed user information
    mcpServer.registerTool('getUserDetails', {
        title: 'Get User Details',
        description: 'Get comprehensive information about a specific user including their profile, workspaces, projects, and activity',
        inputSchema: {
            userId: zod_1.z.string().describe('The ID of the user'),
        },
        outputSchema: {
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            email: zod_1.z.string(),
            avatar: zod_1.z.string().optional(),
            bio: zod_1.z.string().optional(),
            phone: zod_1.z.string().optional(),
            location: zod_1.z.string().optional(),
            website: zod_1.z.string().optional(),
            timezone: zod_1.z.string().optional(),
            language: zod_1.z.string().optional(),
            company: zod_1.z.string().optional(),
            jobTitle: zod_1.z.string().optional(),
            emailVerified: zod_1.z.boolean(),
            twoFactorEnabled: zod_1.z.boolean(),
            createdAt: zod_1.z.string(),
            workspaces: zod_1.z.array(zod_1.z.object({
                workspaceId: zod_1.z.string(),
                workspaceName: zod_1.z.string(),
                workspaceDescription: zod_1.z.string().optional(),
                role: zod_1.z.string(),
                joinedAt: zod_1.z.string(),
                projectsInWorkspace: zod_1.z.array(zod_1.z.object({
                    projectId: zod_1.z.string(),
                    projectName: zod_1.z.string(),
                    projectDescription: zod_1.z.string().optional(),
                })),
            })),
            totalComments: zod_1.z.number(),
            totalMessages: zod_1.z.number(),
            totalNotifications: zod_1.z.number(),
        },
    }, async ({ userId }) => {
        try {
            const user = await prisma_js_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    workspaces: {
                        include: {
                            workspace: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    projects: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                        },
                                    },
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    comments: {
                        select: { id: true },
                    },
                    messages: {
                        select: { id: true },
                    },
                    sentNotifications: {
                        select: { id: true },
                    },
                },
            });
            if (!user) {
                return {
                    content: [{ type: 'text', text: 'User not found' }],
                    isError: true,
                };
            }
            const output = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || undefined,
                bio: user.bio || undefined,
                phone: user.phone || undefined,
                location: user.location || undefined,
                website: user.website || undefined,
                timezone: user.timezone || undefined,
                language: user.language || undefined,
                company: user.company || undefined,
                jobTitle: user.jobTitle || undefined,
                emailVerified: user.emailVerified,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt.toISOString(),
                workspaces: user.workspaces.map((membership) => ({
                    workspaceId: membership.workspace.id,
                    workspaceName: membership.workspace.name,
                    workspaceDescription: membership.workspace.description || undefined,
                    role: membership.role,
                    joinedAt: membership.createdAt.toISOString(),
                    projectsInWorkspace: membership.workspace.projects.map((project) => ({
                        projectId: project.id,
                        projectName: project.name,
                        projectDescription: project.description || undefined,
                    })),
                })),
                totalComments: user.comments.length,
                totalMessages: user.messages.length,
                totalNotifications: user.sentNotifications.length,
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error fetching user: ${error}` }],
                isError: true,
            };
        }
    });
    // Tool: Search issues
    mcpServer.registerTool('searchIssues', {
        title: 'Search Issues',
        description: 'Search for issues in a project by title or description',
        inputSchema: {
            projectId: zod_1.z.string().describe('The ID of the project'),
            query: zod_1.z.string().describe('Search query'),
            limit: zod_1.z.number().optional().describe('Number of results (default: 10)'),
        },
        outputSchema: {
            results: zod_1.z.array(zod_1.z.object({
                id: zod_1.z.string(),
                issueNumber: zod_1.z.number(),
                title: zod_1.z.string(),
                description: zod_1.z.string(),
                status: zod_1.z.string(),
                priority: zod_1.z.string(),
            })),
        },
    }, async ({ projectId, query, limit = 10 }) => {
        try {
            const issues = await prisma_js_1.default.issue.findMany({
                where: {
                    projectId,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: limit,
                orderBy: { issueNumber: 'asc' },
                select: {
                    id: true,
                    issueNumber: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    type: true,
                },
            });
            const output = {
                results: issues.map((issue) => ({
                    id: issue.id,
                    issueNumber: issue.issueNumber,
                    title: issue.title,
                    description: issue.description,
                    status: issue.status,
                    priority: issue.priority,
                    type: issue.type,
                })),
                count: issues.length,
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
                structuredContent: output,
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Error searching issues: ${error}` }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=tools.js.map