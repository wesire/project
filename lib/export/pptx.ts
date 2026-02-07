import pptxgen from 'pptxgenjs'

export interface ExecutivePresentationData {
  summary: {
    totalProjects: number
    activeProjects: number
    totalBudget: number
    totalActualCost: number
    avgSPI: number
    avgCPI: number
  }
  ragStatus: {
    red: number
    amber: number
    green: number
  }
  topRisks: Array<{
    title: string
    score: number
    status: string
  }>
  criticalIssues: Array<{
    title: string
    status: string
    priority: string
  }>
}

export function generateExecutivePresentationPPTX(data: ExecutivePresentationData): pptxgen {
  const pptx = new pptxgen()
  
  // Slide 1: Title
  const slide1 = pptx.addSlide()
  slide1.background = { color: '2563EB' }
  slide1.addText('Construction Project Portfolio', {
    x: 0.5,
    y: 2,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  slide1.addText('Executive Summary Report', {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.5,
    fontSize: 28,
    color: 'E0E0E0',
    align: 'center',
  })
  slide1.addText(new Date().toLocaleDateString('en-GB'), {
    x: 0.5,
    y: 5,
    w: 9,
    h: 0.3,
    fontSize: 18,
    color: 'FFFFFF',
    align: 'center',
  })
  
  // Slide 2: Portfolio Overview
  const slide2 = pptx.addSlide()
  slide2.addText('Portfolio Overview', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })
  
  const overviewData: any[] = [
    [
      { text: 'Metric', options: { bold: true, fill: '2563EB', color: 'FFFFFF' } },
      { text: 'Value', options: { bold: true, fill: '2563EB', color: 'FFFFFF' } },
    ],
    [
      { text: 'Total Projects', options: {} },
      { text: data.summary.totalProjects.toString(), options: {} },
    ],
    [
      { text: 'Active Projects', options: {} },
      { text: data.summary.activeProjects.toString(), options: {} },
    ],
    [
      { text: 'Total Budget', options: {} },
      { text: `£${data.summary.totalBudget.toLocaleString('en-GB')}`, options: {} },
    ],
    [
      { text: 'Actual Cost', options: {} },
      { text: `£${data.summary.totalActualCost.toLocaleString('en-GB')}`, options: {} },
    ],
    [
      { text: 'Variance', options: {} },
      { text: `£${(data.summary.totalActualCost - data.summary.totalBudget).toLocaleString('en-GB')}`, options: {} },
    ],
  ]
  
  slide2.addTable(overviewData, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 3,
    fontSize: 16,
    border: { pt: 1, color: 'CCCCCC' },
  })
  
  // Slide 3: Performance Metrics
  const slide3 = pptx.addSlide()
  slide3.addText('Performance Metrics', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })
  
  // SPI Box
  const spiColor = data.summary.avgSPI >= 0.95 ? '22C55E' : 
                    data.summary.avgSPI >= 0.85 ? 'F59E0B' : 'EF4444'
  slide3.addShape(pptx.ShapeType.rect, {
    x: 1,
    y: 1.5,
    w: 3.5,
    h: 2,
    fill: { color: spiColor },
  })
  slide3.addText('SPI', {
    x: 1,
    y: 1.7,
    w: 3.5,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  slide3.addText(data.summary.avgSPI.toFixed(2), {
    x: 1,
    y: 2.5,
    w: 3.5,
    h: 0.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  
  // CPI Box
  const cpiColor = data.summary.avgCPI >= 0.95 ? '22C55E' : 
                    data.summary.avgCPI >= 0.85 ? 'F59E0B' : 'EF4444'
  slide3.addShape(pptx.ShapeType.rect, {
    x: 5.5,
    y: 1.5,
    w: 3.5,
    h: 2,
    fill: { color: cpiColor },
  })
  slide3.addText('CPI', {
    x: 5.5,
    y: 1.7,
    w: 3.5,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  slide3.addText(data.summary.avgCPI.toFixed(2), {
    x: 5.5,
    y: 2.5,
    w: 3.5,
    h: 0.5,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  })
  
  // Slide 4: RAG Status
  const slide4 = pptx.addSlide()
  slide4.addText('Project RAG Status', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })
  
  // RAG bars
  const ragData: any[] = [
    [
      { text: 'Status', options: { bold: true, fill: '6B7280', color: 'FFFFFF' } },
      { text: 'Projects', options: { bold: true, fill: '6B7280', color: 'FFFFFF' } },
    ],
    [
      { text: 'Green', options: { fill: '22C55E', color: 'FFFFFF', bold: true } },
      { text: data.ragStatus.green.toString(), options: { fill: 'D1FAE5' } },
    ],
    [
      { text: 'Amber', options: { fill: 'F59E0B', color: 'FFFFFF', bold: true } },
      { text: data.ragStatus.amber.toString(), options: { fill: 'FEF3C7' } },
    ],
    [
      { text: 'Red', options: { fill: 'EF4444', color: 'FFFFFF', bold: true } },
      { text: data.ragStatus.red.toString(), options: { fill: 'FEE2E2' } },
    ],
  ]
  
  slide4.addTable(ragData, {
    x: 2.5,
    y: 2,
    w: 5,
    h: 2.5,
    fontSize: 20,
    border: { pt: 1, color: 'CCCCCC' },
  })
  
  // Slide 5: Top Risks
  const slide5 = pptx.addSlide()
  slide5.addText('Top Risks', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true,
    color: '1F2937',
  })
  
  const risksData: any[] = [
    [
      { text: 'Risk', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
      { text: 'Score', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
      { text: 'Status', options: { bold: true, fill: 'EF4444', color: 'FFFFFF' } },
    ],
    ...data.topRisks.map(risk => [
      { text: risk.title, options: {} },
      { text: risk.score.toString(), options: {} },
      { text: risk.status, options: {} },
    ]),
  ]
  
  slide5.addTable(risksData, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3,
    fontSize: 14,
    border: { pt: 1, color: 'CCCCCC' },
  })
  
  return pptx
}
