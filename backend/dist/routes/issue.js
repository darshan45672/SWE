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
const issueController = __importStar(require("../controllers/issue"));
const issueValidation = __importStar(require("../validators/issue"));
const middleware_1 = require("../auth/middleware");
const router = (0, express_1.Router)();
// All issue routes require authentication
router.use(middleware_1.requireAuth);
// GET /api/issues/project/:projectId - Get all issues for a project
router.get('/project/:projectId', issueValidation.getIssuesByProjectValidation, issueController.getIssuesByProjectId);
// GET /api/issues/:id - Get issue by ID
router.get('/:id', issueValidation.getIssueValidation, issueController.getIssueById);
// POST /api/issues - Create new issue
router.post('/', issueValidation.createIssueValidation, issueController.createIssue);
// PUT /api/issues/:id - Update issue
router.put('/:id', issueValidation.updateIssueValidation, issueController.updateIssue);
// DELETE /api/issues/:id - Delete issue
router.delete('/:id', issueValidation.deleteIssueValidation, issueController.deleteIssue);
exports.default = router;
//# sourceMappingURL=issue.js.map