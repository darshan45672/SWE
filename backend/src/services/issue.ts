import prisma from '../lib/prisma';
import { Priority, IssueStatus, IssueType, NotificationType } from '@prisma/client';
import { notifyWorkspaceMembers, createNotification } from './notification';

// Types for Issue service - Context7 pattern (Simplified)
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

// Helper function to check project access - Context7 pattern
const checkProjectAccess = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
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
export const getIssueById = async (issueId: string, userId: string) => {
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

// Get issues by project ID - Context7 pattern
export const getIssuesByProjectId = async (projectId: string, userId: string) => {
  // Check project access
  await checkProjectAccess(projectId, userId);

  // Get all issues for the project
  const issues = await prisma.issue.findMany({
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

// Create issue - Context7 pattern (Simplified)
export const createIssue = async (
  issueData: CreateIssueData,
  userId: string
) => {
  const { title, description, status, priority, type, projectId, dueDate, tags, assigneeId } = issueData;

  // Check project access
  await checkProjectAccess(projectId, userId);

  // If assigneeId is provided, verify they are a workspace member
  if (assigneeId) {
    const project = await prisma.project.findUnique({
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
  const lastIssue = await prisma.issue.findFirst({
    where: { projectId },
    orderBy: { issueNumber: 'desc' },
    select: { issueNumber: true },
  });

  const nextIssueNumber = (lastIssue?.issueNumber || 0) + 1;

  // Create issue with tags and assignee
  const issue = await prisma.issue.create({
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
        create: await Promise.all(
          tags.map(async (tagName) => {
            // Find or create tag
            let tag = await prisma.tag.findUnique({
              where: { name: tagName },
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: { name: tagName },
              });
            }

            return {
              tag: {
                connect: { id: tag.id },
              },
            };
          })
        ),
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
      const assigner = await prisma.user.findUnique({ where: { id: userId } });
      console.log(`📧 Sending assignment notification to ${assigneeId} from ${userId}`);
      
      await createNotification({
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'Issue Assigned',
        message: `${assigner?.name || 'Someone'} assigned you to: ${title}`,
        actorId: userId,
        recipientId: assigneeId,
        issueId: issue.id,
        link: `/issues/${issue.id}`,
      });
      
      console.log(`✅ Assignment notification created and emitted for ${assigneeId}`);
    } catch (error) {
      console.error('❌ Failed to send assignment notification:', error);
    }
  }

  // Send notification to workspace members - Context7 pattern
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await notifyWorkspaceMembers(
      userId,
      issue.id,
      projectId,
      NotificationType.ISSUE_CREATED,
      'New Issue Created',
      `${user?.name || 'Someone'} created a new issue: ${title}`
    );
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Continue even if notification fails
  }

  return issue;
};

// Update issue - Context7 pattern (Simplified)
export const updateIssue = async (
  issueId: string,
  issueData: UpdateIssueData,
  userId: string
) => {
  // Check if issue exists and user has access
  const existingIssue = await getIssueById(issueId, userId);
  const oldStatus = existingIssue.status;

  // Validate assignee if provided
  if (issueData.assigneeId !== undefined) {
    if (issueData.assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: issueData.assigneeId },
      });

      if (!assignee) {
        throw new Error('Assignee not found');
      }

      // Check if assignee is a member of the workspace
      const workspace = await prisma.project.findUnique({
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
    await prisma.issueTag.deleteMany({
      where: { issueId },
    });

    // Add new tags if provided
    if (issueData.tags.length > 0) {
      await Promise.all(
        issueData.tags.map(async (tagName) => {
          // Find or create tag
          let tag = await prisma.tag.findUnique({
            where: { name: tagName },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: { name: tagName },
            });
          }

          // Create issue tag relation
          await prisma.issueTag.create({
            data: {
              issueId,
              tagId: tag.id,
            },
          });
        })
      );
    }
  }

  // Update issue
  const updatedIssue = await prisma.issue.update({
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Check if assignee was changed
    if (issueData.assigneeId !== undefined && issueData.assigneeId !== existingIssue.assigneeId) {
      if (issueData.assigneeId) {
        // New assignee - send assignment notification
        console.log(`📧 Sending assignment notification (update) to ${issueData.assigneeId}`);
        await createNotification({
          type: NotificationType.ISSUE_ASSIGNED,
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
      await notifyWorkspaceMembers(
        userId,
        issueId,
        existingIssue.projectId,
        NotificationType.ISSUE_UPDATED,
        'Issue Assignment Changed',
        `${user?.name || 'Someone'} changed the assignee of "${existingIssue.title}"`
      );
    }
    // Check if status was changed
    else if (issueData.status && issueData.status !== oldStatus) {
      await notifyWorkspaceMembers(
        userId,
        issueId,
        existingIssue.projectId,
        NotificationType.ISSUE_UPDATED,
        'Issue Status Changed',
        `${user?.name || 'Someone'} changed the status of "${existingIssue.title}" from ${oldStatus} to ${issueData.status}`
      );
    } else {
      await notifyWorkspaceMembers(
        userId,
        issueId,
        existingIssue.projectId,
        NotificationType.ISSUE_UPDATED,
        'Issue Updated',
        `${user?.name || 'Someone'} updated the issue: ${existingIssue.title}`
      );
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Continue even if notification fails
  }

  return updatedIssue;
};

// Delete issue - Context7 pattern
export const deleteIssue = async (issueId: string, userId: string) => {
  // Check if issue exists and user has access
  const issue = await getIssueById(issueId, userId);

  console.log('🗑️  Starting deletion process for issue:', issueId);

  // Send notification to workspace members before deleting - Context7 pattern
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await notifyWorkspaceMembers(
      userId,
      issueId,
      issue.projectId,
      NotificationType.ISSUE_UPDATED, // Using ISSUE_UPDATED as closest type
      'Issue Deleted',
      `${user?.name || 'Someone'} deleted the issue: ${issue.title}`
    );
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Continue even if notification fails
  }

  // Context7 pattern: Delete issue with all related data in a transaction
  try {
    await prisma.$transaction(async (tx) => {
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
  } catch (error) {
    console.error('❌ Failed to delete issue in transaction:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw new Error('Failed to delete issue. Please try again.');
  }
};

// Assign issue to workspace member - Context7 pattern
export const assignIssue = async (issueId: string, assigneeId: string, assignerId: string) => {
  // Check if issue exists and assigner has access
  const issue = await getIssueById(issueId, assignerId);

  // Verify assignee is a member of the workspace
  const project = await prisma.project.findUnique({
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
  const updatedIssue = await prisma.issue.update({
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
    const assigner = await prisma.user.findUnique({ where: { id: assignerId } });
    
    // Notify the assignee
    await prisma.notification.create({
      data: {
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'Issue Assigned',
        message: `${assigner?.name || 'Someone'} assigned you to: ${issue.title}`,
        actorId: assignerId,
        recipientId: assigneeId,
        issueId,
      },
    });

    // Also notify workspace members about the assignment
    await notifyWorkspaceMembers(
      assignerId,
      issueId,
      issue.projectId,
      NotificationType.ISSUE_UPDATED,
      'Issue Assigned',
      `${assigner?.name || 'Someone'} assigned "${issue.title}" to ${updatedIssue.assignee?.name}`
    );
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Continue even if notification fails
  }

  return updatedIssue;
};

// Unassign issue - Context7 pattern
export const unassignIssue = async (issueId: string, userId: string) => {
  // Check if issue exists and user has access
  const issue = await getIssueById(issueId, userId);

  // Check if issue is assigned
  if (!issue.assigneeId) {
    throw new Error('Issue is not assigned to anyone');
  }

  const previousAssigneeId = issue.assigneeId;

  // Update issue to remove assignee
  const updatedIssue = await prisma.issue.update({
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Notify the previous assignee
    await prisma.notification.create({
      data: {
        type: NotificationType.ISSUE_UPDATED,
        title: 'Issue Unassigned',
        message: `${user?.name || 'Someone'} unassigned you from: ${issue.title}`,
        actorId: userId,
        recipientId: previousAssigneeId,
        issueId,
      },
    });

    // Notify workspace members
    await notifyWorkspaceMembers(
      userId,
      issueId,
      issue.projectId,
      NotificationType.ISSUE_UPDATED,
      'Issue Unassigned',
      `${user?.name || 'Someone'} unassigned "${issue.title}"`
    );
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Continue even if notification fails
  }

  return updatedIssue;
};
