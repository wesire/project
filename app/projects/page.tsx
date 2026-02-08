'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }
    
    setIsAuthenticated(true)
    setLoading(false)
  }, [])

  const handleLogin = () => {
    router.push('/login?returnUrl=/projects')
  }

  const projects = [
    {
      id: '1',
      projectNumber: 'PRJ001',
      name: 'City Centre Office Block',
      status: 'ACTIVE',
      budget: 5000000,
      actualCost: 4200000,
      startDate: '2024-01-15',
      endDate: '2025-06-30',
      client: 'ABC Corporation',
    },
    {
      id: '2',
      projectNumber: 'PRJ002',
      name: 'Riverside Residential Complex',
      status: 'ACTIVE',
      budget: 8500000,
      actualCost: 3200000,
      startDate: '2024-03-01',
      endDate: '2026-02-28',
      client: 'Urban Developments Ltd',
    },
    {
      id: '3',
      projectNumber: 'PRJ003',
      name: 'Industrial Warehouse',
      status: 'PLANNING',
      budget: 2000000,
      actualCost: 150000,
      startDate: '2024-09-01',
      endDate: '2025-03-31',
      client: 'Logistics Solutions PLC',
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
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PLANNING': return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
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
            <div className="text-blue-600 text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the project register.
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
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Project Register</h1>
              <p className="text-blue-100 mt-1">Manage your construction project portfolio</p>
            </div>
            <Link href="/" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Projects</h2>
          <Link href="/projects/new" className="btn btn-primary">+ New Project</Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.map(project => (
            <div key={project.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{project.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {project.projectNumber} • {project.client}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold">{formatCurrency(project.budget)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actual Cost</p>
                  <p className="font-semibold">{formatCurrency(project.actualCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">
                    {new Date(project.startDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">
                    {new Date(project.endDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/projects/${project.id}`} className="btn btn-primary text-sm">View Details</Link>
                <Link href={`/projects/${project.id}/edit`} className="btn btn-secondary text-sm">Edit</Link>
                <Link href={`/projects/${project.id}/risks`} className="text-blue-600 hover:text-blue-800 px-3">Risks</Link>
                <Link href={`/projects/${project.id}/tasks`} className="text-blue-600 hover:text-blue-800 px-3">Tasks</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
