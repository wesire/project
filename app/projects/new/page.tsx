'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import toast, { Toaster } from 'react-hot-toast'

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const project = await response.json()
      toast.success('Project created successfully!')
      
      // Navigate to the project details page
      setTimeout(() => {
        router.push(`/projects/${project.id}`)
      }, 500)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-blue-600 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">New Project</h1>
              <p className="text-blue-100 mt-1">Create a new construction project</p>
            </div>
            <Link href="/projects" className="btn bg-blue-700 hover:bg-blue-800 text-white">
              ← Back to Projects
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
                placeholder="e.g., PRJ001" 
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
                placeholder="e.g., City Centre Office Block" 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea 
                name="description"
                className="input min-h-[80px]" 
                placeholder="Project description (optional)"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Client</label>
              <input 
                type="text" 
                name="client"
                className="input" 
                placeholder="Client name" 
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                className="input" 
                placeholder="Project location (optional)" 
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
                  placeholder="0" 
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
                  defaultValue="GBP"
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
                  defaultValue="PLANNING"
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
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
              <Link href="/projects" className="btn btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
