import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import prisma from './lib/prisma'
import authRoutes from './auth/routes'
import workspaceRoutes from './routes/workspace'
import projectRoutes from './routes/project'
import issueRoutes from './routes/issue'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Auth routes
app.use('/api/v1/auth', authRoutes)

// Workspace routes - Context7 pattern with authentication
app.use('/api/v1/workspaces', workspaceRoutes)

// Project routes - Context7 pattern with authentication
app.use('/api/v1/projects', projectRoutes)

// Issue routes - Context7 pattern with authentication (Simplified - no boards)
app.use('/api/v1/issues', issueRoutes)

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
  })
})

// Example Prisma route to test database connection
app.get('/api/v1/test-db', async (req, res) => {
  try {
    // Test the database connection
    await prisma.$connect()
    res.json({ 
      status: 'Database connected successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  })
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully')
  await prisma.$disconnect()
  process.exit(0)
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api/v1`)
  console.log(`🏥 Health check at http://localhost:${PORT}/health`)
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app