import { Request, Response } from 'express';
import * as commentService from '../services/comment';

// Create comment - Context7 pattern
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content, issueId } = req.body;

    if (!content || !issueId) {
      return res.status(400).json({ error: 'Content and issueId are required' });
    }

    const comment = await commentService.createComment(
      { content, issueId },
      userId
    );

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Create comment error:', error);
    if (error instanceof Error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ success: false, message: error.message });
      }
    }
    res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
};

// Get comments by issue ID - Context7 pattern
export const getCommentsByIssueId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { issueId } = req.params;

    if (!issueId) {
      return res.status(400).json({ success: false, message: 'Issue ID is required' });
    }

    const comments = await commentService.getCommentsByIssueId(issueId, userId);

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    console.error('Get comments error:', error);
    if (error instanceof Error) {
      if (error.message === 'Issue not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ success: false, message: error.message });
      }
    }
    res.status(500).json({ success: false, message: 'Failed to get comments' });
  }
};

// Update comment - Context7 pattern
export const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
      return res.status(400).json({ success: false, message: 'Comment ID is required' });
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const comment = await commentService.updateComment(
      commentId,
      { content },
      userId
    );

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    console.error('Update comment error:', error);
    if (error instanceof Error) {
      if (error.message === 'Comment not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message === 'You can only edit your own comments') {
        return res.status(403).json({ success: false, message: error.message });
      }
    }
    res.status(500).json({ success: false, message: 'Failed to update comment' });
  }
};

// Delete comment - Context7 pattern
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ success: false, message: 'Comment ID is required' });
    }

    const result = await commentService.deleteComment(commentId, userId);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Delete comment error:', error);
    if (error instanceof Error) {
      if (error.message === 'Comment not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Access denied') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message === 'You can only delete your own comments') {
        return res.status(403).json({ success: false, message: error.message });
      }
    }
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};
