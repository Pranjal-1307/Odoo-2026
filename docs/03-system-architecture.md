# 03 — System Architecture: AssetFlow ERP (Odoo-2026)

---

## 1. Purpose

This document describes the complete system architecture of AssetFlow ERP, including the three-tier architecture, communication patterns, authentication flow, data flow, deployment topology, and cross-cutting concerns.

---

## 2. Architecture — Three-Tier Layered Architecture

AssetFlow ERP follows a classic **Three-Tier Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                                │
│                    React.js (Vite) — SPA                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Pages   │ │Components│ │ Context  │ │ Services │ │   Hooks      │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                          │ Axios (HTTP/JSON + JWT) │                     │
└──────────────────────────┼─────────────────────────┼────────────────────┘
                           │         REST API        │
┌──────────────────────────┼─────────────────────────┼────────────────────┐
│                        APPLICATION TIER                                  │
│                  Spring Boot 3 — Java 17                                 │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐   │
│  │  Security      │ │  Controllers   │ │  Exception Handlers        │   │
│  │  Filter Chain  │ │  (@RestCtrl)   │ │  (@ControllerAdvice)       │   │
│  └───────┬────────┘ └───────┬────────┘ └────────────────────────────┘   │
│          │                  │                                            │
│  ┌───────▼──────────────────▼────────────────────────────────────────┐   │
│  │                    SERVICE LAYER (@Service)                       │   │
│  │  Business Logic │ Validation │ Orchestration │ Audit Trail       │   │
│  └───────────────────────────┬───────────────────────────────────────┘   │
│                              │                                           │
│  ┌───────────────────────────▼───────────────────────────────────────┐   │
│  │                REPOSITORY LAYER (Spring Data JPA)                │   │
│  │  JPA Repositories │ Custom Queries │ Specifications              │   │
│  └───────────────────────────┬───────────────────────────────────────┘   │
│                              │ Hibernate ORM (JDBC)                      │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────────────┐
│                         DATA TIER                                        │
│                      MySQL 8.0                                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │  User/Auth   │ │  Org/Dept    │ │  Assets      │ │  Maintenance   │  │
│  │  Tables      │ │  Tables      │ │  Tables      │ │  Tables        │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │  Allocation  │ │  Booking     │ │  Audit       │ │  Notification  │  │
│  │  Tables      │ │  Tables      │ │  Tables      │ │  Tables        │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Responsibilities — Tier-by-Tier

### 3.1 Presentation Tier (React/Vite)

| Component        | Responsibility                                                    |
| ---------------- | ----------------------------------------------------------------- |
| Pages            | Top-level route components; compose sub-components and manage page-level state. |
| Components       | Reusable UI elements (Button, Table, Modal, Card, etc.)           |
| Context          | Global state management (auth, theme, notifications).             |
| Services         | Encapsulate Axios API calls; translate API data to component format. |
| Hooks            | Encapsulate reusable logic (form handling, pagination, auth checks). |
| Routes           | Define URL-to-component mapping; enforce auth and role guards.    |
| Utils            | Pure functions: formatters, validators, helpers.                  |

### 3.2 Application Tier (Spring Boot)

| Layer             | Responsibility                                                   |
| ----------------- | ---------------------------------------------------------------- |
| Security Filters  | Intercept every request; validate JWT; set SecurityContext.      |
| Controllers       | Parse HTTP requests; delegate to services; return HTTP responses.|
| Services          | Enforce business rules; orchestrate multi-repository operations; trigger notifications. |
| Repositories      | CRUD operations on entities; custom JPQL/native queries; specifications for dynamic queries. |
| Mappers           | Convert between Entity and DTO objects.                          |
| Exception Handlers| Catch exceptions; convert to standardized error responses.       |
| Utilities         | Shared helper methods (date parsing, code generation, file I/O). |

### 3.3 Data Tier (MySQL 8)

| Component       | Responsibility                                                     |
| --------------- | ------------------------------------------------------------------ |
| Tables          | Store persistent data with proper normalization (3NF minimum).     |
| Foreign Keys    | Enforce referential integrity between related tables.              |
| Indexes         | Optimize query performance on frequently queried columns.          |
| Constraints     | CHECK constraints for enum-like columns; UNIQUE for natural keys.  |
| Triggers        | Auto-populate computed columns (e.g., asset codes) if needed.      |

---

## 4. Workflow — Request-Response Lifecycle

### 4.1 Authenticated API Call (Detailed Flow)

