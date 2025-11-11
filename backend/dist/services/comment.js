"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.getCommentsByIssueId = exports.createComment = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const notification_1 = require("./notification");
// Helper function to check if user has access to the issue - Context7 pattern
const checkIssueAccess = async (issueId, userId) => {
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
// Create comment - Context7 pattern
const createComment = async (commentData, userId) => {
    const { content, issueId } = commentData;
    // Check issue access
    const issue = await checkIssueAccess(issueId, userId);
    // Create comment
    const comment = await prisma_1.default.comment.create({
        data: {
            content,
            authorId: userId,
            issueId,
        },
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
    });
    // Send notification to issue assignee if exists and is not the commenter
    if (issue.assigneeId && issue.assigneeId !== userId) {
        try {
            const author = await prisma_1.default.user.findUnique({ where: { id: userId } });
            await (0, notification_1.createNotification)({
                type: client_1.NotificationType.ISSUE_COMMENT,
                title: 'New Comment',
                message: `${author?.name || 'Someone'} commented on: ${issue.title}`,
                actorId: userId,
                recipientId: issue.assigneeId,
                issueId: issue.id,
                link: `/issues/${issue.id}`,
            });
        }
        catch (error) {
            console.error('Failed to send comment notification:', error);
            // Continue even if notification fails
        }
    }
    return comment;
};
exports.createComment = createComment;
// Get comments by issue ID - Context7 pattern
const getCommentsByIssueId = async (issueId, userId) => {
    // Check issue access
    await checkIssueAccess(issueId, userId);
    // Get all comments for the issue
    const comments = await prisma_1.default.comment.findMany({
        where: { issueId },
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
    });
    return comments;
};
exports.getCommentsByIssueId = getCommentsByIssueId;
// Update comment - Context7 pattern
const updateComment = async (commentId, commentData, userId) => {
    const { content } = commentData;
    // Check if comment exists and user is the author
    const existingComment = await prisma_1.default.comment.findUnique({
        where: { id: commentId },
        include: {
            issue: {
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
            },
        },
    });
    if (!existingComment) {
        throw new Error('Comment not found');
    }
    if (existingComment.issue.project.workspace.members.length === 0) {
        throw new Error('Access denied');
    }
    if (existingComment.authorId !== userId) {
        throw new Error('You can only edit your own comments');
    }
    // Update comment
    const updatedComment = await prisma_1.default.comment.update({
        where: { id: commentId },
        data: { content },
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
    });
    return updatedComment;
};
exports.updateComment = updateComment;
// Delete comment - Context7 pattern
const deleteComment = async (commentId, userId) => {
    // Check if comment exists and user is the author
    const existingComment = await prisma_1.default.comment.findUnique({
        where: { id: commentId },
        include: {
            issue: {
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
            },
        },
    });
    if (!existingComment) {
        throw new Error('Comment not found');
    }
    if (existingComment.issue.project.workspace.members.length === 0) {
        throw new Error('Access denied');
    }
    if (existingComment.authorId !== userId) {
        throw new Error('You can only delete your own comments');
    }
    // Delete comment
    await prisma_1.default.comment.delete({
        where: { id: commentId },
    });
    return { success: true, message: 'Comment deleted successfully' };
};
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.js.map