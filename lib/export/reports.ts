import jsPDF from 'jspdf'
import 'jspdf-autotable'
import ExcelJS from 'exceljs'
import pptxgen from 'pptxgenjs'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// ===== TYPE DEFINITIONS =====

export interface PortfolioSummary {
  totalProjects: number
  activeProjects: number
  onHoldProjects: number
  completedProjects: number
  totalBudget: number
  totalActualCost: number
  totalVariance: number
  avgSPI: number
  avgCPI: number
  greenProjects: number
  amberProjects: number
  redProjects: number
}

export interface TopRisk {
  riskNumber: string
  title: string
  category: string
  probability: number
  impact: number
  score: number
  status: string
  owner: string
  mitigation: string
}

export interface ChangeImpact {
  changeNumber: string
  title: string
  status: string
  costImpact: number
  timeImpact: number
  submittedDate: string
  approvedDate: string
}

export interface CashflowData {
  date: string
  type: string
  category: string
  description: string
  forecast: number
  actual: number
  variance: number
}

export interface ResourceUtilization {
  resourceName: string
  resourceType: string
  allocatedHours: number
  utilization: number
  projects: string[]
}

export interface MilestoneData {
  name: string
  project: string
  dueDate: string
  status: string
  progress: number
  daysUntilDue: number
  owner: string
}

export interface WeeklyReportData {
  weekEnding: string
  portfolio: PortfolioSummary
  topRisks: TopRisk[]
  changeImpacts: ChangeImpact[]
  cashflows: CashflowData[]
  milestones: {
    next30Days: MilestoneData[]
    next60Days: MilestoneData[]
    next90Days: MilestoneData[]
  }
}

export interface DataPackData {
  portfolio: PortfolioSummary
  projects: any[]
  risks: TopRisk[]
  changes: ChangeImpact[]
  cashflows: CashflowData[]
  resources: ResourceUtilization[]
  milestones: MilestoneData[]
}

export interface ExecutiveDeckData {
  portfolio: PortfolioSummary
  topRisks: TopRisk[]
  changeImpacts: ChangeImpact[]
  cashflowSummary: {
    totalForecasted: number
    totalActual: number
    totalVariance: number
    byCategory: Array<{ category: string; amount: number }>
  }
  resourceHeatmap: Array<{
    week: string
    resources: Array<{ name: string; utilization: number }>
  }>
  milestones: {
    next30Days: MilestoneData[]
    next60Days: MilestoneData[]
    next90Days: MilestoneData[]
  }
}

// ===== PDF WEEKLY REPORT =====

