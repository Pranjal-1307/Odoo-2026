# 02 — Folder Structure: AssetFlow ERP (Odoo-2026)

---

## 1. Purpose

This document defines the complete folder structure for both the frontend (React/Vite) and backend (Spring Boot) applications. Every directory and its purpose is documented so that an implementing AI can create the exact file tree without ambiguity.

---

## 2. Root Directory

```
Odoo-2026/
├── .gitignore
├── README.md
├── docs/                           # Documentation (this folder)
├── backend/                        # Spring Boot Java Application
├── frontend/                       # React Vite Application
└── database/                       # Database scripts and migrations
```

---

## 3. Backend Folder Structure

```
backend/
├── pom.xml                                          # Maven project configuration
├── mvnw                                             # Maven wrapper (Unix)
├── mvnw.cmd                                         # Maven wrapper (Windows)
├── .mvn/
│   └── wrapper/
│       └── maven-wrapper.properties
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── assetflow/
│   │   │           ├── AssetFlowApplication.java            # @SpringBootApplication main class
│   │   │           │
│   │   │           ├── config/                              # Configuration classes
│   │   │           │   ├── AppConfig.java                   # General app configuration beans
│   │   │           │   ├── CorsConfig.java                  # CORS configuration
│   │   │           │   ├── SecurityConfig.java              # Spring Security configuration
│   │   │           │   ├── JwtConfig.java                   # JWT properties & beans
│   │   │           │   ├── SwaggerConfig.java               # OpenAPI/Swagger configuration
│   │   │           │   ├── WebConfig.java                   # Web MVC configuration
│   │   │           │   └── AuditConfig.java                 # JPA Auditing configuration
│   │   │           │
│   │   │           ├── security/                            # Security components
│   │   │           │   ├── JwtTokenProvider.java            # JWT generation & validation
│   │   │           │   ├── JwtAuthenticationFilter.java     # OncePerRequestFilter for JWT
│   │   │           │   ├── JwtAuthenticationEntryPoint.java # Handles 401 responses
│   │   │           │   ├── JwtAccessDeniedHandler.java      # Handles 403 responses
│   │   │           │   └── CustomUserDetailsService.java    # UserDetailsService implementation
│   │   │           │
│   │   │           ├── controller/                          # REST Controllers
│   │   │           │   ├── AuthController.java              # /api/v1/auth
│   │   │           │   ├── UserController.java              # /api/v1/users
│   │   │           │   ├── OrganizationController.java      # /api/v1/organizations
│   │   │           │   ├── DepartmentController.java        # /api/v1/departments
│   │   │           │   ├── LocationController.java          # /api/v1/locations
│   │   │           │   ├── DesignationController.java       # /api/v1/designations
│   │   │           │   ├── AssetController.java             # /api/v1/assets
│   │   │           │   ├── AssetCategoryController.java     # /api/v1/categories
│   │   │           │   ├── AllocationController.java        # /api/v1/allocations
│   │   │           │   ├── BookingController.java           # /api/v1/bookings
│   │   │           │   ├── MaintenanceController.java       # /api/v1/maintenance
│   │   │           │   ├── AuditController.java             # /api/v1/audits
│   │   │           │   ├── ReportController.java            # /api/v1/reports
│   │   │           │   ├── NotificationController.java      # /api/v1/notifications
│   │   │           │   └── DashboardController.java         # /api/v1/dashboard
│   │   │           │
│   │   │           ├── service/                             # Business Logic Services
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── UserService.java
│   │   │           │   ├── OrganizationService.java
│   │   │           │   ├── DepartmentService.java
│   │   │           │   ├── LocationService.java
│   │   │           │   ├── DesignationService.java
│   │   │           │   ├── AssetService.java
│   │   │           │   ├── AssetCategoryService.java
│   │   │           │   ├── AllocationService.java
│   │   │           │   ├── BookingService.java
│   │   │           │   ├── MaintenanceService.java
│   │   │           │   ├── AuditService.java
│   │   │           │   ├── ReportService.java
│   │   │           │   ├── NotificationService.java
│   │   │           │   ├── DashboardService.java
│   │   │           │   ├── FileStorageService.java
│   │   │           │   ├── EmailService.java
│   │   │           │   └── AuditTrailService.java
│   │   │           │
│   │   │           ├── service/impl/                        # Service Implementations
│   │   │           │   ├── AuthServiceImpl.java
│   │   │           │   ├── UserServiceImpl.java
│   │   │           │   ├── OrganizationServiceImpl.java
│   │   │           │   ├── DepartmentServiceImpl.java
│   │   │           │   ├── LocationServiceImpl.java
│   │   │           │   ├── DesignationServiceImpl.java
│   │   │           │   ├── AssetServiceImpl.java
│   │   │           │   ├── AssetCategoryServiceImpl.java
│   │   │           │   ├── AllocationServiceImpl.java
│   │   │           │   ├── BookingServiceImpl.java
│   │   │           │   ├── MaintenanceServiceImpl.java
│   │   │           │   ├── AuditServiceImpl.java
│   │   │           │   ├── ReportServiceImpl.java
│   │   │           │   ├── NotificationServiceImpl.java
│   │   │           │   ├── DashboardServiceImpl.java
│   │   │           │   ├── FileStorageServiceImpl.java
│   │   │           │   ├── EmailServiceImpl.java
│   │   │           │   └── AuditTrailServiceImpl.java
│   │   │           │
│   │   │           ├── repository/                          # JPA Repositories
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── RoleRepository.java
│   │   │           │   ├── PermissionRepository.java
│   │   │           │   ├── RefreshTokenRepository.java
│   │   │           │   ├── OrganizationRepository.java
│   │   │           │   ├── DepartmentRepository.java
│   │   │           │   ├── LocationRepository.java
│   │   │           │   ├── DesignationRepository.java
│   │   │           │   ├── AssetRepository.java
│   │   │           │   ├── AssetCategoryRepository.java
│   │   │           │   ├── AssetSubcategoryRepository.java
│   │   │           │   ├── AssetImageRepository.java
│   │   │           │   ├── AssetDocumentRepository.java
│   │   │           │   ├── AllocationRepository.java
│   │   │           │   ├── AllocationHistoryRepository.java
│   │   │           │   ├── BookingRepository.java
│   │   │           │   ├── BookingSlotRepository.java
│   │   │           │   ├── MaintenanceRequestRepository.java
│   │   │           │   ├── MaintenanceScheduleRepository.java
│   │   │           │   ├── MaintenanceLogRepository.java
│   │   │           │   ├── VendorRepository.java
│   │   │           │   ├── AuditSessionRepository.java
│   │   │           │   ├── AuditItemRepository.java
│   │   │           │   ├── AuditDiscrepancyRepository.java
│   │   │           │   ├── ReportConfigRepository.java
│   │   │           │   ├── ReportExportRepository.java
│   │   │           │   ├── NotificationRepository.java
│   │   │           │   ├── NotificationPreferenceRepository.java
│   │   │           │   ├── AuditTrailRepository.java
│   │   │           │   ├── SystemSettingRepository.java
│   │   │           │   └── FileAttachmentRepository.java
│   │   │           │
│   │   │           ├── entity/                              # JPA Entities
│   │   │           │   ├── BaseEntity.java                  # Abstract auditable base entity
│   │   │           │   ├── User.java
│   │   │           │   ├── Role.java
│   │   │           │   ├── Permission.java
│   │   │           │   ├── RefreshToken.java
│   │   │           │   ├── Organization.java
│   │   │           │   ├── Department.java
│   │   │           │   ├── Location.java
│   │   │           │   ├── Designation.java
│   │   │           │   ├── Asset.java
│   │   │           │   ├── AssetCategory.java
│   │   │           │   ├── AssetSubcategory.java
│   │   │           │   ├── AssetImage.java
│   │   │           │   ├── AssetDocument.java
│   │   │           │   ├── Allocation.java
│   │   │           │   ├── AllocationHistory.java
│   │   │           │   ├── Booking.java
│   │   │           │   ├── BookingSlot.java
│   │   │           │   ├── MaintenanceRequest.java
│   │   │           │   ├── MaintenanceSchedule.java
│   │   │           │   ├── MaintenanceLog.java
│   │   │           │   ├── Vendor.java
│   │   │           │   ├── AuditSession.java
│   │   │           │   ├── AuditItem.java
│   │   │           │   ├── AuditDiscrepancy.java
│   │   │           │   ├── ReportConfig.java
│   │   │           │   ├── ReportExport.java
│   │   │           │   ├── Notification.java
│   │   │           │   ├── NotificationPreference.java
│   │   │           │   ├── AuditTrail.java
│   │   │           │   ├── SystemSetting.java
│   │   │           │   └── FileAttachment.java
│   │   │           │
│   │   │           ├── dto/                                 # Data Transfer Objects
│   │   │           │   ├── request/                         # Request DTOs
│   │   │           │   │   ├── LoginRequest.java
│   │   │           │   │   ├── RegisterRequest.java
│   │   │           │   │   ├── RefreshTokenRequest.java
│   │   │           │   │   ├── ChangePasswordRequest.java
│   │   │           │   │   ├── UserRequest.java
│   │   │           │   │   ├── OrganizationRequest.java
│   │   │           │   │   ├── DepartmentRequest.java
│   │   │           │   │   ├── LocationRequest.java
│   │   │           │   │   ├── DesignationRequest.java
│   │   │           │   │   ├── AssetRequest.java
│   │   │           │   │   ├── AssetCategoryRequest.java
│   │   │           │   │   ├── AllocationRequest.java
│   │   │           │   │   ├── BookingRequest.java
│   │   │           │   │   ├── MaintenanceRequest.java      # (the DTO, not the entity)
│   │   │           │   │   ├── AuditSessionRequest.java
│   │   │           │   │   ├── ReportRequest.java
│   │   │           │   │   └── NotificationPreferenceRequest.java
│   │   │           │   │
│   │   │           │   └── response/                        # Response DTOs
│   │   │           │       ├── LoginResponse.java
│   │   │           │       ├── ApiResponse.java             # Generic wrapper
│   │   │           │       ├── PagedResponse.java           # Paginated wrapper
│   │   │           │       ├── ErrorResponse.java           # Error wrapper
│   │   │           │       ├── UserResponse.java
│   │   │           │       ├── OrganizationResponse.java
│   │   │           │       ├── DepartmentResponse.java
│   │   │           │       ├── LocationResponse.java
│   │   │           │       ├── DesignationResponse.java
│   │   │           │       ├── AssetResponse.java
│   │   │           │       ├── AssetDetailResponse.java
│   │   │           │       ├── AssetCategoryResponse.java
│   │   │           │       ├── AllocationResponse.java
│   │   │           │       ├── BookingResponse.java
│   │   │           │       ├── MaintenanceResponse.java
│   │   │           │       ├── AuditSessionResponse.java
│   │   │           │       ├── AuditItemResponse.java
│   │   │           │       ├── ReportResponse.java
│   │   │           │       ├── NotificationResponse.java
│   │   │           │       ├── DashboardResponse.java
│   │   │           │       └── DashboardStatsResponse.java
│   │   │           │
│   │   │           ├── mapper/                              # MapStruct Mappers
│   │   │           │   ├── UserMapper.java
│   │   │           │   ├── OrganizationMapper.java
│   │   │           │   ├── DepartmentMapper.java
│   │   │           │   ├── LocationMapper.java
│   │   │           │   ├── AssetMapper.java
│   │   │           │   ├── AllocationMapper.java
│   │   │           │   ├── BookingMapper.java
│   │   │           │   ├── MaintenanceMapper.java
│   │   │           │   ├── AuditMapper.java
│   │   │           │   ├── ReportMapper.java
│   │   │           │   └── NotificationMapper.java
│   │   │           │
│   │   │           ├── enums/                               # Enum Definitions
│   │   │           │   ├── AssetStatus.java                 # AVAILABLE, ALLOCATED, UNDER_MAINTENANCE, DISPOSED, LOST
│   │   │           │   ├── AssetCondition.java              # NEW, GOOD, FAIR, POOR, DAMAGED
│   │   │           │   ├── AllocationType.java              # PERMANENT, TEMPORARY, PROJECT_BASED
│   │   │           │   ├── AllocationStatus.java            # ACTIVE, RETURNED, OVERDUE
│   │   │           │   ├── BookingStatus.java               # PENDING, CONFIRMED, CANCELLED, COMPLETED
│   │   │           │   ├── MaintenanceType.java             # PREVENTIVE, CORRECTIVE, EMERGENCY
│   │   │           │   ├── MaintenancePriority.java         # LOW, MEDIUM, HIGH, CRITICAL
│   │   │           │   ├── MaintenanceStatus.java           # REQUESTED, APPROVED, IN_PROGRESS, COMPLETED, CANCELLED
│   │   │           │   ├── AuditStatus.java                 # PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
│   │   │           │   ├── DiscrepancyType.java             # MISSING, DAMAGED, LOCATION_MISMATCH, EXCESS
│   │   │           │   ├── NotificationType.java            # ALLOCATION, BOOKING, MAINTENANCE, AUDIT, SYSTEM
│   │   │           │   ├── NotificationPriority.java        # LOW, MEDIUM, HIGH
│   │   │           │   ├── ReportType.java                  # ASSET_SUMMARY, ALLOCATION, MAINTENANCE, AUDIT, FINANCIAL
│   │   │           │   ├── ReportFormat.java                # PDF, CSV, EXCEL
│   │   │           │   └── UserStatus.java                  # ACTIVE, INACTIVE, SUSPENDED
│   │   │           │
│   │   │           ├── exception/                           # Custom Exceptions
│   │   │           │   ├── GlobalExceptionHandler.java      # @ControllerAdvice
│   │   │           │   ├── ResourceNotFoundException.java
│   │   │           │   ├── DuplicateResourceException.java
│   │   │           │   ├── InvalidOperationException.java
│   │   │           │   ├── UnauthorizedException.java
│   │   │           │   ├── ForbiddenException.java
│   │   │           │   ├── BadRequestException.java
│   │   │           │   ├── FileStorageException.java
│   │   │           │   └── BusinessRuleViolationException.java
│   │   │           │
│   │   │           ├── util/                                # Utility Classes
│   │   │           │   ├── DateUtils.java
│   │   │           │   ├── AssetCodeGenerator.java
│   │   │           │   ├── FileUtils.java
│   │   │           │   ├── ReportUtils.java
│   │   │           │   └── ValidationUtils.java
│   │   │           │
│   │   │           └── specification/                       # JPA Specifications (Dynamic Queries)
│   │   │               ├── AssetSpecification.java
│   │   │               ├── AllocationSpecification.java
│   │   │               ├── BookingSpecification.java
│   │   │               ├── MaintenanceSpecification.java
│   │   │               └── AuditSpecification.java
│   │   │
│   │   └── resources/
│   │       ├── application.yml                              # Default configuration
│   │       ├── application-dev.yml                          # Development profile
│   │       ├── application-prod.yml                         # Production profile
│   │       ├── application-test.yml                         # Test profile
│   │       ├── db/
│   │       │   └── migration/                               # Flyway migrations
│   │       │       ├── V1__create_users_and_roles.sql
│   │       │       ├── V2__create_organization_tables.sql
│   │       │       ├── V3__create_asset_tables.sql
│   │       │       ├── V4__create_allocation_tables.sql
│   │       │       ├── V5__create_booking_tables.sql
│   │       │       ├── V6__create_maintenance_tables.sql
│   │       │       ├── V7__create_audit_tables.sql
│   │       │       ├── V8__create_report_tables.sql
│   │       │       ├── V9__create_notification_tables.sql
│   │       │       ├── V10__create_system_tables.sql
│   │       │       └── V11__seed_initial_data.sql
│   │       ├── templates/
│   │       │   └── email/                                   # Email templates
│   │       │       ├── welcome.html
│   │       │       ├── password-reset.html
│   │       │       ├── allocation-notification.html
│   │       │       └── maintenance-alert.html
│   │       └── static/                                      # Static resources (if any)
│   │
│   └── test/
│       └── java/
│           └── com/
│               └── assetflow/
│                   ├── controller/                          # Controller tests
│                   ├── service/                             # Service unit tests
│                   ├── repository/                          # Repository integration tests
│                   └── security/                            # Security tests
```

