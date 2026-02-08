import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { generateDataPackXLSX, DataPackData } from '@/lib/export/reports'
import { AuthenticationError } from '@/lib/errors'
import { filterByResourceProjectAccess } from '@/lib/project-permissions'
import { UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    // Build where clause for project filtering
    let projectWhere: Record<string, unknown> = {}
    if (projectId) {
      projectWhere.id = projectId
    }

    // Apply project access filter
    projectWhere = await filterByResourceProjectAccess(user.userId, user.role as UserRole, projectWhere)

    // Fetch all projects with related data
    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        risks: {
          orderBy: { score: 'desc' },
        },
        changes: {
          orderBy: { createdAt: 'desc' },
        },
        cashflows: {
          orderBy: { date: 'desc' },
        },
        milestones: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS'],
            },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    })

    // Fetch resource allocations
    const resourceAllocations = await prisma.resourceAllocation.findMany({
      where: projectId ? { projectId } : {},
      include: {
        resource: true,
        project: {
          select: {
            name: true,
            projectNumber: true,
          },
        },
      },
    })

    // Calculate portfolio summary
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
    const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
    const totalActualCost = projects.reduce((sum, p) => sum + p.actualCost, 0)
    const totalVariance = totalActualCost - totalBudget

    // Calculate SPI and CPI
    const projectMetrics = projects.map(project => {
      const plannedValue = project.budget * 0.5
      const earnedValue = project.budget * 0.4
      const actualCost = project.actualCost

      const spi = earnedValue / (plannedValue || 1)
      const cpi = earnedValue / (actualCost || 1)

      return { ...project, spi, cpi }
    })

    const avgSPI = projectMetrics.reduce((sum, p) => sum + p.spi, 0) / (projectMetrics.length || 1)
    const avgCPI = projectMetrics.reduce((sum, p) => sum + p.cpi, 0) / (projectMetrics.length || 1)

    // Count RAG status
    const greenProjects = projectMetrics.filter(p => p.spi >= 0.95 && p.cpi >= 0.95).length
    const redProjects = projectMetrics.filter(p => p.spi < 0.85 || p.cpi < 0.85).length
    const amberProjects = totalProjects - greenProjects - redProjects

    // Transform projects data for export
    const projectsData = projectMetrics.map(p => ({
      projectNumber: p.projectNumber,
      name: p.name,
      status: p.status,
      budget: p.budget,
      actualCost: p.actualCost,
      variance: p.actualCost - p.budget,
      spi: p.spi.toFixed(2),
      cpi: p.cpi.toFixed(2),
    }))

    // Collect all risks
    const allRisks = projects.flatMap(p =>
      p.risks.map(r => ({
        riskNumber: r.riskNumber,
        title: r.title,
        category: r.category,
        probability: r.probability,
        impact: r.impact,
        score: r.score,
        status: r.status,
        owner: r.owner || 'Unassigned',
        mitigation: r.mitigation || 'N/A',
      }))
    )

    // Collect all change orders
    const allChanges = projects.flatMap(p =>
      p.changes.map(c => ({
        changeNumber: c.changeNumber,
        title: c.title,
        status: c.status,
        costImpact: c.costImpact,
        timeImpact: c.timeImpact,
        submittedDate: c.submittedDate ? new Date(c.submittedDate).toLocaleDateString('en-GB') : 'N/A',
        approvedDate: c.approvedDate ? new Date(c.approvedDate).toLocaleDateString('en-GB') : 'N/A',
      }))
    )

    // Collect all cashflows
    const allCashflows = projects.flatMap(p =>
      p.cashflows.map(cf => ({
        date: new Date(cf.date).toLocaleDateString('en-GB'),
        type: cf.type,
        category: cf.category,
        description: cf.description,
        forecast: cf.forecast,
        actual: cf.actual || 0,
        variance: (cf.actual || 0) - cf.forecast,
      }))
    )

    // Aggregate resource utilization
    const resourceMap = new Map<string, {
      resourceName: string
      resourceType: string
      allocatedHours: number
      utilization: number
      projects: Set<string>
    }>()

    resourceAllocations.forEach(alloc => {
      const resourceKey = alloc.resource?.name || alloc.resourceId || 'Unknown'
      if (!resourceMap.has(resourceKey)) {
        resourceMap.set(resourceKey, {
          resourceName: resourceKey,
          resourceType: alloc.resourceType,
          allocatedHours: 0,
          utilization: 0,
          projects: new Set(),
        })
      }
      
      const resource = resourceMap.get(resourceKey)!
      resource.allocatedHours += alloc.allocatedHours
      resource.utilization = alloc.utilization // Use last utilization value
      resource.projects.add(alloc.project.name)
    })

    const resourcesData = Array.from(resourceMap.values()).map(r => ({
      resourceName: r.resourceName,
      resourceType: r.resourceType,
      allocatedHours: r.allocatedHours,
      utilization: r.utilization,
      projects: Array.from(r.projects),
    }))

    // Collect all milestones
    const now = new Date()
    const allMilestones = projects.flatMap(p =>
      p.milestones.map(m => {
        const dueDate = new Date(m.dueDate)
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return {
          name: m.name,
          project: p.name,
          dueDate: dueDate.toLocaleDateString('en-GB'),
          status: m.status,
          progress: m.progress,
          daysUntilDue,
          owner: m.owner || 'Unassigned',
        }
      })
    )

    // Build data pack
    const dataPackData: DataPackData = {
      portfolio: {
        totalProjects,
        activeProjects,
        onHoldProjects,
        completedProjects,
        totalBudget,
        totalActualCost,
        totalVariance,
        avgSPI,
        avgCPI,
        greenProjects,
        amberProjects,
        redProjects,
      },
      projects: projectsData,
      risks: allRisks,
      changes: allChanges,
      cashflows: allCashflows,
      resources: resourcesData,
      milestones: allMilestones,
    }

    // Generate XLSX
    const buffer = await generateDataPackXLSX(dataPackData)

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="data-pack-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error generating data pack:', error)

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
