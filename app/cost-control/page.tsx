'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface CostAnalytics {
  project: {
    id: string
    name: string
    projectNumber: string
    budget: number
    actualCost: number
    currency: string
  }
  costSummary: {
    budget: number
    actualCost: number
    committedCost: number
    approvedVariations: number
    totalBudget: number
    eac: number
    variance: number
    margin: number
    marginPercentage: number
    marginThreshold: number
  }
  performanceIndices: {
    cpi: number
    spi: number
  }
  cashflow: {
    period: string
    aggregated: Array<{
      period: string
      forecastInflow: number
      forecastOutflow: number
      actualInflow: number
      actualOutflow: number
    }>
    sCurve: Array<{
      date: Date
      cumulativeForecast: number
      cumulativeActual: number | null
    }>
  }
  eacTrend: Array<{
    id: string
    eac: number
    margin: number
    marginPercentage: number
    cpi: number
    spi: number
    recordedAt: Date
  }>
  alerts: Array<{
    id: string
    type: string
    severity: string
    title: string
    message: string
    status: string
    createdAt: Date
  }>
}

export default function CostControlPage() {
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly')
  const [projects, setProjects] = useState<Array<{ id: string; name: string; projectNumber: string }>>([])

  useEffect(() => {
    // Fetch projects list
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setProjects(data.data)
          setSelectedProject(data.data[0].id)
        }
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!selectedProject) return

    setLoading(true)
    fetch(\`/api/cost-control/analytics?projectId=\${selectedProject}&period=\${period}\`)
      .then(res => res.json())
      .then(data => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [selectedProject, period])

  const formatCurrency = (amount: number) => {
    const currency = analytics?.project?.currency || 'GBP'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cost control analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Go Home
          </Link>
        </div>
      </div>
    )
  }

  const { costSummary, performanceIndices, cashflow, eacTrend, alerts } = analytics

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Cashflow & Cost Control</h1>
              <p className="text-blue-100 mt-1">
                {analytics.project.name} ({analytics.project.projectNumber})
              </p>
            </div>
            <Link href="/" className="btn bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Project Selector and Period Toggle */}
        <div className="card mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectNumber} - {proj.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cashflow Period
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('weekly')}
                  className={\`px-4 py-2 rounded \${
                    period === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }\`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setPeriod('monthly')}
                  className={\`px-4 py-2 rounded \${
                    period === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }\`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🚨 Active Alerts</h2>
            <div className="grid grid-cols-1 gap-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={\`p-4 bg-white rounded-lg shadow border-2 \${getSeverityColor(alert.severity)}\`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg">{alert.title}</span>
                        <span className={\`px-2 py-1 text-xs rounded font-semibold \${getSeverityColor(alert.severity)}\`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Total Budget</h3>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(costSummary.totalBudget)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Original: {formatCurrency(costSummary.budget)}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Actual Cost</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(costSummary.actualCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Spent to date
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">Committed Cost</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(costSummary.committedCost)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Contracted but not paid
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-1">EAC</h3>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(costSummary.eac)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Estimate at Completion
            </p>
          </div>
        </div>

        {/* Margin and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Margin Analysis</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Margin</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(costSummary.margin)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Margin %</span>
                  <span className={\`text-xl font-bold \${
                    costSummary.marginPercentage >= costSummary.marginThreshold
                      ? 'text-green-600'
                      : 'text-red-600'
                  }\`}>
                    {costSummary.marginPercentage.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={\`h-full \${
                      costSummary.marginPercentage >= costSummary.marginThreshold
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }\`}
                    style={{ width: \`\${Math.min(100, Math.max(0, costSummary.marginPercentage))}%\` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Threshold: {costSummary.marginThreshold}%
                </p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Approved Variations</span>
                  <span className="font-semibold">
                    {formatCurrency(costSummary.approvedVariations)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Variance (Budget - EAC)</span>
                  <span className={\`font-semibold \${
                    costSummary.variance >= 0 ? 'text-green-600' : 'text-red-600'
                  }\`}>
                    {formatCurrency(costSummary.variance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Performance Indices</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">CPI (Cost Performance Index)</span>
                  <span className={\`text-2xl font-bold \${
                    performanceIndices.cpi >= 1 ? 'text-green-600' : 'text-red-600'
                  }\`}>
                    {performanceIndices.cpi.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={\`h-full \${performanceIndices.cpi >= 1 ? 'bg-green-500' : 'bg-red-500'}\`}
                    style={{ width: \`\${Math.min(100, performanceIndices.cpi * 100)}%\` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {performanceIndices.cpi >= 1 ? 'Under budget' : 'Over budget'}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">SPI (Schedule Performance Index)</span>
                  <span className={\`text-2xl font-bold \${
                    performanceIndices.spi >= 1 ? 'text-green-600' : 'text-red-600'
                  }\`}>
                    {performanceIndices.spi.toFixed(2)}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={\`h-full \${performanceIndices.spi >= 1 ? 'bg-green-500' : 'bg-red-500'}\`}
                    style={{ width: \`\${Math.min(100, performanceIndices.spi * 100)}%\` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {performanceIndices.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow - Planned vs Actual */}
        <div className="p-4 bg-white rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Planned vs Actual Cash Flow ({period === 'weekly' ? 'Weekly' : 'Monthly'})
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cashflow.aggregated}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="forecastInflow" fill="#10b981" name="Forecast Inflow" />
              <Bar dataKey="actualInflow" fill="#059669" name="Actual Inflow" />
              <Bar dataKey="forecastOutflow" fill="#ef4444" name="Forecast Outflow" />
              <Bar dataKey="actualOutflow" fill="#dc2626" name="Actual Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* S-Curve */}
        <div className="p-4 bg-white rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">S-Curve: Cumulative Cash Flow</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={cashflow.sCurve}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => formatDate(date)}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="cumulativeForecast"
                stroke="#3b82f6"
                fill="url(#colorForecast)"
                name="Planned Cumulative"
              />
              <Area
                type="monotone"
                dataKey="cumulativeActual"
                stroke="#10b981"
                fill="url(#colorActual)"
                name="Actual Cumulative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* EAC Trend */}
        {eacTrend.length > 0 && (
          <div className="p-4 bg-white rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">EAC Trend Analysis</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={eacTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="recordedAt"
                  tickFormatter={(date) => formatDate(date)}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(date) => formatDate(date)}
                  formatter={(value, name) => {
                    if (name === 'Margin %' || name === 'CPI' || name === 'SPI') {
                      return Number(value).toFixed(2)
                    }
                    return formatCurrency(Number(value))
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="eac"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="EAC"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="margin"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Margin"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="marginPercentage"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Margin %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  )
}