```
Step 1: User clicks "Save Asset" button in React UI
    │
Step 2: AssetFormPage.jsx calls assetService.createAsset(data)
    │
Step 3: asset.service.js calls api.post('/api/v1/assets', data)
    │
Step 4: api.js (Axios instance) attaches headers:
    │   Authorization: Bearer <jwt_token>
    │   Content-Type: application/json
    │
Step 5: HTTP POST → Spring Boot Embedded Tomcat (port 8080)
    │
Step 6: Spring Security Filter Chain:
    │   a) CorsFilter → check origin
    │   b) JwtAuthenticationFilter → extract token from header
    │   c) JwtTokenProvider.validateToken(token) → verify signature + expiry
    │   d) Load UserDetails from CustomUserDetailsService
    │   e) Set SecurityContextHolder.getContext().setAuthentication(...)
    │
Step 7: DispatcherServlet routes to AssetController.createAsset()
    │
Step 8: Controller validates @RequestBody via @Valid annotation
    │   Jakarta Bean Validation runs on AssetRequest DTO
    │   If validation fails → MethodArgumentNotValidException → 400 response
    │
Step 9: Controller calls assetService.createAsset(request)
    │
Step 10: AssetServiceImpl:
    │   a) Check business rules (category exists, location exists, etc.)
    │   b) Generate asset code via AssetCodeGenerator
    │   c) Map AssetRequest DTO → Asset entity via AssetMapper
    │   d) Call assetRepository.save(asset)
    │   e) Create audit trail entry via AuditTrailService
    │   f) Map saved Asset entity → AssetResponse DTO
    │
Step 11: Hibernate generates SQL INSERT statement
    │   MySQL executes the INSERT within a transaction
    │
Step 12: Controller wraps response in ApiResponse:
    │   { "success": true, "message": "Asset created", "data": { ... } }
    │   Returns ResponseEntity with status 201 CREATED
    │
Step 13: Axios receives JSON response
    │
Step 14: asset.service.js returns response.data to component
    │
Step 15: AssetFormPage.jsx:
    │   a) Shows success toast notification
    │   b) Navigates to asset detail page via React Router
```

---

## 5. Business Rules — Architecture Level

| Rule ID | Rule Description                                                                |
| ------- | ------------------------------------------------------------------------------- |
| BR-A01  | Frontend and backend are independently deployable applications.                 |
| BR-A02  | All inter-tier communication uses JSON over HTTP(S).                            |
| BR-A03  | Backend is stateless; no server-side sessions. All state is in JWT or database. |
| BR-A04  | Database schema is source of truth. Hibernate `ddl-auto` is set to `validate` in production. |
| BR-A05  | All business logic resides in the Service layer, never in Controllers or Repositories. |
| BR-A06  | Controllers only handle HTTP concerns (parsing, status codes, headers).         |
| BR-A07  | Cross-cutting concerns (logging, audit, security) use AOP or filters.           |
| BR-A08  | File uploads go to a configurable directory; database stores only file metadata. |

---

## 6. Validation Rules — Architecture Level

| Rule ID | Validation Rule                                                                 |
| ------- | ------------------------------------------------------------------------------- |
| VR-A01  | Client-side validation: immediate feedback, but never trusted by the server.    |
| VR-A02  | Server-side validation: Jakarta Bean Validation on all request DTOs.            |
| VR-A03  | Business validation: service layer checks (e.g., "asset is available for allocation"). |
| VR-A04  | Database validation: constraints, foreign keys, unique indexes as last defense. |

---

## 7. Authentication Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    JWT Authentication Flow                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  LOGIN:                                                            │
│  Client ──POST /api/v1/auth/login──► AuthController                │
│                                        │                           │
│                                   AuthService                      │
│                                   .authenticate()                  │
│                                        │                           │
│                                   AuthenticationManager            │
│                                   .authenticate(                   │
│                                     UsernamePasswordAuthToken)     │
│                                        │                           │
│                                   CustomUserDetailsService         │
│                                   .loadUserByUsername()             │
│                                        │                           │
│                                   BCrypt.matches(password, hash)   │
│                                        │                           │
│                              ┌─────────▼──────────┐                │
│                              │ JwtTokenProvider    │                │
│                              │ .generateToken()    │                │
│                              │ .generateRefresh()  │                │
│                              └─────────┬──────────┘                │
│                                        │                           │
│  Client ◄── { accessToken, refreshToken, expiresIn } ──┘          │
│                                                                    │
│  SUBSEQUENT REQUESTS:                                              │
│  Client ──Header: Authorization: Bearer <token>──► Filter Chain    │
│                                                      │             │
│                                              JwtAuthFilter          │
│                                              .doFilterInternal()    │
│                                                      │             │
│                                              JwtTokenProvider       │
│                                              .validateToken()       │
│                                                      │             │
│                                              SecurityContext        │
│                                              .setAuthentication()   │
│                                                      │             │
│                                              Controller executes   │
│                                                                    │
│  TOKEN REFRESH:                                                    │
│  Client ──POST /api/v1/auth/refresh──► AuthController              │
│                                          │                         │
│                                     Validate refresh token         │
│                                     Generate new access token      │
│                                          │                         │
│  Client ◄── { accessToken, expiresIn } ──┘                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. Database Architecture

