"use strict";
/**
 * Chat Routes
 * REST API routes for chat message management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../auth/middleware");
const chat_1 = require("../controllers/chat");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/v1/chat/projects/:projectId/messages
 * @desc    Get messages for a specific project
 * @access  Private (workspace members only)
 * @query   limit - Number of messages to fetch (default: 50, max: 100)
 * @query   before - Get messages before this timestamp (ISO string)
 */
router.get('/projects/:projectId/messages', middleware_1.requireAuth, chat_1.getProjectMessages);
/**
 * @route   GET /api/v1/chat/projects/:projectId/count
 * @desc    Get message count for a project
 * @access  Private (workspace members only)
 */
router.get('/projects/:projectId/count', middleware_1.requireAuth, chat_1.getMessageCount);
/**
 * @route   DELETE /api/v1/chat/messages/:messageId
 * @desc    Delete a message (only sender or admins)
 * @access  Private
 */
router.delete('/messages/:messageId', middleware_1.requireAuth, chat_1.deleteMessage);
exports.default = router;
//# sourceMappingURL=chat.js.map