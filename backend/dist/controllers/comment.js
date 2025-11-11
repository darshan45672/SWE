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
exports.deleteComment = exports.updateComment = exports.getCommentsByIssueId = exports.createComment = void 0;
const commentService = __importStar(require("../services/comment"));
// Create comment - Context7 pattern
const createComment = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { content, issueId } = req.body;
        if (!content || !issueId) {
            return res.status(400).json({ error: 'Content and issueId are required' });
        }
        const comment = await commentService.createComment({ content, issueId }, userId);
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
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
exports.createComment = createComment;
// Get comments by issue ID - Context7 pattern
const getCommentsByIssueId = async (req, res) => {
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
    }
    catch (error) {
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
exports.getCommentsByIssueId = getCommentsByIssueId;
// Update comment - Context7 pattern
const updateComment = async (req, res) => {
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
        const comment = await commentService.updateComment(commentId, { content }, userId);
        res.status(200).json({ success: true, data: comment });
    }
    catch (error) {
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
exports.updateComment = updateComment;
// Delete comment - Context7 pattern
const deleteComment = async (req, res) => {
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
    }
    catch (error) {
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
exports.deleteComment = deleteComment;
//# sourceMappingURL=comment.js.map