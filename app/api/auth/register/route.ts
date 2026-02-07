import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { handleApiError } from '@/lib/errors'
import { ConflictError, ValidationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password, role } = body

    // Validate required fields
    if (!email || !name || !password) {
      throw new ValidationError('Email, name, and password are required')
    }

    // Basic email validation
    if (!email.includes('@')) {
      throw new ValidationError('Invalid email format')
    }

    // Password strength validation
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'VIEWER', // Default to VIEWER role
      },
    })

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      }
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
