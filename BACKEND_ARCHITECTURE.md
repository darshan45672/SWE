# Backend Microservices Architecture - ProjectManager

## 🏗️ Architecture Overview

This document outlines a complete MERN stack backend with microservices architecture, following industry best practices and design patterns.

```
┌──────────────────────────────────────────────────────────────────┐
│                         API Gateway (Port 4000)                   │
│  - Request routing                                                │
│  - Rate limiting                                                  │
│  - Authentication middleware                                      │
│  - Request/Response logging                                       │
│  - Load balancing                                                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼──────┐     ┌───────▼──────┐     ┌───────▼──────┐
│ Auth Service │     │Project Service│    │ Issue Service│
│  Port: 4001  │     │  Port: 4002  │     │  Port: 4003  │
│              │     │               │     │              │
│ - Login      │     │ - CRUD        │     │ - CRUD       │
│ - Register   │     │ - Members     │     │ - Status     │
│ - JWT        │     │ - Permissions │     │ - Assignment │
│ - 2FA        │     │ - Boards      │     │ - Comments   │
│ - Sessions   │     │               │     │ - Files      │
└──────┬───────┘     └───────┬───────┘     └───────┬──────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Message Bus   │
                    │  (RabbitMQ)     │
                    │                 │
                    │ - Event pub/sub │
                    │ - Async tasks   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐    ┌───────▼──────┐    ┌───────▼──────┐
│Notification  │    │  User Service│    │   Scheduler  │
│   Service    │    │  Port: 4004  │    │   Service    │
│  Port: 4005  │    │              │    │  Port: 4006  │
│              │    │ - Profile    │    │              │
│ - Email      │    │ - Settings   │    │ - Cron jobs  │
│ - Push       │    │ - Preferences│    │ - Reminders  │
│ - WebSocket  │    │ - Avatar     │    │ - Reports    │
└──────────────┘    └──────────────┘    └──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                      Shared Infrastructure                        │
├──────────────────────────────────────────────────────────────────┤
│  MongoDB       │  Redis Cache  │  File Storage  │  Monitoring   │
│  (Primary DB)  │  (Sessions)   │  (S3/Local)    │  (Prometheus) │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
backend/
├── package.json                    # Root package.json for monorepo
├── pnpm-workspace.yaml            # pnpm workspace configuration
├── docker-compose.yml             # Docker services
├── .env.example                   # Environment variables template
├── README.md                      # Backend documentation
│
├── packages/                      # Shared packages
│   ├── common/                    # Shared utilities
│   │   ├── package.json
│   │   └── src/
│   │       ├── errors/            # Custom error classes
│   │       ├── middleware/        # Shared middleware
│   │       ├── utils/             # Utility functions
│   │       ├── validators/        # Validation schemas
│   │       └── constants/         # Constants
│   │
│   ├── prisma-client/            # Shared Prisma client
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/
│   │   └── src/
│   │       └── index.ts
│   │
│   └── types/                    # Shared TypeScript types
│       ├── package.json
│       └── src/
│           ├── user.types.ts
│           ├── project.types.ts
│           ├── issue.types.ts
│           └── index.ts
│
├── services/                     # Microservices
│   ├── api-gateway/             # API Gateway (Port 4000)
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts
│   │       ├── routes/
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts
│   │       │   ├── rateLimit.middleware.ts
│   │       │   └── logger.middleware.ts
│   │       ├── proxy/
│   │       └── config/
│   │
│   ├── auth-service/            # Authentication (Port 4001)
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts
│   │       ├── controllers/
│   │       │   └── auth.controller.ts
│   │       ├── services/
│   │       │   ├── auth.service.ts
│   │       │   ├── jwt.service.ts
│   │       │   ├── password.service.ts
│   │       │   └── twoFactor.service.ts
│   │       ├── repositories/
│   │       │   └── user.repository.ts
│   │       ├── routes/
│   │       │   └── auth.routes.ts
│   │       ├── middleware/
│   │       └── config/
│   │
│   ├── project-service/         # Project Management (Port 4002)
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts
│   │       ├── controllers/
│   │       │   └── project.controller.ts
│   │       ├── services/
│   │       │   ├── project.service.ts
│   │       │   └── member.service.ts
│   │       ├── repositories/
│   │       │   └── project.repository.ts
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── config/
│   │
│   ├── issue-service/           # Issue Management (Port 4003)
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts
│   │       ├── controllers/
│   │       │   ├── issue.controller.ts
│   │       │   └── comment.controller.ts
│   │       ├── services/
│   │       │   ├── issue.service.ts
│   │       │   └── comment.service.ts
│   │       ├── repositories/
│   │       │   ├── issue.repository.ts
│   │       │   └── comment.repository.ts
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── config/
│   │
│   ├── user-service/            # User Management (Port 4004)
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts
│   │       ├── controllers/
│   │       │   └── user.controller.ts
│   │       ├── services/
│   │       │   ├── user.service.ts
│   │       │   └── profile.service.ts
│   │       ├── repositories/
│   │       │   └── user.repository.ts
│   │       ├── routes/
│   │       ├── middleware/
│   │       └── config/
│   │
│   ├── notification-service/    # Notifications (Port 4005)
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── .env
│   │   └── src/
│   │       ├── index.ts
│   │       ├── controllers/
│   │       │   └── notification.controller.ts
│   │       ├── services/
│   │       │   ├── notification.service.ts
│   │       │   ├── email.service.ts
│   │       │   ├── push.service.ts
│   │       │   └── websocket.service.ts
│   │       ├── repositories/
│   │       │   └── notification.repository.ts
│   │       ├── routes/
│   │       ├── middleware/
│   │       ├── templates/        # Email templates
│   │       └── config/
│   │
│   └── scheduler-service/       # Background Jobs (Port 4006)
│       ├── package.json
│       ├── Dockerfile
│       ├── .env
│       └── src/
│           ├── index.ts
│           ├── jobs/
│           │   ├── reminder.job.ts
│           │   ├── cleanup.job.ts
│           │   └── report.job.ts
│           ├── services/
│           └── config/
│
└── infrastructure/              # Infrastructure as Code
    ├── kubernetes/              # K8s manifests
    ├── terraform/               # Terraform configs
    └── monitoring/              # Prometheus, Grafana configs
```

