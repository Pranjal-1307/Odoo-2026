# Prompt 01 — Project Setup & Scaffolding

## Context
You are building **AssetFlow**, an Enterprise Asset & Resource Management System. This is the **first prompt** — nothing exists yet. You will scaffold a monorepo with a Vite + React + TypeScript frontend and an Express + TypeScript backend.

---

## What to Build

### 1. Root Level Setup

Create the root directory `assetflow/` with:
- `.gitignore` (Node, TypeScript, env files, uploads, dist, node_modules)
- `.env` file with placeholders
- `README.md` with project name and setup instructions

**.env contents:**
```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/assetflow"

# JWT
JWT_SECRET="assetflow-jwt-secret-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="assetflow-refresh-secret-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:5000/api
```

---

### 2. Backend Setup

Initialize the backend at `assetflow/backend/`:

```bash
cd assetflow/backend
npm init -y
```

**Install dependencies:**
```bash
npm install express cors helmet dotenv bcryptjs jsonwebtoken multer prisma @prisma/client uuid qrcode
npm install -D typescript ts-node tsx nodemon @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/multer @types/uuid @types/qrcode @types/node
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`package.json` scripts:**
```json
{
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "db:generate": "npx prisma generate",
    "db:migrate": "npx prisma migrate dev",
    "db:push": "npx prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "npx prisma studio"
  }
}
```

**Create directory structure:**
```
backend/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── utils/
│   ├── types/
│   └── app.ts
├── prisma/
│   └── (schema.prisma will be created in Prompt 02)
├── uploads/
│   ├── photos/
│   │   └── .gitkeep
│   └── documents/
│       └── .gitkeep
├── package.json
└── tsconfig.json
```

**`src/config/index.ts`:**
```typescript
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  upload: {
    photosDir: path.resolve(__dirname, '../../uploads/photos'),
    documentsDir: path.resolve(__dirname, '../../uploads/documents'),
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
};
```

**`src/app.ts`** (minimal placeholder):
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 AssetFlow Backend running on port ${config.port}`);
});

export default app;
```

---

### 3. Frontend Setup

Initialize the frontend at `assetflow/frontend/`:

```bash
cd assetflow
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**Install dependencies:**
```bash
npm install react-router-dom axios react-hook-form @hookform/resolvers zod recharts date-fns lucide-react clsx tailwind-merge class-variance-authority
npm install -D tailwindcss @tailwindcss/vite
```

**`tailwind.config.ts`:**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Update `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

**Create directory structure:**
```
frontend/src/
├── components/
│   ├── ui/          # Shadcn-style base components
│   ├── layout/      # Sidebar, Header, AppShell
│   └── shared/      # Reusable domain components
├── pages/           # Route page components
├── hooks/           # Custom React hooks
├── services/        # Axios API service layer
├── contexts/        # Auth, Theme, Notification contexts
├── types/           # TypeScript interfaces
├── lib/             # Utility functions (cn, formatters)
├── assets/          # Static assets
├── App.tsx
├── main.tsx
└── index.css
```

**`src/lib/utils.ts`:**
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**`src/index.css`** (base styles):
```css
@import 'tailwindcss';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

**Minimal `src/App.tsx`:**
```tsx
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-600">AssetFlow</h1>
        <p className="mt-2 text-surface-500">Enterprise Asset Management System</p>
      </div>
    </div>
  );
}

export default App;
```

---

## Verification

After running this prompt:
1. `cd assetflow/backend && npm run dev` → Server starts on port 5000
2. `GET http://localhost:5000/api/health` → Returns `{ status: "ok" }`
3. `cd assetflow/frontend && npm run dev` → Vite dev server starts on port 3000
4. Browser shows "AssetFlow — Enterprise Asset Management System"

---

## What's Next
Prompt 02 will create the complete Prisma schema with all 14 models, enums, and relations.