### 8.1 Entity Relationship Groups

```
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  AUTH GROUP    │     │  ORG GROUP      │     │  ASSET GROUP    │
│               │     │                 │     │                 │
│  users ◄──────┼─────┤  organizations  │     │  assets ◄───────┤
│  roles        │     │  departments    │     │  asset_categories│
│  permissions  │     │  locations      │     │  asset_subcats  │
│  user_roles   │     │  designations   │     │  asset_images   │
│  role_perms   │     │                 │     │  asset_documents│
│  refresh_tkns │     └────────┬────────┘     └────────┬────────┘
└───────┬───────┘              │                       │
        │                      │                       │
        │              ┌───────▼───────┐       ┌───────▼───────┐
        │              │  ALLOCATION   │       │  MAINTENANCE  │
        └──────────────┤  GROUP        │       │  GROUP        │
                       │               │       │               │
                       │  allocations  │       │  maint_reqs   │
                       │  alloc_history│       │  maint_scheds │
                       └───────────────┘       │  maint_logs   │
                                               │  vendors      │
                       ┌───────────────┐       └───────────────┘
                       │  BOOKING      │
                       │  GROUP        │       ┌───────────────┐
                       │               │       │  AUDIT GROUP  │
                       │  bookings     │       │               │
                       │  booking_slots│       │  audit_sessions│
                       └───────────────┘       │  audit_items  │
                                               │  audit_discrep│
                       ┌───────────────┐       └───────────────┘
                       │  SYSTEM GROUP │
                       │               │       ┌───────────────┐
                       │  audit_trail  │       │  REPORT GROUP │
                       │  sys_settings │       │               │
                       │  file_attach  │       │  report_configs│
                       │  notifications│       │  report_exports│
                       │  notif_prefs  │       └───────────────┘
                       └───────────────┘
```

### 8.2 Connection Pooling

| Property                     | Value  |
| ---------------------------- | ------ |
| Connection Pool              | HikariCP (Spring Boot default) |
| Maximum Pool Size            | 20     |
| Minimum Idle Connections     | 5      |
| Connection Timeout           | 30s    |
| Idle Timeout                 | 600s   |
| Max Lifetime                 | 1800s  |

---

## 9. REST API Architecture

### 9.1 API Conventions

| Convention                | Standard                                           |
| ------------------------- | -------------------------------------------------- |
| Base Path                 | `/api/v1`                                          |
| Naming                    | Plural nouns, kebab-case for multi-word resources   |
| Versioning                | URI path versioning (`/v1`, `/v2`)                 |
| Pagination                | Query params: `page`, `size`, `sort`, `direction`  |
| Filtering                 | Query params: field-specific (e.g., `?status=ACTIVE`) |
| Searching                 | Query param: `search` for full-text search         |
| Content Type              | `application/json` (requests and responses)        |
| Date Format               | ISO 8601 (`2026-07-12T10:00:00Z`)                  |
| ID Format                 | Auto-increment `BIGINT` (Long in Java)             |

### 9.2 Standard Response Wrappers

**Success Response:**

```
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-07-12T10:00:00Z"
}
```

**Paginated Response:**

```
{
  "success": true,
  "message": "Records retrieved",
  "data": {
    "content": [ ... ],
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 150,
    "totalPages": 8,
    "last": false
  },
  "timestamp": "2026-07-12T10:00:00Z"
}
```

**Error Response:**

```
{
  "success": false,
  "message": "Validation failed",
  "status": 400,
  "error": "Bad Request",
  "path": "/api/v1/assets",
  "errors": [
    { "field": "name", "rejectedValue": "", "message": "Name is required" }
  ],
  "timestamp": "2026-07-12T10:00:00Z"
}
```

---

## 10. Cross-Cutting Concerns

### 10.1 Logging

| Aspect     | Implementation                                             |
| ---------- | ---------------------------------------------------------- |
| Framework  | SLF4J + Logback                                            |
| Format     | Structured JSON in production, readable text in dev        |
| Levels     | DEBUG (dev), INFO (prod), WARN/ERROR (always)              |
| Correlation| MDC (Mapped Diagnostic Context) with request ID            |
| What to Log| Request entry/exit, service operations, exceptions, auth events |

### 10.2 Audit Trail

Every data mutation is logged to the `audit_trail` table:

| Column          | Description                          |
| --------------- | ------------------------------------ |
| entity_type     | Which entity was changed (e.g., "Asset") |
| entity_id       | The ID of the affected record        |
| action          | CREATE, UPDATE, DELETE               |
| old_value       | JSON snapshot of previous state      |
| new_value       | JSON snapshot of new state           |
| performed_by    | User ID who made the change          |
| performed_at    | Timestamp of the change              |

