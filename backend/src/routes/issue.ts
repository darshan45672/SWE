import { Router } from 'express';
import * as issueController from '../controllers/issue';
import * as issueValidation from '../validators/issue';
import { requireAuth } from '../auth/middleware';

const router = Router();

// All issue routes require authentication
router.use(requireAuth);

// GET /api/issues/project/:projectId - Get all issues for a project
router.get(
  '/project/:projectId',
  issueValidation.getIssuesByProjectValidation,
  issueController.getIssuesByProjectId
);

// GET /api/issues/:id - Get issue by ID
router.get(
  '/:id',
  issueValidation.getIssueValidation,
  issueController.getIssueById
);

// POST /api/issues - Create new issue
router.post(
  '/',
  issueValidation.createIssueValidation,
  issueController.createIssue
);

// PUT /api/issues/:id - Update issue
router.put(
  '/:id',
  issueValidation.updateIssueValidation,
  issueController.updateIssue
);

// DELETE /api/issues/:id - Delete issue
router.delete(
  '/:id',
  issueValidation.deleteIssueValidation,
  issueController.deleteIssue
);

// POST /api/issues/:id/assign - Assign issue to workspace member
router.post(
  '/:id/assign',
  issueValidation.getIssueValidation,
  issueController.assignIssue
);

// POST /api/issues/:id/unassign - Unassign issue
router.post(
  '/:id/unassign',
  issueValidation.getIssueValidation,
  issueController.unassignIssue
);

export default router;
