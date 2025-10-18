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
exports.deleteIssue = exports.updateIssue = exports.createIssue = exports.getIssuesByProjectId = exports.getIssueById = void 0;
const express_validator_1 = require("express-validator");
const issueService = __importStar(require("../services/issue"));
// Get issue by ID - Context7 pattern
const getIssueById = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
    }
    catch (error) {
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
exports.getIssueById = getIssueById;
// Get issues by project ID - Context7 pattern
const getIssuesByProjectId = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
    }
    catch (error) {
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
exports.getIssuesByProjectId = getIssuesByProjectId;
// Create issue - Context7 pattern
const createIssue = async (req, res) => {
    try {
        console.log('=== CREATE ISSUE REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User ID:', req.user?.userId);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, status, priority, type, projectId, dueDate, tags } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            console.log('User not authenticated');
            return res.status(401).json({ message: 'User not authenticated' });
        }
        console.log('Creating issue with data:', { title, description, status, priority, type, projectId, dueDate, tags, userId });
        const issue = await issueService.createIssue({ title, description, status, priority, type, projectId, dueDate, tags }, userId);
        console.log('Issue created successfully:', issue);
        return res.status(201).json({
            success: true,
            message: 'Issue created successfully',
            data: issue,
        });
    }
    catch (error) {
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
exports.createIssue = createIssue;
// Update issue - Context7 pattern
const updateIssue = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { title, description, status, priority, type, dueDate, tags } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const issue = await issueService.updateIssue(id, { title, description, status, priority, type, dueDate, tags }, userId);
        return res.json({
            success: true,
            message: 'Issue updated successfully',
            data: issue,
        });
    }
    catch (error) {
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
exports.updateIssue = updateIssue;
// Delete issue - Context7 pattern
const deleteIssue = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
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
    }
    catch (error) {
        console.error('Delete issue error:', error);
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
exports.deleteIssue = deleteIssue;
//# sourceMappingURL=issue.js.map