### 10.3 Error Handling

All exceptions are caught by `GlobalExceptionHandler` (`@ControllerAdvice`) and converted to the standard error response format.

| Exception Type                       | HTTP Status | Handling                           |
| ------------------------------------ | ----------- | ---------------------------------- |
| MethodArgumentNotValidException      | 400         | Collect all field errors           |
| ResourceNotFoundException            | 404         | Return "not found" message         |
| DuplicateResourceException           | 409         | Return conflict details            |
| InvalidOperationException            | 422         | Return business rule violation     |
| AccessDeniedException                | 403         | Return forbidden message           |
| AuthenticationException              | 401         | Return unauthorized message        |
| DataIntegrityViolationException      | 409         | Return constraint violation info   |
| Exception (catch-all)                | 500         | Log stack trace, return generic msg|

---

## 11. Security Architecture

### 11.1 Spring Security Filter Chain Order

```
HTTP Request
    │
    ▼
1. CorsFilter (Allow frontend origin)
    │
    ▼
2. JwtAuthenticationFilter (Extract + validate JWT)
    │
    ├── Token valid → Set SecurityContext → Continue
    │
    ├── Token missing → Continue without auth (public endpoints)
    │
    └── Token invalid → Continue without auth (will get 401 from endpoint security)
    │
    ▼
3. UsernamePasswordAuthenticationFilter (disabled for JWT)
    │
    ▼
4. ExceptionTranslationFilter
    │
    ├── AuthenticationException → JwtAuthenticationEntryPoint → 401
    │
    └── AccessDeniedException → JwtAccessDeniedHandler → 403
    │
    ▼
5. FilterSecurityInterceptor (URL-level authorization)
    │
    ▼
6. DispatcherServlet → Controller
```

### 11.2 Method-Level Security

```
@PreAuthorize("hasRole('ADMIN')") — on controller methods
@PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER')") — multi-role access
@PreAuthorize("hasAuthority('asset:write')") — permission-based
```

---

## 12. Deployment Architecture

### 12.1 Development Environment

```
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│  Vite Dev Server   │    │  Spring Boot       │    │  MySQL 8           │
│  (localhost:5173)  │───►│  (localhost:8080)   │───►│  (localhost:3306)  │
│                    │    │                    │    │                    │
│  Hot Module Reload │    │  Auto-restart      │    │  Schema: assetflow │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

### 12.2 Production Environment

```
┌────────────────────┐    ┌─────────────────────────────────────────┐
│                    │    │  Application Server                     │
│  Nginx             │    │  ┌────────────────────────────────────┐ │
│  (Reverse Proxy)   │    │  │  Spring Boot JAR                  │ │
│                    │───►│  │  (Embedded Tomcat, port 8080)     │ │
│  Serves React      │    │  │  Serves API: /api/v1/*            │ │
│  static build      │    │  └──────────────┬─────────────────────┘ │
│  /assets/*         │    │                 │                       │
│                    │    └─────────────────┼───────────────────────┘
└────────────────────┘                      │
                                            ▼
                              ┌────────────────────────┐
                              │  MySQL 8 Server        │
                              │  (Dedicated or RDS)    │
                              └────────────────────────┘
```

---

## 13. Future Improvements

| Priority | Improvement                                                       |
| -------- | ----------------------------------------------------------------- |
| High     | Add Redis for JWT blacklisting and caching                        |
| High     | Add WebSocket (STOMP) for real-time notifications                 |
| Medium   | Implement API Gateway (Spring Cloud Gateway) for microservices    |
| Medium   | Add message queue (RabbitMQ) for async notification processing    |
| Medium   | Containerize with Docker and orchestrate with Docker Compose      |
| Low      | Service mesh with Kubernetes for horizontal scaling               |
| Low      | GraphQL endpoint for complex dashboard queries                    |

---

## 14. Implementation Notes

1. **Monolith First**: The application starts as a modular monolith. Package structure is organized by feature (not by layer) to enable future microservice extraction.
2. **API-First**: All frontend-backend contracts are defined in API specification docs before implementation.
3. **Database Migration**: Use Flyway for all schema changes. Never use `ddl-auto: update` in production.
4. **Configuration**: Use Spring profiles (`dev`, `test`, `prod`) with `application-{profile}.yml` files.
5. **Transactions**: Service methods that modify multiple entities use `@Transactional`. Read-only methods use `@Transactional(readOnly = true)`.
6. **CORS**: Backend allows only `http://localhost:5173` in dev and the production frontend URL in prod.
7. **API Documentation**: SpringDoc OpenAPI generates Swagger UI at `/swagger-ui.html` and OpenAPI spec at `/v3/api-docs`.