---

## 4. Frontend Folder Structure

```
frontend/
├── index.html                                    # HTML entry point
├── package.json                                  # npm dependencies
├── package-lock.json
├── vite.config.js                                # Vite configuration
├── .env                                          # Environment variables (dev)
├── .env.production                               # Environment variables (prod)
├── .eslintrc.cjs                                 # ESLint configuration
├── .prettierrc                                   # Prettier configuration
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json
│
└── src/
    ├── main.jsx                                  # React entry point
    ├── App.jsx                                   # Root component with Router
    ├── App.css                                   # Global styles
    ├── index.css                                 # CSS reset and base styles
    │
    ├── assets/                                   # Static assets
    │   ├── images/
    │   │   ├── logo.png
    │   │   ├── login-bg.jpg
    │   │   └── empty-state.svg
    │   └── fonts/                                # Custom fonts (if any)
    │
    ├── config/                                   # App configuration
    │   ├── api.config.js                         # Base URL, timeout settings
    │   ├── routes.config.js                      # Route path constants
    │   └── constants.js                          # App-wide constants
    │
    ├── context/                                  # React Context providers
    │   ├── AuthContext.jsx                       # Authentication state
    │   ├── ThemeContext.jsx                      # Theme (light/dark) state
    │   ├── NotificationContext.jsx               # Notification state
    │   └── SidebarContext.jsx                    # Sidebar collapsed state
    │
    ├── hooks/                                    # Custom React hooks
    │   ├── useAuth.js                            # Auth context consumer hook
    │   ├── useApi.js                             # Generic API call hook
    │   ├── useDebounce.js                        # Debounce hook for search
    │   ├── usePagination.js                      # Pagination logic hook
    │   ├── useForm.js                            # Form state management
    │   └── usePermission.js                      # Permission check hook
    │
    ├── services/                                 # API service layer (Axios calls)
    │   ├── api.js                                # Axios instance with interceptors
    │   ├── auth.service.js                       # Login, register, refresh
    │   ├── user.service.js
    │   ├── organization.service.js
    │   ├── department.service.js
    │   ├── location.service.js
    │   ├── asset.service.js
    │   ├── category.service.js
    │   ├── allocation.service.js
    │   ├── booking.service.js
    │   ├── maintenance.service.js
    │   ├── audit.service.js
    │   ├── report.service.js
    │   ├── notification.service.js
    │   └── dashboard.service.js
    │
    ├── utils/                                    # Utility functions
    │   ├── formatters.js                         # Date, currency, number formatting
    │   ├── validators.js                         # Form validation functions
    │   ├── helpers.js                            # Miscellaneous helpers
    │   └── storage.js                            # localStorage wrapper
    │
    ├── components/                               # Reusable UI components
    │   ├── common/                               # Shared/generic components
    │   │   ├── Button/
    │   │   │   ├── Button.jsx
    │   │   │   └── Button.css
    │   │   ├── Input/
    │   │   │   ├── Input.jsx
    │   │   │   └── Input.css
    │   │   ├── Select/
    │   │   │   ├── Select.jsx
    │   │   │   └── Select.css
    │   │   ├── TextArea/
    │   │   │   ├── TextArea.jsx
    │   │   │   └── TextArea.css
    │   │   ├── Modal/
    │   │   │   ├── Modal.jsx
    │   │   │   └── Modal.css
    │   │   ├── Table/
    │   │   │   ├── DataTable.jsx
    │   │   │   └── DataTable.css
    │   │   ├── Card/
    │   │   │   ├── Card.jsx
    │   │   │   └── Card.css
    │   │   ├── Badge/
    │   │   │   ├── Badge.jsx
    │   │   │   └── Badge.css
    │   │   ├── Loader/
    │   │   │   ├── Loader.jsx
    │   │   │   └── Loader.css
    │   │   ├── Pagination/
    │   │   │   ├── Pagination.jsx
    │   │   │   └── Pagination.css
    │   │   ├── SearchBar/
    │   │   │   ├── SearchBar.jsx
    │   │   │   └── SearchBar.css
    │   │   ├── Toast/
    │   │   │   ├── Toast.jsx
    │   │   │   └── Toast.css
    │   │   ├── EmptyState/
    │   │   │   ├── EmptyState.jsx
    │   │   │   └── EmptyState.css
    │   │   ├── ConfirmDialog/
    │   │   │   ├── ConfirmDialog.jsx
    │   │   │   └── ConfirmDialog.css
    │   │   ├── FileUpload/
    │   │   │   ├── FileUpload.jsx
    │   │   │   └── FileUpload.css
    │   │   ├── DatePicker/
    │   │   │   ├── DatePicker.jsx
    │   │   │   └── DatePicker.css
    │   │   ├── StatusBadge/
    │   │   │   ├── StatusBadge.jsx
    │   │   │   └── StatusBadge.css
    │   │   ├── Avatar/
    │   │   │   ├── Avatar.jsx
    │   │   │   └── Avatar.css
    │   │   ├── Breadcrumb/
    │   │   │   ├── Breadcrumb.jsx
    │   │   │   └── Breadcrumb.css
    │   │   └── Chart/
    │   │       ├── BarChart.jsx
    │   │       ├── PieChart.jsx
    │   │       ├── LineChart.jsx
    │   │       └── Chart.css
    │   │
    │   └── layout/                               # Layout components
    │       ├── Navbar/
    │       │   ├── Navbar.jsx
    │       │   └── Navbar.css
    │       ├── Sidebar/
    │       │   ├── Sidebar.jsx
    │       │   └── Sidebar.css
    │       ├── Footer/
    │       │   ├── Footer.jsx
    │       │   └── Footer.css
    │       ├── MainLayout/
    │       │   ├── MainLayout.jsx
    │       │   └── MainLayout.css
    │       └── AuthLayout/
    │           ├── AuthLayout.jsx
    │           └── AuthLayout.css
    │
    ├── pages/                                    # Page-level components
    │   ├── auth/
    │   │   ├── LoginPage/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── LoginPage.css
    │   │   ├── RegisterPage/
    │   │   │   ├── RegisterPage.jsx
    │   │   │   └── RegisterPage.css
    │   │   ├── ForgotPasswordPage/
    │   │   │   ├── ForgotPasswordPage.jsx
    │   │   │   └── ForgotPasswordPage.css
    │   │   └── ResetPasswordPage/
    │   │       ├── ResetPasswordPage.jsx
    │   │       └── ResetPasswordPage.css
    │   │
    │   ├── dashboard/
    │   │   ├── DashboardPage/
    │   │   │   ├── DashboardPage.jsx
    │   │   │   └── DashboardPage.css
    │   │   └── components/
    │   │       ├── StatsCard.jsx
    │   │       ├── AssetDistributionChart.jsx
    │   │       ├── RecentActivities.jsx
    │   │       ├── MaintenanceOverview.jsx
    │   │       ├── AllocationTrends.jsx
    │   │       └── QuickActions.jsx
    │   │
    │   ├── organization/
    │   │   ├── OrganizationListPage/
    │   │   │   ├── OrganizationListPage.jsx
    │   │   │   └── OrganizationListPage.css
    │   │   ├── OrganizationFormPage/
    │   │   │   ├── OrganizationFormPage.jsx
    │   │   │   └── OrganizationFormPage.css
    │   │   ├── DepartmentListPage/
    │   │   │   ├── DepartmentListPage.jsx
    │   │   │   └── DepartmentListPage.css
    │   │   ├── DepartmentFormPage/
    │   │   │   ├── DepartmentFormPage.jsx
    │   │   │   └── DepartmentFormPage.css
    │   │   ├── LocationListPage/
    │   │   │   ├── LocationListPage.jsx
    │   │   │   └── LocationListPage.css
    │   │   ├── LocationFormPage/
    │   │   │   ├── LocationFormPage.jsx
    │   │   │   └── LocationFormPage.css
    │   │   └── DesignationPage/
    │   │       ├── DesignationPage.jsx
    │   │       └── DesignationPage.css
    │   │
    │   ├── assets/
    │   │   ├── AssetListPage/
    │   │   │   ├── AssetListPage.jsx
    │   │   │   └── AssetListPage.css
    │   │   ├── AssetFormPage/
    │   │   │   ├── AssetFormPage.jsx
    │   │   │   └── AssetFormPage.css
    │   │   ├── AssetDetailPage/
    │   │   │   ├── AssetDetailPage.jsx
    │   │   │   └── AssetDetailPage.css
    │   │   ├── AssetCategoryPage/
    │   │   │   ├── AssetCategoryPage.jsx
    │   │   │   └── AssetCategoryPage.css
    │   │   └── components/
    │   │       ├── AssetCard.jsx
    │   │       ├── AssetFilters.jsx
    │   │       ├── AssetTimeline.jsx
    │   │       └── AssetImageGallery.jsx
    │   │
    │   ├── allocations/
    │   │   ├── AllocationListPage/
    │   │   │   ├── AllocationListPage.jsx
    │   │   │   └── AllocationListPage.css
    │   │   ├── AllocationFormPage/
    │   │   │   ├── AllocationFormPage.jsx
    │   │   │   └── AllocationFormPage.css
    │   │   ├── AllocationDetailPage/
    │   │   │   ├── AllocationDetailPage.jsx
    │   │   │   └── AllocationDetailPage.css
    │   │   └── components/
    │   │       ├── AllocationTimeline.jsx
    │   │       └── ReturnForm.jsx
    │   │
    │   ├── bookings/
    │   │   ├── BookingListPage/
    │   │   │   ├── BookingListPage.jsx
    │   │   │   └── BookingListPage.css
    │   │   ├── BookingFormPage/
    │   │   │   ├── BookingFormPage.jsx
    │   │   │   └── BookingFormPage.css
    │   │   ├── BookingCalendarPage/
    │   │   │   ├── BookingCalendarPage.jsx
    │   │   │   └── BookingCalendarPage.css
    │   │   └── components/
    │   │       ├── TimeSlotPicker.jsx
    │   │       ├── BookingCard.jsx
    │   │       └── CalendarView.jsx
    │   │
    │   ├── maintenance/
    │   │   ├── MaintenanceListPage/
    │   │   │   ├── MaintenanceListPage.jsx
    │   │   │   └── MaintenanceListPage.css
    │   │   ├── MaintenanceFormPage/
    │   │   │   ├── MaintenanceFormPage.jsx
    │   │   │   └── MaintenanceFormPage.css
    │   │   ├── MaintenanceDetailPage/
    │   │   │   ├── MaintenanceDetailPage.jsx
    │   │   │   └── MaintenanceDetailPage.css
    │   │   ├── MaintenanceSchedulePage/
    │   │   │   ├── MaintenanceSchedulePage.jsx
    │   │   │   └── MaintenanceSchedulePage.css
    │   │   └── components/
    │   │       ├── MaintenanceTimeline.jsx
    │   │       └── VendorSelect.jsx
    │   │
    │   ├── audit/
    │   │   ├── AuditListPage/
    │   │   │   ├── AuditListPage.jsx
    │   │   │   └── AuditListPage.css
    │   │   ├── AuditFormPage/
    │   │   │   ├── AuditFormPage.jsx
    │   │   │   └── AuditFormPage.css
    │   │   ├── AuditExecutionPage/
    │   │   │   ├── AuditExecutionPage.jsx
    │   │   │   └── AuditExecutionPage.css
    │   │   ├── AuditReportPage/
    │   │   │   ├── AuditReportPage.jsx
    │   │   │   └── AuditReportPage.css
    │   │   └── components/
    │   │       ├── AuditChecklist.jsx
    │   │       └── DiscrepancyForm.jsx
    │   │
    │   ├── reports/
    │   │   ├── ReportDashboardPage/
    │   │   │   ├── ReportDashboardPage.jsx
    │   │   │   └── ReportDashboardPage.css
    │   │   ├── ReportGeneratorPage/
    │   │   │   ├── ReportGeneratorPage.jsx
    │   │   │   └── ReportGeneratorPage.css
    │   │   └── components/
    │   │       ├── ReportFilters.jsx
    │   │       ├── ReportPreview.jsx
    │   │       └── ExportButton.jsx
    │   │
    │   ├── notifications/
    │   │   ├── NotificationListPage/
    │   │   │   ├── NotificationListPage.jsx
    │   │   │   └── NotificationListPage.css
    │   │   └── components/
    │   │       ├── NotificationItem.jsx
    │   │       └── NotificationPreferences.jsx
    │   │
    │   ├── settings/
    │   │   ├── ProfilePage/
    │   │   │   ├── ProfilePage.jsx
    │   │   │   └── ProfilePage.css
    │   │   ├── UserManagementPage/
    │   │   │   ├── UserManagementPage.jsx
    │   │   │   └── UserManagementPage.css
    │   │   └── SystemSettingsPage/
    │   │       ├── SystemSettingsPage.jsx
    │   │       └── SystemSettingsPage.css
    │   │
    │   └── errors/
    │       ├── NotFoundPage/
    │       │   ├── NotFoundPage.jsx
    │       │   └── NotFoundPage.css
    │       ├── ForbiddenPage/
    │       │   ├── ForbiddenPage.jsx
    │       │   └── ForbiddenPage.css
    │       └── ServerErrorPage/
    │           ├── ServerErrorPage.jsx
    │           └── ServerErrorPage.css
    │
    └── routes/
        ├── AppRoutes.jsx                         # Route definitions
        ├── PrivateRoute.jsx                      # Auth-guarded route wrapper
        └── RoleRoute.jsx                         # Role-guarded route wrapper
```

