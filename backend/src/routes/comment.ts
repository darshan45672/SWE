import express from 'express';
import { requireAuth } from '../auth/middleware';
import * as commentController from '../controllers/comment';

const router = express.Router();

// All routes require authentication - Context7 pattern
router.use(requireAuth);

// Create comment
router.post('/', commentController.createComment);

// Get comments by issue ID
router.get('/issue/:issueId', commentController.getCommentsByIssueId);

// Update comment
router.put('/:commentId', commentController.updateComment);

// Delete comment
router.delete('/:commentId', commentController.deleteComment);

export default router;
