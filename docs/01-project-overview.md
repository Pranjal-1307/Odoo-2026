# 01 — Project Overview: AssetFlow ERP (Odoo-2026)

---

## 1. Purpose

AssetFlow ERP is an enterprise-grade Asset Management & Resource Planning platform designed for mid-to-large organizations. It provides end-to-end lifecycle management of organizational assets—from procurement and allocation to maintenance, auditing, and disposal.

The system enables organizations to:

- Track every physical and digital asset across departments and locations.
- Allocate assets to employees with full traceability.
- Book shared/pooled assets (vehicles, meeting rooms, equipment).
- Schedule and track preventive and corrective maintenance.
- Conduct periodic asset audits with discrepancy detection.
- Generate compliance, financial, and operational reports.
- Enforce role-based access with full audit trails.

---

## 2. Architecture Summary

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Frontend     | React.js (Vite), JavaScript, HTML5, CSS3, Axios |
| Backend      | Java 17, Spring Boot 3, Spring Security, JPA    |
| Database     | MySQL 8                                         |
| Auth         | JWT (JSON Web Tokens)                           |
| State Mgmt   | React Context API                               |
| Routing      | React Router v6                                 |
| IDE          | VS Code                                         |
| Build Tool   | Maven (Backend), Vite (Frontend)                |
| API Protocol | RESTful JSON over HTTPS                         |

---

## 3. Responsibilities

### 3.1 Frontend Responsibilities

- Render all UI screens per the wireframe specifications.
- Handle client-side form validation before API submission.
- Manage JWT tokens (storage, refresh, expiry detection).
- Provide role-based UI rendering (hide/show features per role).
- Implement responsive layouts for desktop, tablet, and mobile.
- Display real-time notifications and alerts.
- Handle loading states, error states, and empty states gracefully.

### 3.2 Backend Responsibilities

- Expose RESTful APIs for all CRUD operations and business logic.
- Authenticate and authorize every request via JWT + Spring Security.
- Enforce business rules and validation at the service layer.
- Manage database transactions with proper isolation levels.
- Generate reports (PDF, CSV, Excel).
- Send notifications (in-app, email).
- Maintain audit logs for every data mutation.

### 3.3 Database Responsibilities

- Store all persistent data in normalized MySQL 8 tables.
- Enforce referential integrity via foreign keys.
- Optimize read performance via indexes.
- Support soft deletes (logical deletion with `is_deleted` flags).
- Maintain timestamps (`created_at`, `updated_at`) on every table.

---

## 4. Workflow — High-Level System Flow

```
User (Browser)
    │
    ▼
React Frontend (Vite Dev Server / Nginx in Prod)
    │  Axios HTTP calls (JSON + JWT Bearer Token)
    ▼
Spring Boot Backend (Embedded Tomcat)
    │  Spring Security Filter Chain → JWT Validation
    │  Controller → Service → Repository
    ▼
MySQL 8 Database
    │  JPA/Hibernate ORM
    ▼
Response JSON → Frontend Rendering
```

### 4.1 Typical Request Lifecycle

1. User interacts with the React UI (clicks a button, submits a form).
2. React component calls a service function that uses Axios.
3. Axios attaches the JWT Bearer token from localStorage.
4. Spring Security filter intercepts the request and validates the JWT.
5. If valid, the request reaches the appropriate `@RestController`.
6. The controller delegates to a `@Service` class.
7. The service applies business rules and calls `@Repository` (JPA).
8. Hibernate translates JPA calls into SQL queries against MySQL.
9. The result propagates back: Repository → Service → Controller → JSON Response.
10. Axios receives the response; React updates the UI.

---

## 5. Business Rules — Global

| Rule ID | Rule Description                                                                 |
| ------- | -------------------------------------------------------------------------------- |
| BR-G01  | Every user must authenticate before accessing any protected resource.            |
| BR-G02  | All timestamps are stored in UTC; frontend converts to user's local timezone.    |
| BR-G03  | Soft delete is used for all entities; hard delete is prohibited in production.    |
| BR-G04  | Every data mutation (create, update, delete) generates an audit log entry.        |
| BR-G05  | Pagination is mandatory for all list endpoints (default page size: 20).          |
| BR-G06  | File uploads are limited to 10 MB per file; allowed types: PDF, PNG, JPG, XLSX.  |
| BR-G07  | All monetary values are stored as `DECIMAL(15,2)`.                               |
| BR-G08  | Asset codes are auto-generated and immutable after creation.                     |
| BR-G09  | An asset can only be in one status at a time (state machine enforcement).        |
| BR-G10  | Session timeout: 30 minutes of inactivity; JWT expiry: 24 hours.                |