---

## 🗄️ Database Schema (Prisma)

### Prisma Schema (MongoDB)

```prisma
// packages/prisma-client/prisma/schema.prisma

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated"
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  email             String    @unique
  password          String
  name              String?
  avatar            String?
  bio               String?
  phone             String?
  location          String?
  website           String?
  company           String?
  jobTitle          String?
  timezone          String    @default("UTC")
  language          String    @default("en")
  
  // Authentication
  emailVerified     Boolean   @default(false)
  emailVerifyToken  String?
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastLoginAt       DateTime?
  
  // Relations
  projects          ProjectMember[]
  issues            Issue[]
  assignedIssues    Issue[]         @relation("AssignedIssues")
  comments          Comment[]
  notifications     Notification[]
  sessions          Session[]
  activityLogs      ActivityLog[]
  
  @@map("users")
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  refreshToken String   @unique
  deviceInfo   DeviceInfo?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

type DeviceInfo {
  userAgent String
  browser   String
  os        String
  device    String
}

// ============================================
// PROJECTS
// ============================================

model Project {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  key         String    @unique // e.g., "PROJ-123"
  description String?
  avatar      String?
  
  // Settings
  isPublic    Boolean   @default(false)
  archived    Boolean   @default(false)
  
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  members     ProjectMember[]
  boards      Board[]
  issues      Issue[]
  
  @@map("projects")
}

model ProjectMember {
  id        String      @id @default(auto()) @map("_id") @db.ObjectId
  projectId String      @db.ObjectId
  userId    String      @db.ObjectId
  role      ProjectRole @default(MEMBER)
  joinedAt  DateTime    @default(now())
  
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([projectId, userId])
  @@map("project_members")
}

enum ProjectRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ============================================
// BOARDS & ISSUES
// ============================================

model Board {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId String   @db.ObjectId
  name      String
  columns   Column[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@map("boards")
}

type Column {
  id     String
  title  String
  order  Int
  issues String[] @db.ObjectId // Issue IDs
}

model Issue {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String       @db.ObjectId
  key         String       @unique // e.g., "PROJ-123"
  title       String
  description String?
  
  // Issue details
  type        IssueType    @default(TASK)
  status      IssueStatus  @default(TODO)
  priority    IssuePriority @default(MEDIUM)
  
  // Assignment
  reporterId  String       @db.ObjectId
  assigneeId  String?      @db.ObjectId
  
  // Dates
  dueDate     DateTime?
  startDate   DateTime?
  completedAt DateTime?
  
  // Metadata
  tags        String[]
  attachments Attachment[]
  
  // Timestamps
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  // Relations
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  reporter    User         @relation(fields: [reporterId], references: [id])
  assignee    User?        @relation("AssignedIssues", fields: [assigneeId], references: [id])
  comments    Comment[]
  history     IssueHistory[]
  
  @@map("issues")
}

enum IssueType {
  BUG
  FEATURE
  TASK
  IMPROVEMENT
}

enum IssueStatus {
  TODO
  IN_PROGRESS
  DONE
}

enum IssuePriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

type Attachment {
  id       String
  filename String
  url      String
  size     Int
  mimeType String
  uploadedAt DateTime
}

model Comment {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  issueId   String   @db.ObjectId
  userId    String   @db.ObjectId
  content   String
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  issue Issue @relation(fields: [issueId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])
  
  @@map("comments")
}

model IssueHistory {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  issueId   String   @db.ObjectId
  field     String   // e.g., "status", "assignee", "priority"
  oldValue  String?
  newValue  String?
  changedBy String   @db.ObjectId
  changedAt DateTime @default(now())
  
  issue Issue @relation(fields: [issueId], references: [id], onDelete: Cascade)
  
  @@map("issue_history")
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id        String           @id @default(auto()) @map("_id") @db.ObjectId
  userId    String           @db.ObjectId
  type      NotificationType
  title     String
  message   String
  
  // Metadata
  issueId   String?          @db.ObjectId
  projectId String?          @db.ObjectId
  metadata  Json?
  
  // Status
  read      Boolean          @default(false)
  readAt    DateTime?
  
  createdAt DateTime         @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("notifications")
}

enum NotificationType {
  ISSUE_ASSIGNED
  ISSUE_CREATED
  ISSUE_UPDATED
  ISSUE_COMMENT
  PROJECT_INVITED
  MENTION
}

// ============================================
// ACTIVITY LOGS
// ============================================

model ActivityLog {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  userId     String   @db.ObjectId
  action     String   // e.g., "created_issue", "updated_project"
  entityType String   // e.g., "issue", "project"
  entityId   String   @db.ObjectId
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  
  createdAt  DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("activity_logs")
}
```

