# AssetFlow ERP — Master Build Index

## How to Use These Prompts

Each numbered `.md` file is a **self-contained prompt** you attach to your AI coding assistant (Claude, Gemini, Cursor, Copilot) **one at a time, in order**. Each prompt builds on top of what the previous one created.

### Rules
1. **Follow the order exactly** — later prompts assume earlier code exists.
2. **Don't skip files** — even "small" prompts wire critical plumbing.
3. **Verify each step works** before moving to the next.
4. **Copy-paste the entire `.md` content** as your prompt to the AI assistant.

---

## Build Order

### Phase 0 — Project Scaffolding
| # | File | What It Builds | Est. Time |
|---|------|----------------|-----------|
| 01 | `01-project-setup.md` | Monorepo, Vite + React frontend, Express backend, configs | 15 min |

### Phase 1 — Database
| # | File | What It Builds | Est. Time |
|---|------|----------------|-----------|
| 02 | `02-prisma-schema.md` | Complete Prisma schema with all 14 models, enums, relations | 15 min |
| 03 | `03-seed-data.md` | Seed script with demo roles, departments, users, assets, etc. | 10 min |

### Phase 2 — Backend Services
| # | File | What It Builds | Est. Time |
|---|------|----------------|-----------|
| 04 | `04-backend-core.md` | Express app, middleware, error handling, JWT utils, base config | 15 min |
| 05 | `05-auth-service.md` | Signup, Login, Forgot Password, JWT refresh, session validation | 15 min |
| 06 | `06-organization-service.md` | Departments, Categories, Employee Directory (CRUD + role promotion) | 20 min |
| 07 | `07-asset-service.md` | Asset Registration, Search, Lifecycle, QR Code, History | 20 min |
| 08 | `08-allocation-service.md` | Allocation, Transfer Requests, Returns, Conflict Handling | 20 min |
| 09 | `09-booking-service.md` | Resource Booking, Overlap Validation, Calendar Data | 15 min |
| 10 | `10-maintenance-service.md` | Maintenance Workflow, Approval, Technician Assignment | 15 min |
| 11 | `11-audit-service.md` | Audit Cycles, Item Verification, Discrepancy Reports | 15 min |
| 12 | `12-dashboard-reports-service.md` | Dashboard KPIs, Analytics Endpoints, Export | 15 min |
| 13 | `13-notifications-service.md` | Notifications, Activity Logs, Auto-flagging | 10 min |

### Phase 3 — Frontend
| # | File | What It Builds | Est. Time |
|---|------|----------------|-----------|
| 14 | `14-frontend-shell.md` | Layout, Sidebar, Routing, Auth Context, Theme, Shared Components | 20 min |
| 15 | `15-frontend-auth.md` | Login, Signup, Forgot Password Pages | 15 min |
| 16 | `16-frontend-dashboard.md` | Dashboard with KPI Cards, Charts, Quick Actions | 15 min |
| 17 | `17-frontend-organization.md` | Organization Setup — 3-Tab Screen (Depts, Categories, Employees) | 20 min |
| 18 | `18-frontend-assets.md` | Asset Registration Form, Directory, Search, Asset Detail View | 20 min |
| 19 | `19-frontend-allocation.md` | Allocation, Transfer, Return UI with Conflict Handling | 15 min |
| 20 | `20-frontend-booking.md` | Calendar Booking UI, Overlap Feedback, Booking Management | 15 min |
| 21 | `21-frontend-maintenance.md` | Maintenance Request Form, Workflow Board, History | 15 min |
| 22 | `22-frontend-audit.md` | Audit Cycle Management, Verification UI, Discrepancy Reports | 15 min |
| 23 | `23-frontend-reports.md` | Reports & Analytics with Charts, Heatmaps, Export | 15 min |
| 24 | `24-frontend-notifications.md` | Notification Center, Activity Log Feed | 10 min |

### Phase 4 — Polish
| # | File | What It Builds | Est. Time |
|---|------|----------------|-----------|
| 25 | `25-final-polish.md` | Final integration, testing, demo prep, README | 15 min |

---

## Total Estimated Time: ~5.5 hours

> **Hackathon Tip:** If you have only 3–4 hours, prioritize Phases 0–2 fully + Prompts 14–18 from Phase 3. That gives you Auth, Dashboard, Org Setup, Assets, and Allocation — the core that demonstrates ERP architecture.

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, TailwindCSS, Shadcn UI |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| HTTP | Axios |
| Charts | Recharts |
| Backend | Node.js, Express.js, TypeScript |
| ORM | Prisma |
| Database | MySQL 8 |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| QR Code | qrcode |
| PDF Export | jspdf |

---

## Final Folder Structure

```
assetflow/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, JWT, Multer config
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/      # Auth, validation, error handling
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Prisma data access
│   │   ├── utils/            # Helpers (tag generator, QR, etc.)
│   │   ├── types/            # TypeScript interfaces
│   │   └── app.ts            # Express app entry
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── uploads/
│   │   ├── photos/
│   │   └── documents/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Shadcn components
│   │   │   ├── layout/       # Sidebar, Header, Shell
│   │   │   └── shared/       # Custom reusable components
│   │   ├── pages/            # Page-level components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service layer (Axios)
│   │   ├── contexts/         # Auth, Theme contexts
│   │   ├── types/            # TypeScript interfaces
│   │   ├── lib/              # Utility functions
│   │   ├── assets/           # Static assets
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env
├── .gitignore
└── README.md
```
