/**
 * Input validation utilities using Zod
 */

import { z } from 'zod'
import { UserRole, ProjectStatus, TaskStatus, Priority } from './types'

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole).optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

// Project validation schemas
export const createProjectSchema = z.object({
  projectNumber: z.string().min(1, 'Project number is required'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  budget: z.number().positive('Budget must be positive'),
  currency: z.string().default('GBP'),
  location: z.string().optional(),
  client: z.string().optional()
})

export const updateProjectSchema = createProjectSchema.partial()

// Risk validation schemas
export const createRiskSchema = z.object({
  projectId: z.string().cuid(),
  riskNumber: z.string().min(1, 'Risk number is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  probability: z.number().int().min(1).max(5, 'Probability must be between 1 and 5'),
  impact: z.number().int().min(1).max(5, 'Impact must be between 1 and 5'),
  owner: z.string().optional(),
  mitigation: z.string().optional(),
  contingency: z.string().optional()
})

export const updateRiskSchema = createRiskSchema.partial()

// Task validation schemas
export const createTaskSchema = z.object({
  projectId: z.string().cuid(),
  sprintId: z.string().cuid().optional(),
  milestoneId: z.string().cuid().optional(),
  changeOrderId: z.string().cuid().optional(),
  taskNumber: z.string().min(1, 'Task number is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedToId: z.string().cuid().optional(),
  estimatedHours: z.number().positive().optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  baselineStartDate: z.string().datetime().or(z.date()).optional(),
  baselineEndDate: z.string().datetime().or(z.date()).optional(),
  isCriticalPath: z.boolean().optional(),
  dependencies: z.array(z.string()).optional()
})

export const updateTaskSchema = createTaskSchema.partial()

// ChangeOrder validation schemas
export const createChangeOrderSchema = z.object({
  projectId: z.string().cuid(),
  changeNumber: z.string().min(1, 'Change number is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  scopeImpact: z.string().optional(),
  costImpact: z.number().default(0),
  timeImpact: z.number().int().default(0),
  taskIds: z.array(z.string().cuid()).optional(),
  budgetLineIds: z.array(z.string().cuid()).optional()
})

export const updateChangeOrderSchema = createChangeOrderSchema.partial()

// Change order status update schema
export const updateChangeOrderStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED']),
  approvedBy: z.string().optional(),
  approvedDate: z.string().datetime().or(z.date()).optional(),
  submittedDate: z.string().datetime().or(z.date()).optional(),
  implementedDate: z.string().datetime().or(z.date()).optional()
})

// Sprint validation schemas
export const createSprintSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  goal: z.string().optional(),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date())
})

export const updateSprintSchema = createSprintSchema.partial()

// Milestone validation schemas
export const createMilestoneSchema = z.object({
  projectId: z.string().cuid(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().datetime().or(z.date()),
  baselineDueDate: z.string().datetime().or(z.date()).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']).optional(),
  owner: z.string().optional()
})

export const updateMilestoneSchema = createMilestoneSchema.partial()

// Resource validation schemas
export const createResourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['LABOR', 'EQUIPMENT', 'MATERIAL', 'CONTRACTOR']),
  description: z.string().optional(),
  costPerHour: z.number().positive().optional(),
  availability: z.string().optional(),
  skills: z.array(z.string()).optional(),
  standardRate: z.number().positive().optional(),
  overtimeRate: z.number().positive().optional(),
  weekendRate: z.number().positive().optional(),
  currency: z.string().default('GBP'),
  maxHoursPerDay: z.number().positive().default(8),
  maxHoursPerWeek: z.number().positive().default(40)
})

export const updateResourceSchema = createResourceSchema.partial()

// ResourceAllocation validation schemas
export const createResourceAllocationSchema = z.object({
  projectId: z.string().cuid(),
  userId: z.string().cuid(),
  resourceId: z.string().cuid().optional(),
  resourceType: z.string().min(1, 'Resource type is required'),
  allocatedHours: z.number().positive('Allocated hours must be positive'),
  utilization: z.number().min(0).max(100).default(0),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date())
})

export const updateResourceAllocationSchema = createResourceAllocationSchema.partial()

// ResourceAvailability validation schemas
export const createResourceAvailabilitySchema = z.object({
  resourceId: z.string().cuid(),
  date: z.string().datetime().or(z.date()),
  isAvailable: z.boolean().default(true),
  availableHours: z.number().min(0).max(24).default(8),
  reason: z.string().optional(),
  notes: z.string().optional()
})

export const updateResourceAvailabilitySchema = createResourceAvailabilitySchema.partial()

// Cashflow validation schemas
export const createCashflowSchema = z.object({
  projectId: z.string().cuid(),
  date: z.string().datetime().or(z.date()),
  type: z.enum(['INFLOW', 'OUTFLOW']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  forecast: z.number(),
  actual: z.number().optional()
})

export const updateCashflowSchema = createCashflowSchema.partial()

// Generic pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  perPage: z.number().int().positive().max(100).default(30)
})

/**
 * Validate data against a schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safe validation that returns result object
 */
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}
