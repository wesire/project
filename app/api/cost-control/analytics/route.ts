import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { requireProjectPermission } from '@/lib/project-permissions'
import { AuthenticationError, AuthorizationError } from '@/lib/errors'
import { UserRole } from '@/lib/types'

/**
 * GET /api/cost-control/analytics
 * Get comprehensive cost control analytics for a project
 * Query params: projectId (required), period (weekly|monthly)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const period = searchParams.get('period') || 'monthly' // weekly or monthly

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Check project access
    await requireProjectPermission(
      user.userId,
      user.role as UserRole,
      projectId,
      'project:read'
    )

    // Get project with all related data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        budgetLines: true,
        cashflows: {
          orderBy: { date: 'asc' },
        },
        changes: {
          where: {
            status: 'APPROVED',
          },
        },
        eacHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 12, // Last 12 records for trend
        },
        costAlerts: {
          where: {
            status: {
              in: ['ACTIVE', 'ACKNOWLEDGED'],
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate committed costs from budget lines
    const committedCost = project.budgetLines.reduce(
      (sum, line) => sum + line.committed,
      0
    )

    // Calculate approved variations (cost impact from approved change orders)
    const approvedVariations = project.changes.reduce(
      (sum, change) => sum + change.costImpact,
      0
    )

    // Calculate current EAC (Estimate at Completion)
    const spentToDate = project.actualCost
    const remainingBudget = project.budget - spentToDate
    const committedRemaining = committedCost
    const eac = spentToDate + committedRemaining + (remainingBudget - committedRemaining)

    // Calculate performance indices
    const plannedValue = project.budget
    const earnedValue = project.actualCost // Simplified; should be based on progress
    const cpi = earnedValue > 0 ? earnedValue / spentToDate : 1
    const spi = plannedValue > 0 ? earnedValue / plannedValue : 1

    // Calculate margin
    const totalBudget = project.budget + approvedVariations
    const margin = totalBudget - eac
    const marginPercentage = totalBudget > 0 ? (margin / totalBudget) * 100 : 0

    // Check margin threshold and create alert if needed
    const marginThreshold = project.marginThreshold || 10
    if (marginPercentage < marginThreshold) {
      // Check if alert already exists
      const existingAlert = await prisma.costAlert.findFirst({
        where: {
          projectId: project.id,
          type: 'MARGIN_BELOW_THRESHOLD',
          status: 'ACTIVE',
        },
      })

      if (!existingAlert) {
        await prisma.costAlert.create({
          data: {
            projectId: project.id,
            type: 'MARGIN_BELOW_THRESHOLD',
            severity: marginPercentage < 5 ? 'CRITICAL' : marginPercentage < 10 ? 'HIGH' : 'MEDIUM',
            title: 'Margin Below Threshold',
            message: `Project margin (${marginPercentage.toFixed(2)}%) is below the threshold of ${marginThreshold}%`,
            threshold: marginThreshold,
            actual: marginPercentage,
          },
        })
      }
    }

    // Aggregate cashflows by period
    const cashflowsByPeriod = aggregateCashflowsByPeriod(
      project.cashflows,
      period as 'weekly' | 'monthly'
    )

    // Calculate S-curve data (cumulative cashflow)
    const sCurveData = calculateSCurve(project.cashflows)

    // Prepare response
    const analytics = {
      project: {
        id: project.id,
        name: project.name,
        projectNumber: project.projectNumber,
        budget: project.budget,
        actualCost: project.actualCost,
        currency: project.currency,
      },
      costSummary: {
        budget: project.budget,
        actualCost: spentToDate,
        committedCost,
        approvedVariations,
        totalBudget,
        eac,
        variance: totalBudget - eac,
        margin,
        marginPercentage,
        marginThreshold,
      },
      performanceIndices: {
        cpi,
        spi,
      },
      cashflow: {
        period,
        aggregated: cashflowsByPeriod,
        sCurve: sCurveData,
      },
      eacTrend: project.eacHistory.reverse(), // Show oldest to newest
      alerts: project.costAlerts,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching cost control analytics:', error)

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Aggregate cashflows by weekly or monthly periods
 */
function aggregateCashflowsByPeriod(
  cashflows: Array<{
    date: Date
    type: string
    forecast: number
    actual: number | null
  }>,
  period: 'weekly' | 'monthly'
) {
  const aggregated = new Map<
    string,
    {
      period: string
      forecastInflow: number
      forecastOutflow: number
      actualInflow: number
      actualOutflow: number
    }
  >()

  cashflows.forEach((cf) => {
    const date = new Date(cf.date)
    let periodKey: string

    if (period === 'weekly') {
      // Get ISO week
      const weekNumber = getISOWeek(date)
      const year = date.getFullYear()
      periodKey = `${year}-W${String(weekNumber).padStart(2, '0')}`
    } else {
      // Monthly
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      periodKey = `${year}-${String(month).padStart(2, '0')}`
    }

    if (!aggregated.has(periodKey)) {
      aggregated.set(periodKey, {
        period: periodKey,
        forecastInflow: 0,
        forecastOutflow: 0,
        actualInflow: 0,
        actualOutflow: 0,
      })
    }

    const data = aggregated.get(periodKey)!

    if (cf.type === 'INFLOW') {
      data.forecastInflow += cf.forecast
      data.actualInflow += cf.actual || 0
    } else {
      data.forecastOutflow += cf.forecast
      data.actualOutflow += cf.actual || 0
    }
  })

  return Array.from(aggregated.values()).sort((a, b) =>
    a.period.localeCompare(b.period)
  )
}

/**
 * Calculate S-curve (cumulative cashflow over time)
 */
function calculateSCurve(
  cashflows: Array<{
    date: Date
    type: string
    forecast: number
    actual: number | null
  }>
) {
  const sorted = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime())

  let cumulativeForecast = 0
  let cumulativeActual = 0

  return sorted.map((cf) => {
    const amount = cf.type === 'INFLOW' ? cf.forecast : -cf.forecast
    const actualAmount =
      cf.actual !== null ? (cf.type === 'INFLOW' ? cf.actual : -cf.actual) : null

    cumulativeForecast += amount
    if (actualAmount !== null) {
      cumulativeActual += actualAmount
    }

    return {
      date: cf.date,
      cumulativeForecast,
      cumulativeActual: actualAmount !== null ? cumulativeActual : null,
    }
  })
}

/**
 * Get ISO week number
 */
function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return weekNo
}
