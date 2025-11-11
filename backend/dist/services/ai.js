"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const genai_1 = require("@google/genai");
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const tools_js_1 = require("../mcp/tools.js");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not found in environment variables. AI features will be disabled.');
}
/**
 * AI Service for Gemini integration with MCP tools
 */
class AIService {
    ai = null;
    mcpServer = null;
    initialized = false;
    constructor() {
        if (GEMINI_API_KEY) {
            this.initialize();
        }
    }
    initialize() {
        try {
            // Initialize Google GenAI
            this.ai = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY });
            // Initialize MCP Server
            this.mcpServer = new mcp_js_1.McpServer({
                name: 'project-context-server',
                version: '1.0.0',
            });
            // Register all MCP tools
            (0, tools_js_1.registerMCPTools)(this.mcpServer);
            this.initialized = true;
            console.log('✅ AI Service initialized with Gemini and MCP tools');
        }
        catch (error) {
            console.error('❌ Failed to initialize AI Service:', error);
            this.initialized = false;
        }
    }
    /**
     * Check if AI service is available
     */
    isAvailable() {
        return this.initialized && this.ai !== null;
    }
    /**
     * Build context for AI based on project data
     */
    async buildProjectContext(projectId, workspaceId) {
        try {
            // Fetch project info
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
            // Fetch issues summary
            const issues = await prisma_js_1.default.issue.findMany({
                where: { projectId },
                select: {
                    id: true,
                    issueNumber: true,
                    title: true,
                    status: true,
                    priority: true,
                    type: true,
                },
                orderBy: { issueNumber: 'asc' },
            });
            // Fetch recent messages (excluding AI messages to avoid circular context)
            const recentMessages = await prisma_js_1.default.message.findMany({
                where: {
                    projectId,
                    isAIMessage: false,
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    sender: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            // Fetch workspace members with comprehensive details
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
                            // Get comment and message counts
                            comments: {
                                select: {
                                    id: true,
                                },
                            },
                            messages: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
            });
            return {
                project: {
                    id: project?.id,
                    name: project?.name,
                    description: project?.description,
                },
                workspace: {
                    name: project?.workspace.name,
                    description: project?.workspace.description,
                },
                issues: {
                    total: issues.length,
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
                    recent: issues.slice(0, 5).map((i) => ({
                        issueNumber: i.issueNumber,
                        title: i.title,
                        status: i.status,
                        priority: i.priority,
                        type: i.type,
                    })),
                },
                recentChat: recentMessages.reverse().map((m) => ({
                    sender: m.sender.name,
                    content: m.content,
                    timestamp: m.createdAt.toISOString(),
                })),
                members: members.map((m) => ({
                    id: m.user.id,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar,
                    bio: m.user.bio,
                    phone: m.user.phone,
                    location: m.user.location,
                    website: m.user.website,
                    company: m.user.company,
                    jobTitle: m.user.jobTitle,
                    role: m.role,
                    emailVerified: m.user.emailVerified,
                    joinedAt: m.createdAt.toISOString(),
                    accountCreated: m.user.createdAt.toISOString(),
                    allWorkspaces: m.user.workspaces.map((ws) => ({
                        workspaceId: ws.workspace.id,
                        workspaceName: ws.workspace.name,
                        workspaceDescription: ws.workspace.description,
                        role: ws.role,
                        joinedAt: ws.createdAt.toISOString(),
                    })),
                    commentsCount: m.user.comments.length,
                    messagesCount: m.user.messages.length,
                })),
            };
        }
        catch (error) {
            console.error('Error building project context:', error);
            return null;
        }
    }
    /**
     * Define function declarations for Gemini
     */
    getFunctionDeclarations() {
        return [
            {
                name: 'getProjectInfo',
                description: 'Get detailed information about the current project',
                parametersJsonSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID',
                        },
                    },
                    required: ['projectId'],
                },
            },
            {
                name: 'getIssuesSummary',
                description: 'Get a summary of all issues in the project including counts by status, priority, and type',
                parametersJsonSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID',
                        },
                    },
                    required: ['projectId'],
                },
            },
            {
                name: 'getRecentIssues',
                description: 'Get a list of recent issues with full details',
                parametersJsonSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID',
                        },
                        limit: {
                            type: 'number',
                            description: 'Number of issues to retrieve (default: 10)',
                        },
                    },
                    required: ['projectId'],
                },
            },
            {
                name: 'getChatHistory',
                description: 'Get recent chat messages from the project',
                parametersJsonSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID',
                        },
                        limit: {
                            type: 'number',
                            description: 'Number of messages to retrieve (default: 50)',
                        },
                    },
                    required: ['projectId'],
                },
            },
            {
                name: 'searchIssues',
                description: 'Search for issues by title or description',
                parametersJsonSchema: {
                    type: 'object',
                    properties: {
                        projectId: {
                            type: 'string',
                            description: 'The project ID',
                        },
                        query: {
                            type: 'string',
                            description: 'Search query',
                        },
                        limit: {
                            type: 'number',
                            description: 'Number of results (default: 10)',
                        },
                    },
                    required: ['projectId', 'query'],
                },
            },
        ];
    }
    /**
     * Execute MCP tool call
     */
    async executeTool(toolName, args) {
        // Directly call the appropriate tool based on name
        try {
            switch (toolName) {
                case 'getProjectInfo':
                    return await this.getProjectInfoTool(args.projectId);
                case 'getIssuesSummary':
                    return await this.getIssuesSummaryTool(args.projectId);
                case 'getRecentIssues':
                    return await this.getRecentIssuesTool(args.projectId, args.limit);
                case 'getChatHistory':
                    return await this.getChatHistoryTool(args.projectId, args.limit);
                case 'searchIssues':
                    return await this.searchIssuesTool(args.projectId, args.query, args.limit);
                default:
                    throw new Error(`Tool ${toolName} not found`);
            }
        }
        catch (error) {
            console.error(`Error executing tool ${toolName}:`, error);
            throw error;
        }
    }
    async getProjectInfoTool(projectId) {
        const project = await prisma_js_1.default.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: { select: { name: true, description: true } },
            },
        });
        return project;
    }
    async getIssuesSummaryTool(projectId) {
        const issues = await prisma_js_1.default.issue.findMany({
            where: { projectId },
            select: { status: true, priority: true, type: true },
        });
        return {
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
    }
    async getRecentIssuesTool(projectId, limit = 10) {
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
                assignee: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return { issues };
    }
    async getChatHistoryTool(projectId, limit = 50) {
        const messages = await prisma_js_1.default.message.findMany({
            where: { projectId, isAIMessage: false },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { sender: { select: { name: true } } },
        });
        return { messages: messages.reverse() };
    }
    async searchIssuesTool(projectId, query, limit = 10) {
        const issues = await prisma_js_1.default.issue.findMany({
            where: {
                projectId,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: limit,
        });
        return { results: issues };
    }
    /**
     * Generate AI response for a user message
     */
    async generateResponse(params) {
        if (!this.isAvailable()) {
            return {
                content: 'Sorry, AI features are currently unavailable. Please contact the administrator.',
                context: { error: 'AI service not initialized' },
            };
        }
        try {
            const { message, projectId, workspaceId, userName } = params;
            // Build comprehensive project context
            const projectContext = await this.buildProjectContext(projectId, workspaceId);
            // Fetch additional detailed information
            const recentIssues = await this.getRecentIssuesTool(projectId, 10);
            const chatHistory = await this.getChatHistoryTool(projectId, 30);
            // Create comprehensive system prompt with all context
            const systemPrompt = `You are an AI assistant integrated into a project management system. You help users understand their projects, issues, and team activities.

**IMPORTANT:** You have been provided with complete context below. Answer questions directly using this information. DO NOT request additional data.

**Current Project Context:**
- Project ID: ${projectContext?.project?.id}
- Project Name: ${projectContext?.project?.name || 'Unknown'}
- Project Description: ${projectContext?.project?.description || 'No description'}
- Workspace: ${projectContext?.workspace?.name || 'Unknown'}

**Issues Summary:**
- Total Issues: ${projectContext?.issues?.total || 0}
- Status Breakdown:
  * TODO: ${projectContext?.issues?.byStatus?.TODO || 0}
  * IN_PROGRESS: ${projectContext?.issues?.byStatus?.IN_PROGRESS || 0}
  * DONE: ${projectContext?.issues?.byStatus?.DONE || 0}
- Priority Breakdown:
  * URGENT: ${projectContext?.issues?.byPriority?.URGENT || 0}
  * HIGH: ${projectContext?.issues?.byPriority?.HIGH || 0}
  * MEDIUM: ${projectContext?.issues?.byPriority?.MEDIUM || 0}
  * LOW: ${projectContext?.issues?.byPriority?.LOW || 0}

**Recent Issues (Last 10):**
${recentIssues.issues.map((issue) => `#${issue.issueNumber} - [${issue.status}] ${issue.title} (Priority: ${issue.priority}, Type: ${issue.type})${issue.assignee ? ` - Assigned to: ${issue.assignee.name}` : ''}`).join('\n')}

**Team Members (${projectContext?.members?.length || 0}):**
${projectContext?.members?.map((m) => {
                const workspaces = m.allWorkspaces.map((ws) => `${ws.workspaceName} (${ws.role})`).join(', ');
                return `
**${m.name}** - ${m.role}
- Email: ${m.email}
- Job: ${m.jobTitle || 'Not specified'} at ${m.company || 'Not specified'}
- Location: ${m.location || 'Not specified'}
- Phone: ${m.phone || 'Not specified'}
- Bio: ${m.bio || 'Not specified'}
- Email Verified: ${m.emailVerified ? 'Yes' : 'No'}
- Activity: ${m.commentsCount} comments, ${m.messagesCount} messages
- Workspaces: ${workspaces || 'Only this workspace'}
- Joined: ${new Date(m.joinedAt).toLocaleDateString()}
`;
            }).join('\n') || 'No members listed'}

**Recent Chat History (Last 30 messages):**
${chatHistory.messages.map((msg) => `${msg.senderName}: ${msg.content}`).join('\n')}

**Your Guidelines:**
1. **Be Natural & Conversational**: Write responses as natural flowing text, like you're having a conversation
2. **Use Proper Formatting**:
   - Start each new piece of information on a NEW LINE
   - Use **bold** for names and important details
   - Use blank lines to separate different sections
   - Only use bullet points (-) when listing multiple items
   - NEVER put multiple pieces of info on the same line with pipes (|)
3. **For Member Lists**: When asked "who are the members":
   - Format: "The team members are: **Name** (Role) and **Name** (Role)."
   - Keep it simple and clean
4. **For User Details**: When asked about a specific person:
   - Start with the person's name and role in one sentence
   - Then add key details on separate lines with clear labels
   - Example: Email: address, Job: title, Location: place
   - Use proper line breaks between each detail
5. **For Summaries**: When asked to summarize:
   - Write 2-3 clear sentences
   - Focus on main topics and key points
   - Don't list every single message

**User Question:**
User "${userName}" is asking: ${message}

**Your Response:**`;
            // Call Gemini without function calling - just direct response
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: systemPrompt,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            });
            const finalResponse = response.text || 'I apologize, but I could not generate a response.';
            return {
                content: finalResponse,
                context: {
                    projectContext,
                    recentIssues: recentIssues.issues.length,
                    chatHistoryCount: chatHistory.messages.length,
                    model: 'gemini-2.0-flash',
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            console.error('Error generating AI response:', error);
            return {
                content: `I apologize, but I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
                context: { error: error.message },
            };
        }
    }
    /**
     * Check if a message mentions AI
     */
    static isAIMention(message) {
        return message.trim().toLowerCase().startsWith('@ai');
    }
    /**
     * Extract the actual message content without @AI mention
     */
    static extractMessage(message) {
        return message.replace(/^@ai\s*/i, '').trim();
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
exports.default = exports.aiService;
//# sourceMappingURL=ai.js.map