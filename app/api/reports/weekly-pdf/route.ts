import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { generateWeeklyReportPDF, WeeklyReportData } from '@/lib/export/reports'
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

    // Calculate week ending date (current Friday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7
    const weekEnding = new Date(now)
    weekEnding.setDate(now.getDate() + daysUntilFriday)
    const weekEndingStr = weekEnding.toLocaleDateString('en-GB')

    // Fetch all projects with calculations
    const projects = await prisma.project.findMany({
      where: projectWhere,
      include: {
        risks: true,
        changes: true,
        cashflows: true,
        milestones: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS'],
            },
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

    // Calculate SPI and CPI for each project
    const projectMetrics = projects.map(project => {
      const plannedValue = project.budget * 0.5 // Simplified: assume 50% should be complete
      const earnedValue = project.budget * 0.4 // Simplified: assume 40% is complete
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

    // Collect top risks (sorted by score)
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
    const topRisks = allRisks
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Collect change impacts
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
    const recentChanges = allChanges.slice(0, 15)

    // Collect cashflow data
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
    const recentCashflows = allCashflows.slice(0, 20)

    // Collect and categorize milestones by timeframe
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

    const next60Days = allMilestones
      .filter(m => m.daysUntilDue > 30 && m.daysUntilDue <= 60)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

    const next90Days = allMilestones
      .filter(m => m.daysUntilDue > 60 && m.daysUntilDue <= 90)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)

    // Build report data
    const reportData: WeeklyReportData = {
      weekEnding: weekEndingStr,
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
      changeImpacts: recentChanges,
      cashflows: recentCashflows,
      milestones: {
        next30Days,
        next60Days,
        next90Days,
      },
    }

    // Generate PDF
    const pdf = generateWeeklyReportPDF(reportData)
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="weekly-report-${weekEndingStr.replace(/\//g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating weekly PDF report:', error)

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
