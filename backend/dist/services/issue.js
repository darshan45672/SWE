"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unassignIssue = exports.assignIssue = exports.deleteIssue = exports.updateIssue = exports.createIssue = exports.getIssuesByProjectId = exports.getIssueById = void 0;
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
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            assigner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
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
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            assigner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
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
    const { title, description, status, priority, type, projectId, dueDate, tags, assigneeId } = issueData;
    // Check project access
    await checkProjectAccess(projectId, userId);
    // If assigneeId is provided, verify they are a workspace member
    if (assigneeId) {
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
            include: {
                workspace: {
                    include: {
                        members: {
                            where: { userId: assigneeId },
                        },
                    },
                },
            },
        });
        if (!project || project.workspace.members.length === 0) {
            throw new Error('Assignee is not a member of this workspace');
        }
    }
    // Get the next issue number for this project - Context7 pattern
    const lastIssue = await prisma_1.default.issue.findFirst({
        where: { projectId },
        orderBy: { issueNumber: 'desc' },
        select: { issueNumber: true },
    });
    const nextIssueNumber = (lastIssue?.issueNumber || 0) + 1;
    // Create issue with tags and assignee
    const issue = await prisma_1.default.issue.create({
        data: {
            issueNumber: nextIssueNumber,
            title,
            description: description || '',
            status,
            priority,
            type,
            projectId,
            assigneeId: assigneeId || undefined,
            assignedBy: assigneeId ? userId : undefined,
            assignedAt: assigneeId ? new Date() : undefined,
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
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            assigner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });
    // Send notification to assignee if assigned - Context7 pattern
    if (assigneeId) {
        try {
            const assigner = await prisma_1.default.user.findUnique({ where: { id: userId } });
            console.log(`📧 Sending assignment notification to ${assigneeId} from ${userId}`);
            await (0, notification_1.createNotification)({
                type: client_1.NotificationType.ISSUE_ASSIGNED,
                title: 'Issue Assigned',
                message: `${assigner?.name || 'Someone'} assigned you to: ${title}`,
                actorId: userId,
                recipientId: assigneeId,
                issueId: issue.id,
                link: `/issues/${issue.id}`,
            });
            console.log(`✅ Assignment notification created and emitted for ${assigneeId}`);
        }
        catch (error) {
            console.error('❌ Failed to send assignment notification:', error);
        }
    }
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
    // Validate assignee if provided
    if (issueData.assigneeId !== undefined) {
        if (issueData.assigneeId) {
            const assignee = await prisma_1.default.user.findUnique({
                where: { id: issueData.assigneeId },
            });
            if (!assignee) {
                throw new Error('Assignee not found');
            }
            // Check if assignee is a member of the workspace
            const workspace = await prisma_1.default.project.findUnique({
                where: { id: existingIssue.projectId },
                include: {
                    workspace: {
                        include: {
                            members: {
                                where: { userId: issueData.assigneeId },
                            },
                        },
                    },
                },
            });
            if (!workspace?.workspace.members.length) {
                throw new Error('Assignee must be a member of the workspace');
            }
        }
    }
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
            ...(issueData.assigneeId !== undefined && {
                assigneeId: issueData.assigneeId || null,
                ...(issueData.assigneeId && {
                    assignedBy: userId,
                    assignedAt: new Date(),
                }),
            }),
        },
        include: {
            tags: {
                include: {
                    tag: true,
                },
            },
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            assigner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
    });
    // Send notification to workspace members - Context7 pattern
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        // Check if assignee was changed
        if (issueData.assigneeId !== undefined && issueData.assigneeId !== existingIssue.assigneeId) {
            if (issueData.assigneeId) {
                // New assignee - send assignment notification
                console.log(`📧 Sending assignment notification (update) to ${issueData.assigneeId}`);
                await (0, notification_1.createNotification)({
                    type: client_1.NotificationType.ISSUE_ASSIGNED,
                    title: 'Issue Assigned',
                    message: `${user?.name || 'Someone'} assigned you to: ${existingIssue.title}`,
                    actorId: userId,
                    recipientId: issueData.assigneeId,
                    issueId,
                    link: `/issues/${issueId}`,
                });
                console.log(`✅ Assignment notification (update) sent to ${issueData.assigneeId}`);
            }
            // Notify workspace about assignment change
            await (0, notification_1.notifyWorkspaceMembers)(userId, issueId, existingIssue.projectId, client_1.NotificationType.ISSUE_UPDATED, 'Issue Assignment Changed', `${user?.name || 'Someone'} changed the assignee of "${existingIssue.title}"`);
        }
        // Check if status was changed
        else if (issueData.status && issueData.status !== oldStatus) {
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
    console.log('🗑️  Starting deletion process for issue:', issueId);
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
    // Context7 pattern: Delete issue with all related data in a transaction
    try {
        await prisma_1.default.$transaction(async (tx) => {
            console.log('🔄 Starting transaction to delete issue and related data...');
            // Step 1: Delete all issue tags
            const deletedTags = await tx.issueTag.deleteMany({
                where: { issueId },
            });
            console.log(`✅ Deleted ${deletedTags.count} issue tags`);
            // Step 2: Delete all comments
            const deletedComments = await tx.comment.deleteMany({
                where: { issueId },
            });
            console.log(`✅ Deleted ${deletedComments.count} comments`);
            // Step 3: Update notifications to remove issue reference (set issueId to null)
            // instead of deleting them, so notification history is preserved
            const updatedNotifications = await tx.notification.updateMany({
                where: { issueId },
                data: { issueId: null },
            });
            console.log(`✅ Updated ${updatedNotifications.count} notifications`);
            // Step 4: Finally delete the issue itself
            const deletedIssue = await tx.issue.delete({
                where: { id: issueId },
            });
            console.log('✅ Issue deleted successfully:', deletedIssue.id);
        });
        console.log('✅ Transaction completed successfully');
        return { message: 'Issue deleted successfully' };
    }
    catch (error) {
        console.error('❌ Failed to delete issue in transaction:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
        }
        throw new Error('Failed to delete issue. Please try again.');
    }
};
exports.deleteIssue = deleteIssue;
// Assign issue to workspace member - Context7 pattern
const assignIssue = async (issueId, assigneeId, assignerId) => {
    // Check if issue exists and assigner has access
    const issue = await (0, exports.getIssueById)(issueId, assignerId);
    // Verify assignee is a member of the workspace
    const project = await prisma_1.default.project.findUnique({
        where: { id: issue.projectId },
        include: {
            workspace: {
                include: {
                    members: {
                        where: { userId: assigneeId },
                    },
                },
            },
        },
    });
    if (!project || project.workspace.members.length === 0) {
        throw new Error('Assignee is not a member of this workspace');
    }
    // Update issue with assignee
    const updatedIssue = await prisma_1.default.issue.update({
        where: { id: issueId },
        data: {
            assigneeId,
            assignedBy: assignerId,
            assignedAt: new Date(),
        },
        include: {
            project: true,
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            assigner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });
    // Send notification to assignee - Context7 pattern
    try {
        const assigner = await prisma_1.default.user.findUnique({ where: { id: assignerId } });
        // Notify the assignee
        await prisma_1.default.notification.create({
            data: {
                type: client_1.NotificationType.ISSUE_ASSIGNED,
                title: 'Issue Assigned',
                message: `${assigner?.name || 'Someone'} assigned you to: ${issue.title}`,
                actorId: assignerId,
                recipientId: assigneeId,
                issueId,
            },
        });
        // Also notify workspace members about the assignment
        await (0, notification_1.notifyWorkspaceMembers)(assignerId, issueId, issue.projectId, client_1.NotificationType.ISSUE_UPDATED, 'Issue Assigned', `${assigner?.name || 'Someone'} assigned "${issue.title}" to ${updatedIssue.assignee?.name}`);
    }
    catch (error) {
        console.error('Failed to send notification:', error);
        // Continue even if notification fails
    }
    return updatedIssue;
};
exports.assignIssue = assignIssue;
// Unassign issue - Context7 pattern
const unassignIssue = async (issueId, userId) => {
    // Check if issue exists and user has access
    const issue = await (0, exports.getIssueById)(issueId, userId);
    // Check if issue is assigned
    if (!issue.assigneeId) {
        throw new Error('Issue is not assigned to anyone');
    }
    const previousAssigneeId = issue.assigneeId;
    // Update issue to remove assignee
    const updatedIssue = await prisma_1.default.issue.update({
        where: { id: issueId },
        data: {
            assigneeId: null,
            assignedBy: null,
            assignedAt: null,
        },
        include: {
            project: true,
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            assigner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            comments: {
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });
    // Send notification - Context7 pattern
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        // Notify the previous assignee
        await prisma_1.default.notification.create({
            data: {
                type: client_1.NotificationType.ISSUE_UPDATED,
                title: 'Issue Unassigned',
                message: `${user?.name || 'Someone'} unassigned you from: ${issue.title}`,
                actorId: userId,
                recipientId: previousAssigneeId,
                issueId,
            },
        });
        // Notify workspace members
        await (0, notification_1.notifyWorkspaceMembers)(userId, issueId, issue.projectId, client_1.NotificationType.ISSUE_UPDATED, 'Issue Unassigned', `${user?.name || 'Someone'} unassigned "${issue.title}"`);
    }
    catch (error) {
        console.error('Failed to send notification:', error);
        // Continue even if notification fails
    }
    return updatedIssue;
};
exports.unassignIssue = unassignIssue;
//# sourceMappingURL=issue.js.map