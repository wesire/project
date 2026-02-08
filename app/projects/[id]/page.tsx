'use client'

import Link from 'next/link'
import { use, useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface Project {
  id: string
  projectNumber: string
  name: string
  description?: string
  status: string
  budget: number
  currency: string
  startDate: string
  endDate: string
  client?: string
  location?: string
  _count?: {
    risks: number
    tasks: number
    changes: number
    issues: number
  }
  members?: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch project')
        }
        
        const data = await response.json()
        setProject(data)
      } catch (error) {
        console.error('Error fetching project:', error)
        toast.error('Failed to load project data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The requested project could not be found.</p>
          <Link href="/projects" className="btn btn-primary">
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: project.currency || 'GBP',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Project Details</h1>
              <p className="text-blue-100 mt-1">{project.projectNumber} • {project.name}</p>
            </div>
            <Link href="/projects" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Back to Projects
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Project Number</p>
                  <p className="font-semibold">{project.projectNumber}</p>
                </div>
                {project.client && (
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold">{project.client}</p>
                  </div>
                )}
                {project.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{project.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">{project.status}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-semibold text-2xl">{formatCurrency(project.budget)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold">
                    {new Date(project.startDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-semibold">
                    {new Date(project.endDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href={`/projects/${id}/edit`} className="btn btn-primary w-full">
                  Edit Project
                </Link>
                <Link href={`/projects/${id}/risks`} className="btn btn-secondary w-full">
                  View Risks
                </Link>
                <Link href={`/projects/${id}/tasks`} className="btn btn-secondary w-full">
                  View Tasks
                </Link>
                <Link href={`/changes?projectId=${id}`} className="btn btn-secondary w-full">
                  View Changes
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Risks</span>
                  <span className="font-semibold">{project._count?.risks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks</span>
                  <span className="font-semibold">{project._count?.tasks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Changes</span>
                  <span className="font-semibold">{project._count?.changes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-semibold">{project.members?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