export function generateWeeklyReportPDF(data: WeeklyReportData): jsPDF {
  const doc = new jsPDF()
  let yPosition = 20

  // Title
  doc.setFontSize(24)
  doc.text('Weekly Project Report', 20, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.text(`Week Ending: ${data.weekEnding}`, 20, yPosition)
  yPosition += 15

  // Portfolio Summary
  doc.setFontSize(18)
  doc.text('Portfolio Summary', 20, yPosition)
  yPosition += 10

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: [
      ['Total Projects', data.portfolio.totalProjects.toString()],
      ['Active Projects', data.portfolio.activeProjects.toString()],
      ['Total Budget', `£${data.portfolio.totalBudget.toLocaleString('en-GB')}`],
      ['Total Actual Cost', `£${data.portfolio.totalActualCost.toLocaleString('en-GB')}`],
      ['Variance', `£${data.portfolio.totalVariance.toLocaleString('en-GB')}`],
      ['Average SPI', data.portfolio.avgSPI.toFixed(2)],
      ['Average CPI', data.portfolio.avgCPI.toFixed(2)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // RAG Status
  doc.setFontSize(18)
  doc.text('RAG Status Distribution', 20, yPosition)
  yPosition += 10

  doc.autoTable({
    startY: yPosition,
    head: [['Status', 'Count']],
    body: [
      ['Green', data.portfolio.greenProjects.toString()],
      ['Amber', data.portfolio.amberProjects.toString()],
      ['Red', data.portfolio.redProjects.toString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [107, 114, 128] },
  })

  // New page for risks
  doc.addPage()
  yPosition = 20

  // Top Risks
  doc.setFontSize(18)
  doc.text('Top Risks', 20, yPosition)
  yPosition += 10

  if (data.topRisks.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Risk ID', 'Title', 'Score', 'Status', 'Owner']],
      body: data.topRisks.slice(0, 10).map(risk => [
        risk.riskNumber,
        risk.title.substring(0, 40),
        risk.score.toString(),
        risk.status,
        risk.owner.substring(0, 20),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    })
    yPosition = (doc as any).lastAutoTable.finalY + 15
  }

  // Change Impact
  if (yPosition > 200) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(18)
  doc.text('Change Orders', 20, yPosition)
  yPosition += 10

  if (data.changeImpacts.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Change #', 'Title', 'Status', 'Cost Impact', 'Time Impact']],
      body: data.changeImpacts.slice(0, 10).map(change => [
        change.changeNumber,
        change.title.substring(0, 30),
        change.status,
        `£${change.costImpact.toLocaleString('en-GB')}`,
        `${change.timeImpact} days`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11] },
    })
  }

  // New page for cashflow and milestones
  doc.addPage()
  yPosition = 20

  // Cashflow Summary
  doc.setFontSize(18)
  doc.text('Cashflow Summary', 20, yPosition)
  yPosition += 10

  const totalForecast = data.cashflows.reduce((sum, cf) => sum + cf.forecast, 0)
  const totalActual = data.cashflows.reduce((sum, cf) => sum + (cf.actual || 0), 0)
  const totalCFVariance = totalActual - totalForecast

  doc.autoTable({
    startY: yPosition,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Forecast', `£${totalForecast.toLocaleString('en-GB')}`],
      ['Total Actual', `£${totalActual.toLocaleString('en-GB')}`],
      ['Variance', `£${totalCFVariance.toLocaleString('en-GB')}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 197, 94] },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // 30/60/90 Day Milestones
  doc.setFontSize(18)
  doc.text('Upcoming Milestones', 20, yPosition)
  yPosition += 10

  // 30-Day Milestones
  doc.setFontSize(14)
  doc.text('Next 30 Days', 20, yPosition)
  yPosition += 5

  if (data.milestones.next30Days.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Milestone', 'Project', 'Due Date', 'Status', 'Progress']],
      body: data.milestones.next30Days.slice(0, 5).map(m => [
        m.name.substring(0, 30),
        m.project.substring(0, 20),
        m.dueDate,
        m.status,
        `${m.progress}%`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
    })
    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // 60-Day Milestones
  if (yPosition > 230) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(14)
  doc.text('31-60 Days', 20, yPosition)
  yPosition += 5

  if (data.milestones.next60Days.length > 0) {
    doc.autoTable({
      startY: yPosition,
      head: [['Milestone', 'Project', 'Due Date', 'Status']],
      body: data.milestones.next60Days.slice(0, 5).map(m => [
        m.name.substring(0, 30),
        m.project.substring(0, 20),
        m.dueDate,
        m.status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
    })
  }

  return doc
}

// ===== XLSX DATA PACK =====

export async function generateDataPackXLSX(data: DataPackData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()

  // Portfolio Summary Sheet
  const portfolioSheet = workbook.addWorksheet('Portfolio Summary')
  portfolioSheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 20 },
  ]

  portfolioSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  portfolioSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  }

  portfolioSheet.addRows([
    { metric: 'Total Projects', value: data.portfolio.totalProjects },
    { metric: 'Active Projects', value: data.portfolio.activeProjects },
    { metric: 'On Hold Projects', value: data.portfolio.onHoldProjects },
    { metric: 'Completed Projects', value: data.portfolio.completedProjects },
    { metric: 'Total Budget (£)', value: data.portfolio.totalBudget },
    { metric: 'Total Actual Cost (£)', value: data.portfolio.totalActualCost },
    { metric: 'Total Variance (£)', value: data.portfolio.totalVariance },
    { metric: 'Average SPI', value: data.portfolio.avgSPI.toFixed(2) },
    { metric: 'Average CPI', value: data.portfolio.avgCPI.toFixed(2) },
    { metric: 'Green Projects', value: data.portfolio.greenProjects },
    { metric: 'Amber Projects', value: data.portfolio.amberProjects },
    { metric: 'Red Projects', value: data.portfolio.redProjects },
  ])

  // Projects Sheet
  const projectsSheet = workbook.addWorksheet('Projects')
  if (data.projects.length > 0) {
    projectsSheet.columns = [
      { header: 'Project Number', key: 'projectNumber', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Budget (£)', key: 'budget', width: 15 },
      { header: 'Actual Cost (£)', key: 'actualCost', width: 15 },
      { header: 'Variance (£)', key: 'variance', width: 15 },
      { header: 'SPI', key: 'spi', width: 10 },
      { header: 'CPI', key: 'cpi', width: 10 },
    ]
    projectsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    projectsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    }
    data.projects.forEach(project => projectsSheet.addRow(project))
  }

  // Top Risks Sheet
  const risksSheet = workbook.addWorksheet('Top Risks')
  risksSheet.columns = [
    { header: 'Risk ID', key: 'riskNumber', width: 12 },
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Probability', key: 'probability', width: 12 },
    { header: 'Impact', key: 'impact', width: 10 },
    { header: 'Score', key: 'score', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Owner', key: 'owner', width: 20 },
    { header: 'Mitigation', key: 'mitigation', width: 40 },
  ]
  risksSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  risksSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEF4444' },
  }
  data.risks.forEach(risk => risksSheet.addRow(risk))

  // Change Orders Sheet
  const changesSheet = workbook.addWorksheet('Change Orders')
  changesSheet.columns = [
    { header: 'Change #', key: 'changeNumber', width: 12 },
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Cost Impact (£)', key: 'costImpact', width: 15 },
    { header: 'Time Impact (days)', key: 'timeImpact', width: 18 },
    { header: 'Submitted Date', key: 'submittedDate', width: 15 },
    { header: 'Approved Date', key: 'approvedDate', width: 15 },
  ]
  changesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  changesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF59E0B' },
  }
  data.changes.forEach(change => changesSheet.addRow(change))

  // Cashflow Sheet
  const cashflowSheet = workbook.addWorksheet('Cashflow')
  cashflowSheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Category', key: 'category', width: 15 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Forecast (£)', key: 'forecast', width: 15 },
    { header: 'Actual (£)', key: 'actual', width: 15 },
    { header: 'Variance (£)', key: 'variance', width: 15 },
  ]
  cashflowSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  cashflowSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF22C55E' },
  }
  data.cashflows.forEach(cf => cashflowSheet.addRow(cf))

  // Resource Utilization Sheet with Heatmap
  const resourcesSheet = workbook.addWorksheet('Resource Utilization')
  resourcesSheet.columns = [
    { header: 'Resource Name', key: 'resourceName', width: 25 },
    { header: 'Resource Type', key: 'resourceType', width: 15 },
    { header: 'Allocated Hours', key: 'allocatedHours', width: 18 },
    { header: 'Utilization (%)', key: 'utilization', width: 18 },
    { header: 'Projects', key: 'projects', width: 40 },
  ]
  resourcesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  resourcesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B5CF6' },
  }

  data.resources.forEach((resource) => {
    const row = resourcesSheet.addRow({
      resourceName: resource.resourceName,
      resourceType: resource.resourceType,
      allocatedHours: resource.allocatedHours,
      utilization: resource.utilization,
      projects: resource.projects.join(', '),
    })

    // Apply heatmap coloring based on utilization
    const utilizationCell = row.getCell(4)
    if (resource.utilization >= 90) {
      utilizationCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEF4444' }, // Red for over-utilized
      }
    } else if (resource.utilization >= 70) {
      utilizationCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF59E0B' }, // Amber for high utilization
      }
    } else if (resource.utilization >= 40) {
      utilizationCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF22C55E' }, // Green for optimal
      }
    } else {
      utilizationCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF60A5FA' }, // Blue for under-utilized
      }
    }
  })

  // Milestones Sheet
  const milestonesSheet = workbook.addWorksheet('Milestones')
  milestonesSheet.columns = [
    { header: 'Milestone', key: 'name', width: 30 },
    { header: 'Project', key: 'project', width: 25 },
    { header: 'Due Date', key: 'dueDate', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Progress (%)', key: 'progress', width: 15 },
    { header: 'Days Until Due', key: 'daysUntilDue', width: 15 },
    { header: 'Owner', key: 'owner', width: 20 },
  ]
  milestonesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  milestonesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6366F1' },
  }
  data.milestones.forEach(milestone => milestonesSheet.addRow(milestone))

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

// ===== PPTX EXECUTIVE DECK =====

export function generateExecutiveDeckPPTX(data: ExecutiveDeckData): pptxgen {
  const pptx = new pptxgen()

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide()
  slide1.background = { color: '2563EB' }
  slide1.addText('Executive Project Dashboard', {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  slide1.addText(new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), {
    x: 0.5,
    y: 4,
    w: 9,
    h: 0.3,
    fontSize: 18,
    color: 'E0E0E0',
    align: 'center',
  })

  // Slide 2: Portfolio Summary
  const slide2 = pptx.addSlide()
  slide2.addText('Portfolio Summary', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })

  // Key Metrics Cards
  const metrics = [
    { label: 'Total Budget', value: `£${(data.portfolio.totalBudget / 1000000).toFixed(1)}M`, color: '2563EB' },
    { label: 'Actual Cost', value: `£${(data.portfolio.totalActualCost / 1000000).toFixed(1)}M`, color: '8B5CF6' },
    { label: 'Avg SPI', value: data.portfolio.avgSPI.toFixed(2), color: data.portfolio.avgSPI >= 0.95 ? '22C55E' : '      F59E0B' },
    { label: 'Avg CPI', value: data.portfolio.avgCPI.toFixed(2), color: data.portfolio.avgCPI >= 0.95 ? '22C55E' : 'F59E0B' },
  ]

  metrics.forEach((metric, i) => {
    const xPos = 0.5 + (i * 2.375)
    slide2.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.2,
      w: 2.1,
      h: 1.5,
      fill: { color: metric.color },
    })
    slide2.addText(metric.label, {
      x: xPos,
      y: 1.4,
      w: 2.1,
      h: 0.3,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    })
    slide2.addText(metric.value, {
      x: xPos,
      y: 2,
      w: 2.1,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    })
  })

  // Project Status Table
  const statusData: any[] = [
    [
      { text: 'Status', options: { bold: true, fill: '6B7280', color: 'FFFFFF' } },
      { text: 'Count', options: { bold: true, fill: '6B7280', color: 'FFFFFF' } },
    ],
    [
      { text: 'Active', options: {} },
      { text: data.portfolio.activeProjects.toString(), options: { bold: true } },
    ],
    [
      { text: 'On Hold', options: {} },
      { text: data.portfolio.onHoldProjects.toString(), options: {} },
    ],
    [
      { text: 'Completed', options: {} },
      { text: data.portfolio.completedProjects.toString(), options: {} },
    ],
  ]

  slide2.addTable(statusData, {
    x: 0.5,
    y: 3.5,
    w: 4,
    h: 1.8,
    fontSize: 16,
    border: { pt: 1, color: 'CCCCCC' },
  })

  // RAG Status Chart
  const ragData: any[] = [
    [
      { text: 'RAG', options: { bold: true, fill: '6B7280', color: 'FFFFFF' } },
      { text: 'Projects', options: { bold: true, fill: '6B7280', color: 'FFFFFF' } },
    ],
    [
      { text: 'Green', options: { fill: '22C55E', color: 'FFFFFF', bold: true } },
      { text: data.portfolio.greenProjects.toString(), options: { fill: 'D1FAE5', bold: true } },
    ],
    [
      { text: 'Amber', options: { fill: 'F59E0B', color: 'FFFFFF', bold: true } },
      { text: data.portfolio.amberProjects.toString(), options: { fill: 'FEF3C7', bold: true } },
    ],
    [
      { text: 'Red', options: { fill: 'EF4444', color: 'FFFFFF', bold: true } },
      { text: data.portfolio.redProjects.toString(), options: { fill: 'FEE2E2', bold: true } },
    ],
  ]

  slide2.addTable(ragData, {
    x: 5.5,
    y: 3.5,
    w: 4,
    h: 1.8,
    fontSize: 16,
    border: { pt: 1, color: 'CCCCCC' },
  })

  // Slide 3: Top Risks
  const slide3 = pptx.addSlide()
  slide3.addText('Top Risks', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })

  const risksData: any[] = [
    [
      { text: 'Risk ID', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
      { text: 'Title', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
      { text: 'Score', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
      { text: 'Status', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
    ],
    ...data.topRisks.slice(0, 10).map(risk => [
      { text: risk.riskNumber, options: {} },
      { text: risk.title.substring(0, 45), options: {} },
      { text: risk.score.toString(), options: { bold: true } },
      { text: risk.status, options: {} },
    ]),
  ]

  slide3.addTable(risksData, {
    x: 0.5,
    y: 1.2,
    w: 9,
    h: 4.5,
    fontSize: 12,
    border: { pt: 1, color: 'CCCCCC' },
  })

  // Slide 4: Change Impact
  const slide4 = pptx.addSlide()
  slide4.addText('Change Impact Summary', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })

  const totalCostImpact = data.changeImpacts.reduce((sum, c) => sum + c.costImpact, 0)
  const totalTimeImpact = data.changeImpacts.reduce((sum, c) => sum + c.timeImpact, 0)

  // Summary boxes
  slide4.addShape(pptx.ShapeType.rect, {
    x: 1.5,
    y: 1.2,
    w: 3,
    h: 1.2,
    fill: { color: 'F59E0B' },
  })
  slide4.addText('Total Cost Impact', {
    x: 1.5,
    y: 1.4,
    w: 3,
    h: 0.3,
    fontSize: 16,
    color: 'FFFFFF',
    align: 'center',
  })
  slide4.addText(`£${totalCostImpact.toLocaleString('en-GB')}`, {
    x: 1.5,
    y: 1.8,
    w: 3,
    h: 0.4,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })

  slide4.addShape(pptx.ShapeType.rect, {
    x: 5.5,
    y: 1.2,
    w: 3,
    h: 1.2,
    fill: { color: 'F59E0B' },
  })
  slide4.addText('Total Time Impact', {
    x: 5.5,
    y: 1.4,
    w: 3,
    h: 0.3,
    fontSize: 16,
    color: 'FFFFFF',
    align: 'center',
  })
  slide4.addText(`${totalTimeImpact} days`, {
    x: 5.5,
    y: 1.8,
    w: 3,
    h: 0.4,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })

  // Changes table
  const changesData: any[] = [
    [
      { text: 'Change #', options: { bold: true, fill: 'F59E0B', color: 'FFFFFF' } },
      { text: 'Title', options: { bold: true, fill: 'F59E0B', color: 'FFFFFF' } },
      { text: 'Status', options: { bold: true, fill: 'F59E0B', color: 'FFFFFF' } },
      { text: 'Cost', options: { bold: true, fill: 'F59E0B', color: 'FFFFFF' } },
      { text: 'Days', options: { bold: true, fill: 'F59E0B', color: 'FFFFFF' } },
    ],
    ...data.changeImpacts.slice(0, 8).map(change => [
      { text: change.changeNumber, options: {} },
      { text: change.title.substring(0, 30), options: {} },
      { text: change.status, options: {} },
      { text: `£${change.costImpact.toLocaleString('en-GB')}`, options: {} },
      { text: change.timeImpact.toString(), options: {} },
    ]),
  ]

  slide4.addTable(changesData, {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 3,
    fontSize: 11,
    border: { pt: 1, color: 'CCCCCC' },
  })

  // Slide 5: Cashflow Summary
  const slide5 = pptx.addSlide()
  slide5.addText('Cashflow Summary', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })

  // Cashflow metrics
  const cfMetrics = [
    { label: 'Forecasted', value: `£${(data.cashflowSummary.totalForecasted / 1000000).toFixed(2)}M`, color: '22C55E' },
    { label: 'Actual', value: `£${(data.cashflowSummary.totalActual / 1000000).toFixed(2)}M`, color: '3B82F6' },
    { label: 'Variance', value: `£${(data.cashflowSummary.totalVariance / 1000000).toFixed(2)}M`, color: data.cashflowSummary.totalVariance >= 0 ? '22C55E' : 'EF4444' },
  ]

  cfMetrics.forEach((metric, i) => {
    const xPos = 1 + (i * 2.67)
    slide5.addShape(pptx.ShapeType.rect, {
      x: xPos,
      y: 1.2,
      w: 2.3,
      h: 1.3,
      fill: { color: metric.color },
    })
    slide5.addText(metric.label, {
      x: xPos,
      y: 1.4,
      w: 2.3,
      h: 0.3,
      fontSize: 16,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    })
    slide5.addText(metric.value, {
      x: xPos,
      y: 1.9,
      w: 2.3,
      h: 0.4,
      fontSize: 28,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    })
  })

  // Cashflow by category
  if (data.cashflowSummary.byCategory.length > 0) {
    const categoryData: any[] = [
      [
        { text: 'Category', options: { bold: true, fill: '22C55E', color: 'FFFFFF' } },
        { text: 'Amount (£)', options: { bold: true, fill: '22C55E', color: 'FFFFFF' } },
      ],
      ...data.cashflowSummary.byCategory.slice(0, 8).map(cat => [
        { text: cat.category, options: {} },
        { text: cat.amount.toLocaleString('en-GB'), options: {} },
      ]),
    ]

    slide5.addTable(categoryData, {
      x: 1,
      y: 3,
      w: 8,
      h: 2.5,
      fontSize: 14,
      border: { pt: 1, color: 'CCCCCC' },
    })
  }

  // Slide 6: Resource Heatmap
  const slide6 = pptx.addSlide()
  slide6.addText('Resource Utilization Heatmap', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })

  if (data.resourceHeatmap.length > 0) {
    // Create heatmap table
    const heatmapData: any[] = [
      [
        { text: 'Week', options: { bold: true, fill: '8B5CF6', color: 'FFFFFF' } },
        ...data.resourceHeatmap[0].resources.map(r => ({
          text: r.name.substring(0, 12),
          options: { bold: true, fill: '8B5CF6', color: 'FFFFFF', fontSize: 10 },
        })),
      ],
    ]

    data.resourceHeatmap.slice(0, 8).forEach(week => {
      const row = [
        { text: week.week, options: { bold: true } },
        ...week.resources.map(r => {
          let fillColor = '60A5FA' // Blue for under-utilized
          if (r.utilization >= 90) fillColor = 'EF4444' // Red
          else if (r.utilization >= 70) fillColor = 'F59E0B' // Amber
          else if (r.utilization >= 40) fillColor = '22C55E' // Green

          return {
            text: `${r.utilization}%`,
            options: { fill: fillColor, color: 'FFFFFF', bold: true, fontSize: 10 },
          }
        }),
      ]
      heatmapData.push(row)
    })

    slide6.addTable(heatmapData, {
      x: 0.3,
      y: 1.2,
      w: 9.4,
      h: 4.3,
      fontSize: 10,
      border: { pt: 1, color: 'CCCCCC' },
    })
  }

  // Slide 7: 30/60/90 Day Milestones
  const slide7 = pptx.addSlide()
  slide7.addText('Milestone Timeline', {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })

  // 30-Day Milestones
  slide7.addText('Next 30 Days', {
    x: 0.5,
    y: 1,
    w: 3,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: '2563EB',
  })

  const ms30Data: any[] = [
    [
      { text: 'Milestone', options: { bold: true, fill: '2563EB', color: 'FFFFFF', fontSize: 10 } },
      { text: 'Project', options: { bold: true, fill: '2563EB', color: 'FFFFFF', fontSize: 10 } },
      { text: 'Due', options: { bold: true, fill: '2563EB', color: 'FFFFFF', fontSize: 10 } },
    ],
    ...data.milestones.next30Days.slice(0, 5).map(m => [
      { text: m.name.substring(0, 25), options: { fontSize: 9 } },
      { text: m.project.substring(0, 15), options: { fontSize: 9 } },
      { text: m.dueDate, options: { fontSize: 9 } },
    ]),
  ]

  slide7.addTable(ms30Data, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1.3,
    fontSize: 9,
    border: { pt: 1, color: 'CCCCCC' },
  })

  // 60-Day Milestones
  slide7.addText('31-60 Days', {
    x: 0.5,
    y: 3,
    w: 3,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: '6366F1',
  })

  const ms60Data: any[] = [
    [
      { text: 'Milestone', options: { bold: true, fill: '6366F1', color: 'FFFFFF', fontSize: 10 } },
      { text: 'Project', options: { bold: true, fill: '6366F1', color: 'FFFFFF', fontSize: 10 } },
      { text: 'Due', options: { bold: true, fill: '6366F1', color: 'FFFFFF', fontSize: 10 } },
    ],
    ...data.milestones.next60Days.slice(0, 5).map(m => [
      { text: m.name.substring(0, 25), options: { fontSize: 9 } },
      { text: m.project.substring(0, 15), options: { fontSize: 9 } },
      { text: m.dueDate, options: { fontSize: 9 } },
    ]),
  ]

  slide7.addTable(ms60Data, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 1.3,
    fontSize: 9,
    border: { pt: 1, color: 'CCCCCC' },
  })

  // 90-Day Milestones
  if (data.milestones.next90Days.length > 0) {
    slide7.addText('61-90 Days', {
      x: 0.5,
      y: 5,
      w: 3,
      h: 0.3,
      fontSize: 14,
      bold: true,
      color: '8B5CF6',
    })

    slide7.addText(`${data.milestones.next90Days.length} milestones scheduled`, {
      x: 0.5,
      y: 5.5,
      w: 9,
      h: 0.3,
      fontSize: 12,
      color: '6B7280',
    })
  }

  return pptx
}
