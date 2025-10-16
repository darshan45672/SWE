# Authentication Service

A comprehensive authentication microservice built with TypeScript, Express, JWT, and Prisma.

## Features

- ✅ User registration with email verification
- ✅ Secure login with JWT access & refresh tokens
- ✅ Two-Factor Authentication (2FA) with TOTP
- ✅ Password hashing with bcrypt
- ✅ Token refresh mechanism
- ✅ Session management
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ CORS configuration

## Architecture

The service follows clean architecture principles with clear separation of concerns:

```
src/
├── database/       # Data Access Layer (Repository Pattern)
│   ├── user.repository.ts
│   └── session.repository.ts
├── auth/          # Business Logic Layer (Service Pattern)
│   ├── password.service.ts
│   ├── jwt.service.ts
│   ├── twoFactor.service.ts
│   └── auth.service.ts
├── api/           # HTTP Layer (Controller Pattern)
│   ├── validators.ts
│   ├── auth.middleware.ts
│   ├── auth.controller.ts
│   └── auth.routes.ts
└── index.ts       # Application entry point
```

## API Endpoints

### Public Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (invalidate refresh token)
- `POST /auth/verify-email` - Verify email address

### Protected Endpoints (require authentication)

- `POST /auth/2fa/enable` - Enable 2FA for user
- `POST /auth/2fa/verify` - Verify and activate 2FA
- `POST /auth/2fa/disable` - Disable 2FA

### Health Check

- `GET /health` - Service health status

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=4001
NODE_ENV=development

JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

DATABASE_URL="postgresql://user:password@localhost:5432/projectmanager"

CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run database migrations:**
   ```bash
   cd ../../packages/prisma-client
   npx prisma migrate dev
   ```

4. **Start the service:**
   ```bash
   # Development mode with hot reload
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Enable 2FA

```bash
curl -X POST http://localhost:4001/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security Features

- **Password Hashing:** bcrypt with salt rounds 12
- **JWT Tokens:** Separate access (15m) and refresh tokens (7d)
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Security Headers:** Helmet middleware
- **Input Validation:** Zod schemas for all endpoints
- **CORS:** Configurable origin restrictions
- **2FA:** TOTP-based two-factor authentication

## Design Patterns

- **Repository Pattern:** Data access abstraction
- **Service Layer Pattern:** Business logic separation
- **Controller Pattern:** HTTP request handling
- **Dependency Injection:** Loose coupling between layers
- **Factory Pattern:** Route and service creation

## Dependencies

- **express:** Web framework
- **jsonwebtoken:** JWT implementation
- **bcryptjs:** Password hashing
- **zod:** Schema validation
- **speakeasy:** 2FA TOTP
- **helmet:** Security headers
- **cors:** Cross-origin resource sharing
- **morgan:** HTTP request logging
- **express-rate-limit:** Rate limiting

## TypeScript

The service is fully typed with TypeScript, using shared types from `@projectmanager/types` and common utilities from `@projectmanager/common`.

## License

MIT
