# Prompt 04 — Backend Core (Express App, Middleware, Utilities)

## Context
You are building **AssetFlow**. The project is scaffolded (Prompt 01), database schema is defined (Prompt 02), and seed data is ready (Prompt 03). Now build the backend core infrastructure that every API route will depend on.

---

## What to Build

### 1. Prisma Client Singleton

**`src/config/database.ts`**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

---

### 2. JWT Utility

**`src/utils/jwt.ts`**

Implement:
- `generateAccessToken(payload: { userId: string; role: UserRole })` → returns signed JWT
- `generateRefreshToken(payload: { userId: string })` → returns signed refresh JWT
- `verifyAccessToken(token: string)` → returns decoded payload or throws
- `verifyRefreshToken(token: string)` → returns decoded payload or throws

Use `config.jwt.secret` and `config.jwt.refreshSecret` from the config file.

---

### 3. Asset Tag Generator

**`src/utils/assetTag.ts`**

Implement:
- `generateAssetTag()` → queries the database for the highest existing asset tag, increments by 1, returns formatted string like `AF-000001`, `AF-000002`, etc.
- If no assets exist, start at `AF-000001`.
- Use Prisma to query: `SELECT asset_tag FROM assets ORDER BY asset_tag DESC LIMIT 1`

---

### 4. QR Code Generator

**`src/utils/qrCode.ts`**

Implement:
- `generateQRCode(assetTag: string)` → generates a QR code as a data URL string using the `qrcode` package
- The QR code should encode the asset tag string

---

### 5. Response Helper

**`src/utils/response.ts`**

Standardize all API responses:
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function successResponse<T>(message: string, data?: T, meta?: ApiResponse['meta']): ApiResponse<T>
export function errorResponse(message: string, errors?: any): ApiResponse
```

---

### 6. Error Handling

**`src/utils/AppError.ts`**
```typescript
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

Common factory methods:
- `AppError.badRequest(message)` → 400
- `AppError.unauthorized(message)` → 401
- `AppError.forbidden(message)` → 403
- `AppError.notFound(message)` → 404
- `AppError.conflict(message)` → 409

---

### 7. Middleware Stack

#### a) Authentication Middleware

**`src/middlewares/auth.ts`**

```typescript
export function authenticate(req: Request, res: Response, next: NextFunction)
```
- Extract Bearer token from `Authorization` header
- Verify with `verifyAccessToken`
- Attach `req.user = { userId, role }` to request
- Return 401 if missing/invalid

```typescript
export function authorize(...roles: UserRole[])
```
- Check if `req.user.role` is in the allowed roles
- Return 403 if not authorized

#### b) Validation Middleware

**`src/middlewares/validate.ts`**

```typescript
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate req.body against the Zod schema
    // Return 400 with formatted errors if invalid
    // Call next() if valid
  };
}
```

Install Zod in backend:
```bash
npm install zod
```

#### c) Error Handler Middleware

**`src/middlewares/errorHandler.ts`**

Global error handler that:
- Catches `AppError` instances → returns `{ success: false, message, statusCode }`
- Catches Prisma known errors (unique constraint, not found) → maps to appropriate HTTP status
- Catches unknown errors → returns 500 with generic message in production

#### d) Activity Logger Middleware

**`src/middlewares/activityLogger.ts`**

A utility function (not middleware) that creates activity logs:
```typescript
export async function logActivity(params: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
}): Promise<void>
```

#### e) Multer Configuration

**`src/config/multer.ts`**

Configure Multer with:
- Storage: disk storage in `uploads/photos/` and `uploads/documents/`
- File filter: images (jpg, png, webp) and documents (pdf, doc, docx)
- Size limit: 5MB
- Export two upload middlewares:
  - `uploadPhoto` — single file upload for photos
  - `uploadDocument` — single file upload for documents

---

### 8. TypeScript Types

**`src/types/express.d.ts`**
```typescript
import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}
```

**`src/types/index.ts`**
```typescript
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

### 9. Updated App Entry Point

**`src/app.ts`** — update the placeholder from Prompt 01:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security & Parsing
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'AssetFlow API is running', timestamp: new Date().toISOString() });
});

// Routes will be added in subsequent prompts:
// app.use('/api/auth', authRouter);
// app.use('/api/users', userRouter);
// app.use('/api/departments', departmentRouter);
// etc.

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 AssetFlow Backend running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

export default app;
```

---

## File Summary

```
backend/src/
├── config/
│   ├── index.ts          (from Prompt 01, unchanged)
│   ├── database.ts       (Prisma client singleton)
│   └── multer.ts         (file upload config)
├── middlewares/
│   ├── auth.ts           (authenticate + authorize)
│   ├── validate.ts       (Zod validation)
│   ├── errorHandler.ts   (global error handler)
│   └── activityLogger.ts (activity log utility)
├── utils/
│   ├── jwt.ts            (token generation/verification)
│   ├── assetTag.ts       (AF-XXXXXX generator)
│   ├── qrCode.ts         (QR code generator)
│   ├── response.ts       (standardized API responses)
│   └── AppError.ts       (custom error class)
├── types/
│   ├── express.d.ts      (Request augmentation)
│   └── index.ts          (shared types)
└── app.ts                (updated Express entry)
```

---

## Verification

```bash
cd assetflow/backend
npm run dev
```

- Server starts without errors
- `GET /api/health` returns `{ success: true, message: "AssetFlow API is running" }`
- `GET /api/nonexistent` returns `{ success: false, message: "Route not found" }` with 404 status

---

## What's Next
Prompt 05 will build the Authentication service (Signup, Login, Forgot Password, JWT refresh).
