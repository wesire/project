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
  taskNumber: z.string().min(1, 'Task number is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedToId: z.string().cuid().optional(),
  estimatedHours: z.number().positive().optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  dependencies: z.array(z.string()).optional()
})

export const updateTaskSchema = createTaskSchema.partial()

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
