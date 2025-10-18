import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as issueService from '../services/issue';

// Get issue by ID - Context7 pattern
export const getIssueById = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issue = await issueService.getIssueById(id, userId);
    return res.json(issue);
  } catch (error) {
    console.error('Get issue error:', error);
    if (error instanceof Error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get issues by project ID - Context7 pattern
export const getIssuesByProjectId = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issues = await issueService.getIssuesByProjectId(projectId, userId);
    return res.json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error('Get issues by project error:', error);
    if (error instanceof Error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create issue - Context7 pattern
export const createIssue = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE ISSUE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user?.userId);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority, type, projectId, dueDate, tags, assigneeId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      console.log('User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Creating issue with data:', { title, description, status, priority, type, projectId, dueDate, tags, assigneeId, userId });

    const issue = await issueService.createIssue(
      { title, description, status, priority, type, projectId, dueDate, tags, assigneeId },
      userId
    );

    console.log('Issue created successfully:', issue);
    return res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue,
    });
  } catch (error) {
    console.error('Create issue error:', error);
    if (error instanceof Error) {
      if (error.message === 'Project not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'Assignee not found') {
        return res.status(404).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update issue - Context7 pattern
export const updateIssue = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status, priority, type, dueDate, tags, assigneeId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issue = await issueService.updateIssue(
      id,
      { title, description, status, priority, type, dueDate, tags, assigneeId },
      userId
    );

    return res.json({
      success: true,
      message: 'Issue updated successfully',
      data: issue,
    });
  } catch (error) {
    console.error('Update issue error:', error);
    if (error instanceof Error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'Assignee not found') {
        return res.status(404).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete issue - Context7 pattern
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const result = await issueService.deleteIssue(id, userId);
    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('❌ Delete issue controller error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message === 'Issue not found') {
        return res.status(404).json({ 
          success: false,
          message: error.message 
        });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ 
          success: false,
          message: error.message 
        });
      }
      if (error.message.includes('Failed to delete issue')) {
        return res.status(500).json({ 
          success: false,
          message: error.message 
        });
      }
    }
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

// Assign issue to workspace member - Context7 pattern
export const assignIssue = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { assigneeId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!assigneeId) {
      return res.status(400).json({ message: 'Assignee ID is required' });
    }

    const updatedIssue = await issueService.assignIssue(id, assigneeId, userId);
    return res.json({
      success: true,
      message: 'Issue assigned successfully',
      data: updatedIssue,
    });
  } catch (error) {
    console.error('Assign issue error:', error);
    if (error instanceof Error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'Assignee is not a member of this workspace') {
        return res.status(400).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Unassign issue - Context7 pattern
export const unassignIssue = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const updatedIssue = await issueService.unassignIssue(id, userId);
    return res.json({
      success: true,
      message: 'Issue unassigned successfully',
      data: updatedIssue,
    });
  } catch (error) {
    console.error('Unassign issue error:', error);
    if (error instanceof Error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'Issue is not assigned to anyone') {
        return res.status(400).json({ message: error.message });
      }
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
