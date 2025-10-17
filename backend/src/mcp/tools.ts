import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import prisma from '../lib/prisma.js';

/**
 * Initialize MCP tools for AI context gathering
 * These tools allow the AI to fetch relevant data from the database
 */
export function registerMCPTools(mcpServer: McpServer) {
  // Tool: Get project information
  mcpServer.registerTool(
    'getProjectInfo',
    {
      title: 'Get Project Information',
      description: 'Retrieve detailed information about a project including name, description, and metadata',
      inputSchema: {
        projectId: z.string().describe('The ID of the project'),
      },
      outputSchema: {
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        workspaceId: z.string(),
        isActive: z.boolean(),
        createdAt: z.string(),
        updatedAt: z.string(),
      },
    },
    async ({ projectId }) => {
      try {
        const project = await prisma.project.findUnique({
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
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error fetching project: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get workspace information
  mcpServer.registerTool(
    'getWorkspaceInfo',
    {
      title: 'Get Workspace Information',
      description: 'Retrieve workspace details and member count',
      inputSchema: {
        workspaceId: z.string().describe('The ID of the workspace'),
      },
      outputSchema: {
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        memberCount: z.number(),
        projectCount: z.number(),
      },
    },
    async ({ workspaceId }) => {
      try {
        const workspace = await prisma.workspace.findUnique({
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
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error fetching workspace: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get issues summary
  mcpServer.registerTool(
    'getIssuesSummary',
    {
      title: 'Get Issues Summary',
      description: 'Get count and breakdown of issues by status, priority, and type for a project',
      inputSchema: {
        projectId: z.string().describe('The ID of the project'),
      },
      outputSchema: {
        totalIssues: z.number(),
        byStatus: z.object({
          TODO: z.number(),
          IN_PROGRESS: z.number(),
          DONE: z.number(),
        }),
        byPriority: z.object({
          LOW: z.number(),
          MEDIUM: z.number(),
          HIGH: z.number(),
          URGENT: z.number(),
        }),
        byType: z.object({
          BUG: z.number(),
          FEATURE: z.number(),
          TASK: z.number(),
          IMPROVEMENT: z.number(),
        }),
      },
    },
    async ({ projectId }) => {
      try {
        const issues = await prisma.issue.findMany({
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
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error fetching issues: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get recent issues
  mcpServer.registerTool(
    'getRecentIssues',
    {
      title: 'Get Recent Issues',
      description: 'Get list of recent issues with details',
      inputSchema: {
        projectId: z.string().describe('The ID of the project'),
        limit: z.number().optional().describe('Number of issues to fetch (default: 10)'),
      },
      outputSchema: {
        issues: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            status: z.string(),
            priority: z.string(),
            type: z.string(),
            createdAt: z.string(),
          })
        ),
      },
    },
    async ({ projectId, limit = 10 }) => {
      try {
        const issues = await prisma.issue.findMany({
          where: { projectId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: {
            id: true,
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
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error fetching issues: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get chat history
  mcpServer.registerTool(
    'getChatHistory',
    {
      title: 'Get Chat History',
      description: 'Retrieve recent chat messages from a project',
      inputSchema: {
        projectId: z.string().describe('The ID of the project'),
        limit: z.number().optional().describe('Number of messages to fetch (default: 50)'),
      },
      outputSchema: {
        messages: z.array(
          z.object({
            id: z.string(),
            content: z.string(),
            senderName: z.string(),
            isAIMessage: z.boolean(),
            createdAt: z.string(),
          })
        ),
      },
    },
    async ({ projectId, limit = 50 }) => {
      try {
        const messages = await prisma.message.findMany({
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
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error fetching chat history: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Tool: Get workspace members
  mcpServer.registerTool(
    'getWorkspaceMembers',
    {
      title: 'Get Workspace Members',
      description: 'Get list of members in a workspace with their roles',
      inputSchema: {
        workspaceId: z.string().describe('The ID of the workspace'),
      },
      outputSchema: {
        members: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            role: z.string(),
            joinedAt: z.string(),
          })
        ),
      },
    },
    async ({ workspaceId }) => {
      try {
        const members = await prisma.workspaceMember.findMany({
          where: { workspaceId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
            role: member.role,
            joinedAt: member.createdAt.toISOString(),
          })),
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error fetching members: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Tool: Search issues
  mcpServer.registerTool(
    'searchIssues',
    {
      title: 'Search Issues',
      description: 'Search for issues in a project by title or description',
      inputSchema: {
        projectId: z.string().describe('The ID of the project'),
        query: z.string().describe('Search query'),
        limit: z.number().optional().describe('Number of results (default: 10)'),
      },
      outputSchema: {
        results: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            status: z.string(),
            priority: z.string(),
          })
        ),
      },
    },
    async ({ projectId, query, limit = 10 }) => {
      try {
        const issues = await prisma.issue.findMany({
          where: {
            projectId,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          select: {
            id: true,
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
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error searching issues: ${error}` }],
          isError: true,
        };
      }
    }
  );
}
