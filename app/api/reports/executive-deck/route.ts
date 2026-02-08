import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { generateExecutiveDeckPPTX, ExecutiveDeckData } from '@/lib/export/reports'
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
          take: 15,
        },
        changes: {
          orderBy: { createdAt: 'desc' },
          take: 15,
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

    // Fetch resource allocations for heatmap
    const resourceAllocations = await prisma.resourceAllocation.findMany({
      where: projectId ? { projectId } : {},
      include: {
        resource: true,
      },
      orderBy: [
        { startDate: 'asc' },
      ],
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

    // Collect top risks
    const topRisks = projects.flatMap(p =>
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
    ).sort((a, b) => b.score - a.score).slice(0, 10)

    // Collect change impacts
    const changeImpacts = projects.flatMap(p =>
      p.changes.map(c => ({
        changeNumber: c.changeNumber,
        title: c.title,
        status: c.status,
        costImpact: c.costImpact,
        timeImpact: c.timeImpact,
        submittedDate: c.submittedDate ? new Date(c.submittedDate).toLocaleDateString('en-GB') : 'N/A',
        approvedDate: c.approvedDate ? new Date(c.approvedDate).toLocaleDateString('en-GB') : 'N/A',
      }))
    ).slice(0, 12)

    // Calculate cashflow summary
    const allCashflows = projects.flatMap(p => p.cashflows)
    const totalForecasted = allCashflows.reduce((sum, cf) => sum + cf.forecast, 0)
    const totalActual = allCashflows.reduce((sum, cf) => sum + (cf.actual || 0), 0)
    const totalCFVariance = totalActual - totalForecasted

    // Group cashflow by category
    const categoryMap = new Map<string, number>()
    allCashflows.forEach(cf => {
      const current = categoryMap.get(cf.category) || 0
      categoryMap.set(cf.category, current + (cf.actual || cf.forecast))
    })

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)

    // Build resource heatmap data (by week)
    const now = new Date()
    const resourceHeatmapData: Array<{
      week: string
      resources: Array<{ name: string; utilization: number }>
    }> = []

    // Get next 8 weeks
    for (let weekOffset = 0; weekOffset < 8; weekOffset++) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() + (weekOffset * 7))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const weekLabel = `${weekStart.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`

      // Get allocations for this week
      const weekAllocations = resourceAllocations.filter(alloc => {
        const allocStart = new Date(alloc.startDate)
        const allocEnd = new Date(alloc.endDate)
        return allocStart <= weekEnd && allocEnd >= weekStart
      })

      // Aggregate by resource
      const resourceUtilMap = new Map<string, number>()
      weekAllocations.forEach(alloc => {
        const resourceName = alloc.resource?.name || `Resource ${alloc.resourceId?.substring(0, 8)}`
        const current = resourceUtilMap.get(resourceName) || 0
        resourceUtilMap.set(resourceName, Math.max(current, alloc.utilization))
      })

      // Get top 6 resources for this week
      const weekResources = Array.from(resourceUtilMap.entries())
        .map(([name, utilization]) => ({ name, utilization }))
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 6)

      // Pad to always have 6 resources
      while (weekResources.length < 6) {
        weekResources.push({ name: `Resource ${weekResources.length + 1}`, utilization: 0 })
      }

      resourceHeatmapData.push({
        week: weekLabel,
        resources: weekResources,
      })
    }

    // Collect and categorize milestones
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

    const next30Days = allMilestones
      .filter(m => m.daysUntilDue >= 0 && m.daysUntilDue <= 30)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 10)

    const next60Days = allMilestones
      .filter(m => m.daysUntilDue > 30 && m.daysUntilDue <= 60)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 10)

    const next90Days = allMilestones
      .filter(m => m.daysUntilDue > 60 && m.daysUntilDue <= 90)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      .slice(0, 10)

    // Build executive deck data
    const deckData: ExecutiveDeckData = {
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
      topRisks,
      changeImpacts,
      cashflowSummary: {
        totalForecasted,
        totalActual,
        totalVariance: totalCFVariance,
        byCategory,
      },
      resourceHeatmap: resourceHeatmapData,
      milestones: {
        next30Days,
        next60Days,
        next90Days,
      },
    }

    // Generate PPTX
    const pptx = generateExecutiveDeckPPTX(deckData)
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' })

    return new NextResponse(pptxBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="executive-deck-${new Date().toISOString().split('T')[0]}.pptx"`,
      },
    })
  } catch (error) {
    console.error('Error generating executive deck:', error)

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
