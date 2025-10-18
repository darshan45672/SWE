"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("./lib/prisma"));
const routes_1 = __importDefault(require("./auth/routes"));
const workspace_1 = __importDefault(require("./routes/workspace"));
const project_1 = __importDefault(require("./routes/project"));
const issue_1 = __importDefault(require("./routes/issue"));
const notification_1 = __importDefault(require("./routes/notification"));
const twoFactor_1 = __importDefault(require("./routes/twoFactor"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Auth routes
app.use('/api/v1/auth', routes_1.default);
// Workspace routes - Context7 pattern with authentication
app.use('/api/v1/workspaces', workspace_1.default);
// Project routes - Context7 pattern with authentication
app.use('/api/v1/projects', project_1.default);
// Issue routes - Context7 pattern with authentication (Simplified - no boards)
app.use('/api/v1/issues', issue_1.default);
// Notification routes - Context7 pattern with authentication
app.use('/api/v1/notifications', notification_1.default);
// 2FA routes - Context7 pattern with authentication
app.use('/api/v1/2fa', twoFactor_1.default);
// API routes
app.get('/api/v1', (req, res) => {
    res.json({
        message: 'SWE Project Management API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            workspaces: '/api/v1/workspaces',
            projects: '/api/v1/projects',
            issues: '/api/v1/issues'
        }
    });
});
// Example Prisma route to test database connection
app.get('/api/v1/test-db', async (req, res) => {
    try {
        // Test the database connection
        await prisma_1.default.$connect();
        res.json({
            status: 'Database connected successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            error: 'Database connection failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map