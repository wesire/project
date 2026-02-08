// CSV export utilities

export interface RiskExportData {
  riskNumber: string
  title: string
  description: string
  category: string
  probability: number
  impact: number
  score: number
  level: string
  status: string
  owner?: string
  mitigation?: string
  contingency?: string
  mitigationDueDate?: string
  createdAt: string
  updatedAt: string
}

export function generateRiskRegisterCSV(risks: RiskExportData[]): string {
  // CSV Headers
  const headers = [
    'Risk ID',
    'Title',
    'Description',
    'Category',
    'Probability',
    'Impact',
    'Score',
    'Level',
    'Status',
    'Owner',
    'Mitigation',
    'Contingency',
    'Mitigation Due Date',
    'Created At',
    'Updated At'
  ]
  
  // Helper function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  
  // Build CSV content
  const rows = [headers.join(',')]
  
  risks.forEach(risk => {
    const row = [
      escapeCSV(risk.riskNumber),
      escapeCSV(risk.title),
      escapeCSV(risk.description),
      escapeCSV(risk.category),
      escapeCSV(risk.probability),
      escapeCSV(risk.impact),
      escapeCSV(risk.score),
      escapeCSV(risk.level),
      escapeCSV(risk.status),
      escapeCSV(risk.owner || ''),
      escapeCSV(risk.mitigation || ''),
      escapeCSV(risk.contingency || ''),
      escapeCSV(risk.mitigationDueDate || ''),
      escapeCSV(risk.createdAt),
      escapeCSV(risk.updatedAt)
    ]
    rows.push(row.join(','))
  })
  
  return rows.join('\n')
}
