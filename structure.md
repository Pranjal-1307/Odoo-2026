# AssetFlow Directory Structure

Below is the file and folder structure for [Odoo-2026](file:///c:/Users/shahp/OneDrive/Desktop/ODOO_MAIN/Odoo-2026).

```
Odoo-2026/
├── assetflow/                            # Core Monorepo
│   ├── backend/                          # Express API
│   │   ├── prisma/                       # Database Models & Seeds
│   │   │   ├── schema.prisma             # MySQL Schema definitions
│   │   │   └── seed.ts                   # Initial DB Seed Script
│   │   ├── src/                          # Backend Source Code
│   │   │   ├── config/                   # Server Configuration
│   │   │   ├── controllers/              # REST Request Controllers
│   │   │   ├── middlewares/              # JWT & Error Middlewares
│   │   │   ├── repositories/             # Database Access Layer
│   │   │   ├── routes/                   # API Endpoint Mapping
│   │   │   ├── services/                 # Business Logic
│   │   │   ├── types/                    # TS Definitions
│   │   │   ├── utils/                    # QR & Helper Utilities
│   │   │   ├── validators/               # Zod Schema Validation
│   │   │   └── app.ts                    # Express Server entry
│   │   └── uploads/                      # Uploaded documents/images
│   ├── frontend/                         # Vite React Client
│   │   ├── src/                          # Frontend Source Code
│   │   │   ├── components/               # Custom UI Components & Layouts
│   │   │   ├── contexts/                 # Theme & Auth Contexts
│   │   │   ├── hooks/                    # Reusable React Hooks
│   │   │   ├── lib/                      # Third-party configuration
│   │   │   ├── pages/                    # Routed Screens (Dashboard, Assets, Audits, etc.)
│   │   │   ├── services/                 # API client modules
│   │   │   ├── types/                    # TS Interfaces
│   │   │   ├── App.tsx                   # Routing & Providers Tree
│   │   │   └── main.tsx                  # React DOM Entrypoint
│   │   └── index.html                    # Main HTML shell
│   └── .env                              # Environment Variables
├── md Files/                             # Documentation Guides
└── read.md                               # Complete Project Readme
```

## Key Paths Reference
*   **Root Documentation**: [read.md](file:///c:/Users/shahp/OneDrive/Desktop/ODOO_MAIN/Odoo-2026/read.md)
*   **Database Config**: [schema.prisma](file:///c:/Users/shahp/OneDrive/Desktop/ODOO_MAIN/Odoo-2026/assetflow/backend/prisma/schema.prisma)
*   **Backend Entry**: [app.ts](file:///c:/Users/shahp/OneDrive/Desktop/ODOO_MAIN/Odoo-2026/assetflow/backend/src/app.ts)
*   **Frontend Router**: [App.tsx](file:///c:/Users/shahp/OneDrive/Desktop/ODOO_MAIN/Odoo-2026/assetflow/frontend/src/App.tsx)
*   **Database Seeder**: [seed.ts](file:///c:/Users/shahp/OneDrive/Desktop/ODOO_MAIN/Odoo-2026/assetflow/backend/prisma/seed.ts)
