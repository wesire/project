import ExcelJS from 'exceljs'

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

export async function generateProjectsXLSX(projects: ProjectExportData[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Projects')
  
  // Add headers
  worksheet.columns = [
    { header: 'Project Number', key: 'projectNumber', width: 15 },
    { header: 'Project Name', key: 'name', width: 30 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Start Date', key: 'startDate', width: 12 },
    { header: 'End Date', key: 'endDate', width: 12 },
    { header: 'Budget (£)', key: 'budget', width: 15 },
    { header: 'Actual Cost (£)', key: 'actualCost', width: 15 },
    { header: 'Variance (£)', key: 'variance', width: 15 },
    { header: 'SPI', key: 'spi', width: 10 },
    { header: 'CPI', key: 'cpi', width: 10 },
  ]
  
  // Style header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }
  }
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  
  // Add data
  projects.forEach(project => {
    worksheet.addRow(project)
  })
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function generateRiskRegisterXLSX(risks: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Risk Register')
  
  // Add headers
  worksheet.columns = [
    { header: 'Risk ID', key: 'riskNumber', width: 10 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Probability', key: 'probability', width: 12 },
    { header: 'Impact', key: 'impact', width: 10 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Level', key: 'level', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Owner', key: 'owner', width: 20 },
    { header: 'Mitigation', key: 'mitigation', width: 40 },
  ]
  
  // Style header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEF4444' }
  }
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  
  // Add data with risk level
  risks.forEach(risk => {
    const level = risk.score >= 20 ? 'CRITICAL' : risk.score >= 15 ? 'HIGH' : risk.score >= 10 ? 'MEDIUM' : 'LOW'
    worksheet.addRow({
      ...risk,
      level
    })
  })
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function generateCashflowXLSX(cashflows: any[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Cashflow')
  
  // Add headers
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Forecast (£)', key: 'forecast', width: 15 },
    { header: 'Actual (£)', key: 'actual', width: 15 },
    { header: 'Variance (£)', key: 'variance', width: 15 },
  ]
  
  // Style header row
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF22C55E' }
  }
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  
  // Add data with formatted dates
  cashflows.forEach(c => {
    worksheet.addRow({
      date: new Date(c.date).toLocaleDateString('en-GB'),
      type: c.type,
      category: c.category,
      description: c.description,
      forecast: c.forecast,
      actual: c.actual || 0,
      variance: c.variance || 0,
    })
  })
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export async function generateExecutiveDashboardXLSX(data: {
  summary: any
  projects: any[]
  risks: any[]
  issues: any[]
}): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary')
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ]
  
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }
  }
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  
  summarySheet.addRows([
    { metric: 'Total Projects', value: data.summary.totalProjects },
    { metric: 'Active Projects', value: data.summary.activeProjects },
    { metric: 'Total Budget (£)', value: data.summary.totalBudget },
    { metric: 'Total Actual Cost (£)', value: data.summary.totalActualCost },
    { metric: 'Average SPI', value: data.summary.avgSPI },
    { metric: 'Average CPI', value: data.summary.avgCPI },
    { metric: 'Critical Risks', value: data.summary.criticalRisks },
    { metric: 'Open Issues', value: data.summary.openIssues },
  ])
  
  // Projects sheet
  const projectsSheet = workbook.addWorksheet('Projects')
  if (data.projects.length > 0) {
    projectsSheet.columns = Object.keys(data.projects[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key: key,
      width: 20
    }))
    projectsSheet.getRow(1).font = { bold: true }
    data.projects.forEach(project => projectsSheet.addRow(project))
  }
  
  // Risks sheet
  const risksSheet = workbook.addWorksheet('Risks')
  if (data.risks.length > 0) {
    risksSheet.columns = Object.keys(data.risks[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key: key,
      width: 20
    }))
    risksSheet.getRow(1).font = { bold: true }
    data.risks.forEach(risk => risksSheet.addRow(risk))
  }
  
  // Issues sheet
  const issuesSheet = workbook.addWorksheet('Issues')
  if (data.issues.length > 0) {
    issuesSheet.columns = Object.keys(data.issues[0]).map(key => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      key: key,
      width: 20
    }))
    issuesSheet.getRow(1).font = { bold: true }
    data.issues.forEach(issue => issuesSheet.addRow(issue))
  }
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
