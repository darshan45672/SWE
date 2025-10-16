import prisma from '../lib/prisma';
import { Priority, IssueStatus, IssueType } from '@prisma/client';

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
  const { title, description, status, priority, type, projectId, dueDate, tags } = issueData;

  // Check project access
  await checkProjectAccess(projectId, userId);

  // Create issue with tags
  const issue = await prisma.issue.create({
    data: {
      title,
      description: description || '',
      status,
      priority,
      type,
      projectId,
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
    },
  });

  return issue;
};

// Update issue - Context7 pattern (Simplified)
export const updateIssue = async (
  issueId: string,
  issueData: UpdateIssueData,
  userId: string
) => {
  // Check if issue exists and user has access
  await getIssueById(issueId, userId);

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
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  return updatedIssue;
};

// Delete issue - Context7 pattern
export const deleteIssue = async (issueId: string, userId: string) => {
  // Check if issue exists and user has access
  await getIssueById(issueId, userId);

  // Delete issue
  await prisma.issue.delete({
    where: { id: issueId },
  });

  return { message: 'Issue deleted successfully' };
};
