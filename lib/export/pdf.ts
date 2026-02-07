import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ProjectData {
  projectNumber: string
  name: string
  status: string
  budget: number
  actualCost: number
  spi: number
  cpi: number
  eac: number
}

export function generateProjectPDF(project: ProjectData): jsPDF {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Construction Project Report', 20, 20)
  
  // Project Details
  doc.setFontSize(12)
  doc.text(`Project: ${project.name}`, 20, 40)
  doc.text(`Project Number: ${project.projectNumber}`, 20, 50)
  doc.text(`Status: ${project.status}`, 20, 60)
  
  // Financial Summary
  doc.setFontSize(16)
  doc.text('Financial Summary', 20, 80)
  doc.setFontSize(12)
  doc.text(`Budget: £${project.budget.toLocaleString('en-GB')}`, 20, 95)
  doc.text(`Actual Cost: £${project.actualCost.toLocaleString('en-GB')}`, 20, 105)
  doc.text(`EAC: £${project.eac.toLocaleString('en-GB')}`, 20, 115)
  
  // Performance Metrics
  doc.setFontSize(16)
  doc.text('Performance Metrics', 20, 135)
  doc.setFontSize(12)
  doc.text(`SPI (Schedule Performance Index): ${project.spi.toFixed(2)}`, 20, 150)
  doc.text(`CPI (Cost Performance Index): ${project.cpi.toFixed(2)}`, 20, 160)
  
  // RAG Status
  const ragStatus = project.spi >= 0.95 && project.cpi >= 0.95 ? 'GREEN' : 
                    project.spi >= 0.85 && project.cpi >= 0.85 ? 'AMBER' : 'RED'
  doc.text(`Overall RAG Status: ${ragStatus}`, 20, 170)
  
  return doc
}

export function generateExecutiveSummaryPDF(data: {
  totalProjects: number
  activeProjects: number
  totalBudget: number
  totalActualCost: number
  avgSPI: number
  avgCPI: number
  criticalRisks: number
  openIssues: number
}): jsPDF {
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(24)
  doc.text('Executive Summary', 20, 20)
  
  doc.setFontSize(14)
  doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 35)
  
  // Portfolio Overview
  doc.setFontSize(18)
  doc.text('Portfolio Overview', 20, 55)
  doc.setFontSize(12)
  doc.text(`Total Projects: ${data.totalProjects}`, 20, 70)
  doc.text(`Active Projects: ${data.activeProjects}`, 20, 80)
  
  // Financial Summary
  doc.setFontSize(18)
  doc.text('Financial Summary', 20, 100)
  doc.setFontSize(12)
  doc.text(`Total Budget: £${data.totalBudget.toLocaleString('en-GB')}`, 20, 115)
  doc.text(`Total Actual Cost: £${data.totalActualCost.toLocaleString('en-GB')}`, 20, 125)
  doc.text(`Variance: £${(data.totalActualCost - data.totalBudget).toLocaleString('en-GB')}`, 20, 135)
  
  // Performance
  doc.setFontSize(18)
  doc.text('Performance', 20, 155)
  doc.setFontSize(12)
  doc.text(`Average SPI: ${data.avgSPI.toFixed(2)}`, 20, 170)
  doc.text(`Average CPI: ${data.avgCPI.toFixed(2)}`, 20, 180)
  
  // Risk & Issues
  doc.setFontSize(18)
  doc.text('Risk & Issues', 20, 200)
  doc.setFontSize(12)
  doc.text(`Critical Risks: ${data.criticalRisks}`, 20, 215)
  doc.text(`Open Issues: ${data.openIssues}`, 20, 225)
  
  return doc
}
