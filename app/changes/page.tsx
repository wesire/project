'use client'

import Link from 'next/link'

export default function ChangesPage() {
  const changes = [
    {
      id: '1',
      changeNumber: 'CHG001',
      title: 'Additional Floor Space Request',
      description: 'Client requested additional 500 sq ft on ground floor',
      status: 'APPROVED',
      requestedBy: 'John Smith',
      approvedBy: 'Sarah Johnson',
      costImpact: 45000,
      timeImpact: 14,
      submittedDate: '2024-02-01',
      approvedDate: '2024-02-05',
      scopeImpact: 'Extend ground floor by 500 sq ft to accommodate additional office space',
    },
    {
      id: '2',
      changeNumber: 'CHG002',
      title: 'HVAC System Upgrade',
      description: 'Upgrade to energy-efficient HVAC system',
      status: 'UNDER_REVIEW',
      requestedBy: 'Mike Johnson',
      approvedBy: null,
      costImpact: 28000,
      timeImpact: 7,
      submittedDate: '2024-02-10',
      approvedDate: null,
      scopeImpact: 'Replace standard HVAC with high-efficiency system',
    },
    {
      id: '3',
      changeNumber: 'CHG003',
      title: 'Fire Safety Enhancement',
      description: 'Additional fire suppression system in server room',
      status: 'IMPLEMENTED',
      requestedBy: 'David Brown',
      approvedBy: 'Sarah Johnson',
      costImpact: 12500,
      timeImpact: 3,
      submittedDate: '2024-01-20',
      approvedDate: '2024-01-22',
      scopeImpact: 'Install FM-200 fire suppression system in server room',
    },
    {
      id: '4',
      changeNumber: 'CHG004',
      title: 'Window Specification Change',
      description: 'Upgrade from double to triple glazed windows',
      status: 'DRAFT',
      requestedBy: 'Emma Wilson',
      approvedBy: null,
      costImpact: 18000,
      timeImpact: 5,
      submittedDate: null,
      approvedDate: null,
      scopeImpact: 'Replace all windows with triple-glazed units for better insulation',
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'IMPLEMENTED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalCostImpact = changes.reduce((sum, change) => sum + change.costImpact, 0)
  const totalTimeImpact = changes.reduce((sum, change) => sum + change.timeImpact, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-orange-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Change Log</h1>
              <p className="text-orange-100 mt-1">Track change orders with cost and time impact</p>
            </div>
            <Link href="/" className="btn bg-orange-700 hover:bg-orange-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Changes</h3>
            <p className="text-3xl font-bold text-orange-600">{changes.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Approved</h3>
            <p className="text-3xl font-bold text-green-600">
              {changes.filter(c => c.status === 'APPROVED' || c.status === 'IMPLEMENTED').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-red-50 to-red-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Cost Impact</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalCostImpact)}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Time Impact</h3>
            <p className="text-3xl font-bold text-blue-600">{totalTimeImpact} days</p>
          </div>
        </div>

        {/* Change Orders List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Change Orders</h2>
            <button className="btn btn-primary">+ New Change Order</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Change #</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Requested By</th>
                  <th className="p-3 text-left">Cost Impact</th>
                  <th className="p-3 text-left">Time Impact</th>
                  <th className="p-3 text-left">Submitted</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {changes.map(change => (
                  <tr key={change.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{change.changeNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold">{change.title}</div>
                      <div className="text-sm text-gray-600">{change.description}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(change.status)}`}>
                        {change.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">{change.requestedBy}</td>
                    <td className="p-3">
                      <span className="font-semibold text-red-600">
                        {formatCurrency(change.costImpact)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-blue-600">
                        +{change.timeImpact} days
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {change.submittedDate 
                        ? new Date(change.submittedDate).toLocaleDateString('en-GB')
                        : '-'
                      }
                    </td>
                    <td className="p-3">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow Information */}
        <div className="card mt-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Change Order Workflow</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-3 py-2 bg-gray-100 text-gray-800 rounded font-semibold">DRAFT</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded font-semibold">SUBMITTED</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded font-semibold">UNDER REVIEW</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-2 bg-green-100 text-green-800 rounded font-semibold">APPROVED</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-2 bg-purple-100 text-purple-800 rounded font-semibold">IMPLEMENTED</span>
          </div>
          <div className="mt-4 text-sm text-gray-700">
            <p className="mb-2"><strong>Note:</strong> Change orders can also be:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Moved back to DRAFT from SUBMITTED or UNDER_REVIEW for revision</li>
              <li>REJECTED during review (can be revised and resubmitted)</li>
              <li>Each change captures scope, cost, and time impact</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
