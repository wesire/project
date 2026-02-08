'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface KPIs {
  totalBudget: number
  totalActual: number
  eac: number
  margin: number
  marginPercentage: number
  spi: number
  cpi: number
  percentComplete: number
}

interface RAGStatus {
  red: number
  amber: number
  green: number
}

interface Risk {
  id: string
  projectId: string
  projectName: string
  riskNumber: string
  title: string
  category: string
  probability: number
  impact: number
  score: number
  status: string
}

interface Change {
  id: string
  projectId: string
  projectName: string
  changeNumber: string
  title: string
  status: string
  costImpact: number
  timeImpact: number
  submittedDate: string
}

interface Milestone {
  id: string
  projectId: string
  projectName: string
  name: string
  dueDate: string
  status: string
  progress: number
}

interface VarianceData {
  month: string
  budgetVariance: number
  scheduleVariance: number
}

interface DashboardData {
  kpis: KPIs
  ragStatus: RAGStatus
  topRisks: Risk[]
  pendingChanges: Change[]
  upcomingMilestones: Milestone[]
  varianceData: VarianceData[]
}

export default function PortfolioDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For development, we'll use mock token or handle auth later
      const token = localStorage.getItem('authToken') || 'dev-token'
      
      const response = await fetch('/api/portfolio/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getRAGClass = (value: number, threshold1: number, threshold2: number) => {
    if (value >= threshold1) return 'rag-green'
    if (value >= threshold2) return 'rag-amber'
    return 'rag-red'
  }

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      OPEN: 'bg-red-100 text-red-800',
      ACCEPTED: 'bg-yellow-100 text-yellow-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-purple-100 text-purple-800',
      PENDING: 'bg-orange-100 text-orange-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data'}</p>
            <button 
              onClick={fetchDashboardData}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { kpis, ragStatus, topRisks, pendingChanges, upcomingMilestones, varianceData } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Portfolio Dashboard</h1>
              <p className="text-blue-100">Comprehensive project portfolio overview and KPIs</p>
            </div>
            <Link href="/" className="btn bg-blue-800 hover:bg-blue-900 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Key Performance Indicators */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Budget */}
            <div className="card border-l-4 border-blue-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Budget</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(kpis.totalBudget)}</p>
              <p className="text-sm text-gray-500 mt-1">Portfolio baseline</p>
            </div>

            {/* Actual Cost */}
            <div className="card border-l-4 border-purple-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Actual Cost</h3>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(kpis.totalActual)}</p>
              <p className="text-sm text-gray-500 mt-1">Total spend to date</p>
            </div>

            {/* EAC */}
            <div className="card border-l-4 border-orange-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Estimate at Completion (EAC)</h3>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(kpis.eac)}</p>
              <p className={`text-sm mt-1 ${kpis.eac > kpis.totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                Variance: {formatCurrency(kpis.eac - kpis.totalBudget)}
              </p>
            </div>

            {/* Margin */}
            <div className="card border-l-4 border-green-500">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Margin</h3>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(kpis.margin)}</p>
              <p className="text-sm text-gray-500 mt-1">
                {kpis.marginPercentage.toFixed(1)}% of budget
              </p>
            </div>

            {/* SPI */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Schedule Performance (SPI)</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{kpis.spi.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {kpis.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getRAGClass(kpis.spi, 0.95, 0.85)}`}>
                  {kpis.spi >= 0.95 ? '✓' : kpis.spi >= 0.85 ? '!' : '✗'}
                </div>
              </div>
            </div>

            {/* CPI */}
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">Cost Performance (CPI)</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{kpis.cpi.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {kpis.cpi >= 1 ? 'Under budget' : 'Over budget'}
                  </p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${getRAGClass(kpis.cpi, 0.95, 0.85)}`}>
                  {kpis.cpi >= 0.95 ? '✓' : kpis.cpi >= 0.85 ? '!' : '✗'}
                </div>
              </div>
            </div>

            {/* Percent Complete */}
            <div className="card border-l-4 border-indigo-500 col-span-1 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Portfolio % Complete</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div 
                      className="bg-indigo-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ width: `${Math.min(100, kpis.percentComplete)}%` }}
                    >
                      {kpis.percentComplete.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <p className="text-4xl font-bold text-indigo-600">{kpis.percentComplete.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* RAG Status */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">RAG Status Overview</h2>
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-red-50 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-red-800">Red Projects</span>
                    <p className="text-5xl font-bold text-red-600 mt-2">{ragStatus.red}</p>
                  </div>
                  <div className="text-6xl">🔴</div>
                </div>
                <p className="text-sm text-red-700 mt-3">Critical attention required</p>
              </div>
              <div className="p-6 rounded-lg bg-orange-50 border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-orange-800">Amber Projects</span>
                    <p className="text-5xl font-bold text-orange-600 mt-2">{ragStatus.amber}</p>
                  </div>
                  <div className="text-6xl">🟡</div>
                </div>
                <p className="text-sm text-orange-700 mt-3">At risk, monitor closely</p>
              </div>
              <div className="p-6 rounded-lg bg-green-50 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-green-800">Green Projects</span>
                    <p className="text-5xl font-bold text-green-600 mt-2">{ragStatus.green}</p>
                  </div>
                  <div className="text-6xl">🟢</div>
                </div>
                <p className="text-sm text-green-700 mt-3">On track and healthy</p>
              </div>
            </div>
          </div>
        </section>

        {/* Variance Charts */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Variance Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Variance Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Budget Variance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="budgetVariance" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Budget Variance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Schedule Variance Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Schedule Variance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="scheduleVariance" 
                    fill="#8b5cf6" 
                    name="Schedule Variance"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Top Risks */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Risks</h2>
          <div className="card">
            {topRisks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Risk #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Probability</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Impact</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topRisks.map((risk) => (
                      <tr key={risk.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{risk.riskNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{risk.projectName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{risk.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{risk.category}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                            {risk.probability}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                            {risk.impact}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                            risk.score >= 20 ? 'bg-red-500 text-white' :
                            risk.score >= 12 ? 'bg-orange-500 text-white' :
                            'bg-yellow-500 text-white'
                          }`}>
                            {risk.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(risk.status)}`}>
                            {risk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No open risks found</p>
              </div>
            )}
          </div>
        </section>

        {/* Pending Changes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pending Change Orders</h2>
          <div className="card">
            {pendingChanges.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Change #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cost Impact</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Time Impact (days)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingChanges.map((change) => (
                      <tr key={change.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{change.changeNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{change.projectName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{change.title}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(change.status)}`}>
                            {change.status}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${
                          change.costImpact > 0 ? 'text-red-600' : change.costImpact < 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {formatCurrency(change.costImpact)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">{change.timeImpact}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(change.submittedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">✅</div>
                <p>No pending change orders</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Milestones */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Milestones</h2>
          <div className="card">
            {upcomingMilestones.length > 0 ? (
              <div className="space-y-4">
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.projectName}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900">{formatDate(milestone.dueDate)}</p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{milestone.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>No upcoming milestones</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/projects" className="card hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-800">Projects</h3>
            </Link>
            <Link href="/risks" className="card hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <h3 className="font-semibold text-gray-800">Risks</h3>
            </Link>
            <Link href="/dashboard" className="card hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800">Dashboard</h3>
            </Link>
            <Link href="/tasks" className="card hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-semibold text-gray-800">Tasks</h3>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
