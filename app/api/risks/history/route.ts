import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { AuthenticationError } from '@/lib/errors'
import { requireProjectPermission } from '@/lib/project-permissions'
import { UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)
    
    // Get riskId parameter
    const { searchParams } = new URL(request.url)
    const riskId = searchParams.get('riskId')
    
    if (!riskId) {
      return NextResponse.json(
        { error: 'riskId parameter is required' },
        { status: 400 }
      )
    }
    
    // Get the risk to check project access
    const risk = await prisma.risk.findUnique({
      where: { id: riskId },
      select: { projectId: true }
    })
    
    if (!risk) {
      return NextResponse.json(
        { error: 'Risk not found' },
        { status: 404 }
      )
    }
    
    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      risk.projectId,
      'risk:read'
    )
    
    // Get risk history
    const history = await prisma.riskHistory.findMany({
      where: { riskId },
      orderBy: { recordedAt: 'asc' }
    })
    
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching risk history:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
