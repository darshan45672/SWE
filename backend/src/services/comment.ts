import prisma from '../lib/prisma';
import { NotificationType } from '@prisma/client';
import { createNotification } from './notification';

// Types for Comment service - Context7 pattern
interface CreateCommentData {
  content: string;
  issueId: string;
}

interface UpdateCommentData {
  content: string;
}

// Helper function to check if user has access to the issue - Context7 pattern
const checkIssueAccess = async (issueId: string, userId: string) => {
  const issue = await prisma.issue.findUnique({
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
export const createComment = async (
  commentData: CreateCommentData,
  userId: string
) => {
  const { content, issueId } = commentData;

  // Check issue access
  const issue = await checkIssueAccess(issueId, userId);

  // Create comment
  const comment = await prisma.comment.create({
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
      const author = await prisma.user.findUnique({ where: { id: userId } });
      await createNotification({
        type: NotificationType.ISSUE_COMMENT,
        title: 'New Comment',
        message: `${author?.name || 'Someone'} commented on: ${issue.title}`,
        actorId: userId,
        recipientId: issue.assigneeId,
        issueId: issue.id,
        link: `/issues/${issue.id}`,
      });
    } catch (error) {
      console.error('Failed to send comment notification:', error);
      // Continue even if notification fails
    }
  }

  return comment;
};

// Get comments by issue ID - Context7 pattern
export const getCommentsByIssueId = async (issueId: string, userId: string) => {
  // Check issue access
  await checkIssueAccess(issueId, userId);

  // Get all comments for the issue
  const comments = await prisma.comment.findMany({
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

// Update comment - Context7 pattern
export const updateComment = async (
  commentId: string,
  commentData: UpdateCommentData,
  userId: string
) => {
  const { content } = commentData;

  // Check if comment exists and user is the author
  const existingComment = await prisma.comment.findUnique({
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
  const updatedComment = await prisma.comment.update({
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

// Delete comment - Context7 pattern
export const deleteComment = async (commentId: string, userId: string) => {
  // Check if comment exists and user is the author
  const existingComment = await prisma.comment.findUnique({
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
  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true, message: 'Comment deleted successfully' };
};
