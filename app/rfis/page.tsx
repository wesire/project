'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface RFI {
  id: string
  rfiNumber: string
  title: string
  description: string
  status: 'OPEN' | 'RESPONDED' | 'CLOSED'
  requestedBy: string
  respondedBy: string | null
  requestDate: string
  dueDate: string | null
  responseDate: string | null
  response: string | null
  createdAt: string
  project: {
    id: string
    name: string
    projectNumber: string
  }
}

export default function RFIsPage() {
  const [rfis, setRfis] = useState<RFI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchRFIs()
  }, [])

  const fetchRFIs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rfis')
      if (!response.ok) {
        throw new Error('Failed to fetch RFIs')
      }
      const result = await response.json()
      setRfis(result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setRfis([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800'
      case 'RESPONDED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRFIs = statusFilter === 'ALL' 
    ? rfis 
    : rfis.filter(rfi => rfi.status === statusFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📨 RFIs</h1>
              <p className="text-blue-100 mt-1">Request for Information management</p>
            </div>
            <Link href="/" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total RFIs</h3>
            <p className="text-3xl font-bold text-blue-600">{rfis.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Open</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {rfis.filter(r => r.status === 'OPEN').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Responded</h3>
            <p className="text-3xl font-bold text-green-600">
              {rfis.filter(r => r.status === 'RESPONDED').length}
            </p>
          </div>
        </div>

        {/* RFIs List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Requests for Information</h2>
            <div className="flex gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="RESPONDED">Responded</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button className="btn btn-primary">+ New RFI</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading RFIs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button onClick={fetchRFIs} className="btn btn-primary">Retry</button>
            </div>
          ) : filteredRFIs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">No RFIs found</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'ALL' 
                  ? 'Try changing the status filter or create a new RFI.'
                  : 'Create your first RFI to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">RFI #</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Requested By</th>
                    <th className="p-3 text-left">Responded By</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">Request Date</th>
                    <th className="p-3 text-left">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRFIs.map(rfi => (
                    <tr key={rfi.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{rfi.rfiNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold">{rfi.title}</div>
                        <div className="text-sm text-gray-600">{rfi.description}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(rfi.status)}`}>
                          {rfi.status}
                        </span>
                      </td>
                      <td className="p-3">{rfi.requestedBy}</td>
                      <td className="p-3">{rfi.respondedBy || '-'}</td>
                      <td className="p-3 text-sm">
                        <div className="font-mono text-xs">{rfi.project.projectNumber}</div>
                        <div className="text-gray-600">{rfi.project.name}</div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(rfi.requestDate).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm">
                        {rfi.dueDate ? new Date(rfi.dueDate).toLocaleDateString() : '-'}
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
