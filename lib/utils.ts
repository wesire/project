import { format } from 'date-fns'

// UK Currency formatting
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// UK Date formatting
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy HH:mm')
}

// Calculate SPI (Schedule Performance Index)
export function calculateSPI(earnedValue: number, plannedValue: number): number {
  return plannedValue > 0 ? earnedValue / plannedValue : 0
}

// Calculate CPI (Cost Performance Index)
export function calculateCPI(earnedValue: number, actualCost: number): number {
  return actualCost > 0 ? earnedValue / actualCost : 0
}

// Calculate EAC (Estimate at Completion)
export function calculateEAC(budget: number, earnedValue: number, actualCost: number): number {
  const cpi = calculateCPI(earnedValue, actualCost)
  return cpi > 0 ? budget / cpi : budget
}

// Calculate variance
export function calculateVariance(planned: number, actual: number): number {
  return actual - planned
}

// Calculate percentage
export function calculatePercentage(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0
}

// RAG Status calculation
export type RAGStatus = 'RED' | 'AMBER' | 'GREEN'

export function getRAGStatus(percentage: number): RAGStatus {
  if (percentage >= 90) return 'GREEN'
  if (percentage >= 70) return 'AMBER'
  return 'RED'
}

export function getSPIRAGStatus(spi: number): RAGStatus {
  if (spi >= 0.95) return 'GREEN'
  if (spi >= 0.85) return 'AMBER'
  return 'RED'
}

export function getCPIRAGStatus(cpi: number): RAGStatus {
  if (cpi >= 0.95) return 'GREEN'
  if (cpi >= 0.85) return 'AMBER'
  return 'RED'
}

// Risk score helpers
export function calculateRiskScore(probability: number, impact: number): number {
  return probability * impact
}

export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 20) return 'CRITICAL'
  if (score >= 15) return 'HIGH'
  if (score >= 10) return 'MEDIUM'
  return 'LOW'
}
