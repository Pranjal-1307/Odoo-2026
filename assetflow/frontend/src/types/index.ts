// Enums
export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
export type AssetStatus = 'AVAILABLE' | 'ALLOCATED' | 'RESERVED' | 'UNDER_MAINTENANCE' | 'LOST' | 'RETIRED' | 'DISPOSED';
export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type AllocationStatus = 'ACTIVE' | 'RETURNED' | 'TRANSFERRED';
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type MaintenanceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type AuditCycleStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
export type AuditVerification = 'PENDING' | 'VERIFIED' | 'MISSING' | 'DAMAGED';

// Models
export interface User {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  departmentId?: string | null;
  department?: Department | null;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  parentId?: string | null;
  headId?: string | null;
  parent?: Department | null;
  children?: Department[];
  head?: User | null;
  employees?: User[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  warrantyPeriod?: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  customFields?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    assets?: number;
  };
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  serialNumber?: string | null;
  categoryId: string;
  departmentId?: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string | null;
  description?: string | null;
  acquisitionDate?: string | null;
  acquisitionCost?: number | string | null;
  bookable: boolean;
  photoUrl?: string | null;
  documentUrls?: any | null;
  qrCode?: string | null;
  createdById: string;
  category?: Category;
  department?: Department | null;
  createdBy?: User;
  allocations?: AssetAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetAllocation {
  id: string;
  assetId: string;
  allocatedToId: string;
  allocatedById: string;
  allocationDate: string;
  expectedReturn?: string | null;
  returnedDate?: string | null;
  returnCondition?: AssetCondition | null;
  returnNotes?: string | null;
  status: AllocationStatus;
  asset?: Asset;
  allocatedTo: User;
  allocatedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  fromUserId: string;
  toUserId: string;
  reason?: string | null;
  status: TransferStatus;
  requestedAt: string;
  approvedById?: string | null;
  resolvedAt?: string | null;
  asset: Asset;
  fromUser: User;
  toUser: User;
  approvedBy?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  assetId: string;
  bookedById: string;
  startTime: string;
  endTime: string;
  purpose?: string | null;
  status: BookingStatus;
  asset: Asset;
  bookedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: string;
  assetId: string;
  raisedById: string;
  priority: MaintenancePriority;
  issue: string;
  photoUrl?: string | null;
  status: MaintenanceStatus;
  approvedById?: string | null;
  technicianId?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  asset: Asset;
  raisedBy: User;
  approvedBy?: User | null;
  technician?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditCycle {
  id: string;
  title: string;
  departmentId?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
  status: AuditCycleStatus;
  createdById: string;
  closedAt?: string | null;
  department?: Department | null;
  createdBy: User;
  items?: AuditItem[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    items?: number;
  };
}

export interface AuditItem {
  id: string;
  auditCycleId: string;
  assetId: string;
  auditorId: string;
  verification: AuditVerification;
  remarks?: string | null;
  verifiedAt?: string | null;
  auditCycle?: AuditCycle;
  asset: Asset;
  auditor: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  refId?: string | null;
  refType?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any | null;
  ipAddress?: string | null;
  user?: User;
  createdAt: string;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Dashboard
export interface DashboardKPIs {
  assetsAvailable: number;
  assetsAllocated: number;
  assetsUnderMaintenance: number;
  maintenanceToday: number;
  activeBookings: number;
  upcomingBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueReturns: number;
  totalAssets: number;
  totalEmployees: number;
  pendingMaintenanceRequests: number;
}