---

## 5. Database Folder Structure

```
database/
├── schema/
│   ├── 01-create-database.sql
│   ├── 02-users-and-roles.sql
│   ├── 03-organization.sql
│   ├── 04-assets.sql
│   ├── 05-allocations.sql
│   ├── 06-bookings.sql
│   ├── 07-maintenance.sql
│   ├── 08-audit.sql
│   ├── 09-reports.sql
│   ├── 10-notifications.sql
│   └── 11-system.sql
├── seed/
│   ├── seed-roles.sql
│   ├── seed-permissions.sql
│   ├── seed-admin-user.sql
│   └── seed-sample-data.sql
└── indexes/
    └── create-indexes.sql
```

---

## 6. Implementation Notes

1. **Component Co-location**: Each React component has its own CSS file co-located in the same directory. This keeps styles scoped and maintainable.
2. **Service Pattern**: The `services/` directory contains one file per API module. Each service file exports functions that call Axios methods. Components never call Axios directly.
3. **Context Pattern**: Context providers wrap the entire app in `App.jsx`. Custom hooks in `hooks/` consume these contexts.
4. **Entity-DTO Separation**: Backend entities are never directly exposed in API responses. MapStruct mappers convert between entities and DTOs.
5. **Interface-Implementation Split**: All backend services are defined as interfaces in `service/` and implemented in `service/impl/`. This enables mocking in tests and future swap-ability.
6. **Specification Pattern**: JPA Specifications in `specification/` enable complex, dynamic filtering queries without writing raw SQL.
7. **Migration Ordering**: Flyway migration files are prefixed with `V{n}__` for ordered execution. Never modify an existing migration; always create a new one.
