# Prompt 15 — Frontend Auth Pages (Login, Signup, Forgot Password)

## Context
You are building **AssetFlow**. The frontend shell is ready (Prompt 14). Now build the authentication pages — the first thing users see.

---

## What to Build

### Design Direction
- **Split layout**: Left side = branding/illustration, Right side = form
- **Glassmorphism card** for the form area
- **Gradient background** on the branding side (brand-600 to brand-900)
- **Smooth animations**: form elements slide in on load
- **Mobile responsive**: stack vertically on small screens

---

### 1. Login Page — `src/pages/LoginPage.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│   ┌──────────────────┐ ┌──────────────────────┐ │
│   │                  │ │                      │ │
│   │   AssetFlow      │ │   Welcome Back       │ │
│   │   Logo           │ │                      │ │
│   │                  │ │   Email Input         │ │
│   │   Enterprise     │ │   Password Input      │ │
│   │   Asset          │ │   [Forgot Password?]  │ │
│   │   Management     │ │                      │ │
│   │                  │ │   [Login Button]      │ │
│   │   "Track,        │ │                      │ │
│   │   Allocate,      │ │   Don't have an      │ │
│   │   Maintain"      │ │   account? Sign up    │ │
│   │                  │ │                      │ │
│   └──────────────────┘ └──────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Form Fields:**
- Email (with email icon, autocomplete="email")
- Password (with lock icon, show/hide toggle, autocomplete="current-password")
- "Remember me" checkbox (optional)
- "Forgot password?" link
- Login button (full width, primary style)
- "Don't have an account? Sign up" link

**Implementation:**
- Use React Hook Form with Zod validation
- Show loading spinner on button during API call
- Show error toast on failed login
- On success → redirect to `/dashboard`
- Show specific error messages:
  - "Invalid credentials" for wrong email/password
  - "Account is deactivated" for inactive users

**Validation (client-side):**
```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
```

---

### 2. Signup Page — `src/pages/SignupPage.tsx`

**Layout:** Same split design as Login.

**Form Fields:**
- Full Name (with user icon)
- Email (with mail icon)
- Phone (optional, with phone icon)
- Department (optional, select dropdown — fetch from `/api/departments`)
- Password (with show/hide toggle)
- Confirm Password
- "I agree to terms" checkbox
- Sign Up button
- "Already have an account? Login" link

**Implementation:**
- Fetch departments on mount for the dropdown
- Password strength indicator (optional but impressive)
- Match confirm password validation
- On success → redirect to `/dashboard`
- Show toast: "Account created successfully! You've been registered as an Employee."

**Important UX note:** There is NO role selection. Display a small info note:
> "All accounts are created with Employee role. Admins can assign additional roles."

**Validation:**
```typescript
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  departmentId: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

---

### 3. Forgot Password Page — `src/pages/ForgotPasswordPage.tsx`

**Layout:** Centered card, simpler design.

**Flow:**
1. Enter email → Submit
2. Show success message: "If this email exists in our system, you'll receive a reset link."
3. "Back to Login" link

**Implementation:**
- Single email input with submit button
- Show success state regardless of whether email exists (security)
- After submission, show a check icon with the success message

---

### 4. Shared Auth Layout Component

**`src/components/layout/AuthLayout.tsx`**

The split-screen layout used by all auth pages:

```tsx
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 flex-col justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">AssetFlow</h1>
          <p className="text-brand-200 mt-2">Enterprise Asset Management</p>
        </div>
        <div>
          <h2 className="text-white text-4xl font-bold leading-tight">
            Track. Allocate.<br />Maintain. Audit.
          </h2>
          <p className="text-brand-200 mt-4 text-lg">
            Simplify how your organization manages assets, resources, and equipment.
          </p>
        </div>
        <div className="text-brand-300 text-sm">
          © 2025 AssetFlow. Built for modern organizations.
        </div>
      </div>

      {/* Right: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          <h2 className="text-2xl font-bold text-surface-900">{title}</h2>
          <p className="text-surface-500 mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

---

### 5. Demo Credentials Display

On the Login page, add a collapsible section showing demo credentials for testing:

```tsx
<div className="mt-6 p-4 bg-surface-100 rounded-lg border border-surface-200">
  <button onClick={toggle} className="text-sm font-medium text-surface-600">
    📋 Demo Credentials
  </button>
  {isOpen && (
    <div className="mt-3 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-surface-500">Admin:</span>
        <span className="font-mono">admin@assetflow.com / admin123</span>
      </div>
      <div className="flex justify-between">
        <span className="text-surface-500">Asset Manager:</span>
        <span className="font-mono">rohit@assetflow.com / password123</span>
      </div>
      <div className="flex justify-between">
        <span className="text-surface-500">Department Head:</span>
        <span className="font-mono">priya@assetflow.com / password123</span>
      </div>
      <div className="flex justify-between">
        <span className="text-surface-500">Employee:</span>
        <span className="font-mono">sneha@assetflow.com / password123</span>
      </div>
    </div>
  )}
</div>
```

Add click-to-fill buttons that populate the form with demo credentials.

---

## Verification

1. Navigate to `http://localhost:3000/login` → See split-screen login page
2. Click "Sign up" → Navigate to signup page with department dropdown
3. Login with `admin@assetflow.com / admin123` → Redirect to dashboard
4. Login with wrong password → See error toast
5. Try accessing `/dashboard` without login → Redirect to `/login`
6. Mobile responsive: pages stack vertically on small screens

---

## What's Next
Prompt 16 will build the Dashboard page with KPI cards, charts, and quick actions.
