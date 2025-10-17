"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController = __importStar(require("../controllers/project"));
const projectValidators = __importStar(require("../validators/project"));
const middleware_1 = require("../validators/middleware");
const middleware_2 = require("../auth/middleware");
const router = (0, express_1.Router)();
// All project routes require authentication - Context7 security pattern
router.use(middleware_2.requireAuth);
/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private (workspace members)
 */
router.post('/', projectValidators.createProjectValidation, middleware_1.handleValidationErrors, projectController.createProject);
/**
 * @route   GET /api/projects/workspace/:workspaceId
 * @desc    Get all projects for a workspace
 * @access  Private (workspace members only)
 * @note    Must come before /:id route to avoid matching 'workspace' as an ID
 */
router.get('/workspace/:workspaceId', projectValidators.getProjectsByWorkspaceValidation, middleware_1.handleValidationErrors, projectController.getProjectsByWorkspace);
/**
 * @route   GET /api/projects/:id
 * @desc    Get a specific project by ID
 * @access  Private (workspace members only)
 */
router.get('/:id', projectValidators.getProjectValidation, middleware_1.handleValidationErrors, projectController.getProjectById);
/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (workspace members only)
 */
router.put('/:id', projectValidators.updateProjectValidation, middleware_1.handleValidationErrors, projectController.updateProject);
/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private (workspace owners and admins only)
 */
router.delete('/:id', projectValidators.deleteProjectValidation, middleware_1.handleValidationErrors, projectController.deleteProject);
/**
 * @route   PUT /api/projects/:id/set-latest
 * @desc    Set project as latest choice
 * @access  Private (workspace members only)
 */
router.put('/:id/set-latest', projectController.setProjectAsLatest);
/**
 * @route   PUT /api/projects/:id/toggle-active
 * @desc    Toggle project active status
 * @access  Private (workspace owners and admins only)
 */
router.put('/:id/toggle-active', projectController.toggleProjectActive);
exports.default = router;
//# sourceMappingURL=project.js.map