'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Procurement {
  id: string
  poNumber: string
  vendor: string
  description: string
  status: 'REQUESTED' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'INVOICED' | 'PAID'
  orderValue: number
  paidAmount: number
  orderDate: string
  deliveryDate: string | null
  createdAt: string
  project: {
    id: string
    name: string
    projectNumber: string
  }
}

export default function ProcurementPage() {
  const [procurements, setProcurements] = useState<Procurement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      setIsAuthenticated(false)
      setAuthLoading(false)
      setLoading(false)
      return
    }
    
    setIsAuthenticated(true)
    setAuthLoading(false)
    fetchProcurements()
  }, [])

  const handleLogin = () => {
    router.push('/login?returnUrl=/procurement')
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchProcurements()
    }
  }, [isAuthenticated])

  const fetchProcurements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/procurement')
      if (!response.ok) {
        throw new Error('Failed to fetch procurement orders')
      }
      const result = await response.json()
      setProcurements(result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProcurements([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REQUESTED': return 'bg-gray-100 text-gray-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'ORDERED': return 'bg-yellow-100 text-yellow-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'INVOICED': return 'bg-purple-100 text-purple-800'
      case 'PAID': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProcurements = statusFilter === 'ALL' 
    ? procurements 
    : procurements.filter(p => p.status === statusFilter)

  const totalOrderValue = procurements.reduce((sum, p) => sum + p.orderValue, 0)
  const totalPaidAmount = procurements.reduce((sum, p) => sum + p.paidAmount, 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-indigo-600 text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access procurement.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleLogin}
                className="btn btn-primary w-full"
              >
                Sign In
              </button>
              <Link 
                href="/"
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full inline-block text-center"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🛒 Procurement</h1>
              <p className="text-indigo-100 mt-1">Purchase orders and vendor management</p>
            </div>
            <Link href="/" className="btn bg-indigo-700 hover:bg-indigo-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-indigo-600">{procurements.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Value</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalOrderValue)}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Paid</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaidAmount)}</p>
          </div>
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Outstanding</h3>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalOrderValue - totalPaidAmount)}
            </p>
          </div>
        </div>

        {/* Procurement List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Purchase Orders</h2>
            <div className="flex gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded"
              >
                <option value="ALL">All Status</option>
                <option value="REQUESTED">Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="ORDERED">Ordered</option>
                <option value="DELIVERED">Delivered</option>
                <option value="INVOICED">Invoiced</option>
                <option value="PAID">Paid</option>
              </select>
              <button className="btn btn-primary">+ New Order</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading procurement orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button onClick={fetchProcurements} className="btn btn-primary">Retry</button>
            </div>
          ) : filteredProcurements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">No purchase orders found</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'ALL' 
                  ? 'Try changing the status filter or create a new order.'
                  : 'Create your first purchase order to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">PO #</th>
                    <th className="p-3 text-left">Vendor</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Order Value</th>
                    <th className="p-3 text-left">Paid</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">Order Date</th>
                    <th className="p-3 text-left">Delivery Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProcurements.map(procurement => (
                    <tr key={procurement.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{procurement.poNumber}</td>
                      <td className="p-3 font-semibold">{procurement.vendor}</td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">{procurement.description}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(procurement.status)}`}>
                          {procurement.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">
                        {formatCurrency(procurement.orderValue)}
                      </td>
                      <td className="p-3">
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(procurement.paidAmount)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-mono text-xs">{procurement.project.projectNumber}</div>
                        <div className="text-gray-600">{procurement.project.name}</div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(procurement.orderDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm">
                        {procurement.deliveryDate 
                          ? new Date(procurement.deliveryDate).toLocaleDateString() 
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
