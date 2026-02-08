import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { handleApiError, AuthenticationError, ValidationError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password')
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
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
    })

    // Set token in cookie for consistent auth
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
