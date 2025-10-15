# @projectmanager/prisma-client

Shared Prisma Client package for ProjectManager microservices with MongoDB Atlas.

## Features

- ✅ **Type-Safe Database Access** - Full TypeScript support with generated types
- ✅ **MongoDB with Prisma ORM** - Modern ORM with intuitive API
- ✅ **Connection Pooling** - Singleton pattern for optimal performance
- ✅ **Hot Reload Support** - Development-friendly with global instance preservation
- ✅ **Comprehensive Schema** - 12+ models covering all application entities
- ✅ **Sample Data** - Rich seed script with test data

## Installation

This package is designed to be used as a shared dependency in a monorepo:

```json
{
  "dependencies": {
    "@projectmanager/prisma-client": "*"
  }
}
```

## Usage

### TypeScript

```typescript
import { prisma, Prisma } from '@projectmanager/prisma-client';

// Query users with type safety
const users = await prisma.user.findMany({
  where: {
    emailVerified: true
  },
  include: {
    projects: true
  }
});

// Create an issue with type-safe input
const newIssue = await prisma.issue.create({
  data: {
    title: 'New Feature',
    description: 'Implement new feature',
    type: 'FEATURE',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: 'project_id',
    reporterId: 'user_id',
    tags: ['feature', 'backend']
  }
});
```

### JavaScript

```javascript
const { prisma } = require('@projectmanager/prisma-client');

// Works seamlessly with JavaScript too
const projects = await prisma.project.findMany();
```

## Scripts

```bash
# Generate Prisma Client after schema changes
npm run generate

# Push schema changes to MongoDB (development)
npm run db:push

# Open Prisma Studio (visual database browser)
npm run studio

# Seed the database with sample data
npm run db:seed

# Format the schema file
npm run format

# Build TypeScript files
npm run build

# Type check without emitting files
npm run typecheck
```

## Database Schema

### Core Models

- **User** - User accounts with authentication
- **Session** - User sessions with refresh tokens
- **Project** - Projects with customizable settings
- **ProjectMember** - Project membership and roles
- **Board** - Kanban boards with columns
- **Issue** - Tasks, bugs, features with full metadata
- **Comment** - Issue comments
- **IssueHistory** - Audit trail for issue changes
- **Notification** - User notifications
- **ActivityLog** - System-wide activity tracking

### Enums

- `ProjectRole`: OWNER, ADMIN, MEMBER, VIEWER
- `IssueType`: BUG, FEATURE, TASK, IMPROVEMENT
- `IssueStatus`: TODO, IN_PROGRESS, DONE
- `IssuePriority`: LOW, MEDIUM, HIGH, URGENT
- `NotificationType`: ISSUE_ASSIGNED, ISSUE_CREATED, ISSUE_UPDATED, ISSUE_COMMENT, PROJECT_INVITED, MENTION

## Environment Variables

Create a `.env` file in this package directory:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
```

## Test Data

The seed script creates:

- **3 Users** (john@example.com, jane@example.com, bob@example.com)
- **2 Projects** (E-Commerce Website, Mobile App)
- **4 Issues** with various statuses and priorities
- **4 Comments**
- **4 Notifications**
- **4 Activity Logs**

All test users share the password: `password123`

## Type Safety

The Prisma Client is fully typed, providing:

```typescript
// Auto-completion for models
prisma.user.
  // findMany, findUnique, create, update, delete...

// Type-safe where clauses
prisma.issue.findMany({
  where: {
    status: 'TODO', // Only accepts valid IssueStatus values
    priority: 'HIGH' // Only accepts valid IssuePriority values
  }
})

// Generated types for creating records
type UserCreateInput = Prisma.UserCreateInput;
type IssueUpdateInput = Prisma.IssueUpdateInput;
```

## Best Practices

### Import the Singleton Instance

```typescript
// ✅ Good - use the singleton
import { prisma } from '@projectmanager/prisma-client';

// ❌ Bad - creates multiple instances
import { PrismaClient } from '@projectmanager/prisma-client/dist/generated';
const prisma = new PrismaClient();
```

### Handle Connections Gracefully

The package automatically handles disconnection on process termination, but for long-running operations:

```typescript
import { prisma, disconnect } from '@projectmanager/prisma-client';

try {
  await prisma.user.findMany();
} finally {
  await disconnect(); // Manual disconnect if needed
}
```

### Use Transactions for Related Operations

```typescript
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({
    data: { name: 'New Project', key: 'PROJ' }
  });
  
  await tx.projectMember.create({
    data: {
      projectId: project.id,
      userId: userId,
      role: 'OWNER'
    }
  });
});
```

## Development

### Modify the Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run db:push` to sync with MongoDB
3. Run `npm run generate` to update Prisma Client
4. Run `npm run build` to compile TypeScript

### Update Seed Data

Edit `prisma/seed.ts` and run:

```bash
npm run db:seed
```

## Troubleshooting

### Connection Issues

- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify the DATABASE_URL in `.env` is correct
- Check if the database name is included in the connection string

### Type Errors

```bash
# Regenerate Prisma Client
npm run generate

# Rebuild TypeScript
npm run build
```

### Schema Drift

If your database schema differs from your Prisma schema:

```bash
# Pull the current database schema
npm run db:pull

# Or push your local schema
npm run db:push
```

## License

MIT
