'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        router.push('/projects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      const projectData = {
        projectNumber: formData.get('projectNumber') as string,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        client: formData.get('client') as string,
        location: formData.get('location') as string,
        budget: parseFloat(formData.get('budget') as string),
        currency: formData.get('currency') as string,
        status: formData.get('status') as string,
        startDate: new Date(formData.get('startDate') as string).toISOString(),
        endDate: new Date(formData.get('endDate') as string).toISOString(),
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update project')
      }

      toast.success('Project updated successfully!')
      
      // Navigate back to project details
      setTimeout(() => {
        router.push(`/projects/${id}`)
      }, 500)
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update project')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <Toaster position="top-right" />
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

  // Convert date strings to YYYY-MM-DD format for input
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit Project</h1>
              <p className="text-blue-100 mt-1">{project.projectNumber} • {project.name}</p>
            </div>
            <Link href={`/projects/${id}`} className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Back to Details
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Project Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Number</label>
              <input 
                type="text" 
                name="projectNumber"
                className="input" 
                defaultValue={project.projectNumber} 
                required 
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Project Name</label>
              <input 
                type="text" 
                name="name"
                className="input" 
                defaultValue={project.name} 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea 
                name="description"
                className="input min-h-[80px]" 
                defaultValue={project.description || ''}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input 
                type="text" 
                name="client"
                className="input" 
                defaultValue={project.client || ''} 
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                className="input" 
                defaultValue={project.location || ''} 
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget</label>
                <input 
                  type="number" 
                  name="budget"
                  className="input" 
                  defaultValue={project.budget} 
                  step="0.01"
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select 
                  name="currency"
                  className="input" 
                  defaultValue={project.currency}
                  disabled={isSubmitting}
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select 
                  name="status"
                  className="input" 
                  defaultValue={project.status} 
                  disabled={isSubmitting}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input 
                  type="date" 
                  name="startDate"
                  className="input" 
                  defaultValue={formatDateForInput(project.startDate)} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input 
                  type="date" 
                  name="endDate"
                  className="input" 
                  defaultValue={formatDateForInput(project.endDate)} 
                  required 
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              <Link href={`/projects/${id}`} className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
