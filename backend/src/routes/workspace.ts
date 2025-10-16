import { Router } from 'express';
import * as workspaceController from '../controllers/workspace';
import * as workspaceValidators from '../validators/workspace';
import { handleValidationErrors } from '../validators/middleware';
import { requireAuth } from '../auth/middleware';

const router = Router();

// All workspace routes require authentication - Context7 security pattern
router.use(requireAuth);

/**
 * @route   POST /api/workspaces
 * @desc    Create a new workspace
 * @access  Private (authenticated users)
 */
router.post(
  '/',
  workspaceValidators.createWorkspaceValidation,
  handleValidationErrors,
  workspaceController.createWorkspace
);

/**
 * @route   GET /api/workspaces
 * @desc    Get all workspaces for the authenticated user
 * @access  Private (authenticated users)
 */
router.get(
  '/',
  workspaceController.getWorkspaces
);

/**
 * @route   GET /api/workspaces/:id
 * @desc    Get a specific workspace by ID
 * @access  Private (workspace members only)
 */
router.get(
  '/:id',
  workspaceValidators.getWorkspaceValidation,
  handleValidationErrors,
  workspaceController.getWorkspaceById
);

/**
 * @route   PUT /api/workspaces/:id
 * @desc    Update a workspace
 * @access  Private (workspace owners and admins only)
 */
router.put(
  '/:id',
  workspaceValidators.updateWorkspaceValidation,
  handleValidationErrors,
  workspaceController.updateWorkspace
);

/**
 * @route   DELETE /api/workspaces/:id
 * @desc    Delete a workspace
 * @access  Private (workspace owners only)
 */
router.delete(
  '/:id',
  workspaceValidators.deleteWorkspaceValidation,
  handleValidationErrors,
  workspaceController.deleteWorkspace
);

export default router;
