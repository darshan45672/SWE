# Koddera API

A Node.js TypeScript backend API for the Koddera application using Prisma ORM and PostgreSQL.

## 🚀 Features

- **TypeScript**: Full type safety and modern JavaScript features
- **Prisma ORM**: Type-safe database access with automatic migrations
- **PostgreSQL**: Robust relational database with Prisma Postgres
- **Express.js**: Fast, unopinionated web framework
- **CORS**: Cross-Origin Resource Sharing support
- **Environment Configuration**: Secure environment variable management

## 📊 Database Schema

The database includes the following main entities:

- **Users**: User accounts with profiles and authentication
- **Workspaces**: Team workspaces with role-based access
- **Projects**: Project management within workspaces
- **Issues**: Task/bug tracking with status, priority, and types
- **Comments**: Issue discussions and communication
- **Tags**: Flexible issue categorization
- **Chat**: Real-time messaging and communication
- **Notifications**: System notifications and alerts

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` if needed
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Configure other environment variables as needed

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

## 🚦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database (for development)
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## 🌐 API Endpoints

### Health & Info
- `GET /health` - Health check
- `GET /api/v1` - API information and endpoints
- `GET /api/v1/test-db` - Database connection test

### Planned Endpoints
- `GET|POST /api/v1/users` - User management
- `GET|POST /api/v1/workspaces` - Workspace management
- `GET|POST /api/v1/projects` - Project management
- `GET|POST|PUT|DELETE /api/v1/issues` - Issue tracking
- `GET|POST /api/v1/comments` - Issue comments
- `GET|POST /api/v1/notifications` - User notifications

## 📁 Project Structure

```
src/
├── lib/
│   └── prisma.ts          # Prisma client configuration
├── middleware/
│   └── error.ts           # Error handling middleware
├── routes/
│   └── ...                # API route handlers (to be implemented)
├── types/
│   └── api.ts             # TypeScript type definitions
└── index.ts               # Main application entry point

prisma/
└── schema.prisma          # Database schema definition
```

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Authentication (optional)
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# API
API_VERSION=v1
```

## 🗄️ Database Schema Overview

### Core Models
- **User**: User accounts and profiles
- **Workspace**: Team workspaces with members
- **Project**: Projects within workspaces
- **Issue**: Tasks, bugs, and features
- **Comment**: Issue discussions
- **Tag**: Issue categorization
- **Message**: Chat messages
- **Notification**: System notifications

### Relationships
- Users belong to multiple Workspaces (many-to-many with roles)
- Workspaces contain multiple Projects
- Projects contain multiple Issues
- Issues can have multiple Comments and Tags
- Users can receive multiple Notifications

## 🚀 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The API will be available at:
   - Server: `http://localhost:3001`
   - Health check: `http://localhost:3001/health`
   - API info: `http://localhost:3001/api/v1`

3. Open Prisma Studio to view/edit data:
   ```bash
   npm run db:studio
   ```

## 🔍 Development Notes

- The Prisma client is automatically generated from the schema
- Database migrations are handled through Prisma Migrate
- Error handling is centralized through middleware
- TypeScript provides full type safety across the application
- CORS is configured for frontend integration

## 📚 Next Steps

1. Implement authentication and authorization
2. Add API route handlers for all entities
3. Implement real-time features with Socket.io
4. Add comprehensive testing
5. Implement rate limiting and security middleware
6. Add API documentation with Swagger/OpenAPI