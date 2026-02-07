import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            risks: true,
            changes: true,
            tasks: true,
            issues: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const project = await prisma.project.create({
      data: {
        projectNumber: data.projectNumber,
        name: data.name,
        description: data.description,
        status: data.status || 'PLANNING',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: parseFloat(data.budget),
        currency: data.currency || 'GBP',
        location: data.location,
        client: data.client,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        projectId: project.id,
        userId: data.createdById,
        action: 'CREATE',
        entityType: 'Project',
        entityId: project.id,
        changes: {
          created: project,
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
