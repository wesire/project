'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/lib/api-client'

interface Cashflow {
  id: string
  date: string
  type: 'INFLOW' | 'OUTFLOW'
  category: string
  description: string
  forecast: number
  actual: number | null
  variance: number
}

export default function CashflowPage() {
  const [cashflows, setCashflows] = useState<Cashflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCashflows()
  }, [])

  const fetchCashflows = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFetch('/api/cashflows')
      if (!response.ok) {
        throw new Error(`Failed to fetch cashflows: ${response.statusText}`)
      }
      // API returns paginated response: { data: Cashflow[], total: number, page: number, perPage: number }
      const data = await response.json()
      setCashflows(data.data || [])
    } catch (err) {
      console.error('Error fetching cashflows:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cashflows. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'Pending'
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const totalForecastInflow = cashflows
    .filter(c => c.type === 'INFLOW')
    .reduce((sum, c) => sum + c.forecast, 0)
  
  const totalActualInflow = cashflows
    .filter(c => c.type === 'INFLOW' && c.actual !== null)
    .reduce((sum, c) => sum + (c.actual || 0), 0)
  
  const totalForecastOutflow = cashflows
    .filter(c => c.type === 'OUTFLOW')
    .reduce((sum, c) => sum + c.forecast, 0)
  
  const totalActualOutflow = cashflows
    .filter(c => c.type === 'OUTFLOW' && c.actual !== null)
    .reduce((sum, c) => sum + (c.actual || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Cashflow Management</h1>
                <p className="text-green-100 mt-1">Forecast vs actual financial tracking</p>
              </div>
              <Link href="/" className="btn bg-green-700 hover:bg-green-800 text-white">
                ← Home
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading cashflow data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Cashflow Management</h1>
                <p className="text-green-100 mt-1">Forecast vs actual financial tracking</p>
              </div>
              <Link href="/" className="btn bg-green-700 hover:bg-green-800 text-white">
                ← Home
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Cashflows</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchCashflows}
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Cashflow Management</h1>
              <p className="text-green-100 mt-1">Forecast vs actual financial tracking</p>
            </div>
            <Link href="/" className="btn bg-green-700 hover:bg-green-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Forecast Inflow</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalForecastInflow)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Actual Inflow</h3>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(totalActualInflow)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Forecast Outflow</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalForecastOutflow)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-sm text-gray-600 mb-1">Actual Outflow</h3>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(totalActualOutflow)}
            </p>
          </div>
        </div>

        {/* Net Position */}
        <div className="card mb-8 bg-blue-50 border-2 border-blue-300">
          <h3 className="text-lg font-semibold mb-4">Net Cash Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Forecast Net</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalForecastInflow - totalForecastOutflow)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Actual Net</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(totalActualInflow - totalActualOutflow)}
              </p>
            </div>
          </div>
        </div>

        {/* Cashflow Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Cashflow Transactions</h2>
            <button className="btn btn-primary">+ Add Transaction</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Forecast</th>
                  <th className="p-3 text-right">Actual</th>
                  <th className="p-3 text-right">Variance</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cashflows.map(cashflow => (
                  <tr key={cashflow.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(cashflow.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        cashflow.type === 'INFLOW' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cashflow.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {cashflow.category}
                      </span>
                    </td>
                    <td className="p-3">{cashflow.description}</td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(cashflow.forecast)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {formatCurrency(cashflow.actual)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-semibold ${
                        cashflow.actual === null 
                          ? 'text-gray-500'
                          : cashflow.variance > 0 
                          ? 'text-red-600' 
                          : cashflow.variance < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}>
                        {cashflow.actual === null ? '-' : formatCurrency(Math.abs(cashflow.variance))}
                      </span>
                    </td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      {cashflow.actual === null && (
                        <button className="text-green-600 hover:text-green-800">Record Actual</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Chart Placeholder */}
        <div className="card mt-8">
          <h2 className="text-2xl font-bold mb-4">Cashflow Trend</h2>
          <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p>Cashflow chart visualization</p>
              <p className="text-sm">(Forecast vs Actual over time)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
