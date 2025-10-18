"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIssue = exports.updateIssue = exports.createIssue = exports.getIssuesByProjectId = exports.getIssueById = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const notification_1 = require("./notification");
// Helper function to check project access - Context7 pattern
const checkProjectAccess = async (projectId, userId) => {
    const project = await prisma_1.default.project.findUnique({
        where: { id: projectId },
        include: {
            workspace: {
                include: {
                    members: {
                        where: { userId },
                    },
                },
            },
        },
    });
    if (!project) {
        throw new Error('Project not found');
    }
    if (project.workspace.members.length === 0) {
        throw new Error('Access denied');
    }
    return project;
};
// Get issue by ID - Context7 pattern
const getIssueById = async (issueId, userId) => {
    const issue = await prisma_1.default.issue.findUnique({
        where: { id: issueId },
        include: {
            project: {
                include: {
                    workspace: {
                        include: {
                            members: {
                                where: { userId },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!issue) {
        throw new Error('Issue not found');
    }
    if (issue.project.workspace.members.length === 0) {
        throw new Error('Access denied');
    }
    return issue;
};
exports.getIssueById = getIssueById;
// Get issues by project ID - Context7 pattern
const getIssuesByProjectId = async (projectId, userId) => {
    // Check project access
    await checkProjectAccess(projectId, userId);
    // Get all issues for the project
    const issues = await prisma_1.default.issue.findMany({
        where: { projectId },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    return issues;
};
exports.getIssuesByProjectId = getIssuesByProjectId;
// Create issue - Context7 pattern (Simplified)
const createIssue = async (issueData, userId) => {
    const { title, description, status, priority, type, projectId, dueDate, tags } = issueData;
    // Check project access
    await checkProjectAccess(projectId, userId);
    // Create issue with tags
    const issue = await prisma_1.default.issue.create({
        data: {
            title,
            description: description || '',
            status,
            priority,
            type,
            projectId,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            tags: tags && tags.length > 0 ? {
                create: await Promise.all(tags.map(async (tagName) => {
                    // Find or create tag
                    let tag = await prisma_1.default.tag.findUnique({
                        where: { name: tagName },
                    });
                    if (!tag) {
                        tag = await prisma_1.default.tag.create({
                            data: { name: tagName },
                        });
                    }
                    return {
                        tag: {
                            connect: { id: tag.id },
                        },
                    };
                })),
            } : undefined,
        },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });
    // Send notification to workspace members - Context7 pattern
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        await (0, notification_1.notifyWorkspaceMembers)(userId, issue.id, projectId, client_1.NotificationType.ISSUE_CREATED, 'New Issue Created', `${user?.name || 'Someone'} created a new issue: ${title}`);
    }
    catch (error) {
        console.error('Failed to send notification:', error);
        // Continue even if notification fails
    }
    return issue;
};
exports.createIssue = createIssue;
// Update issue - Context7 pattern (Simplified)
const updateIssue = async (issueId, issueData, userId) => {
    // Check if issue exists and user has access
    const existingIssue = await (0, exports.getIssueById)(issueId, userId);
    const oldStatus = existingIssue.status;
    // Handle tags update if provided
    if (issueData.tags !== undefined) {
        // Delete existing tags
        await prisma_1.default.issueTag.deleteMany({
            where: { issueId },
        });
        // Add new tags if provided
        if (issueData.tags.length > 0) {
            await Promise.all(issueData.tags.map(async (tagName) => {
                // Find or create tag
                let tag = await prisma_1.default.tag.findUnique({
                    where: { name: tagName },
                });
                if (!tag) {
                    tag = await prisma_1.default.tag.create({
                        data: { name: tagName },
                    });
                }
                // Create issue tag relation
                await prisma_1.default.issueTag.create({
                    data: {
                        issueId,
                        tagId: tag.id,
                    },
                });
            }));
        }
    }
    // Update issue
    const updatedIssue = await prisma_1.default.issue.update({
        where: { id: issueId },
        data: {
            ...(issueData.title && { title: issueData.title }),
            ...(issueData.description !== undefined && { description: issueData.description }),
            ...(issueData.status && { status: issueData.status }),
            ...(issueData.priority && { priority: issueData.priority }),
            ...(issueData.type && { type: issueData.type }),
            ...(issueData.dueDate !== undefined && { dueDate: issueData.dueDate ? new Date(issueData.dueDate) : null }),
        },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });
    // Send notification to workspace members - Context7 pattern
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        // Check if status was changed
        if (issueData.status && issueData.status !== oldStatus) {
            await (0, notification_1.notifyWorkspaceMembers)(userId, issueId, existingIssue.projectId, client_1.NotificationType.ISSUE_UPDATED, 'Issue Status Changed', `${user?.name || 'Someone'} changed the status of "${existingIssue.title}" from ${oldStatus} to ${issueData.status}`);
        }
        else {
            await (0, notification_1.notifyWorkspaceMembers)(userId, issueId, existingIssue.projectId, client_1.NotificationType.ISSUE_UPDATED, 'Issue Updated', `${user?.name || 'Someone'} updated the issue: ${existingIssue.title}`);
        }
    }
    catch (error) {
        console.error('Failed to send notification:', error);
        // Continue even if notification fails
    }
    return updatedIssue;
};
exports.updateIssue = updateIssue;
// Delete issue - Context7 pattern
const deleteIssue = async (issueId, userId) => {
    // Check if issue exists and user has access
    const issue = await (0, exports.getIssueById)(issueId, userId);
    // Send notification to workspace members before deleting - Context7 pattern
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        await (0, notification_1.notifyWorkspaceMembers)(userId, issueId, issue.projectId, client_1.NotificationType.ISSUE_UPDATED, // Using ISSUE_UPDATED as closest type
        'Issue Deleted', `${user?.name || 'Someone'} deleted the issue: ${issue.title}`);
    }
    catch (error) {
        console.error('Failed to send notification:', error);
        // Continue even if notification fails
    }
    // Delete issue
    await prisma_1.default.issue.delete({
        where: { id: issueId },
    });
    return { message: 'Issue deleted successfully' };
};
exports.deleteIssue = deleteIssue;
//# sourceMappingURL=issue.js.map