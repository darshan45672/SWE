/**
 * AI Service for Gemini integration with MCP tools
 */
declare class AIService {
    private ai;
    private mcpServer;
    private initialized;
    constructor();
    private initialize;
    /**
     * Check if AI service is available
     */
    isAvailable(): boolean;
    /**
     * Build context for AI based on project data
     */
    private buildProjectContext;
    /**
     * Define function declarations for Gemini
     */
    private getFunctionDeclarations;
    /**
     * Execute MCP tool call
     */
    private executeTool;
    private getProjectInfoTool;
    private getIssuesSummaryTool;
    private getRecentIssuesTool;
    private getChatHistoryTool;
    private searchIssuesTool;
    /**
     * Generate AI response for a user message
     */
    generateResponse(params: {
        message: string;
        projectId: string;
        workspaceId: string;
        userId: string;
        userName: string;
    }): Promise<{
        content: string;
        context: any;
    }>;
    /**
     * Check if a message mentions AI
     */
    static isAIMention(message: string): boolean;
    /**
     * Extract the actual message content without @AI mention
     */
    static extractMessage(message: string): string;
}
export { AIService };
export declare const aiService: AIService;
export default aiService;
//# sourceMappingURL=ai.d.ts.map