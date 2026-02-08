'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Issue {
  id: string
  issueNumber: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  raisedBy: string
  assignedTo: string | null
  dueDate: string | null
  createdAt: string
  project: {
    id: string
    name: string
    projectNumber: string
  }
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
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
    fetchIssues()
  }, [])

  const handleLogin = () => {
    router.push('/login?returnUrl=/issues')
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchIssues()
    }
  }, [isAuthenticated])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/issues')
      if (!response.ok) {
        throw new Error('Failed to fetch issues')
      }
      const result = await response.json()
      setIssues(result.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'RESOLVED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredIssues = statusFilter === 'ALL' 
    ? issues 
    : issues.filter(issue => issue.status === statusFilter)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
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
            <div className="text-red-600 text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access issues.
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
      <header className="bg-red-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🔴 Issues</h1>
              <p className="text-red-100 mt-1">Issue tracking and resolution</p>
            </div>
            <Link href="/" className="btn bg-red-700 hover:bg-red-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-red-50 to-red-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Issues</h3>
            <p className="text-3xl font-bold text-red-600">{issues.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Open</h3>
            <p className="text-3xl font-bold text-blue-600">
              {issues.filter(i => i.status === 'OPEN').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">In Progress</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {issues.filter(i => i.status === 'IN_PROGRESS').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h3 className="text-sm font-semibold text-gray-600 mb-1">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">
              {issues.filter(i => i.status === 'RESOLVED').length}
            </p>
          </div>
        </div>

        {/* Issues List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Issues</h2>
            <div className="flex gap-4 items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <button className="btn btn-primary">+ New Issue</button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading issues...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <button onClick={fetchIssues} className="btn btn-primary">Retry</button>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-2">No issues found</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'ALL' 
                  ? 'Try changing the status filter or create a new issue.'
                  : 'Create your first issue to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Issue #</th>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Priority</th>
                    <th className="p-3 text-left">Raised By</th>
                    <th className="p-3 text-left">Assigned To</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map(issue => (
                    <tr key={issue.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{issue.issueNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold">{issue.title}</div>
                        <div className="text-sm text-gray-600">{issue.description}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="p-3">{issue.raisedBy}</td>
                      <td className="p-3">{issue.assignedTo || '-'}</td>
                      <td className="p-3 text-sm">
                        <div className="font-mono text-xs">{issue.project.projectNumber}</div>
                        <div className="text-gray-600">{issue.project.name}</div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(issue.createdAt).toLocaleDateString()}
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
