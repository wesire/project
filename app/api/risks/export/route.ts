import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/middleware'
import { generateRiskRegisterCSV, RiskExportData } from '@/lib/export/csv'
import { generateRiskRegisterXLSX } from '@/lib/export/xlsx'
import { AuthenticationError } from '@/lib/errors'
import { filterByResourceProjectAccess } from '@/lib/project-permissions'
import { UserRole } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateRequest(request)
    
    // Get format parameter (csv or xlsx)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx'
    const projectId = searchParams.get('projectId')
    
    // Build where clause
    let where: Record<string, unknown> = {}
    if (projectId) {
      where.projectId = projectId
    }
    
    // Apply project access filter
    where = await filterByResourceProjectAccess(user.userId, user.role as UserRole, where)
    
    // Get all risks
    const risks = await prisma.risk.findMany({
      where,
      orderBy: { score: 'desc' },
      include: {
        project: {
          select: {
            name: true,
            projectNumber: true,
          },
        },
      },
    })
    
    // Transform data for export
    const exportData: RiskExportData[] = risks.map(risk => {
      const level = risk.score >= 20 ? 'CRITICAL' : 
                    risk.score >= 15 ? 'HIGH' : 
                    risk.score >= 10 ? 'MEDIUM' : 'LOW'
      
      return {
        riskNumber: risk.riskNumber,
        title: risk.title,
        description: risk.description,
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        score: risk.score,
        level,
        status: risk.status,
        owner: risk.owner || '',
        mitigation: risk.mitigation || '',
        contingency: risk.contingency || '',
        mitigationDueDate: risk.mitigationDueDate 
          ? new Date(risk.mitigationDueDate).toLocaleDateString('en-GB')
          : '',
        createdAt: new Date(risk.createdAt).toLocaleDateString('en-GB'),
        updatedAt: new Date(risk.updatedAt).toLocaleDateString('en-GB'),
      }
    })
    
    if (format === 'csv') {
      // Generate CSV
      const csv = generateRiskRegisterCSV(exportData)
      
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="risk-register-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Generate XLSX
      const buffer = await generateRiskRegisterXLSX(exportData)
      
      return new NextResponse(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="risk-register-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting risks:', error)
    
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
