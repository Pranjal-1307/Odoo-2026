# Prompt 05 — Authentication Service

## Context
You are building **AssetFlow**. Backend core is ready (Prompt 04). Now build the complete authentication module with signup, login, forgot password, token refresh, and session management.

---

## What to Build

### Architecture Pattern
Follow the **Repository → Service → Controller → Route** pattern for every module.

---

### 1. Auth Validation Schemas

**`src/validators/auth.validator.ts`**

```typescript
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
```

---

### 2. Auth Repository

**`src/repositories/auth.repository.ts`**

```typescript
// Methods:
findUserByEmail(email: string)          // returns user with department included
findUserById(id: string)                // returns user (password excluded)
createUser(data: CreateUserData)        // creates user with hashed password
updatePassword(userId: string, hash: string) // updates password
generateEmployeeCode()                 // returns next EMP-XXX code
```

Key rules:
- `generateEmployeeCode()`: Query the highest `employeeCode`, parse the number, increment, format as `EMP-XXX` (zero-padded to 3 digits).
- `findUserByEmail` must include the password hash for login comparison.
- `findUserById` must EXCLUDE the password from the result.

---

### 3. Auth Service

**`src/services/auth.service.ts`**

#### `signup(data)`
1. Check if email already exists → throw `AppError.conflict('Email already registered')`
2. Hash password with bcrypt (salt rounds: 10)
3. Generate employee code via repository
4. Create user with role = `EMPLOYEE` (always, never allow role selection at signup)
5. Generate access token + refresh token
6. Log activity: "User signed up"
7. Return `{ user (no password), accessToken, refreshToken }`

#### `login(data)`
1. Find user by email → throw `AppError.unauthorized('Invalid credentials')` if not found
2. Compare password with bcrypt → throw same error if mismatch
3. Check user status → throw `AppError.forbidden('Account is deactivated')` if INACTIVE
4. Generate access token + refresh token
5. Log activity: "User logged in"
6. Return `{ user (no password), accessToken, refreshToken }`

#### `getProfile(userId)`
1. Find user by ID → throw `AppError.notFound('User not found')` if missing
2. Return user with department info

#### `refreshToken(refreshToken)`
1. Verify refresh token → throw `AppError.unauthorized('Invalid refresh token')` if invalid
2. Find user by decoded userId
3. Generate new access token
4. Return `{ accessToken }`

#### `forgotPassword(email)`
1. Find user by email → return success even if not found (security)
2. In a real app, send reset email. For hackathon, generate a temporary token and log it to console
3. Return `{ message: 'If the email exists, a reset link has been sent' }`

---

### 4. Auth Controller

**`src/controllers/auth.controller.ts`**

```typescript
export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction)
  async login(req: Request, res: Response, next: NextFunction)
  async getProfile(req: Request, res: Response, next: NextFunction)
  async refreshToken(req: Request, res: Response, next: NextFunction)
  async forgotPassword(req: Request, res: Response, next: NextFunction)
}
```

Each method:
1. Calls the corresponding service method
2. Wraps the response in `successResponse()`
3. Catches errors with try/catch and passes to `next(error)`

---

### 5. Auth Routes

**`src/routes/auth.routes.ts`**

```
POST   /api/auth/signup         → validate(signupSchema) → authController.signup
POST   /api/auth/login          → validate(loginSchema) → authController.login
GET    /api/auth/profile        → authenticate → authController.getProfile
POST   /api/auth/refresh-token  → validate(refreshTokenSchema) → authController.refreshToken
POST   /api/auth/forgot-password → validate(forgotPasswordSchema) → authController.forgotPassword
```

---

### 6. Register Routes in App

Update `src/app.ts`:
```typescript
import { authRouter } from './routes/auth.routes';
app.use('/api/auth', authRouter);
```

---

## API Contracts

### POST `/api/auth/signup`
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@assetflow.com",
  "password": "password123",
  "phone": "+91-9876543210",
  "departmentId": "uuid-of-department" // optional
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "employeeCode": "EMP-009",
      "name": "John Doe",
      "email": "john@assetflow.com",
      "role": "EMPLOYEE",
      "status": "ACTIVE",
      "department": null
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### POST `/api/auth/login`
**Request:**
```json
{
  "email": "admin@assetflow.com",
  "password": "admin123"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "employeeCode": "EMP-001",
      "name": "Admin User",
      "email": "admin@assetflow.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "department": null
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

### GET `/api/auth/profile`
**Headers:** `Authorization: Bearer <token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "uuid",
    "employeeCode": "EMP-001",
    "name": "Admin User",
    "email": "admin@assetflow.com",
    "role": "ADMIN",
    "status": "ACTIVE",
    "department": {
      "id": "uuid",
      "name": "IT Department"
    }
  }
}
```

---

## Security Rules

1. **Passwords are NEVER returned** in any API response
2. **Signup always creates EMPLOYEE role** — no role field accepted at signup
3. **Inactive users cannot login** — checked after password validation
4. **Forgot password doesn't reveal** whether email exists
5. **JWT tokens include** `userId` and `role` in payload
6. **Access tokens expire** in 24 hours
7. **Refresh tokens expire** in 7 days

---

## Verification

```bash
# Start server
cd assetflow/backend && npm run dev

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@assetflow.com","password":"test123"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@assetflow.com","password":"admin123"}'

# Test profile (use token from login response)
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"

# Test validation error
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'
```

Expected:
- Signup returns 201 with user + tokens
- Login returns 200 with user + tokens
- Profile returns 200 with user data (no password)
- Invalid data returns 400 with Zod error messages
- Wrong password returns 401
- Duplicate email returns 409

---

## What's Next
Prompt 06 will build the Organization Service (Departments, Categories, Employee Directory with role promotion).
