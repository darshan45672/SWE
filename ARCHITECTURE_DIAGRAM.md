# Frontend-Backend Connection Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                     http://localhost:3000                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌─────────────────────────────┐  │
│  │   Auth Pages     │         │     Protected Pages         │  │
│  ├──────────────────┤         ├─────────────────────────────┤  │
│  │ • Login          │         │ • Dashboard                 │  │
│  │ • Register       │         │ • Kanban Board              │  │
│  │ • Forgot Pass    │         │ • Profile Settings          │  │
│  └─────────┬────────┘         └──────────┬──────────────────┘  │
│            │                               │                     │
│            └───────────┬───────────────────┘                     │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │    Auth Context          │                          │
│            │  (Global State)          │                          │
│            ├──────────────────────────┤                          │
│            │ • user                   │                          │
│            │ • isAuthenticated        │                          │
│            │ • login()                │                          │
│            │ • register()             │                          │
│            │ • logout()               │                          │
│            └───────────┬──────────────┘                          │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │   Auth API Service       │                          │
│            │  (lib/api/auth.api.ts)   │                          │
│            ├──────────────────────────┤                          │
│            │ • authApi.register()     │                          │
│            │ • authApi.login()        │                          │
│            │ • authApi.logout()       │                          │
│            │ • authApi.refresh()      │                          │
│            │ • authApi.enable2FA()    │                          │
│            └───────────┬──────────────┘                          │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │   API Client (Axios)     │                          │
│            │  (lib/api-client.ts)     │                          │
│            ├──────────────────────────┤                          │
│            │ • Request Interceptor    │◄─ Add JWT Token          │
│            │ • Response Interceptor   │◄─ Handle Refresh         │
│            │ • Error Handling         │◄─ Handle Errors          │
│            └───────────┬──────────────┘                          │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ HTTP Requests (axios)
                         │ Authorization: Bearer <token>
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Express)                        │
│                     http://localhost:4001                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware Stack                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • Helmet (Security Headers)                              │  │
│  │ • CORS (Cross-Origin)                                    │  │
│  │ • Rate Limiting (100 req/15min)                          │  │
│  │ • Body Parser (JSON)                                     │  │
│  │ • Morgan (Logging)                                       │  │
│  └─────────────────────┬────────────────────────────────────┘  │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │   Auth Routes            │                          │
│            │  (api/auth.routes.ts)    │                          │
│            ├──────────────────────────┤                          │
│            │ POST /auth/register      │                          │
│            │ POST /auth/login         │                          │
│            │ POST /auth/logout        │                          │
│            │ POST /auth/refresh       │                          │
│            │ POST /auth/verify-email  │                          │
│            │ POST /auth/2fa/enable    │◄─ Protected              │
│            │ POST /auth/2fa/verify    │◄─ Protected              │
│            │ POST /auth/2fa/disable   │◄─ Protected              │
│            └───────────┬──────────────┘                          │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │   Auth Controller        │                          │
│            │  (api/auth.controller)   │                          │
│            ├──────────────────────────┤                          │
│            │ • Validate Input (Zod)   │                          │
│            │ • Call Services          │                          │
│            │ • Return Response        │                          │
│            └───────────┬──────────────┘                          │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │   Auth Service           │                          │
│            │  (auth/auth.service.ts)  │                          │
│            ├──────────────────────────┤                          │
│            │ • Business Logic         │                          │
│            │ • Password Hashing       │                          │
│            │ • JWT Generation         │                          │
│            │ • 2FA Management         │                          │
│            └───────────┬──────────────┘                          │
│                        │                                         │
│            ┌───────────▼──────────────┐                          │
│            │   Repositories           │                          │
│            │  (database/*.repository) │                          │
│            ├──────────────────────────┤                          │
│            │ • UserRepository         │                          │
│            │ • SessionRepository      │                          │
│            └───────────┬──────────────┘                          │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   MongoDB    │
                  │   Database   │
                  └──────────────┘
```

## 🔄 Authentication Flow

### 1. Registration Flow
```
User → Frontend Form
  ↓
Frontend Validation (password strength, matching)
  ↓
authApi.register({ name, email, password })
  ↓
API Client (axios) → POST /auth/register
  ↓
Backend: AuthController.register()
  ↓
Backend: Validate with Zod
  ↓
Backend: AuthService.register()
  ↓
Backend: Hash password (bcrypt)
  ↓
Backend: Create user in DB
  ↓
Backend: Generate JWT tokens
  ↓
Backend: Return { user, tokens }
  ↓
Frontend: Store tokens in localStorage
  ↓
Frontend: Update AuthContext state
  ↓
Frontend: Redirect to dashboard
```

### 2. Login Flow
```
User → Enter Credentials
  ↓
authApi.login({ email, password })
  ↓
API Client → POST /auth/login
  ↓
Backend: Verify credentials
  ↓
Backend: Check if 2FA enabled
  ├─ Yes → Request 2FA code
  └─ No → Generate tokens
  ↓
Backend: Update lastLogin
  ↓
Backend: Create session
  ↓
Backend: Return { user, tokens }
  ↓
Frontend: Store tokens
  ↓
Frontend: Update user state
  ↓
Frontend: Redirect to dashboard
```

### 3. Authenticated Request Flow
```
Component → Make API Request
  ↓
API Client Request Interceptor
  ↓
Add Header: Authorization: Bearer <accessToken>
  ↓
Send Request to Backend
  ↓
Backend: Verify JWT token
  ├─ Valid → Process request
  └─ Invalid/Expired → Return 401
        ↓
        Response Interceptor catches 401
        ↓
        Attempt token refresh
        ↓
        POST /auth/refresh { refreshToken }
        ↓
        Backend: Verify refresh token
        ↓
        Backend: Generate new tokens
        ↓
        Frontend: Update tokens
        ↓
        Retry original request with new token
```

### 4. Logout Flow
```
User → Click Logout
  ↓
authApi.logout()
  ↓
API Client → POST /auth/logout
  ↓
Backend: Invalidate refresh token
  ↓
Backend: Delete session from DB
  ↓
Frontend: Clear localStorage
  ↓
Frontend: Clear AuthContext state
  ↓
Frontend: Redirect to login
```

## 🔐 Token Management

### Access Token
- **Purpose**: Short-lived token for API requests
- **Lifespan**: 15 minutes
- **Storage**: localStorage (accessToken)
- **Usage**: Added to Authorization header automatically

### Refresh Token
- **Purpose**: Long-lived token for generating new access tokens
- **Lifespan**: 7 days
- **Storage**: localStorage (refreshToken)
- **Usage**: Sent to /auth/refresh endpoint

### Token Refresh Strategy
```
┌─────────────────────────────────────────┐
│   Access Token Lifecycle                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐  Valid   ┌──────────────┐   │
│  │ User │─────────►│ Make Request │   │
│  └──────┘          └──────┬───────┘   │
│                            │            │
│                     ┌──────▼───────┐   │
│                     │  Add Token   │   │
│                     └──────┬───────┘   │
│                            │            │
│                     ┌──────▼───────┐   │
│                     │   Backend    │   │
│                     └──────┬───────┘   │
│                            │            │
│              ┌─────────────┴──────────────┐
│              │                            │
│         ┌────▼─────┐              ┌──────▼──────┐
│         │  Valid   │              │   Expired   │
│         └────┬─────┘              └──────┬──────┘
│              │                            │
│         ┌────▼─────┐              ┌──────▼──────┐
│         │ Response │              │  Return 401 │
│         └──────────┘              └──────┬──────┘
│                                           │
│                                    ┌──────▼──────┐
│                                    │  Interceptor│
│                                    └──────┬──────┘
│                                           │
│                                    ┌──────▼──────┐
│                                    │   Refresh   │
│                                    │    Token    │
│                                    └──────┬──────┘
│                                           │
│                                    ┌──────▼──────┐
│                                    │  New Tokens │
│                                    └──────┬──────┘
│                                           │
│                                    ┌──────▼──────┐
│                                    │    Retry    │
│                                    └─────────────┘
│                                                   │
└───────────────────────────────────────────────────┘
```

## 📁 Key Files and Their Roles

| File | Role | Key Functions |
|------|------|---------------|
| `frontend/lib/api-client.ts` | HTTP Client | Request/Response interceptors, Error handling |
| `frontend/lib/api/auth.api.ts` | Auth API | All auth-related API calls |
| `frontend/contexts/auth-context.tsx` | State Management | Global auth state, hooks |
| `frontend/middleware.ts` | Route Protection | Redirect logic, Auth checks |
| `backend/services/auth-service/src/index.ts` | Server Entry | Express app setup |
| `backend/services/auth-service/src/api/auth.routes.ts` | Route Definitions | URL mapping |
| `backend/services/auth-service/src/api/auth.controller.ts` | Request Handler | HTTP logic |
| `backend/services/auth-service/src/auth/auth.service.ts` | Business Logic | Auth operations |
| `backend/services/auth-service/src/database/*.repository.ts` | Data Access | DB operations |

## 🌐 Network Flow

```
┌──────────────┐     HTTP/HTTPS      ┌──────────────┐
│              │◄──────────────────►  │              │
│   Browser    │                      │   Backend    │
│   :3000      │     JSON Data        │   :4001      │
│              │◄──────────────────►  │              │
└──────────────┘                      └──────────────┘
       │                                      │
       │ localStorage                         │ MongoDB
       ├─ accessToken                         ├─ users
       ├─ refreshToken                        └─ sessions
       └─ user
```

## 🎯 Benefits of This Architecture

1. **Separation of Concerns**: Clear boundaries between layers
2. **Type Safety**: Full TypeScript coverage
3. **Reusability**: API services can be used anywhere
4. **Maintainability**: Each layer has single responsibility
5. **Scalability**: Easy to add new endpoints/features
6. **Security**: Token-based auth with automatic refresh
7. **User Experience**: Seamless auth, no manual token management
8. **Developer Experience**: Easy to debug, well-documented

## 🚀 Adding New Features

### To Add a New API Endpoint:

**Backend:**
1. Add route in `auth.routes.ts`
2. Add controller method in `auth.controller.ts`
3. Add service method in `auth.service.ts`
4. Add repository method if needed

**Frontend:**
1. Add API method in `lib/api/auth.api.ts`
2. Use in components with `authApi.newMethod()`

That's it! The interceptors handle everything else automatically! 🎉
