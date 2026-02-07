/**
 * Shared TypeScript types for the application
 */

// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PM = 'PM',
  QS = 'QS',
  SITE = 'SITE',
  VIEWER = 'VIEWER'
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData extends AuthCredentials {
  name: string
  role?: UserRole
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  token: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// Project Types
export interface Project {
  id: string
  projectNumber: string
  name: string
  description?: string
  status: ProjectStatus
  startDate: Date
  endDate: Date
  budget: number
  actualCost: number
  currency: string
  location?: string
  client?: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Risk Types
export interface Risk {
  id: string
  projectId: string
  riskNumber: string
  title: string
  description: string
  category: string
  probability: number // 1-5
  impact: number // 1-5
  score: number
  status: RiskStatus
  owner?: string
  mitigation?: string
  contingency?: string
  createdAt: Date
  updatedAt: Date
}

export enum RiskStatus {
  OPEN = 'OPEN',
  MITIGATED = 'MITIGATED',
  CLOSED = 'CLOSED',
  ACCEPTED = 'ACCEPTED'
}

// Task Types
export interface Task {
  id: string
  projectId: string
  sprintId?: string
  taskNumber: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  assignedToId?: string
  createdById: string
  estimatedHours?: number
  actualHours: number
  progress: number
  startDate?: Date
  endDate?: Date
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Permission Types
export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete'
}

export type RolePermissions = {
  [key in UserRole]: Permission[]
}
