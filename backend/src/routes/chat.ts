/**
 * Chat Routes
 * REST API routes for chat message management
 */

import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import {
  getProjectMessages,
  deleteMessage,
  getMessageCount,
} from '../controllers/chat';

const router = Router();

/**
 * @route   GET /api/v1/chat/projects/:projectId/messages
 * @desc    Get messages for a specific project
 * @access  Private (workspace members only)
 * @query   limit - Number of messages to fetch (default: 50, max: 100)
 * @query   before - Get messages before this timestamp (ISO string)
 */
router.get('/projects/:projectId/messages', requireAuth, getProjectMessages as any);

/**
 * @route   GET /api/v1/chat/projects/:projectId/count
 * @desc    Get message count for a project
 * @access  Private (workspace members only)
 */
router.get('/projects/:projectId/count', requireAuth, getMessageCount as any);

/**
 * @route   DELETE /api/v1/chat/messages/:messageId
 * @desc    Delete a message (only sender or admins)
 * @access  Private
 */
router.delete('/messages/:messageId', requireAuth, deleteMessage as any);

export default router;
