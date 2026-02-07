'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  totalBudget: number
  totalActualCost: number
  spi: number
  cpi: number
  eac: number
  openRisks: number
  criticalRisks: number
  openIssues: number
  pendingChanges: number
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 12,
    activeProjects: 8,
    totalBudget: 5000000,
    totalActualCost: 4200000,
    spi: 0.92,
    cpi: 0.98,
    eac: 5100000,
    openRisks: 23,
    criticalRisks: 4,
    openIssues: 15,
    pendingChanges: 7,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const getRAGColor = (value: number, threshold1: number, threshold2: number) => {
    if (value >= threshold1) return 'rag-green'
    if (value >= threshold2) return 'rag-amber'
    return 'rag-red'
  }

  const getSPIRAGColor = (spi: number) => getRAGColor(spi, 0.95, 0.85)
  const getCPIRAGColor = (cpi: number) => getRAGColor(cpi, 0.95, 0.85)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Project Dashboard</h1>
              <p className="text-blue-100 mt-1">Real-time project metrics and KPIs</p>
            </div>
            <Link href="/" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Total Projects</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalProjects}</p>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.activeProjects} active
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Total Budget</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(metrics.totalBudget)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Spent: {formatCurrency(metrics.totalActualCost)}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Open Risks</h3>
            <p className="text-3xl font-bold text-orange-600">{metrics.openRisks}</p>
            <p className="text-sm text-red-600 mt-1">
              {metrics.criticalRisks} critical
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Open Issues</h3>
            <p className="text-3xl font-bold text-red-600">{metrics.openIssues}</p>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.pendingChanges} pending changes
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Schedule Performance (SPI)</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{metrics.spi.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {metrics.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
                </p>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getSPIRAGColor(metrics.spi)}`}>
                {metrics.spi >= 0.95 ? '✓' : metrics.spi >= 0.85 ? '!' : '✗'}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Cost Performance (CPI)</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{metrics.cpi.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {metrics.cpi >= 1 ? 'Under budget' : 'Over budget'}
                </p>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getCPIRAGColor(metrics.cpi)}`}>
                {metrics.cpi >= 0.95 ? '✓' : metrics.cpi >= 0.85 ? '!' : '✗'}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Estimate at Completion (EAC)</h3>
            <div>
              <p className="text-4xl font-bold text-purple-600">
                {formatCurrency(metrics.eac)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Budget: {formatCurrency(metrics.totalBudget)}</p>
              <p className="text-sm mt-2">
                Variance: <span className={metrics.eac > metrics.totalBudget ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(metrics.eac - metrics.totalBudget)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* RAG Status Grid */}
        <div className="card mb-8">
          <h3 className="text-xl font-bold mb-4">Project RAG Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-50 border-2 border-red-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-800">Red</span>
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <p className="text-sm text-red-700 mt-1">Critical attention needed</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 border-2 border-orange-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-orange-800">Amber</span>
                <span className="text-2xl font-bold text-orange-600">5</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">At risk, monitor closely</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-green-800">Green</span>
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <p className="text-sm text-green-700 mt-1">On track</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/projects" className="card hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-semibold">Projects</h3>
          </Link>
          <Link href="/risks" className="card hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <h3 className="font-semibold">Risks</h3>
          </Link>
          <Link href="/changes" className="card hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-2">🔄</div>
            <h3 className="font-semibold">Changes</h3>
          </Link>
          <Link href="/tasks" className="card hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-semibold">Tasks</h3>
          </Link>
        </div>

        {/* Alerts Section */}
        <div className="card mt-8 bg-yellow-50 border-2 border-yellow-300">
          <h3 className="text-xl font-bold mb-4 text-yellow-900">🔔 Active Alerts</h3>
          <ul className="space-y-3">
            <li className="p-3 bg-white rounded border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-red-700">Critical Risk Identified</p>
                  <p className="text-sm text-gray-600">Project Alpha - Foundation delays</p>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </div>
            </li>
            <li className="p-3 bg-white rounded border-l-4 border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-orange-700">Budget Variance Alert</p>
                  <p className="text-sm text-gray-600">Project Beta - 15% over budget</p>
                </div>
                <span className="text-xs text-gray-500">5h ago</span>
              </div>
            </li>
            <li className="p-3 bg-white rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-blue-700">RFI Response Due</p>
                  <p className="text-sm text-gray-600">3 RFIs require response today</p>
                </div>
                <span className="text-xs text-gray-500">1d ago</span>
              </div>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
