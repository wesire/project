import * as XLSX from 'xlsx'

export interface ProjectExportData {
  projectNumber: string
  name: string
  status: string
  startDate: string
  endDate: string
  budget: number
  actualCost: number
  variance: number
  spi: number
  cpi: number
}

export function generateProjectsXLSX(projects: ProjectExportData[]): ArrayBuffer {
  // Create workbook
  const wb = XLSX.utils.book_new()
  
  // Projects sheet
  const projectsData = projects.map(p => ({
    'Project Number': p.projectNumber,
    'Project Name': p.name,
    'Status': p.status,
    'Start Date': p.startDate,
    'End Date': p.endDate,
    'Budget (£)': p.budget,
    'Actual Cost (£)': p.actualCost,
    'Variance (£)': p.variance,
    'SPI': p.spi,
    'CPI': p.cpi,
  }))
  
  const ws = XLSX.utils.json_to_sheet(projectsData)
  XLSX.utils.book_append_sheet(wb, ws, 'Projects')
  
  // Generate buffer
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return buffer
}

export function generateRiskRegisterXLSX(risks: any[]): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  
  const risksData = risks.map(r => ({
    'Risk ID': r.riskNumber,
    'Title': r.title,
    'Description': r.description,
    'Category': r.category,
    'Probability': r.probability,
    'Impact': r.impact,
    'Score': r.score,
    'Level': r.score >= 20 ? 'CRITICAL' : r.score >= 15 ? 'HIGH' : r.score >= 10 ? 'MEDIUM' : 'LOW',
    'Status': r.status,
    'Owner': r.owner,
    'Mitigation': r.mitigation,
  }))
  
  const ws = XLSX.utils.json_to_sheet(risksData)
  XLSX.utils.book_append_sheet(wb, ws, 'Risk Register')
  
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return buffer
}

export function generateCashflowXLSX(cashflows: any[]): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  
  const cashflowData = cashflows.map(c => ({
    'Date': new Date(c.date).toLocaleDateString('en-GB'),
    'Type': c.type,
    'Category': c.category,
    'Description': c.description,
    'Forecast (£)': c.forecast,
    'Actual (£)': c.actual || 0,
    'Variance (£)': c.variance || 0,
  }))
  
  const ws = XLSX.utils.json_to_sheet(cashflowData)
  XLSX.utils.book_append_sheet(wb, ws, 'Cashflow')
  
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return buffer
}

export function generateExecutiveDashboardXLSX(data: {
  summary: any
  projects: any[]
  risks: any[]
  issues: any[]
}): ArrayBuffer {
  const wb = XLSX.utils.book_new()
  
  // Summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Projects', data.summary.totalProjects],
    ['Active Projects', data.summary.activeProjects],
    ['Total Budget (£)', data.summary.totalBudget],
    ['Total Actual Cost (£)', data.summary.totalActualCost],
    ['Average SPI', data.summary.avgSPI],
    ['Average CPI', data.summary.avgCPI],
    ['Critical Risks', data.summary.criticalRisks],
    ['Open Issues', data.summary.openIssues],
  ]
  
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary')
  
  // Projects sheet
  const ws2 = XLSX.utils.json_to_sheet(data.projects)
  XLSX.utils.book_append_sheet(wb, ws2, 'Projects')
  
  // Risks sheet
  const ws3 = XLSX.utils.json_to_sheet(data.risks)
  XLSX.utils.book_append_sheet(wb, ws3, 'Risks')
  
  // Issues sheet
  const ws4 = XLSX.utils.json_to_sheet(data.issues)
  XLSX.utils.book_append_sheet(wb, ws4, 'Issues')
  
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return buffer
}