---

## 🎯 Design Patterns Used

### 1. **Repository Pattern**
Separates data access logic from business logic.

```typescript
// services/auth-service/src/repositories/user.repository.ts
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
  
  async create(data: CreateUserDTO): Promise<User> {
    return prisma.user.create({ data });
  }
  
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }
}
```

### 2. **Service Layer Pattern**
Business logic separated from controllers.

```typescript
// services/auth-service/src/services/auth.service.ts
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JWTService,
    private passwordService: PasswordService
  ) {}
  
  async register(dto: RegisterDTO): Promise<AuthResponse> {
    // Business logic here
  }
  
  async login(dto: LoginDTO): Promise<AuthResponse> {
    // Business logic here
  }
}
```

### 3. **Dependency Injection**
Loose coupling between components.

```typescript
// Using tsyringe or InversifyJS
@injectable()
export class AuthController {
  constructor(
    @inject(AuthService) private authService: AuthService
  ) {}
}
```

### 4. **Factory Pattern**
Creating complex objects.

```typescript
export class ServiceFactory {
  static createAuthService(): AuthService {
    const userRepo = new UserRepository();
    const jwtService = new JWTService();
    const passwordService = new PasswordService();
    return new AuthService(userRepo, jwtService, passwordService);
  }
}
```

### 5. **Strategy Pattern**
For different authentication strategies (JWT, OAuth, etc.).

```typescript
interface AuthStrategy {
  authenticate(credentials: any): Promise<User>;
}

class JWTAuthStrategy implements AuthStrategy {
  async authenticate(token: string): Promise<User> {
    // JWT verification logic
  }
}

class OAuthStrategy implements AuthStrategy {
  async authenticate(code: string): Promise<User> {
    // OAuth flow logic
  }
}
```