---

## 6. Validation Rules — Global

| Rule ID | Rule Description                                                              |
| ------- | ----------------------------------------------------------------------------- |
| VR-G01  | All required fields must be non-null and non-empty.                           |
| VR-G02  | Email fields must match RFC 5322 pattern.                                     |
| VR-G03  | Phone numbers must be 10–15 digits (E.164 format recommended).               |
| VR-G04  | Dates must be in ISO 8601 format (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`).   |
| VR-G05  | String fields have maximum length constraints (defined per entity).           |
| VR-G06  | Numeric fields must be non-negative unless explicitly allowed.                |
| VR-G07  | Enum fields must contain only predefined allowed values.                      |
| VR-G08  | Foreign key references must point to existing, non-deleted records.           |
| VR-G09  | Duplicate detection: unique constraints on codes, emails, and usernames.      |
| VR-G10  | Passwords must be minimum 8 characters with uppercase, lowercase, and digit.  |

---

## 7. Database Tables — Overview

The full schema spans approximately 25+ tables. Key entity groups:

| Group          | Tables                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| Users & Auth   | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`      |
| Organization   | `organizations`, `departments`, `locations`, `designations`                              |
| Assets         | `assets`, `asset_categories`, `asset_subcategories`, `asset_images`, `asset_documents`   |
| Allocation     | `allocations`, `allocation_history`                                                      |
| Booking        | `bookings`, `booking_slots`                                                              |
| Maintenance    | `maintenance_requests`, `maintenance_schedules`, `maintenance_logs`, `vendors`           |
| Audit          | `audit_sessions`, `audit_items`, `audit_discrepancies`                                   |
| Reports        | `report_configs`, `report_exports`                                                       |
| Notifications  | `notifications`, `notification_preferences`                                              |
| System         | `audit_trail`, `system_settings`, `file_attachments`                                     |

---

## 8. Relationships — High-Level

- A **User** belongs to one **Organization** and one **Department**.
- An **Asset** belongs to one **Category** and one **Location**.
- An **Allocation** links one **Asset** to one **User** with date range.
- A **Booking** reserves one **Asset** for a **User** during specific time slots.
- A **Maintenance Request** is raised against one **Asset**.
- An **Audit Session** contains multiple **Audit Items**, each referencing one **Asset**.
- **Notifications** are generated by system events and targeted to specific **Users**.

---

## 9. REST APIs — Summary

| Module         | Base Path                    | Endpoints Count |
| -------------- | ---------------------------- | --------------- |
| Authentication | `/api/v1/auth`               | 5               |
| Users          | `/api/v1/users`              | 8               |
| Organizations  | `/api/v1/organizations`      | 6               |
| Departments    | `/api/v1/departments`        | 6               |
| Locations      | `/api/v1/locations`          | 6               |
| Assets         | `/api/v1/assets`             | 12              |
| Categories     | `/api/v1/categories`         | 6               |
| Allocations    | `/api/v1/allocations`        | 8               |
| Bookings       | `/api/v1/bookings`           | 8               |
| Maintenance    | `/api/v1/maintenance`        | 10              |
| Audits         | `/api/v1/audits`             | 8               |
| Reports        | `/api/v1/reports`            | 6               |
| Notifications  | `/api/v1/notifications`      | 5               |
| Dashboard      | `/api/v1/dashboard`          | 4               |
| **Total**      |                              | **~98**         |

---

## 10. UI Layout — Application Shell

```
┌──────────────────────────────────────────────────────────────┐
│  TOP NAVBAR                                                  │
│  [Logo] [Search] [Notifications Bell] [User Avatar ▼]        │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│  SIDEBAR   │  MAIN CONTENT AREA                              │
│            │                                                 │
│  Dashboard │  ┌───────────────────────────────────────────┐  │
│  Org       │  │  Page Title + Breadcrumb                  │  │
│  Assets    │  ├───────────────────────────────────────────┤  │
│  Allocate  │  │  Action Bar (Buttons, Filters, Search)    │  │
│  Bookings  │  ├───────────────────────────────────────────┤  │
│  Maintain  │  │                                           │  │
│  Audit     │  │  Content (Table / Form / Cards / Charts)  │  │
│  Reports   │  │                                           │  │
│  Notifs    │  ├───────────────────────────────────────────┤  │
│  Settings  │  │  Pagination / Footer                      │  │
│            │  └───────────────────────────────────────────┘  │
├────────────┴─────────────────────────────────────────────────┤
│  FOOTER: © 2026 AssetFlow ERP | Version 1.0                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Navigation — Top-Level

| Menu Item    | Route              | Icon               | Roles Allowed                    |
| ------------ | ------------------ | ------------------- | -------------------------------- |
| Dashboard    | `/dashboard`       | `DashboardIcon`     | All authenticated users          |
| Organization | `/organization`    | `BusinessIcon`      | SUPER_ADMIN, ADMIN               |
| Assets       | `/assets`          | `InventoryIcon`     | ADMIN, ASSET_MANAGER             |
| Allocations  | `/allocations`     | `AssignmentIcon`    | ADMIN, ASSET_MANAGER             |
| Bookings     | `/bookings`        | `EventIcon`         | All authenticated users          |
| Maintenance  | `/maintenance`     | `BuildIcon`         | ADMIN, ASSET_MANAGER, TECHNICIAN |
| Audit        | `/audit`           | `FactCheckIcon`     | ADMIN, AUDITOR                   |
| Reports      | `/reports`         | `AssessmentIcon`    | ADMIN, MANAGER                   |
| Notifications| `/notifications`   | `NotificationsIcon` | All authenticated users          |
| Settings     | `/settings`        | `SettingsIcon`      | SUPER_ADMIN, ADMIN               |

---

## 12. Security Rules — Global

| Rule ID | Security Rule                                                                 |
| ------- | ----------------------------------------------------------------------------- |
| SR-G01  | All API endpoints (except `/api/v1/auth/login` and `/api/v1/auth/register`) require a valid JWT. |
| SR-G02  | JWT tokens are signed with HS512 algorithm using a 256-bit secret key.        |
| SR-G03  | Passwords are hashed using BCrypt with strength factor 12.                    |
| SR-G04  | CORS is configured to allow only the frontend origin.                         |
| SR-G05  | Rate limiting: 100 requests per minute per IP for API; 5 attempts per minute for login. |
| SR-G06  | SQL injection prevention via parameterized queries (JPA handles this).        |
| SR-G07  | XSS prevention via React's automatic escaping and CSP headers.               |
| SR-G08  | CSRF protection is disabled (stateless JWT-based auth).                       |
| SR-G09  | Sensitive data (passwords, tokens) are never returned in API responses.       |
| SR-G10  | All API responses use standard error format with no stack traces in production.|

---

## 13. Error Handling — Global Strategy

### 13.1 Backend Error Response Format

```
{
  "timestamp": "2026-07-12T10:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for field 'email'",
  "path": "/api/v1/users",
  "errors": [
    {
      "field": "email",
      "rejectedValue": "invalid-email",
      "message": "Must be a valid email address"
    }
  ]
}
```

### 13.2 HTTP Status Code Usage

| Status Code | Usage                                                |
| ----------- | ---------------------------------------------------- |
| 200         | Successful GET, PUT, PATCH                           |
| 201         | Successful POST (resource created)                   |
| 204         | Successful DELETE (no content)                       |
| 400         | Validation errors, malformed requests                |
| 401         | Missing or invalid JWT token                         |
| 403         | Authenticated but insufficient permissions           |
| 404         | Resource not found                                   |
| 409         | Conflict (duplicate resource, state conflict)        |
| 422         | Unprocessable entity (business rule violation)       |
| 429         | Rate limit exceeded                                  |
| 500         | Internal server error                                |

### 13.3 Frontend Error Handling

- Axios interceptors catch 401 errors and redirect to login.
- Axios interceptors catch 403 errors and show "Access Denied" page.
- Form validation errors are displayed inline below each field.
- Toast notifications for success/error feedback on operations.
- Full-page error boundary for unhandled React errors.

---

## 14. Future Improvements

| Priority | Improvement                                                        |
| -------- | ------------------------------------------------------------------ |
| High     | WebSocket integration for real-time notifications.                 |
| High     | Barcode/QR code scanning for asset tracking.                       |
| Medium   | Multi-tenant architecture for SaaS deployment.                     |
| Medium   | Mobile app (React Native) for field audits.                        |
| Medium   | Integration with accounting software (QuickBooks, Tally).          |
| Low      | AI-powered predictive maintenance scheduling.                      |
| Low      | Blockchain-based asset provenance tracking.                        |
| Low      | IoT sensor integration for real-time asset monitoring.             |

---

## 15. Dependencies — Full Stack

### 15.1 Backend Dependencies (Maven)

| Dependency                  | Version   | Purpose                        |
| --------------------------- | --------- | ------------------------------ |
| spring-boot-starter-web     | 3.2.x     | REST API framework             |
| spring-boot-starter-data-jpa| 3.2.x     | JPA/Hibernate ORM              |
| spring-boot-starter-security| 3.2.x     | Authentication & authorization |
| spring-boot-starter-validation | 3.2.x  | Bean validation (Jakarta)      |
| jjwt-api                    | 0.12.x    | JWT token generation/parsing   |
| jjwt-impl                   | 0.12.x    | JWT implementation             |
| jjwt-jackson                | 0.12.x    | JWT JSON processing            |
| mysql-connector-j           | 8.3.x     | MySQL JDBC driver              |
| lombok                      | 1.18.x    | Boilerplate reduction          |
| mapstruct                   | 1.5.x     | DTO ↔ Entity mapping           |
| springdoc-openapi           | 2.3.x     | Swagger/OpenAPI documentation  |
| spring-boot-starter-mail    | 3.2.x     | Email notifications            |
| apache-poi                  | 5.2.x     | Excel report generation        |
| itext                       | 8.x       | PDF report generation          |
| spring-boot-devtools        | 3.2.x     | Hot reload during development  |
| spring-boot-starter-test    | 3.2.x     | Testing framework              |

### 15.2 Frontend Dependencies (npm)

| Dependency           | Version  | Purpose                          |
| -------------------- | -------- | -------------------------------- |
| react                | 18.x     | UI library                       |
| react-dom            | 18.x     | DOM rendering                    |
| react-router-dom     | 6.x      | Client-side routing              |
| axios                | 1.7.x    | HTTP client                      |
| react-icons          | 5.x      | Icon library                     |
| chart.js             | 4.x      | Dashboard charts                 |
| react-chartjs-2      | 5.x      | React wrapper for Chart.js       |
| react-toastify       | 10.x     | Toast notifications              |
| date-fns             | 3.x      | Date formatting/manipulation     |
| react-datepicker     | 6.x      | Date picker component            |
| react-select         | 5.x      | Advanced select/dropdown         |
| react-table          | 8.x      | Data table with sorting/paging   |
| jspdf                | 2.x      | Client-side PDF generation       |
| xlsx                 | 0.18.x   | Client-side Excel export         |
| vite                 | 5.x      | Build tool and dev server        |
| @vitejs/plugin-react | 4.x      | React plugin for Vite            |

---

## 16. Folder Structure — Overview

See `02-folder-structure.md` for the complete folder tree.

```
Odoo-2026/
├── docs/                    # This documentation
├── backend/                 # Spring Boot application
│   └── src/main/java/com/assetflow/
├── frontend/                # React (Vite) application
│   └── src/
└── database/                # SQL scripts
```

---

## 17. Implementation Notes

1. **Monorepo Structure**: Both frontend and backend live in the same Git repository under separate top-level directories.
2. **API Versioning**: All APIs are versioned under `/api/v1/`. Future breaking changes increment to `/api/v2/`.
3. **Environment Configuration**: Use `.env` files for frontend and `application.yml` / `application-{profile}.yml` for backend.
4. **Database Migrations**: Use Flyway for database migration scripts in production.
5. **Testing Strategy**: Unit tests for services, integration tests for repositories, E2E tests for critical flows.
6. **Logging**: SLF4J + Logback with structured JSON logging in production.
7. **Documentation**: Swagger UI available at `/swagger-ui.html` in development.
8. **Git Workflow**: Feature branches → Pull Requests → Code Review → Merge to `main`.
