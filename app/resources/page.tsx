'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface Resource {
  id: string
  name: string
  type: string
  description?: string
  costPerHour: number
  availability: string
  skills?: string[]
  standardRate?: number
  overtimeRate?: number
  currency?: string
  _count?: {
    allocations: number
  }
}

export default function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources')
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please log in.')
          }
          throw new Error('Failed to fetch resources')
        }
        
        const data = await response.json()
        // Handle both paginated and non-paginated responses
        const resourcesData = data.data || data
        setResources(Array.isArray(resourcesData) ? resourcesData : [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load resources'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResources()
  }, [])

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800'
      case 'PARTIALLY_AVAILABLE': return 'bg-yellow-100 text-yellow-800'
      case 'UNAVAILABLE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <header className="bg-purple-600 text-white py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">👥 Resources</h1>
                <p className="text-purple-100 mt-1">Allocation and utilization tracking</p>
              </div>
              <Link href="/" className="btn bg-purple-700 hover:bg-purple-800 text-white">
                ← Home
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="card bg-red-50 border-2 border-red-300">
            <h2 className="text-2xl font-bold mb-4 text-red-800">⚠️ Error</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-purple-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">👥 Resources</h1>
              <p className="text-purple-100 mt-1">Allocation and utilization tracking</p>
            </div>
            <Link href="/" className="btn bg-purple-700 hover:bg-purple-800 text-white">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Resources</h2>
          <button className="btn btn-primary">+ New Resource</button>
        </div>

        {/* Empty state */}
        {resources.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Resources Found</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first resource to the system.
            </p>
            <button className="btn btn-primary">+ Add First Resource</button>
          </div>
        ) : (
          /* Resource list */
          <div className="grid grid-cols-1 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{resource.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAvailabilityColor(resource.availability)}`}>
                        {resource.availability.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {resource.type}
                      {resource._count && resource._count.allocations > 0 && 
                        ` • ${resource._count.allocations} allocation${resource._count.allocations !== 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Cost per Hour</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(resource.costPerHour, resource.currency)}
                    </p>
                  </div>
                </div>

                {resource.description && (
                  <div className="mb-4">
                    <p className="text-gray-600">{resource.description}</p>
                  </div>
                )}

                {resource.skills && resource.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {resource.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 text-sm text-gray-600">
                  {resource.standardRate && (
                    <div>
                      <span className="font-semibold">Standard:</span> {formatCurrency(resource.standardRate, resource.currency)}
                    </div>
                  )}
                  {resource.overtimeRate && (
                    <div>
                      <span className="font-semibold">Overtime:</span> {formatCurrency(resource.overtimeRate, resource.currency)}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200">
                    View Details
                  </button>
                  <button className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