### 6. **Observer Pattern**
For event-driven communication between services.

```typescript
// Event emitter for service communication
eventEmitter.on('issue.created', async (issueData) => {
  await notificationService.sendNotification({
    type: 'ISSUE_CREATED',
    data: issueData
  });
});
```

### 7. **Middleware Pattern**
Express middleware for cross-cutting concerns.

```typescript
// Authentication middleware
export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const payload = await jwtService.verify(token);
    req.user = payload;
    next();
  } catch (error) {
    next(new UnauthorizedError());
  }
};
```

---

## 🔐 Security Best Practices

### 1. **Authentication & Authorization**
- JWT with refresh tokens
- Password hashing with bcrypt (cost factor: 12)
- Rate limiting on auth endpoints
- CSRF protection
- HTTP-only cookies for refresh tokens

### 2. **Input Validation**
- Zod for schema validation
- Sanitize all inputs
- Prevent NoSQL injection

### 3. **Data Protection**
- Encryption at rest (MongoDB encryption)
- TLS/SSL for data in transit
- Sensitive data masking in logs

### 4. **API Security**
- CORS configuration
- Helmet.js for security headers
- Rate limiting per endpoint
- API key validation

---

## 📊 Monitoring & Observability

### 1. **Logging**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. **Metrics**
- Prometheus for metrics collection
- Grafana for visualization
- Custom business metrics

### 3. **Tracing**
- OpenTelemetry for distributed tracing
- Request ID propagation across services

### 4. **Health Checks**
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});
```

---

## 🚀 API Endpoints

### Auth Service (4001)
```
POST   /auth/register          # Register new user
POST   /auth/login             # Login
POST   /auth/logout            # Logout
POST   /auth/refresh           # Refresh token
POST   /auth/verify-email      # Verify email
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password
POST   /auth/2fa/enable        # Enable 2FA
POST   /auth/2fa/verify        # Verify 2FA code
```

### Project Service (4002)
```
GET    /projects               # List projects
POST   /projects               # Create project
GET    /projects/:id           # Get project
PUT    /projects/:id           # Update project
DELETE /projects/:id           # Delete project
GET    /projects/:id/members   # List members
POST   /projects/:id/members   # Add member
DELETE /projects/:id/members/:userId # Remove member
```

### Issue Service (4003)
```
GET    /issues                 # List issues (with filters)
POST   /issues                 # Create issue
GET    /issues/:id             # Get issue
PUT    /issues/:id             # Update issue
DELETE /issues/:id             # Delete issue
GET    /issues/:id/comments    # List comments
POST   /issues/:id/comments    # Add comment
PUT    /issues/:id/status      # Update status
POST   /issues/:id/assign      # Assign issue
```

### User Service (4004)
```
GET    /users/:id              # Get user profile
PUT    /users/:id              # Update profile
GET    /users/:id/activity     # Get activity log
PUT    /users/:id/avatar       # Upload avatar
GET    /users/:id/settings     # Get settings
PUT    /users/:id/settings     # Update settings
```

### Notification Service (4005)
```
GET    /notifications          # List notifications
PUT    /notifications/:id/read # Mark as read
DELETE /notifications/:id      # Delete notification
WS     /notifications/stream   # WebSocket for real-time
```

---

## 🐳 Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password

volumes:
  mongodb_data:
  redis_data:
```

---

## 🧪 Testing Strategy

### 1. **Unit Tests**
- Jest for testing
- 80%+ code coverage
- Test repositories, services, utilities

### 2. **Integration Tests**
- Test API endpoints
- Test database operations
- Test service communication

### 3. **E2E Tests**
- Test complete user flows
- Use supertest for API testing

---

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test
      - name: Run lint
        run: pnpm lint
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploy scripts here"
```

---

## 📝 Next Steps

1. ✅ Review architecture document
2. Set up backend folder structure
3. Initialize pnpm workspace
4. Set up Prisma with MongoDB
5. Implement Auth Service (pilot)
6. Set up API Gateway
7. Implement remaining services
8. Add tests and documentation
9. Set up CI/CD
10. Deploy to production

---

**Ready to start implementation?** 🚀
