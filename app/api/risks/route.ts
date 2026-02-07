import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const where = projectId ? { projectId } : {}

    const risks = await prisma.risk.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(risks)
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const score = data.probability * data.impact

    const risk = await prisma.risk.create({
      data: {
        projectId: data.projectId,
        riskNumber: data.riskNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        probability: parseInt(data.probability),
        impact: parseInt(data.impact),
        score: score,
        status: data.status || 'OPEN',
        owner: data.owner,
        mitigation: data.mitigation,
        contingency: data.contingency,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            projectNumber: true,
          },
        },
      },
    })

    return NextResponse.json(risk, { status: 201 })
  } catch (error) {
    console.error('Error creating risk:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
